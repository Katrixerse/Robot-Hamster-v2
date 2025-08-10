const { guildLeaveMessage, rolePersist } = require('../../functions/leaveFuncs');

module.exports = (bot, member) => {
    console.log(`guildMemberRemove event fired for ${member.user.tag} (${member.user.id}) in ${member.guild.name} (${member.guild.id})`);
    //handle role persist
    rolePersist(member);
    // handle leave messages
    guildLeaveMessage(bot, member);
};