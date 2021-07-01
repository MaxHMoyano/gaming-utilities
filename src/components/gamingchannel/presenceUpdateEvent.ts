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
    let channels = await isMemberPartOfCreatedChannels(member);
    if (channels && channels.length) {
      console.log(
        chalk.whiteBright(
          `A new member from a created channel has changed their presence... Checking all created lobbies`,
        ),
      );
      for (let idx = 0; idx < channels.length; idx++) {
        videogames = getChannelPlayedVideogames(channels[idx]);
        // If a videogame is being played on the server, we will show it
        if (videogames && videogames.length) {
          let mostPlayedVideogame: Videogame | undefined =
            getMostPlayedVideogameFromList(videogames);
          await channels[idx]?.edit({
            name: `🔊︱${mostPlayedVideogame?.name}`,
          });
        } else {
          // If not, we will choose a random name for it
          await channels[idx]?.edit({
            name: `🔊︱${getRandomNameFromThemeNames()}`,
          });
        }
      }
    }
  }
};

export default presenceUpdateEvent;
