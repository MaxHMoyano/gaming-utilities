import { Client, GuildChannel } from 'discord.js';
import chalk from 'chalk';
import readyEvent from './readyEvent';
import voiceUpdateEvent from './voiceUpdateEvent';
import presenceUpdateEvent from './presenceUpdateEvent';

const init = async (client: Client) => {
  let voiceCategory: GuildChannel | undefined;
  let createPartyChannel: GuildChannel | undefined;
  console.log(chalk.yellowBright('Module GamingChannels initiated'));

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
    await voiceUpdateEvent(oldState, newState, voiceCategory, createPartyChannel);
  });

  // Everytime a member updates their rich presence
  client.on('presenceUpdate', (oldPresence) => {
    presenceUpdateEvent(oldPresence);
  });

  client.on('error', (err) => {});
};

export default {
  init,
};
