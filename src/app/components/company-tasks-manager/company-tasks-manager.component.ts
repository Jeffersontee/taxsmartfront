import { Component, OnInit, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonBadge,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  businessOutline,
  copyOutline,
  trashOutline,
  addOutline,
  chevronDownOutline,
  chevronForwardOutline,
  warningOutline,
  checkmarkCircleOutline,
  personOutline,
  flashOutline,
  refreshOutline,
  searchOutline,
  calendarOutline,
  shieldCheckmarkOutline,
  saveOutline,
  informationCircleOutline,
  documentTextOutline,
  ribbonOutline,
  keyOutline,
  checkmarkOutline,
  createOutline,
} from 'ionicons/icons';
import { CompanyService } from '../../services/company/company.service';
import { StaffService } from '../../services/staff/staff.service';
import { ICompany, TaxRegime } from '../../models/company.model';

@Component({
  selector: 'app-company-tasks-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonBadge,
  ],
  templateUrl: './company-tasks-manager.component.html',
  styleUrls: ['./company-tasks-manager.component.scss'],
})
export class CompanyTasksManagerComponent implements OnInit {
  companyService = inject(CompanyService);
  staffService = inject(StaffService);
  private toastCtrl = inject(ToastController);
  private alertCtrl = inject(AlertController);

  // Inputs & Outputs
  isOpen = input<boolean>(false);
  company = input<ICompany | null>(null);
  initialTab = input<string>('detalhes');
  closed = output<void>();
  tasksUpdated = output<void>();

  // Abas estilo Gestta: 'detalhes' | 'responsaveis' | 'tarefas' | 'senhas' | 'cnaes' | 'certidoes' | 'geracao'
  activeTab = signal<string>('detalhes');

  // Estado Geral
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // Form de Detalhes (Fiel ao Gestta - Print 3)
  docType = signal<string>('CNPJ');
  cnpj = signal<string>('');
  stateRegistration = signal<string>('');
  municipalRegistration = signal<string>('');
  isDominoIntegrated = signal<boolean>(true);
  code = signal<string>('648');
  corporateName = signal<string>('');
  tradeName = signal<string>('');
  taxRegime = signal<TaxRegime>(TaxRegime.SIMPLES_NACIONAL);
  regimeEstadual = signal<string>('SIMPLES NACIONAL ESTADUAL');
  regimeMunicipal = signal<string>('TOM/PREST');
  openingDate = signal<string>('');
  notes = signal<string>('');
  notifyClient = signal<boolean>(true);
  active = signal<boolean>(true);
  allowLooseDocumentUpload = signal<boolean>(false); // Default: Desativado por padrão conforme solicitado

  // Informações de Pagamento
  monthlyPayment = signal<string>('');
  paymentDueDay = signal<number | null>(null);
  dueDaysList: number[] = Array.from({ length: 31 }, (_, i) => i + 1);

  // Endereço
  zipCode = signal<string>('');
  street = signal<string>('');
  number = signal<string>('');
  complement = signal<string>('');
  neighborhood = signal<string>('');
  city = signal<string>('');
  state = signal<string>('');

  // Responsáveis por Departamento da Empresa
  fiscalResponsibleId = signal<string>('');
  accountingResponsibleId = signal<string>('');
  payrollResponsibleId = signal<string>('');
  legalResponsibleId = signal<string>('');

  // Estado das Tarefas (Dual Listbox)
  systemTasks = signal<any[]>([]);
  companyTasks = signal<any[]>([]);

  // Filtros de Busca
  searchSystem = signal<string>('');
  searchCompany = signal<string>('');

  // Seleção Múltipla (Checkboxes)
  selectedSystemIds = signal<Set<string>>(new Set<string>());
  selectedCompanyIds = signal<Set<string>>(new Set<string>());

  // Atribuição Rápida de Responsável em Lote
  batchResponsibleId = signal<string>('');

