import { Client, Guild, Activity, GuildChannel, GuildMember, TextChannel } from 'discord.js';
import { Videogame } from '../models';
import { GamingChannelModel } from '../models/GamingChannel';
import _ from 'lodash';
import { MAIN_CHAT_ID } from './constants';
import { MessageModel } from '../models/Message';
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
  return server?.channels.cache.get(MAIN_CHAT_ID);
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
      await MessageModel.deleteMany({});
    }
  }
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
): Promise<GuildChannel | undefined | null> => {
  let dbChannel = await GamingChannelModel.findOne({ creator: member.id });
  if (dbChannel) {
    return member.guild.channels.cache.get(dbChannel.channelId);
  }
  return null;
};

export default {
  getRandomNameFromThemeNames,
  findServer,
  changeChannelName,
  findVoiceCategory,
  findBotCategory,
  isTextChannelAlreadyCreated,
  deleteOldMessagesFromChannel,
  getChannelPlayedVideogames,
};
