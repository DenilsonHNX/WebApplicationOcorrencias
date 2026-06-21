import { useState, useEffect } from 'react';
import { api } from '../api.js';

export default function Categorias({ toast }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('📌');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.categorias()
      .then(setCats)
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  async function criar(e) {
    e.preventDefault();
    if (!nome.trim()) return;
    setSaving(true);
    try {
      const nova = await api.criarCategoria(nome.trim(), icone);
      setCats(c => [...c, nova]);
      setNome('');
      setIcone('📌');
      toast('Categoria criada.');
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        <div className="table-wrap">
          {loading ? (
            <div className="empty"><span>⏳</span>A carregar...</div>
          ) : cats.length === 0 ? (
            <div className="empty"><span>🏷️</span>Sem categorias.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ícone</th>
                  <th>Nome</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {cats.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontSize: 22 }}>{c.icone}</td>
                    <td style={{ fontWeight: 500 }}>{c.nome}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 11 }}>{c.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <form onSubmit={criar} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, marginBottom: 16 }}>Nova Categoria</h3>
          <div className="field">
            <label>Nome</label>
            <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Infraestruturas" required />
          </div>
          <div className="field">
            <label>Ícone (emoji)</label>
            <input type="text" value={icone} onChange={e => setIcone(e.target.value)} placeholder="📌" style={{ width: 80 }} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
            {saving ? 'A criar...' : 'Criar Categoria'}
          </button>
        </form>
      </div>
    </>
  );
}
