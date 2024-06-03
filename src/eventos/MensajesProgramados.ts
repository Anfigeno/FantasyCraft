import AccionesBase from "@lib/AccionesBase";
import { DatosMensajeProgramado } from "@lib/Fantasy";
import Resultado from "@lib/Resultado";
import tiempo from "@lib/Tiempo";
import { Guild } from "discord.js";

export default class ProgramadorDeMensajes extends AccionesBase {
  public static async empezarReloj(servidor: Guild): Promise<void> {
    await this.activarTodosLosMensajesProgramados();

    await this.programarMensajes(servidor);

    setInterval(async () => {
      await this.empezarReloj(servidor);
    }, tiempo.minuto);
  }

  public static async activarTodosLosMensajesProgramados(): Promise<void> {
    const { mensajesProgramados } = this.api;
    let resultado = await mensajesProgramados.obtener();

    if (resultado.error !== null) {
      this.log.error(
        `Error al obtener los mensajes programados: ${resultado.error}`,
      );
      return;
    }

    if (mensajesProgramados.lista.length === 0) {
      this.log.info("No hay mensajes programados");
      return;
    }

    mensajesProgramados.lista.forEach(async (mensajeProgramado) => {
      const { error } = await this.activarMensajeProgramado(mensajeProgramado);

      if (error !== null) {
        this.log.error(error);
      }
    });
  }

  public static async programarMensajes(servidor: Guild): Promise<void> {
    const { mensajesProgramados } = this.api;
    let { error } = await mensajesProgramados.obtener();
    if (error !== null) {
      this.log.error(error);
      return;
    }

    if (mensajesProgramados.lista.length === 0) {
      this.log.info("No hay mensajes programados");
      return;
    }

    mensajesProgramados.lista.forEach(async (mensajeProgramado) => {
      if (mensajeProgramado.activo) {
        await this.programarMensaje(mensajeProgramado, servidor);
      }
    });
  }

  private static async desactivarMensajeProgramado(
    datos: DatosMensajeProgramado,
  ): Promise<Resultado<void>> {
    datos.activo = false;

    const { error } = await this.api.mensajesProgramados.actualizarUno(datos);
    if (error !== null) {
      return new Resultado(undefined, error);
    }

    return new Resultado();
  }

  private static async activarMensajeProgramado(
    datos: DatosMensajeProgramado,
  ): Promise<Resultado<void>> {
    datos.activo = false;

    const { error } = await this.api.mensajesProgramados.actualizarUno(datos);
    if (error !== null) {
      return new Resultado(undefined, error);
    }

    return new Resultado();
  }

  private static obtenerDiferenciaDeTiempo(horaFormateada: string): number {
    const ahora = new Date();
    const objetivo = new Date();

    const partesTiempo = horaFormateada.split(":");
    const hora = Number(partesTiempo[0]);
    const minuto = Number(partesTiempo[1]);

    objetivo.setHours(hora, minuto, 0, 0);

    if (objetivo.getTime() <= ahora.getTime()) {
      objetivo.setDate(objetivo.getDate() + 1);
    }

    return objetivo.getTime() - ahora.getTime();
  }

  private static async programarMensaje(
    datos: DatosMensajeProgramado,
    servidor: Guild,
  ): Promise<void> {
    let { error } = await this.desactivarMensajeProgramado(datos);
    if (error !== null) {
      this.log.error(error);
      return;
    }

    const diferenciaDeTiempo = this.obtenerDiferenciaDeTiempo(datos.tiempo);

    this.log.info(
      `"${datos.titulo}" programado para ejecutarse en ${diferenciaDeTiempo / 1000 / 60 / 60} horas`,
    );

    setTimeout(async () => {
      await this.enviarMensajeIncrustado(datos, servidor);

      let { error } = await this.activarMensajeProgramado(datos);
      if (error !== null) {
        this.log.error(error);
      }
    }, diferenciaDeTiempo);
  }

  private static async enviarMensajeIncrustado(
    datos: DatosMensajeProgramado,
    servidor: Guild,
  ): Promise<void> {
    const embed = (await this.crearEmbedEstilizado())
      .setTitle(datos.titulo)
      .setDescription(datos.descripcion);

    if (datos.imagen) {
      try {
        embed.setImage(datos.imagen);
      } catch (error) {
        this.log.error(
          `Error al establecer la imágen del mensaje programado ${datos.titulo}`,
        );
      }
    }

    if (datos.miniatura) {
      try {
        embed.setThumbnail(datos.miniatura);
      } catch (error) {
        this.log.error(
          `Error al establecer la imágen del mensaje programado ${datos.titulo}`,
        );
      }
    }

    try {
      const canal = await this.obtenerCanal(datos.idCanal, servidor);

      if (canal.isTextBased()) {
        canal.send({
          embeds: [embed],
        });
      }
    } catch (error) {
      throw new Error(
        `Error al mandar el mensaje programado ${datos.titulo}: ${error}`,
      );
    }
  }
}
