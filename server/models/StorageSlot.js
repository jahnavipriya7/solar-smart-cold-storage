const mongoose = require('mongoose');

const vegetableItemSchema = new mongoose.Schema({
  name: String,
  emoji: String,
  minTemp: Number,
  maxTemp: Number,
  minHumidity: Number,
  maxHumidity: Number,
  shelfLifeDays: Number,
  category: String
}, { _id: false });

const storageSlotSchema = new mongoose.Schema({
  allocatedSlot: { type: String, required: true },
  farmerName: { type: String, required: true },
  farmerPhone: { type: String, required: true },
  
  // Crop Quantity & 5-Litre Capacity Limit
  totalCapacityLitres: { type: Number, default: 5 },
  usedCapacityLitres: { type: Number, required: true, default: 1 },
  
  vegetables: [vegetableItemSchema],
  minTemp: { type: Number, required: true },
  maxTemp: { type: Number, required: true },
  targetTemp: { type: Number, required: true },
  minHumidity: { type: Number, required: true },
  maxHumidity: { type: Number, required: true },
  targetHumidity: { type: Number, required: true },
  currentTemp: { type: Number, default: null },
  currentHumidity: { type: Number, default: null },
  powerSource: { type: String, enum: ['Solar', 'Battery'], default: 'Solar' },
  outsideTemp: { type: Number, default: 32 },
  outsideHumidity: { type: Number, default: 60 },
  coolingLoad: { type: String, default: 'Medium' },
  coolingLoadPct: { type: Number, default: 65 },
  gasPpm: { type: Number, default: 12 },
  spoilageStatus: { type: String, enum: ['Fresh', 'Warning', 'Spoiled'], default: 'Fresh' },
  status: { type: String, enum: ['active', 'warning', 'critical'], default: 'active' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StorageSlot', storageSlotSchema);