// app.routes.server.ts
import { Routes } from '@angular/router';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { UserListComponent } from './features/components/user-list/user-list.component';
import { UserDetailsComponent } from './features/components/user-details/user-details.component';
import { SystemStatusComponent } from './core/components/system-status/system-status.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'user-list'
      },
    {
        path: 'user-list',
        component: SystemStatusComponent,
      },
    {
        path: 'user-details',
        component: UserDetailsComponent,
      },
];

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
    status: 201,
  },
  {
    path: 'user-list', // This page is static, so we prerender it (SSG)
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'profile', // This page requires user-specific data, so we use SSR
    renderMode: RenderMode.Server,
  },
  {
    path: '**', // All other routes will be rendered on the server (SSR)
    renderMode: RenderMode.Server,
  },
];