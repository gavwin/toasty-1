const { Command } = require('discord.js-commando');
const fs = require('fs');
const path = require('path');

module.exports = class EventReloadCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'eventreload',
			group: 'util',
			memberName: 'eventreload',
			aliases: ['ereload', 'reloade'],
			description: 'Reloads an event.',
			details: 'Only the bot owner can use this.',
			args: [
				{
					key: 'event',
					prompt: 'What event would you like to reload?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.options.owner === msg.author.id;
	}

  run(msg, args) {
		const { event } = args;
		const dir = path.resolve('src/events');
		if (!fs.existsSync(dir)) msg.reply(':no_entry_sign: I could not load the directory.');
		fs.readdirSync(dir, (err, files) => {
			if (err) console.error(err);
			files.forEach(file => {
				this.client.removeListener(file, listener);
				delete require.cache[require.resolve(`${file.path}${path.sep}${file.base}`)];
				this.client.on(file, (...args) => require(`${file.path}${path.sep}${file.base}`).run(this.client, ...args));
			});
		});
		msg.say(`:white_check_mark: Successfully reloaded the **${event}** event.`);
	}

};
