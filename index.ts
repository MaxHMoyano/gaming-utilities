// TODO: Make the channel name of the majority of players. Not just the last one
// TODO: function to check a server name by counting people playing

import * as dotenv from 'dotenv';
import * as Discord from 'discord.js';
const client = new Discord.Client();

dotenv.config();

client.login(process.env.TOKEN);
let voiceCategory: any;
let createPartyChannel: any;
let createdChannels: any[] = [];

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(client);
  voiceCategory = client.channels.cache.find((channel) => {
    // Encuentro la categoria de voz
    return channel.id === '377818324559593486';
  });
  let isChannelAlreadyCreated = voiceCategory.guild.channels.cache.find(
    (channel) => channel.name === '〔🤖〕Crear Party',
  );

  if (!isChannelAlreadyCreated) {
    createPartyChannel = await voiceCategory.guild.channels.create('〔🤖〕Crear Party', {
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
  if (newState.channel && newState.channel.id === createPartyChannel.id) {
    //User enters crear party
    let videogames = newState.member.presence.activities.filter(
      (activity) => activity.type === 'PLAYING',
    );
    let channelName = videogames.length
      ? videogames[0].name
      : `〔🔊〕Party de ${newState.member.nickname || newState.member.displayName}`;
    let newChannel = await newState.guild.channels.create(channelName, {
      type: 'voice',
      parent: voiceCategory,
      position: 2,
    });
    newState.member.voice.setChannel(newChannel);
    createdChannels.push(newChannel);
  }

  // User se va de un canal creado
  if (oldState.channel) {
    let channel = createdChannels.find((e) => e.id === oldState.channel.id);
    if (channel && channel.members.toJSON().length === 0) {
      channel.delete();
      createdChannels = createdChannels.filter((e) => e.id !== channel.id);
    }
  }
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  if (oldPresence) {
    let member = oldPresence.member;
    let memberInCreatedChannel;
    let channelToBeChanged;
    if (member) {
      createdChannels.forEach((channel) => {
        memberInCreatedChannel = channel.members.array().find((e) => e.id === member.id);
        if (memberInCreatedChannel) {
          channelToBeChanged = channel;
        }
      });
      if (memberInCreatedChannel) {
        if (memberInCreatedChannel.presence.activities.length) {
          let videogame = memberInCreatedChannel.presence.activities.find(
            (e) => e.type === 'PLAYING',
          );
          if (videogame) {
            channelToBeChanged.edit({ name: videogame.name });
          }
        }
      }
    }
  }
});

let checkChannelName = (channel) => {};
