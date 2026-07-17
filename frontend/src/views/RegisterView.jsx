import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function RegisterView({ onSwitchToLogin }) {
  const { register } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await register(email, password, firstName);
      setSuccess('Registro exitoso. Serás redirigido al inicio de sesión...');
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '400px', margin: '80px auto' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '6px', fontWeight: '700', textAlign: 'center' }}>Registrar Cuenta</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.85rem', textAlign: 'center' }}>Únete al portfolio de finanzas</p>

      {error && (
        <div style={{ color: 'var(--danger)', background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center' }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: 'var(--success)', background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.2)', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center' }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Nombre</label>
          <input 
            type="text" 
            required 
            className="glass-input" 
            value={firstName} 
            onChange={e => setFirstName(e.target.value)} 
            placeholder="Tu nombre" 
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email</label>
          <input 
            type="email" 
            required 
            className="glass-input" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="tu@email.com" 
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
            placeholder="Mínimo 6 caracteres" 
          />
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '6px' }}>Registrarme</button>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
        ¿Ya tienes cuenta? <span onClick={onSwitchToLogin} style={{ color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: '600' }}>Inicia sesión</span>
      </p>
    </div>
  );
}
