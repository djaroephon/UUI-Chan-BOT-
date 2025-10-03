
const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`Perintah ${interaction.commandName} tidak ditemukan.`);
            return;
        }

        try {
            await command.execute(interaction, interaction.client.geminiModel);
        } catch (error) {
            console.error(`Error saat menjalankan perintah ${interaction.commandName}`);
            console.error(error);
            await interaction.reply({ content: 'Terjadi kesalahan saat menjalankan perintah ini!', ephemeral: true });
        }
    },
};