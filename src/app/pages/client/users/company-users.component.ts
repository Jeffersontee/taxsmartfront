import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonButtons,
  IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  personAddOutline,
  searchOutline,
  mailOutline,
  businessOutline,
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  closeOutline,
  callOutline,
  lockClosedOutline,
  informationCircleOutline,
  alertCircleOutline,
  refreshOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { CompanyService } from '../../../services/company/company.service';
import { Strings } from '../../../enum/strings';
import { environment } from '../../../../environments/environment';
import { User, UserRole, UserType, ApiResponse } from '../../../models/user.model';
import { ICompany } from '../../../models/company.model';

@Component({
  selector: 'app-company-users',
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonSpinner,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonButtons,
    IonSearchbar,
  ],
})
export class CompanyUsersComponent implements OnInit {
  authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  currentCompany = computed<ICompany | null>(() => {
    return this.companyService.selectedCompany();
  });

  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  searchTerm = signal<string>('');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  userForm: FormGroup;

  rolesList = [
    { value: UserRole.COMPANY_FINANCIAL, type: UserType.COMPANY_FINANCIAL, label: 'Financeiro (Guias, Notas & Extratos)' },
    { value: UserRole.PARTNER, type: UserType.PARTNER, label: 'Sócio (Acesso Estratégico & Relatórios)' },
    { value: UserRole.COMPANY_EMPLOYEE, type: UserType.EMPLOYEE, label: 'Colaborador (Holerites & Atendimento)' },
    { value: UserRole.COMPANY_ADMIN, type: UserType.OWNER, label: 'Co-Administrador (Gestão Plena)' },
  ];

  isCompanyMei = computed(() => {
    const comp = this.currentCompany();
    return comp?.taxRegime === 'MEI';
  });

  filteredUsers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return this.users();
    return this.users().filter((u) => {
      const matchName = u.name?.toLowerCase().includes(term);
      const matchEmail = u.email?.toLowerCase().includes(term);
      const matchRole = u.role?.toLowerCase().includes(term);
      return matchName || matchEmail || matchRole;
    });
  });

  constructor() {
    addIcons({
      peopleOutline,
      personAddOutline,
      searchOutline,
      mailOutline,
      businessOutline,
      shieldCheckmarkOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      closeOutline,
      callOutline,
      lockClosedOutline,
      informationCircleOutline,
      alertCircleOutline,
      refreshOutline,
    });

    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.COMPANY_FINANCIAL, [Validators.required]],
      phone: [''],
    });
  }

  ngOnInit(): void {
    if (!this.companyService.selectedCompany()) {
      this.companyService.loadCompanies().subscribe((res) => {
        if (res.data && res.data.length > 0) {
          this.companyService.selectedCompany.set(res.data[0]);
          this.loadUsers();
        }
      });
    } else {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    const comp = this.currentCompany();
    if (!comp || !comp._id) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const url = `${this.baseUrl}/companies/${comp._id}/users`;
    this.http.get<ApiResponse<User[]>>(url).subscribe({
      next: (res) => {
        this.users.set(res.data || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error?.message || 'Erro ao carregar membros da equipe.');
        this.isLoading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.userForm.reset({
      name: '',
      email: '',
      password: '',
      role: UserRole.COMPANY_FINANCIAL,
      phone: '',
    });
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onSubmitUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const comp = this.currentCompany();
    if (!comp || !comp._id) {
      this.errorMessage.set('Empresa não selecionada.');
      return;
    }

    const raw = this.userForm.getRawValue();

    // Se a empresa for MEI e tentarem cadastrar Sócio (PARTNER)
    if (this.isCompanyMei() && raw.role === UserRole.PARTNER) {
      this.errorMessage.set('Empresas no regime MEI são de natureza individual e não permitem sócios.');
      return;
    }

    // Resolver o UserType correspondente ao papel
    const roleConfig = this.rolesList.find((r) => r.value === raw.role);
    const resolvedType = roleConfig ? roleConfig.type : UserType.COMPANY;

    const payload = {
      name: raw.name,
      email: raw.email,
      password: raw.password,
      role: raw.role,
      type: resolvedType,
      phone: raw.phone || undefined,
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const url = `${this.baseUrl}/companies/${comp._id}/users`;
    this.http.post<ApiResponse<User>>(url, payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isModalOpen.set(false);
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error?.message || 'Erro ao criar usuário para a empresa.');
        this.isLoading.set(false);
      },
    });
  }

  toggleUserStatus(user: User): void {
    const comp = this.currentCompany();
    if (!comp || !comp._id || !user._id) return;

    this.isLoading.set(true);
    const url = `${this.baseUrl}/companies/${comp._id}/users/${user._id}/toggle-status`;
    this.http.patch<ApiResponse<User>>(url, {}).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error?.message || 'Erro ao alterar status do usuário.');
        this.isLoading.set(false);
      },
    });
  }

  getRoleBadgeLabel(role: UserRole | string): string {
    switch (role) {
      case UserRole.COMPANY_ADMIN:
      case UserRole.OWNER:
        return 'Titular / Administrador';
      case UserRole.PARTNER:
        return 'Sócio Cotista';
      case UserRole.COMPANY_FINANCIAL:
        return 'Gestor Financeiro';
      case UserRole.COMPANY_EMPLOYEE:
        return 'Colaborador';
      default:
        return role;
    }
  }

  getRoleBadgeColor(role: UserRole | string): string {
    switch (role) {
      case UserRole.COMPANY_ADMIN:
      case UserRole.OWNER:
        return 'primary';
      case UserRole.PARTNER:
        return 'tertiary';
      case UserRole.COMPANY_FINANCIAL:
        return 'warning';
      case UserRole.COMPANY_EMPLOYEE:
        return 'medium';
      default:
        return 'light';
    }
  }
}
