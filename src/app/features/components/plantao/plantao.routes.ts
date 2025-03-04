import { Routes } from '@angular/router';
import { ListaPlantaoComponent } from './lista-plantao/lista-plantao.component';
import { RegistroPlantaoComponent } from './registro-plantao/registro-plantao.component';
import { DetalhePlantaoComponent } from './detalhe-plantao/detalhe-plantao.component';
import { CalendarioPlantaoComponent } from './calendario-plantao/calendario-plantao.component';

/**
 * Rotas para o módulo de plantões
 */
export const PLANTAO_ROUTES: Routes = [
  {
    path: '',
    component: ListaPlantaoComponent,
    title: 'Meus Plantões'
  },
  {
    path: 'registrar',
    component: RegistroPlantaoComponent,
    title: 'Registrar Plantão'
  },
  {
    path: 'detalhes/:id',
    component: DetalhePlantaoComponent,
    title: 'Detalhes do Plantão'
  },
  {
    path: 'calendario',
    component: CalendarioPlantaoComponent,
    title: 'Calendário de Plantões'
  }
]; 