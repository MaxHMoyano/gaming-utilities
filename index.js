require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

client.login(process.env.token);

// debugger;
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
