import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { User, UserRole, AuthResponseData, ApiResponse } from '../../models/user.model';

const TOKEN_KEY = 'taxsmart_auth_token';
const USER_KEY = 'taxsmart_auth_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  // Signals de Estado de Autenticação
  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());
  isLoading = signal<boolean>(false);

  // Computeds reativos
  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  isSuperAdmin = computed(() => this.currentUser()?.role === UserRole.SUPER_ADMIN);
  isAccountant = computed(
    () =>
      this.currentUser()?.role === UserRole.SUPER_ADMIN ||
      this.currentUser()?.role === UserRole.ACCOUNTANT
  );
  isClient = computed(() => this.currentUser()?.role === UserRole.CLIENT);

  /**
   * Realiza login no backend e persiste a sessão
   */
  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthResponseData>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_AUTH_LOGIN}`;

    return this.http.post<ApiResponse<AuthResponseData>>(url, credentials).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.setSession(response.data.token, response.data.user);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra um novo usuário
   */
  register(payload: Partial<User> & { password: string }): Observable<ApiResponse<AuthResponseData>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_AUTH_REGISTER}`;

    return this.http.post<ApiResponse<AuthResponseData>>(url, payload).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.setSession(response.data.token, response.data.user);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtém os dados do usuário logado via token
   */
  fetchCurrentUser(): Observable<ApiResponse<User>> {
    const url = `${this.baseUrl}${Strings.API_AUTH_ME}`;
    return this.http.get<ApiResponse<User>>(url).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.currentUser.set(response.data);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data));
        }
      })
    );
  }

  /**
   * Salva dados na sessão local e nos Signals
   */
  private setSession(token: string, user: User): void {
    this.token.set(token);
    this.currentUser.set(user);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Encerra a sessão e redireciona para o login
   */
  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate([`/${Strings.ROUTE_LOGIN}`]);
  }

  /**
   * Redireciona o usuário para o dashboard apropriado conforme seu perfil
   */
  redirectAfterLogin(): void {
    if (this.isAccountant()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/cliente/dashboard']);
    }
  }

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private getStoredUser(): User | null {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
