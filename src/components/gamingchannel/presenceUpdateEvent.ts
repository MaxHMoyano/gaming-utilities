import chalk from 'chalk';
import { Presence } from 'discord.js';
import { Videogame } from '../../models';
import {
  getChannelPlayedVideogames,
  isMemberPartOfCreatedChannels,
  getMostPlayedVideogameFromList,
} from '../../util';

const presenceUpdateEvent = async (oldPresence: Presence | undefined) => {
  let member = oldPresence?.member;
  let videogames: Videogame[] | null = [];
  if (member) {
    let [isMemberPartOfList, channel] = await isMemberPartOfCreatedChannels(member);
    if (isMemberPartOfList && channel) {
      console.log(
        chalk.whiteBright(`A new member from ${channel.name} has changed their presence`),
      );
      videogames = getChannelPlayedVideogames(channel);
    }
    if (videogames && videogames.length) {
      let mostPlayedVideogame: Videogame | null = getMostPlayedVideogameFromList(videogames);
      channel?.edit({ name: mostPlayedVideogame?.name }).then((editedChannel) => {
        console.log(chalk.cyanBright(`Changed name to ${editedChannel.name}`));
      });
    }
  }
};

export default presenceUpdateEvent;
