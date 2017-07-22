const { discordbotsToken, discordpwToken } = require('../config.json');
const snekfetch = require('snekfetch');
const fs = require('fs');
const path = require('path');
const statsPath = path.join(__dirname, '..', 'data/stats.json');

exports.run = async (client, guild) => {
  guild.defaultChannel.send(':wave: Hey there, I\'m Toasty!\nA fun, moderating, music playing and delicious multi-purpose Discord bot for all your needs!\nType, `;help` for a list of commands!\n*Info:* Some of the moderation commands such as the joinrole, modlog, joinlog, etc, require the **Administrator** permission to be used.\nIf you have any questions, please join https://discord.me/toasty, or type, `;hq`.\nThanks for inviting me!');

  const guildRes = await client.shard.fetchClientValues('guilds.size');
  const guilds = guildRes.reduce((prev, val) => prev + val, 0);
  client.user.setGame(`;help | ${guilds.toLocaleString()} servers!`);

  snekfetch.post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
    .set('Authorization', discordbotsToken)
    .send({
      server_count: client.guilds.size,
      shard_id: client.shard.id,
      shard_count: client.shard.count
    });

  snekfetch.post(`https://bots.discord.pw/api/bots/${client.user.id}/stats`)
    .set('Authorization', discordpwToken)
    .send({
      server_count: client.guilds.size,
      shard_id: client.shard.id,
      shard_count: client.shard.count
    });

    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    if (!stats) stats = { guilds: 0 };
    stats.guilds += 1;
    fs.writeFileSync(statsPath, JSON.stringify(stats));
}
