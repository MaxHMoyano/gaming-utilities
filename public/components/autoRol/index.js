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
            let dbRol = await Rol_1.default.findOne({ icon: reaction.emoji.name });
            let guildUser = server?.members.cache.get(user.id);
            let roleToAdd = server?.roles.cache.get(dbRol?.id);
            guildUser?.roles.add(roleToAdd);
        }
    });
    client.on('messageReactionRemove', async (reaction, user) => {
        const server = util_1.findServer(client);
        if (reaction.message === rolMessage && user.id !== '720067757412188181') {
            let dbRol = await Rol_1.default.findOne({ icon: reaction.emoji.name });
            let guildUser = server?.members.cache.get(user.id);
            let roleToAdd = server?.roles.cache.get(dbRol?.id);
            guildUser?.roles.remove(roleToAdd);
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
exports.default = {
    init,
};
const onReady = async (server) => {
    const botCategory = util_1.findBotCategory(server);
    const roles = await Rol_1.default.find({});
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
