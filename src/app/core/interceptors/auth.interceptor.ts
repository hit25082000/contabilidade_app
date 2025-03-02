import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../store/auth.store';
import { environment } from '../../../environments/environment';

/**
 * Interceptor que adiciona o token de autenticação em todas as requisições HTTP
 * @param req - Requisição HTTP
 * @param next - Handler da requisição
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authStore = inject(AuthStore);
    const session = authStore.session();

    // Lista de URLs que não precisam de autenticação
    const excludedUrls = [
        environment.SUPABASE_URL,
        // Adicione outras URLs que não precisam de autenticação
        // Por exemplo, se mudar para Firebase:
        // environment.FIREBASE_AUTH_URL
    ];

    // Verifica se a URL está na lista de exclusão
    const shouldExclude = excludedUrls.some(url => req.url.includes(url));
    if (shouldExclude) {
        return next(req);
    }

    // Adiciona o token de autenticação no header se disponível
    if (session?.access_token) {
        const authReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${session.access_token}`)
        });
        return next(authReq);
    }

    return next(req);
}; 