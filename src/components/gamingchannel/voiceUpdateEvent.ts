import { VoiceState, GuildChannel } from 'discord.js';
import chalk from 'chalk';
import GamingChannel from '../../models/GamingChannel';
import { getRandomNameFromThemeNames } from '../../util';

const voiceUpdateEvent = async (
  oldVoiceState: VoiceState,
  newVoiceState: VoiceState,
  voiceCategory: GuildChannel | undefined,
  createPartyChannel: GuildChannel | undefined,
) => {
  if (newVoiceState.channel && newVoiceState.channel.id === createPartyChannel?.id) {
    let videogames = newVoiceState.member?.presence.activities.filter(
      (activity) => activity.type === 'PLAYING',
    );
    let channelName = videogames?.length
      ? `🔊︱${videogames[0].name}`
      : `🔊︱${getRandomNameFromThemeNames()}`;
    let newChannel = await newVoiceState.guild.channels.create(channelName, {
      type: 'voice',
      parent: voiceCategory,
      position: 2,
    });
    await GamingChannel.create({
      name: newChannel.name,
      _id: newChannel.id,
    });
    console.log(chalk.greenBright(`New channel ${newChannel.name} created`));
    newVoiceState.member?.voice.setChannel(newChannel);
  }
  if (oldVoiceState.channel) {
    let dbChannel = await GamingChannel.findById(oldVoiceState.channel.id);
    let channel = oldVoiceState.guild.channels.cache.get(dbChannel?.id);
    if (channel && channel.members.array().length === 0) {
      await GamingChannel.findByIdAndDelete(channel.id);
      await channel.delete();
      console.log(chalk.redBright(`${channel.name} Deleted`));
    }
  }
};

export default voiceUpdateEvent;
