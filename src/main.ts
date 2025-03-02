import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

/**
 * Inicializa a aplicação no modo standalone
 * Não utiliza NgModules, apenas componentes standalone e providers
 */
bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('Erro ao inicializar a aplicação:', err));
