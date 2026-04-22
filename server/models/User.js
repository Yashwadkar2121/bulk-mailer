const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  smtpConfig: {
    host: String,
    port: { type: Number, default: 587 },
    secure: { type: Boolean, default: false },
    user: String,
    pass: String,
    fromName: String,
    fromEmail: String
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(p) {
  return bcrypt.compare(p, this.password);
};

module.exports = mongoose.model('User', userSchema);
