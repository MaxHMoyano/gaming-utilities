import { Client, Guild, Activity, GuildChannel, GuildMember, TextChannel } from 'discord.js';
import { Videogame } from '../classes';

export const findServer = (client?: Client): Guild | undefined => {
  return client?.guilds.cache.first();
};

export const findVoiceCategory = (server?: Guild) => {
  return server?.channels.cache.find((channel) => {
    return channel.id === '377818324559593486';
  });
};

export const findBotCategory = (server?: Guild) => {
  return server?.channels.cache.find((channel) => {
    return channel.id === '733385675986173984';
  });
};

export const isTextChannelAlreadyCreated = (server?: Guild, name?: string) => {
  let channel = server?.channels.cache.find((e) => e.name === name) as TextChannel;
  return channel;
};
export const deleteOldMessagesFromChannel = async (channel: TextChannel | undefined) => {
  if (channel) {
    const previousMessages = await channel?.messages.fetch();
    if (previousMessages) {
      channel?.bulkDelete(previousMessages);
    }
  }
};

export const getEmojiByName = (server: Guild | undefined, iconName: string) => {
  return server?.emojis.cache.find((e) => e.name === iconName);
};

export const getChannelPlayedVideogames = (channel: GuildChannel) => {
  let videogames: Videogame[] = [];
  let activities: Activity[] = [];
  channel?.members.forEach((member) => {
    let memberGames = member.presence.activities.filter((activity) => activity.type === 'PLAYING');
    if (memberGames.length) {
      activities.push(...memberGames);
    }
  });
  if (activities.length) {
    activities.forEach((activity) => {
      let gameIdx = videogames.findIndex((videogame) => videogame.id === activity.applicationID);
      if (gameIdx !== -1) {
        videogames[gameIdx].count++;
      } else {
        videogames.push({
          name: activity.name,
          id: activity.applicationID as string,
          count: 1,
        });
      }
    });
    return videogames;
  }
  return null;
};

export const isMemberPartOfChannelList = (
  member: GuildMember,
  channelList: GuildChannel[],
): [boolean, GuildChannel | null] => {
  let memberInCreatedChannel: GuildMember | undefined;
  let channelWithMember: GuildChannel | null = null;
  channelList.forEach((channel) => {
    memberInCreatedChannel = channel.members.array().find((e) => e.id === member?.id);
    channelWithMember = memberInCreatedChannel ? channel : null;
  });
  return [memberInCreatedChannel ? true : false, channelWithMember];
};

export const getMostPlayedVideogameFromList = (videogames: Videogame[]) => {
  let mostPlayed: Videogame = {
    count: 0,
  };
  videogames.forEach((videogame) => {
    if (videogame.count > mostPlayed.count) {
      mostPlayed = videogame;
    }
  });
  return mostPlayed;
};

export default {
  findServer,
  findVoiceCategory,
  findBotCategory,
  getEmojiByName,
  isTextChannelAlreadyCreated,
  deleteOldMessagesFromChannel,
  getChannelPlayedVideogames,
  getMostPlayedVideogameFromList,
};
