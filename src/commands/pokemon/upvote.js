const { Command } = require('discord.js-commando');

module.exports = class UpvoteCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'upvote',
      group: 'pokemon',
      memberName: 'upvote',
      description: 'Gives the steps on how to upvote me.',
      details: 'This is required for access to the Pokemon commands.',
      throttling: {
        usages: 2,
        duration: 3
      }
    });
  }

  run(msg) {
    const steps =
      `**How to upvote me:**
      1. **Go to http://toastythebot.tk/upvote** (You will be redirected)
      2. **Click the "Upvote" button that looks like this: http://i.imgur.com/pPnpmgm.png**
      3. **Type, \`${this.client.commandPrefix}verifyupvote\` and you will be able to use the Pokemon commands!**
      If the Pokemon commands still do not work for you, type, \`${this.client.commandPrefix}hq\` and ask for support.
      `;

      msg.say(steps);
  }
};
