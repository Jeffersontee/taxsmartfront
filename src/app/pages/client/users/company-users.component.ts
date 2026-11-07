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
  ToastController,
  AlertController,
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
  alertCircleOutline,
  refreshOutline,
  eyeOutline,
  eyeOffOutline,
  createOutline,
  layersOutline,
  personCircleOutline,
  trashOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { CompanyService } from '../../../services/company/company.service';
import { Strings } from '../../../enum/strings';
import { environment } from '../../../../environments/environment';
import { User, UserRole, UserType, ApiResponse } from '../../../models/user.model';
import { ICompany } from '../../../models/company.model';
import { handlePhoneInput } from '../../../utils/phone-mask.util';
import { PhoneMaskDirective } from '../../../directives/phone-mask.directive';

@Component({
  selector: 'app-company-users',
  templateUrl: './company-users.component.html',
  styleUrls: ['./company-users.component.scss'],
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
export class CompanyUsersComponent implements OnInit {
  authService = inject(AuthService);
  private companyService = inject(CompanyService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);
  private readonly baseUrl = environment.apiBaseUrl || Strings.API_BASE_URL;

  currentCompany = computed<ICompany | null>(() => {
    return this.companyService.selectedCompany();
  });

  users = signal<User[]>([]);
  isLoading = signal<boolean>(false);
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  editingUserId = signal<string | null>(null);

  searchTerm = signal<string>('');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  userForm: FormGroup;

  rolesList = [
    { value: UserRole.COMPANY_FINANCIAL, type: UserType.COMPANY_FINANCIAL, label: 'Gestor Financeiro (Guias, Notas & Extratos)' },
    { value: UserRole.PARTNER, type: UserType.PARTNER, label: 'Sócio Cotista (Acesso Estratégico & Relatórios)' },
    { value: UserRole.COMPANY_EMPLOYEE, type: UserType.EMPLOYEE, label: 'Colaborador (Holerites & Atendimento)' },
    { value: UserRole.COMPANY_ADMIN, type: UserType.OWNER, label: 'Titular / Administrador (Gestão Plena)' },
  ];

  modulesList = [
    { value: 'TIMELINE_TASKS', label: 'Tarefas & Linha do Tempo', desc: 'Acompanhamento de rotinas operacionais, guias fiscais e checklists' },
    { value: 'FISCAL', label: 'Módulo Fiscal', desc: 'Notas fiscais, apuração de tributos (DAS/DARF) e SPED' },
    { value: 'ACCOUNTING', label: 'Módulo Contábil', desc: 'Extratos OFX, conciliação bancária, razão e balancetes' },
    { value: 'PAYROLL', label: 'Módulo DP / Folha', desc: 'Folha de pagamento, pró-labore, encargos e eSocial' },
    { value: 'RH', label: 'Módulo RH', desc: 'Colaboradores, admissões, férias, rescisões e ASO' },
    { value: 'DOCUMENTS', label: 'Esteira de Documentos', desc: 'Envio e visualização de arquivos e comprovantes' },
  ];

  selectedModules = signal<string[]>(['TIMELINE_TASKS', 'FISCAL', 'ACCOUNTING', 'DOCUMENTS']);

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
      checkmarkOutline,
      closeCircleOutline,
      closeOutline,
      callOutline,
      lockClosedOutline,
      informationCircleOutline,
      alertCircleOutline,
      refreshOutline,
      eyeOutline,
      eyeOffOutline,
      createOutline,
      layersOutline,
      personCircleOutline,
      trashOutline,
    });

    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: [UserRole.COMPANY_FINANCIAL, [Validators.required]],
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
    this.isEditing.set(false);
    this.editingUserId.set(null);
    this.showPassword.set(false);

    // Habilita email e torna password obrigatório
    this.userForm.get('email')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.reset({
      name: '',
      email: '',
      password: '',
      role: UserRole.COMPANY_FINANCIAL,
      phone: '',
    });
    this.selectedModules.set(this.getDefaultModulesForRole(UserRole.COMPANY_FINANCIAL));
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(user: User): void {
    this.isEditing.set(true);
    this.editingUserId.set(user._id || null);
    this.showPassword.set(false);

    // Desabilita email na edição e torna password opcional
    this.userForm.get('email')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
    });

    this.selectedModules.set(this.getUserModules(user));
    this.errorMessage.set(null);
    this.successMessage.set(null);
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

    const roleConfig = this.rolesList.find((r) => r.value === raw.role);
    const resolvedType = roleConfig ? roleConfig.type : UserType.COMPANY;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    if (this.isEditing()) {
      // Edição de usuário
      const payload: any = {
        name: raw.name,
        role: raw.role,
        type: resolvedType,
        phone: raw.phone || undefined,
        allowedModules: this.selectedModules(),
      };
      if (raw.password && raw.password.trim()) {
        payload.password = raw.password.trim();
      }

      const url = `${this.baseUrl}/companies/${comp._id}/users/${this.editingUserId()}`;
      this.http.put<ApiResponse<User>>(url, payload).subscribe({
        next: async () => {
          this.isLoading.set(false);
          this.isModalOpen.set(false);
          const toast = await this.toastCtrl.create({
            message: 'Acesso do usuário atualizado com sucesso!',
            duration: 3000,
            color: 'success',
            position: 'top',
          });
          await toast.present();
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error?.message || 'Erro ao atualizar usuário da empresa.');
          this.isLoading.set(false);
        },
      });
    } else {
      // Criação de novo usuário
      const payload = {
        name: raw.name,
        email: raw.email,
        password: raw.password,
        role: raw.role,
        type: resolvedType,
        phone: raw.phone || undefined,
        allowedModules: this.selectedModules(),
      };

      const url = `${this.baseUrl}/companies/${comp._id}/users`;
      this.http.post<ApiResponse<User>>(url, payload).subscribe({
        next: async () => {
          this.isLoading.set(false);
          this.isModalOpen.set(false);
          const toast = await this.toastCtrl.create({
            message: 'Novo usuário cadastrado com sucesso!',
            duration: 3000,
            color: 'success',
            position: 'top',
          });
          await toast.present();
          this.loadUsers();
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error?.message || 'Erro ao criar usuário para a empresa.');
          this.isLoading.set(false);
        },
      });
    }
  }

  async toggleUserStatus(user: User): Promise<void> {
    const comp = this.currentCompany();
    if (!comp || !comp._id || !user._id) return;

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
          },
        },
      ],
    });
    await alert.present();
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

  getRoleClass(role: UserRole | string): string {
    switch (role) {
      case UserRole.COMPANY_ADMIN:
      case UserRole.OWNER:
        return 'role-owner';
      case UserRole.PARTNER:
        return 'role-partner';
      case UserRole.COMPANY_FINANCIAL:
        return 'role-financial';
      case UserRole.COMPANY_EMPLOYEE:
        return 'role-employee';
      default:
        return 'role-default';
    }
  }
}
