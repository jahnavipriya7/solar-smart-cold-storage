import React, { useState, useMemo } from 'react';
import vegetables, { computeRange } from '../utils/vegetables';

export default function VegSelector({ selected, onChange }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    vegetables.filter(v =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const toggle = (veg) => {
    const exists = selected.find(s => s.name === veg.name);
    if (exists) {
      onChange(selected.filter(s => s.name !== veg.name));
    } else {
      onChange([...selected, veg]);
    }
  };

  const remove = (name) => onChange(selected.filter(s => s.name !== name));
  const range = computeRange(selected);

  return (
    <div>
      <div className="form-group">
        <label>Search & Select Perishable Produce</label>
        <input
          className="form-input"
          placeholder="e.g. Tomato, Carrot, Spinach, Potato..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="veg-grid">
        {filtered.map(veg => (
          <div
            key={veg.name}
            className={`veg-chip ${selected.find(s => s.name === veg.name) ? 'selected' : ''}`}
            onClick={() => toggle(veg)}
          >
            <span style={{ fontSize: '1.2rem' }}>{veg.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{veg.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--mu)' }}>
                {veg.minTemp}–{veg.maxTemp}°C | {veg.minHumidity}–{veg.maxHumidity}% RH
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected.length > 0 && (
        <>
          <div style={{ fontSize: '.76rem', color: 'var(--mu)', marginTop: '12px', marginBottom: '5px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>
            Selected Vegetables ({selected.length})
          </div>
          <div className="tags-wrap">
            {selected.map(v => (
              <span key={v.name} className="tag">
                {v.emoji} {v.name} ({v.shelfLifeDays}d shelf)
                <span className="tag-remove" onClick={() => remove(v.name)}>✕</span>
              </span>
            ))}
          </div>

          <div className={`temp-rec ${range ? 'show' : ''}`}>
            {range ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <div className="temp-rec-label">🌡️ Target Temperature</div>
                    <div className="temp-rec-value">{range.targetTemp}°C</div>
                    <div className="temp-rec-range">Range: {range.minTemp}°C – {range.maxTemp}°C</div>
                  </div>
                  <div>
                    <div className="temp-rec-label" style={{ color: '#4dcfdf' }}>💧 Target Humidity</div>
                    <div className="temp-rec-value" style={{ color: '#4dcfdf' }}>{range.targetHumidity}%</div>
                    <div className="temp-rec-range">Range: {range.minHumidity}% – {range.maxHumidity}% RH</div>
                  </div>
                </div>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: 'var(--mu)' }}>
                  ⏳ Estimated Minimum Shelf Life: <strong style={{ color: 'var(--gl)' }}>{range.shelfLifeDays} Days</strong> | 🧪 Gas Sensor Status: <strong style={{ color: 'var(--gl)' }}>Fresh (0-25 ppm)</strong>
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--ra)', fontSize: '.85rem' }}>
                ⚠️ The selected vegetables have incompatible temperature or humidity requirements. Please deselect conflicting items.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}