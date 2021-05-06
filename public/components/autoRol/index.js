"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const Rol_1 = __importDefault(require("../../models/Rol"));
const util_1 = require("../../util");
const init = async (client) => {
    console.log(chalk_1.default.yellowBright('Module AutoRol initiated'));
    let rolMessage;
    // When the bot is ready and starts
    client.on('ready', async () => {
        const server = util_1.findServer(client);
        rolMessage = await onReady(server);
    });
    // Everytime a member reacts to a message
    client.on('messageReactionAdd', async (reaction, user) => {
        const server = util_1.findServer(client);
        if (reaction.message === rolMessage && user.id !== '720067757412188181') {
            let guildUser = server?.members.cache.get(user.id);
            let roleToAdd = await findRoleByReaction(server, reaction);
            if (roleToAdd) {
                console.log(chalk_1.default.greenBright(`Role ${roleToAdd.name} given to ${guildUser?.nickname || guildUser?.displayName}`));
                guildUser?.roles.add(roleToAdd);
            }
        }
    });
    client.on('messageReactionRemove', async (reaction, user) => {
        const server = util_1.findServer(client);
        if (reaction.message === rolMessage && user.id !== '720067757412188181') {
            let guildUser = server?.members.cache.get(user.id);
            let roleToAdd = await findRoleByReaction(server, reaction);
            if (roleToAdd) {
                console.log(chalk_1.default.redBright(`Role ${roleToAdd.name} given to ${guildUser?.nickname || guildUser?.displayName}`));
                guildUser?.roles.remove(roleToAdd);
            }
        }
    });
};
exports.default = {
    init,
};
const findRoleByReaction = async (server, reaction) => {
    let dbRol = await Rol_1.default.findOne({ icon: reaction.emoji.name });
    if (dbRol) {
        let roleToAdd = server?.roles.cache.get(dbRol?.id);
        return roleToAdd;
    }
    return null;
};
const onReady = async (server) => {
    const description = 'Queres ser notificado cuando el server juega a algo? Decinos que jugas!';
    const roles = await getRolesFromDb(server);
    const autoRolChannel = await getAutoRolChannel(server, description);
    if (roles.length) {
        let message = new discord_js_1.MessageEmbed()
            .setTitle(`${description}\n\nReacciona para obtener el rol!\n\n\n`)
            .setColor('DARK_GOLD')
            .setDescription(`${roles.reduce(getMessageFromRoles, '')}`);
        await util_1.deleteOldMessagesFromChannel(autoRolChannel);
        const rolMessage = await autoRolChannel?.send(message);
        await createReactions(rolMessage, server, roles);
        return rolMessage;
    }
};
const getRolesFromDb = async (server) => {
    let rolesDb = await Rol_1.default.find({});
    return rolesDb.map((rol) => {
        let discordRol = server?.roles.cache.get(rol.id);
        return { ...discordRol, icon: rol.icon, displayName: rol.displayName };
    });
};
const getAutoRolChannel = async (server, description) => {
    const botCategory = util_1.findBotCategory(server);
    let name = '🤖︱elegi-tu-rol';
    let textChannel = util_1.isTextChannelAlreadyCreated(server, name);
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
    return `${acc}- ${current.displayName}\n`;
};
const createReactions = async (message, server, roles) => {
    roles.forEach((role) => {
        let icon = util_1.getEmojiByName(server, role.icon);
        if (icon) {
            message?.react(icon?.id);
        }
    });
    return;
};
