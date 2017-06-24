const { Command } = require('discord.js-commando');

module.exports = class BlacklistCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'blacklist',
			group: 'util',
			memberName: 'blacklist',
			description: 'Prohibit a user from using this bot.',
			args: [
				{
					key: 'userID',
					prompt: 'Who do you wish to blacklist?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return this.client.options.owner === msg.author.id;
	}

	async run(msg, args) {
		const user = args.userID;
		if (this.client.options.owner === user) return msg.reply('I\'m not gonna blacklist you!');
		const blacklist = this.client.provider.get('global', 'userBlacklist', []);
		if (blacklist.includes(user)) return msg.reply(':no_entry_sign: That user is already blacklisted!');
		blacklist.push(user);
		this.client.provider.set('global', 'userBlacklist', blacklist);
		return msg.reply(`User ID: \`${user}\` has been blacklisted.`);
	}
};
