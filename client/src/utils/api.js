import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

// Fallback Local Storage Data if standalone static deployment without backend
const LOCAL_STORAGE_KEY = 'solar_cold_storage_slots';
const LOCAL_ALERTS_KEY = 'solar_cold_storage_alerts';

function getLocalSlots() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) return JSON.parse(data);
  const initial = [
    {
      _id: 'slot-1',
      allocatedSlot: 'Chamber A-101',
      farmerName: 'Ramesh Kumar',
      farmerPhone: '+91 98765 43210',
      totalCapacityLitres: 5.0,
      usedCapacityLitres: 2.5,
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
      currentTemp: 1.1,
      currentHumidity: 97,
      powerSource: 'Solar',
      outsideTemp: 34.2,
      outsideHumidity: 62,
      coolingLoad: 'High',
      coolingLoadPct: 82,
      gasPpm: 12.4,
      spoilageStatus: 'Fresh',
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      _id: 'slot-2',
      allocatedSlot: 'Chamber B-102',
      farmerName: 'Sita Devi',
      farmerPhone: '+91 91234 56789',
      totalCapacityLitres: 5.0,
      usedCapacityLitres: 3.0,
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
      currentTemp: 5.4,
      currentHumidity: 95,
      powerSource: 'Solar',
      outsideTemp: 33.5,
      outsideHumidity: 60,
      coolingLoad: 'Medium',
      coolingLoadPct: 68,
      gasPpm: 14.8,
      spoilageStatus: 'Fresh',
      status: 'active',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function getLocalAlerts() {
  const data = localStorage.getItem(LOCAL_ALERTS_KEY);
  if (data) return JSON.parse(data);
  const initial = [
    {
      _id: 'a-1',
      type: 'info',
      message: 'Chamber A-101: Solar power active. Ethylene gas level 12.4 ppm (Fresh).',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: 'a-2',
      type: 'info',
      message: 'Chamber B-102: Outside temp 33.5°C. Cooling load regulated to Medium (68%).',
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ];
  localStorage.setItem(LOCAL_ALERTS_KEY, JSON.stringify(initial));
  return initial;
}

export const slotsAPI = {
  getAll: async () => {
    try {
      return await axios.get(`${BASE}/slots`);
    } catch {
      // Fallback for live preview
      const local = getLocalSlots();
      // add live sensor fluctuations
      const updated = local.map(s => ({
        ...s,
        currentTemp: parseFloat((s.targetTemp + (Math.random() - 0.5) * 0.4).toFixed(1)),
        currentHumidity: Math.min(100, Math.max(40, parseFloat(((s.minHumidity + s.maxHumidity) / 2 + (Math.random() - 0.5) * 2).toFixed(1)))),
        powerSource: Math.random() > 0.25 ? 'Solar' : 'Battery',
        gasPpm: Math.max(5, parseFloat(((s.gasPpm || 12) + (Math.random() - 0.48) * 1.5).toFixed(1))),
        outsideTemp: parseFloat((33.5 + (Math.random() - 0.5) * 3).toFixed(1)),
        outsideHumidity: Math.round(62 + (Math.random() - 0.5) * 8)
      }));
      return { data: updated };
    }
  },
  getById: async (id) => {
    try {
      return await axios.get(`${BASE}/slots/${id}`);
    } catch {
      const local = getLocalSlots();
      return { data: local.find(s => s._id === id) };
    }
  },
  create: async (data) => {
    try {
      return await axios.post(`${BASE}/slots`, data);
    } catch {
      const local = getLocalSlots();
      const minT = Math.max(...data.vegetables.map(v => v.minTemp));
      const maxT = Math.min(...data.vegetables.map(v => v.maxTemp));
      const minH = Math.max(...data.vegetables.map(v => v.minHumidity));
      const maxH = Math.min(...data.vegetables.map(v => v.maxHumidity));
      const newSlot = {
        _id: 'slot-' + Date.now(),
        allocatedSlot: 'Chamber ' + String.fromCharCode(65 + Math.floor(local.length / 4)) + '-' + (101 + (local.length % 4)),
        farmerName: data.farmerName,
        farmerPhone: data.farmerPhone,
        totalCapacityLitres: 5.0,
        usedCapacityLitres: parseFloat(data.quantityLitres) || 2.0,
        vegetables: data.vegetables,
        minTemp: minT,
        maxTemp: maxT,
        targetTemp: parseFloat(((minT + maxT) / 2).toFixed(1)),
        minHumidity: minH,
        maxHumidity: maxH,
        targetHumidity: parseFloat(((minH + maxH) / 2).toFixed(1)),
        currentTemp: parseFloat(((minT + maxT) / 2).toFixed(1)),
        currentHumidity: parseFloat(((minH + maxH) / 2).toFixed(1)),
        powerSource: 'Solar',
        outsideTemp: 33.5,
        outsideHumidity: 62,
        coolingLoad: 'Medium',
        coolingLoadPct: 65,
        gasPpm: 10.8,
        spoilageStatus: 'Fresh',
        status: 'active',
        createdAt: new Date().toISOString()
      };
      local.unshift(newSlot);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));

      // Also add alert
      const alerts = getLocalAlerts();
      alerts.unshift({
        _id: 'a-' + Date.now(),
        type: 'info',
        message: `${newSlot.allocatedSlot} allocated to ${newSlot.farmerName} (${newSlot.farmerPhone}). Quantity: ${newSlot.usedCapacityLitres}L / 5L.`,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(LOCAL_ALERTS_KEY, JSON.stringify(alerts));

      return { data: newSlot };
    }
  },
  update: (id, data) => axios.put(`${BASE}/slots/${id}`, data),
  delete: async (id) => {
    try {
      return await axios.delete(`${BASE}/slots/${id}`);
    } catch {
      let local = getLocalSlots();
      local = local.filter(s => s._id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
      return { data: { message: 'Deleted' } };
    }
  },
  checkCompat: async (vegetables, quantityLitres) => {
    try {
      return await axios.post(`${BASE}/slots/check-compat`, { vegetables, quantityLitres });
    } catch {
      const qty = parseFloat(quantityLitres) || 1.0;
      let minT = vegetables[0].minTemp, maxT = vegetables[0].maxTemp;
      let minH = vegetables[0].minHumidity, maxH = vegetables[0].maxHumidity;
      for (let i = 1; i < vegetables.length; i++) {
        minT = Math.max(minT, vegetables[i].minTemp);
        maxT = Math.min(maxT, vegetables[i].maxTemp);
        minH = Math.max(minH, vegetables[i].minHumidity);
        maxH = Math.min(maxH, vegetables[i].maxHumidity);
      }
      const selfCompat = minT <= maxT && minH <= maxH;
      const local = getLocalSlots();
      const results = local.map(slot => {
        const oMinT = Math.max(slot.minTemp, minT);
        const oMaxT = Math.min(slot.maxTemp, maxT);
        const oMinH = Math.max(slot.minHumidity, minH);
        const oMaxH = Math.min(slot.maxHumidity, maxH);
        const isClimateCompat = oMinT <= oMaxT && oMinH <= oMaxH;
        const availableCapacity = Math.max(0, (slot.totalCapacityLitres || 5.0) - (slot.usedCapacityLitres || 0));
        const hasCapacity = (slot.usedCapacityLitres || 0) + qty <= (slot.totalCapacityLitres || 5.0);
        const isCompat = isClimateCompat && hasCapacity;

        let reason = '';
        if (!isClimateCompat) reason = 'Incompatible Temperature / Humidity';
        else if (!hasCapacity) reason = `Capacity Exceeded (${availableCapacity.toFixed(1)}L remaining of 5L)`;
        else reason = `Compatible (${((slot.usedCapacityLitres || 0) + qty).toFixed(1)}L / 5L used)`;

        return {
          _id: slot._id,
          allocatedSlot: slot.allocatedSlot,
          farmerName: slot.farmerName,
          farmerPhone: slot.farmerPhone,
          totalCapacityLitres: slot.totalCapacityLitres || 5.0,
          usedCapacityLitres: slot.usedCapacityLitres || 0,
          availableCapacityLitres: availableCapacity,
          currentVegs: slot.vegetables.map(v => v.name),
          slotTempRange: `${slot.minTemp}–${slot.maxTemp}°C`,
          slotHumidityRange: `${slot.minHumidity}–${slot.maxHumidity}%`,
          compatible: isCompat,
          climateCompatible: isClimateCompat,
          hasCapacity,
          compatReason: reason,
          overlapTempRange: isClimateCompat ? `${oMinT}–${oMaxT}°C` : null,
          overlapHumidityRange: isClimateCompat ? `${oMinH}–${oMaxH}%` : null,
          overlapTargetTemp: isClimateCompat ? parseFloat(((oMinT + oMaxT) / 2).toFixed(1)) : null,
          overlapTargetHumidity: isClimateCompat ? parseFloat(((oMinH + oMaxH) / 2).toFixed(1)) : null
        };
      });
      return {
        data: {
          selfCompatible: selfCompat,
          newRange: { minTemp: minT, maxTemp: maxT, targetTemp: parseFloat(((minT + maxT) / 2).toFixed(1)), minHumidity: minH, maxHumidity: maxH, targetHumidity: parseFloat(((minH + maxH) / 2).toFixed(1)) },
          slots: results
        }
      };
    }
  },
  addVegetables: async (id, data) => {
    try {
      return await axios.post(`${BASE}/slots/${id}/add-vegetables`, data);
    } catch {
      const local = getLocalSlots();
      const slot = local.find(s => s._id === id);
      if (slot) {
        slot.vegetables = [...slot.vegetables, ...data.vegetables];
        slot.usedCapacityLitres = (slot.usedCapacityLitres || 0) + (parseFloat(data.quantityLitres) || 1.0);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(local));
      }
      return { data: slot };
    }
  },
};

export const alertsAPI = {
  getAll: async () => {
    try {
      return await axios.get(`${BASE}/alerts`);
    } catch {
      return { data: getLocalAlerts() };
    }
  },
  create: async (data) => {
    try {
      return await axios.post(`${BASE}/alerts`, data);
    } catch {
      const alerts = getLocalAlerts();
      const newAlert = { _id: 'a-' + Date.now(), ...data, createdAt: new Date().toISOString() };
      alerts.unshift(newAlert);
      localStorage.setItem(LOCAL_ALERTS_KEY, JSON.stringify(alerts));
      return { data: newAlert };
    }
  },
  dismiss: async (id) => {
    try {
      return await axios.delete(`${BASE}/alerts/${id}`);
    } catch {
      let alerts = getLocalAlerts();
      alerts = alerts.filter(a => a._id !== id);
      localStorage.setItem(LOCAL_ALERTS_KEY, JSON.stringify(alerts));
      return { data: { message: 'Dismissed' } };
    }
  },
};