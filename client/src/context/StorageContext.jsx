import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { slotsAPI, alertsAPI } from '../utils/api';

const StorageContext = createContext();

export function StorageProvider({ children }) {
  const [slots, setSlots] = useState([]);
  const [alerts, setAlerts] = useState([]);
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
      if (res && res.data) {
        setSlots(res.data);
      }
    } catch (err) {
      console.warn('Using local storage slots cache');
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await alertsAPI.getAll();
      if (res && res.data) {
        setAlerts(res.data);
      }
    } catch (err) {
      console.warn('Using local alerts cache');
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSlots();
    fetchAlerts();
  }, [fetchSlots, fetchAlerts]);

  const createSlot = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await slotsAPI.create(data);
      const created = res.data;
      setSlots(prev => [created, ...prev.filter(s => s._id !== created._id)]);
      addToast(`🎉 ${created.allocatedSlot || 'Chamber'} allocated to ${created.farmerName}!`, 'success');
      return created;
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Failed to create slot', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const deleteSlot = useCallback(async (id, name) => {
    try {
      await slotsAPI.delete(id);
      setSlots(prev => prev.filter(s => s._id !== id));
      addToast(`Chamber "${name}" released`, 'success');
    } catch (err) {
      addToast('Failed to release chamber', 'error');
    }
  }, [addToast]);

  const addVegetablesToSlot = useCallback(async (slotId, data) => {
    setLoading(true);
    try {
      const res = await slotsAPI.addVegetables(slotId, data);
      const updated = res.data;
      setSlots(prev => prev.map(s => s._id === slotId ? updated : s));
      addToast('Produce successfully merged into chamber!', 'success');
      return updated;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add produce', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const dismissAlert = useCallback(async (id) => {
    try {
      await alertsAPI.dismiss(id);
      setAlerts(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error('Failed to dismiss alert:', err);
    }
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