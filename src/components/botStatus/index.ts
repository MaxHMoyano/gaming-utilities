import { Client } from "discord.js";

const init = async (client: Client) => {
  // When the bot is ready and starts
  client.on("ready", async () => {
    client.user?.setPresence({
      status: "online",
      activities: [
        {
          name: "Rehab™",
          type: "WATCHING",
        },
      ],
    });
    console.log("BotStatus module initiated...");
  });
};

export default {
  init,
};
