"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMemberPartOfCreatedChannels = exports.getChannelPlayedVideogames = exports.getEmojiByName = exports.deleteOldMessagesFromChannel = exports.isTextChannelAlreadyCreated = exports.findBotCategory = exports.findVoiceCategory = exports.findServer = exports.changeChannelName = exports.getRandomNameFromThemeNames = void 0;
const GamingChannel_1 = __importDefault(require("../models/GamingChannel"));
const lodash_1 = __importDefault(require("lodash"));
const themeNames = [
    'Cocina',
    'Comedor',
    'Living',
    'Dormitorio Grande',
    'Dormitorio chiquito',
    'Sala de estar',
    'Sex dungeon',
    'Patio',
    'Quincho',
    'Terraza',
    'Pasillo',
    'Sotano',
    'Casita del arbol',
    'Desvan',
    'Ático',
    'Balcon',
    'Escalera',
    'Jardín',
    'Garage',
    'Patio trasero',
    'Vestíbulo',
];
const getRandomNameFromThemeNames = () => {
    return lodash_1.default.sample(themeNames);
};
exports.getRandomNameFromThemeNames = getRandomNameFromThemeNames;
const changeChannelName = (channel, name) => {
    if (channel.name !== name) {
        channel.edit({ name });
    }
};
exports.changeChannelName = changeChannelName;
const findServer = (client) => {
    return client?.guilds.cache.first();
};
exports.findServer = findServer;
const findVoiceCategory = (server) => {
    return server?.channels.cache.find((channel) => {
        return channel.id === '377818324559593486';
    });
};
exports.findVoiceCategory = findVoiceCategory;
const findBotCategory = (server) => {
    return server?.channels.cache.get('733385675986173984');
};
exports.findBotCategory = findBotCategory;
const isTextChannelAlreadyCreated = (server, name) => {
    let channel = server?.channels.cache.find((e) => e.name === name);
    return channel;
};
exports.isTextChannelAlreadyCreated = isTextChannelAlreadyCreated;
const deleteOldMessagesFromChannel = async (channel) => {
    if (channel) {
        const previousMessages = await channel?.messages.fetch();
        if (previousMessages) {
            channel?.bulkDelete(previousMessages);
        }
    }
};
exports.deleteOldMessagesFromChannel = deleteOldMessagesFromChannel;
const getEmojiByName = (server, iconName) => {
    return server?.emojis.cache.find((e) => e.name === iconName);
};
exports.getEmojiByName = getEmojiByName;
const getChannelPlayedVideogames = (channel) => {
    let videogames = [];
    let activities = [];
    channel?.members.forEach((member) => {
        let memberGames = member.presence.activities.filter((activity) => activity.type === 'PLAYING');
        if (memberGames.length) {
            activities.push(...memberGames);
        }
    });
    if (activities.length) {
        activities.forEach((activity) => {
            let gameIdx = videogames.findIndex((videogame) => videogame.id === activity.applicationID);
            if (gameIdx === -1) {
                videogames.push({
                    name: activity.name,
                    id: activity.applicationID,
                    count: 1,
                });
            }
            else {
                videogames[gameIdx].count += 1;
            }
        });
        videogames = videogames
            .filter((e) => e.count >= 2)
            .sort((a, b) => (a.count > b.count ? 1 : -1));
        return videogames;
    }
    return null;
};
exports.getChannelPlayedVideogames = getChannelPlayedVideogames;
const isMemberPartOfCreatedChannels = async (member) => {
    let dbChannel = await GamingChannel_1.default.findOne({ creator: member.id });
    if (dbChannel) {
        return member.guild.channels.cache.get(dbChannel._id);
    }
    return null;
};
exports.isMemberPartOfCreatedChannels = isMemberPartOfCreatedChannels;
exports.default = {
    getRandomNameFromThemeNames: exports.getRandomNameFromThemeNames,
    findServer: exports.findServer,
    changeChannelName: exports.changeChannelName,
    findVoiceCategory: exports.findVoiceCategory,
    findBotCategory: exports.findBotCategory,
    getEmojiByName: exports.getEmojiByName,
    isTextChannelAlreadyCreated: exports.isTextChannelAlreadyCreated,
    deleteOldMessagesFromChannel: exports.deleteOldMessagesFromChannel,
    getChannelPlayedVideogames: exports.getChannelPlayedVideogames,
};
