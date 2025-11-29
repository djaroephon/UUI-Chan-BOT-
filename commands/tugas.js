// commands/tugas.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Tugas = require('../models/tugasModel'); 

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tugas')
        .setDescription('Manajemen tugas kuliah (Data Aman di Database!).')
        .addSubcommand(subcommand =>
            subcommand
                .setName('tambah')
                .setDescription('Tambah tugas baru.')
                .addStringOption(option => option.setName('matkul').setDescription('Nama Mata Kuliah').setRequired(true))
                .addStringOption(option => option.setName('deadline').setDescription('Kapan? (Contoh: Senin)').setRequired(true))
                .addStringOption(option => option.setName('deskripsi').setDescription('Detail tugasnya apa?').setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('lihat')
                .setDescription('Lihat daftar tugas yang belum selesai.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('hapus')
                .setDescription('Hapus tugas yang sudah selesai.')
                .addIntegerOption(option => option.setName('id').setDescription('Nomor ID tugas').setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'tambah') {
            await interaction.deferReply(); 
            
            const matkul = interaction.options.getString('matkul');
            let deadlineRaw = interaction.options.getString('deadline');
            const deadline = deadlineRaw.charAt(0).toUpperCase() + deadlineRaw.slice(1);
            const deskripsi = interaction.options.getString('deskripsi');

            try {
                const lastTugas = await Tugas.findOne().sort({ tugasId: -1 });
                const newId = lastTugas ? lastTugas.tugasId + 1 : 1;

                const newTugas = new Tugas({
                    tugasId: newId,
                    matkul,
                    deadline,
                    deskripsi,
                    addedBy: interaction.user.username
                });
                await newTugas.save();

                await interaction.editReply(`✅ **Tersimpan di Cloud!** Tugas **${matkul}** (ID: ${newId}) aman.`);
            } catch (error) {
                console.error(error);
                await interaction.editReply('❌ Gagal menyimpan ke database. Coba lagi nanti.');
            }

        } else if (subcommand === 'lihat') {
            await interaction.deferReply();
            
            const tugasList = await Tugas.find().sort({ tugasId: 1 });

            if (tugasList.length === 0) {
                return interaction.editReply('🎉 **Asik!** Tidak ada tugas di database.');
            }

            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('📝 Daftar Tugas Kuliah (MongoDB)')
                .setDescription('Data ini aman permanen!')
                .setTimestamp();

            tugasList.forEach(t => {
                embed.addFields({
                    name: `[ID: ${t.tugasId}] ${t.matkul}`,
                    value: `📅 **Deadline:** ${t.deadline}\nℹ️ **Ket:** ${t.deskripsi}\n👤 *Added by: ${t.addedBy}*`
                });
            });

            await interaction.editReply({ embeds: [embed] });

        } else if (subcommand === 'hapus') {
            await interaction.deferReply();
            const idToDelete = interaction.options.getInteger('id');

            const result = await Tugas.findOneAndDelete({ tugasId: idToDelete });

            if (!result) {
                return interaction.editReply(`❌ Tugas ID **${idToDelete}** tidak ditemukan di database.`);
            }

            await interaction.editReply(`🗑️ **Dihapus!** Tugas **${result.matkul}** sudah hilang dari database.`);
        }
    },
};