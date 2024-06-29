const mongoose = require('mongoose');

const nonceSchema = new mongoose.Schema({
    nonce: { type: String, required: true, unique: true },
    poapContractAddress: { type: String, required: true },
    eventId: { type: String, required: true },
    poapId: { type: String, required: true },
    type: { type: String, enum: ['single-use', 'general'], required: true },
    createdAt: { type: Date, default: Date.now },
    used: { type: Boolean, default: false }
});

const Nonce = mongoose.model('Nonce', nonceSchema);

module.exports = Nonce;
