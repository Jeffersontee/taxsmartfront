import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { User, ApiResponse, UserRole } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class StaffService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  staffMembers = signal<User[]>([]);
  isLoading = signal<boolean>(false);

  /**
   * Busca lista de membros da equipe do escritório
   */
  loadStaffMembers(search?: string, role?: string): Observable<ApiResponse<User[]>> {
    this.isLoading.set(true);
    let params = new HttpParams();

    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);

    const url = `${this.baseUrl}${Strings.API_STAFF}`;

    return this.http.get<ApiResponse<User[]>>(url, { params }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.staffMembers.set(response.data);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Cadastra novo membro da equipe
   */
  createStaffMember(staffData: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    phone?: string;
  }): Observable<ApiResponse<User>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_STAFF}`;

    return this.http.post<ApiResponse<User>>(url, staffData).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.staffMembers.update((list) => [response.data!, ...list]);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Atualiza dados ou perfil do membro
   */
  updateStaffMember(id: string, updateData: Partial<User>): Observable<ApiResponse<User>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_STAFF}/${id}`;

    return this.http.put<ApiResponse<User>>(url, updateData).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.staffMembers.update((list) =>
            list.map((m) => (m._id === id ? response.data! : m))
          );
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Altera status (Ativo / Inativo)
   */
  toggleStaffStatus(id: string): Observable<ApiResponse<User>> {
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_STAFF}/${id}/toggle-status`;

    return this.http.patch<ApiResponse<User>>(url, {}).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.staffMembers.update((list) =>
            list.map((m) => (m._id === id ? { ...m, active: response.data!.active } : m))
          );
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }
}

