"use strict";
// TODO: Make the channel name of the majority of players. Not just the last one
// TODO: function to check a server name by counting people playing
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var dotenv = require("dotenv");
var Discord = require("discord.js");
var client = new Discord.Client();
dotenv.config();
client.login(process.env.TOKEN);
var voiceCategory;
var createPartyChannel;
var createdChannels = [];
client.on('ready', function () { return __awaiter(void 0, void 0, void 0, function () {
    var isChannelAlreadyCreated;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Logged in as " + client.user.tag + "!");
                console.log(client);
                voiceCategory = client.channels.cache.find(function (channel) {
                    // Encuentro la categoria de voz
                    return channel.id === '377818324559593486';
                });
                isChannelAlreadyCreated = voiceCategory.guild.channels.cache.find(function (channel) { return channel.name === '〔🤖〕Crear Party'; });
                if (!!isChannelAlreadyCreated) return [3 /*break*/, 2];
                return [4 /*yield*/, voiceCategory.guild.channels.create('〔🤖〕Crear Party', {
                        type: 'voice',
                        userLimit: 1,
                        parent: voiceCategory,
                        position: 2
                    })];
            case 1:
                createPartyChannel = _a.sent();
                return [3 /*break*/, 3];
            case 2:
                createPartyChannel = isChannelAlreadyCreated;
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
client.on('voiceStateUpdate', function (oldState, newState) { return __awaiter(void 0, void 0, void 0, function () {
    var videogames, channelName, newChannel, channel_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(newState.channel && newState.channel.id === createPartyChannel.id)) return [3 /*break*/, 2];
                videogames = newState.member.presence.activities.filter(function (activity) { return activity.type === 'PLAYING'; });
                channelName = videogames.length
                    ? videogames[0].name
                    : "\u3014\uD83D\uDD0A\u3015Party de " + (newState.member.nickname || newState.member.displayName);
                return [4 /*yield*/, newState.guild.channels.create(channelName, {
                        type: 'voice',
                        parent: voiceCategory,
                        position: 2
                    })];
            case 1:
                newChannel = _a.sent();
                newState.member.voice.setChannel(newChannel);
                createdChannels.push(newChannel);
                _a.label = 2;
            case 2:
                // User se va de un canal creado
                if (oldState.channel) {
                    channel_1 = createdChannels.find(function (e) { return e.id === oldState.channel.id; });
                    if (channel_1 && channel_1.members.toJSON().length === 0) {
                        channel_1["delete"]();
                        createdChannels = createdChannels.filter(function (e) { return e.id !== channel_1.id; });
                    }
                }
                return [2 /*return*/];
        }
    });
}); });
client.on('presenceUpdate', function (oldPresence, newPresence) {
    if (oldPresence) {
        var member_1 = oldPresence.member;
        var memberInCreatedChannel_1;
        var channelToBeChanged_1;
        if (member_1) {
            createdChannels.forEach(function (channel) {
                memberInCreatedChannel_1 = channel.members.array().find(function (e) { return e.id === member_1.id; });
                if (memberInCreatedChannel_1) {
                    channelToBeChanged_1 = channel;
                }
            });
            if (memberInCreatedChannel_1) {
                if (memberInCreatedChannel_1.presence.activities.length) {
                    var videogame = memberInCreatedChannel_1.presence.activities.find(function (e) { return e.type === 'PLAYING'; });
                    if (videogame) {
                        channelToBeChanged_1.edit({ name: videogame.name });
                    }
                }
            }
        }
    }
});
var checkChannelName = function (channel) { };
