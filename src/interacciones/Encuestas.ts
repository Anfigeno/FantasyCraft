import AccionesBase from "@lib/AccionesBase";
import Resultado from "@lib/Resultado";
import {
  ActionRowBuilder,
  CommandInteraction,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export default class Encuestas extends AccionesBase {
  public static async manejarInteraccion(interaccion: Interaction) {
    if (!this.esAdmin(interaccion.member as GuildMember)) {
      if (interaccion.isRepliable()) {
        interaccion.reply({
          content: "No tienes permisos para ejecutar esta interacción",
          ephemeral: true,
        });

        return;
      }
    }

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

    const canalDeEncuestas = await this.obtenerCanalDeEncuestas(servidor);

    if (canalDeEncuestas.error !== null) {
      this.log.error(canalDeEncuestas.error);

      await interaccion.reply({
        content: "Error al crear la encuesta",
        ephemeral: true,
      });
      return;
    }

    const mensajeDeEncuesta = await canalDeEncuestas.datos.send({
      embeds: [embed],
    });

    datos.reacciones.forEach(async (reaccion) => {
      await mensajeDeEncuesta.react(reaccion);
    });

    await interaccion.reply({
      content: `Encuesta creada en ${canalDeEncuestas.datos}!`,
      ephemeral: true,
    });
  }

  private static async obtenerCanalDeEncuestas(
    servidor: Guild,
  ): Promise<Resultado<GuildTextBasedChannel>> {
    const { canalesImportantes } = this.api;
    await canalesImportantes.obtener();

    const canalDeEncuestas = await this.obtenerCanal(
      canalesImportantes.idVotaciones,
      servidor,
    );

    return canalDeEncuestas;
  }

  private static validarReacciones(reacciones: string[]): void {
    const regex = /\p{Extended_Pictographic}/gu;
    reacciones.forEach((reaccion) => {
      if (!reaccion.match(regex)) {
        throw new Error();
      }
    });
  }
}

interface DatosEncuesta {
  titulo: string;
  descripcion: string;
  reacciones: string[];
}
