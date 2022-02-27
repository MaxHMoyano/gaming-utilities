"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../util");
const readyEvent = async (client, voiceCategory, createPartyChannel) => {
    const server = (0, util_1.findServer)(client);
    voiceCategory = (0, util_1.findVoiceCategory)(server);
    let isChannelAlreadyCreated = voiceCategory?.guild.channels.cache.find((channel) => channel.name === '🤖︱Crear Party');
    if (!isChannelAlreadyCreated) {
        createPartyChannel = await voiceCategory?.guild.channels.create('🤖︱Crear Party', {
            type: 'voice',
            userLimit: 1,
            parent: voiceCategory,
            position: 2,
        });
    }
    else {
        createPartyChannel = isChannelAlreadyCreated;
    }
    return [voiceCategory, createPartyChannel];
};
exports.default = readyEvent;
