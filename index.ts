// TODO: Make the channel name of the majority of players. Not just the last one
// TODO: function to check a server name by counting people playing

import * as dotenv from 'dotenv';
import * as Discord from 'discord.js';
const client = new Discord.Client();
import { Videogame } from './interfaces';
dotenv.config();

client.login(process.env.TOKEN);
let voiceCategory: Discord.GuildChannel | undefined;
let createPartyChannel: Discord.GuildChannel | undefined;
let createdChannels: Discord.GuildChannel[] = [];

const checkChannelName = (channel?: Discord.GuildChannel | null): void => {
  let activities: Discord.Activity[] = [];
  let videogames: Videogame[] = [];
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
    let videogameMostPlayed = checkVideogameCount(videogames);
    channel?.edit({ name: videogameMostPlayed.name });
  }
};

const checkVideogameCount = (videogames: Videogame[]) => {
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

client.on('ready', async () => {
  console.log(`Logged in`);

  let server = client.guilds.cache.first();
  voiceCategory = server?.channels.cache.find((channel) => {
    return channel.id === '377818324559593486';
  });
  let isChannelAlreadyCreated = voiceCategory?.guild.channels.cache.find(
    (channel) => channel.name === '〔🤖〕Crear Party',
  );

  if (!isChannelAlreadyCreated) {
    createPartyChannel = await voiceCategory?.guild.channels.create('〔🤖〕Crear Party', {
      type: 'voice',
      userLimit: 1,
      parent: voiceCategory,
      position: 2,
    });
  } else {
    createPartyChannel = isChannelAlreadyCreated;
  }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.channel && newState.channel.id === createPartyChannel?.id) {
    //User enters crear party
    let videogames = newState.member?.presence.activities.filter(
      (activity) => activity.type === 'PLAYING',
    );
    let channelName = videogames?.length
      ? videogames[0].name
      : `〔🔊〕Party de ${newState.member?.nickname || newState.member?.displayName}`;
    let newChannel = await newState.guild.channels.create(channelName, {
      type: 'voice',
      parent: voiceCategory,
      position: 2,
    });
    newState.member?.voice.setChannel(newChannel);
    createdChannels.push(newChannel);
  }

  // User se va de un canal creado
  if (oldState.channel) {
    let channel = createdChannels.find((e) => e.id === oldState.channel?.id);
    if (channel && channel.members.array().length === 0) {
      channel.delete();
      createdChannels = createdChannels.filter((e) => e.id !== channel?.id);
    }
  }
});

client.on('presenceUpdate', (oldPresence) => {
  if (oldPresence) {
    let member = oldPresence.member;
    let memberInCreatedChannel: Discord.GuildMember | undefined;
    let channelToBeChanged: Discord.GuildChannel | null = null;
    if (member) {
      createdChannels.forEach((channel) => {
        memberInCreatedChannel = channel.members.array().find((e) => e.id === member?.id);
        if (memberInCreatedChannel) {
          channelToBeChanged = channel;
        }
      });
      if (memberInCreatedChannel) {
        checkChannelName(channelToBeChanged);
      }
    }
  }
});
