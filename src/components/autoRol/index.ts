import {
  Client,
  Message,
  MessageEmbed,
  Guild,
  Role as DiscordRole,
  Role,
  TextChannel,
} from "discord.js";
import { GamingChannelModel } from "../../models/GamingChannel";
import { IMessage, MessageModel } from "../../models/Message";
import { IRole, RoleModel } from "../../models/Role";
import {
  findMainCategory,
  findGuildByClient,
  deleteOldMessagesFromChannel,
  findAutoRoleChannel,
} from "../../util";
import {
  AUTO_ROLE_CHANNEL_NAME,
  AUTO_ROLE_DESCRIPTION,
  BOT_ID,
  ROLES_ORDER,
} from "../../util/constants";

const init = async (client: Client) => {
  // When the bot is ready and starts
  client.on("ready", async () => {
    const guild = findGuildByClient(client);
    await onReady(guild);
    console.log("AutoRole module initiated");
  });

  // Everytime a member reacts to a message
  client.on("messageReactionAdd", async (reaction, user) => {
    const guild = findGuildByClient(client);
    if (user.id !== BOT_ID) {
      let dbMessage: IMessage | null = await MessageModel.findOne({
        messageId: reaction.message.id,
      });
      if (dbMessage) {
        let dbRole = dbMessage.roles.find(
          (role) => role.emoji === reaction.emoji.name
        );
        let roleToAdd = await findRoleByDbRol(guild, dbRole as IRole);
        let guildUser = guild?.members.cache.get(user.id);
        guildUser?.roles.add(roleToAdd as DiscordRole);
      }
    }
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    const guild = findGuildByClient(client);
    if (user.id !== BOT_ID) {
      let dbMessage: IMessage | null = await MessageModel.findOne({
        messageId: reaction.message.id,
      });
      if (dbMessage) {
        let dbRole = dbMessage.roles.find(
          (role) => role.emoji === reaction.emoji.name
        );
        let roleToRemove = await findRoleByDbRol(guild, dbRole as IRole);
        let guildUser = guild?.members.cache.get(user.id);
        guildUser?.roles.remove(roleToRemove as DiscordRole);
      }
    }
  });

  client.on("roleUpdate", async (previous, current) => {
    if (current.name.includes("g: ") && current.name !== previous.name) {
      editExistingRole(current, current.guild);
    }
  });
  client.on("roleDelete", async (role) => {
    if (role.name.includes("g: ")) {
      const guild = findGuildByClient(client);
      await onReady(guild);
    }
  });
};

export default {
  init,
};

const getGuildGameRoles = (guild: Guild) => {
  let gameRoles = guild?.roles.cache.filter((role) => {
    return role.name.includes("g: ");
  });
  return [...gameRoles.values()];
};

const createRolesByDiscordRoles = (roles: DiscordRole[]): IRole[] => {
  return roles?.map((role, idx) => {
    return new RoleModel({
      name: role.name.substring(2),
      roleId: role.id,
      emoji: convertCharToEmoji(ROLES_ORDER[idx % 20]),
      role: idx,
    });
  });
};
const createRoleByDiscordRole = async (role: Role): Promise<IRole> => {
  let availableMessage = (await findAvailableMessage(role.guild)) as IMessage;
  let idx = availableMessage.roles.length;
  return new RoleModel({
    name: role.name.substring(2),
    roleId: role.id,
    emoji: convertCharToEmoji(ROLES_ORDER[idx]),
    order: idx,
  });
};

const findRoleByDbRol = async (guild: Guild | undefined, dbRole: IRole) => {
  return guild?.roles.cache.get(dbRole.roleId);
};

const convertCharToEmoji = (char: string) =>
  String.fromCodePoint((char.codePointAt(0) as number) - 65 + 0x1f1e6);

const createNewEmptyMessage = async (guild: Guild) => {
  let channel = await getAutoRolChannel(guild);
  let newMessage = new MessageEmbed()
    .setTitle(`${AUTO_ROLE_DESCRIPTION}`)
    .setColor("DARK_GOLD");
  return await channel?.send({ embeds: [newMessage] });
};

const findAvailableMessage = async (guild: Guild) => {
  let message = await MessageModel.findOne({ isFull: false });
  if (message) {
    return message;
  }
  let lastMessage = (await MessageModel.find({})).pop();
  let lastIdx = 0;
  if (lastMessage) {
    lastIdx = lastMessage.order + 1;
  }
  let createdMessage = await createNewEmptyMessage(guild);
  return await MessageModel.create({
    order: lastIdx,
    roles: [],
    isFull: false,
    messageId: createdMessage?.id,
  });
};

