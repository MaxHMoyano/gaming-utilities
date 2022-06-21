import { Client } from "discord.js";
import { GamingChannelModel } from "../../models/GamingChannel";
import {
  findGuildByClient,
  findVoiceCategory,
  findVoiceManagerChannel,
} from "../../util";
import { VOICE_MANAGER_CHANNEL_NAME } from "../../util/constants";

const readyEvent = async (client: Client) => {
  const server = findGuildByClient(client);
  const voiceCategory = await findVoiceCategory(server);
  let voiceManagerChannel = await findVoiceManagerChannel();
  if (!voiceManagerChannel) {
    let channel = await voiceCategory?.createChannel(
      VOICE_MANAGER_CHANNEL_NAME,
      {
        type: "GUILD_VOICE",
        userLimit: 1,
        position: 2,
      }
    );
    await GamingChannelModel.create({
      channelId: channel?.id,
      hasChanged: false,
      creator: "bot",
      role: "voice",
    });
  }
};

export default readyEvent;
