"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const util_1 = require("../../util");
const presenceUpdateEvent = async (oldPresence) => {
    let member = oldPresence?.member;
    let videogames = [];
    if (member) {
        let [isMemberPartOfList, channels] = await util_1.isMemberPartOfCreatedChannels(member);
        if (isMemberPartOfList && channels) {
            console.log(chalk_1.default.whiteBright(`A new member from a channel has changed their presence`));
            for (let index = 0; index < channels.length; index++) {
                videogames = util_1.getChannelPlayedVideogames(channels[index]);
                // If a videogame is being played on the server, we will show it
                if (videogames && videogames.length) {
                    let mostPlayedVideogame = util_1.getMostPlayedVideogameFromList(videogames);
                    let editedChannel = await channels[index]?.edit({
                        name: `🔊︱${mostPlayedVideogame?.name}`,
                    });
                    console.log(chalk_1.default.cyanBright(`Changed name to ${editedChannel.name}`));
                }
                else {
                    // If not, we will choose a random name for it
                    let editedChannel = await channels[index]?.edit({
                        name: `🔊︱${util_1.getRandomNameFromThemeNames()}`,
                    });
                    console.log(chalk_1.default.cyanBright(`Changed name to ${editedChannel.name}`));
                }
            }
        }
    }
};
exports.default = presenceUpdateEvent;
