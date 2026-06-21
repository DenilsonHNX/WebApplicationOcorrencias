const BASE = '/api';

function token() {
  return localStorage.getItem('admin_token');
}

function headers(extra = {}) {
  return {
    'Content-Type': 'application/json',
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
    ...extra,
  };
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.erro || `Erro ${res.status}`);
  return data;
}

export const api = {
  login: (email, password) => req('POST', '/auth/login', { email, password }),

  dashboard: () => req('GET', '/admin/dashboard'),

  utilizadores: (q) => req('GET', `/admin/utilizadores${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  criarUtilizador: (dados) => req('POST', '/admin/utilizadores', dados),
  setEstadoUtilizador: (id, estado) => req('PATCH', `/admin/utilizadores/${id}/estado`, { estado }),

  videos: (estado, q) => {
    const params = new URLSearchParams();
    if (estado) params.set('estado', estado);
    if (q) params.set('q', q);
    return req('GET', `/admin/videos?${params}`);
  },
  setEstadoVideo: (id, estado) => req('PATCH', `/admin/videos/${id}/estado`, { estado }),

  denuncias: (estado) => req('GET', `/admin/denuncias${estado ? `?estado=${estado}` : ''}`),
  resolverDenuncia: (id, payload) => req('PATCH', `/admin/denuncias/${id}`, payload),

  removerComentario: (id) => req('DELETE', `/admin/comentarios/${id}`),

  categorias: () => req('GET', '/admin/categorias'),
  criarCategoria: (nome, icone) => req('POST', '/admin/categorias', { nome, icone }),

  auditoria: () => req('GET', '/admin/auditoria'),
};
