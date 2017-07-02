const snekfetch = require('snekfetch');
const fs = require('fs');
const path = require('path');
const paths = {
  data: path.join(__dirname, '..', 'data/servers.json'),
  stats: path.join(__dirname, '..', 'data/stats.json')
};

exports.run = (client, guild) => {
  const data = JSON.parse(fs.readFileSync(paths.data, 'utf8'));
  delete data[guild.id];
  fs.writeFileSync(paths.data, JSON.stringify(data, null, 2));

  const stats = JSON.parse(fs.readFileSync(paths.stats, 'utf8'));
  if (!stats) stats = { guilds: 0 };
  stats.guilds -= 1;
  fs.writeFileSync(paths.stats, JSON.stringify(stats));
}
