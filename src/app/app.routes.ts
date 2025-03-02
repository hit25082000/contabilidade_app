// app.routes.server.ts
import { Routes } from '@angular/router';
import { RenderMode, ServerRoute } from '@angular/ssr';
import { UserListComponent } from './features/components/user-list/user-list.component';
import { UserDetailsComponent } from './features/components/user-details/user-details.component';
import { SystemStatusComponent } from './core/components/system-status/system-status.component';
import { authGuard, publicOnlyGuard, contadorGuard, clienteGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'user-list',
        pathMatch: 'full'
    },
    {
        path: 'user-list',
        component: LoginComponent
    },
    // {
    //     path: 'auth',
    //     canActivate: [publicOnlyGuard],
    //     children: [
    //         {
    //             path: '',
    //             redirectTo: 'login',
    //             pathMatch: 'full'
    //         },
    //         {
    //             path: 'login',
    //             loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
    //         },
    //         // {
    //         //     path: 'registro',
    //         //     loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
    //         // },
    //         // {
    //         //     path: 'recuperar-senha',
    //         //     loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
    //         // },
    //         // {
    //         //     path: 'nova-senha',
    //         //     loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
    //         // }
    //     ]
    // },
    // {
    //     path: 'dashboard',
    //     canActivate: [authGuard],
    //     loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
    // },
    // {
    //     path: 'contador',
    //     canActivate: [authGuard, contadorGuard],
    //     loadChildren: () => import('./features/contador/contador.routes').then(m => m.CONTADOR_ROUTES)
    // },
    // {
    //     path: 'cliente',
    //     canActivate: [authGuard, clienteGuard],
    //     loadChildren: () => import('./features/cliente/cliente.routes').then(m => m.CLIENTE_ROUTES)
    // },
    // {
    //     path: 'acesso-negado',
    //     loadComponent: () => import('./features/errors/access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
    // },
    // {
    //     path: '**',
    //     loadComponent: () => import('./features/errors/not-found/not-found.component').then(m => m.NotFoundComponent)
    // }
];