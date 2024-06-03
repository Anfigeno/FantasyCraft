import Resultado from "./Resultado";

class ConstructorApi {
  protected urlApi = "http://0.0.0.0:8000/api";
  protected tokenApi = "";

  constructor(tokenApi: string) {
    this.tokenApi = tokenApi;
  }

  protected headers = {
    "Content-Type": "application/json",
    Autorizacion: this.tokenApi,
  };
}

export default class Fantasy extends ConstructorApi {
  public tickets = new Tickets(this.tokenApi);
  public mensajesDelSistema = new MensajesDelSistema(this.tokenApi);
  public canalesImportantes = new CanalesImportantes(this.tokenApi);
  public comandosPersonalizados = new ComandosPersonalizados(this.tokenApi);
  public embeds = new Embeds(this.tokenApi);
  public rolesDeAdministracion = new RolesDeAdministracion(this.tokenApi);
  public mensajesProgramados = new MensajesProgramados(this.tokenApi);
  public palabrasProhibidas = new PalabrasProhibidas(this.tokenApi);
}

function formatearClavesNulas<
  T extends
    | DatosTicketsApi
    | DatosMensajesDelSistemaApi
    | DatosCanalesImportantesApi
    | DatosEmbedsApi
    | DatosRolesDeAdministracionApi
    | DatosMensajeProgramadoApi
    | DatosPalabrasProhibidasApi,
>(objeto: T): T {
  for (const clave in objeto) {
    const elemento = objeto[clave];

    if (elemento === "null" || !elemento) {
      objeto[clave] = undefined;
    }
  }

  return objeto;
}

class Tickets
  extends ConstructorApi
  implements ManejadorDeTablas, DatosTickets
{
  public ruta = `${this.urlApi}/tickets`;

  public idCategoria: string | null;

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(
        `Error al obtener la información de los tickets: ${error}`,
      );
    }

    const datos: DatosTicketsApi = await respuesta.json();

    this.idCategoria = datos.id_categoria;
  }

  public async actualizar(nuevosDatos: DatosTickets): Promise<void> {
    let nuevosDatosApi: DatosTicketsApi = {
      id_categoria: nuevosDatos.idCategoria,
    };

    nuevosDatosApi = formatearClavesNulas(nuevosDatosApi);

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(
        `Error al actualizar la información de los tickets: ${error}`,
      );
    }
  }
}

class MensajesDelSistema
  extends ConstructorApi
  implements ManejadorDeTablas, MensajesDelSistema
{
  public bienvenida: string | null;

  public ruta = `${this.urlApi}/mensajes_del_sistema`;

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(`Error al obtener los mensajes del sistema: ${error}`);
    }

    const datos: DatosMensajesDelSistemaApi = await respuesta.json();

    this.bienvenida = datos.bienvenida;
  }

  public async actualizar(nuevosDatos: DatosMensajesDelSistema): Promise<void> {
    let nuevosDatosApi: DatosMensajesDelSistemaApi = {
      bienvenida: nuevosDatos.bienvenida,
    };

    nuevosDatosApi = formatearClavesNulas(nuevosDatosApi);

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(`Error al actualizar los mensajes del sistema: ${error}`);
    }
  }
}

class CanalesImportantes
  extends ConstructorApi
  implements ManejadorDeTablas, DatosCanalesImportantes
{
  public idGeneral: string | null;
  public idSugerencias: string | null;
  public idVotaciones: string | null;
  public idBienvenidas: string;

  public ruta = `${this.urlApi}/canales_importantes`;

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(`Error al obtener los canales importantes: ${error}`);
    }

    const datos: DatosCanalesImportantesApi = await respuesta.json();

    this.idGeneral = datos.id_general;
    this.idSugerencias = datos.id_sugerencias;
    this.idVotaciones = datos.id_votaciones;
    this.idBienvenidas = datos.id_bienvenidas;
  }

  public async actualizar(nuevosDatos: DatosCanalesImportantes): Promise<void> {
    let nuevosDatosApi: DatosCanalesImportantesApi = {
      id_general: nuevosDatos.idGeneral,
      id_sugerencias: nuevosDatos.idSugerencias,
      id_votaciones: nuevosDatos.idVotaciones,
      id_bienvenidas: nuevosDatos.idBienvenidas,
    };

    nuevosDatosApi = formatearClavesNulas(nuevosDatosApi);

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(`Error al actualizar los canales importantes: ${error}`);
    }
  }
}

