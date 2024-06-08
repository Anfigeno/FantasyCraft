import AccionesBase from "@lib/AccionesBase";
import Resultado from "@lib/Resultado";
import Util from "@lib/Util";
import {
  ActionRowBuilder,
  EmbedBuilder,
  Interaction,
  StringSelectMenuOptionBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  CommandInteraction,
  StringSelectMenuInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  GuildTextBasedChannel,
  Guild,
  User,
  ChannelType,
  PermissionFlagsBits,
  ModalSubmitFields,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  GuildMember,
} from "discord.js";

interface DatosOpcionTicket {
  emoji: string;
  nombre: string;
  opcionDeLista: StringSelectMenuOptionBuilder;
  camposModal: TextInputBuilder[];
}

interface DatosParrafoDeResumen {
  titulo: string;
  valor: string;
}

class PanelDeTickets {
  public opciones: DatosOpcionTicket[] = [];

  public static opcion(panel: PanelDeTickets) {
    return function (Objetivo: DatosOpcionTicket | any) {
      const instancia = new Objetivo();
      instancia.opcionDeLista
        .setLabel(capitalizar(instancia.nombre))
        .setValue(instancia.nombre)
        .setEmoji(instancia.emoji);
      panel.opciones.push(instancia);
    };
  }

  private async crearEmbedResumen(): Promise<EmbedBuilder> {
    const embed = (await AccionesBase.crearEmbedEstilizado()).setTitle(
      "Tickets | FantasyCraft",
    ).setDescription(`
Bienvenido al soporte de FantasyCraft.
Selecciona la categoría que más se adecúe con tu necesidad y crearemos un ticket por ti.

> De esta forma podrás ponerte en contacto con uno de nuestos miembros del equipo y así tratar de ayudarte a solucionar tu problema
`);

    return embed;
  }

