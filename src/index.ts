import * as dotenv from 'dotenv';
import { Client } from 'discord.js';
import db from './db';
import gamingChannel from './components/gamingchannel';
import autoRol from './components/autoRol';
import botStatus from './components/botStatus';
dotenv.config();

db.connect().then(() => {
  const client = new Client();
  client.login(process.env.TOKEN);
  botStatus.init(client);
  gamingChannel.init(client);
  // autoRol.init(client);
});