class ComandosPersonalizados
  extends ConstructorApi
  implements ManejadorDeTablas
{
  public ruta = `${this.urlApi}/comandos_personalizados`;
  public lista: DatosComandoPersonalizado[] = [];

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(`Error al obtener los comandos personalizados: ${error}`);
    }

    const datos: DatosComandoPersonalizadoApi[] = await respuesta.json();

    this.lista = datos.map((dato) => {
      return {
        palabraClave: dato.palabra_clave,
        contenido: dato.contenido,
        autor: dato.autor,
      };
    });
  }

  public async actualizar(
    nuevosDatos: DatosComandoPersonalizado[],
  ): Promise<void> {
    const nuevosDatosApi: DatosComandoPersonalizadoApi[] = nuevosDatos.map(
      (dato) => {
        return {
          palabra_clave: dato.palabraClave,
          contenido: dato.contenido,
          autor: dato.autor,
        };
      },
    );

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(
        `Error al actualizar los comandos personalizados: ${error}`,
      );
    }
  }

  public async obtenerComando(
    palabraClave: string,
  ): Promise<DatosComandoPersonalizado> {
    const respuesta = await fetch(`${this.ruta}/${palabraClave}`, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(
        `Error al obtener el comando personalizado ${palabraClave}: ${error}`,
      );
    }

    const datos: DatosComandoPersonalizadoApi = await respuesta.json();

    return {
      palabraClave: datos.palabra_clave,
      contenido: datos.contenido,
      autor: datos.autor,
    };
  }
}

class Embeds extends ConstructorApi implements ManejadorDeTablas, DatosEmbeds {
  public ruta = `${this.urlApi}/embeds`;

  public color: string | null;
  public urlImagenLimitadora: string | null;

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(`Error al obtener los embeds: ${error}`);
    }

    const datos: DatosEmbedsApi = await respuesta.json();

    this.color = datos.color;
    this.urlImagenLimitadora = datos.url_imagen_limitadora;
  }

  public async actualizar(nuevosDatos: DatosEmbeds): Promise<void> {
    let nuevosDatosApi: DatosEmbedsApi = {
      color: nuevosDatos.color,
      url_imagen_limitadora: nuevosDatos.urlImagenLimitadora,
    };

    nuevosDatosApi = formatearClavesNulas(nuevosDatosApi);

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(`Error al actualizar los embeds: ${error}`);
    }
  }
}

class RolesDeAdministracion
  extends ConstructorApi
  implements ManejadorDeTablas, DatosRolesDeAdministracion
{
  public ruta = `${this.urlApi}/roles_de_administracion`;

  public idAdministrador: string | null;
  public idStaff: string | null;

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(`Error al obtener los roles de administración: ${error}`);
    }

    const datos: DatosRolesDeAdministracionApi = await respuesta.json();

    this.idAdministrador = datos.id_administrador;
    this.idStaff = datos.id_staff;
  }

  public async actualizar(
    nuevosDatos: DatosRolesDeAdministracion,
  ): Promise<void> {
    let nuevosDatosApi: DatosRolesDeAdministracionApi = {
      id_administrador: nuevosDatos.idAdministrador,
      id_staff: nuevosDatos.idStaff,
    };

    nuevosDatosApi = formatearClavesNulas(nuevosDatosApi);

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(
        `Error al actualizar los roles de administración: ${error}`,
      );
    }
  }
}

class MensajesProgramados extends ConstructorApi implements ManejadorDeTablas {
  public ruta = `${this.urlApi}/mensajes_programados`;
  public lista: DatosMensajeProgramado[] = [];

