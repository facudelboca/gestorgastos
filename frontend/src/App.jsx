import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import DashboardView from './views/DashboardView';
import TransactionsView from './views/TransactionsView';
import OperationsView from './views/OperationsView';
import ConfigView from './views/ConfigView';

function AppContent() {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [authScreen, setAuthScreen] = useState('LOGIN');

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
      
      <main style={{ flex: '1', padding: '32px 20px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'DASHBOARD' && <DashboardView />}
        {activeTab === 'TRANSACTIONS' && <TransactionsView />}
        {activeTab === 'OPERATIONS' && <OperationsView />}
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
