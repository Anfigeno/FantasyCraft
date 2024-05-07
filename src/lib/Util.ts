export default class Util {
  public static Env(clave: string): string {
    const variableDeEntorno = process.env[clave];

    if (variableDeEntorno == undefined) {
      throw new Error(`La variable de entorno ${clave} no existe`);
    }

    return variableDeEntorno;
  }
}
