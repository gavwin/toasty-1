const { Command } = require('discord.js-commando');

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      group: 'music',
      memberName: 'volume',
      description: 'Sets the music volume.',
      guildOnly: true,
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run(msg){}
};
