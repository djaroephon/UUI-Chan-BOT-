const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ChatHistory = require('../models/chatHistoryModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearchat')
        .setDescription('Menghapus memori/ingatan percakapan UUI-Chan denganmu.'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const result = await ChatHistory.findOneAndDelete({ userId: interaction.user.id });

            const embed = new EmbedBuilder()
                .setColor(0xFF0000) // Merah untuk indikator reset/delete
                .setTitle('Sistem Memori Direset')
                .setDescription(
                    result 
                    ? '✅ Ingatan percakapan kita sudah dihapus dari database. Mari mulai lembaran baru!' 
                    : 'ℹ️ Sepertinya kita belum pernah ngobrol, jadi tidak ada memori yang dihapus.'
                )
                .setFooter({ text: 'Sistem Inti: Memori Internal' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error saat menghapus chat history:', error);
            await interaction.editReply('❌ Terjadi kesalahan pada sistem saat mencoba menghapus memori.');
        }
    },
};
