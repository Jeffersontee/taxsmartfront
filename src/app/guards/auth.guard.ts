import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { Strings } from '../enum/strings';
import { UserRole } from '../models/user.model';

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

export const accountantGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAccountant()) {
    return true;
  }

  router.navigate(['/cliente/dashboard']);
  return false;
};
