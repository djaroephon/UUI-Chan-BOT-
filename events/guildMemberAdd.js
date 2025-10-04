const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    execute(member) {
        const welcomeChannelId = process.env.CHANNEL_WELCOME;

        if (!welcomeChannelId) {
            console.log('[PERINGATAN] CHANNEL_WELCOME tidak diatur di environment variables.');
            return;
        }

        const channel = member.guild.channels.cache.get(welcomeChannelId);

        if (!channel) {
            console.log(`[PERINGATAN] Channel selamat datang dengan ID ${welcomeChannelId} tidak ditemukan.`);
            return;
        }

        const welcomeEmbed = new EmbedBuilder()
            .setColor(0x00FF00) // Hijau
            .setTitle(`Selamat Datang di ${member.guild.name}!`)
            .setDescription(`Halo ${member}, kami senang kamu bergabung! Jangan lupa untuk membaca peraturan server ya.`)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();
        
        channel.send({ embeds: [welcomeEmbed] });
    },
};