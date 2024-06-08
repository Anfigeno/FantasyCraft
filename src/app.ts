import { Client, GatewayIntentBits } from "discord.js";
import pino from "pino";
import Util from "./lib/Util";
import PanelDeControl from "./interacciones/PanelDeControl";
import ComandoPersonalizado from "@eventos/ComandoPersonalizado";
import NuevoUsuario from "@eventos/NuevoUsuario";
import Encuestas from "./interacciones/Encuestas";
import MensajeIncrustado from "./interacciones/MensajeIncrustado";
import ProgramadorDeMensajes from "@eventos/MensajesProgramados";
import AccionesBase from "@lib/AccionesBase";
import NuevoMensaje from "@eventos/NuevoMensaje";
import Sugerencias from "./interacciones/Sugerencias";
import panelDeTickets from "./interacciones/PanelDeTickets";

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
  Encuestas.manejarInteraccion(interaccion);
  MensajeIncrustado.manejarInteraccion(interaccion);
  Sugerencias.manejarInteraccion(interaccion);
  panelDeTickets.manejarInteraccion(interaccion);
});

cliente.on("messageCreate", (mensaje) => {
  ComandoPersonalizado.manejarMensaje(mensaje);
  NuevoMensaje.verificarPalabrasProhibidas(mensaje);
});

cliente.on("guildMemberAdd", (mensaje) => {
  NuevoUsuario.darleLaBienvenida(mensaje);
});