const editExistingRole = async (role: Role, guild: Guild) => {
  let messages = await MessageModel.find({});
  let existingIdx = -1;
  let existingMessage: IMessage | null = null;
  let channel = await getAutoRolChannel(guild);
  for (const message of messages) {
    existingIdx = message.roles.findIndex((ob) => ob.roleId === role.id);
    if (existingIdx !== -1) {
      existingMessage = message;
      break;
    }
  }
  if (existingIdx !== -1 && existingMessage) {
    let discordMessage = await channel?.messages.fetch(
      existingMessage.messageId
    );
    let newRoles: IRole[] = existingMessage.roles.map((current) =>
      current.roleId !== role.id
        ? current
        : new RoleModel({
            name: role.name.substring(2),
            roleId: current.id,
            emoji: current.emoji,
            order: current.order,
          })
    );
    await MessageModel.findByIdAndUpdate(
      { id: existingMessage?.id },
      { roles: newRoles }
    );
    createRoleMessage(channel, newRoles, discordMessage);
  } else {
    addRoleToAvailableMessage(role, guild);
  }
};

const addRoleToAvailableMessage = async (role: Role, guild: Guild) => {
  const channel = await getAutoRolChannel(guild);
  const availableMessage = await findAvailableMessage(guild);
  const dbRole = await createRoleByDiscordRole(role);
  if (availableMessage && channel) {
    const newRoles = [...availableMessage.roles, dbRole];
    const currentMessage = await channel.messages.fetch(
      availableMessage.messageId
    );
    await availableMessage.updateOne({
      roles: newRoles,
      isFull: availableMessage.roles.length + 1 === 20,
    });
    createRoleMessage(channel, newRoles, currentMessage);
  }
};

const createRoleMessage = async (
  channel: TextChannel | undefined | null,
  roles: IRole[],
  message?: Message
) => {
  let newMessage = new MessageEmbed()
    .setTitle(`${AUTO_ROLE_DESCRIPTION}`)
    .setColor("DARK_GOLD");
  for (const role of roles) {
    newMessage.setDescription(
      `${newMessage.description || ""}${role.emoji} - ${role.name}\n\n`
    );
  }
  if (message) {
    let roleToAdd = verifyMessageReactions(message, roles);
    if (roleToAdd) {
      await message.react(roleToAdd.emoji);
    }
    return await message.edit({ embeds: [newMessage] });
  }
  let createdMessage = await channel?.send({ embeds: [newMessage] });
  if (createdMessage) {
    for (const role of roles) {
      createdMessage.react(role.emoji);
    }
  }
  return createdMessage;
};

const verifyMessageReactions = (message: Message, roles: IRole[]) => {
  let doesReactionExist = false;
  for (const role of roles) {
    doesReactionExist = message.reactions.cache.some(
      (reaction) => reaction.emoji.name === role.emoji
    );
    if (!doesReactionExist) {
      return role;
    }
  }
};

const onReady = async (guild: Guild | undefined) => {
  if (guild) {
    const autoRolChannel = await getAutoRolChannel(guild);
    const gameRoles = getGuildGameRoles(guild);
    const roles = createRolesByDiscordRoles(gameRoles);
    if (roles.length) {
      await deleteOldMessagesFromChannel(autoRolChannel);
      let j = 0;
      for (let i = 1; i <= Math.ceil(roles.length / 20); i++) {
        let rolesToAdd: IRole[] = [];
        for (j; j < roles.length; j++) {
          rolesToAdd = [...rolesToAdd, roles[j]];
          if (20 * i - 1 === j) {
            j++;
            break;
          }
        }
        const message = await createRoleMessage(autoRolChannel, rolesToAdd);
        await MessageModel.create({
          order: i,
          messageId: message?.id,
          roles: rolesToAdd,
          isFull: rolesToAdd.length === 20,
        });
      }
    }
  }
};

const getAutoRolChannel = async (
  guild: Guild | undefined
): Promise<TextChannel> => {
  const mainCategory = await findMainCategory(guild);
  const dbAutoRoleChannel = await findAutoRoleChannel();
  if (dbAutoRoleChannel) {
    return (await guild?.channels.fetch(
      dbAutoRoleChannel.channelId
    )) as TextChannel;
  }
  let autoRoleChannel = await mainCategory.createChannel(
    AUTO_ROLE_CHANNEL_NAME,
    {
      type: "GUILD_TEXT",
      topic: AUTO_ROLE_DESCRIPTION,
      position: 1,
    }
  );
  await GamingChannelModel.create({
    channelId: autoRoleChannel?.id,
    hasChanged: false,
    creator: "bot",
    role: "autorole",
  });
  return autoRoleChannel;
};
