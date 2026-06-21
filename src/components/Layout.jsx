const NAV = [
  { id: 'dashboard',  label: 'Dashboard',       icon: '◈' },
  { id: 'videos',     label: 'Vídeos',           icon: '▶' },
  { id: 'usuarios',   label: 'Utilizadores',     icon: '◉' },
  { id: 'denuncias',  label: 'Denúncias',        icon: '⚑', badge: true },
  { id: 'categorias', label: 'Categorias',       icon: '⊞' },
  { id: 'auditoria',  label: 'Auditoria',        icon: '☰' },
];

const TITLES = {
  dashboard:  'Dashboard',
  videos:     'Gestão de Vídeos',
  usuarios:   'Gestão de Utilizadores',
  denuncias:  'Denúncias',
  categorias: 'Categorias',
  auditoria:  'Registo de Auditoria',
};

function avatarColor(name) {
  const colors = ['#5b7cf6','#a855f7','#ec4899','#22c55e','#f59e0b','#38bdf8'];
  let h = 0;
  for (let i = 0; i < (name?.length || 0); i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return colors[h % colors.length];
}

export default function Layout({ page, onNavigate, onLogout, children, pendingCount }) {
  const now = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  const email = localStorage.getItem('admin_email') || 'admin@ocorrencias.ao';
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">
            <div className="logo-icon">🛡️</div>
            <div>
              <h2>Admin Panel</h2>
            </div>
          </div>
          <p>Plataforma de Ocorrências</p>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Menu</div>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? 'active' : ''}`}
              onClick={() => onNavigate(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {n.badge && pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar" style={{ background: avatarColor(email) }}>
              {initials}
            </div>
            <div>
              <div className="admin-name">Administrador</div>
              <div className="admin-role">{email}</div>
            </div>
          </div>
          <button className="nav-item" onClick={onLogout} style={{ color: '#ef4444' }}>
            <span className="nav-icon">⎋</span>
            Terminar Sessão
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{TITLES[page] ?? 'Admin'}</h1>
          </div>
          <div className="topbar-right">
            <div className="topbar-pill">Sistema online</div>
            <span className="topbar-time">{now}</span>
          </div>
        </header>

        <div className="page">{children}</div>
      </div>
    </div>
  );
}
