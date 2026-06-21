import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (!data.token) throw new Error('Resposta inválida do servidor.');
      if (data.user?.role !== 'admin') throw new Error('Acesso restrito a administradores.');
      localStorage.setItem('admin_email', email);
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">🛡️</div>
        <h1>Admin Panel</h1>
        <p>Plataforma de Ocorrências em Vídeo</p>

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@exemplo.com"
            required
            autoFocus
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="error-msg">
            ⚠️ {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
          disabled={loading}
        >
          {loading ? '⏳ A autenticar...' : '→ Entrar'}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 11, marginTop: 18 }}>
          Requer conta com permissão de administrador
        </p>
      </form>
    </div>
  );
}
