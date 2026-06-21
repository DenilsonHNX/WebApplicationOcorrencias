import { useState, useEffect } from 'react';
import { api } from '../api.js';

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('pt-PT', { dateStyle: 'short', timeStyle: 'medium' });
}

const ACAO_COR = {
  UTILIZADOR_SUSPENSO:  'var(--warn)',
  UTILIZADOR_BLOQUEADO: 'var(--danger)',
  UTILIZADOR_ATIVO:     'var(--success)',
  VIDEO_REMOVIDO:       'var(--danger)',
  VIDEO_OCULTO:         'var(--muted)',
  VIDEO_ATIVO:          'var(--success)',
  DENUNCIA_APROVADA:    'var(--danger)',
  DENUNCIA_REJEITADA:   'var(--muted)',
  COMENTARIO_REMOVIDO:  'var(--warn)',
};

export default function Auditoria({ toast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    api.auditoria()
      .then(setLogs)
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  const filtrados = filtro
    ? logs.filter(l => l.acao.includes(filtro.toUpperCase()) || l.detalhe?.toLowerCase().includes(filtro.toLowerCase()))
    : logs;

  return (
    <>
      <div className="toolbar">
        <input
          type="text"
          placeholder="Filtrar por acção ou detalhe..."
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
          style={{ width: 280 }}
        />
        <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 12 }}>
          {filtrados.length} registo(s)
        </span>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty"><span>⏳</span>A carregar...</div>
        ) : filtrados.length === 0 ? (
          <div className="empty"><span>📋</span>Sem registos de auditoria.</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Acção</th>
                <th>Entidade</th>
                <th>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(l => (
                <tr key={l.id}>
                  <td style={{ color: 'var(--muted)', fontSize: 12, whiteSpace: 'nowrap' }}>{fmt(l.timestamp)}</td>
                  <td>
                    <span style={{ color: ACAO_COR[l.acao] ?? 'var(--primary)', fontSize: 12, fontWeight: 600 }}>
                      {l.acao}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{l.entidade}</td>
                  <td style={{ fontSize: 12, color: 'var(--text)' }}>{l.detalhe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
