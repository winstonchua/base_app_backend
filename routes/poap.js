const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Nonce = require('../models/Nonce');
const MintedPoap = require('../models/MintedPoap');
const Event = require('../models/Event');
const { verifySignature, mintPoap } = require('../services/poapService');
const ethers = require('ethers');
require('dotenv').config();

// Generate mint link
router.post('/generate-mint-link', async (req, res) => {
  const { poapContractAddress, eventId, poapId, type } = req.body;
  const nonce = crypto.randomBytes(16).toString('hex');

  // If generating a single-use nonce, invalidate the previous nonce
  if (type === 'single-use') {
    await Nonce.updateMany({ poapContractAddress, eventId, poapId, type }, { used: true });
  }

  const newNonce = new Nonce({
    nonce,
    poapContractAddress,
    eventId,
    poapId,
    type
  });

  try {
    await newNonce.save();
    res.json({ link: `http://localhost:5173/mint-poap/${poapContractAddress}/${eventId}/${poapId}/${nonce}` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate mint link' });
  }
});

// Route to mint POAP
router.post('/mint-poap', async (req, res) => {
  const { poapContractAddress, eventId, poapId, nonce, userAddress, signature } = req.body;

  try {
    // Validate nonce
    const existingNonce = await Nonce.findOne({ nonce, poapContractAddress, eventId, poapId });

    if (!existingNonce) {
        return res.status(400).json({ error: 'Invalid nonce' });
    }

    if (existingNonce.type === 'single-use' && existingNonce.used) {
        return res.status(400).json({ error: 'Nonce already used' });
    }

    if (existingNonce.type === 'general') {
        const alreadyMinted = await MintedPoap.findOne({ poapContractAddress, eventId, poapId, userAddress });
        if (alreadyMinted) {
            return res.status(400).json({ error: 'You can only mint once using this link' });
        }
    }

    // Verify the signature
    const isValidSignature = verifySignature(userAddress, nonce, signature);
    if (!isValidSignature) {
        console.log('Invalid signature');
        return res.status(400).json({ error: 'Invalid signature' });
    }

    // Mint the POAP
    await mintPoap(poapContractAddress, userAddress, poapId); // Ensure mintPoap function is correctly implemented

    // Mark nonce as used if single-use
    if (existingNonce.type === 'single-use') {
        existingNonce.used = true;
        await existingNonce.save();
    }

    // Record the minted POAP
    await new MintedPoap({ poapContractAddress, eventId, poapId, userAddress }).save();

    res.json({ message: 'POAP minted successfully' });
  } catch (error) {
    console.error('Error minting POAP:', error);
    res.status(500).json({ error: 'Failed to mint POAP' });
  }
});

router.get('/user/:userAddress', async (req, res) => {
  const { userAddress } = req.params;

  try {
    const poaps = await MintedPoap.find({ userAddress });
    const enrichedPoaps = await Promise.all(poaps.map(async (poap) => {
      if (!poap.poapId) {
        console.error('Missing poapId for POAP:', poap);
        return null;
      }

      const tokenURI = await getTokenURI(poap.poapContractAddress, poap.poapId);
      const event = await Event.findOne({ eventId: poap.eventId });

      return {
        ...poap._doc,
        tokenURI,
        eventName: event.name,
        poapContractAddress: poap.poapContractAddress,
        poapId: poap.poapId
      };
    }));

    const filteredPoaps = enrichedPoaps.filter(poap => poap !== null); // Remove any null values
    res.json(filteredPoaps);
  } catch (error) {
    console.error('Error fetching POAPs:', error);
    res.status(500).json({ error: 'Failed to fetch POAPs' });
  }
});

const getTokenURI = async (contractAddress, poapId) => {
  if (typeof poapId === 'undefined') {
    throw new Error('poapId is undefined');
  }
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const contract = new ethers.Contract(contractAddress, ['function tokenURI(uint256 tokenId) view returns (string)'], provider);

  try {
    return await contract.tokenURI(1);
  } catch (error) {
    console.error('Error fetching token URI:', error);
    throw new Error('Failed to fetch token URI');
  }
};

module.exports = router;