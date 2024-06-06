import AccionesBase from "@lib/AccionesBase";
import Resultado from "@lib/Resultado";
import {
  ActionRowBuilder,
  CommandInteraction,
  Guild,
  GuildTextBasedChannel,
  Interaction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export default class Sugerencias extends AccionesBase {
  public static async manejarInteraccion(
    interaccion: Interaction,
  ): Promise<void> {
    if (interaccion.isCommand()) {
      if (interaccion.commandName === "sugerencias") {
        await this.mostrarModalRecolector(interaccion);
      }
    } else if (interaccion.isModalSubmit()) {
      await this.crearSugerencia(interaccion);
    }
  }

  private static async mostrarModalRecolector(
    interaccion: CommandInteraction,
  ): Promise<void> {
    if (interaccion.commandName !== "sugerencias") return;

    const campos: TextInputBuilder[] = [
      new TextInputBuilder()
        .setCustomId("titulo")
        .setLabel("Título")
        .setRequired(true)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(50),
      new TextInputBuilder()
        .setCustomId("descripcion")
        .setLabel("Descripción")
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(4000),
      new TextInputBuilder()
        .setCustomId("url-imagen")
        .setLabel("Imagen")
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(2048),
    ];

    const modal = new ModalBuilder()
      .setCustomId("sugerencias")
      .setTitle("Crear sugerencia")
      .setComponents(
        campos.map((campo) =>
          new ActionRowBuilder<TextInputBuilder>().addComponents(campo),
        ),
      );

    await interaccion.showModal(modal);
  }

  private static async crearSugerencia(
    interaccion: ModalSubmitInteraction,
  ): Promise<void> {
    if (interaccion.customId !== "sugerencias") return;

    const { fields: campos, guild: servidor, user: usuario } = interaccion;

    const datos = {
      titulo: campos.getTextInputValue("titulo"),
      descripcion: campos.getTextInputValue("descripcion"),
      urlImagen: campos.getTextInputValue("url-imagen"),
    };

    const embed = await this.crearEmbedEstilizado();
    embed.setTitle(datos.titulo);
    embed.setDescription(datos.descripcion);
    embed.setAuthor({
      name: usuario.username,
      iconURL: usuario.avatarURL(),
    });

    try {
      embed.setImage(datos.urlImagen);
    } catch (error) {
      this.log.error(`Error al establar la imagen de un embed`);
    }

    const canalDeSugerencias = await this.obtenerCanalDeSugerencias(servidor);

    if (canalDeSugerencias.error !== null) {
      await interaccion.reply({
        content: "Error al crear la sugerencia",
        ephemeral: true,
      });
      return;
    }

    const mensajeDeSugerencia = await canalDeSugerencias.datos.send({
      embeds: [embed],
    });

    await interaccion.reply({
      content: "Sugerencia creada",
      ephemeral: true,
    });

    await mensajeDeSugerencia.react("✅");
    await mensajeDeSugerencia.react("❌");
  }

  private static async obtenerCanalDeSugerencias(
    servidor: Guild,
  ): Promise<Resultado<GuildTextBasedChannel>> {
    const { canalesImportantes } = this.api;
    await canalesImportantes.obtener();

    const canalDeSugerencias = await this.obtenerCanal(
      canalesImportantes.idSugerencias,
      servidor,
    );

    return canalDeSugerencias;
  }
}
