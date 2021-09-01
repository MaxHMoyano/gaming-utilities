import { Client, GuildChannel } from 'discord.js';
import chalk from 'chalk';

const init = async (client: Client) => {
  console.log(chalk.yellowBright('Module BotStatus initiated'));

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

  client.on('error', (err) => {});
};

export default {
  init,
};
