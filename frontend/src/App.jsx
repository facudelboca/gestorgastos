import React, { useState, useContext, useEffect } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import DashboardView from './views/DashboardView';
import TransactionsView from './views/TransactionsView';
import OperationsView from './views/OperationsView';
import ConfigView from './views/ConfigView';
import StatsView from './views/StatsView';

function AppContent() {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [authScreen, setAuthScreen] = useState('LOGIN');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!token) return;

    const es = new EventSource(`http://localhost:8080/api/notifications/subscribe?token=${token}`);

    es.addEventListener('NOTIFICATION', (e) => {
      setToast({ message: e.data, type: 'danger' });
    });

    es.onerror = () => {
      console.warn('Conexión SSE interrumpida. EventSource reconectará automáticamente.');
    };

    return () => {
      es.close();
    };
  }, [token]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 10000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!token) {
    return authScreen === 'LOGIN' ? (
      <LoginView onSwitchToRegister={() => setAuthScreen('REGISTER')} />
    ) : (
      <RegisterView onSwitchToLogin={() => setAuthScreen('LOGIN')} />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--danger)',
          borderRadius: '8px',
          padding: '16px 20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
          zIndex: 10000,
          maxWidth: '360px',
          fontSize: '0.85rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          animation: 'slideUp 0.25s ease-out forwards'
        }}>
          <strong style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
            ⚠️ Alerta de Transacción
          </strong>
          <span style={{ color: 'var(--text-primary)', lineHeight: '1.4' }}>{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            style={{ alignSelf: 'flex-end', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', padding: '0' }}
          >
            Entendido
          </button>
        </div>
      )}

      <main style={{ flex: '1', padding: '32px 20px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'DASHBOARD' && <DashboardView />}
        {activeTab === 'TRANSACTIONS' && <TransactionsView />}
        {activeTab === 'OPERATIONS' && <OperationsView />}
        {activeTab === 'STATS' && <StatsView />}
        {activeTab === 'CONFIG' && <ConfigView />}
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}>
        Finanzas Manager - Arquitectura Backend Profesional Java 25 & Spring Boot con React Frontend
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
