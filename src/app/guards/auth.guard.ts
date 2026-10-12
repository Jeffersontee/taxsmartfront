import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Strings } from '../enum/strings';
import { SystemModule } from '../models/user.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate([`/${Strings.ROUTE_LOGIN}`], {
    queryParams: { returnUrl: state.url },
  });
  return false;
};

/**
 * Permite acesso a qualquer membro da equipe do escritório contábil (Super Admin, Contador, Fiscal, DP).
 */
export const staffGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isStaff()) {
    return true;
  }

  router.navigate(['/client/dashboard']);
  return false;
};

// Alias retroativo
export const accountantGuard: CanActivateFn = staffGuard;

/**
 * Permite acesso estrito a Super Administradores.
 */
export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isSuperAdmin()) {
    return true;
  }

  router.navigate(['/admin/dashboard']);
  return false;
};

/**
 * Permite acesso a usuários clientes da plataforma.
 */
export const clientGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isClient()) {
    return true;
  }

  router.navigate(['/admin/dashboard']);
  return false;
};

/**
 * Guard gerador para validação de módulos específicos.
 */
export const moduleGuard = (module: SystemModule): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated() && authService.canAccess(module)) {
      return true;
    }

    // Redireciona para o dashboard caso não tenha permissão no módulo
    const fallbackUrl = authService.isStaff() ? '/admin/dashboard' : '/client/dashboard';
    router.navigate([fallbackUrl]);
    return false;
  };
};
