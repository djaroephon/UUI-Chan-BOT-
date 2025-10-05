const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const jadwalKuliah = {
    0: "Minggu Libur! Saatnya rebahan.", // Minggu
    1: [ // Senin
        { mk: 'Scenario dan Design Game', jam: '08:00 - 11:00', dosen: 'Desita Ria Yusian TB, S.ST.,MT' }
    ],
    2: [ // Selasa
        { mk: 'Basis Data', jam: '14:00 - 17:00', dosen: 'M. Bayu Wibawa, S.Kom., MMSI.' }
    ],
    3: [ // Rabu
        { mk: 'Jaringan Komputer', jam: '08:00 - 12:00', dosen: 'Rizka Albar, S.Kom.,MT' },
        { mk: 'Pemrograman Berorientasi Objek', jam: '14:00 - 18:00', dosen: 'Mahendar Dwi Payana, S.ST.,MT' }
    ],
    4: [ // Kamis
        { mk: 'Leadership dan Entrepreneurship', jam: '08:00 - 11:00', dosen: 'Soraya Lestari, SE., M.Si' },
        { mk: 'Database Management System', jam: '14:00 - 17:00', dosen: 'M. Bayu Wibawa, S.Kom.,MMSI' }
    ],
    5: "Tidak ada jadwal hari ini. Semangat nugas!", // Jumat
    6: [ // Sabtu
        { mk: 'Logika Matematika', jam: '10:00 - 13:00', dosen: 'Mahyus Ihsan, M.Si' },
        { mk: 'Organisasi dan Arsitektur Komputer', jam: '14:00 - 16:00', dosen: 'Rizka Albar, S.Kom.,MT' }
    ]
};
// ---------------------------------

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jadwal')
        .setDescription('Menampilkan jadwal kuliah hari ini beserta ramalan kehadiran dosen.'),

    async execute(interaction) {
        const prediksiKehadiran = ['**MASUK** seperti biasa.', '**NGGAK MASUK**, kayaknya ada rapat.', '**NGGAK TAU MASUK APA GAK**, infonya simpang siur.'];

        const hariIni = new Date().getDay();
        const jadwalHariIni = jadwalKuliah[hariIni];
        let deskripsiJadwal = '';

        if (Array.isArray(jadwalHariIni)) {
            deskripsiJadwal = jadwalHariIni.map(kelas => {
                const prediksiAcak = prediksiKehadiran[Math.floor(Math.random() * prediksiKehadiran.length)];
                return `**${kelas.jam}**: **${kelas.mk}**\n> _Kayaknya ${kelas.dosen} hari ini... ${prediksiAcak}_`;
            }).join('\n\n'); 
        } else {
            // Jika libur atau tidak ada jadwal
            deskripsiJadwal = jadwalHariIni;
        }

        const jadwalEmbed = new EmbedBuilder()
            .setColor(0x0099FF) // Biru
            .setTitle('📚 Jadwal & Ramalan Dosen Hari Ini')
            .setDescription(deskripsiJadwal)
            .setFooter({ text: `Khusus untuk Komting & teman-teman!` })
            .setTimestamp();

        await interaction.reply({ embeds: [jadwalEmbed] });
    },
};