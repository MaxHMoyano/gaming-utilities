"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readyEvent_1 = __importDefault(require("./readyEvent"));
const voiceUpdateEvent_1 = __importDefault(require("./voiceUpdateEvent"));
const presenceUpdateEvent_1 = __importDefault(require("./presenceUpdateEvent"));
const init = async (client) => {
    let voiceCategory;
    let createPartyChannel;
    let createdChannels = [];
    console.log('GamingChannel Init');
    // When the bot is ready and starts
    client.on('ready', async () => {
        [voiceCategory, createPartyChannel] = await readyEvent_1.default(client, voiceCategory, createPartyChannel);
    });
    // Everytime a member changes from channel to channel
    client.on('voiceStateUpdate', async (oldState, newState) => {
        createdChannels = await voiceUpdateEvent_1.default(oldState, newState, voiceCategory, createPartyChannel, createdChannels);
    });
    // Everytime a member updates their rich presence
    client.on('presenceUpdate', (oldPresence) => {
        presenceUpdateEvent_1.default(oldPresence, createdChannels);
    });
    client.on('error', (err) => { });
};
exports.default = {
    init,
};
