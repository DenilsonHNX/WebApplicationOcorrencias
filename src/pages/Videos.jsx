import { useState, useEffect } from 'react';
import { api } from '../api.js';
import VideoModal from '../components/VideoModal.jsx';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT');
}

function fmtDur(seg) {
  if (!seg) return '—';
  const m = Math.floor(seg / 60);
  const s = Math.floor(seg % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function Videos({ toast }) {
  const [videos, setVideos]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('ativo');
  const [pesquisa, setPesquisa]       = useState('');
  const [saving, setSaving]           = useState(null);
  const [preview, setPreview]         = useState(null);

  function load(estado, q) {
    setLoading(true);
    api.videos(estado, q)
      .then(setVideos)
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(filtroEstado, ''); }, [filtroEstado]);

  function pesquisar(e) {
    e.preventDefault();
    load('', pesquisa);
  }

  async function setEstado(id, estado) {
    setSaving(id);
    try {
      await api.setEstadoVideo(id, estado);
      toast(`Vídeo marcado como "${estado}".`);
      setVideos(vs => vs.map(v => v.id === id ? { ...v, estado } : v));
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(null);
    }
  }

  const tabs = [
    { key: 'ativo',    label: '✅ Activos' },
    { key: 'oculto',   label: '🙈 Ocultos' },
    { key: 'removido', label: '🗑️ Removidos' },
  ];

  return (
    <>
      <div className="toolbar">
        <form onSubmit={pesquisar} style={{ display: 'flex', gap: 8 }}>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Pesquisar vídeos..."
              value={pesquisa}
              onChange={e => setPesquisa(e.target.value)}
              style={{ width: 220 }}
            />
          </div>
          <button className="btn btn-ghost" type="submit">Pesquisar</button>
          {pesquisa && (
            <button className="btn btn-ghost" type="button" onClick={() => { setPesquisa(''); load(filtroEstado, ''); }}>
              ✕ Limpar
            </button>
          )}
        </form>

        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`btn btn-sm ${filtroEstado === t.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => { setFiltroEstado(t.key); setPesquisa(''); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span className="count-tag" style={{ marginLeft: 'auto' }}>
          {videos.length} vídeo(s)
        </span>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div style={{ padding: 24 }}>
            {Array(5).fill(0).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 9, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ height: 13, width: '40%' }} />
                  <div className="skeleton" style={{ height: 11, width: '25%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎬</div>
            <h3>Nenhum vídeo encontrado</h3>
            <p>Tente ajustar os filtros de pesquisa</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vídeo</th>
                <th>Autor</th>
                <th>Duração</th>
                <th>👁 Vistas</th>
                <th>❤ Likes</th>
                <th>🚩 Denúncias</th>
                <th>Estado</th>
                <th>Data</th>
                <th>Acções</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(v => (
                <tr key={v.id}>
                  <td style={{ maxWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 44, height: 44,
                        borderRadius: 9,
                        background: 'var(--surface2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0,
                        border: '1px solid var(--border)',
                      }}>
                        🎬
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                          {v.titulo}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                          {v.descricao?.slice(0, 50) || 'Sem descrição'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{v.autor?.nome ?? '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{v.autor?.email}</div>
                  </td>
                  <td style={{ color: 'var(--text2)', fontVariantNumeric: 'tabular-nums' }}>
                    {fmtDur(v.duracao)}
                  </td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{v.views ?? 0}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums' }}>{v.likes ?? 0}</td>
                  <td>
                    {(v.denuncias ?? 0) > 0 ? (
                      <span style={{
                        background: 'rgba(245,158,11,.1)',
                        border: '1px solid rgba(245,158,11,.25)',
                        color: 'var(--warn)',
                        borderRadius: 20,
                        padding: '2px 8px',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        ⚠ {v.denuncias}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>0</span>
                    )}
                  </td>
                  <td><span className={`badge badge-${v.estado}`}>{v.estado}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{fmt(v.criadoEm)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => setPreview(v)}>
                        ▶ Ver
                      </button>
                      {v.estado !== 'ativo' && (
                        <button className="btn btn-sm btn-success" disabled={saving === v.id} onClick={() => setEstado(v.id, 'ativo')}>
                          ✓ Reativar
                        </button>
                      )}
                      {v.estado !== 'oculto' && (
                        <button className="btn btn-sm btn-ghost" disabled={saving === v.id} onClick={() => setEstado(v.id, 'oculto')}>
                          🙈 Ocultar
                        </button>
                      )}
                      {v.estado !== 'removido' && (
                        <button className="btn btn-sm btn-danger" disabled={saving === v.id} onClick={() => setEstado(v.id, 'removido')}>
                          🗑️ Remover
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {preview && <VideoModal video={preview} onClose={() => setPreview(null)} />}
    </>
  );
}
