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

const log = pino();
const cliente = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

cliente.once("ready", (cliente) => {
  log.info(`Bot listo como ${cliente.user.username}`);
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
