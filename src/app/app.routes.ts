// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './core/guards/auth.guard';

/**
 * Configuração de rotas principais da aplicação
 * Define a estrutura de navegação e os guards de acesso
 */
export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        canActivate: [publicOnlyGuard],
        children: [
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            },
            {
                path: 'login',
                loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
            },
            // {
            //     path: 'registro',
            //     loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
            // },
            // {
            //     path: 'recuperar-senha',
            //     loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
            // },
            // {
            //     path: 'nova-senha',
            //     loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
            // }
        ]
    },
    {
        path: 'contador',
        loadChildren: () => import('./pages/contador/contador.routes').then(m => m.CONTADOR_ROUTES)
    },
    {
        path: 'cliente',
        loadChildren: () => import('./pages/cliente/cliente.routes').then(m => m.CLIENTE_ROUTES)
    },
    // {
    //     path: 'acesso-negado',
    //     loadComponent: () => import('./features/errors/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
    // },
    // {
    //     path: '**',
    //     loadComponent: () => import('./features/errors/not-found/not-found.component').then(m => m.NotFoundComponent)
    // }
];