const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');
const { exec } = require('child_process');

module.exports = class StatsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stats',
      group: 'util',
      memberName: 'stats',
      description: 'Sends detailed statistics of the bot.',
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  async run(msg) {
    const m = await msg.say('```Fetching my stats...```');

    const guildRes = await this.client.shard.fetchClientValues('guilds.size');
    const guilds = guildRes.reduce((prev, val) => prev + val, 0);
    const userRes = await this.client.shard.fetchClientValues('users.size');
    const users = userRes.reduce((prev, val) => prev + val, 0);
    const channelRes = await this.client.shard.fetchClientValues('channels.size');
    const channels = channelRes.reduce((prev, val) => prev + val, 0);
    const voiceConnectionRes = await this.client.shard.fetchClientValues('voiceConnections.size');
    const voiceConnections = voiceConnectionRes.reduce((prev, val) => prev + val, 0);
    const uptime = await this.client.shard.fetchClientValues('uptime');
    let averageUptime = uptime[0] + uptime[1];
    averageUptime = averageUptime / 2;

    const embed = new RichEmbed();
    const toExec = `top -bn2 | grep \"Cpu(s)\" | \\
sed \"s/.*, *\\([0-9.]*\\)%* id.*/\\1/\" | \\
awk '{print 100 - $1\"%\"}'`;
    exec(toExec, {}, (err, stdout, stderr) => {
		  if (err) return msg.reply(':no_entry_sign: There was an error fetching my stats. Please try again later.');
      embed.setColor(0x00FFE1)
           .setAuthor(this.client.user.username, this.client.user.avatarURL)
           .setTitle('Toasty Statistics')
           .addField('Shard:', `${this.client.shard.id} / ${this.client.shard.count - 1}`, true)
           .addField('Average Shard Uptime:', moment.duration(averageUptime).format(' D [days], H [hrs], m [mins], s [secs]'), true)
           .addField('Servers:', `${this.client.guilds.size.toLocaleString()} / ${guilds.toLocaleString()}`, true)
           .addField('Users:', `${this.client.users.size.toLocaleString()} / ${users.toLocaleString()}`, true)
           .addField('Channels:', `${this.client.channels.size.toLocaleString()} / ${channels.toLocaleString()}`, true)
           .addField('Voice Connections:', `${this.client.voiceConnections.size.toLocaleString()} / ${voiceConnections.toLocaleString()}`, true)
           .addField('Message Latency:', `${m.createdTimestamp - msg.createdTimestamp} MS`, true)
           .addField('Discord Latency:', `${Math.round(this.client.ping)} MS`, true)
           .addField('Memory Usage:', `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
           .addField('Swap Size:', `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, true)
           .addField('CPU Usage:', stdout.substring(5), true)
           .addField('Operating System:', `Ubuntu 16.0.4 LTS`, true);
      m.edit({ embed });
    });
  }
}
