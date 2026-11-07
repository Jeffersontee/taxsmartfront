import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  shieldCheckmarkOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  closeOutline,
  createOutline,
  keyOutline,
  callOutline,
  businessOutline,
  globeOutline,
  layersOutline,
  checkmarkOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';
import { StaffService } from '../../../services/staff/staff.service';
import { CompanyService } from '../../../services/company/company.service';
import { User, UserRole, SystemModule } from '../../../models/user.model';
import { formatPhone, handlePhoneInput } from '../../../utils/phone-mask.util';
import { PhoneMaskDirective } from '../../../directives/phone-mask.directive';

@Component({
  selector: 'app-admin-staff',
  templateUrl: './admin-staff.component.html',
  styleUrls: ['./admin-staff.component.scss'],
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
export class AdminStaffComponent implements OnInit {
  private staffService = inject(StaffService);
  private companyService = inject(CompanyService);
  private fb = inject(FormBuilder);

  staffMembers = this.staffService.staffMembers;
  companies = this.companyService.companies;
  isLoading = this.staffService.isLoading;

  searchTerm = signal<string>('');
  selectedRole = signal<string>('');
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentStaffId = signal<string | null>(null);
  showPassword = signal<boolean>(false);

  staffForm: FormGroup;

  rolesList = [
    { value: UserRole.SUPER_ADMIN, label: 'Super Administrador' },
    { value: UserRole.ACCOUNTANT, label: 'Contador Responsável' },
    { value: UserRole.FISCAL_ANALYST, label: 'Analista Fiscal' },
    { value: UserRole.PAYROLL_ANALYST, label: 'Analista DP / RH' },
  ];

  modulesList = [
    { value: SystemModule.FISCAL, label: 'Módulo Fiscal', desc: 'Notas fiscais, apuração de tributos (DAS/DARF) e SPED' },
    { value: SystemModule.ACCOUNTING, label: 'Módulo Contábil', desc: 'Extratos OFX, conciliação bancária, razão e balancetes' },
    { value: SystemModule.PAYROLL, label: 'Módulo DP / Folha', desc: 'Folha de pagamento, pró-labore, encargos e eSocial' },
    { value: 'RH', label: 'Módulo RH', desc: 'Colaboradores, admissões, férias, rescisões e ASO' },
    { value: SystemModule.COMPANIES, label: 'Empresas & Clientes', desc: 'Visualização e gestão cadastral das empresas clientes' },
    { value: SystemModule.TIMELINE_TASKS, label: 'Linha do Tempo & Tarefas', desc: 'Calendário de fechamento e obrigações da carteira' },
  ];

  filteredStaff = computed(() => {
    let list = this.staffMembers();
    const term = this.searchTerm().toLowerCase().trim();
    const role = this.selectedRole();

    if (role) {
      list = list.filter((m) => m.role === role);
    }

    if (term) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(term) ||
          m.email.toLowerCase().includes(term) ||
          (m.phone && m.phone.includes(term))
      );
    }

    return list;
  });

  constructor() {
    addIcons({
      peopleOutline,
      personAddOutline,
      searchOutline,
      mailOutline,
      shieldCheckmarkOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      closeOutline,
      createOutline,
      keyOutline,
      callOutline,
      businessOutline,
      globeOutline,
      layersOutline,
      checkmarkOutline,
      eyeOutline,
      eyeOffOutline,
    });

    this.staffForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: [UserRole.ACCOUNTANT, [Validators.required]],
      phone: [''],
      scopeType: ['ALL'], // 'ALL' = Carteira Geral, 'CUSTOM' = Empresas Específicas
      assignedCompanies: [[]],
      selectedModules: [this.getDefaultModulesForRole(UserRole.ACCOUNTANT)],
    });

    // Atualiza automaticamente os módulos sugeridos ao mudar o cargo no modo de cadastro
    this.staffForm.get('role')?.valueChanges.subscribe((newRole) => {
      if (!this.isEditing() && newRole) {
        this.staffForm.get('selectedModules')?.setValue(this.getDefaultModulesForRole(newRole));
      }
    });
  }

  ngOnInit(): void {
    this.loadStaff();
    this.companyService.loadCompanies().subscribe();
  }

  loadStaff(): void {
    this.staffService.loadStaffMembers().subscribe();
  }

  getDefaultModulesForRole(role: UserRole): string[] {
    switch (role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ACCOUNTANT:
        return [
          SystemModule.FISCAL,
          SystemModule.ACCOUNTING,
          SystemModule.PAYROLL,
          'RH',
          SystemModule.COMPANIES,
          SystemModule.TIMELINE_TASKS,
        ];
      case UserRole.FISCAL_ANALYST:
        return [
          SystemModule.FISCAL,
          SystemModule.ACCOUNTING,
          SystemModule.COMPANIES,
          SystemModule.TIMELINE_TASKS,
        ];
      case UserRole.PAYROLL_ANALYST:
        return [
          SystemModule.PAYROLL,
          'RH',
          SystemModule.COMPANIES,
          SystemModule.TIMELINE_TASKS,
        ];
      default:
        return [SystemModule.TIMELINE_TASKS];
    }
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.currentStaffId.set(null);
    this.showPassword.set(false);
    this.staffForm.reset({
      role: UserRole.ACCOUNTANT,
      scopeType: 'ALL',
      assignedCompanies: [],
      selectedModules: this.getDefaultModulesForRole(UserRole.ACCOUNTANT),
    });
    this.staffForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.staffForm.get('password')?.updateValueAndValidity();
    this.isModalOpen.set(true);
  }

  openEditModal(member: User): void {
    this.isEditing.set(true);
    this.currentStaffId.set(member._id || null);
    this.showPassword.set(false);

    const isCustomScope = Array.isArray(member.assignedCompanies) && member.assignedCompanies.length > 0;
    const assignedIds = (member.assignedCompanies || []).map((c: any) =>
      typeof c === 'object' && c._id ? c._id : String(c)
    );
    const memberMods =
      member.allowedModules && member.allowedModules.length > 0
        ? member.allowedModules
        : this.getDefaultModulesForRole(member.role);

    this.staffForm.patchValue({
      name: member.name,
      email: member.email,
      password: '',
      role: member.role,
      phone: formatPhone(member.phone || ''),
      scopeType: isCustomScope ? 'CUSTOM' : 'ALL',
      assignedCompanies: assignedIds,
      selectedModules: memberMods,
    });

    // Senha opcional na edição
    this.staffForm.get('password')?.clearValidators();
    this.staffForm.get('password')?.updateValueAndValidity();
    this.isModalOpen.set(true);
  }

  toggleShowPassword(): void {
    this.showPassword.update((val) => !val);
  }

  onPhoneInput(event: any): void {
    handlePhoneInput(event, this.staffForm.get('phone'));
  }

  onScopeChange(type: 'ALL' | 'CUSTOM'): void {
    this.staffForm.get('scopeType')?.setValue(type);
    if (type === 'ALL') {
      this.staffForm.get('assignedCompanies')?.setValue([]);
    }
  }

  onAssignedCompaniesChange(event: any): void {
    const val = event.detail.value;
    const arrayVal = Array.isArray(val) ? val : (val ? [val] : []);
    this.staffForm.get('assignedCompanies')?.setValue(arrayVal);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  toggleModule(modValue: any): void {
    const current = (this.staffForm.get('selectedModules')?.value as string[]) || [];
    if (current.includes(modValue)) {
      this.staffForm.get('selectedModules')?.setValue(current.filter((m) => m !== modValue));
    } else {
      this.staffForm.get('selectedModules')?.setValue([...current, modValue]);
    }
  }

  isModuleSelected(modValue: any): boolean {
    const current = (this.staffForm.get('selectedModules')?.value as string[]) || [];
    return current.includes(modValue);
  }

  saveStaff(): void {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    const formVal = this.staffForm.getRawValue();
    const allowedModules = formVal.selectedModules || [];
    let assignedCompanies: string[] = [];
    if (formVal.scopeType === 'CUSTOM') {
      if (Array.isArray(formVal.assignedCompanies)) {
        assignedCompanies = formVal.assignedCompanies;
      } else if (formVal.assignedCompanies) {
        assignedCompanies = [formVal.assignedCompanies];
      }
    }

    if (this.isEditing() && this.currentStaffId()) {
      const updatePayload: any = {
        name: formVal.name,
        email: formVal.email,
        role: formVal.role,
        phone: formVal.phone,
        allowedModules,
        assignedCompanies,
      };
      if (formVal.password && formVal.password.trim().length >= 6) {
        updatePayload.password = formVal.password.trim();
      }

      this.staffService.updateStaffMember(this.currentStaffId()!, updatePayload).subscribe({
        next: (res) => {
          this.closeModal();
          this.loadStaff();
        },
        error: (err) => {
          console.error('Erro ao atualizar membro da equipe:', err);
        },
      });
    } else {
      this.staffService
        .createStaffMember({
          name: formVal.name,
          email: formVal.email,
          password: formVal.password,
          role: formVal.role,
          phone: formVal.phone,
          allowedModules,
          assignedCompanies,
        })
        .subscribe({
          next: (res) => {
            this.closeModal();
            this.loadStaff();
          },
          error: (err) => {
            console.error('Erro ao criar membro da equipe:', err);
          },
        });
    }
  }

  toggleStatus(member: User): void {
    if (member._id) {
      this.staffService.toggleStaffStatus(member._id).subscribe();
    }
  }

  getRoleBadge(role: UserRole): { label: string; color: string } {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return { label: 'Super Admin', color: 'danger' };
      case UserRole.ACCOUNTANT:
        return { label: 'Contador Resp.', color: 'primary' };
      case UserRole.FISCAL_ANALYST:
        return { label: 'Analista Fiscal', color: 'warning' };
      case UserRole.PAYROLL_ANALYST:
        return { label: 'Analista DP/RH', color: 'tertiary' };
      default:
        return { label: 'Staff', color: 'medium' };
    }
  }

  getMemberModules(member: User): string[] {
    const mods = member.allowedModules && member.allowedModules.length > 0
      ? member.allowedModules
      : this.getDefaultModulesForRole(member.role);

    return mods.map((m) => {
      switch (m) {
        case SystemModule.FISCAL:
          return 'Fiscal';
        case SystemModule.ACCOUNTING:
          return 'Contábil';
        case SystemModule.PAYROLL:
          return 'DP / Folha';
        case 'RH':
          return 'RH';
        case SystemModule.COMPANIES:
          return 'Empresas';
        case SystemModule.TIMELINE_TASKS:
          return 'Linha do Tempo';
        default:
          return String(m);
      }
    });
  }

  getMemberScopeLabel(member: User): string {
    if (!member.assignedCompanies || member.assignedCompanies.length === 0) {
      return 'Carteira Geral (Todas as Empresas)';
    }
    const count = member.assignedCompanies.length;
    if (count === 1) {
      const first: any = member.assignedCompanies[0];
      if (typeof first === 'object' && (first.tradeName || first.corporateName)) {
        return first.tradeName || first.corporateName;
      }
      const found = this.companies().find((c) => c._id === String(first));
      if (found) {
        return found.tradeName || found.corporateName;
      }
      return '1 empresa atribuída';
    }
    return `${count} empresas atribuídas`;
  }
}
