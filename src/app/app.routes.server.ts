// app.routes.server.ts
import { RenderMode, ServerRoute } from '@angular/ssr';
export const serverRoutes: ServerRoute[] = [
  {
    path: '', // This renders the "/" route on the client (CSR)
    renderMode: RenderMode.Server,
  },
  {
    path: 'user-list', // This renders the "/" route on the client (CSR)
    renderMode: RenderMode.Server,
  },
//   {
//     path: 'user-list',
//     renderMode: RenderMode.Server,

//   },
// {
//     path: 'user-details',
//     renderMode: RenderMode.Server,
//   },
  // {
  //   path: 'about', // This page is static, so we prerender it (SSG)
  //   renderMode: RenderMode.Prerender,
  // },
  // {
  //   path: 'profile', // This page requires user-specific data, so we use SSR
  //   renderMode: RenderMode.Server,
  // },
  // {
  //   path: '**', // All other routes will be rendered on the server (SSR)
  //   renderMode: RenderMode.Server,
  // },
];