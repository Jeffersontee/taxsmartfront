import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  calculatorOutline,
  bookOutline,
  receiptOutline,
  trendingUpOutline,
  trendingDownOutline,
  barChartOutline,
  businessOutline,
  addCircleOutline,
  closeOutline,
  cloudDownloadOutline,
  documentTextOutline,
  swapHorizontalOutline,
  walletOutline,
  checkmarkDoneOutline,
} from 'ionicons/icons';
import { CompanyService } from '../../../services/company/company.service';
import { ICompany } from '../../../models/company.model';

import { DocumentVaultComponent } from '../../../components/document-vault/document-vault.component';

export interface IChartOfAccount {
  code: string;
  name: string;
  type: 'ATIVO' | 'PASSIVO' | 'PATRIMONIO' | 'RECEITA' | 'DESPESA';
  nature: 'DEVEDORA' | 'CREDORA';
  level: number;
}

export interface IJournalEntry {
  id: string;
  date: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  history: string;
  documentRef?: string;
}

@Component({
  selector: 'app-admin-accounting',
  templateUrl: './admin-accounting.component.html',
  styleUrls: ['./admin-accounting.component.scss'],
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
    DocumentVaultComponent,
  ],
})
export class AdminAccountingComponent implements OnInit {
  private companyService = inject(CompanyService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  // Signals
  companies = signal<ICompany[]>([]);
  selectedCompanyId = signal<string>('');
  selectedCompetence = signal<string>('10/2026');
  activeTab = signal<'entries' | 'chart' | 'trial_balance' | 'dre' | 'documents'>('entries');
  isModalOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  // Form de Lançamento Contábil (Partidas Dobradas)
  entryForm!: FormGroup;

  // Mock Lançamentos do Mês
  journalEntries = signal<IJournalEntry[]>([
    {
      id: 'LNC-001',
      date: '2026-10-05',
      debitAccount: '1.1.1.02 - Bancos Conta Movimento',
      creditAccount: '3.1.1.01 - Receita de Serviços Prestados',
      amount: 45000.0,
      history: 'Recebimento NFSe 1024 - TechCorp Solutions',
      documentRef: 'NFSe 1024',
    },
    {
      id: 'LNC-002',
      date: '2026-10-07',
      debitAccount: '4.1.2.01 - Despesas com Salários e Pró-labore',
      creditAccount: '2.1.2.01 - Salários e Pró-labore a Pagar',
      amount: 18500.0,
      history: 'Apropriação da folha de pagamento competência 10/2026',
    },
    {
      id: 'LNC-003',
      date: '2026-10-10',
      debitAccount: '4.1.3.05 - Despesas com Aluguel e Condomínio',
      creditAccount: '1.1.1.02 - Bancos Conta Movimento',
      amount: 3200.0,
      history: 'Pagamento aluguel sede administrativa',
      documentRef: 'DOC-882',
    },
    {
      id: 'LNC-004',
      date: '2026-10-14',
      debitAccount: '4.1.1.02 - Simples Nacional / Tributos Incidentes',
      creditAccount: '2.1.3.01 - DAS a Recolher',
      amount: 2700.0,
      history: 'Provisão do Simples Nacional competência 10/2026',
    },
  ]);

  // Plano de Contas SPED Referencial
  chartOfAccounts = signal<IChartOfAccount[]>([
    { code: '1', name: 'ATIVO TOTAL', type: 'ATIVO', nature: 'DEVEDORA', level: 1 },
    { code: '1.1', name: 'Ativo Circulante', type: 'ATIVO', nature: 'DEVEDORA', level: 2 },
    { code: '1.1.1.01', name: 'Caixa Geral', type: 'ATIVO', nature: 'DEVEDORA', level: 3 },
    { code: '1.1.1.02', name: 'Bancos Conta Movimento', type: 'ATIVO', nature: 'DEVEDORA', level: 3 },
    { code: '1.1.2.01', name: 'Clientes / Contas a Receber', type: 'ATIVO', nature: 'DEVEDORA', level: 3 },
    { code: '2', name: 'PASSIVO E PATRIMÔNIO LÍQUIDO', type: 'PASSIVO', nature: 'CREDORA', level: 1 },
    { code: '2.1', name: 'Passivo Circulante', type: 'PASSIVO', nature: 'CREDORA', level: 2 },
    { code: '2.1.2.01', name: 'Salários e Pró-labore a Pagar', type: 'PASSIVO', nature: 'CREDORA', level: 3 },
    { code: '2.1.3.01', name: 'Tributos e DAS a Recolher', type: 'PASSIVO', nature: 'CREDORA', level: 3 },
    { code: '2.3.1.01', name: 'Capital Social Subscrito', type: 'PATRIMONIO', nature: 'CREDORA', level: 3 },
    { code: '3', name: 'RECEITAS OPERACIONAIS', type: 'RECEITA', nature: 'CREDORA', level: 1 },
    { code: '3.1.1.01', name: 'Receita de Serviços Prestados', type: 'RECEITA', nature: 'CREDORA', level: 3 },
    { code: '4', name: 'CUSTOS E DESPESAS OPERACIONAIS', type: 'DESPESA', nature: 'DEVEDORA', level: 1 },
    { code: '4.1.2.01', name: 'Despesas com Salários e Pró-labore', type: 'DESPESA', nature: 'DEVEDORA', level: 3 },
    { code: '4.1.3.05', name: 'Despesas com Aluguel e Condomínio', type: 'DESPESA', nature: 'DEVEDORA', level: 3 },
  ]);

  // Computeds
  totalDebits = computed(() => this.journalEntries().reduce((acc, cur) => acc + cur.amount, 0));
  totalCredits = computed(() => this.journalEntries().reduce((acc, cur) => acc + cur.amount, 0));
  totalEntriesCount = computed(() => this.journalEntries().length);

  constructor() {
    addIcons({
      calculatorOutline,
      bookOutline,
      receiptOutline,
      trendingUpOutline,
      trendingDownOutline,
      barChartOutline,
      businessOutline,
      addCircleOutline,
      closeOutline,
      cloudDownloadOutline,
      documentTextOutline,
      swapHorizontalOutline,
      walletOutline,
      checkmarkDoneOutline,
    });
    this.initForm();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['companyId']) {
        this.selectedCompanyId.set(params['companyId']);
        this.activeTab.set('documents');
      }
      if (params['competence']) {
        this.selectedCompetence.set(params['competence']);
      }
      if (params['tab']) {
        this.activeTab.set(params['tab']);
      }
    });
    this.loadCompanies();
  }

  initForm(): void {
    this.entryForm = this.fb.group({
      date: [new Date().toISOString().substring(0, 10), [Validators.required]],
      debitAccount: ['', [Validators.required]],
      creditAccount: ['', [Validators.required]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      history: ['', [Validators.required]],
      documentRef: [''],
    });
  }

  loadCompanies(): void {
    this.companyService.getCompanies().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.companies.set(res.data);
          this.selectedCompanyId.set(res.data[0]._id);
        }
      },
    });
  }

  onCompanyChange(event: any): void {
    this.selectedCompanyId.set(event.detail.value);
  }

  openEntryModal(): void {
    this.entryForm.reset({
      date: new Date().toISOString().substring(0, 10),
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveEntry(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

    const raw = this.entryForm.getRawValue();
    const newEntry: IJournalEntry = {
      id: `LNC-${String(this.journalEntries().length + 1).padStart(3, '0')}`,
      date: raw.date,
      debitAccount: raw.debitAccount,
      creditAccount: raw.creditAccount,
      amount: Number(raw.amount),
      history: raw.history,
      documentRef: raw.documentRef,
    };

    this.journalEntries.update((list) => [newEntry, ...list]);
    this.closeModal();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  }
}
