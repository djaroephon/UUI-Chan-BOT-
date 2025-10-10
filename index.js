require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cron = require('node-cron');
const express = require('express'); 

const app = express();
const port = process.env.PORT || 3000; 

app.get('/', (req, res) => {
  res.send('UUI-Chan is alive!');
});

app.listen(port, () => {
  console.log(`✅ Server web mini berjalan di port ${port}`);
});


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ]
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
client.geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[PERINGATAN] Perintah di ${filePath} tidak memiliki properti "data" atau "execute".`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

cron.schedule('0 8 * * 1', async () => {
    const channelId = process.env.CHANNEL_ID; 
    const channel = await client.channels.fetch(channelId);

    if (channel) {
        channel.send("Selamat hari Senin, semuanya! Semoga harimu senin selalu (semangat dan indah)! ✨");
        console.log(`Pesan hari Senin terkirim ke channel ${channel.name}`);
    } else {
        console.log(`Channel dengan ID ${channelId} tidak ditemukan.`);
    }
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});

console.log('✅ Penjadwal pesan hari Senin sudah aktif.');

client.login(process.env.DISCORD_TOKEN);