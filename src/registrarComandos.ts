import Util from "@lib/Util";
import { REST, Routes } from "discord.js";
import pino from "pino";
import comandos from "./comandos";

const log = pino();

const tokenBot = Util.Env("TOKEN_BOT");
const clientId = Util.Env("CLIENT_ID");
const guildId = Util.Env("GUILD_ID");

const rest = new REST({ version: "10" }).setToken(tokenBot);

try {
  log.info("Registrando los comandos (/)...");

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: comandos,
  });

  log.info("Comandos registrados!");
} catch (error) {
  log.fatal(`Error al registrar los comandos: ${error}`);
}
