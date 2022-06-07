"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const Message_1 = require("../../models/Message");
const Role_1 = require("../../models/Role");
const util_1 = require("../../util");
const constants_1 = require("../../util/constants");
let AUTO_ROL_CHANNEL = undefined;
const init = async (client) => {
    console.log(chalk_1.default.yellowBright('Module AutoRol initiated'));
    // When the bot is ready and starts
    client.on('ready', async () => {
        const guild = (0, util_1.findServer)(client);
        AUTO_ROL_CHANNEL = await getAutoRolChannel(guild);
        await onReady(guild);
    });
    // Everytime a member reacts to a message
    client.on('messageReactionAdd', async (reaction, user) => {
        const guild = (0, util_1.findServer)(client);
        if (user.id !== constants_1.BOT_ID) {
            let dbMessage = await Message_1.MessageModel.findOne({
                messageId: reaction.message.id,
            });
            if (dbMessage) {
                let dbRole = dbMessage.roles.find((role) => role.emoji === reaction.emoji.name);
                let roleToAdd = await findRoleByDbRol(guild, dbRole);
                let guildUser = guild?.members.cache.get(user.id);
                guildUser?.roles.add(roleToAdd);
            }
        }
    });
    client.on('messageReactionRemove', async (reaction, user) => {
        const guild = (0, util_1.findServer)(client);
        if (user.id !== constants_1.BOT_ID) {
            let dbMessage = await Message_1.MessageModel.findOne({
                messageId: reaction.message.id,
            });
            if (dbMessage) {
                let dbRole = dbMessage.roles.find((role) => role.emoji === reaction.emoji.name);
                let roleToRemove = await findRoleByDbRol(guild, dbRole);
                let guildUser = guild?.members.cache.get(user.id);
                guildUser?.roles.remove(roleToRemove);
            }
        }
    });
    client.on('roleUpdate', async (previous, current) => {
        if (current.name.includes('g: ') && current.name !== previous.name) {
            console.log('A videogame role was updated/created');
            editExistingRole(current, current.guild);
        }
    });
    client.on('roleDelete', async (role) => {
        if (role.name.includes('g: ')) {
            console.log('A videogame role was deleted');
            const guild = (0, util_1.findServer)(client);
            await onReady(guild);
        }
    });
};
exports.default = {
    init,
};
const getGuildGameRoles = (guild) => {
    let gameRoles = guild?.roles.cache.filter((role) => {
        return role.name.includes('g: ');
    });
    return gameRoles.array();
};
const createRolesByDiscordRoles = (roles) => {
    return roles?.map((role, idx) => {
        return new Role_1.RoleModel({
            name: role.name.substring(2),
            roleId: role.id,
            emoji: convertCharToEmoji(constants_1.ROLES_ORDER[idx % 20]),
            role: idx,
        });
    });
};
const createRoleByDiscordRole = async (role) => {
    let availableMessage = (await findAvailableMessage(role.guild));
    let idx = availableMessage.roles.length;
    return new Role_1.RoleModel({
        name: role.name.substring(2),
        roleId: role.id,
        emoji: convertCharToEmoji(constants_1.ROLES_ORDER[idx]),
        order: idx,
    });
};
const findRoleByDbRol = async (guild, dbRole) => {
    return guild?.roles.cache.get(dbRole.roleId);
};
const convertCharToEmoji = (char) => String.fromCodePoint(char.codePointAt(0) - 65 + 0x1f1e6);
const createNewEmptyMessage = async (guild) => {
    let channel = await getAutoRolChannel(guild);
    let newMessage = new discord_js_1.MessageEmbed().setTitle(`${constants_1.AUTO_ROL_DESCRIPTION}`).setColor('DARK_GOLD');
    return await channel?.send(newMessage);
};
const findAvailableMessage = async (guild) => {
    let message = await Message_1.MessageModel.findOne({ isFull: false });
    if (message) {
        return message;
    }
    let lastMessage = (await Message_1.MessageModel.find({})).pop();
    let lastIdx = 0;
    if (lastMessage) {
        lastIdx = lastMessage.order + 1;
    }
    let createdMessage = await createNewEmptyMessage(guild);
    return await Message_1.MessageModel.create({
        order: lastIdx,
        roles: [],
        isFull: false,
        messageId: createdMessage?.id,
    });
};
const editExistingRole = async (role, guild) => {
    let messages = await Message_1.MessageModel.find({});
    let existingIdx = -1;
    let existingMessage = null;
    let channel = await getAutoRolChannel(guild);
    for (const message of messages) {
        existingIdx = message.roles.findIndex((ob) => ob.roleId === role.id);
        if (existingIdx !== -1) {
            existingMessage = message;
            break;
        }
    }
    if (existingIdx !== -1 && existingMessage) {
        let discordMessage = await channel?.messages.fetch(existingMessage.messageId);
        let newRoles = existingMessage.roles.map((current) => current.roleId !== role.id
            ? current
            : new Role_1.RoleModel({
                name: role.name.substring(2),
                roleId: current.id,
                emoji: current.emoji,
                order: current.order,
            }));
        await Message_1.MessageModel.findByIdAndUpdate({ id: existingMessage?.id }, { roles: newRoles });
        createRoleMessage(channel, newRoles, discordMessage);
    }
    else {
        addRoleToAvailableMessage(role, guild);
    }
};
const addRoleToAvailableMessage = async (role, guild) => {
    const channel = await getAutoRolChannel(guild);
    const availableMessage = await findAvailableMessage(guild);
    const dbRole = await createRoleByDiscordRole(role);
    if (availableMessage && channel) {
        const newRoles = [...availableMessage.roles, dbRole];
        const currentMessage = await channel.messages.fetch(availableMessage.messageId);
        await availableMessage.updateOne({
            roles: newRoles,
            isFull: availableMessage.roles.length + 1 === 20,
        });
        createRoleMessage(channel, newRoles, currentMessage);
    }
};
const createRoleMessage = async (channel, roles, message) => {
    let newMessage = new discord_js_1.MessageEmbed().setTitle(`${constants_1.AUTO_ROL_DESCRIPTION}`).setColor('DARK_GOLD');
    for (const role of roles) {
        newMessage.setDescription(`${newMessage.description || ''}${role.emoji} - ${role.name}\n\n`);
    }
    if (message) {
        let roleToAdd = verifyMessageReactions(message, roles);
        if (roleToAdd) {
            await message.react(roleToAdd.emoji);
        }
        return await message.edit(newMessage);
    }
    let createdMessage = await channel?.send(newMessage);
    if (createdMessage) {
        for (const role of roles) {
            createdMessage.react(role.emoji);
        }
    }
    return createdMessage;
};
const verifyMessageReactions = (message, roles) => {
    let doesReactionExist = false;
    for (const role of roles) {
        console.log(role.name);
        doesReactionExist = message.reactions.cache.some((reaction) => reaction.emoji.name === role.emoji);
        if (!doesReactionExist) {
            return role;
        }
    }
};
const onReady = async (guild) => {
    if (guild) {
        const autoRolChannel = await getAutoRolChannel(guild);
        const gameRoles = getGuildGameRoles(guild);
        const roles = createRolesByDiscordRoles(gameRoles);
        if (roles.length) {
            await (0, util_1.deleteOldMessagesFromChannel)(autoRolChannel);
            let j = 0;
            for (let i = 1; i <= Math.ceil(roles.length / 20); i++) {
                let rolesToAdd = [];
                for (j; j < roles.length; j++) {
                    rolesToAdd = [...rolesToAdd, roles[j]];
                    if (20 * i - 1 === j) {
                        j++;
                        break;
                    }
                }
                const message = await createRoleMessage(autoRolChannel, rolesToAdd);
                await Message_1.MessageModel.create({
                    order: i,
                    messageId: message?.id,
                    roles: rolesToAdd,
                    isFull: rolesToAdd.length === 20,
                });
            }
        }
    }
};
const getAutoRolChannel = async (guild) => {
    const botCategory = (0, util_1.findBotCategory)(guild);
    let name = '🤖︱auto-service';
    let textChannel = (0, util_1.isTextChannelAlreadyCreated)(guild, name);
    if (textChannel) {
        return textChannel;
    }
    return await guild?.channels.create(name, {
        parent: botCategory,
        position: 0,
        type: 'text',
        topic: constants_1.AUTO_ROL_DESCRIPTION,
    });
};
