import {
  ColorResolvable,
  EmbedBuilder,
  Guild,
  GuildMember,
  GuildBasedChannel,
} from "discord.js";
import Fantasy from "./Fantasy";
import Util from "./Util";
import pino from "pino";

export default class AccionesBase {
  private static tokenApi: string = Util.Env("TOKEN_API");
  public static api: Fantasy = new Fantasy(this.tokenApi);
  public static log = pino();

  public static async crearEmbedEstilizado(): Promise<EmbedBuilder> {
    const { embeds } = this.api;
    await embeds.obtener();

    const embed = new EmbedBuilder();

    try {
      embed.setColor(embeds.color as ColorResolvable);
    } catch (error) {
      this.log.error(`Error al establecer el color a un embed: ${error}`);
    }

    try {
      embed.setImage(embeds.urlImagenLimitadora);
    } catch (error) {
      this.log.error(
        `Error al establecer la imagen limitadora de un embed: ${error}`,
      );
    }

    return embed;
  }

  public static esAdmin(usuario: GuildMember): boolean {
    return usuario.permissions.has("Administrator");
  }

  public static async obtenerCanal(
    id: string,
    servidor: Guild,
  ): Promise<GuildBasedChannel> {
    const canal = await servidor.channels.fetch(id);
    if (!canal) {
      throw new Error(`El canal de id ${id} no existe`);
    }

    return canal;
  }
}