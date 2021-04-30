"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const voiceUpdateEvent = async (oldVoiceState, newVoiceState, voiceCategory, createPartyChannel, createdChannels) => {
    if (newVoiceState.channel && newVoiceState.channel.id === createPartyChannel?.id) {
        //User enters crear party
        let videogames = newVoiceState.member?.presence.activities.filter((activity) => activity.type === 'PLAYING');
        let channelName = videogames?.length
            ? videogames[0].name
            : `〔🔊〕Party de ${newVoiceState.member?.nickname || newVoiceState.member?.displayName}`;
        let newChannel = await newVoiceState.guild.channels.create(channelName, {
            type: 'voice',
            parent: voiceCategory,
            position: 2,
        });
        console.log(`New channel ${newChannel.name} created`);
        newVoiceState.member?.voice.setChannel(newChannel);
        createdChannels.push(newChannel);
    }
    // User se va de un canal creado
    if (oldVoiceState.channel) {
        let channel = createdChannels.find((e) => e.id === oldVoiceState.channel?.id);
        if (channel && channel.members.array().length === 0) {
            channel.delete();
            createdChannels = createdChannels.filter((e) => e.id !== channel?.id);
        }
    }
    return createdChannels;
};
exports.default = voiceUpdateEvent;
