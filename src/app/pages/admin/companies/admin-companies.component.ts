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
  IonSearchbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  businessOutline,
  addCircleOutline,
  searchOutline,
  personOutline,
  mailOutline,
  callOutline,
  locationOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  closeOutline,
  shieldCheckmarkOutline,
  cashOutline,
  createOutline,
} from 'ionicons/icons';
import { CompanyService } from '../../../services/company/company.service';
import { ICompany, TaxRegime } from '../../../models/company.model';

@Component({
  selector: 'app-admin-companies',
  templateUrl: './admin-companies.component.html',
  styleUrls: ['./admin-companies.component.scss'],
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
    IonSearchbar,
  ],
})
export class AdminCompaniesComponent implements OnInit {
  private companyService = inject(CompanyService);
  private fb = inject(FormBuilder);

  // Signals
  companies = signal<ICompany[]>([]);
  isLoading = signal<boolean>(false);
  searchTerm = signal<string>('');
  selectedFilterRegime = signal<string>('ALL');
  isModalOpen = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // Form
  companyForm!: FormGroup;

  // Computeds
  filteredCompanies = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const regime = this.selectedFilterRegime();

    return this.companies().filter((c) => {
      const matchesTerm =
        !term ||
        c.corporateName?.toLowerCase().includes(term) ||
        c.tradeName?.toLowerCase().includes(term) ||
        c.cnpj?.includes(term);

      const matchesRegime = regime === 'ALL' || c.taxRegime === regime;

      return matchesTerm && matchesRegime;
    });
  });

  totalCompanies = computed(() => this.companies().length);
  simplesCount = computed(() => this.companies().filter((c) => c.taxRegime === TaxRegime.SIMPLES_NACIONAL).length);
  presumidoCount = computed(() => this.companies().filter((c) => c.taxRegime === TaxRegime.LUCRO_PRESUMIDO).length);
  realCount = computed(() => this.companies().filter((c) => c.taxRegime === TaxRegime.LUCRO_REAL).length);

  constructor() {
    addIcons({
      businessOutline,
      addCircleOutline,
      searchOutline,
      personOutline,
      mailOutline,
      callOutline,
      locationOutline,
      documentTextOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      closeOutline,
      shieldCheckmarkOutline,
      cashOutline,
      createOutline,
    });
    this.initForm();
  }

  ngOnInit(): void {
    this.loadCompanies();
  }

  initForm(): void {
    this.companyForm = this.fb.group({
      corporateName: ['', [Validators.required]],
      tradeName: ['', [Validators.required]],
      cnpj: ['', [Validators.required]],
      taxRegime: [TaxRegime.SIMPLES_NACIONAL, [Validators.required]],
      cnaePrincipal: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['SP', [Validators.required]],
      zipCode: ['', [Validators.required]],
      partnerName: ['', [Validators.required]],
      partnerCpf: ['', [Validators.required]],
      partnerEmail: [''],
    });
  }

  loadCompanies(): void {
    this.isLoading.set(true);
    this.companyService.getCompanies().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.companies.set(res.data);
        }
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(event: any): void {
    this.searchTerm.set(event.detail.value || '');
  }

  onRegimeFilterChange(event: any): void {
    this.selectedFilterRegime.set(event.detail.value || 'ALL');
  }

  openNewCompanyModal(): void {
    this.companyForm.reset({
      taxRegime: TaxRegime.SIMPLES_NACIONAL,
      state: 'SP',
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveCompany(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const raw = this.companyForm.getRawValue();

    const payload = {
      corporateName: raw.corporateName,
      tradeName: raw.tradeName,
      cnpj: raw.cnpj,
      taxRegime: raw.taxRegime,
      cnaePrincipal: raw.cnaePrincipal,
      email: raw.email,
      phone: raw.phone,
      address: {
        street: raw.street,
        number: raw.number,
        neighborhood: raw.neighborhood,
        city: raw.city,
        state: raw.state,
        zipCode: raw.zipCode,
      },
      partners: [
        {
          name: raw.partnerName,
          cpf: raw.partnerCpf,
          email: raw.partnerEmail,
          isResponsible: true,
          quotaPercentage: 100,
        },
      ],
      active: true,
    };

    this.companyService.createCompany(payload as any).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadCompanies();
      },
      error: () => {
        this.isSaving.set(false);
      },
    });
  }

  getRegimeBadgeClass(regime: string): string {
    switch (regime) {
      case TaxRegime.SIMPLES_NACIONAL:
        return 'badge-simples';
      case TaxRegime.LUCRO_PRESUMIDO:
        return 'badge-presumido';
      case TaxRegime.LUCRO_REAL:
        return 'badge-real';
      default:
        return 'badge-default';
    }
  }

  formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length === 14) {
      return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  }
}
