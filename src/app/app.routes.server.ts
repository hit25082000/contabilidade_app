// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Configuração de rotas para renderização no servidor
 * Define quais rotas serão renderizadas no servidor (SSR) e quais serão pré-renderizadas (SSG)
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '', // Rota raiz
    renderMode: RenderMode.Server,
  },
  {
    path: 'auth', // Área de autenticação
    renderMode: RenderMode.Server,
  },
  {
    path: 'auth/login', // Página de login
    renderMode: RenderMode.Server,
  },
  {
    path: 'contador', // Layout principal do contador
    renderMode: RenderMode.Server,
  },
  {
    path: 'contador/dashboard', // Dashboard do contador
    renderMode: RenderMode.Server,
  },
  {
    path: 'contador/clientes', // Lista de clientes do contador
    renderMode: RenderMode.Server,
  },
  {
    path: 'contador/clientes/:id', // Detalhes do cliente
    renderMode: RenderMode.Server,
  },
  {
    path: 'contador/clientes/:id/documentos', // Documentos do cliente
    renderMode: RenderMode.Server,
  },
  // {
  //   path: 'contador/documentos', // Documentos do contador
  //   renderMode: RenderMode.Server,
  // },
  // {
  //   path: 'contador/agenda', // Agenda do contador
  //   renderMode: RenderMode.Server,
  // },
  // {
  //   path: 'contador/relatorios', // Relatórios do contador
  //   renderMode: RenderMode.Server,
  // },
  {
    path: 'cliente', // Layout principal do cliente
    renderMode: RenderMode.Server,
  },
  {
    path: 'cliente/dashboard', // Dashboard do cliente
    renderMode: RenderMode.Server,
  },
  {
    path: 'cliente/documentos', // Documentos do cliente
    renderMode: RenderMode.Server,
  },
  // {
  //   path: 'cliente/plantao', // Registro de plantão do cliente
  //   renderMode: RenderMode.Server,
  // },
  // {
  //   path: 'cliente/agenda', // Agenda do cliente
  //   renderMode: RenderMode.Server,
  // },
  {
    path: '**', // Todas as outras rotas
    renderMode: RenderMode.Server,
  }
];