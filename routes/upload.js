const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Setup storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Upload image endpoint
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let filePath = req.file.path;
  console.log('Original file path:', filePath); // Log original file path

  filePath = filePath.replace(/\\/g, '/'); // Replace backslashes with forward slashes
  console.log('Formatted file path:', filePath); // Log formatted file path

  const tokenURI = `http://localhost:5000/${filePath}`;
  console.log('Generated tokenURI:', tokenURI); // Log generated tokenURI

  res.json({ tokenURI });
});

module.exports = router;
