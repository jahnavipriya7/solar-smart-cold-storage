const mongoose = require('mongoose');
const StorageSlot = require('../models/StorageSlot');
const Alert = require('../models/Alert');

async function seedInitialData() {
  const count = await StorageSlot.countDocuments();
  if (count === 0) {
    console.log('🌱 Seeding initial cold storage chambers...');
    const slot1 = await StorageSlot.create({
      allocatedSlot: 'Chamber A-101',
      farmerName: 'Ramesh Kumar',
      farmerPhone: '+91 98765 43210',
      vegetables: [
        { name: 'Carrot', emoji: '🥕', minTemp: 0, maxTemp: 2, minHumidity: 95, maxHumidity: 100, shelfLifeDays: 35, category: 'Root' },
        { name: 'Spinach', emoji: '🥬', minTemp: 0, maxTemp: 2, minHumidity: 95, maxHumidity: 100, shelfLifeDays: 12, category: 'Leafy' }
      ],
      minTemp: 0,
      maxTemp: 2,
      targetTemp: 1.0,
      minHumidity: 95,
      maxHumidity: 100,
      targetHumidity: 97,
      currentTemp: 1.2,
      currentHumidity: 97,
      powerSource: 'Solar',
      outsideTemp: 34.2,
      outsideHumidity: 65,
      coolingLoad: 'High',
      coolingLoadPct: 82,
      gasPpm: 12.4,
      spoilageStatus: 'Fresh',
      status: 'active',
      notes: 'Optimal solar cooling active'
    });

    const slot2 = await StorageSlot.create({
      allocatedSlot: 'Chamber B-102',
      farmerName: 'Sita Devi',
      farmerPhone: '+91 91234 56789',
      vegetables: [
        { name: 'Potato', emoji: '🥔', minTemp: 4, maxTemp: 7, minHumidity: 95, maxHumidity: 98, shelfLifeDays: 180, category: 'Root' },
        { name: 'Beans', emoji: '🫘', minTemp: 4, maxTemp: 7, minHumidity: 90, maxHumidity: 95, shelfLifeDays: 8, category: 'Legume' }
      ],
      minTemp: 4,
      maxTemp: 7,
      targetTemp: 5.5,
      minHumidity: 95,
      maxHumidity: 98,
      targetHumidity: 96,
      currentTemp: 5.3,
      currentHumidity: 96,
      powerSource: 'Solar',
      outsideTemp: 33.0,
      outsideHumidity: 58,
      coolingLoad: 'Medium',
      coolingLoadPct: 68,
      gasPpm: 15.1,
      spoilageStatus: 'Fresh',
      status: 'active',
      notes: 'Stable conditions maintained'
    });

    await Alert.create({
      slotId: slot1._id,
      slotName: slot1.allocatedSlot,
      type: 'info',
      message: 'Chamber A-101: Solar power active. Ethylene gas level 12.4 ppm (Fresh).'
    });

    await Alert.create({
      slotId: slot2._id,
      slotName: slot2.allocatedSlot,
      type: 'info',
      message: 'Chamber B-102: Outside temp 33°C. Cooling load dynamically regulated to Medium (68%).'
    });

    console.log('✅ Initial chambers seeded successfully!');
  }
}

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (uri && !uri.includes('localhost:27017')) {
    try {
      console.log('🔄 Connecting to configured MongoDB URI...');
      await mongoose.connect(uri);
      console.log('✅ Connected to MongoDB Cloud / Custom URI');
      await seedInitialData();
      return;
    } catch (err) {
      console.warn('⚠️ Could not connect to configured MONGO_URI:', err.message);
    }
  }

  try {
    console.log('🔄 Attempting local MongoDB connection (mongodb://127.0.0.1:27017/coldStorage)...');
    await mongoose.connect('mongodb://127.0.0.1:27017/coldStorage', { serverSelectionTimeoutMS: 2000 });
    console.log('✅ Connected to local MongoDB instance');
    await seedInitialData();
    return;
  } catch (err) {
    console.log('ℹ️ Local MongoDB instance not running. Starting embedded in-memory MongoDB...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    await mongoose.connect(memoryUri);
    console.log('✅ Connected to Embedded In-Memory Database');
    await seedInitialData();
  } catch (err) {
    console.error('❌ Failed to start database:', err.message);
  }
}

module.exports = connectDB;