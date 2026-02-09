require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Check env
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI;

// User schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin', 'responder'], default: 'user' },
  isActive: { type: Boolean, default: true },
  lastSeen: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠ Users already exist. Skipping seed.');
      process.exit(0);
    }

    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        phone: '+639111111111',
        role: 'admin',
      },
      {
        name: 'John Doe',
        email: 'user@example.com',
        password: await bcrypt.hash('user123', 10),
        phone: '+639222222222',
        role: 'user',
      },
      {
        name: 'Emergency Responder',
        email: 'responder@example.com',
        password: await bcrypt.hash('responder123', 10),
        phone: '+639333333333',
        role: 'responder',
      },
    ];

    await User.insertMany(users);
    console.log('✅ Demo users created successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('User: user@example.com / user123');
    console.log('Responder: responder@example.com / responder123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
