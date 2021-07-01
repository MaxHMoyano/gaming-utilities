import chalk from 'chalk';
import { Presence } from 'discord.js';
import { Videogame } from '../../models';
import {
  getChannelPlayedVideogames,
  isMemberPartOfCreatedChannels,
  getMostPlayedVideogameFromList,
  getRandomNameFromThemeNames,
} from '../../util';

const presenceUpdateEvent = async (oldPresence: Presence | undefined) => {
  let member = oldPresence?.member;
  let videogames: Videogame[] | null = [];
  if (member) {
    let [isMemberPartOfList, channels] = await isMemberPartOfCreatedChannels(member);
    if (isMemberPartOfList && channels) {
      console.log(chalk.whiteBright(`A new member from a channel has changed their presence`));
      for (let index = 0; index < channels.length; index++) {
        videogames = getChannelPlayedVideogames(channels[index]);
        // If a videogame is being played on the server, we will show it
        if (videogames && videogames.length) {
          let mostPlayedVideogame: Videogame | undefined =
            getMostPlayedVideogameFromList(videogames);
          let editedChannel = await channels[index]?.edit({
            name: `🔊︱${mostPlayedVideogame?.name}`,
          });
          console.log(chalk.cyanBright(`Changed name to ${editedChannel.name}`));
        } else {
          // If not, we will choose a random name for it
          let editedChannel = await channels[index]?.edit({
            name: `🔊︱${getRandomNameFromThemeNames()}`,
          });
          console.log(chalk.cyanBright(`Changed name to ${editedChannel.name}`));
        }
      }
    }
  }
};

export default presenceUpdateEvent;
