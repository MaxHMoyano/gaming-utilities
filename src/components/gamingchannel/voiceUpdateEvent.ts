import { VoiceState } from "discord.js";
import { GamingChannelModel } from "../../models/GamingChannel";
import {
  getRandomNameFromThemeNames,
  findVoiceManagerChannel,
} from "../../util";

const voiceUpdateEvent = async (
  oldVoiceState: VoiceState,
  newVoiceState: VoiceState
) => {
  const dbVoiceManagerChannel = await findVoiceManagerChannel();
  if (
    dbVoiceManagerChannel &&
    newVoiceState.channel &&
    newVoiceState.channel.id === dbVoiceManagerChannel.channelId
  ) {
    debugger;
    let videogames = newVoiceState.member?.presence?.activities.filter(
      (activity) => activity.type === "PLAYING"
    );
    let channelName = videogames?.length
      ? `${videogames[0].name}`
      : `🔊︱${getRandomNameFromThemeNames()}`;
    let newChannel = await newVoiceState.channel.parent?.createChannel(
      channelName,
      {
        type: "GUILD_VOICE",
        position: 2,
      }
    );
    if (newChannel) {
      newVoiceState.member?.voice.setChannel(newChannel);
      await GamingChannelModel.create({
        channelId: newChannel.id,
        hasChanged: !videogames?.length,
        creator: newVoiceState.member?.id as string,
      });
    }
  }
  if (oldVoiceState.channel) {
    let dbChannel = await GamingChannelModel.findOne({
      channelId: oldVoiceState.channel.id,
    });
    if (
      dbChannel &&
      !dbChannel.role &&
      oldVoiceState.channel.members.size === 0
    ) {
      await GamingChannelModel.findOneAndDelete({
        channelId: oldVoiceState.channel.id,
      });
      await oldVoiceState.channel.delete();
    }
  }
};

export default voiceUpdateEvent;
