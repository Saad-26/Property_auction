import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import connectDB from './config/mongoose.js';
import Property from './models/Property.js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  // 1. Connect MongoDB
  await connectDB();

  console.log('--- Cleaning Databases ---');
  await prisma.bid.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.user.deleteMany();
  await Property.deleteMany({});

  console.log('--- Seeding Data ---');

  // 2. Create Dummy User in Postgres
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: 'hashed_password_placeholder',
      balance: 1000000.0,
    },
  });
  console.log('User created:', user.email);

  // 3. Create Dummy Property in MongoDB
  const propertyId = uuidv4();
  const property = await Property.create({
    propertyId,
    title: 'Modern Glass House - Malibu',
    description: 'Breathtaking 5-bedroom villa with panoramic ocean views and sustainable design.',
    images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811'],
    amenities: ['Pool', 'Smart Home', 'Wine Cellar'],
    location: {
      address: '100 Ocean Blvd',
      city: 'Malibu',
      state: 'CA',
      zipCode: '90265',
      coordinates: { lat: 34.0259, lng: -118.7798 }
    }
  });
  console.log('Property created in MongoDB with ID:', property.propertyId);

  // 4. Create Dummy Auction in Postgres linking to MongoDB
  const now = new Date();
  const auction = await prisma.auction.create({
    data: {
      propertyId: property.propertyId,
      ownerId: user.id,
      startPrice: 2500000,
      currentHighestBid: 2500000,
      status: 'ACTIVE',
      startTime: now,
      endTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });
  console.log('Auction created in Postgres for Property:', auction.id);

  console.log('\n--- Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });
