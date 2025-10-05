const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const jadwalKuliah = {
    0: "Minggu Libur! Saatnya rebahan.", // Minggu
    1: [ // Senin
        { mk: 'Scenario dan Design Game', jam: '08:00 - 11:00', dosen: 'Desita Ria Yusian TB, S.ST.,MT', klm: 'Ibuk' }
    ],
    2: [ // Selasa
        { mk: 'Basis Data', jam: '14:00 - 17:00', dosen: 'M. Bayu Wibawa, S.Kom., MMSI.', klm: 'bapak' }
    ],
    3: [ // Rabu
        { mk: 'Jaringan Komputer', jam: '08:00 - 12:00', dosen: 'Rizka Albar, S.Kom.,MT', klm: 'bapak' },
        { mk: 'Pemrograman Berorientasi Objek', jam: '14:00 - 18:00', dosen: 'Mahendar Dwi Payana, S.ST.,MT', klm: 'bapak' }
    ],
    4: [ // Kamis
        { mk: 'Leadership dan Entrepreneurship', jam: '08:00 - 11:00', dosen: 'Soraya Lestari, SE., M.Si', klm: 'Ibuk' },
        { mk: 'Database Management System', jam: '14:00 - 17:00', dosen: 'M. Bayu Wibawa, S.Kom.,MMSI', klm: 'Bapak' }
    ],
    5: "Tidak ada jadwal hari ini. Semangat nugas!", // Jumat
    6: [ // Sabtu
        { mk: 'Logika Matematika', jam: '10:00 - 13:00', dosen: 'Mahyus Ihsan, M.Si', klm: 'Bapak' },
        { mk: 'Organisasi dan Arsitektur Komputer', jam: '14:00 - 16:00', dosen: 'Rizka Albar, S.Kom.,MT', klm: 'Bapak' }
    ]
};
// ---------------------------------

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jadwal')
        .setDescription('Perintah terkait jadwal kuliah.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('hari-ini')
                .setDescription('Menampilkan jadwal kuliah untuk hari ini.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('besok')
                .setDescription('Menampilkan jadwal kuliah untuk besok.')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const prediksiKehadiran = ['**MASUK** seperti biasa.', '**NGGAK MASUK**, kayaknya ada rapat.', '**NGGAK TAU MASUK APA GAK**, blom ada Info.'];
        
        let targetDay;
        let embedTitle;

        if (subcommand === 'hari-ini') {
            targetDay = new Date().getDay();
            embedTitle = '📚 Jadwal & Ramalan Dosen Hari Ini';
        } else if (subcommand === 'besok') {
            targetDay = (new Date().getDay() + 1) % 7; 
            embedTitle = '📚 Jadwal & Ramalan Dosen Besok';
        }

        const jadwalTarget = jadwalKuliah[targetDay];
        let deskripsiJadwal = '';

        if (Array.isArray(jadwalTarget)) {
            deskripsiJadwal = jadwalTarget.map(kelas => {
                const prediksiAcak = prediksiKehadiran[Math.floor(Math.random() * prediksiKehadiran.length)];
                return `**${kelas.jam}**: **${kelas.mk}**\n> _Kayaknya ${kelas.klm} ${kelas.dosen} besok... ${prediksiAcak}_`;
            }).join('\n\n');
        } else {
            deskripsiJadwal = jadwalTarget;
        }

        const jadwalEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(embedTitle)
            .setDescription(deskripsiJadwal)
            .setFooter({ text: `Khusus untuk Komting & teman-teman!` })
            .setTimestamp();

        await interaction.reply({ embeds: [jadwalEmbed] });
    },
};