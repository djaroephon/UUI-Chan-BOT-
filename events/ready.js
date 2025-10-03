
const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ UUI-Chan sudah online sebagai ${client.user.tag}!`);

        try {
            const commandsData = client.commands.map(cmd => cmd.data.toJSON());
            await client.application.commands.set(commandsData);
            console.log(`✅ ${commandsData.length} slash commands berhasil didaftarkan!`);
        } catch (error) {
            console.error('❌ Gagal mendaftarkan slash commands:', error);
        }
    },
};