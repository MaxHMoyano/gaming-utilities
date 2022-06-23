import {
  Client,
  Guild,
  Activity,
  GuildChannel,
  GuildMember,
  TextChannel,
  NonThreadGuildBasedChannel,
  CategoryChannel,
  Permissions,
} from "discord.js";
import { sample } from "lodash";
import { Videogame } from "../models";
import { GamingChannelModel } from "../models/GamingChannel";
import {
  AUTO_ROLE_CHANNEL_NAME,
  AUTO_ROLE_DESCRIPTION,
  MAIN_CHAT_ID,
  VOICE_CATEGORY,
} from "./constants";
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

export const findAutoRoleDbChannel = async () =>
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

export const getGuildGameRoles = (guild: Guild) => {
  let gameRoles = guild?.roles.cache.filter((role) => {
    return role.name.includes("g: ");
  });
  return [...gameRoles.values()];
};

export const convertCharToEmoji = (char: string) =>
  String.fromCodePoint((char.codePointAt(0) as number) - 65 + 0x1f1e6);

export const getAutoRoleChannel = async (
  guild: Guild | undefined
): Promise<TextChannel> => {
  const mainCategory = await findMainCategory(guild);
  const dbAutoRoleChannel = await findAutoRoleDbChannel();
  if (dbAutoRoleChannel) {
    try {
      return (await guild?.channels.fetch(
        dbAutoRoleChannel.channelId
      )) as TextChannel;
    } catch (error) {
      await GamingChannelModel.findOneAndDelete({ role: "autorole" });
    }
  }
  let autoRoleChannel = await mainCategory.createChannel(
    AUTO_ROLE_CHANNEL_NAME,
    {
      type: "GUILD_TEXT",
      topic: AUTO_ROLE_DESCRIPTION,
      position: 1,
      permissionOverwrites: [
        {
          id: guild?.roles.everyone.id as string,
          deny: [
            Permissions.FLAGS.ADD_REACTIONS,
            Permissions.FLAGS.SEND_MESSAGES,
          ],
        },
      ],
    }
  );
  await GamingChannelModel.create({
    channelId: autoRoleChannel?.id,
    hasChanged: false,
    creator: "bot",
    role: "autorole",
  });
  return autoRoleChannel;
};
