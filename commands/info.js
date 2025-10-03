const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Menampilkan info tentang server atau user.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Info tentang seorang user')
                .addUserOption(option => option.setName('target').setDescription('User yang dipilih')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Info tentang server ini')),

    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'user') {
            const user = interaction.options.getUser('target') || interaction.user;

            const userEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`Informasi User: ${user.username}`)
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: 'Username', value: user.tag, inline: true },
                    { name: 'ID', value: user.id, inline: true },
                    { name: 'Bergabung pada', value: user.createdAt.toLocaleDateString('id-ID'), inline: false },
                )
                .setTimestamp();

            await interaction.reply({ embeds: [userEmbed] });

        } else if (interaction.options.getSubcommand() === 'server') {
            const server = interaction.guild;

            const serverEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`Informasi Server: ${server.name}`)
                .setThumbnail(server.iconURL())
                .addFields(
                    { name: 'Nama Server', value: server.name, inline: true },
                    { name: 'ID Server', value: server.id, inline: true },
                    { name: 'Jumlah Anggota', value: `${server.memberCount} anggota`, inline: false },
                    { name: 'Dibuat pada', value: server.createdAt.toLocaleDateString('id-ID'), inline: false },
                )
                .setTimestamp();

            await interaction.reply({ embeds: [serverEmbed] });
        }
    },
};