  private async crearListaDeOpciones(): Promise<
    ActionRowBuilder<StringSelectMenuBuilder>
  > {
    const listaDeOpciones = new StringSelectMenuBuilder()
      .setCustomId("panel-de-tickets-opciones")
      .setOptions(this.opciones.map((opcion) => opcion.opcionDeLista));

    return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      listaDeOpciones,
    );
  }

  private async crearPanelDeTickets(
    interaccion: CommandInteraction,
  ): Promise<void> {
    if (interaccion.commandName !== "panel-de-tickets") return;

    const emebedResumen = await this.crearEmbedResumen();
    const listaDeOpciones = await this.crearListaDeOpciones();

    await interaccion.reply({
      embeds: [emebedResumen],
      components: [listaDeOpciones],
    });
  }

  private async crearModalRecolector(
    opcion: DatosOpcionTicket,
  ): Promise<ModalBuilder> {
    const modal = new ModalBuilder()
      .setCustomId(opcion.nombre)
      .setTitle(capitalizar(opcion.nombre))
      .setComponents(
        opcion.camposModal.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().addComponents(campo),
        ),
      );

    return modal;
  }

  private async mostrarModalRecolector(
    interaccion: StringSelectMenuInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "panel-de-tickets-opciones") return;

    const nombreOpcion = interaccion.values[0];

    const opcion = this.opciones.find(
      (opcion) => opcion.nombre === nombreOpcion,
    );

    if (!opcion) return;

    await interaccion.showModal(await this.crearModalRecolector(opcion));
  }

  private async crearCanalDeTicket(
    servidor: Guild,
    usuario: User,
    opcion: DatosOpcionTicket,
  ): Promise<GuildTextBasedChannel> {
    const { tickets, rolesDeAdministracion } = AccionesBase.api;

    await tickets.obtener();
    await rolesDeAdministracion.obtener();

    const canal = await servidor.channels.create({
      name: `${opcion.emoji}・${usuario.username}`,
      type: ChannelType.GuildText,
      parent: tickets.idCategoria,
      permissionOverwrites: [
        {
          id: servidor.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: rolesDeAdministracion.idStaff,
          allow: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: rolesDeAdministracion.idAdministrador,
          allow: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: usuario.id,
          allow: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });

    return canal;
  }

  private async crearEmbedResumenDeTicket(
    campos: ModalSubmitFields,
    usuario: User,
  ): Promise<EmbedBuilder> {
    const parrafosDeResumen: DatosParrafoDeResumen[] = campos.fields.map(
      (campo) => {
        return {
          titulo: `**${capitalizar(campo.customId.split("-").join(" "))}**`,
          valor: campo.value
            .split("\n")
            .map((linea) => `> ${linea}`)
            .join("\n"),
        };
      },
    );

    const embedResumen = (await AccionesBase.crearEmbedEstilizado())
      .setAuthor({
        name: usuario.username,
        iconURL: usuario.displayAvatarURL(),
      })
      .setTitle("Ticket | FantasyCraft")
      .setDescription(
        parrafosDeResumen
          .map((parrafo) => parrafo.titulo + "\n" + parrafo.valor)
          .join("\n\n"),
      );

    return embedResumen;
  }

  private crearControlesDeTicketAbierto(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Cerrar ticket")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("cerrar-ticket"),
      new ButtonBuilder()
        .setLabel("Eliminar ticket")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("eliminar-ticket"),
    );
  }

  private crearControlesDeTicketCerrado(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Abrir ticket")
        .setStyle(ButtonStyle.Primary)
        .setCustomId("abrir-ticket"),
      new ButtonBuilder()
        .setLabel("Eliminar ticket")
        .setStyle(ButtonStyle.Danger)
        .setCustomId("eliminar-ticket"),
    );
  }

  private async crearTicket(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    const opcion = this.opciones.find(
      (opcion) => opcion.nombre === interaccion.customId,
    );

    const { fields: campos, guild: servidor, user: usuario } = interaccion;

    const [canalDeTicket, error] = await Resultado.asincrono(() =>
      this.crearCanalDeTicket(servidor, usuario, opcion),
    );
    if (error !== null) {
      Util.log.error(error);
      await AccionesBase.responderFalloDeInteraccion(interaccion);
      return;
    }

    const embedResumen = await this.crearEmbedResumenDeTicket(campos, usuario);

    const { rolesDeAdministracion } = AccionesBase.api;
    const [_, error1] = await Resultado.asincrono(() =>
      rolesDeAdministracion.obtener(),
    );

    const menciones = `${usuario} - <@&${rolesDeAdministracion.idAdministrador}> <@&${rolesDeAdministracion.idStaff}>`;

    const controles = this.crearControlesDeTicketAbierto();

    const [_1, error2] = await Resultado.asincrono(() =>
      canalDeTicket.send({
        content: menciones,
        embeds: [embedResumen],
        components: [controles],
      }),
    );
    if (error2 !== null) {
      Util.log.error(error1);
      await canalDeTicket.delete();
      await AccionesBase.responderFalloDeInteraccion(interaccion);
      return;
    }

    await interaccion.reply({
      content: `Ticket creado en el canal ${canalDeTicket}`,
      ephemeral: true,
    });
  }

  private canalEstaAbierto(canal: GuildTextBasedChannel): boolean {
    return canal
      .permissionsFor(canal.guild.roles.everyone)
      .has(PermissionFlagsBits.SendMessages);
  }

  private async abrirOCerrarCanalDeTicket(
    canal: GuildTextBasedChannel,
    abrirOCerrar: boolean,
  ): Promise<void> {
    await canal.permissionOverwrites.edit(canal.guild.roles.everyone, {
      SendMessages: abrirOCerrar,
    });
  }

  private async cerrarTicket(interaccion: ButtonInteraction): Promise<void> {
    if (interaccion.customId !== "cerrar-ticket") return;

    const { channel: canal, message: mensaje } = interaccion;

    if (!this.canalEstaAbierto(canal)) {
      await interaccion.reply({
        content: "El ticket ya está cerrado",
        ephemeral: true,
      });
      return;
    }

    const [_1, error1] = await Resultado.asincrono(() =>
      this.abrirOCerrarCanalDeTicket(canal, false),
    );
    if (error1 !== null) {
      Util.log.error(error1);
      await AccionesBase.responderFalloDeInteraccion(interaccion);
      return;
    }

    await mensaje.edit({
      components: [this.crearControlesDeTicketCerrado()],
    });

    await interaccion.reply({
      content: "El ticket ha sido cerrado",
      ephemeral: true,
    });
  }

  private async abrirTicket(interaccion: ButtonInteraction): Promise<void> {
    if (interaccion.customId !== "abrir-ticket") return;

    const { channel: canal, message: mensaje } = interaccion;
    const miembro = interaccion.member as GuildMember;

    const { rolesDeAdministracion } = AccionesBase.api;
    const [_, error] = await Resultado.asincrono(() =>
      rolesDeAdministracion.obtener(),
    );
    if (error !== null) {
      Util.log.error(error);
      await AccionesBase.responderFalloDeInteraccion(interaccion);
      return;
    }

    if (!(await AccionesBase.miembroEsStaff(miembro))) {
      await interaccion.reply({
        content: "No tienes permisos para ejecutar esta interacción",
        ephemeral: true,
      });
      return;
    }

    if (this.canalEstaAbierto(canal)) {
      await interaccion.reply({
        content: "El ticket ya está abierto",
        ephemeral: true,
      });
      return;
    }

    const [_1, error1] = await Resultado.asincrono(() =>
      this.abrirOCerrarCanalDeTicket(canal, true),
    );
    if (error1 !== null) {
      Util.log.error(error1);
      await AccionesBase.responderFalloDeInteraccion(interaccion);
      return;
    }

    await mensaje.edit({
      components: [this.crearControlesDeTicketAbierto()],
    });

    await interaccion.reply({
      content: "El ticket ha sido abierto",
      ephemeral: true,
    });
  }

  private async eliminarTicket(interaccion: ButtonInteraction): Promise<void> {
    if (interaccion.customId !== "eliminar-ticket") return;

    const canal = interaccion.channel;
    const miembro = interaccion.member as GuildMember;

    if (!AccionesBase.miembroEsStaff(miembro)) {
      await interaccion.reply({
        content: "No tienes permisos para ejecutar esta interacción",
        ephemeral: true,
      });
      return;
    }

    const [_, error] = await Resultado.asincrono(() => canal.delete());
    if (error !== null) {
      Util.log.error(error);
      await AccionesBase.responderFalloDeInteraccion(interaccion);
      return;
    }
  }

  public async manejarInteraccion(interaccion: Interaction): Promise<void> {
    if (interaccion.isCommand()) {
      await this.crearPanelDeTickets(interaccion);
    } else if (interaccion.isStringSelectMenu()) {
      await this.mostrarModalRecolector(interaccion);
    } else if (interaccion.isModalSubmit()) {
      await this.crearTicket(interaccion);
    } else if (interaccion.isButton()) {
      await this.cerrarTicket(interaccion);
      await this.abrirTicket(interaccion);
      await this.eliminarTicket(interaccion);
    }
  }
}

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const panelDeTickets = new PanelDeTickets();

