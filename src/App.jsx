import { useState, useCallback, useEffect, createContext } from 'react';
import { api } from './api.js';
import Login from './pages/Login.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Videos from './pages/Videos.jsx';
import Usuarios from './pages/Usuarios.jsx';
import Denuncias from './pages/Denuncias.jsx';
import Categorias from './pages/Categorias.jsx';
import Auditoria from './pages/Auditoria.jsx';

export const ToastContext = createContext(null);

export default function App() {
  const [token, setToken]           = useState(() => localStorage.getItem('admin_token'));
  const [page, setPage]             = useState('dashboard');
  const [toasts, setToasts]         = useState([]);
  const [pendingCount, setPending]  = useState(0);

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now();
    const icon = type === 'success' ? '✅' : '❌';
    setToasts(t => [...t, { id, msg, type, icon }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  useEffect(() => {
    if (!token) return;
    api.denuncias('pendente')
      .then(d => setPending(Array.isArray(d) ? d.length : 0))
      .catch(() => {});
  }, [token, page]);

  function handleLogin(tok) {
    localStorage.setItem('admin_token', tok);
    setToken(tok);
  }

  function handleLogout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    setToken(null);
  }

  if (!token) return <Login onLogin={handleLogin} />;

  const pages = {
    dashboard:  Dashboard,
    videos:     Videos,
    usuarios:   Usuarios,
    denuncias:  Denuncias,
    categorias: Categorias,
    auditoria:  Auditoria,
  };
  const Page = pages[page] ?? Dashboard;

  return (
    <ToastContext.Provider value={toast}>
      <Layout page={page} onNavigate={setPage} onLogout={handleLogout} pendingCount={pendingCount}>
        <Page toast={toast} onNavigate={setPage} />
      </Layout>

      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">{t.icon}</span>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
