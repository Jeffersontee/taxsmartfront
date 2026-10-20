import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { User, UserRole, UserType, SystemModule, STAFF_ROLES, COMPANY_ROLES, AuthResponseData, ApiResponse } from '../../models/user.model';

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

  // Computeds reativos de autenticação e papéis
  isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  isSuperAdmin = computed(() => this.currentUser()?.role === UserRole.SUPER_ADMIN);
  isAccountant = computed(
    () =>
      this.currentUser()?.role === UserRole.SUPER_ADMIN ||
      this.currentUser()?.role === UserRole.ACCOUNTANT
  );
  isFiscalAnalyst = computed(() => this.currentUser()?.role === UserRole.FISCAL_ANALYST);
  isPayrollAnalyst = computed(() => this.currentUser()?.role === UserRole.PAYROLL_ANALYST);
  isStaff = computed(() => {
    const role = this.currentUser()?.role;
    return !!role && STAFF_ROLES.includes(role);
  });
  isCompany = computed(() => {
    const role = this.currentUser()?.role;
    return !!role && COMPANY_ROLES.includes(role);
  });
  isCompanyAdmin = computed(
    () =>
      this.currentUser()?.role === UserRole.COMPANY_ADMIN ||
      this.currentUser()?.role === UserRole.OWNER ||
      this.currentUser()?.role === UserRole.PARTNER
  );
  canManageCompanyUsers = computed(
    () =>
      this.currentUser()?.role === UserRole.COMPANY_ADMIN ||
      this.currentUser()?.role === UserRole.OWNER
  );
  isPartner = computed(
    () =>
      this.currentUser()?.role === UserRole.PARTNER ||
      this.currentUser()?.type === UserType.PARTNER
  );
  isCompanyFinancial = computed(
    () => this.currentUser()?.role === UserRole.COMPANY_FINANCIAL
  );
  isCompanyEmployee = computed(
    () => this.currentUser()?.role === UserRole.COMPANY_EMPLOYEE
  );

  // Computeds reativos de liberação de módulos
  canAccessFiscal = computed(() => {
    if (this.isSuperAdmin() || this.currentUser()?.role === UserRole.ACCOUNTANT || this.currentUser()?.role === UserRole.FISCAL_ANALYST) return true;
    return this.hasAllowedModule(SystemModule.FISCAL);
  });

  canAccessPayroll = computed(() => {
    if (this.isSuperAdmin() || this.currentUser()?.role === UserRole.ACCOUNTANT || this.currentUser()?.role === UserRole.PAYROLL_ANALYST) return true;
    return this.hasAllowedModule(SystemModule.PAYROLL);
  });

  canAccessAccounting = computed(() => {
    if (this.isSuperAdmin() || this.currentUser()?.role === UserRole.ACCOUNTANT || this.currentUser()?.role === UserRole.FISCAL_ANALYST) return true;
    return this.hasAllowedModule(SystemModule.ACCOUNTING);
  });

  canAccessCompanies = computed(() => {
    if (this.isStaff()) return true;
    return this.hasAllowedModule(SystemModule.COMPANIES);
  });

  canAccessTimeline = computed(() => {
    return this.isAuthenticated();
  });

  canManageSettings = computed(() => this.isSuperAdmin());

  /**
   * Verifica se o usuário tem permissão para acessar um determinado módulo
   */
  canAccess(module: SystemModule): boolean {
    if (this.isSuperAdmin()) return true;
    switch (module) {
      case SystemModule.FISCAL:
        return this.canAccessFiscal();
      case SystemModule.PAYROLL:
        return this.canAccessPayroll();
      case SystemModule.ACCOUNTING:
        return this.canAccessAccounting();
      case SystemModule.COMPANIES:
        return this.canAccessCompanies();
      case SystemModule.TIMELINE_TASKS:
        return this.canAccessTimeline();
      case SystemModule.SYSTEM_SETTINGS:
        return this.canManageSettings();
      default:
        return this.hasAllowedModule(module);
    }
  }

  private hasAllowedModule(module: SystemModule): boolean {
    const modules = this.currentUser()?.allowedModules;
    return Array.isArray(modules) && modules.includes(module);
  }

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
    if (this.isStaff()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/company/dashboard']);
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
