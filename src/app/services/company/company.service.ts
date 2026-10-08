import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { ICompany } from '../../models/company.model';
import { ApiResponse } from '../../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  // Signals de estado
  companies = signal<ICompany[]>([]);
  selectedCompany = signal<ICompany | null>(null);
  isLoading = signal<boolean>(false);

  /**
   * Busca lista de empresas cadastradas
   */
  loadCompanies(search?: string, taxRegime?: string): Observable<ApiResponse<ICompany[]>> {
    this.isLoading.set(true);
    let params = new HttpParams();

    if (search) params = params.set('search', search);
    if (taxRegime) params = params.set('taxRegime', taxRegime);

    const url = `${this.baseUrl}${Strings.API_COMPANIES}`;

    return this.http.get<ApiResponse<ICompany[]>>(url, { params }).pipe(
      tap((response) => {
        this.isLoading.set(false);
        if (response.success && response.data) {
          this.companies.set(response.data);
        }
      }),
      catchError((error) => {
        this.isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Busca detalhes de uma empresa por ID
   */
  getCompanyById(companyId: string): Observable<ApiResponse<ICompany>> {
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}`;
    return this.http.get<ApiResponse<ICompany>>(url).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.selectedCompany.set(response.data);
        }
      })
    );
  }
}
