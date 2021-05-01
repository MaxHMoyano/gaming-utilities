"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMostPlayedVideogameFromList = exports.isMemberPartOfChannelList = exports.getChannelPlayedVideogames = exports.getEmojiByName = exports.deleteOldMessagesFromChannel = exports.isTextChannelAlreadyCreated = exports.findBotCategory = exports.findVoiceCategory = exports.findServer = void 0;
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
    return server?.channels.cache.find((channel) => {
        return channel.id === '733385675986173984';
    });
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
            if (gameIdx !== -1) {
                videogames[gameIdx].count++;
            }
            else {
                videogames.push({
                    name: activity.name,
                    id: activity.applicationID,
                    count: 1,
                });
            }
        });
        return videogames;
    }
    return null;
};
exports.getChannelPlayedVideogames = getChannelPlayedVideogames;
const isMemberPartOfChannelList = (member, channelList) => {
    let memberInCreatedChannel;
    let channelWithMember = null;
    channelList.forEach((channel) => {
        memberInCreatedChannel = channel.members.array().find((e) => e.id === member?.id);
        channelWithMember = memberInCreatedChannel ? channel : null;
    });
    return [memberInCreatedChannel ? true : false, channelWithMember];
};
exports.isMemberPartOfChannelList = isMemberPartOfChannelList;
const getMostPlayedVideogameFromList = (videogames) => {
    let mostPlayed = {
        count: 0,
    };
    videogames.forEach((videogame) => {
        if (videogame.count > mostPlayed.count) {
            mostPlayed = videogame;
        }
    });
    return mostPlayed;
};
exports.getMostPlayedVideogameFromList = getMostPlayedVideogameFromList;
exports.default = {
    findServer: exports.findServer,
    findVoiceCategory: exports.findVoiceCategory,
    findBotCategory: exports.findBotCategory,
    getEmojiByName: exports.getEmojiByName,
    isTextChannelAlreadyCreated: exports.isTextChannelAlreadyCreated,
    deleteOldMessagesFromChannel: exports.deleteOldMessagesFromChannel,
    getChannelPlayedVideogames: exports.getChannelPlayedVideogames,
    getMostPlayedVideogameFromList: exports.getMostPlayedVideogameFromList,
};
