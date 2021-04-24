require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.TOKEN);
let voiceCategory;
let createPartyChannel;
let videogamesBeingPlayed = []; // list of videogames which will be added

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  voiceCategory = client.channels.cache.find((channel) => {
    // Encuentro la categoria de voz
    return channel.id === '377818324559593486';
  });
  createPartyChannel = await voiceCategory.guild.channels.create('Crear Party', {
    type: 'voice',
    userLimit: 1,
    parent: voiceCategory,
  });
});

client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.channel.id === createPartyChannel.id) {
    //User enters crear party
    let videogames = newState.member.presence.activities.filter(
      (activity) => activity.type === 'PLAYING',
    );
    let channelName = videogames.length
      ? videogames[0].name
      : `〔🔊〕Nueva Party de ${newState.member.nickname}`;
    let newChannel = await newState.guild.channels.create(channelName, {
      type: 'voice',
      parent: voiceCategory,
    });
    newState.member.voice.setChannel(newChannel);
    videogamesBeingPlayed.push(newChannel);
  }

  // User se va de un canal creado
  let createdChannel = videogamesBeingPlayed.find((e) => e.id === oldState.channel.id);
  if (createdChannel && createdChannel.members.toJSON().length === 0) {
    createdChannel.delete();
    videogamesBeingPlayed = videogamesBeingPlayed.filter((e) => e.id !== createdChannel.id);
  }
});