  // Accordions de Cópia
  isCopyFromOpen = signal<boolean>(false);
  isCopyToOpen = signal<boolean>(false);
  copyFromCompanyId = signal<string>('');
  copyFromDept = signal<string>('Todos os departamentos');
  copyToCompanyIds = signal<string[]>([]);
  copyToDept = signal<string>('Todos os departamentos');

  // Geração de Tarefas na Competência
  generationCompetence = signal<string>('10/2026');

  // Departamentos disponíveis
  departmentsList = [
    'Todos os departamentos',
    'Fiscal',
    'Contábil',
    'Folha',
    'Legalização',
    'Societário',
    'Financeiro',
  ];

  taxRegimesList = [
    { value: TaxRegime.SIMPLES_NACIONAL, label: 'SIMPLES NACIONAL' },
    { value: TaxRegime.LUCRO_PRESUMIDO, label: 'LUCRO PRESUMIDO' },
    { value: TaxRegime.LUCRO_REAL, label: 'LUCRO REAL' },
    { value: TaxRegime.MEI, label: 'MEI (MICROEMPREENDEDOR INDIVIDUAL)' },
  ];

  // Computeds: Tarefas do Sistema Filtradas
  filteredSystemTasks = computed(() => {
    const term = this.searchSystem().toLowerCase().trim();
    const list = this.systemTasks();
    if (!term) return list;
    return list.filter(
      (t) =>
        t.name?.toLowerCase().includes(term) ||
        t.department?.toLowerCase().includes(term) ||
        t.category?.toLowerCase().includes(term)
    );
  });

  // Computeds: Tarefas do Cliente Filtradas
  filteredCompanyTasks = computed(() => {
    const term = this.searchCompany().toLowerCase().trim();
    const list = this.companyTasks();
    if (!term) return list;
    return list.filter(
      (t) =>
        t.name?.toLowerCase().includes(term) ||
        t.department?.toLowerCase().includes(term)
    );
  });

  constructor() {
    addIcons({
      closeOutline,
      businessOutline,
      copyOutline,
      trashOutline,
      addOutline,
      chevronDownOutline,
      chevronForwardOutline,
      warningOutline,
      checkmarkCircleOutline,
      personOutline,
      flashOutline,
      refreshOutline,
      searchOutline,
      calendarOutline,
      shieldCheckmarkOutline,
      saveOutline,
      informationCircleOutline,
      documentTextOutline,
      ribbonOutline,
      keyOutline,
      checkmarkOutline,
      createOutline,
    });
  }

  ngOnInit(): void {
    this.staffService.loadStaffMembers().subscribe();
  }

  onModalOpen(): void {
    const comp = this.company();
    if (!comp?._id) return;

    this.activeTab.set(this.initialTab() || 'detalhes');

    // Popula campos da aba Detalhes
    this.code.set(comp.code || '648');
    this.cnpj.set(comp.cnpj || '');
    this.stateRegistration.set(comp.stateRegistration || '');
    this.municipalRegistration.set(comp.municipalRegistration || '');
    this.corporateName.set(comp.corporateName || '');
    this.tradeName.set(comp.tradeName || '');
    this.taxRegime.set(comp.taxRegime || TaxRegime.SIMPLES_NACIONAL);
    this.regimeEstadual.set(comp.regimeEstadual || 'SIMPLES NACIONAL ESTADUAL');
    this.regimeMunicipal.set(comp.regimeMunicipal || 'TOM/PREST');
    this.openingDate.set(comp.openingDate ? String(comp.openingDate).substring(0, 10) : '2018-07-06');
    this.notes.set(comp.notes || '');
    this.notifyClient.set(comp.notifyClient !== false);
    this.active.set(comp.active !== false);
    this.allowLooseDocumentUpload.set(comp.allowLooseDocumentUpload === true);
    this.monthlyPayment.set(comp.monthlyPayment ? String(comp.monthlyPayment) : '');
    this.paymentDueDay.set(comp.paymentDueDay !== undefined && comp.paymentDueDay !== null ? Number(comp.paymentDueDay) : null);

    if (comp.address) {
      this.zipCode.set(comp.address.zipCode || '');
      this.street.set(comp.address.street || '');
      this.number.set(comp.address.number || '');
      this.complement.set(comp.address.complement || '');
      this.neighborhood.set(comp.address.neighborhood || '');
      this.city.set(comp.address.city || '');
      this.state.set(comp.address.state || '');
    }

    if (comp.assignedResponsibles) {
      this.fiscalResponsibleId.set(String(comp.assignedResponsibles.fiscalResponsibleId?._id || comp.assignedResponsibles.fiscalResponsibleId || ''));
      this.accountingResponsibleId.set(String(comp.assignedResponsibles.accountingResponsibleId?._id || comp.assignedResponsibles.accountingResponsibleId || ''));
      this.payrollResponsibleId.set(String(comp.assignedResponsibles.payrollResponsibleId?._id || comp.assignedResponsibles.payrollResponsibleId || ''));
      this.legalResponsibleId.set(String(comp.assignedResponsibles.legalResponsibleId?._id || comp.assignedResponsibles.legalResponsibleId || ''));
    }

    this.loadTasksData();
  }

