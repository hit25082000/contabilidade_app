import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { pt_BR, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import pt from '@angular/common/locales/pt';
import { provideNzIcons } from './icons-provider';

// Registra os dados de localização para português do Brasil
registerLocaleData(pt);

export const appConfig: ApplicationConfig = {
  providers: [
    // Configuração de Roteamento
    provideRouter(routes),
    
    // Configuração de Zona e Hidratação
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideClientHydration(
      withIncrementalHydration()
    ),
    
    // Configuração de Service Worker
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    
    // Configuração de HTTP
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    
    // Configuração de Animações
    provideAnimations(),
    
    // Configuração do NG-ZORRO
    provideNzI18n(pt_BR),
    provideNzIcons(), 
  ]
};
