import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  { icon: '☀️', title: 'Solar & Battery Powered', desc: 'Seamlessly switches between direct Solar PV during daylight and Battery backup, keeping operational costs near zero.' },
  { icon: '🌡️', title: 'Smart Humidity and Temperature Control', desc: 'Automatically computes dual optimal temperature and relative humidity targets for all stored vegetable varieties.' },
  { icon: '💧', title: 'Humidity Range Optimization', desc: 'Maintains ideal 40–100% relative humidity to prevent dehydration, weight loss, and condensation spoilage.' },
  { icon: '🌿', title: 'Early Spoilage Detection', desc: 'IoT ethylene sensors detect early organic decomposition and notify farmers before produce spoils.' },
  { icon: '⚡', title: 'Dynamic Weather Load Control', desc: 'Intelligently increases or decreases refrigeration compressor load based on outside ambient temperature and humidity.' },
  { icon: '👨‍🌾', title: 'Auto Chamber Allocation', desc: 'Farmers input their produce and contact details — the system automatically assigns and optimizes storage chambers.' },
  { icon: '⏳', title: 'Shelf Life Tracking', desc: 'Monitors real-time freshness and remaining shelf life for each batch to minimize agricultural waste.' },
];

const steps = [
  { n: '1', t: 'Enter Farmer Details', d: 'Provide farmer name & phone number for real-time notifications and ownership tracking.' },
  { n: '2', t: 'Select Produce', d: 'Choose harvest batch. The system calculates temperature, humidity, and shelf life requirements.' },
  { n: '3', t: 'Check Compatibility', d: 'System evaluates whether produce can share an existing chamber or auto-allocates a new one.' },
  { n: '4', t: 'IoT Monitoring', d: 'Sensors monitor temperature, humidity, solar/battery power, and early spoilage levels 24/7.' },
];

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🌿 Renewable Solar Energy + IoT Cold Storage</div>
          <h1>Solar-Powered <span>Cold Storage</span> with Early Spoilage Detection</h1>
          <p>
            Preserve post-harvest freshness, prevent vegetable spoilage with IoT sensors, and dynamically adapt cooling load to ambient weather conditions.
          </p>
          <div className="hero-actions">
            <Link to="/storage" className="btn btn-primary">🥦 Allocate Storage Chamber</Link>
            <Link to="/dashboard" className="btn btn-secondary">📡 View IoT Dashboard</Link>
          </div>
          <div className="hero-stats">
            <div className="stat-card"><div className="stat-value">25+</div><div className="stat-label">Vegetables Supported</div></div>
            <div className="stat-card"><div className="stat-value">☀️ / 🔋</div><div className="stat-label">Solar & Battery Hybrid</div></div>
            <div className="stat-card"><div className="stat-value">0–16°C</div><div className="stat-label">Precise Temperature Control</div></div>
            <div className="stat-card"><div className="stat-value">40–100%</div><div className="stat-label">Humidity Range</div></div>
            <div className="stat-card"><div className="stat-value">🌿</div><div className="stat-label">Early Spoilage Detection</div></div>
            <div className="stat-card"><div className="stat-value">🏠</div><div className="stat-label">Automated Chamber Allocation</div></div>
            <div className="stat-card"><div className="stat-value">5 L</div><div className="stat-label">Per Chamber Capacity</div></div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-title">
          <h2>Engineered for <span>Sustainable Agriculture</span></h2>
          <p>A smart cold chain infrastructure designed to protect farmers from post-harvest crop loss.</p>
        </div>
        <div className="feature-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how-section">
        <div className="section-title">
          <h2>How It <span>Operates</span></h2>
          <p>Four streamlined steps from farm gate to climate-controlled smart chamber.</p>
        </div>
        <div className="steps-grid">
          {steps.map(s => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '44px' }}>
          <Link to="/storage" className="btn btn-primary">Start Vegetable Intake →</Link>
        </div>
      </section>
    </div>
  );
}