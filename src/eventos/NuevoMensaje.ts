import AccionesBase from "@lib/AccionesBase";
import { Message } from "discord.js";

export default class NuevoMensaje extends AccionesBase {
  public static async verificarPalabrasProhibidas(
    mensaje: Message,
  ): Promise<void> {
    const { palabrasProhibidas } = this.api;

    const { error } = await palabrasProhibidas.obtener();
    if (error !== null) {
      this.log.error(error);
      return;
    }

    if (
      this.contienePalabraProhibida(mensaje.content, palabrasProhibidas.lista)
    ) {
      await mensaje.delete();
    }
  }

  private static contienePalabraProhibida(
    string: string,
    palabrasProhibidas: string[],
  ): boolean {
    for (const palabra of palabrasProhibidas) {
      if (string.toLowerCase().includes(palabra.toLowerCase())) {
        return true;
      }
    }

    return false;
  }
}
