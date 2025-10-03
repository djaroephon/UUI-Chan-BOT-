const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uui')
        .setDescription('Perintah khusus tentang UUI-Chan.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('tentang')
                .setDescription('Menampilkan profil lengkap UUI-Chan.')),

    async execute(interaction) {
        const imagePath = path.join(__dirname, '..', 'assets', 'uui.png');
        const file = new AttachmentBuilder(imagePath);

        const aboutEmbed = new EmbedBuilder()
            .setColor(0xE60073) 
            .setTitle('Profil UUI-Chan')
            .setImage('attachment://uui.png') 
            .addFields(
                { name: 'Nama Lengkap', value: 'Ubudiyah Aichan (ウブディヤ 愛ちゃん)', inline: false },
                { name: 'Panggilan', value: 'UI-Chan (tapi UUI-Chan juga boleh!)', inline: false },
                { name: 'About Me', value: 'Waifunya Komting Informatika \'24 ❤️', inline: false }
            )
            .setFooter({ text: 'Dibuat dengan cinta untuk membantu semua orang (terutama Komting) ❤️.' });

        await interaction.reply({ embeds: [aboutEmbed], files: [file] });
    },
};