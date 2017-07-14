const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const google = require('google');

module.exports = class GoogleCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'google',
      group: 'useful',
      aliases: ['search'],
      memberName: 'google',
      description: 'Searches Google.',
      args: [
        {
          key: 'query',
          prompt: 'What would you like to google?\n',
          type: 'string'
        }
      ],
      throttling: {
        usages: 1,
        duration: 8
      }
    });
  }

  async run(msg, args) {
    msg.channel.startTyping();
    google.resultsPerPage = 1;
    google(args.query, (err, res) => {
      if (err) msg.reply(':no_entry_sign: There was an issue googling that. Please try (a) different keyword(s).');
      msg.channel.stopTyping(true);
      const link = res.links[0];
      const embed = new RichEmbed();
      embed.setColor(0xdb3236)
           .setAuthor(`Results for ${args.query}`, 'https://maxcdn.icons8.com/Share/icon/Logos//google_logo1600.png')
           .setThumbnail('https://www.wired.com/wp-content/uploads/2015/09/google-logo-1200x630.jpg')
           .addField(`**${link.title} - ${link.href}**`, link.description);
      return msg.embed(embed);
    });
  }
}
