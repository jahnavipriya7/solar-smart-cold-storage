import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StorageProvider } from './context/StorageContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Home from './pages/Home';
import Storage from './pages/Storage';
import Dashboard from './pages/Dashboard';
import TempGuide from './pages/TempGuide';

export default function App() {
  return (
    <StorageProvider>
      <Router>
        <Navbar />
        <Toast />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/storage" element={<Storage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guide" element={<TempGuide />} />
        </Routes>
      </Router>
    </StorageProvider>
  );
}
