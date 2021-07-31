"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("../../util");
const checkChannelName = async (channel) => {
    let videogames = [];
    videogames = util_1.getChannelPlayedVideogames(channel);
    // If a videogame is being played on the server, we will show it
    if (videogames && videogames.length) {
        let mostPlayedVideogames = util_1.getMostPlayedVideogamesFromList(videogames);
        if (mostPlayedVideogames.length === 1) {
            const mostPlayedVideogameName = mostPlayedVideogames[0].name;
            console.log(chalk_1.default.cyanBright(`More than 2 people are playing ${mostPlayedVideogameName} in ${channel.name}\n Changing channel name`));
            util_1.changeChannelName(channel, `🔊︱${mostPlayedVideogameName}`);
        }
    }
};
const presenceUpdateEvent = async (oldPresence) => {
    let member = oldPresence?.member;
    if (member) {
        let channel = await util_1.isMemberPartOfCreatedChannels(member);
        if (channel) {
            console.log(chalk_1.default.cyanBright(`A new member from a ${channel.name} has changed their presence...`));
            checkChannelName(channel);
        }
    }
};
exports.default = presenceUpdateEvent;
