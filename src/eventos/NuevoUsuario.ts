import AccionesBase from "@lib/AccionesBase";
import { GuildMember } from "discord.js";

export default class NuevoUsuario extends AccionesBase {
  public static async darleLaBienvenida(miembro: GuildMember): Promise<void> {
    const { mensajesDelSistema, canalesImportantes } = this.api;

    await mensajesDelSistema.obtener();

    const partesBienvenida = mensajesDelSistema.bienvenida
      .split("{usuario.nombre}")
      .join(`${miembro.user.username}`)
      .split("{usuario}")
      .join(`${miembro}`)
      .split("\n");

    const bienvenida = {
      titulo: partesBienvenida[0],
      descripcion: partesBienvenida.slice(1).join("\n"),
    };

    const embed = await this.crearEmbedEstilizado();
    embed.setTitle(bienvenida.titulo);
    embed.setDescription(bienvenida.descripcion);
    embed.setThumbnail(miembro.user.avatarURL());

    await canalesImportantes.obtener();

    const canalDeBienvenidas = await this.obtenerCanal(
      canalesImportantes.idBienvenidas,
      miembro.guild,
    );

    if (canalDeBienvenidas.error !== null) {
      this.log.error(canalDeBienvenidas.error);
      return;
    }

    await canalDeBienvenidas.datos.send({
      embeds: [embed],
    });
  }
}
