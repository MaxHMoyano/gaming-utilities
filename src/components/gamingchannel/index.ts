import { Client, GuildChannel } from 'discord.js';
import readyEvent from './readyEvent';
import voiceUpdateEvent from './voiceUpdateEvent';
import presenceUpdateEvent from './presenceUpdateEvent';

const init = async (client: Client) => {
  let voiceCategory: GuildChannel | undefined;
  let createPartyChannel: GuildChannel | undefined;
  let createdChannels: GuildChannel[] = [];
  console.log('GamingChannel Init');

  // When the bot is ready and starts
  client.on('ready', async () => {
    [voiceCategory, createPartyChannel] = await readyEvent(
      client,
      voiceCategory,
      createPartyChannel,
    );
  });

  // Everytime a member changes from channel to channel
  client.on('voiceStateUpdate', async (oldState, newState) => {
    createdChannels = await voiceUpdateEvent(
      oldState,
      newState,
      voiceCategory,
      createPartyChannel,
      createdChannels,
    );
  });

  // Everytime a member updates their rich presence
  client.on('presenceUpdate', (oldPresence) => {
    presenceUpdateEvent(oldPresence, createdChannels);
  });

  client.on('error', (err) => {});
};

export default {
  init,
};
