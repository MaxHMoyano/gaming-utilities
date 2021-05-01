import { Client, Message, MessageEmbed, TextChannel, Guild, Role } from 'discord.js';
import { PartialRole } from '../../classes/index';
import {
  findBotCategory,
  findServer,
  isTextChannelAlreadyCreated,
  deleteOldMessagesFromChannel,
  getEmojiByName,
} from '../../util';
import initialRoles from './roles.json';

const init = async (client: Client) => {
  console.log('AutoRol Init');
  let rolMessage: Message | undefined;
  let roles = initialRoles;

  // When the bot is ready and starts
  client.on('ready', async () => {
    const server = findServer(client);
    roles = populateRoleIds(server, roles);
    rolMessage = await onReady(client, roles);
  });

  // Everytime a member reacts to a message
  client.on('messageReactionAdd', async (reaction, user) => {
    const server = findServer(client);
    if (reaction.message === rolMessage && user.id !== '720067757412188181') {
      let roleIdToAdd = roles.find((role) => role.icon === reaction.emoji.name)?.id;
      let guildUser = server?.members.cache.get(user.id);
      let roleToAdd = server?.roles.cache.get(roleIdToAdd as string);
      guildUser?.roles.add(roleToAdd as Role);
    }
  });

  // Everytime a member reacts to a message
  client.on('messageReactionRemove', async (reaction, user) => {
    const server = findServer(client);
    if (reaction.message === rolMessage && user.id !== '720067757412188181') {
      let roleIdToAdd = roles.find((role) => role.icon === reaction.emoji.name)?.id;
      let guildUser = server?.members.cache.get(user.id);
      let roleToAdd = server?.roles.cache.get(roleIdToAdd as string);
      guildUser?.roles.remove(roleToAdd as Role);
    }
  });

  // Everytime a member updates their rich presence
  client.on('presenceUpdate', () => {});

  // client.on('error', (err) => {});
};

export default {
  init,
};

const onReady = async (client: Client, roles: PartialRole[]) => {
  const server = findServer(client);
  const botCategory = findBotCategory(server);
  let name = 'elegi-tu-rol';
  let description = 'Queres ser notificado cuando el server juega a algo? Decinos que jugas!';
  let textChannel = isTextChannelAlreadyCreated(server, name);
  let autoRolChannel: TextChannel | undefined;
  if (textChannel) {
    autoRolChannel = textChannel;
  } else {
    autoRolChannel = await server?.channels.create(name, {
      parent: botCategory,
      position: 0,
      type: 'text',
      topic: description,
    });
  }
  let message = new MessageEmbed()
    .setTitle(`${description}\n\nReacciona para obtener el rol!\n\n\n`)
    .setColor('DARK_GOLD')
    .setDescription(`${roles.reduce(getMessageFromRoles, '')}`);
  deleteOldMessagesFromChannel(autoRolChannel);
  const rolMessage = await autoRolChannel?.send(message);
  createReactions(rolMessage, server, roles);
  return rolMessage;
};

const getMessageFromRoles = (acc: string, current: PartialRole): string => {
  return `${acc}-${current.name}\n`;
};

const createReactions = (
  message: Message | undefined,
  server: Guild | undefined,
  roles: PartialRole[],
) => {
  roles.forEach((role) => {
    let icon = getEmojiByName(server, role.icon);
    if (icon) {
      message?.react(icon?.id);
    }
  });
};

const populateRoleIds = (server: Guild | undefined, roles: PartialRole[]) => {
  return roles.map((role) => {
    let guildRole = server?.roles.cache.find((e) => e.name === role.displayName);
    return {
      ...role,
      id: guildRole?.id as string,
    };
  });
};
