import { Routes } from '@angular/router';
import { ClienteLayoutComponent } from './cliente-layout.component';
import { authGuard, clienteGuard } from '../../core/auth/guards/auth.guard';
import { DocumentosPage } from './documentos/documentos.page';
import { PLANTAO_ROUTES } from '../../features/components/plantao/plantao.routes';

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
      {
        path: 'dashboard',
        loadComponent: () => import('../../features/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'plantoes',
        children: PLANTAO_ROUTES
      },
      // Rotas para credenciais governamentais
      {
        path: 'credenciais',
        children: [
          {
            path: '',
            loadComponent: () => import('../../features/client/gov-credentials-list/gov-credentials-list.component').then(m => m.GovCredentialsListComponent)
          },
          {
            path: 'nova',
            loadComponent: () => import('../../features/client/gov-credentials-form/gov-credentials-form.component').then(m => m.GovCredentialsFormComponent)
          },
          {
            path: 'editar/:id',
            loadComponent: () => import('../../features/client/gov-credentials-form/gov-credentials-form.component').then(m => m.GovCredentialsFormComponent)
          }
        ]
      },
      // Outras rotas específicas do cliente serão adicionadas aqui
    ]
  }
]; 