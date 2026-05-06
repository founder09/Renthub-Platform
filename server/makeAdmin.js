require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function makeAdmin(email) {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (user) {
      console.log(`✅ User ${user.email} is now an ADMIN!`);
    } else {
      console.log(`❌ User with email ${email} not found.`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

// Get email from command line args
const email = process.argv[2];
if (!email) {
  console.log('Please provide an email: node makeAdmin.js <email>');
  process.exit(1);
}

makeAdmin(email);
