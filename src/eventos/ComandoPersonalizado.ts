import AccionesBase from "@lib/AccionesBase.civet";
import { Message } from "discord.js";

export default class ComandoPersonalizado extends AccionesBase {
  public static async manejarMensaje(mensaje: Message): Promise<void> {
    if (!mensaje.content.startsWith("!c ")) return;

    const palabraClave = mensaje.content.split(" ")[1];

    await this.responderComando(mensaje, palabraClave);
  }

  public static async responderComando(
    mensaje: Message,
    palabraClave: string,
  ): Promise<void> {
    try {
      const comando =
        await this.api.comandosPersonalizados.obtenerComando(palabraClave);

      if (mensaje.reference) {
        const referencia = await mensaje.fetchReference();

        referencia.reply({
          content: comando.contenido
            .split("{usuario}")
            .join(`${referencia.author}`),
        });

        return;
      }

      mensaje.channel.send({
        content: comando.contenido.split("{usuario}").join(`${mensaje.author}`),
      });
    } catch (error) {
      this.log.error(error);

      const respuesta = await mensaje.reply({
        content: "Ocurrió un error al ejecutar esta interacción",
      });

      setTimeout(() => respuesta.delete(), 5000);

      return;
    }
  }
}
