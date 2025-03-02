import { Routes } from '@angular/router';
import { ContadorLayoutComponent } from './contador-layout.component';
import { authGuard, contadorGuard } from '../../core/auth/guards/auth.guard';

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
      }
      // Outras rotas específicas do contador serão adicionadas aqui
      // {
      //   path: 'clientes',
      //   loadChildren: () => import('./clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
      // },
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