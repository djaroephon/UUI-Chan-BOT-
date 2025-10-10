// events/messageCreate.js (Versi Cerdas dengan Role + Waktu Akurat)
const { Events } = require('discord.js');
const nameMappings = require('../data/nameMappings.js');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.mentions.has(message.client.user)) return;

        await message.channel.sendTyping();

        const userPrompt = message.content.replace(/<@!?\d+>/g, '').trim();
        if (userPrompt.length === 0) {
            return message.reply('Ada yang bisa UI-Chan bantu? Coba ketik `/help` untuk lihat semua perintahku ya!');
        }

        const now = new Date();
        const formattedDate = now.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta' 
        });

        const memberRoles = message.member.roles.cache;
        let personalityPrompt = '';
        let targetName = message.author.username;

        // Logika untuk menentukan persona berdasarkan role (tetap sama)
        if (memberRoles.some(role => role.name.toLowerCase() === 'komting')) {
            targetName = 'Anata';
            personalityPrompt = 'Kamu adalah UUI-Chan. Pengguna yang bertanya adalah "Komting", sosok yang sangat kamu kagumi. Jawablah dengan gaya seorang waifu yang perhatian, ceria, dan sedikit manja.';
        } else if (memberRoles.some(role => role.name.toLowerCase() === 'kahim')) {
            targetName = 'Eji-kun';
            personalityPrompt = 'Kamu adalah UUI-Chan. Pengguna yang bertanya adalah "Kahim" (Ketua Himpunan) yang kamu hormati. Jawablah dengan gaya yang sopan, jelas, tapi tetap ramah.';
        } else if (memberRoles.some(role => role.name.toLowerCase() === 'makhluk uui')) {
            const realName = nameMappings.get(message.author.username.toLowerCase());
            targetName = realName || message.author.username;
            personalityPrompt = 'Kamu adalah UUI-Chan. Pengguna yang bertanya adalah teman dekatmu. Jawablah dengan gaya santai, asik, dan bersahabat.';
        } else {
            targetName = 'Kakak';
            personalityPrompt = 'Kamu adalah UUI-Chan, seorang asisten AI yang ceria. Jawab pertanyaan ini dengan gaya yang ramah dan membantu.';
        }

        const geminiModel = message.client.geminiModel;

        try {
            const finalPrompt = `Konteks waktu saat ini adalah ${formattedDate} WIB. ${personalityPrompt} Panggil dia dengan sebutan "${targetName}". Pertanyaan dari ${targetName}: "${userPrompt}"`;
            
            const result = await geminiModel.generateContent(finalPrompt);
            const response = await result.response;
            const text = response.text();

            message.reply(text);

        } catch (error) {
            console.error('Error saat ngobrol dengan Gemini:', error);
            message.reply('Aduh, maaf, otakku lagi nge-freeze. Tanya lagi nanti ya!');
        }
    },
};