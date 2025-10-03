
const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    execute(member) {
        const channel = member.guild.systemChannel; 
        if (!channel) return;

        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x00FF00) //ijo
            .setTitle(`Selamat Datang di ${member.guild.name}!`)
            .setDescription(`Halo ${member}, kami senang kamu bergabung! Jangan lupa untuk membaca peraturan server ya.`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();

        channel.send({ embeds: [welcomeEmbed] });
    },
};