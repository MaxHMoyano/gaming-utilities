import chalk from 'chalk';
import {
  Client,
  Message,
  MessageEmbed,
  TextChannel,
  Guild,
  Role,
  MessageReaction,
} from 'discord.js';
import { BotRol } from '../../models';
import Rol, { IRol } from '../../models/Rol';
import {
  findBotCategory,
  findServer,
  isTextChannelAlreadyCreated,
  deleteOldMessagesFromChannel,
  getEmojiByName,
} from '../../util';

const init = async (client: Client) => {
  console.log(chalk.yellowBright('Module AutoRol initiated'));
  let rolMessage: Message | undefined;
  // When the bot is ready and starts
  client.on('ready', async () => {
    const server = findServer(client);
    rolMessage = await onReady(server);
  });

  // Everytime a member reacts to a message
  client.on('messageReactionAdd', async (reaction, user) => {
    const server = findServer(client);
    if (reaction.message === rolMessage && user.id !== '720067757412188181') {
      let guildUser = server?.members.cache.get(user.id);
      let roleToAdd = await findRoleByReaction(server, reaction);
      if (roleToAdd) {
        console.log(
          chalk.greenBright(
            `Role ${roleToAdd.name} given to ${guildUser?.nickname || guildUser?.displayName}`,
          ),
        );
        guildUser?.roles.add(roleToAdd);
      }
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    const server = findServer(client);
    if (reaction.message === rolMessage && user.id !== '720067757412188181') {
      let guildUser = server?.members.cache.get(user.id);
      let roleToAdd = await findRoleByReaction(server, reaction);
      if (roleToAdd) {
        console.log(
          chalk.redBright(
            `Role ${roleToAdd.name} given to ${guildUser?.nickname || guildUser?.displayName}`,
          ),
        );
        guildUser?.roles.remove(roleToAdd);
      }
    }
  });

  // TODO: Parse a message to add roles to the list if we want to.
  client.on('message', (message) => {
    if (message && message.channel.id === rolMessage?.channel.id && message.id !== rolMessage.id) {
      if (!message.content.startsWith('!addRole') || !message.content.startsWith('!aR')) {
        message.delete();
      }
    }
  });
};

export default {
  init,
};

const findRoleByReaction = async (server: Guild | undefined, reaction: MessageReaction) => {
  let dbRol = await Rol.findOne({ icon: reaction.emoji.name });
  debugger;
  if (dbRol) {
    let roleToAdd = server?.roles.cache.get(dbRol?.id);
    return roleToAdd as Role;
  }
  return null;
};

const onReady = async (server: Guild | undefined) => {
  const description = 'Queres ser notificado cuando el server juega a algo? Decinos que jugas!';
  const roles = await getRolesFromDb(server);
  const autoRolChannel = await getAutoRolChannel(server, description);

  if (roles.length) {
    let message = new MessageEmbed()
      .setTitle(`${description}\n\nReacciona para obtener el rol!\n\n\n`)
      .setColor('DARK_GOLD')
      .setDescription(`${roles.reduce(getMessageFromRoles, '')}`);
    await deleteOldMessagesFromChannel(autoRolChannel);
    const rolMessage = await autoRolChannel?.send(message);
    await createReactions(rolMessage, server, roles);
    return rolMessage;
  }
};

const getRolesFromDb = async (server: Guild | undefined) => {
  let rolesDb = await Rol.find({});
  return rolesDb.map((rol) => {
    let discordRol = server?.roles.cache.get(rol.id);
    return { ...discordRol, icon: rol.icon } as BotRol;
  });
};

const getAutoRolChannel = async (server: Guild | undefined, description: string) => {
  const botCategory = findBotCategory(server);
  let name = '🤖︱elegi-tu-rol';
  let textChannel = isTextChannelAlreadyCreated(server, name);
  if (textChannel) {
    return textChannel;
  }
  return await server?.channels.create(name, {
    parent: botCategory,
    position: 0,
    type: 'text',
    topic: description,
  });
};

const getMessageFromRoles = (acc: string, current: BotRol): string => {
  return `${acc}- ${current.name}\n`;
};

const createReactions = async (
  message: Message | undefined,
  server: Guild | undefined,
  roles: BotRol[],
) => {
  roles.forEach((role) => {
    let icon = getEmojiByName(server, role.icon);
    if (icon) {
      message?.react(icon?.id);
    }
  });
  return;
};
