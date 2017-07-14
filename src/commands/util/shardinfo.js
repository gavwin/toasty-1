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
    const uptime = await this.client.shard.fetchClientValues('uptime');
    let averageUptime = uptime[0] + uptime[1];// + uptime[2];
    averageUptime = averageUptime / 2; //3;
    const embed = new RichEmbed();
    embed.setColor(0x00FFE1)
        .setAuthor(this.client.user.username, this.client.user.avatarURL)
        .setTitle('Shard Info')
        .addField('Total Shards:', this.client.shard.count)
        .addField('Total Servers:', guilds.reduce((prev, val) => prev + val, 0).toLocaleString())
        .addField('Shard 0 Servers:', guilds[0].toLocaleString())
        .addField('Shard 1 Servers:', guilds[1].toLocaleString())
        //.addField('Shard 2 Servers:', guilds[2].toLocaleString())
        .addField('Average Shard Uptime:', moment.duration(averageUptime).format(' D [days], H [hrs], m [mins], s [secs]'))
        .addField('Shard 0 Uptime:', moment.duration(uptime[0]).format(' D [days], H [hrs], m [mins], s [secs]'))
        .addField('Shard 1 Uptime:', moment.duration(uptime[1]).format(' D [days], H [hrs], m [mins], s [secs]'))
        //.addField('Shard 2 Uptime:', moment.duration(uptime[2]).format(' D [days], H [hrs], m [mins], s [secs]'));
    msg.embed(embed);
  }
};
