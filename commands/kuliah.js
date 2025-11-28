// commands/kuliah.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kuliah')
        .setDescription('Gacha nasib: Masuk kuliah atau... bolos?'),

    async execute(interaction) {
        const isMasuk = Math.random() > 0.5; 

        let title, description, color, footer;

        if (isMasuk) {
            title = '🎓 HASILNYA: MASUK KULIAH!';
            color = 0x00FF00; 
            const quotesMasuk = [
                "Ingat, UKT mahal bestie! Ayo bangun!",
                "Titip absen itu dosa, mending berangkat.",
                "Dosennya baik hari ini (mungkin), ayo masuk!",
                "UUI-Chan bakal sedih kalau kamu males-malesan..."
            ];
            description = quotesMasuk[Math.floor(Math.random() * quotesMasuk.length)];
            footer = "Semangat menuntut ilmu!";
        } else {
            // Skenario BOLOS / TIDAK MASUK
            title = '🛌 HASILNYA: GAK USAH MASUK AJA...';
            color = 0xFF0000; // Merah
            const quotesBolos = [
                "Hujan gerimis, kasur lebih manis. Tarik selimut lagi!",
                "Sekali-kali bolos gak bikin DO kok... (tapi jangan keseringan ya).",
                "Bilang aja 'Sakit' (Sakit rindu sama kasur).",
                "Istirahat itu penting untuk kesehatan mental. Tidur aja lagi.",
                "Yaudah, hari ini UUI-Chan izinin libur. Tapi besok masuk ya!"
            ];
            description = quotesBolos[Math.floor(Math.random() * quotesBolos.length)];
            footer = "Disclaimer: UUI-Chan tidak bertanggung jawab kalau dimarahin dosen.";
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .setDescription(`**Kata UUI-Chan:**\n"${description}"`)
            .setFooter({ text: footer })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};