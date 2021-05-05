"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const init = async (client) => {
    console.log(chalk_1.default.yellowBright('Module BotStatus initiated'));
    // When the bot is ready and starts
    client.on('ready', async () => {
        client.user?.setPresence({
            status: 'online',
            activity: {
                name: 'Rehab™',
                type: 'WATCHING',
            },
        });
    });
    client.on('error', (err) => { });
};
exports.default = {
    init,
};
