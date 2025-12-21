// commands/dosen.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Dosen = require('../models/dosenModel');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dosen')
        .setDescription('Manajemen kontak Dosen & Generator Pesan WA.')
        // --- FITUR 1: INGATKAN DOSEN (TEMPLATE WA) ---
        .addSubcommand(subcommand =>
            subcommand
                .setName('ingatkan')
                .setDescription('Buat template chat WA pengingat kuliah.')
                .addStringOption(option => 
                    option.setName('nama')
                        .setDescription('Nama dosennya siapa?')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('kapan')
                        .setDescription('Kapan kuliahnya?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Hari ini', value: 'hari ini' },
                            { name: 'Besok', value: 'besok' }
                        ))
                .addStringOption(option => 
                    option.setName('jam')
                        .setDescription('Jam berapa? (Contoh: 08:00 WIB)')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('pengirim')
                        .setDescription('Nama kamu (Kosongkan jika ingin pakai default Djaroephon)')
                        .setRequired(false)))
        // --- FITUR 2: TAMBAH DATA (KHUSUS KOMTING) ---
        .addSubcommand(subcommand =>
            subcommand
                .setName('tambah')
                .setDescription('Simpan data dosen baru (Khusus Komting).')
                .addStringOption(option => option.setName('nama').setDescription('Nama Dosen').setRequired(true))
                .addStringOption(option => option.setName('nomor').setDescription('Nomor WA (08...)').setRequired(true))
                .addStringOption(option => 
                    option.setName('panggilan')
                        .setDescription('Beliau Bapak atau Ibu?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Bapak', value: 'Bapak' },
                            { name: 'Ibu', value: 'Ibu' }
                        ))
                .addStringOption(option => option.setName('matkul').setDescription('Matkul apa?').setRequired(true)))
        // --- FITUR 3: HAPUS DATA ---
        .addSubcommand(subcommand =>
            subcommand
                .setName('hapus')
                .setDescription('Hapus data dosen.')
                .addStringOption(option => option.setName('nama').setDescription('Nama dosen').setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const allowedRoleName = 'Komting'; // Ganti sesuai role di servermu

        // --- LOGIKA: INGATKAN DOSEN (GENERATE WA) ---
        if (subcommand === 'ingatkan') {
            const keyword = interaction.options.getString('nama');
            const kapan = interaction.options.getString('kapan');
            const jam = interaction.options.getString('jam');
            
            // Default nama pengirim sesuai request kamu
            const defaultPengirim = "Djaroephon Djohan Syuhada";
            const pengirimInput = interaction.options.getString('pengirim');
            const namaPengirim = pengirimInput || defaultPengirim;

            // Cari data dosen di database
            const dosen = await Dosen.findOne({ nama: { $regex: keyword, $options: 'i' } });

            if (!dosen) {
                return interaction.reply(`❌ Data Pak/Bu **${keyword}** tidak ditemukan. Tambahkan dulu pakai \`/dosen tambah\`.`);
            }

            // TEMPLATE PESAN WA (Sesuai Request)
            const templatePesan = `Assalamualaikum Wr.Wb.

Saya ${namaPengirim}, Mahasiswa Informatika letting 24.
Maaf mengganggu waktunya ${dosen.panggilan}.
Izin mengingatkan bahwa ${kapan} ada MK ${dosen.panggilan} di jam ${jam} pada MK ${dosen.matkul}.

Atas waktu dan perhatian ${dosen.panggilan},
Saya ucapkan terima kasih.

Wassalamu'alaikum wr.wb`;

            const encodedText = encodeURIComponent(templatePesan);
            const waLink = `https://wa.me/${dosen.nomor}?text=${encodedText}`;

            const embed = new EmbedBuilder()
                .setColor(0x25D366)
                .setTitle(`📲 Template Chat ke ${dosen.panggilan} ${dosen.nama}`)
                .setDescription(`**Preview Pesan:**\n\`\`\`${templatePesan}\`\`\``)
                .addFields({ 
                    name: '👇 KLIK TOMBOL DI BAWAH', 
                    value: `👉 **[BUKA WHATSAPP SEKARANG](${waLink})**` 
                })
                .setFooter({ text: 'Tinggal klik, gak perlu ngetik ulang!' });

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'tambah') {
            if (!interaction.member.roles.cache.some(role => role.name === allowedRoleName)) {
                return interaction.reply({ content: '⛔ Khusus Komting ya!', ephemeral: true });
            }

            const nama = interaction.options.getString('nama');
            const nomorRaw = interaction.options.getString('nomor');
            const panggilan = interaction.options.getString('panggilan'); // Bapak/Ibu
            const matkul = interaction.options.getString('matkul');

            let cleanNomor = nomorRaw.replace(/\D/g, ''); 
            if (cleanNomor.startsWith('0')) cleanNomor = '62' + cleanNomor.slice(1);

            try {
                const newDosen = new Dosen({ nama, nomor: cleanNomor, panggilan, matkul });
                await newDosen.save();
                await interaction.reply(`✅ **Sukses!** Data **${panggilan} ${nama}** (MK: ${matkul}) berhasil disimpan.`);
            } catch (error) {
                console.error(error);
                await interaction.reply('❌ Gagal menyimpan. Pastikan datanya belum ada.');
            }

        } else if (subcommand === 'hapus') {
            if (!interaction.member.roles.cache.some(role => role.name === allowedRoleName)) {
                return interaction.reply({ content: '⛔ Khusus Komting ya!', ephemeral: true });
            }

            const nama = interaction.options.getString('nama');
            const result = await Dosen.findOneAndDelete({ nama: { $regex: nama, $options: 'i' } });

            if (!result) {
                return interaction.reply(`❌ Tidak ada dosen bernama **${nama}**.`);
            }
            await interaction.reply(`🗑️ Data **${result.nama}** berhasil dihapus.`);
        }
    },
};