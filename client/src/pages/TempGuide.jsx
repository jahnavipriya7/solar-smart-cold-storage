import React, { useState } from 'react';
import vegetables from '../utils/vegetables';

const cats = ['All', 'Root', 'Leafy', 'Flower', 'Legume', 'Fungi', 'Bulb', 'Fruit-Veg', 'Grain'];
const getColor = m => m <= 2 ? '#5bc8f5' : m <= 7 ? '#4dcfdf' : m <= 12 ? '#2ec46e' : '#f07c00';

export default function TempGuide() {
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = vegetables.filter(v =>
    (cat === 'All' || v.category === cat) &&
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <h1>📖 Temperature, <span>Humidity &amp; Shelf Life</span> Guide</h1>
        <p>Optimal preservation parameters for 25 vegetables — temperature range, relative humidity, and shelf life duration</p>
      </div>

      <div className="guide-layout">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
          <input
            className="form-input"
            placeholder="🔍 Search vegetable..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '220px' }}
          />
          {cats.map(c => (
            <button
              key={c}
              className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '18px', fontSize: '.78rem', color: 'var(--mu)' }}>
          <span style={{ color: '#5bc8f5' }}>● 0–2°C (Very Cold Storage)</span>
          <span style={{ color: '#4dcfdf' }}>● 3–7°C (Cold Storage)</span>
          <span style={{ color: '#2ec46e' }}>● 8–12°C (Cool Storage)</span>
          <span style={{ color: '#f07c00' }}>● 13–16°C (Mild Storage)</span>
        </div>

        <div className="guide-grid">
          {filtered.map(v => {
            const mid = (v.minTemp + v.maxTemp) / 2;
            const barW = (mid / 16) * 100;
            const col = getColor(v.minTemp);

            return (
              <div key={v.name} className="guide-card">
                <div className="guide-icon">{v.emoji}</div>
                <div className="guide-name">{v.name}</div>
                <div className="guide-temp" style={{ color: col }}>{mid}°C</div>
                <div className="guide-range">🌡️ Temp: {v.minTemp}–{v.maxTemp}°C</div>
                <div className="guide-range" style={{ color: '#4dcfdf' }}>💧 Humidity: {v.minHumidity}–{v.maxHumidity}% RH</div>

                <div className="temp-range-bar">
                  <div className="temp-range-fill" style={{ width: barW + '%', background: col }} />
                </div>

                <div className="guide-shelf">⏳ Shelf Life: {v.shelfLifeDays} days</div>
                <div className="guide-cat">{v.category} • Gas Safe &lt;25 ppm</div>
              </div>
            );
          })}
        </div>
      </div>

      <footer style={{
        textAlign: 'center',
        marginTop: '48px',
        padding: '24px 16px',
        borderTop: '1px solid var(--border, #2a3a2a)',
        color: 'var(--mu, #7a9a7a)',
        fontSize: '0.82rem',
        lineHeight: '1.6'
      }}>
        <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>🇮🇳</div>
        <div>Data collected from <strong>Government of India</strong></div>
        <div>Ministry of New and Renewable Energy</div>
      </footer>
    </div>
  );
}