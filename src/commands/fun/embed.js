const { Command } = require('discord.js-commando');

module.exports = class EmbedCommand extends Command {
  constructor(client) {
      super(client, {
        name: 'embed',
        group: 'fun',
        memberName: 'embed',
        description: 'Embeds the text you provide.',
        examples: ['embed This message will be in an embed'],
        args: [
          {
            key: 'text',
            prompt: 'What text would you like the bot to embed?',
            type: 'string'
          }
        ],
        throttling: {
          usages: 2,
          duration: 3
        }
    });
  }

  async run(msg, args) {
    await msg.embed({
      description: args.text,
      color: 'RANDOM',
      author: {
        name: msg.author.username,
        icon_url: msg.author.displayAvatarURL
      }
    });
  }
};
