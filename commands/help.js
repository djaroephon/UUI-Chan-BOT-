const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Menampilkan daftar semua perintah yang tersedia.'),

    async execute(interaction) {
        const commands = interaction.client.commands;

        const helpEmbed = new EmbedBuilder()
            .setColor(0x5865F2) 
            .setTitle('Bantuan Perintah UUI-Chan')
            .setDescription('Berikut adalah semua perintah yang bisa kamu gunakan:')
            .setTimestamp();

        commands.forEach(command => {
            helpEmbed.addFields({ 
                name: `\`/${command.data.name}\``, 
                value: command.data.description 
            });
        });

        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    },
};