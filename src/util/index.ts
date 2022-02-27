import { Client, Guild, Activity, GuildChannel, GuildMember, TextChannel } from 'discord.js';
import { Videogame } from '../models';
import GamingChannel from '../models/GamingChannel';
import _ from 'lodash';
const themeNames: string[] = [
  'Cocina',
  'Comedor',
  'Living',
  'Dormitorio Grande',
  'Dormitorio chiquito',
  'Sala de estar',
  'Sex dungeon',
  'Patio',
  'Quincho',
  'Terraza',
  'Pasillo',
  'Sotano',
  'Casita del arbol',
  'Desvan',
  'Ático',
  'Balcon',
  'Escalera',
  'Jardín',
  'Garage',
  'Patio trasero',
  'Vestíbulo',
];

export const getRandomNameFromThemeNames = () => {
  return _.sample(themeNames);
};

export const changeChannelName = (channel: GuildChannel, name: string) => {
  if (channel.name !== name) {
    channel.edit({ name });
  }
};

export const findServer = (client?: Client): Guild | undefined => {
  return client?.guilds.cache.first();
};

export const findVoiceCategory = (server?: Guild) => {
  return server?.channels.cache.find((channel) => {
    return channel.id === '377818324559593486';
  });
};

export const findBotCategory = (server?: Guild) => {
  return server?.channels.cache.get('733385675986173984');
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
      if (gameIdx === -1) {
        videogames.push({
          name: activity.name,
          id: activity.applicationID as string,
          count: 1,
        });
      } else {
        videogames[gameIdx].count += 1;
      }
    });
    videogames = videogames
      .filter((e) => e.count >= 2)
      .sort((a, b) => (a.count > b.count ? 1 : -1));
    return videogames;
  }
  return null;
};

export const isMemberPartOfCreatedChannels = async (
  member: GuildMember,
): Promise<GuildChannel | null> => {
  let memberInCreatedChannel: GuildMember | undefined;
  let channelWithMember: GuildChannel | null = null;
  let channelListDB = await GamingChannel.find({});
  let clientChannelList = channelListDB.map((channel) => {
    return member.guild.channels.cache.get(channel.id) as GuildChannel;
  });
  clientChannelList.forEach((channel) => {
    memberInCreatedChannel = channel.members.array().find((e) => e.id === member?.id);
    channelWithMember = memberInCreatedChannel ? channel : null;
  });
  return memberInCreatedChannel ? channelWithMember : null;
};

export default {
  getRandomNameFromThemeNames,
  findServer,
  changeChannelName,
  findVoiceCategory,
  findBotCategory,
  getEmojiByName,
  isTextChannelAlreadyCreated,
  deleteOldMessagesFromChannel,
  getChannelPlayedVideogames,
};
