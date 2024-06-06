import { RequestData } from "discord.js";

const comandos: RequestData["body"] = [
  {
    name: "panel-de-control",
    description: "Crea el panel de control",
  },
  {
    name: "panel-de-tickets",
    description: "Crea el panel de tickets",
  },
  {
    name: "encuestas",
    description: "Crea una encuesta",
  },
  {
    name: "mensaje-incrustado",
    description: "Crea un mensaje incrustado",
  },
  {
    name: "sugerencias",
    description: "Crea una sugerencia",
  },
];

export default comandos;
