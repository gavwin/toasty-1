const { Command } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');
const jsonPath = path.join(__dirname, '..', '..', 'data/users.json');

module.exports = class VerifyUpvoteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'verifyupvote',
      group: 'pokemon',
      memberName: 'verifyupvote',
      description: 'Verifies your upvote so that you can use the Pokemon commands.',
      details: 'Type, `upvote` on a guide on how to upvote.'
    });
  }

  async run(msg) {
    const users = JSON.parse(fs.readFileSync(jsonPath));
    if (users.includes(msg.author.id)) return msg.reply('You have already upvoted me!');
    const m = await msg.say('*Verifying...*');
    users.push(msg.author.id);
    fs.writeFileSync(jsonPath, JSON.stringify(users, null, 2));
    setTimeout(() => { m.edit(':white_check_mark: You are now verified as upvoted! You may now use the Pokemon commands.') }, 3000);
  }
}
