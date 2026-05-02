const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fixcode')
        .setDescription('Minta UUI-Chan benerin error codingan kamu (Bisa paste atau upload file).')
        .addStringOption(option =>
            option.setName('bahasa')
                .setDescription('Bahasa pemrogramannya apa? (C++, Python, JS, dll)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('kode_paste')
                .setDescription('Paste kode pendek di sini (Opsional jika upload file)')
                .setRequired(false))
        .addAttachmentOption(option =>
            option.setName('file_kode')
                .setDescription('Upload file kode yang panjang di sini (Opsional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('error_log')
                .setDescription('Pesan errornya apa? (Opsional)')
                .setRequired(false)),

    async execute(interaction, geminiModel) {
        const bahasa = interaction.options.getString('bahasa');
        let kodeInput = interaction.options.getString('kode_paste');
        const fileAttachment = interaction.options.getAttachment('file_kode');
        const errorLog = interaction.options.getString('error_log') || 'Tidak disebutkan';

        await interaction.deferReply();

        try {
            if (fileAttachment) {
                const validExtensions = ['.txt', '.js', '.py', '.html', '.css', '.java', '.cpp', '.php', '.json'];
                const isFileValid = validExtensions.some(ext => fileAttachment.name.endsWith(ext)) || fileAttachment.contentType.startsWith('text/');

                if (!isFileValid) {
                    return interaction.editReply('❌ UUI-Chan cuma bisa baca file teks atau kode program ya (seperti .js, .py, .txt)!');
                }

                const response = await fetch(fileAttachment.url);
                if (!response.ok) throw new Error('Gagal mengunduh file.');
                kodeInput = await response.text();
                console.log(`Membaca file: ${fileAttachment.name}, Ukuran: ${kodeInput.length} karakter.`);
            }

            if (!kodeInput || kodeInput.trim().length === 0) {
                return interaction.editReply('⚠️ Kamu belum memasukkan kodenya! Silakan paste di opsi `kode_paste` ATAU upload file di `file_kode`.');
            }
            // ---------------------------------

            const prompt = `
            Kamu adalah UUI-Chan, mahasiswi Informatika jenius yang sangat teliti, ceria, dan ahli dalam debugging.
            Tugas: Analisis dan perbaiki kode ${bahasa} berikut agar berfungsi dengan sempurna.

            Kode yang bermasalah:
            \`\`\`${bahasa}
            ${kodeInput}
            \`\`\`

            Pesan Error/Kendala: ${errorLog}

            Instruksi:
            1. Jelaskan secara singkat dan ramah apa penyebab error atau masalah pada kode tersebut.
            2. Berikan FULL KODE yang sudah diperbaiki dengan rapi, dibungkus dalam markdown block (\`\`\`${bahasa} ... \`\`\`).
            3. Tambahkan sedikit komentar pada bagian yang kamu perbaiki agar pengguna paham letak perbaikannya.
            4. Gunakan gaya bahasa yang menyemangati, imut, dan suportif. Beri tahu mereka bahwa error itu wajar dalam proses belajar!
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
                    .setColor(0x00FF00)
                    .setTitle(`💻 Debugging: ${bahasa}`)
                    .setDescription(text)
                    .setFooter({ text: 'UUI-Chan: "Sudah diperbaiki ya!"' });
                await interaction.editReply({ embeds: [embed] });
            }

        } catch (error) {
            console.error('Error fixcode:', error);
            await interaction.editReply('Aduh, terjadi kesalahan saat mencoba membaca kode atau menghubungi AI. Coba lagi ya!');
        }
    },
};