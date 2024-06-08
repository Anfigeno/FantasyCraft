import {
  ColorResolvable,
  EmbedBuilder,
  Guild,
  GuildMember,
  Client,
  GuildTextBasedChannel,
  CommandInteraction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import Fantasy from "./Fantasy";
import Util from "./Util";
import pino from "pino";
import Resultado from "./Resultado";

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
  ): Promise<Resultado<GuildTextBasedChannel>> {
    const canal = await servidor.channels.fetch(id);

    if (!canal) {
      return new Resultado(undefined, `El canal de id ${id} no existe`);
    }

    if (!canal.isTextBased()) {
      return new Resultado(undefined, "El canal no es un canal de texto");
    }

    return new Resultado(canal);
  }

  public static async obtenerServidor(
    cliente: Client,
  ): Promise<Resultado<Guild>> {
    const idServidor = Util.Env("GUILD_ID");
    const servidor = await cliente.guilds.fetch(idServidor);

    if (!servidor) {
      return new Resultado(undefined, "El servidor no existe");
    }

    return new Resultado(servidor);
  }

  public static async responderFalloDeInteraccion(
    interaccion:
      | CommandInteraction
      | ButtonInteraction
      | StringSelectMenuInteraction
      | ModalSubmitInteraction,
  ): Promise<void> {
    await interaccion.reply({
      content: "Ocurrió un error al ejecutar esta interacción",
      ephemeral: true,
    });
  }

  public static async miembroEsStaff(miembro: GuildMember): Promise<boolean> {
    const { rolesDeAdministracion } = this.api;
    const [_, error] = await Resultado.asincrono(() =>
      rolesDeAdministracion.obtener(),
    );
    if (error !== null) {
      Util.log.error(error);
      return false;
    }

    const miembroEsStaff = miembro.roles.cache.find(
      (rol) =>
        rol.id === rolesDeAdministracion.idAdministrador ||
        rol.id === rolesDeAdministracion.idStaff,
    );

    return miembroEsStaff !== undefined;
  }
}
