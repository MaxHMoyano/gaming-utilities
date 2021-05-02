import { Client, GuildChannel } from 'discord.js';
import { findServer, findVoiceCategory } from '../../util';
const readyEvent = async (
  client: Client,
  voiceCategory: GuildChannel | undefined,
  createPartyChannel: GuildChannel | undefined,
) => {
  let server = findServer(client);
  voiceCategory = findVoiceCategory(server);

  let isChannelAlreadyCreated = voiceCategory?.guild.channels.cache.find(
    (channel) => channel.name === '🤖︱Crear Party',
  );

  if (!isChannelAlreadyCreated) {
    createPartyChannel = await voiceCategory?.guild.channels.create('🤖︱Crear Party', {
      type: 'voice',
      userLimit: 1,
      parent: voiceCategory,
      position: 2,
    });
  } else {
    createPartyChannel = isChannelAlreadyCreated;
  }

  return [voiceCategory, createPartyChannel];
};

export default readyEvent;
