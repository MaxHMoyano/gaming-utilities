"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const presenceUpdateEvent = (oldPresence, createdChannels) => {
    let member = oldPresence?.member;
    let videogames = [];
    if (member) {
        let [isMemberPartOfList, channel] = util_1.isMemberPartOfChannelList(member, createdChannels);
        if (isMemberPartOfList && channel) {
            console.log(`A new member from ${channel.name} has changed their presence`);
            videogames = util_1.getChannelPlayedVideogames(channel);
        }
        let mostPlayedVideogame = videogames && videogames.length ? util_1.getMostPlayedVideogameFromList(videogames) : null;
        channel?.edit({ name: mostPlayedVideogame?.name }).then((editedChannel) => {
            console.log(`Changed name of ${channel?.name} to ${editedChannel.name}`);
        });
    }
};
exports.default = presenceUpdateEvent;
