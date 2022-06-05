"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GamingChannel_1 = require("../../models/GamingChannel");
const util_1 = require("../../util");
const checkChannelName = async (channel) => {
    let databaseChannel = await GamingChannel_1.GamingChannelModel.findById(channel.id);
    let videogames = [];
    if (!databaseChannel?.hasChanged) {
        videogames = (0, util_1.getChannelPlayedVideogames)(channel);
        if ((videogames?.length && videogames[0].name != channel.name) || !videogames?.length) {
            await databaseChannel?.updateOne({ hasChanged: true });
            (0, util_1.changeChannelName)(channel, `🔊︱${(0, util_1.getRandomNameFromThemeNames)()}`);
        }
    }
};
const presenceUpdateEvent = async (oldPresence) => {
    let member = oldPresence?.member;
    if (member) {
        let channel = await (0, util_1.isMemberPartOfCreatedChannels)(member);
        if (channel) {
            checkChannelName(channel);
        }
    }
};
exports.default = presenceUpdateEvent;
