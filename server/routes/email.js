const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Test SMTP connection
router.post('/test-smtp', auth, async (req, res) => {
  try {
    const { host, port, secure, user, pass } = req.body;
    const transporter = nodemailer.createTransport({ host, port: parseInt(port), secure, auth: { user, pass } });
    await transporter.verify();
    res.json({ success: true, message: 'SMTP connection successful!' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Parse CSV file → return emails
router.post('/parse-csv', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const results = [];
    const stream = Readable.from(req.file.buffer.toString());
    stream.pipe(csv())
      .on('data', (row) => {
        const email = row.email || row.Email || row.EMAIL || Object.values(row)[0];
        const name = row.name || row.Name || row.NAME || '';
        if (email && email.includes('@')) results.push({ email: email.trim(), name: name.trim() });
      })
      .on('end', () => res.json({ recipients: results, count: results.length }))
      .on('error', (err) => res.status(400).json({ message: 'CSV parse error: ' + err.message }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
