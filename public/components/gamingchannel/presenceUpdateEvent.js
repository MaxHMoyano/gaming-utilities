"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const GamingChannel_1 = __importDefault(require("../../models/GamingChannel"));
const util_1 = require("../../util");
const checkChannelName = async (channel) => {
    let databaseChannel = await GamingChannel_1.default.findById(channel.id);
    let videogames = [];
    if (!databaseChannel?.hasChanged) {
        videogames = (0, util_1.getChannelPlayedVideogames)(channel);
        if ((videogames?.length && videogames[0].name != channel.name) || !videogames?.length) {
            await databaseChannel?.update({ hasChanged: true });
            (0, util_1.changeChannelName)(channel, `🔊︱${(0, util_1.getRandomNameFromThemeNames)()}`);
        }
    }
};
const presenceUpdateEvent = async (oldPresence) => {
    let member = oldPresence?.member;
    if (member) {
        let channel = await (0, util_1.isMemberPartOfCreatedChannels)(member);
        if (channel) {
            // A new member from a ${channel.name} has changed their presence
            checkChannelName(channel);
        }
    }
};
exports.default = presenceUpdateEvent;
