const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.post('/compile', async (req, res) => {
  const { contractTemplate, poapName } = req.body;
  const contractPath = path.join(__dirname, '../contracts', 'GeneratedContract.sol');

  // Write the contract template to a .sol file
  fs.writeFileSync(contractPath, contractTemplate);

  // Use Hardhat to compile the contract
  exec('npx hardhat compile', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${stderr}`);
      res.status(500).json({ error: 'Failed to compile contract' });
      return;
    }

    const artifactPath = path.join(__dirname, '../artifacts/contracts/GeneratedContract.sol', `${poapName}.json`);
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    res.json({ bytecode: artifact.bytecode });
  });
});

module.exports = router;
    