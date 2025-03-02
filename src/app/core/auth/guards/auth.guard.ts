import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthStore } from '../service/auth.store';
import { tap } from 'rxjs';

/**
 * Guard que protege rotas que requerem autenticação
 * @param route - Rota atual
 * @param state - Estado da rota
 */
export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authStore = inject(AuthStore);

    if (authStore.isAuthenticated()) {
        return true;
    }

    // Redireciona para login e armazena a URL tentada
    return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
    });
};

/**
 * Guard que protege rotas específicas para contadores
 * @param route - Rota atual
 * @param state - Estado da rota
 */
export const contadorGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authStore = inject(AuthStore);

    if (authStore.isContador()) {
        return true;
    }

    return router.createUrlTree(['/acesso-negado']);
};

/**
 * Guard que protege rotas específicas para clientes
 * @param route - Rota atual
 * @param state - Estado da rota
 */
export const clienteGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authStore = inject(AuthStore);

    if (authStore.isCliente()) {
        return true;
    }

    return router.createUrlTree(['/acesso-negado']);
};

/**
 * Guard que impede acesso a rotas de autenticação quando já autenticado
 * @param route - Rota atual
 * @param state - Estado da rota
 */
export const publicOnlyGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const authStore = inject(AuthStore);

    if (!authStore.isAuthenticated()) {
        return true;
    }

    return router.createUrlTree(['/dashboard']);
}; 