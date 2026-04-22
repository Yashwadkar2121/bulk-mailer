const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user._id);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, smtpConfig: user.smtpConfig } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

router.put('/smtp', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { smtpConfig: req.body }, { new: true });
    res.json({ smtpConfig: user.smtpConfig, message: 'SMTP config saved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
