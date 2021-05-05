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
        let [isMemberPartOfList, channel] = await util_1.isMemberPartOfCreatedChannels(member);
        if (isMemberPartOfList && channel) {
            console.log(chalk_1.default.whiteBright(`A new member from ${channel.name} has changed their presence`));
            videogames = util_1.getChannelPlayedVideogames(channel);
        }
        if (videogames && videogames.length) {
            let mostPlayedVideogame = util_1.getMostPlayedVideogameFromList(videogames);
            channel?.edit({ name: mostPlayedVideogame?.name }).then((editedChannel) => {
                console.log(chalk_1.default.cyanBright(`Changed name to ${editedChannel.name}`));
            });
        }
    }
};
exports.default = presenceUpdateEvent;
