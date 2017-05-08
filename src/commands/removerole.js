exports.run = (client, msg, args) => {
    if (!msg.guild.member(client.user).hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) return msg.reply(":no_entry_sign: **Error:** I don't have the **Manage Roles** permission!");
    if (!msg.member.hasPermission("MANAGE_ROLES_OR_PERMISSIONS")) return msg.reply(":no_entry_sign: **Error:** You don't have the **Manage Roles** permission!");
    if (msg.mentions.users.size === 0) return msg.reply(":no_entry_sign: Please mention a user to remove the role from.");
    let member = msg.guild.member(msg.mentions.users.first());
    if (!member) return msg.reply(":no_entry_sign: **Error:** That user does not seem valid.");
    let name = msg.content.split(" ").splice(2).join(" ");
    let role = msg.guild.roles.find("name", name);
    member.removeRole(role).catch(e => {
        msg.channel.sendMessage(":no_entry_sign: There was an error! It most likely is that the role you are trying to add is higher than the the role I have!");
    });
    msg.channel.sendMessage(`:white_check_mark: **${msg.author.username}**, I've removed the role of **${name}** from **${msg.mentions.users.first().username}**.`);
}
