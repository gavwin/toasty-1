const { ShardingManager } = require('discord.js');
const { shardCount } = require('./config.json');
const manager = new ShardingManager(`${__dirname}/toasty.js`, { totalShards: shardCount });

manager.spawn().catch(console.error);
manager.on('launch', shard => console.log(`Successfully launched shard ${shard.id}/${shardCount-1}.`));
