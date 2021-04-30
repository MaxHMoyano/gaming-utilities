import { Presence, GuildChannel } from 'discord.js';
import { Videogame } from '../../classes';
import {
  getChannelPlayedVideogames,
  isMemberPartOfChannelList,
  getMostPlayedVideogameFromList,
} from '../../util';

const presenceUpdateEvent = (
  oldPresence: Presence | undefined,
  createdChannels: GuildChannel[],
) => {
  let member = oldPresence?.member;
  let videogames: Videogame[] | null = [];
  if (member) {
    let [isMemberPartOfList, channel] = isMemberPartOfChannelList(member, createdChannels);
    if (isMemberPartOfList && channel) {
      console.log(`A new member from ${channel.name} has changed their presence`);
      videogames = getChannelPlayedVideogames(channel);
    }
    let mostPlayedVideogame: Videogame | null =
      videogames && videogames.length ? getMostPlayedVideogameFromList(videogames) : null;
    channel?.edit({ name: mostPlayedVideogame?.name }).then((editedChannel) => {
      console.log(`Changed name of ${channel?.name} to ${editedChannel.name}`);
    });
  }
};

export default presenceUpdateEvent;
