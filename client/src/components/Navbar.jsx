import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [powerSource, setPowerSource] = useState('Solar');

  useEffect(() => {
    // Dynamic power source indicator
    const iv = setInterval(() => {
      setPowerSource(Math.random() > 0.2 ? 'Solar' : 'Battery');
    }, 10000);
    return () => clearInterval(iv);
  }, []);

  return (
    <nav>
      <NavLink to="/" className="nav-brand">
        <span>🌱</span>
        <span>SolarCold IoT</span>
      </NavLink>
      <div className="nav-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/storage" className={({ isActive }) => isActive ? 'active' : ''}>Storage</NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        <NavLink to="/guide" className={({ isActive }) => isActive ? 'active' : ''}>Temp & Humidity Guide</NavLink>
      </div>
      <div className={`power-badge ${powerSource === 'Solar' ? 'p-solar' : 'p-battery'}`}>
        <span>{powerSource === 'Solar' ? '☀️' : '🔋'}</span>
        <span>Active Source: <strong>{powerSource}</strong></span>
        <div className="pulse-dot" />
      </div>
    </nav>
  );
}