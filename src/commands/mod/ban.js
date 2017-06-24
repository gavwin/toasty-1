const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = class BanCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ban',
			group: 'mod',
			memberName: 'ban',
			description: 'Ban a user from the server.',
			examples: ['ban @user spamming in chat'],
			guildOnly: true,
			args: [
				{
					key: 'user',
					prompt: 'What user would you like to ban?\n',
					type: 'user'
				},
				{
					key: 'reason',
					prompt: 'What is the reason you banned this user?\n',
					type: 'string'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('BAN_MEMBERS');
	}

	async run(msg, args) {
		const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data/servers.json'), 'utf8'));
		const { user, reason } = args;
		if (user.id === this.client.user.id) return msg.reply('I can\'t ban myself \\:P');
		if (!msg.channel.permissionsFor(this.client.user).hasPermission('BAN_MEMBERS')) return msg.reply(':no_entry_sign: **Error:** I don\'t have the **Ban Members** permission!');
		const member = await msg.guild.fetchMember(user).catch(() => null);
		await msg.say('Are you sure you want to ban this user?  (__y__es or __n__o)');
		await msg.embed({
			author: {
				name: `${user.username}#${user.discriminator} (${user.id})`,
				icon_url: user.avatarURL
			},
			fields: [
				{
					name: 'Reason:',
					value: reason
				}
			],
			timestamp: new Date()
		});

		msg.channel.awaitMessages(response => ['y', 'yes', 'n', 'no', 'cancel'].includes(response.content) && response.author.id === msg.author.id, {
			max: 1,
			time: 30000
		}).then(async (co) => {
			if (['yes', 'y'].includes(co.first().content)) {
				const m = await msg.say('*Banning user...*');
				await msg.guild.ban(user, 7);
				let modlogData = data[msg.guild.id] ? data[msg.guild.id] : {modlog: 'disabled'};
				if (modlogData.modlog === 'disabled') {
					m.edit(`**${member.user.username}**#${member.user.discriminator} has been banned.`);
					console.log('disabled');
				} else
				if (modlogData.modlog === 'enabled') {
					const embed = new RichEmbed();
					const today = new Date();
					const date = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
					const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
					const channel = msg.guild.channels.find('name', 'mod-log').id;
					embed.setColor(0xFF0000)
							 .setAuthor(member.user.username, member.user.avatarURL)
							 .setTitle('User Banned:')
							 .setDescription(`${member.user.username}#${member.user.discriminator} (${member.user.id})`)
							 .addField('Reason:', reason)
							 .addField('Responsible Moderator:', `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`)
							 .setFooter(`${date} at ${time}`);
					this.client.channels.get(channel).send({ embed }).catch(err => {
						return msg.reply(':no_entry_sign: **Error:** I couldn\'t send the ban embed in the #mod-log. Please make sure I have access to a channel called mod-log!');
					});
					m.edit(`**${member.user.username}**#${member.user.discriminator} has been banned. I've logged it in the #mod-log.`);
					console.log('enabled');
				} else {
					m.edit(`**${member.user.username}**#${member.user.discriminator} has been banned.`);
					console.log('disabled else');
				}
				} else if (['n', 'no', 'cancel'].includes(co.first().content)) {
					return msg.say('Got it, I won\'t ban the user.');
				}
		}).catch(() => msg.say('Aborting ban, took longer than 30 seconds to reply.'));
	}
};
