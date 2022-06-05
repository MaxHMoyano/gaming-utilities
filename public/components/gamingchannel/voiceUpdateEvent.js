"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const GamingChannel_1 = require("../../models/GamingChannel");
const util_1 = require("../../util");
const voiceUpdateEvent = async (oldVoiceState, newVoiceState, voiceCategory, createPartyChannel) => {
    if (newVoiceState.channel && newVoiceState.channel.id === createPartyChannel?.id) {
        let videogames = newVoiceState.member?.presence.activities.filter((activity) => activity.type === 'PLAYING');
        let channelName = videogames?.length
            ? `${videogames[0].name}`
            : `🔊︱${(0, util_1.getRandomNameFromThemeNames)()}`;
        let newChannel = await newVoiceState.guild.channels.create(channelName, {
            type: 'voice',
            parent: voiceCategory,
            position: 2,
        });
        await GamingChannel_1.GamingChannelModel.create({
            channelId: newChannel.id,
            hasChanged: !videogames?.length,
            creator: newVoiceState.member?.id,
        });
        console.log(chalk_1.default.greenBright(`New channel ${newChannel.name} created`));
        newVoiceState.member?.voice.setChannel(newChannel);
    }
    if (oldVoiceState.channel) {
        let dbChannel = await GamingChannel_1.GamingChannelModel.findOne({ channelId: oldVoiceState.channel.id });
        let channel = oldVoiceState.guild.channels.cache.get(dbChannel?.channelId);
        if (channel && channel.members.array().length === 0) {
            await GamingChannel_1.GamingChannelModel.findOneAndDelete({ channelId: channel.id });
            await channel.delete();
            console.log(chalk_1.default.redBright(`${channel.name} Deleted`));
        }
    }
};
exports.default = voiceUpdateEvent;
