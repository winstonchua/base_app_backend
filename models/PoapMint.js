// backend/models/PoapMint.js
const mongoose = require('mongoose');

const PoapMintSchema = new mongoose.Schema({
  userAddress: String,
  poapContractAddress: String,
  tokenId: Number,
  eventId: String,
});

module.exports = mongoose.model('PoapMint', PoapMintSchema);
