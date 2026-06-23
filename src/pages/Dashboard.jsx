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

function LivePanel({ toast }) {
  const [live, setLive]       = useState(null);
  const [videos, setVideos]   = useState([]);
  const [videoId, setVideoId] = useState('');
  const [titulo, setTitulo]   = useState('');
  const [saving, setSaving]   = useState(false);

  function loadStatus() {
    api.liveStatus().then(setLive).catch(() => {});
  }

  useEffect(() => {
    loadStatus();
    api.videos('ativo', '').then(vs => { setVideos(vs); if (vs.length) setVideoId(vs[0].id); }).catch(() => {});
    const t = setInterval(loadStatus, 5000);
    return () => clearInterval(t);
  }, []);

  async function start() {
    const video = videos.find(v => v.id === videoId);
    if (!video) return toast('Seleccione um vídeo.', 'error');
    setSaving(true);
    try {
      // O caminho no servidor — backend resolverá a partir do id
      const sourcePath = `uploads/videos/${video.id}_compressed.mp4`;
      await api.liveStart(sourcePath, titulo || video.titulo);
      toast('Transmissão iniciada!');
      loadStatus();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function stop() {
    setSaving(true);
    try {
      await api.liveStop();
      toast('Transmissão encerrada.');
      loadStatus();
    } catch (e) { toast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  const aoVivo = live?.ao_vivo;

  return (
    <div className="section-card" style={{ marginBottom: 20, borderTop: `3px solid ${aoVivo ? '#ef4444' : 'var(--border)'}` }}>
      <div className="section-card-header">
        <h3>
          {aoVivo
            ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
                AO VIVO — {live.titulo}
              </span>
            : '📡 Transmissão ao Vivo'}
        </h3>
      </div>
      {aoVivo ? (
        <div style={{ padding: '12px 16px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>A transmitir desde {new Date(live.iniciadoEm).toLocaleTimeString('pt-PT')}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>URL: /hls/live/index.m3u8</div>
          </div>
          <button className="btn btn-danger" disabled={saving} onClick={stop}>
            {saving ? '⏳' : '⏹ Parar'}
          </button>
        </div>
      ) : (
        <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 2, minWidth: 160, marginBottom: 0 }}>
            <label>Vídeo fonte</label>
            <select value={videoId} onChange={e => setVideoId(e.target.value)}>
              {videos.map(v => <option key={v.id} value={v.id}>{v.titulo}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 2, minWidth: 160, marginBottom: 0 }}>
            <label>Título da transmissão</label>
            <input type="text" placeholder="Opcional" value={titulo} onChange={e => setTitulo(e.target.value)} />
          </div>
          <button className="btn btn-danger" disabled={saving || !videos.length} onClick={start}>
            {saving ? '⏳' : '🔴 Iniciar Live'}
          </button>
        </div>
      )}
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
      <LivePanel toast={toast} />
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
