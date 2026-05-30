import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const injector = inject(Injector);

  const credentialReq = req.clone({
    withCredentials: true
  });

  return next(credentialReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If unauthorized and not attempting to login or refresh
      if (
        error.status === 401 &&
        !req.url.includes('/api/auth/login') &&
        !req.url.includes('/api/auth/refresh')
      ) {
        const authService = injector.get(AuthService);
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Re-run the request with the refreshed JWT cookie
            return next(credentialReq);
          }),
          catchError((refreshError) => {
            // Refresh failed: session is expired, redirect to login
            authService.logout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
