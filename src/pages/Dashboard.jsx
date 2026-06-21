import { useState, useEffect } from 'react';
import { api } from '../api.js';

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'agora mesmo';
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}

function activityDot(acao) {
  if (acao?.includes('REMOVE') || acao?.includes('BLOCK')) return 'dot-danger';
  if (acao?.includes('ACTIVE') || acao?.includes('APPROVE')) return 'dot-success';
  if (acao?.includes('SUSPEND') || acao?.includes('HIDDEN')) return 'dot-warn';
  return 'dot-info';
}

function activityLabel(entry) {
  const map = {
    USER_SUSPENDED:   '👤 Utilizador suspenso',
    USER_BLOCKED:     '🚫 Utilizador bloqueado',
    USER_ACTIVE:      '✅ Utilizador reactivado',
    VIDEO_REMOVED:    '🗑️ Vídeo removido',
    VIDEO_HIDDEN:     '🙈 Vídeo ocultado',
    VIDEO_ACTIVE:     '✅ Vídeo reactivado',
    REPORT_APPROVED:  '✅ Denúncia aprovada',
    REPORT_REJECTED:  '❌ Denúncia rejeitada',
    COMMENT_REMOVED:  '💬 Comentário removido',
  };
  return map[entry.acao] ?? entry.acao;
}

function StatCard({ label, value, type = 'primary', icon }) {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-card-header">
        <div className="stat-card-icon">{icon}</div>
      </div>
      <div className="value">{value ?? '—'}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export default function Dashboard({ toast, onNavigate }) {
  const [stats, setStats]       = useState(null);
  const [audit, setAudit]       = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.dashboard(),
      api.auditoria().catch(() => []),
    ])
      .then(([s, a]) => { setStats(s); setAudit(Array.isArray(a) ? a.slice(0, 8) : []); })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="stats-grid">
        {Array(7).fill(0).map((_, i) => (
          <div key={i} className="stat-card primary">
            <div className="skeleton" style={{ height: 36, width: 36, borderRadius: 9, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 30, width: '60%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 12, width: '80%' }} />
          </div>
        ))}
      </div>
    </div>
  );

  if (!stats) return null;

  return (
    <>
      <div className="stats-grid">
        <StatCard label="Total de Utilizadores"   value={stats.totalUtilizadores}     type="primary" icon="👥" />
        <StatCard label="Utilizadores Suspensos"  value={stats.utilizadoresSuspensos}  type="warn"    icon="⚠️" />
        <StatCard label="Utilizadores Bloqueados" value={stats.utilizadoresBloqueados} type="danger"  icon="🚫" />
        <StatCard label="Total de Vídeos"         value={stats.totalVideos}            type="success" icon="🎬" />
        <StatCard label="Publicados Hoje"         value={stats.videosHoje}             type="info"    icon="📤" />
        <StatCard label="Removidos Hoje"          value={stats.videosRemovidosHoje}    type="danger"  icon="🗑️" />
        <StatCard label="Denúncias Pendentes"     value={stats.denunciasPendentes}     type="warn"    icon="🚩" />
      </div>

      {/* Acções Rápidas */}
      <div className="section-card" style={{ marginBottom: 20 }}>
        <div className="section-card-header">
          <h3>⚡ Acções Rápidas</h3>
        </div>
        <div className="quick-actions">
          <button className="quick-btn" onClick={() => onNavigate?.('denuncias')}>
            <span className="qb-icon">🚩</span>
            Ver Denúncias Pendentes
            {stats.denunciasPendentes > 0 && (
              <span className="nav-badge" style={{ marginLeft: 'auto' }}>{stats.denunciasPendentes}</span>
            )}
          </button>
          <button className="quick-btn" onClick={() => onNavigate?.('videos')}>
            <span className="qb-icon">🎬</span>
            Gerir Vídeos
          </button>
          <button className="quick-btn" onClick={() => onNavigate?.('usuarios')}>
            <span className="qb-icon">👥</span>
            Gerir Utilizadores
          </button>
          <button className="quick-btn" onClick={() => onNavigate?.('auditoria')}>
            <span className="qb-icon">📋</span>
            Ver Auditoria
          </button>
        </div>
      </div>

      <div className="dash-grid">
        {/* Top 5 vídeos */}
        {stats.videosMaisVistos?.length > 0 && (
          <div className="section-card">
            <div className="section-card-header">
              <h3>🏆 Top Vídeos Mais Vistos</h3>
              <span className="count">{stats.videosMaisVistos.length} vídeos</span>
            </div>
            {stats.videosMaisVistos.map((v, i) => (
              <div key={v.id} className="top-video-row">
                <div className={`rank-badge rank-${i < 3 ? i + 1 : 'other'}`}>
                  {i + 1}
                </div>
                <div className="top-video-info">
                  <div className="top-video-title">{v.titulo}</div>
                  <div className="top-video-meta">{v.autor?.nome ?? 'Desconhecido'}</div>
                </div>
                <div className="views-pill">
                  👁 {v.views ?? 0}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actividade recente */}
        <div className="section-card">
          <div className="section-card-header">
            <h3>🕐 Actividade Recente</h3>
            <span className="count">{audit.length} entradas</span>
          </div>
          {audit.length === 0 ? (
            <div className="empty" style={{ padding: '28px 20px' }}>
              <div className="empty-icon">📋</div>
              <p>Sem actividade recente</p>
            </div>
          ) : (
            audit.map((entry, i) => (
              <div key={i} className="activity-row">
                <div className={`activity-dot ${activityDot(entry.acao)}`} />
                <div className="activity-text">
                  {activityLabel(entry)}
                  {entry.detalhe && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                      {entry.detalhe}
                    </div>
                  )}
                </div>
                <div className="activity-time">{timeAgo(entry.criadoEm)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
