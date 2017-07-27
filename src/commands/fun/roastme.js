const { Command } = require('discord.js-commando');
const path = require('path');
const roasts = require(path.join(__dirname, '..', '..', 'data', 'roasts.json'));

module.exports = class RoastMeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'roastme',
      group: 'fun',
      aliases: ['insultme', 'toastme'],
      memberName: 'roastme',
      description: 'Roasts/insults you.',
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run(msg) {
    msg.say(`:fire: **${msg.author.username}**, ${roasts[Math.floor(Math.random() * roasts.length)]}`);
  }
};
