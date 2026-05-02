const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    history: { type: Array, default: [] },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
