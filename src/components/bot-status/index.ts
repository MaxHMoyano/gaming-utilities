import { Client } from "discord.js";
import { NEW_MEMBER_ROLE } from "../../util/constants";

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
  client.on("guildMemberAdd", (member) => {
    console.log(`New member ${member.displayName} added to the guild`);
    member.roles.add(NEW_MEMBER_ROLE);
  });
};

export default {
  init,
};
