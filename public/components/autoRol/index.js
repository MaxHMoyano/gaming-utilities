"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const util_1 = require("../../util");
const roles_json_1 = __importDefault(require("./roles.json"));
const init = async (client) => {
    console.log('AutoRol Init');
    let rolMessage;
    let roles = roles_json_1.default;
    // When the bot is ready and starts
    client.on('ready', async () => {
        const server = util_1.findServer(client);
        roles = populateRoleIds(server, roles);
        rolMessage = await onReady(client, roles);
    });
    // Everytime a member reacts to a message
    client.on('messageReactionAdd', async (reaction, user) => {
        const server = util_1.findServer(client);
        if (reaction.message === rolMessage && user.id !== '720067757412188181') {
            let roleIdToAdd = roles.find((role) => role.icon === reaction.emoji.name)?.id;
            let guildUser = server?.members.cache.get(user.id);
            let roleToAdd = server?.roles.cache.get(roleIdToAdd);
            guildUser?.roles.add(roleToAdd);
        }
    });
    // Everytime a member reacts to a message
    client.on('messageReactionRemove', async (reaction, user) => {
        const server = util_1.findServer(client);
        if (reaction.message === rolMessage && user.id !== '720067757412188181') {
            let roleIdToAdd = roles.find((role) => role.icon === reaction.emoji.name)?.id;
            let guildUser = server?.members.cache.get(user.id);
            let roleToAdd = server?.roles.cache.get(roleIdToAdd);
            guildUser?.roles.remove(roleToAdd);
        }
    });
    // Everytime a member updates their rich presence
    client.on('presenceUpdate', () => { });
    // client.on('error', (err) => {});
};
exports.default = {
    init,
};
const onReady = async (client, roles) => {
    const server = util_1.findServer(client);
    const botCategory = util_1.findBotCategory(server);
    let name = 'elegi-tu-rol';
    let description = 'Queres ser notificado cuando el server juega a algo? Decinos que jugas!';
    let textChannel = util_1.isTextChannelAlreadyCreated(server, name);
    let autoRolChannel;
    if (textChannel) {
        autoRolChannel = textChannel;
    }
    else {
        autoRolChannel = await server?.channels.create(name, {
            parent: botCategory,
            position: 0,
            type: 'text',
            topic: description,
        });
    }
    let message = new discord_js_1.MessageEmbed()
        .setTitle(`${description}\n\nReacciona para obtener el rol!\n\n\n`)
        .setColor('DARK_GOLD')
        .setDescription(`${roles.reduce(getMessageFromRoles, '')}`);
    util_1.deleteOldMessagesFromChannel(autoRolChannel);
    const rolMessage = await autoRolChannel?.send(message);
    createReactions(rolMessage, server, roles);
    return rolMessage;
};
const getMessageFromRoles = (acc, current) => {
    return `${acc}-${current.name}\n`;
};
const createReactions = (message, server, roles) => {
    roles.forEach((role) => {
        let icon = util_1.getEmojiByName(server, role.icon);
        if (icon) {
            message?.react(icon?.id);
        }
    });
};
const populateRoleIds = (server, roles) => {
    return roles.map((role) => {
        let guildRole = server?.roles.cache.find((e) => e.name === role.displayName);
        return {
            ...role,
            id: guildRole?.id,
        };
    });
};
