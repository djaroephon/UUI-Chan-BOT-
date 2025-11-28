const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buatcode')
        .setDescription('Minta UUI-Chan membuatkan kode program dari nol.')
        .addStringOption(option =>
            option.setName('deskripsi')
                .setDescription('Mau buat program apa? Jelaskan sedetail mungkin.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('bahasa')
                .setDescription('Mau pakai bahasa apa? (Python, JS, dll) - Opsional')
                .setRequired(false)),

    async execute(interaction, geminiModel) {
        const deskripsi = interaction.options.getString('deskripsi');
        const bahasa = interaction.options.getString('bahasa') || 'bahasa pemrograman yang paling cocok';

        await interaction.deferReply(); 

        try {
            const prompt = `
            Bertindaklah sebagai UUI-Chan, mahasiswi Informatika yang cerdas dan suka membantu.
            Tugasmu adalah membuatkan kode program dari awal berdasarkan permintaan pengguna.

            Permintaan: "${deskripsi}"
            Bahasa yang diminta: ${bahasa}

            Instruksi:
            1. Buatkan kode program yang lengkap, rapi, dan berfungsi.
            2. Berikan komentar (comments) di dalam kode untuk menjelaskan bagian-bagian penting.
            3. Jika perlu, berikan sedikit penjelasan di luar blok kode tentang cara menjalankannya.
            4. Gunakan gaya bahasa yang ceria dan suportif.
            `;

            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text.length > 2000) {
                 const chunks = text.match(/[\s\S]{1,2000}/g) || [];
                 for (let i = 0; i < chunks.length; i++) {
                     if (i === 0) await interaction.editReply(chunks[i]);
                     else await interaction.followUp(chunks[i]);
                 }
            } else {
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF) // Biru
                    .setTitle(`✨ Generator Kode UUI-Chan`)
                    .setDescription(text)
                    .setFooter({ text: 'Semoga membantu tugasmu ya!' });
                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error buatcode:', error);
            await interaction.editReply('Maaf, UUI-Chan bingung mau mulai dari mana. Coba jelaskan lagi permintaannya dengan lebih detail ya!');
        }
    },
};