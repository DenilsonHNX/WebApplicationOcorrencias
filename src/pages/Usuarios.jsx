import { useState, useEffect } from 'react';
import { api } from '../api.js';

function CriarUtilizadorModal({ onClose, onCriado, toast }) {
  const [form, setForm]     = useState({ nome: '', email: '', password: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [erro, setErro]     = useState('');

  function set(field, val) { setForm(f => ({ ...f, [field]: val })); setErro(''); }

  async function submit(e) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.password)
      return setErro('Preencha todos os campos.');
    if (form.password.length < 6)
      return setErro('A password deve ter pelo menos 6 caracteres.');
    setSaving(true);
    try {
      const res = await api.criarUtilizador(form);
      toast('Utilizador criado com sucesso.');
      onCriado(res.user);
      onClose();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">👤 Adicionar Utilizador</div>

        <form onSubmit={submit}>
          <div className="field">
            <label>Nome completo</label>
            <input type="text" placeholder="Ex: João Silva" value={form.nome}
              onChange={e => set('nome', e.target.value)} autoFocus />
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="email@exemplo.com" value={form.email}
              onChange={e => set('email', e.target.value)} />
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Mínimo 6 caracteres" value={form.password}
              onChange={e => set('password', e.target.value)} />
          </div>

          <div className="field">
            <label>Perfil</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="user">Utilizador</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {erro && <div className="error-msg">⚠️ {erro}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ A criar...' : '✓ Criar Utilizador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-PT');
}

function avatarColor(name) {
  const colors = ['#5b7cf6','#a855f7','#ec4899','#22c55e','#f59e0b','#38bdf8','#ef4444'];
  let h = 0;
  for (let i = 0; i < (name?.length || 0); i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return colors[h % colors.length];
}

export default function Usuarios({ toast }) {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [filtroEstado, setFiltro] = useState('todos');
  const [saving, setSaving]     = useState(null);
  const [modalCriar, setModalCriar] = useState(false);

  function load(q) {
    setLoading(true);
    api.utilizadores(q)
      .then(setUsers)
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(''); }, []);

  function pesquisar(e) {
    e.preventDefault();
    load(pesquisa);
  }

  async function setEstado(id, estado) {
    setSaving(id);
    try {
      await api.setEstadoUtilizador(id, estado);
      toast(`Utilizador marcado como "${estado}".`);
      setUsers(us => us.map(u => u.id === id ? { ...u, estado } : u));
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSaving(null);
    }
  }

  const filtered = filtroEstado === 'todos'
    ? users
    : users.filter(u => u.estado === filtroEstado);

  const counts = {
    todos:    users.length,
    ativo:    users.filter(u => u.estado === 'ativo').length,
    suspenso: users.filter(u => u.estado === 'suspenso').length,
    bloqueado:users.filter(u => u.estado === 'bloqueado').length,
  };

  return (
    <>
      <div className="toolbar">
        <form onSubmit={pesquisar} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Pesquisar por nome ou email..."
            value={pesquisa}
            onChange={e => setPesquisa(e.target.value)}
            style={{ width: 260 }}
          />
          <button className="btn btn-ghost" type="submit">Pesquisar</button>
          {pesquisa && (
            <button className="btn btn-ghost" type="button" onClick={() => { setPesquisa(''); load(''); }}>
              Limpar
            </button>
          )}
        </form>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { key: 'todos', label: 'Todos' },
            { key: 'ativo', label: 'Activos' },
            { key: 'suspenso', label: 'Suspensos' },
            { key: 'bloqueado', label: 'Bloqueados' },
          ].map(opt => (
            <button
              key={opt.key}
              className={`btn btn-sm ${filtroEstado === opt.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFiltro(opt.key)}
            >
              {opt.label}
              <span style={{
                background: 'rgba(255,255,255,.15)',
                borderRadius: 10,
                padding: '0 5px',
                fontSize: 10,
              }}>{counts[opt.key]}</span>
            </button>
          ))}
        </div>

        <span className="count-tag">{filtered.length} utilizador(es)</span>

        <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setModalCriar(true)}>
          + Adicionar Utilizador
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="empty">
            <div className="empty-icon">⏳</div>
            <h3>A carregar utilizadores...</h3>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">👥</div>
            <h3>Nenhum utilizador encontrado</h3>
            <p>Ajuste os filtros ou pesquisa</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Perfil</th>
                <th>Estado</th>
                <th>Infrações</th>
                <th>Registado em</th>
                <th>Acções</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="user-row">
                      <div
                        className="avatar"
                        style={{ background: avatarColor(u.nome) }}
                      >
                        {u.nome?.slice(0, 2) ?? '??'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{u.nome}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                  <td><span className={`badge badge-${u.estado}`}>{u.estado}</span></td>
                  <td>
                    <span style={{
                      color: u.infracoes > 0 ? 'var(--warn)' : 'var(--muted)',
                      fontWeight: u.infracoes > 0 ? 700 : 400,
                    }}>
                      {u.infracoes > 0 ? `⚠️ ${u.infracoes}` : '0'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{fmt(u.criadoEm)}</td>
                  <td>
                    {u.role !== 'admin' ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {u.estado !== 'ativo' && (
                          <button className="btn btn-sm btn-success" disabled={saving === u.id} onClick={() => setEstado(u.id, 'ativo')}>
                            ✓ Reativar
                          </button>
                        )}
                        {u.estado !== 'suspenso' && (
                          <button className="btn btn-sm btn-warn" disabled={saving === u.id} onClick={() => setEstado(u.id, 'suspenso')}>
                            ⏸ Suspender
                          </button>
                        )}
                        {u.estado !== 'bloqueado' && (
                          <button className="btn btn-sm btn-danger" disabled={saving === u.id} onClick={() => setEstado(u.id, 'bloqueado')}>
                            🚫 Bloquear
                          </button>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: 12 }}>Protegido</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalCriar && (
        <CriarUtilizadorModal
          onClose={() => setModalCriar(false)}
          onCriado={u => setUsers(prev => [{ ...u, estado: 'ativo', infracoes: 0, criadoEm: new Date().toISOString() }, ...prev])}
          toast={toast}
        />
      )}
    </>
  );
}
