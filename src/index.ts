import * as dotenv from 'dotenv';
import { Client } from 'discord.js';
import db from './db';
import gamingChannel from './components/gamingchannel';
import autoRol from './components/autoRol';
dotenv.config();

db.connect().then(() => {
  const client = new Client();
  client.login(process.env.TOKEN);
  // gamingChannel.init(client);
  autoRol.init(client);
});
