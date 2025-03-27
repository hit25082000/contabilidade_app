import { Routes } from '@angular/router';
import { ContadorLayoutComponent } from './contador-layout.component';
import { authGuard, contadorGuard } from '../../core/auth/guards/auth.guard';
import { GerenciarClientesComponent } from './clientes/gerenciar-clientes.component';

/**
 * Rotas para a área do contador
 * Define a estrutura de navegação e os componentes a serem carregados
 */
export const CONTADOR_ROUTES: Routes = [
  {
    path: '',
    component: ContadorLayoutComponent,
    canActivate: [authGuard, contadorGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('../../features/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'clientes',
        children: [
          {
            path: '',
            component: GerenciarClientesComponent
          },
          {
            path: ':id',
            loadComponent: () => import('./clientes/detalhes-cliente.component').then(m => m.DetalhesClienteComponent)
          },
          {
            path: ':id/documentos',
            loadComponent: () => import('./clientes/documentos-cliente.component').then(m => m.DocumentosClienteComponent)
          }
        ]
      },
      // Rota para acesso às credenciais governamentais dos clientes
      {
        path: 'credenciais',
        loadComponent: () => import('../../features/accountant/gov-credentials-view/gov-credentials-view.component').then(m => m.GovCredentialsViewComponent)
      }
      // Outras rotas específicas do contador serão adicionadas aqui
      // {
      //   path: 'documentos',
      //   loadChildren: () => import('./documentos/documentos.routes').then(m => m.DOCUMENTOS_ROUTES)
      // },
      // {
      //   path: 'agenda',
      //   loadComponent: () => import('./agenda/agenda.component').then(m => m.AgendaComponent)
      // },
      // {
      //   path: 'relatorios',
      //   loadComponent: () => import('./relatorios/relatorios.component').then(m => m.RelatoriosComponent)
      // }
    ]
  }
]; 