import {
  Client,
  Message,
  MessageEmbed,
  Guild,
  Role,
  TextChannel,
} from "discord.js";
import { IMessage, MessageModel } from "../../models/Message";
import { IRole, RoleModel } from "../../models/Role";
import {
  findGuildByClient,
  convertCharToEmoji,
  getAutoRoleChannel,
} from "../../util";
import { AUTO_ROLE_DESCRIPTION, ROLES_ORDER } from "../../util/constants";
import { onReaction } from "./messageReactionEvent";
import { onReady } from "./readyEvent";

const init = async (client: Client) => {
  // When the bot is ready and starts
  client.on("ready", async () => {
    const guild = findGuildByClient(client);
    await onReady(guild);
    console.log("AutoRole module initiated");
  });

  // Everytime a member reacts to a message
  client.on("messageReactionAdd", async (reaction, user) => {
    onReaction(reaction, user, client);
  });

  client.on("messageReactionRemove", async (reaction, user) => {
    onReaction(reaction, user, client, "remove");
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

const createNewEmptyMessage = async (guild: Guild) => {
  let channel = await getAutoRoleChannel(guild);
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
  let channel = await getAutoRoleChannel(guild);
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
  const channel = await getAutoRoleChannel(guild);
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

export const createRoleMessage = async (
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
      await createdMessage.react(role.emoji);
    }
  }
  return createdMessage;
};

const verifyMessageReactions = (
  message: Message,
  roles: IRole[]
): IRole | null => {
  let doesReactionExist = false;
  for (const role of roles) {
    doesReactionExist = message.reactions.cache.some(
      (reaction) => reaction.emoji.name === role.emoji
    );
    if (!doesReactionExist) {
      return role;
    }
  }
  return null;
};
