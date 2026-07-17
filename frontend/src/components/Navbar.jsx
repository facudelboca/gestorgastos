import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <header style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', padding: '0 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
          🎯 FINANZAS
        </h1>
        <nav style={{ display: 'flex' }}>
          <button 
            onClick={() => setActiveTab('DASHBOARD')} 
            className={`nav-tab-button ${activeTab === 'DASHBOARD' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('TRANSACTIONS')} 
            className={`nav-tab-button ${activeTab === 'TRANSACTIONS' ? 'active' : ''}`}
          >
            Historial
          </button>
          <button 
            onClick={() => setActiveTab('OPERATIONS')} 
            className={`nav-tab-button ${activeTab === 'OPERATIONS' ? 'active' : ''}`}
          >
            Operaciones
          </button>
          <button 
            onClick={() => setActiveTab('STATS')} 
            className={`nav-tab-button ${activeTab === 'STATS' ? 'active' : ''}`}
          >
            Estadísticas
          </button>
          <button 
            onClick={() => setActiveTab('CONFIG')} 
            className={`nav-tab-button ${activeTab === 'CONFIG' ? 'active' : ''}`}
          >
            Ajustes
          </button>
        </nav>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Usuario: <strong>{user?.firstName}</strong>
        </span>
        <button onClick={logout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}
