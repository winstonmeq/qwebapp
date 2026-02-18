import { config } from 'dotenv';
config({ path: '.env' }); // Loads your Next.js env vars
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import UserModel from '../models/User';
import LGUModel from '../models/Lgu';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

/**
 * Seed data for LGUs
 */
const lgus = [
  {
    name: 'Kidapawan City',
    lguCode: 'kidapawan',
    currentLocation: {
      latitude: 7.0103,
      longitude: 125.0889,
      accuracy: 10,
      timestamp: new Date(),
    },
    isActive: true,
  },
  {
    name: 'President Roxas',
    lguCode: 'president-roxas',
    currentLocation: {
      latitude: 7.1542,
      longitude: 125.0631,
      accuracy: 10,
      timestamp: new Date(),
    },
    isActive: true,
  },
];

/**
 * Seed data for Users
 */
const users = [
  // Regular Users
  {
    lguCode: 'kidapawan',
    name: 'Clarence',
    email: 'clarence@example.com',
    password: 'Password123!',
    phone: '+639171234567',
    role: 'user' as const,
    isActive: true,
    lastSeen: new Date(),
    emailVerified: new Date(),
    googleId: undefined, // Standard user
  },
  {
    lguCode: 'president-roxas',
    name: 'Chloe',
    email: 'chloe@example.com',
    password: 'Password123!',
    phone: '+639187654321',
    role: 'user' as const,
    isActive: true,
    lastSeen: new Date(),
    emailVerified: new Date(),
    googleId: '10293847561029384756', // Example Google ID for testing
  },
  // Responders
  {
    lguCode: 'kidapawan',
    name: 'Juan',
    email: 'kidapawan@admin.com',
    password: 'admin12345',
    phone: '+639191234567',
    role: 'responder' as const,
    isActive: true,
    lastSeen: new Date(),
    emailVerified: new Date(),
  },
  {
    lguCode: 'president-roxas',
    name: 'Maria',
    email: 'roxas@admin.com',
    password: 'admin12345',
    phone: '+639197654321',
    role: 'responder' as const,
    isActive: true,
    lastSeen: new Date(),
    emailVerified: new Date(),
  },
  {
    lguCode: 'qalert',
    name: 'admin',
    email: 'admin@admin.com',
    password: 'admin12345',
    phone: '+639073248462',
    role: 'system-admin' as const,
    isActive: true,
    lastSeen: new Date(),
    emailVerified: new Date(),
  },
];

/**
 * Hash passwords
 */
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Main seed function
 */
async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing data...');
    await UserModel.deleteMany({});
    await LGUModel.deleteMany({});
    console.log('✅ Cleared existing data');

    console.log('🌆 Seeding LGUs...');
    const createdLGUs = await LGUModel.insertMany(lgus);
    console.log(`✅ Created ${createdLGUs.length} LGUs`);

    console.log('👥 Seeding Users...');
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await hashPassword(user.password);
        return {
          ...user,
          password: hashedPassword,
        };
      })
    );

    const createdUsers = await UserModel.insertMany(usersWithHashedPasswords);
    console.log(`✅ Created ${createdUsers.length} Users`);

    // Summary Logging
    console.log('\n📊 Seed Summary:');
    console.log('================');
    console.log(`LGUs: ${createdLGUs.length}`);
    console.log(`Users: ${createdUsers.length}`);

    createdUsers.forEach((user) => {
      const authType = user.googleId ? 'Google' : 'Password';
      console.log(`  - ${user.name} (${user.role}) [Auth: ${authType}] - ${user.email}`);
    });

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();