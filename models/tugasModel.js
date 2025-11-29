const mongoose = require('mongoose');

const tugasSchema = new mongoose.Schema({
    tugasId: { type: Number, required: true, unique: true }, 
    matkul: { type: String, required: true },
    deadline: { type: String, required: true },
    deskripsi: { type: String, required: true },
    addedBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tugas', tugasSchema);