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
}

function formatearClavesNulas<
  T extends
    | DatosTicketsApi
    | DatosMensajesDelSistemaApi
    | DatosCanalesImportantesApi
    | DatosEmbedsApi
    | DatosRolesDeAdministracionApi,
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
  }

  public async actualizar(nuevosDatos: DatosCanalesImportantes): Promise<void> {
    let nuevosDatosApi: DatosCanalesImportantesApi = {
      id_general: nuevosDatos.idGeneral,
      id_sugerencias: nuevosDatos.idSugerencias,
      id_votaciones: nuevosDatos.idVotaciones,
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

interface ManejadorDeTablas {
  ruta: string;
  obtener(): Promise<void>;
  actualizar(nuevosDatos: any): Promise<void>;
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
}

interface DatosCanalesImportantesApi {
  id_general?: string | null;
  id_sugerencias?: string | null;
  id_votaciones?: string | null;
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
