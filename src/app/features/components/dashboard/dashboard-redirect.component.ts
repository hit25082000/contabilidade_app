import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../core/auth/service/auth.store';

/**
 * Componente para redirecionar o usuário para a dashboard correta com base na sua role
 * Usado como fallback para a rota /dashboard
 */
@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: `<div>Redirecionando...</div>`,
})
export class DashboardRedirectComponent implements OnInit {
  private router = inject(Router);
  private authStore = inject(AuthStore);

  ngOnInit(): void {
    // Verifica a role do usuário e redireciona para a página apropriada
    if (this.authStore.isContador()) {
      this.router.navigateByUrl('/contador/dashboard');
    } else if (this.authStore.isCliente()) {
      this.router.navigateByUrl('/cliente/dashboard');
    } else {
      // Caso a role não esteja definida, redireciona para a página de login
      this.router.navigateByUrl('/auth/login');
    }
  }
} 