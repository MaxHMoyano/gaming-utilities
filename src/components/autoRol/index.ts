import chalk from 'chalk';
import { Client, Message, MessageEmbed, Guild, Role as DiscordRole } from 'discord.js';
import { toNamespacedPath } from 'path';
import { IMessage, MessageModel } from '../../models/Message';
import { IRole, RoleModel } from '../../models/Role';
import {
  findBotCategory,
  findServer,
  isTextChannelAlreadyCreated,
  deleteOldMessagesFromChannel,
} from '../../util';
import { AUTO_ROL_DESCRIPTION, BOT_ID, GAMING_ROLE_REGEX, ROLES_ORDER } from '../../util/constants';

let IS_MESSAGE_STILL_REACTING = false;

const init = async (client: Client) => {
  console.log(chalk.yellowBright('Module AutoRol initiated'));
  // When the bot is ready and starts
  client.on('ready', async () => {
    const guild = findServer(client);
    await initGameRoles(guild);
  });

  // Everytime a member reacts to a message
  client.on('messageReactionAdd', async (reaction, user) => {
    const guild = findServer(client);
    if (user.id !== BOT_ID) {
      let dbMessage: IMessage | null = await MessageModel.findOne({
        messageId: reaction.message.id,
      });
      if (dbMessage) {
        let dbRole = dbMessage.roles.find((role) => role.emoji === reaction.emoji.name);
        let roleToAdd = await findRoleByDbRol(guild, dbRole as IRole);
        let guildUser = guild?.members.cache.get(user.id);
        guildUser?.roles.add(roleToAdd as DiscordRole);
      }
    }
  });

  client.on('messageReactionRemove', async (reaction, user) => {
    const guild = findServer(client);
    if (user.id !== BOT_ID) {
      let dbMessage: IMessage | null = await MessageModel.findOne({
        messageId: reaction.message.id,
      });
      if (dbMessage) {
        let dbRole = dbMessage.roles.find((role) => role.emoji === reaction.emoji.name);
        let roleToRemove = await findRoleByDbRol(guild, dbRole as IRole);
        let guildUser = guild?.members.cache.get(user.id);
        guildUser?.roles.remove(roleToRemove as DiscordRole);
      }
    }
  });

  client.on('roleCreate', async (role) => {
    if (role.name.includes('g: ')) {
      console.log('A videogame role was updated/created');
      const guild = findServer(client);
      while (IS_MESSAGE_STILL_REACTING === false) {
        await initGameRoles(guild);
      }
    }
  });
  client.on('roleUpdate', async (previous, current) => {
    if (current.name.includes('g: ') && current.name !== previous.name) {
      console.log('A videogame role was updated/created');
      const guild = findServer(client);
      while (IS_MESSAGE_STILL_REACTING === false) {
        await initGameRoles(guild);
      }
    }
  });
  client.on('roleDelete', async (role) => {
    if (role.name.includes('g: ')) {
      console.log('A videogame role was deleted');
      const guild = findServer(client);
      while (IS_MESSAGE_STILL_REACTING === false) {
        await initGameRoles(guild);
      }
    }
  });
};

export default {
  init,
};

const initGameRoles = async (guild: Guild | undefined) => {
  if (guild) {
    let clientGameRoles = await getClientGameRoles(guild);
    await createDbRoles(clientGameRoles);
    await onReady(guild);
  }
};

const getClientGameRoles = async (guild: Guild) => {
  let gameRoles = guild?.roles.cache.filter((role) => {
    return role.name.includes('g: ');
  });
  console.log(gameRoles.size);
  return gameRoles.array();
};

const createDbRoles = async (roles: DiscordRole[]) => {
  let emojiIdx = 0;
  let dbRoles = roles?.map((role, idx) => {
    if (idx % 20 === 0) {
      emojiIdx = 0;
    }
    return {
      name: role.name.substring(2),
      roleId: role.id,
      emoji: String.fromCodePoint(
        (ROLES_ORDER[emojiIdx++].codePointAt(0) as number) - 65 + 0x1f1e6,
      ),
      order: idx,
    };
  });
  await RoleModel.deleteMany({});
  await RoleModel.create(dbRoles);
};

const getDbRoles = async () => {
  return await RoleModel.find({}).sort({ order: 1 });
};

const findRoleByDbRol = async (guild: Guild | undefined, dbRole: IRole) => {
  return guild?.roles.cache.get(dbRole.roleId);
};

const onReady = async (client: Guild | undefined) => {
  IS_MESSAGE_STILL_REACTING = true;
  const autoRolChannel = await getAutoRolChannel(client, AUTO_ROL_DESCRIPTION);
  const roles = await getDbRoles();
  if (roles.length) {
    await deleteOldMessagesFromChannel(autoRolChannel);
    let j = 0;
    let sliceStart = 0;
    for (let i = 1; i <= Math.ceil(roles.length / 20); i++) {
      let message = new MessageEmbed().setTitle(`${AUTO_ROL_DESCRIPTION}`).setColor('DARK_GOLD');
      for (j; j < roles.length; j++) {
        message.setDescription(
          `${message.description ? message.description : ''}${roles[j].emoji} ${roles[j].name}\n\n`,
        );
        if (20 * i - 1 === j) {
          break;
        }
      }
      const rolMessage = await autoRolChannel?.send(message);
      await MessageModel.create({
        order: i,
        messageId: rolMessage?.id,
        roles: roles.slice(sliceStart, j + 1),
      });
      await createReactions(rolMessage, roles.slice(sliceStart, j + 1));
      if (20 * i - 1 === j) {
        sliceStart = ++j;
      }
    }
  }
};

const getAutoRolChannel = async (server: Guild | undefined, description: string) => {
  const botCategory = findBotCategory(server);
  let name = '🤖︱auto-service';
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

const getMessageFromRoles = (acc: string, current: IRole): string => {
  return `${acc}${current.emoji} ${current.name}\n\n`;
};

const createReactions = async (message: Message | undefined, roles: IRole[]) => {
  for (const role of roles) {
    try {
      await message?.react(role.emoji);
    } catch (error) {
      console.error('Discord message dissapeared');
    }
  }
  IS_MESSAGE_STILL_REACTING = false;
};
