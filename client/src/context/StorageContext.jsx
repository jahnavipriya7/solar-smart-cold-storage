import React, { createContext, useContext, useState, useCallback } from 'react';
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
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await alertsAPI.getAll();
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  }, []);

  const createSlot = useCallback(async (data) => {
    setLoading(true);
    try {
      const res = await slotsAPI.create(data);
      setSlots(prev => [res.data, ...prev]);
      addToast(`Slot "${res.data.slotName}" created successfully!`, 'success');
      return res.data;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create slot', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const deleteSlot = useCallback(async (id, name) => {
    try {
      await slotsAPI.delete(id);
      setSlots(prev => prev.filter(s => s._id !== id));
      addToast(`Slot "${name}" removed`, 'success');
    } catch (err) {
      addToast('Failed to delete slot', 'error');
    }
  }, [addToast]);

  const addVegetablesToSlot = useCallback(async (slotId, data) => {
    setLoading(true);
    try {
      const res = await slotsAPI.addVegetables(slotId, data);
      setSlots(prev => prev.map(s => s._id === slotId ? res.data : s));
      addToast('Vegetables added to slot!', 'success');
      return res.data;
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add vegetables', 'error');
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
