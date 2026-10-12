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
  IonSelect,
  IonSelectOption,
  IonModal,
  IonButtons,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  personAddOutline,
  calendarOutline,
  documentTextOutline,
  medkitOutline,
  giftOutline,
  shieldCheckmarkOutline,
  searchOutline,
  closeOutline,
  checkmarkCircleOutline,
  timeOutline,
  mailOutline,
  callOutline,
  businessOutline,
} from 'ionicons/icons';
import { PayrollService } from '../../../services/payroll/payroll.service';
import { CompanyService } from '../../../services/company/company.service';
import { Employee, EmployeeType, EmployeeStatus } from '../../../models/payroll.model';

@Component({
  selector: 'app-admin-rh',
  templateUrl: './admin-rh.component.html',
  styleUrls: ['./admin-rh.component.scss'],
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
    IonSelect,
    IonSelectOption,
    IonModal,
    IonButtons,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonInput,
  ],
})
export class AdminRhComponent implements OnInit {
  payrollService = inject(PayrollService);
  companyService = inject(CompanyService);
  private fb = inject(FormBuilder);

  companies = this.companyService.companies;
  employees = this.payrollService.employees;
  isLoading = this.payrollService.isLoading;

  selectedCompanyId = signal<string>('');
  currentTab = signal<'colaboradores' | 'admissoes' | 'ferias' | 'aso'>('colaboradores');
  searchTerm = signal<string>('');
  isModalOpen = signal<boolean>(false);

  employeeForm: FormGroup;

  contractTypes = [
    { value: EmployeeType.CLT, label: 'CLT (Efetivo)' },
    { value: EmployeeType.ESTAGIARIO, label: 'Estagiário' },
    { value: EmployeeType.PJ, label: 'Prestador PJ' },
    { value: EmployeeType.PRO_LABORE, label: 'Sócio com Pró-labore' },
    { value: EmployeeType.AUTONOMO, label: 'Autônomo' },
  ];

  filteredEmployees = computed(() => {
    let list = this.employees();
    const term = this.searchTerm().toLowerCase().trim();

    if (term) {
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(term) ||
          e.role.toLowerCase().includes(term) ||
          (e.department && e.department.toLowerCase().includes(term)) ||
          e.cpf.includes(term)
      );
    }

    return list;
  });

  selectedCompanyName = computed(() => {
    const id = this.selectedCompanyId();
    const comp = this.companies().find((c) => c._id === id);
    return comp ? comp.tradeName || comp.corporateName : '';
  });

  constructor() {
    addIcons({
      peopleOutline,
      personAddOutline,
      calendarOutline,
      documentTextOutline,
      medkitOutline,
      giftOutline,
      shieldCheckmarkOutline,
      searchOutline,
      closeOutline,
      checkmarkCircleOutline,
      timeOutline,
      mailOutline,
      callOutline,
      businessOutline,
    });

    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required]],
      role: ['', [Validators.required]],
      department: ['Geral', [Validators.required]],
      type: [EmployeeType.CLT, [Validators.required]],
      base_salary: [0, [Validators.required, Validators.min(0)]],
      admission_date: [new Date().toISOString().substring(0, 10), [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.companyService.loadCompanies().subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.selectedCompanyId.set(res.data[0]._id);
          this.loadEmployees();
        }
      },
    });
  }

  onCompanyChange(companyId: string): void {
    this.selectedCompanyId.set(companyId);
    this.loadEmployees();
  }

  loadEmployees(): void {
    const compId = this.selectedCompanyId();
    if (!compId) return;
    this.payrollService.getEmployees(compId).subscribe();
  }

  openCreateModal(): void {
    this.employeeForm.reset({
      department: 'Operações',
      type: EmployeeType.CLT,
      base_salary: 2500,
      admission_date: new Date().toISOString().substring(0, 10),
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveEmployee(): void {
    if (this.employeeForm.invalid || !this.selectedCompanyId()) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formVal = this.employeeForm.getRawValue();
    const payload: Partial<Employee> = {
      ...formVal,
      company_id: this.selectedCompanyId(),
      base_salary: Number(formVal.base_salary || 0),
      status: EmployeeStatus.ACTIVE,
    };

    this.payrollService.saveEmployee(payload).subscribe({
      next: () => this.closeModal(),
    });
  }
}

