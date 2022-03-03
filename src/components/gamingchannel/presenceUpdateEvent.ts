import chalk from 'chalk';
import { GuildChannel, Presence } from 'discord.js';
import { Videogame } from '../../models';
import GamingChannel from '../../models/GamingChannel';
import {
  getChannelPlayedVideogames,
  isMemberPartOfCreatedChannels,
  changeChannelName,
  getRandomNameFromThemeNames,
} from '../../util';

const checkChannelName = async (channel: GuildChannel) => {
  let databaseChannel = await GamingChannel.findById(channel.id);
  let videogames: Videogame[] | null = [];
  if (!databaseChannel?.hasChanged) {
    videogames = getChannelPlayedVideogames(channel);
    if ((videogames?.length && videogames[0].name != channel.name) || !videogames?.length) {
      await databaseChannel?.updateOne({ hasChanged: true });
      changeChannelName(channel, `🔊︱${getRandomNameFromThemeNames()}`);
    }
  }
};

const presenceUpdateEvent = async (oldPresence: Presence | undefined) => {
  let member = oldPresence?.member;
  if (member) {
    let channel = await isMemberPartOfCreatedChannels(member);
    if (channel) {
      console.log(`A new member from a ${channel.name} has changed their presence`);
      checkChannelName(channel);
    }
  }
};

export default presenceUpdateEvent;
