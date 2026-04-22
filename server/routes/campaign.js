const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
const Campaign = require('../models/Campaign');
const User = require('../models/User');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function sendBulkEmails(campaign, smtpConfig) {
  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: parseInt(smtpConfig.port),
    secure: smtpConfig.secure,
    auth: { user: smtpConfig.user, pass: smtpConfig.pass }
  });

  campaign.status = 'sending';
  campaign.startedAt = new Date();
  await campaign.save();

  for (let i = 0; i < campaign.recipients.length; i++) {
    const recipient = campaign.recipients[i];
    if (recipient.status === 'sent') continue;

    try {
      const personalizedBody = campaign.body
        .replace(/{{name}}/g, recipient.name || 'Friend')
        .replace(/{{email}}/g, recipient.email);

      await transporter.sendMail({
        from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail}>`,
        to: recipient.email,
        subject: campaign.subject.replace(/{{name}}/g, recipient.name || 'Friend'),
        html: personalizedBody
      });

      campaign.recipients[i].status = 'sent';
      campaign.recipients[i].sentAt = new Date();
      campaign.sentCount += 1;
    } catch (err) {
      campaign.recipients[i].status = 'failed';
      campaign.recipients[i].error = err.message;
      campaign.failedCount += 1;
    }

    await campaign.save();
    await delay(300); // avoid rate limiting
  }

  campaign.status = 'completed';
  campaign.completedAt = new Date();
  await campaign.save();
}

// Create campaign
router.post('/', auth, async (req, res) => {
  try {
    const { name, subject, body, recipients } = req.body;
    const campaign = await Campaign.create({
      user: req.user._id, name, subject, body,
      recipients: recipients.map(r => ({ email: r.email, name: r.name || '' })),
      totalRecipients: recipients.length
    });
    res.status(201).json({ campaign, message: 'Campaign created' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send campaign
router.post('/:id/send', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user._id });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (campaign.status === 'sending') return res.status(400).json({ message: 'Campaign already sending' });

    const user = await User.findById(req.user._id);
    if (!user.smtpConfig?.host) return res.status(400).json({ message: 'SMTP not configured. Go to Settings.' });

    // Fire and forget — don't await so client gets immediate response
    sendBulkEmails(campaign, user.smtpConfig).catch(console.error);
    res.json({ message: 'Campaign sending started!', campaignId: campaign._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all campaigns
router.get('/', auth, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user._id })
      .select('-recipients')
      .sort('-createdAt');
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single campaign with recipients
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findOne({ _id: req.params.id, user: req.user._id });
    if (!campaign) return res.status(404).json({ message: 'Not found' });
    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete campaign
router.delete('/:id', auth, async (req, res) => {
  try {
    await Campaign.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