  public async obtener(): Promise<Resultado<void>> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      return new Resultado(
        undefined,
        `Error al obtener los mensajes programados: ${error}`,
      );
    }

    const datos: DatosMensajeProgramadoApi[] = await respuesta.json();

    this.lista = datos.map((dato) => {
      return {
        id: dato.id,
        titulo: dato.titulo,
        descripcion: dato.titulo,
        imagen: dato.imagen,
        miniatura: dato.miniatura,
        tiempo: dato.tiempo,
        idCanal: dato.id_canal,
        activo: dato.activo,
      };
    });

    return new Resultado();
  }

  public async actualizar(
    nuevosDatos: DatosMensajeProgramado[],
  ): Promise<Resultado<void>> {
    let nuevosDatosApi: DatosMensajeProgramadoApi[] = nuevosDatos.map(
      (dato) => {
        return {
          id: dato.id,
          titulo: dato.titulo,
          descripcion: dato.descripcion,
          imagen: dato.imagen,
          miniatura: dato.miniatura,
          tiempo: dato.tiempo,
          id_canal: dato.idCanal,
          activo: dato.activo,
        };
      },
    );

    nuevosDatosApi = nuevosDatosApi.map((dato) => {
      return formatearClavesNulas(dato);
    });

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      return new Resultado(
        undefined,
        `Error al actualizar los mensajes programados: ${error}`,
      );
    }

    return new Resultado();
  }

  public async obtenerUno(
    id: number,
  ): Promise<Resultado<DatosMensajeProgramado>> {
    const respuesta = await fetch(`${this.ruta}/${id}`, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      return new Resultado(
        undefined,
        `Error al obtener el mensaje programado ${id}: ${error}`,
      );
    }

    const datos: DatosMensajeProgramadoApi = await respuesta.json();
    const datosFormateados: DatosMensajeProgramado = {
      id: datos.id,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      imagen: datos.imagen,
      miniatura: datos.miniatura,
      tiempo: datos.tiempo,
      idCanal: datos.id_canal,
      activo: datos.activo,
    };

    return new Resultado(datosFormateados);
  }

  public async actualizarUno(
    nuevosDatos: DatosMensajeProgramado,
  ): Promise<Resultado<void>> {
    let nuevosDatosApi: DatosMensajeProgramadoApi = {
      id: nuevosDatos.id,
      titulo: nuevosDatos.titulo,
      descripcion: nuevosDatos.descripcion,
      imagen: nuevosDatos.imagen,
      miniatura: nuevosDatos.miniatura,
      tiempo: nuevosDatos.tiempo,
      id_canal: nuevosDatos.idCanal,
      activo: nuevosDatos.activo,
    };

    nuevosDatosApi = formatearClavesNulas(nuevosDatosApi);

    const respuesta = await fetch(`${this.ruta}/${nuevosDatosApi.id}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      return new Resultado(
        undefined,
        `Error al actualizar el mensaje programado ${nuevosDatos.id}: ${error}`,
      );
    }

    return new Resultado();
  }
}

class PalabrasProhibidas
  extends ConstructorApi
  implements ManejadorDeTablas, DatosPalabrasProhibidas
{
  public ruta = `${this.urlApi}/palabras_prohibidas`;

  public lista: string[];

  public async obtener(): Promise<Resultado<void>> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      return new Resultado(
        undefined,
        `Error al obtener las palabras prohibidas: ${error}`,
      );
    }

    const datos: DatosPalabrasProhibidasApi = await respuesta.json();

    if (datos.lista === null) {
      this.lista = [];
    }

    this.lista = datos.lista.split(", ");

    return new Resultado();
  }

  public async actualizar(
    nuevosDatos: DatosPalabrasProhibidas,
  ): Promise<Resultado<void>> {
    let nuevosDatosApi: DatosPalabrasProhibidasApi = {
      lista: nuevosDatos.lista.join(", "),
    };

    nuevosDatosApi = formatearClavesNulas(nuevosDatosApi);

    const respuesta = await fetch(this.ruta, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(nuevosDatosApi),
    });

    if (!respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      return new Resultado(
        undefined,
        `Error al actualizar las palabras prohibidas: ${error}`,
      );
    }

    return new Resultado();
  }
}

interface ManejadorDeTablas {
  ruta: string;
  obtener(): Promise<any>;
  actualizar(nuevosDatos: any): Promise<any>;
}

export interface DatosTickets {
  idCategoria: string | null;
}

interface DatosTicketsApi {
  id_categoria?: string | null;
}

export interface DatosMensajesDelSistema {
  bienvenida: string | null;
}

interface DatosMensajesDelSistemaApi {
  bienvenida?: string | null;
}

export interface DatosCanalesImportantes {
  idGeneral: string | null;
  idVotaciones: string | null;
  idSugerencias: string | null;
  idBienvenidas: string | null;
}

interface DatosCanalesImportantesApi {
  id_general?: string | null;
  id_sugerencias?: string | null;
  id_votaciones?: string | null;
  id_bienvenidas?: string | null;
}

export interface DatosComandoPersonalizado {
  palabraClave: string;
  contenido: string;
  autor: string;
}

interface DatosComandoPersonalizadoApi {
  palabra_clave?: string;
  contenido?: string;
  autor?: string;
}

export interface DatosEmbeds {
  color: string | null;
  urlImagenLimitadora: string | null;
}

interface DatosEmbedsApi {
  color?: string | null;
  url_imagen_limitadora?: string | null;
}

export interface DatosRolesDeAdministracion {
  idAdministrador: string | null;
  idStaff: string | null;
}

interface DatosRolesDeAdministracionApi {
  id_administrador?: string | null;
  id_staff?: string | null;
}

export interface DatosMensajeProgramado {
  id: number;
  titulo: string;
  descripcion: string;
  imagen?: string;
  miniatura?: string;
  tiempo: string;
  idCanal: string;
  activo: boolean;
}

interface DatosMensajeProgramadoApi {
  id: number | null;
  titulo: string | null;
  descripcion: string | null;
  imagen: string | null;
  miniatura: string | null;
  tiempo: string | null;
  id_canal: string | null;
  activo: boolean;
}

export interface DatosPalabrasProhibidas {
  lista: string[];
}

interface DatosPalabrasProhibidasApi {
  lista: string | null;
}
