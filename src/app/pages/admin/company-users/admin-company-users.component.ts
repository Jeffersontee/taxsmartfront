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
  AlertController,
  ToastController,
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
  checkmarkOutline,
  closeCircleOutline,
  closeOutline,
  callOutline,
  lockClosedOutline,
  informationCircleOutline,
  eyeOutline,
  eyeOffOutline,
  createOutline,
  layersOutline,
} from 'ionicons/icons';
import { CompanyService } from '../../../services/company/company.service';
import { Strings } from '../../../enum/strings';
import { environment } from '../../../../environments/environment';
import { User, UserRole, UserType, ApiResponse } from '../../../models/user.model';
import { ICompany } from '../../../models/company.model';
import { handlePhoneInput } from '../../../utils/phone-mask.util';
import { PhoneMaskDirective } from '../../../directives/phone-mask.directive';

@Component({
  selector: 'app-admin-company-users',
  templateUrl: './admin-company-users.component.html',
  styleUrls: ['./admin-company-users.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PhoneMaskDirective,
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
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  companies = this.companyService.companies;
  selectedCompanyId = signal<string>('');
  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingUserId = signal<string | null>(null);

  searchTerm = signal<string>('');
  showPassword = signal<boolean>(false);

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
    { value: UserRole.OWNER, label: 'Titular / Proprietário (OWNER)' },
    { value: UserRole.PARTNER, label: 'Sócio Cotista (PARTNER)' },
    { value: UserRole.COMPANY_FINANCIAL, label: 'Gestor Financeiro' },
    { value: UserRole.COMPANY_EMPLOYEE, label: 'Colaborador da Empresa' },
  ];

  modulesList = [
    { value: 'FISCAL', label: 'Módulo Fiscal', desc: 'Notas fiscais, apuração de tributos (DAS/DARF) e SPED' },
    { value: 'ACCOUNTING', label: 'Módulo Contábil', desc: 'Extratos OFX, conciliação bancária, razão e balancetes' },
    { value: 'PAYROLL', label: 'Módulo DP / Folha', desc: 'Folha de pagamento, pró-labore, encargos e eSocial' },
    { value: 'RH', label: 'Módulo RH', desc: 'Colaboradores, admissões, férias, rescisões e ASO' },
    { value: 'DOCUMENTS', label: 'Esteira de Documentos', desc: 'Envio e visualização de arquivos e comprovantes' },
  ];

  selectedModules = signal<string[]>(['FISCAL', 'ACCOUNTING', 'DOCUMENTS']);

  selectedCompanyName = computed(() => {
    const c = this.companies().find((comp) => comp._id === this.selectedCompanyId());
    return c ? c.tradeName || c.corporateName : '';
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
      checkmarkOutline,
      closeCircleOutline,
      closeOutline,
      callOutline,
      lockClosedOutline,
      informationCircleOutline,
      eyeOutline,
      eyeOffOutline,
      createOutline,
      layersOutline,
    });

    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      type: [UserType.OWNER, [Validators.required]],
      role: [UserRole.COMPANY_ADMIN, [Validators.required]],
      phone: [''],
    });

    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      if (role && !this.isEditing()) {
        this.selectedModules.set(this.getDefaultModulesForRole(role));
      }
    });
  }

  getDefaultModulesForRole(role: string): string[] {
    if (role === UserRole.COMPANY_ADMIN || role === UserRole.OWNER || role === UserRole.PARTNER) {
      return ['FISCAL', 'ACCOUNTING', 'PAYROLL', 'RH', 'DOCUMENTS'];
    }
    if (role === UserRole.COMPANY_FINANCIAL) {
      return ['FISCAL', 'ACCOUNTING', 'DOCUMENTS'];
    }
    if (role === UserRole.COMPANY_EMPLOYEE) {
      return ['PAYROLL', 'DOCUMENTS'];
    }
    return ['FISCAL', 'ACCOUNTING', 'DOCUMENTS'];
  }

  toggleModule(modValue: string): void {
    const current = this.selectedModules();
    if (current.includes(modValue)) {
      if (current.length > 1) {
        this.selectedModules.set(current.filter((m) => m !== modValue));
      }
    } else {
      this.selectedModules.set([...current, modValue]);
    }
  }

  isModuleSelected(modValue: string): boolean {
    return this.selectedModules().includes(modValue);
  }

  getUserModules(user: User): string[] {
    if (user.allowedModules && user.allowedModules.length > 0) {
      return user.allowedModules;
    }
    return this.getDefaultModulesForRole(user.role);
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
    this.isEditing.set(false);
    this.editingUserId.set(null);
    this.showPassword.set(false);

    this.userForm.get('email')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.reset({
      type: UserType.OWNER,
      role: UserRole.COMPANY_ADMIN,
    });
    this.selectedModules.set(this.getDefaultModulesForRole(UserRole.COMPANY_ADMIN));
    this.isModalOpen.set(true);
  }

  openEditModal(user: User): void {
    this.isEditing.set(true);
    this.editingUserId.set(user._id || null);
    this.showPassword.set(false);

    this.userForm.get('email')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: '',
      type: user.type,
      role: user.role,
      phone: user.phone || '',
    });

    this.selectedModules.set(this.getUserModules(user));
    this.isModalOpen.set(true);
  }

  toggleShowPassword(): void {
    this.showPassword.update((val) => !val);
  }

  onPhoneInput(event: any): void {
    handlePhoneInput(event, this.userForm.get('phone'));
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveUser(): void {
    if (this.userForm.invalid || !this.selectedCompanyId()) {
      this.userForm.markAllAsTouched();
      return;
    }

    const raw = this.userForm.getRawValue();
    this.isLoading.set(true);

    if (this.isEditing()) {
      const payload: any = {
        name: raw.name,
        type: raw.type,
        role: raw.role,
        phone: raw.phone || undefined,
        allowedModules: this.selectedModules(),
      };
      if (raw.password && raw.password.trim()) {
        payload.password = raw.password.trim();
      }

      const url = `${this.baseUrl}${Strings.API_COMPANIES}/${this.selectedCompanyId()}/users/${this.editingUserId()}`;
      this.http.put<ApiResponse<User>>(url, payload).subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.closeModal();
          this.loadUsersByCompany(this.selectedCompanyId());
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
    } else {
      const payload = {
        ...raw,
        allowedModules: this.selectedModules(),
      };
      const url = `${this.baseUrl}${Strings.API_COMPANIES}/${this.selectedCompanyId()}/users`;

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

  async toggleUserStatus(user: User): Promise<void> {
    if (!this.selectedCompanyId() || !user._id) return;

    const actionText = user.active !== false ? 'desativar' : 'reativar';
    const alert = await this.alertCtrl.create({
      header: `Confirmar ${actionText}?`,
      message: `Deseja realmente ${actionText} o acesso de ${user.name}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.isLoading.set(true);
            const url = `${this.baseUrl}${Strings.API_COMPANIES}/${this.selectedCompanyId()}/users/${user._id}/toggle-status`;
            this.http.patch<ApiResponse<User>>(url, {}).subscribe({
              next: () => {
                this.loadUsersByCompany(this.selectedCompanyId());
              },
              error: () => {
                this.isLoading.set(false);
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  getRoleBadge(role: UserRole | string): { color: string; label: string } {
    switch (role) {
      case UserRole.COMPANY_ADMIN:
      case UserRole.OWNER:
        return { color: 'success', label: 'Titular / Administrador' };
      case UserRole.PARTNER:
        return { color: 'warning', label: 'Sócio Cotista' };
      case UserRole.COMPANY_FINANCIAL:
        return { color: 'tertiary', label: 'Gestor Financeiro' };
      case UserRole.COMPANY_EMPLOYEE:
        return { color: 'medium', label: 'Colaborador' };
      default:
        return { color: 'light', label: role };
    }
  }
}
