import chalk from 'chalk';
import { GuildChannel, Presence } from 'discord.js';
import { Videogame } from '../../models';
import { GamingChannelModel } from '../../models/GamingChannel';
import {
  getChannelPlayedVideogames,
  isMemberPartOfCreatedChannels as isMemberCreatorOfAChannel,
  changeChannelName,
  getRandomNameFromThemeNames,
} from '../../util';

const checkChannelName = async (channel: GuildChannel) => {
  let databaseChannel = await GamingChannelModel.findById(channel.id);
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
    let channel = await isMemberCreatorOfAChannel(member);
    if (channel) {
      checkChannelName(channel);
    }
  }
};

export default presenceUpdateEvent;
