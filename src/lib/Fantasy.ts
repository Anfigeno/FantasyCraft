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

    const datos: DatosTicketsApi = await respuesta.json();

    this.categoria = datos.categoria;
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

    const datos: DatosMensajesDelSistemaApi = await respuesta.json();

    this.bienvenida = datos.bienvenida;
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
