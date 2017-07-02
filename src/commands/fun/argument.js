const { Command } = require('discord.js-commando');
const path = require('path');
const arguments = require(path.join(__dirname, '..', '..', 'data/arguments.json'));

module.exports = class ArgumentCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'argument',
      group: 'fun',
      memberName: 'argument',
      description: 'Sends a topic that will start and argument.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run(msg, args) {
    msg.say(arguments[Math.floor(Math.random() * arguments.length)]);
  }
};