@PanelDeTickets.opcion(panelDeTickets)
class OpcionDudas implements DatosOpcionTicket {
  public nombre = "dudas";
  public emoji = "🤔";

  public opcionDeLista = new StringSelectMenuOptionBuilder();

  public camposModal: TextInputBuilder[] = [
    new TextInputBuilder()
      .setLabel("¿Cuál es tu duda?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setCustomId("cual-es-tu-duda"),
  ];
}

@PanelDeTickets.opcion(panelDeTickets)
class OpcionBugs implements DatosOpcionTicket {
  public nombre = "bugs";
  public emoji = "🐛";

  public opcionDeLista = new StringSelectMenuOptionBuilder();

  public camposModal: TextInputBuilder[] = [
    new TextInputBuilder()
      .setLabel("¿Cuál el fue el bug que viste?")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setCustomId("bug"),
    new TextInputBuilder()
      .setLabel("¿En que modalidad ocurrió?")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setCustomId("modalidad"),
    new TextInputBuilder()
      .setLabel("Describe el bug")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setCustomId("descripcion"),
  ];
}

@PanelDeTickets.opcion(panelDeTickets)
class OpcionApelacion implements DatosOpcionTicket {
  public nombre = "apelacion";
  public emoji = "🙏";

  public opcionDeLista = new StringSelectMenuOptionBuilder();

  public camposModal: TextInputBuilder[] = [
    new TextInputBuilder()
      .setLabel("¿Cuál fue el problema que te ha pasado?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setCustomId("descripcion-del-problema"),
    new TextInputBuilder()
      .setLabel("¿Por que deberíamos perdonarte?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setCustomId("por-que-deberiamos-perdonarte"),
    new TextInputBuilder()
      .setLabel("¿Quién fue el moderador que te sancionó?")
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setCustomId("moderador-que-te-sancionó"),
  ];
}

@PanelDeTickets.opcion(panelDeTickets)
class OpcionDonacion implements DatosOpcionTicket {
  public nombre = "donacion";
  public emoji = "💸";

  public opcionDeLista = new StringSelectMenuOptionBuilder();

  public camposModal: TextInputBuilder[] = [
    new TextInputBuilder()
      .setLabel("¿Cuál es el monto que deseas donar?")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setCustomId("monto-de-la-donacion"),
    new TextInputBuilder()
      .setLabel("¿Cuál es la razón de la donación?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setCustomId("razon-de-la-donacion"),
  ];
}

@PanelDeTickets.opcion(panelDeTickets)
class OpcionOtros implements DatosOpcionTicket {
  public nombre = "otros";
  public emoji = "📝";

  public opcionDeLista = new StringSelectMenuOptionBuilder();

  public camposModal: TextInputBuilder[] = [
    new TextInputBuilder()
      .setLabel("¿Cuál es tu problema?")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setCustomId("descripcion"),
  ];
}

export default panelDeTickets;
