import { useState, useEffect } from 'react';
import { api } from '../api.js';
import VideoModal from '../components/VideoModal.jsx';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'short' });
}

function ResolverModal({ denuncia, onClose, onResolvida, toast }) {
  const [estado, setEstado]               = useState('aprovada');
  const [removerVideo, setRemoverVideo]   = useState(false);
  const [suspenderAutor, setSuspenderAutor] = useState(false);
  const [saving, setSaving]               = useState(false);
  const [verVideo, setVerVideo]           = useState(false);

  async function submit() {
    setSaving(true);
    try {
      await api.resolverDenuncia(denuncia.id, { estado, removerVideo, suspenderAutor });
      toast(`Denúncia ${estado} com sucesso.`);
      onResolvida(denuncia.id, estado);
      onClose();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">🚩 Resolver Denúncia</div>

        <div className="modal-info-row">
          <label>Vídeo</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span>{denuncia.video?.titulo ?? denuncia.videoId ?? '(sem título)'}</span>
            {denuncia.video?.id && denuncia.video?.estado !== 'removido' && (
              <button className="btn btn-sm btn-ghost" onClick={() => setVerVideo(true)}>
                ▶ Ver vídeo
              </button>
            )}
          </div>
        </div>
        <div className="modal-info-row">
          <label>Denunciante</label>
          <span>{denuncia.denunciante?.nome ?? '—'}</span>
        </div>
        <div className="modal-info-row">
          <label>Motivo</label>
          <span style={{ color: 'var(--warn)' }}>{denuncia.motivo}</span>
        </div>
        {denuncia.descricao && (
          <div className="modal-info-row">
            <label>Descrição</label>
            <span style={{ color: 'var(--text2)' }}>{denuncia.descricao}</span>
          </div>
        )}

        <hr className="modal-divider" />

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--muted)', display: 'block', marginBottom: 10 }}>
            Decisão
          </label>
          <div className="radio-group">
            <label className="radio-opt opt-approve">
              <input type="radio" value="aprovada" checked={estado === 'aprovada'} onChange={() => setEstado('aprovada')} />
              ✓ Aprovar
            </label>
            <label className="radio-opt opt-reject">
              <input type="radio" value="rejeitada" checked={estado === 'rejeitada'} onChange={() => setEstado('rejeitada')} />
              ✗ Rejeitar
            </label>
          </div>
        </div>

        {estado === 'aprovada' && (
          <div className="check-group">
            <label className="check-row">
              <input type="checkbox" checked={removerVideo} onChange={e => setRemoverVideo(e.target.checked)} />
              <div className="check-info">
                <span className="check-label">🗑️ Remover o vídeo</span>
                <span className="check-sub">O vídeo ficará indisponível para todos os utilizadores</span>
              </div>
            </label>
            <label className="check-row">
              <input type="checkbox" checked={suspenderAutor} onChange={e => setSuspenderAutor(e.target.checked)} />
              <div className="check-info">
                <span className="check-label">⏸ Suspender o autor</span>
                <span className="check-sub">O autor ficará temporariamente sem acesso</span>
              </div>
            </label>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button
            className={`btn ${estado === 'aprovada' ? 'btn-danger' : 'btn-ghost'}`}
            onClick={submit}
            disabled={saving}
          >
            {saving ? '⏳ A guardar...' : '✓ Confirmar'}
          </button>
        </div>
      </div>

      {verVideo && denuncia.video && (
        <VideoModal video={denuncia.video} onClose={() => setVerVideo(false)} />
      )}
    </div>
  );
}

export default function Denuncias({ toast }) {
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filtro, setFiltro]       = useState('pendente');
  const [modal, setModal]         = useState(null);
  const [preview, setPreview]     = useState(null);

  function load(estado) {
    setLoading(true);
    api.denuncias(estado)
      .then(setDenuncias)
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(filtro); }, [filtro]);

  function onResolvida(id, estado) {
    setDenuncias(ds => ds.map(d => d.id === id ? { ...d, estado } : d));
  }

  const tabs = [
    { key: 'pendente',  label: '⏳ Pendentes' },
    { key: 'aprovada',  label: '✅ Aprovadas' },
    { key: 'rejeitada', label: '❌ Rejeitadas' },
    { key: '',          label: '☰ Todas' },
  ];

  return (
    <>
      <div className="toolbar">
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`btn btn-sm ${filtro === t.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFiltro(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span className="count-tag" style={{ marginLeft: 'auto' }}>
          {denuncias.length} denúncia(s)
        </span>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty">
            <div className="empty-icon">⏳</div>
            <h3>A carregar denúncias...</h3>
          </div>
        ) : denuncias.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🚩</div>
            <h3>Nenhuma denúncia encontrada</h3>
            <p>Sem denúncias com o filtro seleccionado</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Vídeo</th>
                <th>Denunciante</th>
                <th>Motivo</th>
                <th>Descrição</th>
                <th>Estado</th>
                <th>Data</th>
                <th>Acção</th>
              </tr>
            </thead>
            <tbody>
              {denuncias.map(d => (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                      {d.video?.titulo ?? '(removido)'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      {d.video?.estado && (
                        <span className={`badge badge-${d.video.estado}`} style={{ fontSize: 10 }}>
                          {d.video.estado}
                        </span>
                      )}
                      {d.video?.id && d.video?.estado !== 'removido' && (
                        <button className="btn btn-sm btn-ghost" style={{ padding: '2px 7px', fontSize: 10 }}
                          onClick={() => setPreview(d.video)}>
                          ▶
                        </button>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{d.denunciante?.nome ?? '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{d.denunciante?.email}</div>
                  </td>
                  <td>
                    <span style={{
                      background: 'rgba(245,158,11,.1)',
                      border: '1px solid rgba(245,158,11,.2)',
                      color: 'var(--warn)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      fontSize: 12,
                    }}>
                      {d.motivo}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12, maxWidth: 180 }}>
                    {d.descricao?.slice(0, 80) ?? '—'}
                    {d.descricao?.length > 80 && '…'}
                  </td>
                  <td><span className={`badge badge-${d.estado}`}>{d.estado}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {fmt(d.criadoEm)}
                  </td>
                  <td>
                    {d.estado === 'pendente' ? (
                      <button className="btn btn-sm btn-primary" onClick={() => setModal(d)}>
                        → Resolver
                      </button>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: 11 }}>
                        {fmt(d.resolvidoEm)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <ResolverModal
          denuncia={modal}
          onClose={() => setModal(null)}
          onResolvida={onResolvida}
          toast={toast}
        />
      )}

      {preview && <VideoModal video={preview} onClose={() => setPreview(null)} />}
    </>
  );
}
