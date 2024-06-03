import { Client, GatewayIntentBits } from "discord.js";
import pino from "pino";
import Util from "./lib/Util";
import PanelDeControl from "./interacciones/PanelDeControl";
import PanelDeTickets from "./interacciones/PanelDeTickets.civet";
import ComandoPersonalizado from "@eventos/ComandoPersonalizado";
import Sugerencias from "@eventos/Sugerencias.civet";
import NuevoUsuario from "@eventos/NuevoUsuario.civet";
import Encuestas from "./interacciones/Encuestas";
import MensajeIncrustado from "./interacciones/MensajeIncrustado";
import ProgramadorDeMensajes from "@eventos/MensajesProgramados";
import AccionesBase from "@lib/AccionesBase";

const log = pino();
const cliente = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

cliente.once("ready", async (cliente) => {
  log.info(`Bot listo como ${cliente.user.username}`);

  let resultado = await AccionesBase.obtenerServidor(cliente);
  if (resultado.error !== null) {
    log.error(resultado.error);
    return;
  }

  ProgramadorDeMensajes.empezarReloj(resultado.datos);
});

const token = Util.Env("TOKEN_BOT");
cliente.login(token);

cliente.on("interactionCreate", (interaccion) => {
  PanelDeControl.manejarInteraccion(interaccion);
  PanelDeTickets.manejarInteraccion(interaccion);
  Encuestas.manejarInteraccion(interaccion);
  MensajeIncrustado.manejarInteraccion(interaccion);
});

cliente.on("messageCreate", (mensaje) => {
  ComandoPersonalizado.manejarMensaje(mensaje);
  Sugerencias.crearEmbedDeSugerencia(mensaje);
});

cliente.on("guildMemberAdd", (mensaje) => {
  NuevoUsuario.darleLaBienvenida(mensaje);
});
