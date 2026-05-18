import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Objetivos from './pages/Objetivos.jsx';
import Ejercicio from './pages/Ejercicio.jsx';
import Dieta from './pages/Dieta.jsx';
import Progreso from './pages/Progreso.jsx';

const styles = {
  app: {
    display: 'flex',
    minHeight: '100vh',
    background: '#0f0f1a',
  },
  main: {
    flex: 1,
    overflow: 'auto',
    minWidth: 0,
    background: '#0f0f1a',
  },
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(o => !o)} />
        <main style={{ ...styles.main, marginLeft: sidebarOpen ? 0 : 0 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/objetivos" element={<Objetivos />} />
            <Route path="/ejercicio" element={<Ejercicio />} />
            <Route path="/dieta" element={<Dieta />} />
            <Route path="/progreso" element={<Progreso />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
