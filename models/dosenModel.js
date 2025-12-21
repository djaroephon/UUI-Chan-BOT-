const mongoose = require('mongoose');

const dosenSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    nomor: { type: String, required: true },
    matkul: { type: String, required: false },
    panggilan: { type: String, required: true, enum: ['Bapak', 'Ibu'] } 
});

module.exports = mongoose.model('Dosen', dosenSchema);