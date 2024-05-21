import AccionesBase from "@lib/AccionesBase";
import {
  ActionRowBuilder,
  CommandInteraction,
  GuildMember,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export default class MensajeIncrustado extends AccionesBase {
  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    if (!this.esAdmin(interaccion.member as GuildMember)) {
      if (interaccion.isRepliable()) {
        await interaccion.reply({
          content: "No tienes permisos para ejecutar esta interacción",
          ephemeral: true,
        });
      }

      return;
    }

    if (interaccion.isCommand()) {
      //
      await this.mostrarModalRecolector(interaccion);
      //
    } else if (interaccion.isModalSubmit()) {
      //
      await this.crearMensajeIncrustado(interaccion);
      //
    }
  }

  private static async mostrarModalRecolector(
    interaccion: CommandInteraction,
  ): Promise<void> {
    if (interaccion.commandName !== "mensaje-incrustado") return;

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setLabel("Titulo")
        .setStyle(TextInputStyle.Short)
        .setCustomId("titulo")
        .setRequired(true),
      new TextInputBuilder()
        .setLabel("Descripción")
        .setStyle(TextInputStyle.Paragraph)
        .setCustomId("descripcion")
        .setRequired(true),
      new TextInputBuilder()
        .setLabel("Imágen")
        .setStyle(TextInputStyle.Short)
        .setCustomId("imagen")
        .setRequired(false),
      new TextInputBuilder()
        .setLabel("Miniatura")
        .setStyle(TextInputStyle.Short)
        .setCustomId("miniatura")
        .setRequired(false),
    ];

    const modal = new ModalBuilder()
      .setCustomId("modal-mensaje-incrustado")
      .setTitle("Crear mensaje incrustado")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async crearMensajeIncrustado(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-mensaje-incrustado") return;

    const { fields: campos, channel: canal, user: usuario } = interaccion;

    const datos: DatosMensajeIncrustado = {
      titulo: campos.getTextInputValue("titulo"),
      descripcion: campos.getTextInputValue("descripcion"),
      imagen: campos.getTextInputValue("imagen") || undefined,
      miniatura: campos.getTextInputValue("miniatura") || undefined,
    };

    const embed = (await this.crearEmbedEstilizado())
      .setAuthor({
        name: usuario.username,
        iconURL: usuario.avatarURL(),
      })
      .setTitle(datos.titulo)
      .setDescription(datos.descripcion);

    if (datos.imagen) {
      try {
        embed.setImage(datos.imagen);
      } catch (error) {
        this.log.error(
          `Error al colocar la imágen a un mensaje incrustado: ${error}`,
        );
      }
    }
    if (datos.miniatura) {
      try {
        embed.setImage(datos.miniatura);
      } catch (error) {
        this.log.error(
          `Error al colocar la miniatura a un mensaje incrustado: ${error}`,
        );
      }
    }

    await canal.send({
      embeds: [embed],
    });

    await interaccion.reply({
      content: "Mensaje incrustado creado correctamente",
      ephemeral: true,
    });
  }
}

interface DatosMensajeIncrustado {
  titulo: string;
  descripcion: string;
  imagen?: string;
  miniatura?: string;
}
