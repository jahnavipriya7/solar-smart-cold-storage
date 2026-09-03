import React, { useState } from 'react';
import { useStorage } from '../context/StorageContext';

function daysSince(d) {
  return Math.floor((Date.now() - new Date(d)) / 86400000);
}

export default function SlotCard({ slot, compatResult, onAddVegs, selectedVegs, incomingQty }) {
  const { deleteSlot } = useStorage();
  const [conf, setConf] = useState(false);

  const sc = slot.status === 'critical' ? 'slot-critical' : slot.status === 'warning' ? 'slot-warning' : 'slot-active';
  const bc = slot.status === 'critical' ? 'badge-critical' : slot.status === 'warning' ? 'badge-warning' : 'badge-active';

  // Spoilage badge
  const gasColor = slot.spoilageStatus === 'Spoiled' ? 'var(--ra)' : slot.spoilageStatus === 'Warning' ? 'var(--sy)' : 'var(--gl)';
  const gasIcon = slot.spoilageStatus === 'Spoiled' ? '🚨' : slot.spoilageStatus === 'Warning' ? '⚠️' : '🍃';

  // Capacity calculations (5 Litres max)
  const totalCap = slot.totalCapacityLitres || 5.0;
  const usedCap = slot.usedCapacityLitres || 1.0;
  const freeCap = Math.max(0, totalCap - usedCap);
  const capPct = Math.min(100, Math.round((usedCap / totalCap) * 100));

  // Shelf life
  const minShelf = Math.min(...(slot.vegetables || []).map(v => v.shelfLifeDays || 30));
  const daysPassed = daysSince(slot.createdAt);
  const remainingDays = Math.max(0, minShelf - daysPassed);

  return (
    <div className={`slot-card ${sc}`}>
      <div className="slot-header">
        <div>
          <div className="slot-name">
            ❄️ {slot.allocatedSlot}
            <span className={`slot-badge ${bc}`}>{slot.status}</span>
            <span className={`power-pill ${slot.powerSource === 'Solar' ? 'p-solar' : 'p-battery'}`}>
              {slot.powerSource === 'Solar' ? '☀️ Solar' : '🔋 Battery'}
            </span>
          </div>
          <div style={{ fontSize: '.8rem', color: 'var(--mu)', marginTop: '3px' }}>
            👤 <strong>{slot.farmerName}</strong> &nbsp;|&nbsp; 📞 <strong>{slot.farmerPhone}</strong> &nbsp;|&nbsp; Stored: {daysPassed}d ago
          </div>
        </div>
      </div>

      {/* 5-Litre Capacity Progress Section */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '9px 12px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', marginBottom: '5px' }}>
          <span>📦 Chamber Volume (5L Max): <strong style={{ color: 'var(--tm)' }}>{usedCap.toFixed(1)}L / {totalCap.toFixed(1)}L Used</strong></span>
          <span style={{ color: freeCap === 0 ? 'var(--ra)' : 'var(--gl)', fontWeight: 600 }}>
            {freeCap === 0 ? '⛔ Full' : freeCap.toFixed(1) + 'L Free Space'}
          </span>
        </div>
        <div className="shelf-progress-bar" style={{ height: '6px', marginBottom: '0' }}>
          <div
            className="shelf-progress-fill"
            style={{
              width: capPct + '%',
              background: capPct >= 100 ? 'var(--ra)' : capPct >= 80 ? 'var(--sy)' : 'linear-gradient(90deg, var(--gm), var(--gl))'
            }}
          />
        </div>
      </div>

      {/* IoT Live Sensor Grid */}
      <div className="slot-metrics" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="metric">
          <div className="mv" style={{ color: 'var(--cb)' }}>
            {slot.currentTemp !== null ? slot.currentTemp + '°C' : '--'}
          </div>
          <div className="ml">Chamber Temp (Tgt: {slot.targetTemp}°C)</div>
        </div>
        <div className="metric">
          <div className="mv" style={{ color: '#4dcfdf' }}>
            {slot.currentHumidity !== null ? slot.currentHumidity + '%' : '--'}
          </div>
          <div className="ml">Humidity (Tgt: {slot.targetHumidity}%)</div>
        </div>
        <div className="metric">
          <div className="mv" style={{ color: gasColor }}>
            {gasIcon} {slot.gasPpm || 12} ppm
          </div>
          <div className="ml">Gas Sensor ({slot.spoilageStatus || 'Fresh'})</div>
        </div>
        <div className="metric">
          <div className="mv" style={{ color: 'var(--sy)' }}>
            {slot.coolingLoadPct || 65}%
          </div>
          <div className="ml">Cooling Load ({slot.coolingLoad || 'Med'})</div>
        </div>
      </div>

      {/* Ambient Outside Weather */}
      <div className="outside-bar">
        <span>🌤️ Outside Ambient: <strong>{slot.outsideTemp || 33}°C</strong>, <strong>{slot.outsideHumidity || 60}% RH</strong></span>
        <span>⚡ Dynamic cooling load modulation active</span>
      </div>

      {/* Shelf Life Tracker */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.74rem', color: 'var(--mu)', margin: '8px 0 4px' }}>
        <span>⏳ Shelf Life: <strong style={{ color: remainingDays <= 2 ? 'var(--ra)' : 'var(--gl)' }}>{remainingDays} of {minShelf} Days Remaining</strong></span>
        <span>Optimal: {slot.minTemp}–{slot.maxTemp}°C | {slot.minHumidity}–{slot.maxHumidity}% RH</span>
      </div>

      <div className="shelf-progress-bar">
        <div
          className="shelf-progress-fill"
          style={{
            width: Math.min(100, Math.max(5, (remainingDays / minShelf) * 100)) + '%',
            background: remainingDays <= 2 ? 'var(--ra)' : 'linear-gradient(90deg, var(--gl), #4dcfdf)'
          }}
        />
      </div>

      <div className="slot-vegs" style={{ marginTop: '10px' }}>
        {slot.vegetables.map(v => (
          <span key={v.name} className="slot-veg-tag">
            {v.emoji} {v.name} ({v.shelfLifeDays}d shelf)
          </span>
        ))}
      </div>

      <div className="slot-actions">
        {compatResult && selectedVegs?.length > 0 && (
          <span className={`compat-badge ${compatResult.compatible ? 'ok' : 'no'}`}>
            {compatResult.compatible
              ? `✅ Compatible (${incomingQty || 1}L fits into ${freeCap.toFixed(1)}L free space)`
              : `❌ ${compatResult.compatReason || 'Incompatible'}`}
          </span>
        )}
        {compatResult?.compatible && selectedVegs?.length > 0 && onAddVegs && (
          <button className="btn btn-primary btn-sm" onClick={() => onAddVegs(slot._id)}>
            + Merge {incomingQty || 1}L into this 5L Chamber
          </button>
        )}
        <button className="btn btn-danger btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setConf(true)}>
          Release Chamber 🗑️
        </button>
      </div>

      {conf && (
        <div style={{ marginTop: '10px', padding: '11px', background: 'rgba(224,48,48,.08)', borderRadius: '8px', border: '1px solid rgba(224,48,48,.2)', fontSize: '.83rem' }}>
          Release this 5L chamber and dispatch {usedCap}L produce for farmer <strong>{slot.farmerName}</strong> ({slot.farmerPhone})?
          <div style={{ display: 'flex', gap: '7px', marginTop: '7px' }}>
            <button className="btn btn-danger btn-sm" onClick={() => { deleteSlot(slot._id, slot.allocatedSlot); setConf(false); }}>
              Yes, Release Chamber
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setConf(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}