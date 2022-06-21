import { Client } from "discord.js";
import readyEvent from "./readyEvent";
import voiceUpdateEvent from "./voiceUpdateEvent";
import presenceUpdateEvent from "./presenceUpdateEvent";

const init = async (client: Client) => {
  // When the bot is ready and starts
  client.on("ready", async () => {
    await readyEvent(client);
    console.log("VoiceManager module initiated");
  });

  // Everytime a member changes from channel to channel
  client.on("voiceStateUpdate", voiceUpdateEvent);

  // Everytime a member updates their rich presence
  client.on("presenceUpdate", presenceUpdateEvent);
};

export default {
  init,
};
