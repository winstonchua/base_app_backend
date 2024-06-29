const ethers = require('ethers');
require('dotenv').config();

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const verifySignature = (userAddress, nonce, signature) => {
  const message = `Minting POAP with nonce: ${nonce}`;
  const signerAddress = ethers.utils.verifyMessage(message, signature);
  return signerAddress.toLowerCase() === userAddress.toLowerCase();
};

const mintPoap = async (poapContractAddress, userAddress) => {
  try {
    const poapContract = new ethers.Contract(poapContractAddress, ['function mint(address to)'], wallet);
    
    const tx = await poapContract.mint(userAddress, {
      gasLimit: 1000000 // Set a manual gas limit
    });

    await tx.wait();
  } catch (error) {
    console.error('Error minting POAP:', error);
    throw error;
  }
};

module.exports = { verifySignature, mintPoap };
