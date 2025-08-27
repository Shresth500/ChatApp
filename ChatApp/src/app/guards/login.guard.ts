import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Service/auth.service';

export const loginGuard: CanActivateFn = (route, state) => {
  if (!inject(AuthService).isLoggedIn()) {
    let router = inject(Router);
    router.navigate(['/', 'login']);
    return false;
  }
  return true;
};
