import mongoose from 'mongoose';
import { seedDemoData } from './seedDemo.js';

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/patient_rms';

  // 1. Try external / local MongoDB instance
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`✓ Connected to MongoDB server: ${conn.connection.host}`);
    await seedDemoData();
    return;
  } catch (error) {
    console.log(`ℹ️ External MongoDB not active at ${uri}.`);
    console.log(`🚀 Starting embedded in-memory MongoDB engine for zero-setup demo...`);
  }

  // 2. Fallback to embedded MongoMemoryServer
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongod = await MongoMemoryServer.create({
      instance: { dbName: 'patient_rms' }
    });
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✓ Embedded MongoDB Engine Ready: ${memoryUri}`);
    await seedDemoData();
  } catch (embeddedErr) {
    console.error(`⚠️ Embedded MongoDB failed to initialize: ${embeddedErr.message}`);
    console.log(`ℹ️ Please ensure MongoDB service is started on localhost:27017 or provide MONGODB_URI in .env`);
  }
};

export default connectDB;
