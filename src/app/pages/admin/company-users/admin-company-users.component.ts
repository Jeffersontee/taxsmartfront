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
} from 'ionicons/icons';
import { CompanyService } from '../../../services/company/company.service';
import { Strings } from '../../../enum/strings';
import { environment } from '../../../../environments/environment';
import { User, UserRole, UserType, ApiResponse } from '../../../models/user.model';
import { ICompany } from '../../../models/company.model';

@Component({
  selector: 'app-admin-company-users',
  templateUrl: './admin-company-users.component.html',
  styleUrls: ['./admin-company-users.component.scss'],
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
export class AdminCompanyUsersComponent implements OnInit {
  private companyService = inject(CompanyService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  companies = this.companyService.companies;
  selectedCompanyId = signal<string>('');
  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  searchTerm = signal<string>('');

  userForm: FormGroup;

  typesList = [
    { value: UserType.OWNER, label: 'Titular / Proprietário (OWNER)' },
    { value: UserType.PARTNER, label: 'Sócio (PARTNER - LTDA / Sociedades)' },
    { value: UserType.COMPANY_FINANCIAL, label: 'Financeiro (COMPANY_FINANCIAL)' },
    { value: UserType.EMPLOYEE, label: 'Colaborador (EMPLOYEE)' },
    { value: UserType.COMPANY, label: 'Acesso Geral Empresa (COMPANY)' },
  ];

  rolesList = [
    { value: UserRole.COMPANY_ADMIN, label: 'Administrador da Empresa (Acesso Total)' },
    { value: UserRole.OWNER, label: 'Titular / Proprietário (Acesso Total)' },
    { value: UserRole.PARTNER, label: 'Sócio da Empresa (Acesso Total)' },
    { value: UserRole.COMPANY_FINANCIAL, label: 'Gestor Financeiro (Guias, Notas e Tributos)' },
    { value: UserRole.COMPANY_EMPLOYEE, label: 'Colaborador (Holerites e Ponto)' },
  ];

  selectedCompany = computed(() => {
    const id = this.selectedCompanyId();
    return this.companies().find((c) => c._id === id);
  });

  isMeiCompany = computed(() => {
    const regime = this.selectedCompany()?.taxRegime || (this.selectedCompany() as any)?.tax_regime;
    return regime === 'MEI';
  });

  availableTypes = computed(() => {
    if (this.isMeiCompany()) {
      return this.typesList.filter((t) => t.value !== UserType.PARTNER);
    }
    return this.typesList;
  });

  availableRoles = computed(() => {
    if (this.isMeiCompany()) {
      return this.rolesList.filter((r) => r.value !== UserRole.PARTNER);
    }
    return this.rolesList;
  });

  filteredUsers = computed(() => {
    let list = this.users();
    const term = this.searchTerm().toLowerCase().trim();

    if (term) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.phone && u.phone.includes(term))
      );
    }

    return list;
  });

  selectedCompanyName = computed(() => {
    const comp = this.selectedCompany();
    return comp ? comp.tradeName || comp.corporateName : '';
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
    });

    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      type: [UserType.OWNER, [Validators.required]],
      role: [UserRole.COMPANY_ADMIN, [Validators.required]],
      phone: [''],
    });
  }

  ngOnInit(): void {
    this.companyService.loadCompanies().subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.selectedCompanyId.set(res.data[0]._id);
          this.loadUsersByCompany(res.data[0]._id);
        }
      },
    });
  }

  onCompanyChange(companyId: string): void {
    this.selectedCompanyId.set(companyId);
    this.loadUsersByCompany(companyId);
  }

  loadUsersByCompany(companyId: string): void {
    if (!companyId) return;
    this.isLoading.set(true);
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${companyId}/users`;

    this.http.get<ApiResponse<User[]>>(url).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.users.set(res.data);
        } else {
          this.users.set([]);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.users.set([]);
      },
    });
  }

  openCreateModal(): void {
    this.userForm.reset({
      type: UserType.OWNER,
      role: UserRole.COMPANY_ADMIN,
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveUser(): void {
    if (this.userForm.invalid || !this.selectedCompanyId()) {
      this.userForm.markAllAsTouched();
      return;
    }

    const payload = this.userForm.getRawValue();
    const url = `${this.baseUrl}${Strings.API_COMPANIES}/${this.selectedCompanyId()}/users`;

    this.isLoading.set(true);
    this.http.post<ApiResponse<User>>(url, payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const newUser = res.data;
        if (res.success && newUser) {
          this.users.update((list) => [newUser, ...list]);
          this.closeModal();
        }
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
