const mongoose = require('mongoose');

const poapSchema = new mongoose.Schema({
  address: { type: String, required: true },
  deployedAt: { type: Date, default: Date.now }
});

const eventSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  category: String,
  owner: String,
  eventId: { type: Number, unique: true, required: true },
  poapContracts: { type: [poapSchema], default: [] } // Update schema to use poapContracts array of objects
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
