const { Command } = require('discord.js-commando');

module.exports = class RemoveRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'removerole',
			aliases: ['takerole', 'take'],
			group: 'mod',
			memberName: 'removerole',
			description: 'Removes a role from a user.',
			guildOnly: true,
			examples: ['removerole @user Members'],
			args: [
				{
					key: 'member',
					prompt: 'What user would you like to remove the role from?\n',
					type: 'member'
				},
				{
					key: 'role',
					prompt: 'What role would you like to remove from the user?\n',
					type: 'role'
				}
			]
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_ROLES');
	}

	async run(msg, args) {
		const { member, role } = args;
		const user = member.user;
		const botMember = await msg.guild.fetchMember(msg.client.user);
		if (!botMember.hasPermission('MANAGE_ROLES')) return msg.reply(':no_entry_sign: I don\'t have the **Manage Roles** permission!');
		// const role = message.guild.roles.filter(ro => ro.name.toLowerCase() === role.toLowerCase()).first();
		if (!member.roles.has(role.id)) return msg.reply(':no_entry_sign: The target user doesn\'t have that role!');
		if (botMember.highestRole.comparePositionTo(role) < 1) return msg.reply(':no_entry_sign: I don\'t have permissions to edit this role, please check the role order!');
		if (msg.member.highestRole.comparePositionTo(role) < 1) return msg.reply(':no_entry_sign: You don\'t have access to this role, please check role order!');
		const m = await msg.say('*Removing...*');
		await member.removeRole(role);
		return m.edit(`:white_check_mark: I have removed the role of **${role.name}** from **${user.username}**.`);
	}
};
