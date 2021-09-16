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
        //
        let timbaChannel = client.channels.cache.get('887769728137982002');
        // setTimeout(() => {
        for (let index = 0; index < 10; index++) {
            setTimeout(() => {
                timbaChannel?.send('$w');
            }, 1000);
        }
        // }, 600000);
    });
    client.on('error', (err) => { });
};
exports.default = {
    init,
};
