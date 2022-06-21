import * as dotenv from "dotenv";
import { Client, Intents } from "discord.js";
import db from "./db";
import gamingChannel from "./components/voice-manager";
import autoRole from "./components/auto-role";
import botStatus from "./components/bot-status";

dotenv.config();

db.connect().then(() => {
  const client = new Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_PRESENCES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
  });
  client.login(process.env.TOKEN);
  // botStatus.init(client);
  // gamingChannel.init(client);
  autoRole.init(client);
});
