import {
  Client,
  Guild,
  Activity,
  GuildChannel,
  GuildMember,
  TextChannel,
  NonThreadGuildBasedChannel,
  CategoryChannel,
} from "discord.js";
import { sample } from "lodash";
import { Videogame } from "../models";
import { GamingChannelModel } from "../models/GamingChannel";
import { MAIN_CHAT_ID, VOICE_CATEGORY } from "./constants";
import { MessageModel } from "../models/Message";

const themeNames: string[] = [
  "Cocina",
  "Comedor",
  "Living",
  "Dormitorio Grande",
  "Dormitorio chiquito",
  "Sala de estar",
  "Sex dungeon",
  "Patio",
  "Quincho",
  "Terraza",
  "Pasillo",
  "Sotano",
  "Casita del arbol",
  "Desvan",
  "Ático",
  "Balcon",
  "Escalera",
  "Jardín",
  "Garage",
  "Patio trasero",
  "Vestíbulo",
];

export const getRandomNameFromThemeNames = () => sample(themeNames);

export const changeChannelName = (channel: GuildChannel, name: string) => {
  if (channel.name !== name) {
    channel.edit({ name });
  }
};

export const findGuildByClient = (client?: Client): Guild | undefined =>
  client?.guilds.cache.first();

export const findVoiceCategory = async (server?: Guild) =>
  (await server?.channels.fetch(VOICE_CATEGORY)) as CategoryChannel;

export const findMainCategory = async (server?: Guild) =>
  (await server?.channels.fetch(MAIN_CHAT_ID)) as CategoryChannel;

export const findVoiceManagerChannel = async () =>
  await GamingChannelModel.findOne({ role: "voice" });

export const findAutoRoleChannel = async () =>
  await GamingChannelModel.findOne({ role: "autorole" });

export const isChannelAlreadyCreated = (guild?: Guild, name?: string) => {
  const channel = guild?.channels.cache.find((e) => e.name === name);
  return channel;
};
export const deleteOldMessagesFromChannel = async (
  channel: TextChannel | undefined
) => {
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
  const activities: Activity[] = [];
  channel?.members.forEach((member) => {
    const memberGames = member.presence?.activities.filter(
      (activity) => activity.type === "PLAYING"
    );
    if (memberGames && memberGames.length) {
      activities.push(...memberGames);
    }
  });
  if (activities.length) {
    activities.forEach((activity) => {
      const gameIdx = videogames.findIndex(
        (videogame) => videogame.id === activity.applicationId
      );
      if (gameIdx === -1) {
        videogames.push({
          name: activity.name,
          id: activity.applicationId,
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
  member: GuildMember
): Promise<NonThreadGuildBasedChannel | null> => {
  const dbChannel = await GamingChannelModel.findOne({ creator: member.id });
  if (dbChannel) {
    return await member.guild.channels.fetch(dbChannel.channelId);
  }
  return null;
};
