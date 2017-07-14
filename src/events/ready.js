const fs = require('fs');
const path = require('path');
const jsonPath = path.join(__dirname, '..', '..', 'web', 'static', 'assets', 'json', 'stats.json');
const statsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

exports.run = async (client) => {
  console.log(`Shard ${client.shard.id}/${client.shard.count-1} ready! On ${client.guilds.size.toLocaleString()} guilds w/ ${client.users.size} users.`);
  const guilds = await client.shard.fetchClientValues('guilds.size');
  client.user.setGame(`;help ;invite | ${guilds.reduce((prev, val) => prev + val, 0).toLocaleString()} servers!`)
  setTimeout(() => { client.user.setGame('discord.me/toasty') }, 30000);
  const total = new Array();
  const users = await client.shard.fetchClientValues('users.size');
  const channels = await client.shard.fetchClientValues('channels.size');
  const voiceConnections = await client.shard.fetchClientValues('voiceConnections.size');
  total.push(guilds.reduce((prev, val) => prev + val, 0));
  total.push(users.reduce((prev, val) => prev + val, 0));
  total.push(channels.reduce((prev, val) => prev + val, 0));
  total.push(voiceConnections.reduce((prev, val) => prev + val, 0));
  setInterval(() => {
    if (!statsData) statsData = {
      "servers": "null",
      "users": "null",
      "channels": "null",
      "voiceConnections": "null"
    };
    statsData.servers = total[0];
    statsData.users = total[1];
    statsData.channels = total[2];
    statsData.voiceConnections = total[3];
    let updateValue = JSON.stringify(statsData, null, 2);
    fs.writeFileSync(jsonPath, updateValue);
  }, 180000);
}
