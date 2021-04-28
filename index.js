"use strict";
// TODO: Make the channel name of the majority of players. Not just the last one
// TODO: function to check a server name by counting people playing
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const Discord = __importStar(require("discord.js"));
const client = new Discord.Client();
dotenv.config();
client.login(process.env.TOKEN);
let voiceCategory;
let createPartyChannel;
let createdChannels = [];
const checkChannelName = (channel) => {
    let activities = [];
    let videogames = [];
    channel?.members.forEach((member) => {
        let memberGames = member.presence.activities.filter((activity) => activity.type === 'PLAYING');
        if (memberGames.length) {
            activities.push(...memberGames);
        }
    });
    if (activities.length) {
        activities.forEach((activity) => {
            let gameIdx = videogames.findIndex((videogame) => videogame.id === activity.applicationID);
            if (gameIdx !== -1) {
                videogames[gameIdx].count++;
            }
            else {
                videogames.push({
                    name: activity.name,
                    id: activity.applicationID,
                    count: 1,
                });
            }
        });
        let videogameMostPlayed = checkVideogameCount(videogames);
        channel?.edit({ name: videogameMostPlayed.name });
    }
};
const checkVideogameCount = (videogames) => {
    let mostPlayed = {
        count: 0,
    };
    videogames.forEach((videogame) => {
        if (videogame.count > mostPlayed.count) {
            mostPlayed = videogame;
        }
    });
    return mostPlayed;
};
client.on('ready', async () => {
    console.log(`Logged in`);
    let server = client.guilds.cache.first();
    voiceCategory = server?.channels.cache.find((channel) => {
        return channel.id === '377818324559593486';
    });
    let isChannelAlreadyCreated = voiceCategory?.guild.channels.cache.find((channel) => channel.name === '〔🤖〕Crear Party');
    if (!isChannelAlreadyCreated) {
        createPartyChannel = await voiceCategory?.guild.channels.create('〔🤖〕Crear Party', {
            type: 'voice',
            userLimit: 1,
            parent: voiceCategory,
            position: 2,
        });
    }
    else {
        createPartyChannel = isChannelAlreadyCreated;
    }
});
client.on('voiceStateUpdate', async (oldState, newState) => {
    if (newState.channel && newState.channel.id === createPartyChannel?.id) {
        //User enters crear party
        let videogames = newState.member?.presence.activities.filter((activity) => activity.type === 'PLAYING');
        let channelName = videogames?.length
            ? videogames[0].name
            : `〔🔊〕Party de ${newState.member?.nickname || newState.member?.displayName}`;
        let newChannel = await newState.guild.channels.create(channelName, {
            type: 'voice',
            parent: voiceCategory,
            position: 2,
        });
        newState.member?.voice.setChannel(newChannel);
        createdChannels.push(newChannel);
    }
    // User se va de un canal creado
    if (oldState.channel) {
        let channel = createdChannels.find((e) => e.id === oldState.channel?.id);
        if (channel && channel.members.array().length === 0) {
            channel.delete();
            createdChannels = createdChannels.filter((e) => e.id !== channel?.id);
        }
    }
});
client.on('presenceUpdate', (oldPresence) => {
    if (oldPresence) {
        let member = oldPresence.member;
        let memberInCreatedChannel;
        let channelToBeChanged = null;
        if (member) {
            createdChannels.forEach((channel) => {
                memberInCreatedChannel = channel.members.array().find((e) => e.id === member?.id);
                if (memberInCreatedChannel) {
                    channelToBeChanged = channel;
                }
            });
            if (memberInCreatedChannel) {
                checkChannelName(channelToBeChanged);
            }
        }
    }
});
