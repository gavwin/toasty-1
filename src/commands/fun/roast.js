const { Command } = require('discord.js-commando');
const path = require('path');
const roasts = require(path.join(__dirname, '..', '..', 'data/roasts.json'));

module.exports = class RoastCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'roast',
      group: 'fun',
      aliases: ['insult'],
      memberName: 'roast',
      description: 'Roasts/insults the mentioned user.',
      guildOnly: true,
      args: [
        {
          key: 'user',
          prompt: 'Who would you like to roast?\n',
          type: 'member'
        }
      ],
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run(msg, args) {
    const { user } = args;
    if (user.id === this.client.user.id) return msg.reply(':fire: Listen up you dumbass retard! I ain\'t gonna roast myself!');
    msg.say(`:fire: **${user.user.username}**, ${roasts[Math.floor(Math.random() * roasts.length)]}`);
  }
};
