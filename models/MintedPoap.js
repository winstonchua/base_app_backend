const mongoose = require('mongoose');

const MintedPoapSchema = new mongoose.Schema({
  poapContractAddress: { type: String, required: true },
  eventId: { type: String, required: true },
  poapId: { type: String, required: true },
  userAddress: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('MintedPoap', MintedPoapSchema);
