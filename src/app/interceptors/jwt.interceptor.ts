import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ToastController } from '@ionic/angular/standalone';
import { AuthService } from '../services/auth/auth.service';
import { Strings } from '../enum/strings';

/**
 * Sanitiza a URL da requisição removendo barras duplicadas acidentais (ex: api//endpoint -> api/endpoint)
 */
function sanitizeRequestUrl(url: string): string {
  if (url.includes('://')) {
    const parts = url.split('://');
    parts[1] = parts[1].replace(/\/+/g, '/');
    return parts.join('://');
  }
  return url.replace(/\/+/g, '/');
}

/**
 * Adiciona o cabeçalho Authorization com o Bearer token se presente
 */
function attachAuthHeader(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  const sanitizedUrl = sanitizeRequestUrl(req.url);

  if (token) {
    return req.clone({
      url: sanitizedUrl,
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return req.clone({ url: sanitizedUrl });
}

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastCtrl = inject(ToastController);

  const currentToken = authService.token();
  const authReq = attachAuthHeader(req, currentToken);

  return next(authReq).pipe(
    // Mecanismo de Retry inteligente para instabilidades de rede (ignora erros 4xx de cliente e autenticação)
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (error.status === 401 || error.status === 403 || (error.status >= 400 && error.status < 500)) {
          throw error;
        }
        return timer(retryCount * 1000); // 1s na 1ª tentativa, 2s na 2ª
      },
    }),
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        // Erro 0: Servidor offline ou bloqueio de CORS
        if (error.status === 0) {
          toastCtrl
            .create({
              message: 'Falha de comunicação com o servidor. Verifique sua conexão com a internet.',
              duration: 3500,
              color: 'danger',
              position: 'top',
            })
            .then((toast) => toast.present());
        }

        // Erro 401: Sessão expirada ou token inválido
        if (error.status === 401 && !req.url.includes(Strings.API_AUTH_LOGIN)) {
          authService.logout();
          router.navigate([`/${Strings.ROUTE_LOGIN}`], {
            queryParams: { expired: 'true' },
          });
        }
      }

      return throwError(() => error);
    })
  );
};
