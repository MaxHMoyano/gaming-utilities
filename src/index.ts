import * as dotenv from 'dotenv';
import { Client } from 'discord.js';
import gamingChannel from './components/gamingchannel';
import autoRol from './components/autoRol';

const client = new Client();
dotenv.config();
client.login(process.env.TOKEN);

gamingChannel.init(client);
autoRol.init(client);
