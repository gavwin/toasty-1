const { Command } = require('discord.js-commando');

module.exports = class ConnectionsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'connections',
      group: 'util',
      aliases: ['voiceconnections', 'vcs'],
      memberName: 'connections',
      description: 'Sends the amount of voice connections the bot has.',
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run(msg) {
    const m = await msg.say('*Fetching voice connections...*');
    const connectionRes = await this.client.shard.fetchClientValues('voiceConnections.size');
    const connections = connectionRes.reduce((prev, val) => prev + val, 0);
    m.edit(`:notes: Currently playing some *toasty* music in **${connections}** voice channels.`)
  }
}
