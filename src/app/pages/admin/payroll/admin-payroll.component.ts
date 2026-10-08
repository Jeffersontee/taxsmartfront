import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  peopleOutline,
  calculatorOutline,
  documentTextOutline,
  personAddOutline,
  cloudDownloadOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  cashOutline,
  briefcaseOutline,
  businessOutline,
  searchOutline,
  closeOutline,
  timeOutline,
  walletOutline,
} from 'ionicons/icons';
import { PayrollService } from '../../../services/payroll/payroll.service';
import { CompanyService } from '../../../services/company/company.service';
import { Employee, EmployeeType, EmployeeStatus, Payroll, Payslip } from '../../../models/payroll.model';

@Component({
  selector: 'app-admin-payroll',
  templateUrl: './admin-payroll.component.html',
  styleUrls: ['./admin-payroll.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon,
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
    IonItem,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol,
  ],
})
export class AdminPayrollComponent implements OnInit {
  private payrollService = inject(PayrollService);
  private companyService = inject(CompanyService);
  private fb = inject(FormBuilder);

  // Signals do Componente
  activeTab = signal<'employees' | 'calculate' | 'payslips'>('employees');
  selectedCompanyId = signal<string>('');
  selectedCompetence = signal<string>('10/2026');
  searchTerm = signal<string>('');
  isEmployeeModalOpen = signal<boolean>(false);
  isCalculating = signal<boolean>(false);

  // Forms
  employeeForm!: FormGroup;

  // Signals derivados dos Serviços
  employees = this.payrollService.employees;
  payrolls = this.payrollService.payrolls;
  payslips = this.payrollService.payslips;
  selectedPayroll = this.payrollService.selectedPayroll;
  isLoading = this.payrollService.isLoading;
  companies = this.companyService.companies;

  // Computeds
  filteredEmployees = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const list = this.employees();
    if (!term) return list;
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.cpf.includes(term) ||
        e.role.toLowerCase().includes(term)
    );
  });

  totalPayrollGross = computed(() => {
    return this.payrolls().reduce((sum, p) => sum + (p.total_gross || 0), 0);
  });

  totalPayrollNet = computed(() => {
    return this.payrolls().reduce((sum, p) => sum + (p.total_net || 0), 0);
  });

  totalINSS = computed(() => {
    return this.payrolls().reduce((sum, p) => sum + (p.total_inss || 0), 0);
  });

  totalFGTS = computed(() => {
    return this.payrolls().reduce((sum, p) => sum + (p.total_fgts || 0), 0);
  });

  constructor() {
    addIcons({
      peopleOutline,
      calculatorOutline,
      documentTextOutline,
      personAddOutline,
      cloudDownloadOutline,
      checkmarkCircleOutline,
      alertCircleOutline,
      cashOutline,
      briefcaseOutline,
      businessOutline,
      searchOutline,
      closeOutline,
      timeOutline,
      walletOutline,
    });
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.loadEmployees();
    this.loadPayrolls();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required]],
      cpf: ['', [Validators.required]],
      email: [''],
      phone: [''],
      type: [EmployeeType.CLT, [Validators.required]],
      role: ['', [Validators.required]],
      department: [''],
      admission_date: [new Date().toISOString().split('T')[0], [Validators.required]],
      base_salary: [0, [Validators.required, Validators.min(0)]],
      dependents_count: [0],
      status: [EmployeeStatus.ACTIVE, [Validators.required]],
      company_id: ['', [Validators.required]],
    });
  }

  loadCompanies(): void {
    this.companyService.loadCompanies().subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0 && !this.selectedCompanyId()) {
          this.selectedCompanyId.set(res.data[0]._id || '');
          this.employeeForm.patchValue({ company_id: res.data[0]._id });
        }
      },
    });
  }

  loadEmployees(): void {
    this.payrollService.getEmployees(this.selectedCompanyId()).subscribe();
  }

  loadPayrolls(): void {
    this.payrollService.getPayrolls(this.selectedCompanyId()).subscribe();
    this.payrollService.getPayslips(this.selectedCompanyId(), this.selectedCompetence()).subscribe();
  }

  onTabChange(tab: any): void {
    this.activeTab.set(tab);
  }

  onCompanyChange(event: any): void {
    const id = event.detail.value;
    this.selectedCompanyId.set(id);
    this.loadEmployees();
    this.loadPayrolls();
  }

  openNewEmployeeModal(): void {
    this.employeeForm.reset({
      type: EmployeeType.CLT,
      status: EmployeeStatus.ACTIVE,
      admission_date: new Date().toISOString().split('T')[0],
      base_salary: 0,
      dependents_count: 0,
      company_id: this.selectedCompanyId(),
    });
    this.isEmployeeModalOpen.set(true);
  }

  closeEmployeeModal(): void {
    this.isEmployeeModalOpen.set(false);
  }

  saveEmployee(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const data = this.employeeForm.getRawValue();
    this.payrollService.saveEmployee(data).subscribe({
      next: () => {
        this.closeEmployeeModal();
        this.loadEmployees();
      },
    });
  }

  calculateMonthlyPayroll(): void {
    if (!this.selectedCompanyId()) return;

    this.isCalculating.set(true);
    this.payrollService
      .calculatePayroll({
        company_id: this.selectedCompanyId(),
        competence: this.selectedCompetence(),
      })
      .subscribe({
        next: () => {
          this.isCalculating.set(false);
          this.loadPayrolls();
        },
        error: () => {
          this.isCalculating.set(false);
        },
      });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }
}
