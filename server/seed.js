require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Listing = require('./models/Listing');

// Fallback images from Unsplash for testing
const IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&q=80',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
  'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
];

const LOCATIONS = [
  { location: 'Hauz Khas, New Delhi', country: 'India', coords: [77.1988, 28.5494], college: 'IIT Delhi' },
  { location: 'Powai, Mumbai', country: 'India', coords: [72.9051, 19.1197], college: 'IIT Bombay' },
  { location: 'Guindy, Chennai', country: 'India', coords: [80.2354, 13.0067], college: 'IIT Madras' },
  { location: 'Vellore, Tamil Nadu', country: 'India', coords: [79.1325, 12.9165], college: 'VIT Vellore' },
  { location: 'Pilani, Rajasthan', country: 'India', coords: [75.5870, 28.3611], college: 'BITS Pilani' },
  { location: 'Manipal, Karnataka', country: 'India', coords: [74.7849, 13.3409], college: 'Manipal Institute' },
  { location: 'North Campus, Delhi', country: 'India', coords: [77.2066, 28.6921], college: 'Delhi University' },
  { location: 'Koregaon Park, Pune', country: 'India', coords: [73.8968, 18.5362], college: 'Pune University' },
  { location: 'Whitefield, Bangalore', country: 'India', coords: [77.7499, 12.9698], college: 'Bangalore University' },
  { location: 'Salt Lake, Kolkata', country: 'India', coords: [88.4029, 22.5804], college: 'Jadavpur University' },
];

const AMENITIES = ['WiFi', 'AC', 'Meals', 'Laundry', 'Parking', 'Gym', 'CCTV', 'Furnished'];
const PROPERTY_TYPES = ['Room', 'PG', 'Flat', 'Hostel', 'Studio'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr, max) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * max) + 1);
};

async function seedDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.ATLASDB_URL || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/renthub');
    console.log('Connected!');

    console.log('Clearing old test data (optional, skipping clear to preserve your admin users, just adding new ones)...');

    // Create 5 test users
    console.log('Creating users...');
    const users = [];
    for (let i = 1; i <= 5; i++) {
      let user = await User.findOne({ username: `testhost${i}` });
      if (!user) {
        user = new User({
          username: `testhost${i}`,
          email: `host${i}@renthub.com`,
          password: 'password123', // Will be hashed by pre-save
          role: 'landlord',
          isVerified: true,
          phone: `+91 987654321${i}`,
        });
        await user.save();
      }
      users.push(user);
    }

    // Create 20 listings
    console.log('Creating 20 listings...');
    const createdListings = [];

    for (let i = 1; i <= 20; i++) {
      const host = getRandom(users);
      const loc = getRandom(LOCATIONS);
      const pType = getRandom(PROPERTY_TYPES);
      const mainImg = getRandom(IMAGES);
      
      const imagesSubset = getRandomSubset(IMAGES, 4);
      const roomImages = imagesSubset.map(url => ({ url, filename: 'dummy' }));

      const listing = new Listing({
        title: `Premium ${pType} near ${loc.college}`,
        description: `This is a beautiful and fully furnished ${pType} located in ${loc.location}. Perfect for students studying at ${loc.college}. Features modern amenities, 24/7 security, and a very quiet environment for studying.`,
        image: { url: mainImg, filename: 'dummy_main' },
        roomImages: roomImages,
        price: Math.floor(Math.random() * 15000) + 5000,
        securityDeposit: Math.floor(Math.random() * 20000) + 10000,
        location: loc.location,
        country: loc.country,
        listingType: pType,
        bedrooms: Math.floor(Math.random() * 3) + 1,
        bathrooms: Math.floor(Math.random() * 2) + 1,
        maxGuests: Math.floor(Math.random() * 4) + 1,
        floorSize: Math.floor(Math.random() * 1000) + 300,
        amenities: getRandomSubset(AMENITIES, 6),
        houseRules: ['No smoking indoors', 'No loud music after 10 PM', 'Keep common areas clean'],
        nearCollege: loc.college,
        gender: getRandom(['Any', 'Male', 'Female']),
        isFeatured: Math.random() > 0.8,
        viewCount: Math.floor(Math.random() * 500),
        ownerContact: {
          name: host.username,
          phone: host.phone,
          email: host.email,
        },
        owner: host._id,
        geometry: {
          type: 'Point',
          coordinates: loc.coords,
        },
      });

      await listing.save();
      createdListings.push(listing);
      console.log(`Created listing ${i}/20`);
    }

    console.log('✅ Successfully seeded 20 listings!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding DB:', err);
    process.exit(1);
  }
}

seedDB();
