interface Tiempo {
  segundo?: number;
  minuto?: number;
  hora?: number;
  dia?: number;
}

const tiempo: Tiempo = {};

tiempo.segundo = 1000;
tiempo.minuto = tiempo.segundo * 60;
tiempo.hora = tiempo.minuto * 60;
tiempo.dia = tiempo.hora * 24;

export default tiempo;
