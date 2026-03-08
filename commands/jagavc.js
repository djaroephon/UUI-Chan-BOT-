const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jaga-vc')
        .setDescription('Panggil UUI-Chan buat jaga di VC kamu!'),
        
    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({ 
                content: '❌ Kamu harus masuk ke Voice Channel dulu biar aku tau mau nyusul ke mana!', 
                ephemeral: true 
            });
        }

        try {
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
                selfDeaf: true,
                selfMute: true  
            });

            await interaction.reply(`✅ Siap komandan! UUI-Chan udah standby jaga vc di **${voiceChannel.name}** 🕯️🏃‍♂️`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ UUI-Chan gagal masuk VC nih. Coba cek apakah bot punya role/izin buat connect ke VC itu.', 
                ephemeral: true 
            });
        }
    },
};