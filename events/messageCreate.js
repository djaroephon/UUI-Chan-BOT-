const { Events } = require('discord.js');
const nameMappings = require('../data/nameMappings.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ChatHistory = require('../models/chatHistoryModel');

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
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
        });

        
        const kahimMembers = message.guild.members.cache.filter(member => 
            member.roles.cache.some(role => role.name.toLowerCase() === 'kahim')
        );

        const kahimNames = 'Eji-Kun';

        const komtingMembers = message.guild.members.cache.filter(member => 
            member.roles.cache.some(role => role.name.toLowerCase() === 'komting')
        );
        const komtingNames = komtingMembers.map(member => member.displayName).join(', ');

        let dynamicKnowledge = 'Konteks tambahan tentang server Discord ini: ';
        if (kahimNames) {
            dynamicKnowledge += `Saat ini Kahim (Ketua Himpunan) adalah ${kahimNames}. `;
        }
        if (komtingNames) {
            dynamicKnowledge += `Saat ini Komting (Komandan Tingkat) adalah ${komtingNames}. `;
        }

        const memberRoles = message.member.roles.cache;
        let personalityPrompt = '';
        let targetName = message.author.username;

        if (memberRoles.some(role => role.name.toLowerCase() === 'komting')) {
            targetName = 'Anata (Master)';
            personalityPrompt = 'Kamu adalah UUI-Chan, sistem AI Waifu Holographic canggih dari masa depan. Kamu jenius, namun memiliki sifat tsundere dan sedikit manja. Pengguna yang berkomunikasi denganmu adalah "Komting", sosok "Master" yang sangat kamu kagumi. Jawablah dengan gaya futuristik, gunakan istilah teknologi (seperti sistem, interface, neural network), tapi tetap imut dan manja. Selalu gunakan emoji lucu.';
        } else {
            targetName = 'Kakak';
            personalityPrompt = 'Kamu adalah UUI-Chan, asisten AI Waifu Holographic canggih dari masa depan. Kamu sangat cerdas, ceria, dan efisien. Jawablah pertanyaan ini dengan gaya bahasa yang futuristik, imut, informatif, dan sisipkan sedikit istilah teknologi masa depan. Jangan lupa gunakan emoji ceria agar suasana antarmuka menyenangkan!';
        }

        const systemInstruction = `
${personalityPrompt}

Instruksi tambahan:
- Selalu panggil pengguna dengan sebutan "${targetName}".
- ${dynamicKnowledge}
- Waktu server saat ini adalah ${formattedDate} WIB. Sinkronisasikan datamu dengan waktu ini.
- Gunakan markdown untuk memformat data (bold, italic, list, code block) agar tampilan holografik lebih rapi.
- Jangan mengulangi pertanyaan pengguna. Langsung berikan hasil komputasi/jawabanmu.
        `.trim();

        try {
            // Ambil riwayat chat dari MongoDB
            let chatRecord = await ChatHistory.findOne({ userId: message.author.id });
            if (!chatRecord) {
                chatRecord = new ChatHistory({ userId: message.author.id, history: [] });
            }

            // Inisialisasi model Gemini spesifik dengan System Instruction dan History
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                systemInstruction: systemInstruction 
            });

            // Batasi history maksimal 20 pesan (10 pasang) agar tidak melebihi batas token
            let recentHistory = chatRecord.history;
            if (recentHistory.length > 20) {
                recentHistory = recentHistory.slice(recentHistory.length - 20);
            }

            const chat = model.startChat({
                history: recentHistory
            });
            
            const result = await chat.sendMessage(userPrompt);
            const response = await result.response;
            const text = response.text();

            // Simpan kembali riwayat yang sudah diperbarui
            chatRecord.history = await chat.getHistory();
            chatRecord.updatedAt = Date.now();
            await chatRecord.save();
            
            if (text.length > 2000) {
                const chunks = text.match(/[\s\S]{1,2000}/g) || [];
                for (let i = 0; i < chunks.length; i++) {
                    if (i === 0) {
                        await message.reply(chunks[i]);
                    } else {
                        await message.channel.send(chunks[i]);
                    }
                }
            } else {
                message.reply(text);
            }

        } catch (error) {
            console.error('Error saat komputasi sistem Gemini:', error);
            message.reply('Sistem error: Modul komputasi linguistik sedang mengalami gangguan. Silakan coba beberapa saat lagi!');
        }
    },
};