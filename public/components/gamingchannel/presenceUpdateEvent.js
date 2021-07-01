"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("../../util");
const checkAllChannelsNames = async (channels) => {
    let videogames = [];
    for (let idx = 0; idx < channels.length; idx++) {
        videogames = util_1.getChannelPlayedVideogames(channels[idx]);
        // If a videogame is being played on the server, we will show it
        if (videogames && videogames.length) {
            let mostPlayedVideogame = util_1.getMostPlayedVideogameFromList(videogames);
            await util_1.changeChannelName(channels[idx], `🔊︱${mostPlayedVideogame?.name}`);
        }
        else {
            // If not, we will choose a random name for it
            await util_1.changeChannelName(channels[idx], `🔊︱${util_1.getRandomNameFromThemeNames()}`);
        }
    }
};
const presenceUpdateEvent = async (oldPresence) => {
    let member = oldPresence?.member;
    if (member) {
        let channels = await util_1.isMemberPartOfCreatedChannels(member);
        if (channels && channels.length) {
            console.log(chalk_1.default.whiteBright(`A new member from a created channel has changed their presence... Checking all created lobbies`));
            checkAllChannelsNames(channels);
        }
    }
};
exports.default = presenceUpdateEvent;
