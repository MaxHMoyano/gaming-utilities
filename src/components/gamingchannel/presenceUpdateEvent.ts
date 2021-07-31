import chalk from 'chalk';
import { GuildChannel, Presence } from 'discord.js';
import { Videogame } from '../../models';
import {
  getChannelPlayedVideogames,
  isMemberPartOfCreatedChannels,
  getMostPlayedVideogamesFromList,
  changeChannelName,
} from '../../util';


const checkChannelName = async (channel: GuildChannel) => {
  let videogames: Videogame[] | null = [];
    videogames = getChannelPlayedVideogames(channel);
    // If a videogame is being played on the server, we will show it
    if (videogames && videogames.length) {
      let mostPlayedVideogames: Videogame[] = getMostPlayedVideogamesFromList(videogames);
      if (mostPlayedVideogames.length === 1) {
        console.log(
          chalk.cyanBright(`The channel ${channel.name} has changed its primary videogame`),
        );
        changeChannelName(channel, `🔊︱${mostPlayedVideogames.shift()?.name}`);
      }
    }
  
};

const presenceUpdateEvent = async (oldPresence: Presence | undefined) => {
  let member = oldPresence?.member;
  if (member) {
    let channel = await isMemberPartOfCreatedChannels(member);
    if (channel) {
      console.log(
        chalk.cyanBright(
          `A new member from a ${channel.name} has changed their presence...`,
        ),
      );
      checkChannelName(channel);
    }
  }
};

export default presenceUpdateEvent;
