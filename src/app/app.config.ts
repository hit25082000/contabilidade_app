import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AUTH_PROVIDER, authProviderFactory } from './core/providers/auth-provider.factory';
import { SupabaseAuthProvider } from './core/providers/supabase-auth.provider';
import { FirebaseAuthProvider } from './core/providers/firebase-auth.provider';
import { authInterceptor } from './core/interceptors/auth.interceptor';

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
    
    // Provedores de Autenticação
    {
      provide: AUTH_PROVIDER,
      useFactory: authProviderFactory
    },
    
    // Registra os provedores concretos
    { provide: SupabaseAuthProvider, useClass: SupabaseAuthProvider },
    { provide: FirebaseAuthProvider, useClass: FirebaseAuthProvider }
  ]
};