  saveCompanyDetails(): void {
    const comp = this.company();
    if (!comp?._id) return;

    this.isSaving.set(true);
    const payload: Partial<ICompany> = {
      code: this.code(),
      corporateName: this.corporateName(),
      tradeName: this.tradeName(),
      cnpj: this.cnpj(),
      taxRegime: this.taxRegime(),
      regimeEstadual: this.regimeEstadual(),
      regimeMunicipal: this.regimeMunicipal(),
      stateRegistration: this.stateRegistration(),
      municipalRegistration: this.municipalRegistration(),
      openingDate: this.openingDate(),
      notes: this.notes(),
      notifyClient: this.notifyClient(),
      active: this.active(),
      allowLooseDocumentUpload: this.allowLooseDocumentUpload(),
      monthlyPayment: this.monthlyPayment() || undefined,
      paymentDueDay: this.paymentDueDay() ? Number(this.paymentDueDay()) : undefined,
      address: {
        zipCode: this.zipCode(),
        street: this.street(),
        number: this.number(),
        complement: this.complement(),
        neighborhood: this.neighborhood(),
        city: this.city(),
        state: this.state(),
      },
    };

    this.companyService.updateCompany(comp._id, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showToast('Informações cadastrais e política de documentos salvas com sucesso!', 'success');
        this.tasksUpdated.emit();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showToast(err?.error?.error?.message || 'Falha ao salvar dados cadastrais.', 'danger');
      },
    });
  }

  deleteCompany(): void {
    const comp = this.company();
    if (!comp?._id) return;
    if (!confirm(`Deseja realmente inativar/excluir a empresa ${comp.tradeName || comp.corporateName}?`)) return;

    this.isSaving.set(true);
    this.companyService.deleteCompany(comp._id).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showToast('Empresa excluída com sucesso!', 'success');
        this.tasksUpdated.emit();
        this.close();
      },
      error: () => {
        this.isSaving.set(false);
        this.showToast('Erro ao excluir empresa.', 'danger');
      },
    });
  }

  saveCompanyResponsibles(): void {
    const comp = this.company();
    if (!comp?._id) return;

    this.isSaving.set(true);
    const payload = {
      assignedResponsibles: {
        fiscalResponsibleId: this.fiscalResponsibleId() || undefined,
        accountingResponsibleId: this.accountingResponsibleId() || undefined,
        payrollResponsibleId: this.payrollResponsibleId() || undefined,
        legalResponsibleId: this.legalResponsibleId() || undefined,
      },
    };

    this.companyService.updateCompany(comp._id, payload as any).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.showToast('Responsáveis da equipe contábil atribuídos com sucesso ao cliente!', 'success');
        this.tasksUpdated.emit();
      },
      error: () => {
        this.isSaving.set(false);
        this.showToast('Erro ao salvar responsáveis da empresa.', 'danger');
      },
    });
  }

  toggleCopyFrom(): void {
    this.isCopyFromOpen.update((v) => !v);
  }

  toggleCopyTo(): void {
    this.isCopyToOpen.update((v) => !v);
  }

  loadTasksData(): void {
    const comp = this.company();
    if (!comp?._id) return;

    this.isLoading.set(true);
    this.selectedSystemIds.set(new Set());
    this.selectedCompanyIds.set(new Set());

    this.companyService.getCompanyTasks(comp._id).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.systemTasks.set(res.data.systemTasks || []);
          this.companyTasks.set(res.data.companyTasks || []);
        }
      },
      error: () => this.isLoading.set(false),
    });
  }

  // Alternar Seleção de Item no Sistema (Lado Esquerdo)
  toggleSelectSystem(templateId: string): void {
    const current = new Set(this.selectedSystemIds());
    if (current.has(templateId)) {
      current.delete(templateId);
    } else {
      current.add(templateId);
    }
    this.selectedSystemIds.set(current);
  }

  isSystemSelected(templateId: string): boolean {
    return this.selectedSystemIds().has(templateId);
  }

  toggleSelectAllSystem(): void {
    const all = this.filteredSystemTasks();
    const current = this.selectedSystemIds();
    if (current.size === all.length && all.length > 0) {
      this.selectedSystemIds.set(new Set());
    } else {
      this.selectedSystemIds.set(new Set(all.map((t) => t.templateId || t._id)));
    }
  }

  // Alternar Seleção de Item no Cliente (Lado Direito)
  toggleSelectCompany(id: string): void {
    const current = new Set(this.selectedCompanyIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedCompanyIds.set(current);
  }

  isCompanySelected(id: string): boolean {
    return this.selectedCompanyIds().has(id);
  }

  toggleSelectAllCompany(): void {
    const all = this.filteredCompanyTasks();
    const current = this.selectedCompanyIds();
    if (current.size === all.length && all.length > 0) {
      this.selectedCompanyIds.set(new Set());
    } else {
      this.selectedCompanyIds.set(new Set(all.map((t) => t.templateId || t._id)));
    }
  }

  // Adicionar Tarefas Selecionadas à Empresa (Esquerda -> Direita)
  addSelectedTasks(): void {
    const comp = this.company();
    const selectedIds = Array.from(this.selectedSystemIds());
    if (!comp?._id || selectedIds.length === 0) return;

    this.isSaving.set(true);
    this.companyService.assignTasksToCompany(comp._id, selectedIds).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.showToast(res.message || `${selectedIds.length} tarefas vinculadas à empresa!`, 'success');
        this.loadTasksData();
        this.tasksUpdated.emit();
      },
      error: () => this.isSaving.set(false),
    });
  }

  addSelectedToCompany(): void {
    this.addSelectedTasks();
  }

  // Excluir Tarefas Selecionadas da Empresa (Direita -> Esquerda)
  removeSelectedTasks(): void {
    const comp = this.company();
    const selectedIds = Array.from(this.selectedCompanyIds());
    if (!comp?._id || selectedIds.length === 0) return;

    this.isSaving.set(true);
    this.companyService.removeTasksFromCompany(comp._id, selectedIds).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.showToast(res.message || `${selectedIds.length} tarefas removidas da empresa.`, 'success');
        this.loadTasksData();
        this.tasksUpdated.emit();
      },
      error: () => this.isSaving.set(false),
    });
  }

  removeSelectedFromCompany(): void {
    this.removeSelectedTasks();
  }

  // Atribuição de Responsável em Lote para Tarefas Selecionadas
  applyBatchResponsible(respId: string): void {
    const comp = this.company();
    const selectedIds = Array.from(this.selectedCompanyIds());
    if (!comp?._id || selectedIds.length === 0 || !respId) return;

    this.isSaving.set(true);
    let done = 0;
    selectedIds.forEach((tmplId) => {
      this.companyService.updateCompanyTask(comp._id, tmplId, { responsibleId: respId }).subscribe({
        next: () => {
          done++;
          if (done === selectedIds.length) {
            this.isSaving.set(false);
            this.showToast('Responsável atribuído em lote para as tarefas selecionadas!', 'success');
            this.loadTasksData();
          }
        },
        error: () => this.isSaving.set(false),
      });
    });
  }

  // Atualizar Responsável de uma Tarefa do Cliente
  changeResponsible(taskItem: any, responsibleId: string): void {
    const comp = this.company();
    if (!comp?._id) return;

    this.companyService.updateCompanyTask(comp._id, taskItem.templateId || taskItem._id, {
      responsibleId: responsibleId || undefined,
      requiresApproval: taskItem.requiresApproval,
    }).subscribe({
      next: () => this.showToast('Responsável da tarefa atualizado com sucesso!', 'success'),
    });
  }

  onResponsibleChange(taskItem: any, responsibleId: string): void {
    this.changeResponsible(taskItem, responsibleId);
  }

  // Alternar Toggle de Aprovação Necessária
  toggleApproval(taskItem: any): void {
    const comp = this.company();
    if (!comp?._id) return;

    const newVal = !taskItem.requiresApproval;
    taskItem.requiresApproval = newVal;

    this.companyService.updateCompanyTask(comp._id, taskItem.templateId || taskItem._id, {
      requiresApproval: newVal,
      responsibleId: taskItem.responsibleId?._id || taskItem.responsibleId,
    }).subscribe({
      next: () => this.showToast(`Aprovação necessária: ${newVal ? 'Ativada' : 'Desativada'}`),
    });
  }

  onToggleApproval(taskItem: any, val?: boolean): void {
    const comp = this.company();
    if (!comp?._id) return;

    const newVal = val !== undefined ? val : !taskItem.requiresApproval;
    taskItem.requiresApproval = newVal;

    this.companyService.updateCompanyTask(comp._id, taskItem.templateId || taskItem._id, {
      requiresApproval: newVal,
      responsibleId: taskItem.responsibleId?._id || taskItem.responsibleId,
    }).subscribe({
      next: () => this.showToast(`Aprovação necessária: ${newVal ? 'Ativada' : 'Desativada'}`),
    });
  }

  // Copiar tarefas de outro cliente para este como modelo
  submitCopyFrom(): void {
    const comp = this.company();
    const sourceId = this.copyFromCompanyId();
    if (!comp?._id || !sourceId) {
      this.showToast('Selecione o cliente de origem.', 'warning');
      return;
    }

    this.isSaving.set(true);
    this.companyService.copyTasksFromAnotherCompany(comp._id, sourceId, this.copyFromDept()).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.isCopyFromOpen.set(false);
        this.showToast(res.message || 'Tarefas copiadas com sucesso!', 'success');
        this.loadTasksData();
        this.tasksUpdated.emit();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showToast(err?.error?.error?.message || 'Erro ao copiar tarefas.', 'danger');
      },
    });
  }

  // Copiar tarefas deste cliente para outros como modelo
  submitCopyTo(): void {
    const comp = this.company();
    const targets = this.copyToCompanyIds();
    if (!comp?._id || targets.length === 0) {
      this.showToast('Selecione ao menos uma empresa de destino.', 'warning');
      return;
    }

    this.isSaving.set(true);
    this.companyService.copyTasksToOtherCompanies(comp._id, targets, this.copyToDept()).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.isCopyToOpen.set(false);
        this.showToast(res.message || 'Tarefas replicadas para os clientes selecionados!', 'success');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showToast(err?.error?.error?.message || 'Erro ao replicar tarefas.', 'danger');
      },
    });
  }

  // Gerar Tarefas na Esteira para a Competência
  generateCompetenceTasks(): void {
    const comp = this.company();
    if (!comp?._id) return;

    this.isSaving.set(true);
    this.companyService.generateTasksFromAssigned(comp._id, this.generationCompetence()).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        this.showToast(res.message || 'Tarefas geradas com sucesso na Linha do Tempo!', 'success');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.showToast(err?.error?.error?.message || 'Erro ao gerar tarefas.', 'danger');
      },
    });
  }

  close(): void {
    this.closed.emit();
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success'): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });
    await t.present();
  }
}
