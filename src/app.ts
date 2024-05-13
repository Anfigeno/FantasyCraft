import { Client, GatewayIntentBits } from "discord.js";
import pino from "pino";
import Util from "./lib/Util";
import PanelDeControl from "./interacciones/PanelDeControl";
import ComandoPersonalizado from "@eventos/ComandoPersonalizado";

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
});

cliente.on("messageCreate", (mensaje) => {
  ComandoPersonalizado.manejarMensaje(mensaje);
});
