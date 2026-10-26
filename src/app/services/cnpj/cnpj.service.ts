import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Strings } from '../../enum/strings';
import { ApiResponse } from '../../models/user.model';

export interface CnpjCompanyData {
  cnpj: string;
  corporateName: string;
  tradeName: string;
  taxRegime: string;
  cnaePrincipal: string;
  cnaesSecundarios: string[];
  email: string;
  phone: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  partners: Array<{
    name: string;
    cpf?: string;
    isResponsible: boolean;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class CnpjService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  // Cache em memória para evitar requisições redundantes ao mesmo CNPJ
  private cache = new Map<string, CnpjCompanyData>();

  /**
   * Consulta os dados completos do CNPJ (via proxy do backend com fallback BrasilAPI/ReceitaWS)
   */
  lookupCnpj(rawCnpj: string): Observable<CnpjCompanyData | null> {
    const cleanCnpj = rawCnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      return of(null);
    }

    if (this.cache.has(cleanCnpj)) {
      return of(this.cache.get(cleanCnpj)!);
    }

    // Chama o backend que faz o roteamento inteligente com fallback
    const url = `${this.baseUrl}/api/v1/companies/cnpj-lookup/${cleanCnpj}`;

    return this.http.get<ApiResponse<CnpjCompanyData>>(url).pipe(
      map((res) => {
        if (res.success && res.data) {
          this.cache.set(cleanCnpj, res.data);
          return res.data;
        }
        return null;
      }),
      catchError((error) => {
        console.warn('⚠️ [CnpjService] Falha na consulta de CNPJ via backend, tentando consulta direta BrasilAPI:', error);
        // Fallback direto no frontend se o backend estiver indisponível
        return this.directBrasilApiLookup(cleanCnpj);
      })
    );
  }

  /**
   * Fallback direto no cliente via BrasilAPI
   */
  private directBrasilApiLookup(cleanCnpj: string): Observable<CnpjCompanyData | null> {
    return this.http.get<any>(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`).pipe(
      map((data) => {
        if (!data) return null;
        const mapped: CnpjCompanyData = {
          cnpj: data.cnpj || cleanCnpj,
          corporateName: data.razao_social || '',
          tradeName: data.nome_fantasia || data.razao_social || '',
          taxRegime: data.opcao_pelo_simples ? 'SIMPLES_NACIONAL' : 'LUCRO_PRESUMIDO',
          cnaePrincipal: data.cnae_fiscal_descricao ? `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}` : String(data.cnae_fiscal || ''),
          cnaesSecundarios: Array.isArray(data.cnaes_secundarios)
            ? data.cnaes_secundarios.map((c: any) => `${c.codigo} - ${c.descricao}`)
            : [],
          email: data.email || '',
          phone: data.ddd_telefone_1 || data.telefone || '',
          address: {
            street: data.logradouro || '',
            number: data.numero || '',
            complement: data.complemento || '',
            neighborhood: data.bairro || '',
            city: data.municipio || '',
            state: data.uf || '',
            zipCode: data.cep ? data.cep.replace(/\D/g, '') : '',
          },
          partners: Array.isArray(data.qsa)
            ? data.qsa.map((s: any) => ({
                name: s.nome_socio || '',
                cpf: s.cnpj_cpf_do_socio || '',
                isResponsible: String(s.qualificacao_socio || '').toLowerCase().includes('administrador'),
              }))
            : [],
        };
        this.cache.set(cleanCnpj, mapped);
        return mapped;
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Formata uma string de CNPJ no padrão 00.000.000/0000-00
   */
  formatCnpj(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  }
}
