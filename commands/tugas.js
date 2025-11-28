// commands/tugas.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Tentukan path folder dan file secara terpisah
const dataDir = path.join(__dirname, '..', 'data');
const dataPath = path.join(dataDir, 'tugas.json');

// --- PERBAIKAN PENTING: Fungsi memastikan folder & file ada ---
function ensureDataExists() {
    // 1. Cek apakah folder 'data' ada, jika tidak, buat baru
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    // 2. Cek apakah file 'tugas.json' ada, jika tidak, buat file dengan array kosong
    if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
    }
}

// Fungsi membaca data
function loadData() {
    ensureDataExists(); // Pastikan file ada sebelum dibaca
    try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(rawData);
    } catch (e) {
        return [];
    }
}

// Fungsi menyimpan data
function saveData(data) {
    ensureDataExists(); // Pastikan folder ada sebelum ditulis
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tugas')
        .setDescription('Manajemen tugas kuliah (biar gak lupa!).')
        .addSubcommand(subcommand =>
            subcommand
                .setName('tambah')
                .setDescription('Tambah tugas baru.')
                .addStringOption(option => 
                    option.setName('matkul')
                        .setDescription('Nama Mata Kuliah')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('deadline')
                        .setDescription('Kapan? (Bisa Hari: "Senin" atau Tanggal: "25/10")')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('deskripsi')
                        .setDescription('Detail tugasnya apa?')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('lihat')
                .setDescription('Lihat daftar tugas yang belum selesai.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('hapus')
                .setDescription('Hapus tugas yang sudah selesai.')
                .addIntegerOption(option => 
                    option.setName('id')
                        .setDescription('Nomor ID tugas yang mau dihapus')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        let tugasList = loadData();

        if (subcommand === 'tambah') {
            const matkul = interaction.options.getString('matkul');
     
            let deadlineRaw = interaction.options.getString('deadline');
            const deadline = deadlineRaw.charAt(0).toUpperCase() + deadlineRaw.slice(1);          
            const deskripsi = interaction.options.getString('deskripsi');
            const newId = tugasList.length > 0 ? Math.max(...tugasList.map(t => t.id)) + 1 : 1;
            const newTugas = {
                id: newId,
                matkul,
                deadline, 
                deskripsi,
                addedBy: interaction.user.username
            };

            tugasList.push(newTugas);
            saveData(tugasList);

            await interaction.reply(`✅ **Siap!** Tugas **${matkul}** berhasil dicatat dengan ID **${newId}**.\n📅 Deadline: **${deadline}**`);

        } else if (subcommand === 'lihat') {
            if (tugasList.length === 0) {
                return interaction.reply('🎉 **Asik!** Belum ada tugas yang tercatat. Nikmati kebebasanmu!');
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFA500) // Oranye
                .setTitle('📝 Daftar Tugas Kuliah')
                .setDescription('Ayo dikerjain, jangan nunggu deadline mepet!')
                .setTimestamp();

            tugasList.forEach(t => {
                embed.addFields({
                    name: `[ID: ${t.id}] ${t.matkul}`,
                    value: `📅 **Deadline:** ${t.deadline}\nℹ️ **Ket:** ${t.deskripsi}\n👤 *Ditambah oleh: ${t.addedBy}*`
                });
            });

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'hapus') {
            const idToDelete = interaction.options.getInteger('id');
            const index = tugasList.findIndex(t => t.id === idToDelete);

            if (index === -1) {
                return interaction.reply({ content: `❌ Tugas dengan ID **${idToDelete}** tidak ditemukan. Cek lagi pakai \`/tugas lihat\`.`, ephemeral: true });
            }

            const deletedTask = tugasList.splice(index, 1)[0];
            saveData(tugasList);

            await interaction.reply(`🗑️ **Mantap!** Tugas **${deletedTask.matkul}** (ID: ${idToDelete}) sudah dihapus. Satu beban hidup berkurang!`);
        }
    },
};