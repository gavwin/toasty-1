const { Command } = require('discord.js-commando');
const { RichEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = class KickCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'kick',
			group: 'mod',
			memberName: 'kick',
			description: 'Kicks a user from the server.',
			examples: ['kick @user', 'kick @user spamming in chat'],
			guildOnly: true,
			args: [
				{
					key: 'member',
					prompt: 'What user would you like to kick?\n',
					type: 'member'
				},
				{
					key: 'reason',
					prompt: 'What is the reason you kicked this user?\n',
					type: 'string',
					default: ''
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('KICK_MEMBERS') || msg.author.id === msg.guild.ownerID;
	}

	async run(msg, args) {
		const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', '..', 'data', 'servers.json'), 'utf8'));
		const { member, reason } = args;
		if (member.user.id === this.client.user.id) return msg.reply(':no_entry_sign: I can\'t kick myself \\:P');
		const botMember = await msg.guild.fetchMember(this.client.user);
		if (!botMember.hasPermission('KICK_MEMBERS')) return msg.reply(':no_entry_sign: I don\'t have the **Kick Members** permission!');
		if (!member.kickable) return msg.reply(':no_entry_sign: I could not kick this user. Make sure that my highest role is above the user you are trying to kick.');
		const m = await msg.say('*Kicking user...*');
		await member.kick();
		const modlogData = data[msg.guild.id] ? data[msg.guild.id] : {modlog: 'disabled'};
		if (modlogData.modlog === 'disabled') {
			m.edit(`**${member.user.username}**#${member.user.discriminator} has been kicked.`);
		} else
		if (modlogData.modlog === 'enabled') {
			const embed = new RichEmbed();
			const today = new Date();
			const date = (today.getMonth() + 1) + '/' + today.getDate() + '/' + today.getFullYear();
			const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
			const channel = msg.guild.channels.find('name', 'mod-log').id;
			embed.setColor(0xFFA500)
				   .setAuthor(member.user.username, member.user.avatarURL)
					 .setTitle('User Kicked:')
					 .setDescription(`${member.user.username}#${member.user.discriminator} (${member.user.id})`)
					 .addField('Reason:', reason ? reason : 'not specified')
					 .addField('Responsible Moderator:', `${msg.author.username}#${msg.author.discriminator} (${msg.author.id})`)
					 .setFooter(`${date} at ${time}`);
			this.client.channels.get(channel).send({ embed }).catch(err => {
				return msg.reply(':no_entry_sign: **Error:** I couldn\'t send the kick embed in the #mod-log. Please make sure I have access to a channel called mod-log!');
			});
			m.edit(`**${member.user.username}**#${member.user.discriminator} has been kicked. I've logged it in the #mod-log.`);
		} else {
			m.edit(`**${member.user.username}**#${member.user.discriminator} has been kicked.`);
		}
	}
};
