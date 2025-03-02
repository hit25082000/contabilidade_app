import { Routes } from '@angular/router';
import { ClienteLayoutComponent } from './cliente-layout.component';
import { authGuard, clienteGuard } from '../../core/auth/guards/auth.guard';

/**
 * Rotas para a área do cliente
 * Define a estrutura de navegação e os componentes a serem carregados
 */
export const CLIENTE_ROUTES: Routes = [
  {
    path: '',
    component: ClienteLayoutComponent,
    canActivate: [authGuard, clienteGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('../../features/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      }
      // Outras rotas específicas do cliente serão adicionadas aqui
      // {
      //   path: 'documentos',
      //   loadChildren: () => import('./documentos/documentos.routes').then(m => m.DOCUMENTOS_ROUTES)
      // },
      // {
      //   path: 'plantao',
      //   loadComponent: () => import('./plantao/plantao.component').then(m => m.PlantaoComponent)
      // },
      // {
      //   path: 'agenda',
      //   loadComponent: () => import('./agenda/agenda.component').then(m => m.AgendaComponent)
      // }
    ]
  }
]; 