export default class Resultado<T> {
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
}
