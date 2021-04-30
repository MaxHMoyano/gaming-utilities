"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMostPlayedVideogameFromList = exports.isMemberPartOfChannelList = exports.getChannelPlayedVideogames = exports.findVoiceCategory = exports.findServer = void 0;
const findServer = (client) => {
    return client.guilds.cache.first();
};
exports.findServer = findServer;
const findVoiceCategory = (server) => {
    return server?.channels.cache.find((channel) => {
        return channel.id === '377818324559593486';
    });
};
exports.findVoiceCategory = findVoiceCategory;
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
    getChannelPlayedVideogames: exports.getChannelPlayedVideogames,
    getMostPlayedVideogameFromList: exports.getMostPlayedVideogameFromList,
};
