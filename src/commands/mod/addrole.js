const { Command } = require('discord.js-commando');

module.exports = class AddRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'addrole',
			aliases: ['setrole', 'giverole', 'give'],
			group: 'mod',
			memberName: 'addrole',
			description: 'Gives a user a role.',
			guildOnly: true,
			examples: ['addrole @user Members'],
			args: [
				{
					key: 'member',
					prompt: 'What user would you like to give a role to?\n',
					type: 'member'
				},
				{
					key: 'role',
					prompt: 'What role would you like to give the user?\n',
					type: 'role'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_ROLES') || msg.author.id === msg.guild.ownerID;
	}

	async run(msg, args) {
		const { member, role } = args;
		const { user } = member;
		const botMember = await msg.guild.fetchMember(this.client.user);
		if (!botMember.hasPermission('MANAGE_ROLES')) return msg.reply(':no_entry_sign: I don\'t have the **Manage Roles** permission!');
		// const role = msg.guild.roles.filter(ro => ro.name.toLowerCase() === role.toLowerCase()).first();
		if (member.roles.has(role.id)) return msg.reply(':no_entry_sign: That user already has that role!');
		if (botMember.highestRole.comparePositionTo(role) < 1) return msg.reply(':no_entry_sign: I don\'t have permissions to edit this role, please check the role order!');
		if (msg.member.highestRole.comparePositionTo(role) < 1) return msg.reply(':no_entry_sign: You don\'t have access to this role, please check role order!');
		const m = await msg.say('*Adding...*');
		await member.addRole(role);
		return m.edit(`:white_check_mark: I have added the role of **${role.name}** to **${user.username}**.`);
	}
};
