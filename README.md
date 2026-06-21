# OcorrênciasApp — Painel de Administração (React)

Interface web para administradores gerirem utilizadores, vídeos, denúncias e categorias.

---

## Requisitos

- [Node.js](https://nodejs.org/) 18.x ou superior
- Servidor Backend activo

---

## Instalação

```bash
git clone https://github.com/DenilsonHNX/AdminOcorrencias.git
cd AdminOcorrencias
npm install
```

---

## Configuração

O painel usa proxy configurado em [vite.config.js](vite.config.js). Por omissão aponta para `http://localhost:3000`.

Para alterar o endereço do servidor:

```js
// vite.config.js
proxy: {
  '/api': {
    target: 'http://192.168.X.X:3000',
    changeOrigin: true,
  }
}
```

---

## Executar

```bash
# Desenvolvimento
npm run dev
# Disponível em http://localhost:5173

# Build de produção
npm run build
# Ficheiros estáticos em dist/
```

---

## Acesso

- **Email:** `admin@ocorrencias.ao`
- **Password:** `Admin@2026`

---

## Estrutura

```
src/
├── pages/
│   ├── Login.jsx       # Autenticação
│   ├── Dashboard.jsx   # Estatísticas gerais
│   ├── Usuarios.jsx    # Gestão de utilizadores
│   ├── Videos.jsx      # Gestão de vídeos
│   ├── Denuncias.jsx   # Gestão de denúncias
│   ├── Categorias.jsx  # Gestão de categorias
│   └── Auditoria.jsx   # Histórico de acções
├── components/
│   └── VideoModal.jsx  # Player inline
├── api.js              # Chamadas à API
└── App.jsx             # Roteamento
```

---

## Funcionalidades

| Secção | O que permite fazer |
|---|---|
| Dashboard | Totais de utilizadores, vídeos, denúncias pendentes, categorias |
| Utilizadores | Listar, pesquisar, filtrar, criar, suspender, bloquear, reactivar |
| Vídeos | Listar, pesquisar, ver inline, ocultar, remover, reactivar |
| Denúncias | Resolver com opção de remover vídeo e/ou suspender autor |
| Categorias | Criar com nome e ícone emoji |
| Auditoria | Histórico completo com timestamp de todas as acções admin |
