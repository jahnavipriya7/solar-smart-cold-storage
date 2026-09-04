import React, { useState, useEffect, useCallback } from 'react';
import { useStorage } from '../context/StorageContext';
import VegSelector from '../components/VegSelector';
import SlotCard from '../components/SlotCard';
import { slotsAPI } from '../utils/api';
import { computeRange, convertKgToLitres } from '../utils/vegetables';

export default function Storage() {
  const { slots, loading, fetchSlots, createSlot, addVegetablesToSlot } = useStorage();
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [weightKg, setWeightKg] = useState('2.0');
  const [selectedVegs, setSelectedVegs] = useState([]);
  const [compatData, setCompatData] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchSlots();
    const iv = setInterval(fetchSlots, 5000);
    return () => clearInterval(iv);
  }, [fetchSlots]);

  const runCompatCheck = useCallback(async (vegs, kgVal) => {
    if (!vegs.length) {
      setCompatData(null);
      return;
    }
    setChecking(true);
    try {
      const res = await slotsAPI.checkCompat(vegs, parseFloat(kgVal) || 1.0);
      setCompatData(res.data);
    } catch {
      setCompatData(null);
    } finally {
      setChecking(false);
    }
  }, []);

  const handleVegChange = (vegs) => {
    setSelectedVegs(vegs);
    runCompatCheck(vegs, weightKg);
  };

  const handleWeightChange = (e) => {
    const val = e.target.value;
    setWeightKg(val);
    runCompatCheck(selectedVegs, val);
  };

  const kgNum = parseFloat(weightKg) || 0;
  const convertedLitres = convertKgToLitres(selectedVegs, kgNum);
  const isOverCapacity = convertedLitres > 5.0;

  const handleCreate = async () => {
    if (!farmerName.trim() || !farmerPhone.trim()) {
      alert('Please enter Farmer Name and Contact Phone Number.');
      return;
    }
    if (!kgNum || kgNum <= 0) {
      alert('Please enter a valid crop weight in kg.');
      return;
    }
    if (isOverCapacity) {
      alert(`Crop weight of ${kgNum} kg converts to ${convertedLitres} Litres, which exceeds the 5.0 Litre hardware chamber limit.`);
      return;
    }
    if (!selectedVegs.length) return;
    const range = computeRange(selectedVegs);
    if (!range) return;

    await createSlot({
      farmerName: farmerName.trim(),
      farmerPhone: farmerPhone.trim(),
      weightKg: kgNum,
      quantityLitres: convertedLitres,
      vegetables: selectedVegs
    });

    setSelectedVegs([]);
    setCompatData(null);
    setFarmerName('');
    setFarmerPhone('');
    setWeightKg('2.0');
    await fetchSlots();
  };

  const handleAddToSlot = async (slotId) => {
    if (!farmerName.trim() || !farmerPhone.trim()) {
      alert('Please enter Farmer Name and Phone Number to record produce ownership.');
      return;
    }
    await addVegetablesToSlot(slotId, {
      vegetables: selectedVegs,
      farmerName: farmerName.trim(),
      farmerPhone: farmerPhone.trim(),
      weightKg: kgNum,
      quantityLitres: convertedLitres
    });
    setSelectedVegs([]);
    setCompatData(null);
    setWeightKg('2.0');
    await fetchSlots();
  };

  const range = computeRange(selectedVegs);
  const hasCompat = compatData?.slots?.some(s => s.compatible);

  let banner = null;
  if (selectedVegs.length && compatData) {
    if (isOverCapacity) {
      banner = (
        <div className="compat-banner compat-bad">
          🚨 <strong>5L Hardware Capacity Exceeded!</strong>
          <br />
          {kgNum} kg of selected produce converts to <strong>{convertedLitres} Litres</strong> (Maximum hardware limit is 5.0 Litres). Please reduce weight to $\le$ {(5.0 / (convertedLitres / kgNum)).toFixed(1)} kg.
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
          ✅ Ready to allocate a new 5L chamber for <strong>{kgNum} kg ({convertedLitres}L)</strong> at <strong>{range?.targetTemp}°C</strong> &amp; <strong>{range?.targetHumidity}% RH</strong>.
        </div>
      );
    } else if (hasCompat) {
      const n = compatData.slots.filter(s => s.compatible).length;
      banner = (
        <div className="compat-banner compat-ok">
          ✅ <strong>{n} Chamber(s) have available volume &amp; matching climate!</strong> You can merge {kgNum} kg ({convertedLitres}L) into an existing unit or allocate a fresh 5L chamber.
        </div>
      );
    } else {
      banner = (
        <div className="compat-banner compat-warn">
          ℹ️ No active chamber matches these climate parameters or has enough free volume for {convertedLitres}L. A fresh 5L chamber will be automatically allocated.
        </div>
      );
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>🌾 Smart <span>Cold Storage</span> Management</h1>
        <p>Enter crop weight in kg (auto-converted to litres for 5L hardware chamber) and select vegetables — the IoT system automatically assigns chambers and monitors conditions</p>
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

            {/* Crop Weight (Kg) Input with Auto-Conversion to Litres */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Crop Weight (in Kilograms - kg) *</label>
                <span style={{ fontSize: '0.74rem', color: 'var(--sy)', fontWeight: 600 }}>Hardware Limit: 5.0 Litres</span>
              </div>
              <input
                className="form-input"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="e.g. 2.0"
                value={weightKg}
                onChange={handleWeightChange}
                required
              />
              
              {/* Live Volumetric Conversion Indicator */}
              {selectedVegs.length > 0 && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: isOverCapacity ? 'rgba(224,48,48,0.12)' : 'rgba(46,196,110,0.12)',
                  border: isOverCapacity ? '1px solid rgba(224,48,48,0.3)' : '1px solid rgba(46,196,110,0.3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}>
                  <span>
                    ⚖️ <strong>{kgNum} kg</strong> converts to volume:
                  </span>
                  <strong style={{ color: isOverCapacity ? 'var(--ra)' : 'var(--gl)', fontSize: '0.95rem' }}>
                    📦 {convertedLitres} Litres {isOverCapacity ? '(⛔ Exceeds 5L Max)' : '(✓ Fits in 5L)'}
                  </strong>
                </div>
              )}

              <div style={{ fontSize: '0.72rem', color: 'var(--mu)', marginTop: '4px' }}>
                💡 Bulk packing density of selected crops is automatically applied to convert kg into volume (Litres).
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--mu)', background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--br)' }}>
              🔒 <strong>Chamber Allocation:</strong> Automatic. The system allocates 5L units or tests free space before merging.
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

            {selectedVegs.length > 0 && range && !isOverCapacity && (
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '14px', justifyContent: 'center' }}
                onClick={handleCreate}
                disabled={loading || !range || isOverCapacity}
              >
                {loading ? '⏳ Allocating Chamber...' : `⚡ Auto-Allocate 5L Chamber (${kgNum} kg / ${convertedLitres}L)`}
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
              Chamber Limit: 5.0 Litres • 5s live updates
            </span>
          </div>

          {!slots.length ? (
            <div className="empty-state">
              <div className="ei">❄️</div>
              <p>No storage chambers currently in use.<br />Select produce and weight in kg on the left to allocate the first chamber.</p>
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
                  incomingKg={kgNum}
                  incomingLitres={convertedLitres}
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