import { Client, GuildChannel, TextChannel } from 'discord.js';
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

    //
    let timbaChannel: TextChannel = client.channels.cache.get('887769728137982002') as TextChannel;
    // setTimeout(() => {
    setTimeout(() => {
      timbaChannel?.send('$w');
    }, 1000);
    // }, 600000);
  });

  client.on('error', (err) => {});
};

export default {
  init,
};
