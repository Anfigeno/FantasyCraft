class ConstructorApi {
  protected urlApi = "http://localhost:8000";
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
}

class Tickets
  extends ConstructorApi
  implements ManejadorDeTablas, DatosTickets
{
  public ruta = `${this.urlApi}/tickets`;

  public categoria: string;

  public async obtener(): Promise<void> {
    const respuesta = await fetch(this.ruta, {
      method: "GET",
      headers: this.headers,
    });

    if (respuesta.ok) {
      const error = JSON.stringify(await respuesta.json());
      throw new Error(
        `Error al obtener la información de los tickets: ${error}`,
      );
    }

    const datos: DatosTicketsApi = await respuesta.json();

    this.categoria = datos.categoria;
  }

  public async actualizar(nuevosDatos: DatosTickets): Promise<void> {
    const nuevosDatosApi: DatosTicketsApi = {
      categoria: nuevosDatos.categoria,
    };

    const respuesta = await fetch(this.urlApi, {
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
    const nuevosDatosApi: DatosMensajesDelSistemaApi = {
      bienvenida: nuevosDatos.bienvenida,
    };

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
    const nuevosDatosApi: DatosCanalesImportantesApi = {
      id_general: nuevosDatos.idGeneral,
      id_sugerencias: nuevosDatos.idSugerencias,
      id_votaciones: nuevosDatos.idVotaciones,
    };

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
  public comandosPersonalizados: DatosComandoPersonalizado[] = [];

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

    this.comandosPersonalizados = datos.map((dato) => {
      return {
        palabraClave: dato.palabra_clave,
        contenido: dato.contenido,
        creadoPor: dato.creado_por,
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
          creado_por: dato.creadoPor,
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
}

interface ManejadorDeTablas {
  ruta: string;
  obtener(): Promise<void>;
  actualizar(nuevosDatos: any): Promise<void>;
}

interface DatosTickets {
  categoria: string | null;
}

interface DatosTicketsApi {
  categoria: string | null;
}

interface DatosMensajesDelSistema {
  bienvenida: string | null;
}

interface DatosMensajesDelSistemaApi {
  bienvenida: string | null;
}

interface DatosCanalesImportantes {
  idGeneral: string | null;
  idVotaciones: string | null;
  idSugerencias: string | null;
}

interface DatosCanalesImportantesApi {
  id_general: string | null;
  id_sugerencias: string | null;
  id_votaciones: string | null;
}

interface DatosComandoPersonalizado {
  palabraClave: string;
  contenido: string;
  creadoPor: string;
}

interface DatosComandoPersonalizadoApi {
  palabra_clave: string;
  contenido: string;
  creado_por: string;
}
