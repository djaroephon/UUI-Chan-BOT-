const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gemini')
        .setDescription('Tanyakan sesuatu pada UUI-Chan (didukung oleh Google Gemini).')
        .addStringOption(option =>
            option.setName('pertanyaan')
                .setDescription('Pertanyaan yang ingin kamu ajukan')
                .setRequired(true)),

    async execute(interaction, geminiModel) {
        const pertanyaan = interaction.options.getString('pertanyaan');
        await interaction.deferReply();

        try {
            const result = await geminiModel.generateContent(pertanyaan);
            const response = await result.response;

            if (response.promptFeedback?.blockReason) {
                return interaction.editReply(`Maaf, pertanyaanmu tidak bisa diproses karena: **${response.promptFeedback.blockReason}**.`);
            }

            const text = response.text();

            const description = text.length > 4096 ? text.substring(0, 4093) + "..." : text;

            const embed = new EmbedBuilder()
                .setColor(0x4285F4)
                .setTitle(`Jawabanku untuk: "${pertanyaan}"`)
                .setDescription(description)
                .setFooter({ text: 'Didukung oleh Google Gemini AI' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error saat menghubungi Gemini AI:', error);
            await interaction.editReply('Maaf, pala ku sedang nge-lag atau terjadi error internal. Coba tanya lagi nanti ya!');
        }
    },
};