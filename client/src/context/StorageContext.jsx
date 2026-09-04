import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { slotsAPI, alertsAPI } from '../utils/api';

const StorageContext = createContext();

// Default Pre-seeded Initial Chambers so it NEVER shows 0 slots / empty screen
const INITIAL_CHAMBERS = [
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

const INITIAL_ALERTS = [
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

function loadSavedSlots() {
  try {
    const saved = localStorage.getItem('solar_cold_storage_slots_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_CHAMBERS;
}

function loadSavedAlerts() {
  try {
    const saved = localStorage.getItem('solar_cold_storage_alerts_v3');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return INITIAL_ALERTS;
}

export function StorageProvider({ children }) {
  const [slots, setSlots] = useState(loadSavedSlots);
  const [alerts, setAlerts] = useState(loadSavedAlerts);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await slotsAPI.getAll();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setSlots(res.data);
        try {
          localStorage.setItem('solar_cold_storage_slots_v3', JSON.stringify(res.data));
        } catch (e) {}
      }
    } catch (err) {
      // Keep local state
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await alertsAPI.getAll();
      if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setAlerts(res.data);
        try {
          localStorage.setItem('solar_cold_storage_alerts_v3', JSON.stringify(res.data));
        } catch (e) {}
      }
    } catch (err) {
      // Keep local state
    }
  }, []);

  useEffect(() => {
    fetchSlots();
    fetchAlerts();
    const iv = setInterval(() => {
      fetchSlots();
      fetchAlerts();
    }, 5000);
    return () => clearInterval(iv);
  }, [fetchSlots, fetchAlerts]);

  const createSlot = useCallback(async (data) => {
    setLoading(true);
    try {
      let created = null;
      try {
        const res = await slotsAPI.create(data);
        if (res && res.data) created = res.data;
      } catch (e) {}

      if (!created) {
        const vegs = data.vegetables || [];
        const minT = vegs.length ? Math.max(...vegs.map(v => v.minTemp)) : 0;
        const maxT = vegs.length ? Math.min(...vegs.map(v => v.maxTemp)) : 2;
        const minH = vegs.length ? Math.max(...vegs.map(v => v.minHumidity)) : 95;
        const maxH = vegs.length ? Math.min(...vegs.map(v => v.maxHumidity)) : 100;
        const currentLength = slots.length;
        const chamberLetter = String.fromCharCode(65 + Math.floor(currentLength / 4));
        const chamberNum = 101 + (currentLength % 4);

        created = {
          _id: 'slot-' + Date.now(),
          allocatedSlot: `Chamber ${chamberLetter}-${chamberNum}`,
          farmerName: data.farmerName,
          farmerPhone: data.farmerPhone,
          totalCapacityLitres: 5.0,
          usedCapacityLitres: parseFloat(data.quantityLitres) || 2.0,
          vegetables: vegs,
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
      }

      setSlots(prev => {
        const updated = [created, ...prev.filter(s => s._id !== created._id)];
        try {
          localStorage.setItem('solar_cold_storage_slots_v3', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      const newAlert = {
        _id: 'a-' + Date.now(),
        type: 'info',
        message: `${created.allocatedSlot} allocated to ${created.farmerName} (${created.farmerPhone}). Quantity: ${created.usedCapacityLitres}L / 5L.`,
        createdAt: new Date().toISOString()
      };
      setAlerts(prev => {
        const updatedAlerts = [newAlert, ...prev];
        try {
          localStorage.setItem('solar_cold_storage_alerts_v3', JSON.stringify(updatedAlerts));
        } catch (e) {}
        return updatedAlerts;
      });

      addToast(`🎉 ${created.allocatedSlot} allocated to ${created.farmerName}!`, 'success');
      return created;
    } catch (err) {
      addToast(err.message || 'Failed to allocate chamber', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [slots, addToast]);

  const deleteSlot = useCallback(async (id, name) => {
    try {
      try {
        await slotsAPI.delete(id);
      } catch (e) {}
      setSlots(prev => {
        const updated = prev.filter(s => s._id !== id);
        try {
          localStorage.setItem('solar_cold_storage_slots_v3', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      addToast(`Chamber "${name}" released`, 'success');
    } catch (err) {
      addToast('Failed to release chamber', 'error');
    }
  }, [addToast]);

  const addVegetablesToSlot = useCallback(async (slotId, data) => {
    setLoading(true);
    try {
      let updatedSlot = null;
      try {
        const res = await slotsAPI.addVegetables(slotId, data);
        if (res && res.data) updatedSlot = res.data;
      } catch (e) {}

      setSlots(prev => {
        const updatedList = prev.map(s => {
          if (s._id === slotId) {
            const newVegs = [...s.vegetables, ...data.vegetables];
            const newUsed = Math.min(5.0, (s.usedCapacityLitres || 0) + (parseFloat(data.quantityLitres) || 1.0));
            return updatedSlot || { ...s, vegetables: newVegs, usedCapacityLitres: newUsed };
          }
          return s;
        });
        try {
          localStorage.setItem('solar_cold_storage_slots_v3', JSON.stringify(updatedList));
        } catch (e) {}
        return updatedList;
      });

      addToast('Produce successfully merged into chamber!', 'success');
    } catch (err) {
      addToast('Failed to add produce', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const dismissAlert = useCallback(async (id) => {
    try {
      try {
        await alertsAPI.dismiss(id);
      } catch (e) {}
      setAlerts(prev => {
        const updated = prev.filter(a => a._id !== id);
        try {
          localStorage.setItem('solar_cold_storage_alerts_v3', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    } catch (err) {}
  }, []);

  return (
    <StorageContext.Provider value={{
      slots, alerts, loading, toasts,
      fetchSlots, fetchAlerts,
      createSlot, deleteSlot, addVegetablesToSlot,
      dismissAlert, addToast, removeToast
    }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  return useContext(StorageContext);
}