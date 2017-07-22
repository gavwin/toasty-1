const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = class ShardInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shardinfo',
      group: 'util',
      memberName: 'shardinfo',
      description: 'Sends information on each shard.',
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run(msg) {
    const guilds = await this.client.shard.fetchClientValues('guilds.size');
    const connections = await this.client.shard.fetchClientValues('voiceConnections.size');
    const uptime = await this.client.shard.fetchClientValues('uptime');
    let averageUptime = uptime[0] + uptime[1] + uptime[2] + uptime[3];
    averageUptime = averageUptime / 4;
    const embed = new RichEmbed();
    embed.setColor(0x00FFE1)
        .setAuthor(this.client.user.username, this.client.user.avatarURL)
        .setTitle('Shard Info')
        .addField('Total Shards:', this.client.shard.count, true)
        .addField('Total Servers:', guilds.reduce((prev, val) => prev + val, 0).toLocaleString(), true)
        .addField('Shard 0 Servers:', guilds[0].toLocaleString(), true)
        .addField('Shard 1 Servers:', guilds[1].toLocaleString(), true)
        .addField('Shard 2 Servers:', guilds[2].toLocaleString(), true)
        .addField('Shard 3 Servers:', guilds[3].toLocaleString(), true)
        .addField('Total Connections:', connections.reduce((prev, val) => prev + val, 0).toLocaleString(), true)
        .addField('Shard 0 Connections:', connections[0].toLocaleString(), true)
        .addField('Shard 1 Connections:', connections[1].toLocaleString(), true)
        .addField('Shard 2 Connections:', connections[2].toLocaleString(), true)
        .addField('Shard 3 Connections:', connections[3].toLocaleString(), true)
        .addField('Average Shard Uptime:', moment.duration(averageUptime).format(' D [days], H [hrs], m [mins], s [secs]'), true)
        .addField('Shard 0 Uptime:', moment.duration(uptime[0]).format(' D [days], H [hrs], m [mins], s [secs]'), true)
        .addField('Shard 1 Uptime:', moment.duration(uptime[1]).format(' D [days], H [hrs], m [mins], s [secs]'), true)
        .addField('Shard 2 Uptime:', moment.duration(uptime[2]).format(' D [days], H [hrs], m [mins], s [secs]'), true)
        .addField('Shard 3 Uptime:', moment.duration(uptime[3]).format(' D [days], H [hrs], m [mins], s [secs]'), true);
    msg.embed(embed);
  }
};
