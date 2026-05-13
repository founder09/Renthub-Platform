const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');

const COLLEGES = [
  'IIT Delhi', 'IIT Bombay', 'IIT Madras', 'NIT Trichy',
  'Delhi University', 'Mumbai University', 'VIT Vellore',
  'BITS Pilani', 'Manipal Institute of Technology', 'Anna University',
];

const userSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true, minlength: 6 },
  phone:        { type: String, default: '' },
  college:      { type: String, enum: [...COLLEGES, ''], default: '' },
  role:         { type: String, enum: ['tenant', 'owner', 'admin'], default: 'tenant' },
  isVerified:   { type: Boolean, default: false },
  avatar:       { type: String, default: '' },
  ownerProof:   { type: String, default: '' },
  savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare plain password with stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate a signed JWT
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, username: this.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
module.exports.COLLEGES = COLLEGES;
