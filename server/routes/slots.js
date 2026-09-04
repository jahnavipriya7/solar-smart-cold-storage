const express = require('express');
const router = express.Router();
const StorageSlot = require('../models/StorageSlot');
const Alert = require('../models/Alert');

const MAX_CHAMBER_CAPACITY = 5.0; // 5 Litres hardware limit

function computeRange(vegs) {
  if (!vegs || !vegs.length) return null;
  let minT = vegs[0].minTemp, maxT = vegs[0].maxTemp;
  let minH = vegs[0].minHumidity, maxH = vegs[0].maxHumidity;
  let minShelf = vegs[0].shelfLifeDays;
  
  for (let i = 1; i < vegs.length; i++) {
    minT = Math.max(minT, vegs[i].minTemp);
    maxT = Math.min(maxT, vegs[i].maxTemp);
    minH = Math.max(minH, vegs[i].minHumidity);
    maxH = Math.min(maxH, vegs[i].maxHumidity);
    minShelf = Math.min(minShelf, vegs[i].shelfLifeDays);
  }
  
  if (minT > maxT || minH > maxH) return null;
  
  return {
    minTemp: minT,
    maxTemp: maxT,
    targetTemp: parseFloat(((minT + maxT) / 2).toFixed(1)),
    minHumidity: minH,
    maxHumidity: maxH,
    targetHumidity: parseFloat(((minH + maxH) / 2).toFixed(1)),
    shelfLifeDays: minShelf
  };
}

function calculateVolumeFromKg(vegs, weightKg) {
  const kg = parseFloat(weightKg) || 1.0;
  if (!vegs || !vegs.length) return parseFloat((kg * 1.5).toFixed(1));
  const avgDensity = vegs.reduce((sum, v) => sum + (v.densityLitersPerKg || 1.5), 0) / vegs.length;
  return parseFloat((kg * avgDensity).toFixed(1));
}

function calculateDynamicLoad(outsideT, outsideH, targetT) {
  const tempDiff = Math.max(0, outsideT - targetT);
  const humidityFactor = outsideH > 70 ? 1.2 : outsideH > 50 ? 1.0 : 0.85;
  const rawLoad = Math.min(100, Math.max(20, Math.round((tempDiff * 2.5 + 15) * humidityFactor)));
  
  let loadCategory = 'Medium';
  if (rawLoad < 40) loadCategory = 'Low';
  else if (rawLoad < 75) loadCategory = 'Medium';
  else if (rawLoad < 90) loadCategory = 'High';
  else loadCategory = 'Maximum';
  
  return { coolingLoad: loadCategory, coolingLoadPct: rawLoad };
}

async function allocateNextSlot() {
  const total = await StorageSlot.countDocuments();
  const chamberLetter = String.fromCharCode(65 + Math.floor(total / 4));
  const chamberNum = 101 + (total % 4);
  return 'Chamber ' + chamberLetter + '-' + chamberNum;
}

