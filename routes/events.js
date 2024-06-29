const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Fetch all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.json(newEvent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Endpoint to get the latest eventId
router.get('/latestId', async (req, res) => {
  try {
    const latestEvent = await Event.findOne().sort({ eventId: -1 });
    const latestEventId = latestEvent ? latestEvent.eventId : 0;
    res.json({ latestEventId });
  } catch (err) {
    console.error('Error fetching latest event ID:', err);
    res.status(500).json({ error: 'Failed to fetch latest event ID' });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    await Event.findByIdAndDelete(eventId);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch event by eventId
router.get('/:eventId', async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.eventId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update event contract
router.put('/:eventId/contract', async (req, res) => {
  const { eventId } = req.params;
  const { contractAddress } = req.body;
  try {
    const event = await Event.findOneAndUpdate(
      { eventId: eventId },
      { $push: { poapContracts: { address: contractAddress } } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event contract
router.delete('/:eventId/contract/:contractAddress', async (req, res) => {
  const { eventId, contractAddress } = req.params;
  try {
    const event = await Event.findOneAndUpdate(
      { eventId: eventId },
      { $pull: { poapContracts: { address: contractAddress } } },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get POAP contracts for event
router.get('/:eventId/poaps', async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: req.params.eventId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event.poapContracts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
