import chalk from 'chalk';
import { GuildChannel, Presence } from 'discord.js';
import { Videogame } from '../../models';
import {
  getChannelPlayedVideogames,
  isMemberPartOfCreatedChannels,
  getMostPlayedVideogamesFromList,
  getRandomNameFromThemeNames,
  changeChannelName,
} from '../../util';

const checkAllChannelsNames = async (channels: GuildChannel[]) => {
  let videogames: Videogame[] | null = [];
  for (let idx = 0; idx < channels.length; idx++) {
    videogames = getChannelPlayedVideogames(channels[idx]);
    // If a videogame is being played on the server, we will show it
    if (videogames && videogames.length) {
      let mostPlayedVideogames: Videogame[] = getMostPlayedVideogamesFromList(videogames);
      if (mostPlayedVideogames.length === 1) {
        changeChannelName(channels[idx], `🔊︱${mostPlayedVideogames[0].name}`);
      }
    }
  }
};

const presenceUpdateEvent = async (oldPresence: Presence | undefined) => {
  let member = oldPresence?.member;
  if (member) {
    let channels = await isMemberPartOfCreatedChannels(member);
    if (channels && channels.length) {
      console.log(
        chalk.whiteBright(
          `A new member from a created channel has changed their presence... Checking all created lobbies`,
        ),
      );
      checkAllChannelsNames(channels);
    }
  }
};

export default presenceUpdateEvent;
