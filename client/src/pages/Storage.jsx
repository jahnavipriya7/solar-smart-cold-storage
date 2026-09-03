import React, { useState, useEffect, useCallback } from 'react';
import { useStorage } from '../context/StorageContext';
import VegSelector from '../components/VegSelector';
import SlotCard from '../components/SlotCard';
import { slotsAPI } from '../utils/api';
import { computeRange } from '../utils/vegetables';

export default function Storage() {
  const { slots, loading, fetchSlots, createSlot, addVegetablesToSlot } = useStorage();
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [quantityLitres, setQuantityLitres] = useState('2.0');
  const [selectedVegs, setSelectedVegs] = useState([]);
  const [compatData, setCompatData] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchSlots();
    const iv = setInterval(fetchSlots, 5000);
    return () => clearInterval(iv);
  }, [fetchSlots]);

  const runCompatCheck = useCallback(async (vegs, qty) => {
    if (!vegs.length) {
      setCompatData(null);
      return;
    }
    setChecking(true);
    try {
      const res = await slotsAPI.checkCompat(vegs, parseFloat(qty) || 1.0);
      setCompatData(res.data);
    } catch {
      setCompatData(null);
    } finally {
      setChecking(false);
    }
  }, []);

  const handleVegChange = (vegs) => {
    setSelectedVegs(vegs);
    runCompatCheck(vegs, quantityLitres);
  };

  const handleQtyChange = (e) => {
    const val = e.target.value;
    setQuantityLitres(val);
    runCompatCheck(selectedVegs, val);
  };

  const handleCreate = async () => {
    if (!farmerName.trim() || !farmerPhone.trim()) {
      alert('Please enter Farmer Name and Contact Phone Number.');
      return;
    }
    const qty = parseFloat(quantityLitres);
    if (!qty || qty <= 0 || qty > 5.0) {
      alert('Crop quantity must be between 0.1 and 5.0 Litres (Total chamber capacity is 5 Litres).');
      return;
    }
    if (!selectedVegs.length) return;
    const range = computeRange(selectedVegs);
    if (!range) return;

    await createSlot({
      farmerName: farmerName.trim(),
      farmerPhone: farmerPhone.trim(),
      quantityLitres: qty,
      vegetables: selectedVegs
    });

    setSelectedVegs([]);
    setCompatData(null);
    setFarmerName('');
    setFarmerPhone('');
    setQuantityLitres('2.0');
    await fetchSlots();
  };

  const handleAddToSlot = async (slotId) => {
    if (!farmerName.trim() || !farmerPhone.trim()) {
      alert('Please enter Farmer Name and Phone Number to record ownership.');
      return;
    }
    const qty = parseFloat(quantityLitres) || 1.0;
    await addVegetablesToSlot(slotId, {
      vegetables: selectedVegs,
      farmerName: farmerName.trim(),
      farmerPhone: farmerPhone.trim(),
      quantityLitres: qty
    });
    setSelectedVegs([]);
    setCompatData(null);
    setQuantityLitres('2.0');
    await fetchSlots();
  };

  const range = computeRange(selectedVegs);
  const qty = parseFloat(quantityLitres) || 0;
  const hasCompat = compatData?.slots?.some(s => s.compatible);

  let banner = null;
  if (selectedVegs.length && compatData) {
    if (qty > 5.0) {
      banner = (
        <div className="compat-banner compat-bad">
          🚨 <strong>Quantity exceeds chamber capacity!</strong> Maximum capacity is 5.0 Litres only (you entered {qty}L).
        </div>
      );
    } else if (!compatData.selfCompatible) {
      banner = (
        <div className="compat-banner compat-bad">
          ⚠️ Selected vegetables have conflicting temperature or humidity requirements. Please adjust your selection.
        </div>
      );
    } else if (!slots.length) {
      banner = (
        <div className="compat-banner compat-ok">
          ✅ Ready to allocate a new 5L chamber for <strong>{qty}L</strong> of produce at <strong>{range?.targetTemp}°C</strong> &amp; <strong>{range?.targetHumidity}% RH</strong>.
        </div>
      );
    } else if (hasCompat) {
      const n = compatData.slots.filter(s => s.compatible).length;
      banner = (
        <div className="compat-banner compat-ok">
          ✅ <strong>{n} Chamber(s) have available space &amp; matching climate!</strong> You can merge {qty}L into an existing chamber (within 5L limit) or allocate a fresh unit.
        </div>
      );
    } else {
      banner = (
        <div className="compat-banner compat-warn">
          ℹ️ No active chamber matches these climate requirements or has enough free capacity. A new 5L storage chamber will be automatically allocated.
        </div>
      );
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>🌾 Smart <span>Cold Storage</span> Management</h1>
        <p>Enter farmer details, crop quantity (Max 5L capacity), and vegetables — the IoT system automatically assigns chambers and monitors conditions</p>
      </div>

      <div className="storage-layout">
        {/* Left Intake Form */}
        <div>
          <div className="card" style={{ marginBottom: '14px' }}>
            <div className="card-title">👨‍🌾 Farmer &amp; Crop Intake Details</div>
            <div className="form-group">
              <label>Farmer Full Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={farmerName}
                onChange={e => setFarmerName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Farmer Contact Phone Number *</label>
              <input
                className="form-input"
                type="tel"
                placeholder="e.g. +91 98765 43210"
                value={farmerPhone}
                onChange={e => setFarmerPhone(e.target.value)}
                required
              />
            </div>

            {/* Crop Quantity (Litres) Input */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Crop Quantity (Litres) *</label>
                <span style={{ fontSize: '0.74rem', color: 'var(--sy)', fontWeight: 600 }}>Total Chamber Capacity: 5.0L</span>
              </div>
              <input
                className="form-input"
                type="number"
                step="0.1"
                min="0.1"
                max="5.0"
                placeholder="e.g. 2.0"
                value={quantityLitres}
                onChange={handleQtyChange}
                required
              />
              <div style={{ fontSize: '0.72rem', color: 'var(--mu)', marginTop: '4px' }}>
                Each smart cold storage chamber holds a maximum of <strong>5 Litres</strong>.
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--mu)', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--br)' }}>
              🔒 <strong>Chamber Allocation:</strong> Automated. System auto-assigns 5L chambers or tests capacity before merging.
            </div>
          </div>

          <div className="card">
            <div className="card-title">🥦 Vegetable Intake &amp; Compatibility Check</div>
            <VegSelector selected={selectedVegs} onChange={handleVegChange} />

            {checking && (
              <div style={{ fontSize: '.8rem', color: 'var(--mu)', marginTop: '9px' }}>
                🔍 Checking 5L capacity, temperature, humidity &amp; ethylene compatibility...
              </div>
            )}

            {banner}

            {selectedVegs.length > 0 && range && qty <= 5.0 && (
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '14px', justifyContent: 'center' }}
                onClick={handleCreate}
                disabled={loading || !range}
              >
                {loading ? '⏳ Allocating Chamber...' : `⚡ Auto-Allocate 5L Storage Chamber (${qty}L)`}
              </button>
            )}
          </div>
        </div>

        {/* Right Active Chambers List */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '.98rem', fontWeight: 700 }}>
              Active Storage Chambers ({slots.length})
            </h2>
            <span style={{ fontSize: '.76rem', color: 'var(--mu)' }}>
              Total Unit Limit: 5.0 Litres • 5s live updates
            </span>
          </div>

          {!slots.length ? (
            <div className="empty-state">
              <div className="ei">❄️</div>
              <p>No storage chambers currently in use.<br />Select produce and quantity on the left to allocate the first chamber.</p>
            </div>
          ) : (
            slots.map(slot => {
              const cr = compatData?.slots?.find(s => String(s._id) === String(slot._id));
              return (
                <SlotCard
                  key={slot._id}
                  slot={slot}
                  compatResult={cr}
                  selectedVegs={selectedVegs}
                  incomingQty={qty}
                  onAddVegs={handleAddToSlot}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}