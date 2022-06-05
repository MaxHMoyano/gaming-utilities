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
let IS_MESSAGE_STILL_REACTING = false;
const init = async (client) => {
    console.log(chalk_1.default.yellowBright('Module AutoRol initiated'));
    // When the bot is ready and starts
    client.on('ready', async () => {
        const guild = (0, util_1.findServer)(client);
        await initGameRoles(guild);
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
    client.on('roleCreate', async (role) => {
        if (role.name.includes('g: ')) {
            console.log('A videogame role was updated/created');
            const guild = (0, util_1.findServer)(client);
            while (IS_MESSAGE_STILL_REACTING === false) {
                await initGameRoles(guild);
            }
        }
    });
    client.on('roleUpdate', async (previous, current) => {
        if (current.name.includes('g: ') && current.name !== previous.name) {
            console.log('A videogame role was updated/created');
            const guild = (0, util_1.findServer)(client);
            while (IS_MESSAGE_STILL_REACTING === false) {
                await initGameRoles(guild);
            }
        }
    });
    client.on('roleDelete', async (role) => {
        if (role.name.includes('g: ')) {
            console.log('A videogame role was deleted');
            const guild = (0, util_1.findServer)(client);
            while (IS_MESSAGE_STILL_REACTING === false) {
                await initGameRoles(guild);
            }
        }
    });
};
exports.default = {
    init,
};
const initGameRoles = async (guild) => {
    if (guild) {
        let clientGameRoles = await getClientGameRoles(guild);
        await createDbRoles(clientGameRoles);
        await onReady(guild);
    }
};
const getClientGameRoles = async (guild) => {
    let gameRoles = guild?.roles.cache.filter((role) => {
        return role.name.includes('g: ');
    });
    console.log(gameRoles.size);
    return gameRoles.array();
};
const createDbRoles = async (roles) => {
    let emojiIdx = 0;
    let dbRoles = roles?.map((role, idx) => {
        if (idx % 20 === 0) {
            emojiIdx = 0;
        }
        return {
            name: role.name.substring(2),
            roleId: role.id,
            emoji: String.fromCodePoint(constants_1.ROLES_ORDER[emojiIdx++].codePointAt(0) - 65 + 0x1f1e6),
            order: idx,
        };
    });
    await Role_1.RoleModel.deleteMany({});
    await Role_1.RoleModel.create(dbRoles);
};
const getDbRoles = async () => {
    return await Role_1.RoleModel.find({}).sort({ order: 1 });
};
const findRoleByDbRol = async (guild, dbRole) => {
    return guild?.roles.cache.get(dbRole.roleId);
};
const onReady = async (client) => {
    IS_MESSAGE_STILL_REACTING = true;
    const autoRolChannel = await getAutoRolChannel(client, constants_1.AUTO_ROL_DESCRIPTION);
    const roles = await getDbRoles();
    if (roles.length) {
        await (0, util_1.deleteOldMessagesFromChannel)(autoRolChannel);
        let j = 0;
        let sliceStart = 0;
        for (let i = 1; i <= Math.ceil(roles.length / 20); i++) {
            let message = new discord_js_1.MessageEmbed().setTitle(`${constants_1.AUTO_ROL_DESCRIPTION}`).setColor('DARK_GOLD');
            for (j; j < roles.length; j++) {
                message.setDescription(`${message.description ? message.description : ''}${roles[j].emoji} ${roles[j].name}\n\n`);
                if (20 * i - 1 === j) {
                    break;
                }
            }
            const rolMessage = await autoRolChannel?.send(message);
            await Message_1.MessageModel.create({
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
const getAutoRolChannel = async (server, description) => {
    const botCategory = (0, util_1.findBotCategory)(server);
    let name = '🤖︱auto-service';
    let textChannel = (0, util_1.isTextChannelAlreadyCreated)(server, name);
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
const getMessageFromRoles = (acc, current) => {
    return `${acc}${current.emoji} ${current.name}\n\n`;
};
const createReactions = async (message, roles) => {
    for (const role of roles) {
        try {
            await message?.react(role.emoji);
        }
        catch (error) {
            console.error('Discord message dissapeared');
        }
    }
    IS_MESSAGE_STILL_REACTING = false;
};