router.get('/', async (req, res) => {
  try {
    const slots = await StorageSlot.find().sort({ createdAt: -1 });
    
    const updated = slots.map(s => {
      const o = s.toObject();
      
      const outsideT = parseFloat((32 + (Math.random() - 0.5) * 4).toFixed(1));
      const outsideH = Math.round(58 + (Math.random() - 0.5) * 12);
      o.outsideTemp = outsideT;
      o.outsideHumidity = outsideH;
      
      const { coolingLoad, coolingLoadPct } = calculateDynamicLoad(outsideT, outsideH, o.targetTemp);
      o.coolingLoad = coolingLoad;
      o.coolingLoadPct = coolingLoadPct;
      
      o.currentTemp = parseFloat((o.targetTemp + (Math.random() - 0.5) * 0.5).toFixed(1));
      o.currentHumidity = Math.min(100, Math.max(40, parseFloat(((o.minHumidity + o.maxHumidity) / 2 + (Math.random() - 0.5) * 2).toFixed(1))));
      o.powerSource = Math.random() > 0.25 ? 'Solar' : 'Battery';
      
      const currentGas = o.gasPpm || 12;
      const gasReading = parseFloat((currentGas + (Math.random() - 0.48) * 1.5).toFixed(1));
      o.gasPpm = Math.max(5, gasReading);
      
      if (o.gasPpm > 50) {
        o.spoilageStatus = 'Spoiled';
        o.status = 'critical';
      } else if (o.gasPpm > 28) {
        o.spoilageStatus = 'Warning';
        o.status = 'warning';
      } else {
        o.spoilageStatus = 'Fresh';
        o.status = 'active';
      }
      
      return o;
    });
    
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/check-compat', async (req, res) => {
  try {
    const { vegetables, weightKg } = req.body;
    const kg = parseFloat(weightKg) || 1.0;
    const incomingLitres = calculateVolumeFromKg(vegetables, kg);
    
    const newRange = computeRange(vegetables);
    if (!newRange) {
      return res.json({
        selfCompatible: false,
        slots: [],
        message: 'Your selected vegetables have conflicting temperature or humidity requirements.'
      });
    }
    
    const slots = await StorageSlot.find();
    const results = slots.map(slot => {
      const oMinT = Math.max(slot.minTemp, newRange.minTemp);
      const oMaxT = Math.min(slot.maxTemp, newRange.maxTemp);
      const oMinH = Math.max(slot.minHumidity, newRange.minHumidity);
      const oMaxH = Math.min(slot.maxHumidity, newRange.maxHumidity);
      
      const isClimateCompat = oMinT <= oMaxT && oMinH <= oMaxH;
      const availableCapacityL = Math.max(0, (slot.totalCapacityLitres || 5.0) - (slot.usedCapacityLitres || 0));
      const hasCapacity = (slot.usedCapacityLitres || 0) + incomingLitres <= (slot.totalCapacityLitres || 5.0);
      
      const isFullCompatible = isClimateCompat && hasCapacity;
      
      let reason = '';
      if (!isClimateCompat) reason = 'Incompatible Temperature / Humidity';
      else if (!hasCapacity) reason = 'Chamber Full / Exceeded (only ' + availableCapacityL.toFixed(1) + 'L space remaining of 5L)';
      else reason = 'Compatible (' + ((slot.usedCapacityLitres || 0) + incomingLitres).toFixed(1) + 'L / 5L capacity used)';
      
      return {
        _id: slot._id,
        allocatedSlot: slot.allocatedSlot,
        farmerName: slot.farmerName,
        farmerPhone: slot.farmerPhone,
        totalCapacityLitres: slot.totalCapacityLitres || 5.0,
        usedCapacityLitres: slot.usedCapacityLitres || 0,
        usedWeightKg: slot.usedWeightKg || 0,
        availableCapacityLitres: availableCapacityL,
        currentVegs: slot.vegetables.map(v => v.name),
        slotTempRange: slot.minTemp + '–' + slot.maxTemp + '°C',
        slotHumidityRange: slot.minHumidity + '–' + slot.maxHumidity + '%',
        compatible: isFullCompatible,
        climateCompatible: isClimateCompat,
        hasCapacity: hasCapacity,
        compatReason: reason,
        overlapTempRange: isClimateCompat ? oMinT + '–' + oMaxT + '°C' : null,
        overlapHumidityRange: isClimateCompat ? oMinH + '–' + oMaxH + '%' : null,
        overlapTargetTemp: isClimateCompat ? parseFloat(((oMinT + oMaxT) / 2).toFixed(1)) : null,
        overlapTargetHumidity: isClimateCompat ? parseFloat(((oMinH + oMaxH) / 2).toFixed(1)) : null
      };
    });
    
    res.json({
      selfCompatible: true,
      newRange,
      incomingLitres,
      slots: results
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { farmerName, farmerPhone, vegetables, weightKg, notes } = req.body;
    
    if (!farmerName || !farmerPhone) {
      return res.status(400).json({ message: 'Farmer name and phone number are required.' });
    }
    if (!vegetables || !vegetables.length) {
      return res.status(400).json({ message: 'Select at least one vegetable to store.' });
    }
    
    const kg = parseFloat(weightKg) || 1.0;
    const volumeLitres = calculateVolumeFromKg(vegetables, kg);
    
    if (volumeLitres <= 0 || volumeLitres > MAX_CHAMBER_CAPACITY) {
      return res.status(400).json({
        message: 'Crop quantity of ' + kg + ' kg converts to ' + volumeLitres + ' Litres, exceeding the 5.0 Litre hardware chamber limit.'
      });
    }
    
    const range = computeRange(vegetables);
    if (!range) {
      return res.status(400).json({ message: 'Selected vegetables have incompatible temperature or humidity requirements.' });
    }
    
    const allocatedSlot = await allocateNextSlot();
    const outsideT = 33.5;
    const outsideH = 62;
    const { coolingLoad, coolingLoadPct } = calculateDynamicLoad(outsideT, outsideH, range.targetTemp);
    
    const slot = new StorageSlot({
      allocatedSlot,
      farmerName,
      farmerPhone,
      usedWeightKg: kg,
      usedCapacityLitres: volumeLitres,
      totalCapacityLitres: MAX_CHAMBER_CAPACITY,
      vegetables,
      minTemp: range.minTemp,
      maxTemp: range.maxTemp,
      targetTemp: range.targetTemp,
      minHumidity: range.minHumidity,
      maxHumidity: range.maxHumidity,
      targetHumidity: range.targetHumidity,
      currentTemp: range.targetTemp,
      currentHumidity: range.targetHumidity,
      powerSource: 'Solar',
      outsideTemp: outsideT,
      outsideHumidity: outsideH,
      coolingLoad,
      coolingLoadPct,
      gasPpm: 11.2,
      spoilageStatus: 'Fresh',
      notes: notes || ''
    });
    
    const saved = await slot.save();
    
    await Alert.create({
      slotId: saved._id,
      slotName: saved.allocatedSlot,
      type: 'info',
      message: saved.allocatedSlot + ' allocated to ' + saved.farmerName + ' (' + saved.farmerPhone + '). Quantity: ' + kg + ' kg (' + volumeLitres + 'L / 5L capacity). Storing: ' + vegetables.map(v => v.name).join(', ') + '. Target: ' + range.targetTemp + '°C, ' + range.targetHumidity + '% RH.'
    });
    
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/:id/add-vegetables', async (req, res) => {
  try {
    const slot = await StorageSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    
    const { vegetables, farmerName, farmerPhone, weightKg } = req.body;
    const kg = parseFloat(weightKg) || 1.0;
    const incomingLitres = calculateVolumeFromKg(vegetables, kg);
    
    const newUsedCapacity = (slot.usedCapacityLitres || 0) + incomingLitres;
    if (newUsedCapacity > (slot.totalCapacityLitres || 5.0)) {
      return res.status(400).json({
        message: 'Cannot add ' + kg + ' kg (' + incomingLitres + 'L). Chamber has only ' + Math.max(0, (slot.totalCapacityLitres || 5.0) - (slot.usedCapacityLitres || 0)).toFixed(1) + 'L remaining (5L max hardware capacity).'
      });
    }
    
    const allVegs = [...slot.vegetables, ...vegetables];
    const range = computeRange(allVegs);
    
    if (!range) {
      return res.status(400).json({ message: 'New vegetables are not compatible with existing chamber temperature/humidity.' });
    }
    
    slot.vegetables = allVegs;
    slot.usedWeightKg = (slot.usedWeightKg || 0) + kg;
    slot.usedCapacityLitres = newUsedCapacity;
    slot.minTemp = range.minTemp;
    slot.maxTemp = range.maxTemp;
    slot.targetTemp = range.targetTemp;
    slot.minHumidity = range.minHumidity;
    slot.maxHumidity = range.maxHumidity;
    slot.targetHumidity = range.targetHumidity;
    
    const updated = await slot.save();
    
    await Alert.create({
      slotId: slot._id,
      slotName: slot.allocatedSlot,
      type: 'info',
      message: (farmerName || 'Farmer') + ' added ' + kg + ' kg (' + incomingLitres + 'L) of ' + vegetables.map(v => v.name).join(', ') + ' to ' + slot.allocatedSlot + '. Total volume: ' + newUsedCapacity.toFixed(1) + 'L / 5L.'
    });
    
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const slot = await StorageSlot.findByIdAndDelete(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    
    await Alert.create({
      slotName: slot.allocatedSlot,
      type: 'info',
      message: slot.allocatedSlot + ' released by ' + slot.farmerName + ' (' + slot.farmerPhone + '). 5L chamber sanitized and free for next farmer.'
    });
    
    res.json({ message: 'Chamber released' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;