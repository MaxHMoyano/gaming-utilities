import chalk from 'chalk';
import { Client, Message, MessageEmbed, TextChannel, Guild, Role } from 'discord.js';
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
      let dbRol = await Rol.findOne({ icon: reaction.emoji.name });
      let guildUser = server?.members.cache.get(user.id);
      let roleToAdd = server?.roles.cache.get(dbRol?.id);
      guildUser?.roles.add(roleToAdd as Role);
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    const server = findServer(client);
    if (reaction.message === rolMessage && user.id !== '720067757412188181') {
      let dbRol = await Rol.findOne({ icon: reaction.emoji.name });
      let guildUser = server?.members.cache.get(user.id);
      let roleToAdd = server?.roles.cache.get(dbRol?.id);
      guildUser?.roles.remove(roleToAdd as Role);
    }
  });

  // client.on('message', (message) => {
  //   if (message && message.channel.id === rolMessage?.channel.id && message.id !== rolMessage.id) {
  //     if (!message.content.startsWith('!addRole') || !message.content.startsWith('!aR')) {
  //       message.delete();
  //     }
  //     let messageParts = message.content.split(' ');
  //     messageParts.splice(0, 1);
  //     // !aR counterStrike
  //     if (messageParts.length > ) {
  //       let [name, displayName, icon] = messageParts;

  //     }
  //   }
  // });
};

export default {
  init,
};

const onReady = async (server: Guild | undefined) => {
  const botCategory = findBotCategory(server);
  const roles = await Rol.find({});
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

const getMessageFromRoles = (acc: string, current: IRol): string => {
  return `${acc}-${current.name}\n`;
};

const createReactions = (
  message: Message | undefined,
  server: Guild | undefined,
  roles: IRol[],
) => {
  roles.forEach((role) => {
    let icon = getEmojiByName(server, role.icon);
    if (icon) {
      message?.react(icon?.id);
    }
  });
};
