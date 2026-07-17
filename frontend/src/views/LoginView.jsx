import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function LoginView({ onSwitchToRegister }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '400px', margin: '80px auto' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '6px', fontWeight: '700', textAlign: 'center' }}>Ingresar al Gestor</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>Administración de finanzas personales</p>
      
      {error && (
        <div style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email</label>
          <input 
            type="email" 
            required 
            className="glass-input" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="ejemplo@correo.com" 
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Contraseña</label>
          <input 
            type="password" 
            required 
            className="glass-input" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="******" 
          />
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '6px' }}>Ingresar</button>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        ¿Nuevo aquí? <span onClick={onSwitchToRegister} style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: '600' }}>Crea una cuenta</span>
      </p>
    </div>
  );
}
