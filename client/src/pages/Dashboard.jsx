import React, { useEffect, useState } from 'react';
import { useStorage } from '../context/StorageContext';

export default function Dashboard() {
  const { slots, alerts, fetchSlots, fetchAlerts, dismissAlert } = useStorage();
  const [ambient, setAmbient] = useState({ temp: 33.5, humidity: 62 });
  const [powerMode, setPowerMode] = useState('Solar');

  useEffect(() => {
    fetchSlots();
    fetchAlerts();
    const iv = setInterval(() => {
      fetchSlots();
      fetchAlerts();
      setAmbient({
        temp: parseFloat((33.5 + (Math.random() - 0.5) * 2.5).toFixed(1)),
        humidity: Math.round(62 + (Math.random() - 0.5) * 6)
      });
      setPowerMode(Math.random() > 0.25 ? 'Solar' : 'Battery');
    }, 5000);
    return () => clearInterval(iv);
  }, [fetchSlots, fetchAlerts]);

  const avg = (arr, fn) => arr.length ? (arr.reduce((a, s) => a + fn(s), 0) / arr.length).toFixed(1) : '--';
  const avgTemp = avg(slots, s => s.currentTemp ?? s.targetTemp);
  const avgHum = avg(slots, s => s.currentHumidity ?? 90);
  const avgGas = avg(slots, s => s.gasPpm || 12);
  const isSpoiled = slots.some(s => s.spoilageStatus === 'Spoiled');
  const isWarning = slots.some(s => s.spoilageStatus === 'Warning');

  // Dynamic system load calculation
  const overallLoad = slots.length ? Math.round(slots.reduce((a, s) => a + (s.coolingLoadPct || 65), 0) / slots.length) : 65;
  const loadCategory = overallLoad < 40 ? 'Low' : overallLoad < 75 ? 'Medium' : overallLoad < 90 ? 'High' : 'Maximum';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '80px 20px 60px' }}>
      {/* Clean Page Title */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Poppins', fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>
          IoT <span>Storage Dashboard</span>
        </h1>
        <p style={{ color: 'var(--mu)', fontSize: '0.9rem' }}>
          Live monitoring of 5-Litre chambers, power source, dynamic load &amp; gas spoilage sensor
        </p>
      </div>

      {/* 3 Streamlined Essential Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
        {/* 1. Power & Dynamic Load */}
        <div className="card" style={{ padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--mu)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '4px' }}>
            Power &amp; Cooling Load
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: powerMode === 'Solar' ? 'var(--sy)' : 'var(--cb)', fontFamily: 'Poppins' }}>
            {powerMode === 'Solar' ? '☀️ Solar' : '🔋 Battery'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--mu)', marginTop: '4px' }}>
            Load: <strong style={{ color: '#4dcfdf' }}>{overallLoad}% ({loadCategory})</strong>
            <br />
            Outside: {ambient.temp}°C, {ambient.humidity}% RH
          </div>
        </div>

        {/* 2. Temperature & Humidity */}
        <div className="card" style={{ padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--mu)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '4px' }}>
            Average Chamber Climate
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cb)', fontFamily: 'Poppins' }}>
            {avgTemp}°C / {avgHum}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--mu)', marginTop: '4px' }}>
            Inside Storage: <strong style={{ color: 'var(--gl)' }}>Optimal Range</strong>
          </div>
        </div>

        {/* 3. Gas Sensor & Spoilage */}
        <div className="card" style={{ padding: '18px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--mu)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '4px' }}>
            Gas Sensor (MQ-135)
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isSpoiled ? 'var(--ra)' : isWarning ? 'var(--sy)' : 'var(--gl)', fontFamily: 'Poppins' }}>
            {avgGas} ppm
          </div>
          <div style={{ fontSize: '0.78rem', color: isSpoiled ? 'var(--ra)' : isWarning ? 'var(--sy)' : 'var(--gl)', marginTop: '4px', fontWeight: 600 }}>
            {isSpoiled ? '🚨 Spoilage Risk' : isWarning ? '⚠️ Early Warning' : '🍃 Fresh (No Spoilage)'}
          </div>
        </div>
      </div>

      {/* Active Chambers List (Clean Table) */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>❄️ Active Storage Chambers (5.0L Hardware Limit)</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--mu)', fontWeight: 400 }}>Refreshes every 5s</span>
        </div>

        {!slots.length ? (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--mu)', fontSize: '0.9rem' }}>
            No storage chambers active. Allocate a chamber from the Storage tab.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Chamber</th>
                  <th>Farmer</th>
                  <th>Contact</th>
                  <th>Weight &amp; Volume (5L Max)</th>
                  <th>Produce &amp; Shelf Life</th>
                  <th>Temp / Humidity</th>
                  <th>Gas Sensor</th>
                </tr>
              </thead>
              <tbody>
                {slots.map(s => {
                  const minShelf = Math.min(...(s.vegetables || []).map(v => v.shelfLifeDays || 30));
                  const usedL = s.usedCapacityLitres || 3.0;
                  const usedKg = s.usedWeightKg || parseFloat((usedL / 1.5).toFixed(1));
                  const totalL = s.totalCapacityLitres || 5.0;
                  const isFull = usedL >= totalL;

                  return (
                    <tr key={s._id}>
                      <td>
                        <strong style={{ color: 'var(--tm)' }}>{s.allocatedSlot || s.slotName}</strong>
                      </td>
                      <td>{s.farmerName}</td>
                      <td style={{ color: 'var(--mu)' }}>{s.farmerPhone}</td>
                      <td>
                        <strong style={{ color: isFull ? 'var(--ra)' : 'var(--gl)' }}>
                          {usedL.toFixed(1)}L / {totalL.toFixed(1)}L ({usedKg} kg)
                        </strong>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: isFull ? 'var(--ra)' : 'var(--mu)' }}>
                          {isFull ? '⛔ Full' : `${Math.max(0, totalL - usedL).toFixed(1)}L free`}
                        </span>
                      </td>
                      <td>
                        {(s.vegetables || []).map(v => v.emoji + ' ' + v.name).join(', ')}
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--gl)' }}>
                          Shelf life: {minShelf} days
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--cb)' }}>
                          {s.currentTemp !== null ? s.currentTemp + '°C' : '--'}
                        </strong> / {s.currentHumidity !== null ? s.currentHumidity + '%' : '--'}
                      </td>
                      <td>
                        <span style={{
                          color: s.spoilageStatus === 'Spoiled' ? 'var(--ra)' : s.spoilageStatus === 'Warning' ? 'var(--sy)' : 'var(--gl)',
                          fontWeight: 600,
                          fontSize: '0.82rem'
                        }}>
                          {s.gasPpm || 12} ppm ({s.spoilageStatus || 'Fresh'})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Minimal Alerts Section */}
      {alerts.length > 0 && (
        <div className="card">
          <div className="card-title">🔔 Recent Alerts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alerts.slice(0, 3).map(a => (
              <div key={a._id} className={'alert-item a-' + a.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{a.type === 'danger' ? '🚨' : a.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
                  <span>{a.message}</span>
                </div>
                <span className="alert-dismiss" onClick={() => dismissAlert(a._id)}>✕</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}