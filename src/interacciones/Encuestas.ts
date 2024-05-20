import AccionesBase from "@lib/AccionesBase";
import {
  ActionRowBuilder,
  CommandInteraction,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  parseEmoji,
} from "discord.js";

export default class Encuestas extends AccionesBase {
  public static async manejarInteraccion(interaccion: Interaction) {
    if (interaccion.isCommand()) {
      await this.mostrarModalRecolector(interaccion);
    } else if (interaccion.isModalSubmit()) {
      await this.crearEncuesta(interaccion);
    }
  }

  private static async mostrarModalRecolector(
    interaccion: CommandInteraction,
  ): Promise<void> {
    if (interaccion.commandName !== "encuestas") return;

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setLabel("Titulo de la encuesta")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setCustomId("titulo"),
      new TextInputBuilder()
        .setLabel("Descripción de la encuesta")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setCustomId("descripcion"),
      new TextInputBuilder()
        .setLabel("Reacciones")
        .setPlaceholder("SEPARA LAS REACCIONES CON UN ESPACIO!!!")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setCustomId("reacciones")
        .setMinLength(3)
        .setMaxLength(30),
    ];

    const modal = new ModalBuilder()
      .setCustomId("modal-crear-encuesta")
      .setTitle("🗳 Crear encuesta")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().setComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async crearEncuesta(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "modal-crear-encuesta") return;

    const { fields: campos, guild: servidor } = interaccion;

    const datos: DatosEncuesta = {
      titulo: campos.getTextInputValue("titulo"),
      descripcion: campos.getTextInputValue("descripcion"),
      reacciones: campos.getTextInputValue("reacciones").split(" "),
    };

    try {
      this.validarReacciones(datos.reacciones);
    } catch (error) {
      await interaccion.reply({
        content: "Las reacciones no son validas!",
        ephemeral: true,
      });
      return;
    }

    const embed = await this.crearEmbedEstilizado();
    embed.setTitle(datos.titulo).setDescription(datos.descripcion);

    const { canalesImportantes } = this.api;
    await canalesImportantes.obtener();

    try {
      const canalDeEncuestas = await this.obtenerCanal(
        canalesImportantes.idVotaciones,
        servidor,
      );

      if (canalDeEncuestas.isTextBased()) {
        const encuesta = await canalDeEncuestas.send({
          embeds: [embed],
        });

        datos.reacciones.forEach(async (reaccion) => {
          await encuesta.react(reaccion);
        });

        await interaccion.reply({
          content: `Encuesta creada en ${canalDeEncuestas}!`,
          ephemeral: true,
        });
      } else {
        await interaccion.reply({
          content: "El canal de votaciones establecido no es un canal de texto",
          ephemeral: true,
        });
      }
    } catch (error) {
      this.log.error(`Error al crear una encuesta: ${error}`);

      await interaccion.reply({
        content: "Error al ejecutar esta interacción",
        ephemeral: true,
      });
    }
  }

  private static validarReacciones(reacciones: string[]): void {
    reacciones.forEach((reaccion) => {
      try {
        parseEmoji(reaccion);
      } catch (error) {
        throw error;
      }
    });
  }
}

interface DatosEncuesta {
  titulo: string;
  descripcion: string;
  reacciones: string[];
}
