const { Command } = require('discord.js-commando');

module.exports = class PruneCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'prune',
			aliases: ['purge'],
			group: 'mod',
			memberName: 'prune',
			description: 'Deletes messages.',
			details: `Deletes messages. Here is a list of filters:
				__invites:__ Messages containing an invite
				__user @user:__ Messages sent by @user
				__bots:__ Messages sent by bots
				__uploads:__ Messages containing an attachment
				__links:__ Messages containing a link`,
			examples: ['prune 50', 'prune 100 uploads', 'prune 50 user @user'],
			guildOnly: true,
			throttling: {
				usages: 2,
				duration: 3
			},
			args: [
				{
					key: 'limit',
					prompt: 'How many messages would you like to delete?\n',
					type: 'integer',
					max: 100
				},
				{
					key: 'filter',
					prompt: 'What filter would you like to apply?\n',
					type: 'string',
					default: ''
				},
				{
					key: 'member',
					prompt: 'Whose messages would you like to delete?\n',
					type: 'member',
					default: ''
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_MESSAGES');
	}

	async run(msg, args) { // eslint-disable-line consistent-return
		let botMember = await msg.guild.fetchMember(msg.client.user);
		if (!botMember.hasPermission('MANAGE_ROLES')) return msg.reply(':no_entry_sign: I don\'t have the **Manage Roles** permission!');
		const limit = args.limit === 100 ? 99 : args.limit;
		const filter = args.filter.toLowerCase();
		let messageFilter;

		if (filter) {
			if (filter === 'invites') {
				messageFilter = message => message.content.search(/(discord\.gg\/.+|discordapp\.com\/invite\/.+)/i) !== -1;
			} else if (filter === 'user') {
				if (args.member) {
					const member = args.member;
					const user = member.user;
					messageFilter = message => message.author.id === user.id;
				} else {
					return msg.reply(':no_entry_sign: You need to mention someone.');
				}
			} else if (filter === 'bots') {
				messageFilter = message => message.author.bot;
			} else if (filter === 'you') {
				messageFilter = message => message.author.id === message.client.user.id;
			} else if (filter === 'uploads') {
				messageFilter = message => message.attachments.size !== 0;
			} else if (filter === 'links') {
				messageFilter = message => message.content.search(/https?:\/\/[^ \/\.]+\.[^ \/\.]+/) !== -1; // eslint-disable-line no-useless-escape
			} else {
				return msg.reply(`:no_entry_sign: That\'s not a valid filter. Type, \`${this.client.commandPrefix}help prune\` for a list of filters.`);
			}
		}

		if (!filter) {
			const messagesToDelete = await msg.channel.fetchMessages({ limit: limit + 1 }).catch(() => null);
			msg.channel.bulkDelete(messagesToDelete.array().reverse()).catch(() => null);
		} else {
			const messages = await msg.channel.fetchMessages({ limit: limit + 1 }).catch(() => null);
			const messagesToDelete = messages.filter(messageFilter);
			msg.channel.bulkDelete(messagesToDelete.array().reverse()).catch(() => null);
		}
	}
};
