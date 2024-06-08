export default class Resultado<T> {
  // PENDIENTE: Eliminar el uso de datos y error
  public datos: T | undefined;
  public error: string | undefined | null;

  constructor(datos?: T, error?: string) {
    this.datos = datos;

    if (error) {
      this.error = error;
    } else {
      this.error = null;
    }
  }

  public static async asincrono<T>(
    funcion: () => Promise<T>,
  ): Promise<[T | undefined, null | string]> {
    try {
      const datos = await funcion();
      return [datos, null];
    } catch (error) {
      return [undefined, error];
    }
  }

  public static sincrono<T>(funcion: () => T): [T | undefined, null | string] {
    try {
      const datos = funcion();
      return [datos, null];
    } catch (error) {
      return [undefined, error];
    }
  }
}
