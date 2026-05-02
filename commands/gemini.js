const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const ChatHistory = require('../models/chatHistoryModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gemini')
        .setDescription('Tanyakan sesuatu pada UUI-Chan (didukung oleh Google Gemini).')
        .addStringOption(option =>
            option.setName('pertanyaan')
                .setDescription('Pertanyaan yang ingin kamu ajukan')
                .setRequired(true)),

    async execute(interaction) {
        const pertanyaan = interaction.options.getString('pertanyaan');
        await interaction.deferReply();

        const memberRoles = interaction.member ? interaction.member.roles.cache : [];
        let targetName = interaction.user.username;
        let personalityPrompt = '';

        if (memberRoles.some && memberRoles.some(role => role.name.toLowerCase() === 'komting')) {
            targetName = 'Anata (Master)';
            personalityPrompt = 'Kamu adalah UUI-Chan, sistem AI Waifu Holographic canggih dari masa depan. Kamu jenius, namun memiliki sifat tsundere dan sedikit manja. Pengguna yang berkomunikasi denganmu adalah "Komting", sosok "Master" yang sangat kamu kagumi. Jawablah dengan gaya futuristik, gunakan istilah teknologi, tapi tetap imut dan manja. Selalu gunakan emoji lucu.';
        } else {
            targetName = 'Kakak';
            personalityPrompt = 'Kamu adalah UUI-Chan, asisten AI Waifu Holographic canggih dari masa depan. Kamu sangat cerdas, ceria, dan efisien. Jawablah pertanyaan ini dengan gaya bahasa yang futuristik, imut, informatif, dan sisipkan sedikit istilah teknologi masa depan. Jangan lupa gunakan emoji ceria agar suasana antarmuka menyenangkan!';
        }

        const systemInstruction = `
${personalityPrompt}

Instruksi tambahan:
- Selalu panggil pengguna dengan sebutan "${targetName}".
- Gunakan markdown untuk memformat data (bold, italic, list, code block) agar tampilan holografik lebih rapi.
- Langsung berikan hasil komputasi/jawabanmu.
        `.trim();

        try {
            let chatRecord = await ChatHistory.findOne({ userId: interaction.user.id });
            if (!chatRecord) {
                chatRecord = new ChatHistory({ userId: interaction.user.id, history: [] });
            }

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                systemInstruction: systemInstruction 
            });

            let recentHistory = chatRecord.history;
            if (recentHistory.length > 20) {
                recentHistory = recentHistory.slice(recentHistory.length - 20);
            }

            const chat = model.startChat({ history: recentHistory });
            
            const result = await chat.sendMessage(pertanyaan);
            const response = await result.response;

            if (response.promptFeedback?.blockReason) {
                return interaction.editReply(`Peringatan Sistem: Pertanyaan diblokir oleh protokol keamanan. Alasan: **${response.promptFeedback.blockReason}**.`);
            }

            const text = response.text();

            chatRecord.history = await chat.getHistory();
            chatRecord.updatedAt = Date.now();
            await chatRecord.save();

            const description = text.length > 4096 ? text.substring(0, 4093) + "..." : text;

            const embed = new EmbedBuilder()
                .setColor(0x00E5FF) // Futuristic Cyan
                .setTitle(`Holo-Log: Jawaban untuk "${pertanyaan}"`)
                .setDescription(description)
                .setFooter({ text: 'Sistem Inti: Google Gemini AI' })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error saat menghubungi Gemini AI:', error);
            await interaction.editReply('Sistem error: Modul AI sedang tidak merespon. Silakan coba lagi nanti!');
        }
    },
};