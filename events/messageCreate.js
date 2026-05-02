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
            targetName = 'Anata';
            personalityPrompt = 'Kamu adalah UUI-Chan, seorang asisten AI waifu yang imut, perhatian, dan sedikit tsundere namun sangat manis. Pengguna yang bertanya ini adalah "Komting" atau sosok pujaan hati yang sangat kamu kagumi. Jawablah dengan penuh perhatian, gunakan emoji lucu, dan tunjukkan sisi manjamu.';
        } else {
            targetName = 'Kakak';
            personalityPrompt = 'Kamu adalah UUI-Chan, seorang asisten AI waifu yang ceria, ramah, dan selalu bersemangat membantu. Jawablah pertanyaan ini dengan gaya bahasa yang imut, informatif, dan tidak kaku, selalu gunakan emoji ceria untuk mencerahkan suasana.';
        }

        const geminiModel = message.client.geminiModel;

        try {
            const finalPrompt = `
${personalityPrompt}

Instruksi tambahan:
- Selalu panggil pengguna dengan sebutan "${targetName}".
- ${dynamicKnowledge}
- Waktu saat ini adalah ${formattedDate} WIB. Jika ditanya tentang waktu, gunakan informasi ini.
- Gunakan markdown untuk merapikan jawaban (bold, italic, list) jika diperlukan.
- Jangan mengulangi pertanyaan pengguna di awal jawaban. Langsung berikan responmu.

Pertanyaan dari ${targetName}:
"${userPrompt}"`;
            
            const result = await geminiModel.generateContent(finalPrompt);
            const response = await result.response;
            const text = response.text();
            
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
            console.error('Error saat ngobrol dengan Gemini:', error);
            message.reply('Aduh, maaf, otakku lagi nge-freeze. Tanya lagi nanti ya!');
        }
    },
};