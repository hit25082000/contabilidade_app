import { Routes } from '@angular/router';
import { ClienteLayoutComponent } from './cliente-layout.component';
import { authGuard, clienteGuard } from '../../core/auth/guards/auth.guard';
import { DocumentosPage } from './documentos/documentos.page';

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
        path: 'documentos',
        component: DocumentosPage
      },
      // Outras rotas específicas do cliente serão adicionadas aqui
      {
        path: 'dashboard',
        loadComponent: () => import('../../features/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
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