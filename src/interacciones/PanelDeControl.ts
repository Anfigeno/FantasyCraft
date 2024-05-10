import {
  APIEmbedField,
  ActionRowBuilder,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  StringSelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import AccionesBase from "@lib/AccionesBase";
import { DatosEmbeds, DatosTickets } from "@lib/Fantasy";

export default class PanelDeControl extends AccionesBase {
  private static async crearEmbedRestumen(): Promise<EmbedBuilder> {
    const {
      tickets,
      mensajesDelSistema,
      canalesImportantes,
      comandosPersonalizados,
      embeds,
      rolesDeAdministracion,
    } = this.api;

    try {
      await tickets.obtener();
      await mensajesDelSistema.obtener();
      await canalesImportantes.obtener();
      await comandosPersonalizados.obtener();
      await embeds.obtener();
      await rolesDeAdministracion.obtener();
    } catch (error) {
      throw error;
    }

    const campos: APIEmbedField[] = [
      {
        name: "🎟️ Tickets",
        value: `> ID de la categoría: ${tickets.idCategoria ?? "No definido"}`,
      },
      {
        name: "💬 Mensajes del sistema",
        value:
          // prettier-ignore
          mensajesDelSistema.bienvenida
            ? `> Bienvenida: ${mensajesDelSistema.bienvenida}`
            : "> No definido",
      },
      {
        name: "‼️ Canales importantes",
        value:
          (canalesImportantes.idGeneral
            ? `> General: <#${canalesImportantes.idGeneral}>`
            : "> General: No definido") +
          "\n" +
          (canalesImportantes.idVotaciones
            ? `> Votaciones: <#${canalesImportantes.idVotaciones}>`
            : "> Votaciones: No definido") +
          "\n" +
          (canalesImportantes.idSugerencias
            ? `> Sugerencias: <#${canalesImportantes.idSugerencias}>`
            : "> Sugerencias: No definido"),
      },
      {
        name: "🤖 Comandos personalizados",
        value:
          // prettier-ignore
          comandosPersonalizados.lista.length > 0
            ? comandosPersonalizados.lista
                .map((comando) => 
                  `> Palabra clave: ${comando.palabraClave}, Contenido: ${comando.contenido}, Autor: ${comando.autor}`
                )
                .join("\n")
            : "> Ninguno",
      },
      {
        name: "📝 Embeds",
        value:
          (embeds.color ? `> Color: ${embeds.color}` : "> Color: No definido") +
          "\n" +
          (embeds.urlImagenLimitadora
            ? `> Imágen limitadora: ${embeds.urlImagenLimitadora}`
            : "> Imágen limitadora: No definida"),
      },
      {
        name: "👮 Roles de administración",
        value:
          (rolesDeAdministracion.idAdministrador
            ? `> Administrador: ${rolesDeAdministracion.idAdministrador}`
            : "> Administrador: No definido") +
          "\n" +
          (rolesDeAdministracion.idStaff
            ? `> Staff: ${rolesDeAdministracion.idStaff}`
            : "> Staff: No definido"),
      },
    ];

    const embed = await this.crearEmbedEstilizado();
    embed.setTitle("💻 Panel de control").setFields(campos);

    return embed;
  }

  private static async crearPanelDeControl(
    interaccion: CommandInteraction,
  ): Promise<void> {
    if (interaccion.commandName !== "panel-de-control") return;

    const opciones: StringSelectMenuOptionBuilder[] = [
      OpcionEmbeds.opcion,
      OpcionTickets.opcion,
    ];

    const listaDeOpciones =
      new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
        new StringSelectMenuBuilder()
          .setCustomId("panel-de-control-opciones")
          .setOptions(opciones),
      );

    interaccion.reply({
      embeds: [await this.crearEmbedRestumen()],
      components: [listaDeOpciones],
    });
  }

  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    const { member: miembro } = interaccion;

    if (!this.esAdmin(miembro as GuildMember)) {
      if (interaccion.isRepliable()) {
        interaccion.reply({
          content: "No tienes permisos para ejecutar esta interacción",
          ephemeral: true,
        });
        return;
      }
      return;
    }

    if (interaccion.isCommand()) {
      this.crearPanelDeControl(interaccion);
    } else if (interaccion.isStringSelectMenu()) {
      //
      OpcionEmbeds.mostrarModalRecolector(interaccion);
      OpcionTickets.mostrarModalRecolector(interaccion);
      //
    } else if (interaccion.isModalSubmit()) {
      //
      OpcionEmbeds.actualizarInformacion(interaccion);
      OpcionTickets.actualizarInformacion(interaccion);

      interaccion.message.edit({
        embeds: [await this.crearEmbedRestumen()],
      });

      const mensajeDeConfirmacion = await interaccion.reply({
        content: "Actualización exitosa",
      });

      await mensajeDeConfirmacion.delete();
    }
  }
}

class OpcionTickets extends AccionesBase {
  public static opcion = new StringSelectMenuOptionBuilder()
    .setEmoji("🎟️")
    .setLabel("Actualizar tickets")
    .setValue("tickets");

  public static async mostrarModalRecolector(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-control-opciones") return;
    if (interaccion.values[0] !== "tickets") return;

    const { tickets } = this.api;
    await tickets.obtener();

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setValue(`${tickets.idCategoria}`)
        .setLabel("ID de la categoria")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(20)
        .setCustomId("id-categoria"),
    ];

    const modal = new ModalBuilder()
      .setCustomId("modal-actualizar-tickets")
      .setTitle("🎟️ Actualizar tickets")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  public static async actualizarInformacion(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-actualizar-tickets") return;

    const { fields: campos } = interaccion;

    const nuevosDatos: DatosTickets = {
      idCategoria: campos.getTextInputValue("id-categoria"),
    };

    try {
      await this.api.tickets.actualizar(nuevosDatos);
    } catch (error) {
      this.log.error(error);
    }
  }
}

class OpcionEmbeds extends AccionesBase {
  public static opcion = new StringSelectMenuOptionBuilder()
    .setEmoji("📝")
    .setLabel("Embeds")
    .setValue("embeds");

  public static async mostrarModalRecolector(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-control-opciones") return;
    if (interaccion.values[0] !== "embeds") return;

    const { embeds } = this.api;
    await embeds.obtener();

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setValue(`${embeds.color}`)
        .setLabel("Color")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(7)
        .setCustomId("color"),

      new TextInputBuilder()
        .setValue(`${embeds.urlImagenLimitadora}`)
        .setLabel("URL imagen limitadora")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(500)
        .setCustomId("url-imagen-limitadora"),
    ];

    const modal = new ModalBuilder()
      .setCustomId("modal-actualizar-embeds")
      .setTitle("📝 Actualizar embeds")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  public static async actualizarInformacion(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-actualizar-embeds") return;

    const { fields: campos } = interaccion;

    const nuevosDatos: DatosEmbeds = {
      color: campos.getTextInputValue("color"),
      urlImagenLimitadora: campos.getTextInputValue("url-imagen-limitadora"),
    };

    const { embeds } = this.api;

    try {
      await embeds.actualizar(nuevosDatos);
    } catch (error) {
      this.log.error(error);
      return;
    }
  }
}
