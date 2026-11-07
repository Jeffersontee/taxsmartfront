import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonProgressBar,
  IonToast,
  AlertController,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  checkmarkCircleOutline,
  alertCircle,
  alertCircleOutline,
  timeOutline,
  closeCircle,
  calendarOutline,
  businessOutline,
  chatbubblesOutline,
  documentAttachOutline,
  filterOutline,
  chevronForwardOutline,
  warningOutline,
  refreshOutline,
  copyOutline,
  downloadOutline,
  barcodeOutline,
  flashOutline,
  layersOutline,
  shieldCheckmarkOutline,
  cloudUploadOutline,
  folderOpenOutline,
  addOutline,
  checkboxOutline,
  squareOutline,
  personCircleOutline,
  playOutline,
  pauseOutline,
  stopwatchOutline,
  sendOutline,
  documentTextOutline,
  mailOutline,
  chatboxEllipsesOutline,
  banOutline,
  gridOutline,
  listOutline,
  chevronDownOutline,
  chevronUpOutline,
  contractOutline,
  expandOutline,
  informationCircleOutline,
  createOutline,
} from 'ionicons/icons';
import { TaskService } from '../../../services/task/task.service';
import { CompanyService } from '../../../services/company/company.service';
import { StaffService } from '../../../services/staff/staff.service';
import { AuthService } from '../../../services/auth/auth.service';
import { DocumentService } from '../../../services/document/document.service';
import { TaskStatus, TaskCategory, ITask, ITaskChecklist, ITaskRequiredDocument } from '../../../models/task.model';
import { TaskCreateModalComponent } from '../../../components/task-create-modal/task-create-modal.component';

@Component({
  standalone: true,
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonButton,
    IonIcon,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonSpinner,
    IonSelect,
    IonSelectOption,
    IonProgressBar,
    IonToast,
    TaskCreateModalComponent,
  ],
})
export class TimelineComponent implements OnInit, OnDestroy {
  taskService = inject(TaskService);
  companyService = inject(CompanyService);
  staffService = inject(StaffService);
  authService = inject(AuthService);
  documentService = inject(DocumentService);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);

  readonly TaskStatus = TaskStatus;
  readonly TaskCategory = TaskCategory;

  readonly competences = ['10/2026', '09/2026', '08/2026', '07/2026', '06/2026'];
  readonly categories = [
    { label: 'Todas as Categorias', value: '' },
    { label: 'Fiscal / Tributário', value: TaskCategory.FISCAL },
    { label: 'Contábil / Balancetes', value: TaskCategory.CONTABIL },
    { label: 'Folha de Pagamento / DP', value: TaskCategory.FOLHA },
    { label: 'Legalização / Societário', value: TaskCategory.LEGALIZACAO },
    { label: 'Financeiro / BPO', value: TaskCategory.FINANCEIRO },
  ];

  // Visualização: 'gestta' (3 Colunas) ou 'feed' (Linha do Tempo)
  viewMode = signal<'gestta' | 'feed'>('gestta');

  // Estado do Modal de Criação
  isCreateModalOpen = signal<boolean>(false);

  // Controle de Acordeom / Sanfona (As 6 Sanfonas Fiéis ao Gestta)
  isUsersAccordionOpen = signal<boolean>(false);
  isEmailsAccordionOpen = signal<boolean>(false);
  isDocsAccordionOpen = signal<boolean>(true);
  isNoAttachmentAccordionOpen = signal<boolean>(false);
  isChecklistAccordionOpen = signal<boolean>(true);
  isAssociatedAccordionOpen = signal<boolean>(false);
  isSummaryCollapsed = signal<boolean>(false);

  // Usuários de Cliente
  clientUsers = signal<any[]>([]);
  isLoadingClientUsers = signal<boolean>(false);

  // Aba ativa no modo Mobile
  mobileActiveTab = signal<'list' | 'detail' | 'chat'>('detail');

  // Tarefa selecionada no painel 3 colunas
  selectedTaskId = signal<string>('');

  // Chat / Mensagens
  chatInput = signal<string>('');

  // Cronômetro de Apontamento
  timerSeconds = signal<number>(0);
  isTimerRunning = signal<boolean>(false);
  private timerInterval: any = null;

  // Toast
  toastMessage = signal<string>('');
  isToastOpen = signal<boolean>(false);

  // Computeds
  isAccountant = computed(() => this.authService.isAccountant());

  // Tarefa ativa detalhada
  activeTask = computed(() => {
    const selectedId = this.selectedTaskId();
    const tasks = this.taskService.filteredTasks();
    if (selectedId) {
      const found = tasks.find((t) => t._id === selectedId);
      if (found) return found;
    }
    // Fallback para a primeira tarefa da lista
    return tasks.length > 0 ? tasks[0] : null;
  });

  // Progresso do Checklist da Tarefa Ativa
  checklistProgress = computed(() => {
    const task = this.activeTask();
    if (!task || !task.checklist || task.checklist.length === 0) {
      return { total: 0, completed: 0, percent: 0 };
    }
    const total = task.checklist.length;
    const completed = task.checklist.filter((i) => i.completed).length;
    const percent = Math.round((completed / total) * 100);
    return { total, completed, percent };
  });

  // Tarefas associadas da mesma empresa e competência (Accordion Tarefas Associadas)
  associatedTasks = computed(() => {
    const task = this.activeTask();
    if (!task) return [];
    const compId = task.companyId?._id || task.companyId;
    return this.taskService.tasks().filter(
      (t) => (t.companyId?._id === compId || t.companyId === compId) && t._id !== task._id && t.competence === task.competence
    );
  });

  constructor() {
    addIcons({
      checkmarkCircle,
      checkmarkCircleOutline,
      alertCircle,
      alertCircleOutline,
      timeOutline,
      closeCircle,
      calendarOutline,
      businessOutline,
      chatbubblesOutline,
      documentAttachOutline,
      filterOutline,
      chevronForwardOutline,
      warningOutline,
      refreshOutline,
      copyOutline,
      downloadOutline,
      barcodeOutline,
      flashOutline,
      layersOutline,
      shieldCheckmarkOutline,
      cloudUploadOutline,
      folderOpenOutline,
      addOutline,
      checkboxOutline,
      squareOutline,
      personCircleOutline,
      playOutline,
      pauseOutline,
      stopwatchOutline,
      sendOutline,
      documentTextOutline,
      mailOutline,
      chatboxEllipsesOutline,
      banOutline,
      gridOutline,
      listOutline,
      chevronDownOutline,
      chevronUpOutline,
      contractOutline,
      expandOutline,
      informationCircleOutline,
      createOutline,
    });
  }

  ngOnInit(): void {
    if (this.router.url.includes('timeline')) {
      this.viewMode.set('feed');
    } else {
      this.viewMode.set('gestta');
    }
    this.fetchData();
    this.companyService.loadCompanies().subscribe();
    this.staffService.loadStaffMembers().subscribe();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  fetchData(): void {
    this.taskService.loadTasks().subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0 && !this.selectedTaskId()) {
          this.selectedTaskId.set(res.data[0]._id);
        }
      },
    });
    this.taskService.loadSummary().subscribe();
  }

  onCompetenceChange(event: any): void {
    const val = event.detail.value;
    this.taskService.selectedCompetence.set(val);
    this.fetchData();
  }

  onCompanyChange(event: any): void {
    const val = event.detail.value;
    this.taskService.selectedCompanyId.set(val);
    this.fetchData();
  }

  onCategoryChange(event: any): void {
    const val = event.detail.value;
    this.taskService.selectedCategory.set(val);
  }

  onFilterChange(event: any): void {
    const val = event.detail.value;
    this.taskService.selectedStatusFilter.set(val);
  }

  selectTask(task: ITask): void {
    this.selectedTaskId.set(task._id);
    this.mobileActiveTab.set('detail');
    this.loadClientUsers(task._id);
    this.taskService.getById(task._id).subscribe();
  }

  loadClientUsers(taskId: string): void {
    this.isLoadingClientUsers.set(true);
    this.taskService.getClientUsers(taskId).subscribe({
      next: (res) => {
        this.isLoadingClientUsers.set(false);
        this.clientUsers.set(res.data || []);
      },
      error: () => this.isLoadingClientUsers.set(false),
    });
  }

  toggleUsersAccordion(): void {
    this.isUsersAccordionOpen.update((v) => !v);
  }

  toggleEmailsAccordion(): void {
    this.isEmailsAccordionOpen.update((v) => !v);
  }

  toggleDocsAccordion(): void {
    this.isDocsAccordionOpen.update((v) => !v);
  }

  toggleNoAttachmentAccordion(): void {
    this.isNoAttachmentAccordionOpen.update((v) => !v);
  }

  toggleChecklistAccordion(): void {
    this.isChecklistAccordionOpen.update((v) => !v);
  }

  toggleAssociatedAccordion(): void {
    this.isAssociatedAccordionOpen.update((v) => !v);
  }

  toggleSummary(): void {
    this.isSummaryCollapsed.update((v) => !v);
  }

  setMobileTab(tab: 'list' | 'detail' | 'chat'): void {
    this.mobileActiveTab.set(tab);
  }

  openCreateTaskModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateTaskModal(): void {
    this.isCreateModalOpen.set(false);
  }

  onTaskCreated(newTask: ITask): void {
    this.selectedTaskId.set(newTask._id);
    this.taskService.loadSummary().subscribe();
  }

  // Toggle do Checklist
  toggleChecklist(item: ITaskChecklist): void {
    const task = this.activeTask();
    if (!task || !item._id) return;
    this.taskService.toggleChecklist(task._id, item._id, !item.completed).subscribe({
      next: () => {
        this.showToast(item.completed ? 'Item desmarcado.' : 'Item concluído com sucesso!');
      },
      error: (err) => {
        this.showToast(err?.error?.error?.message || 'Erro ao alterar checklist.');
      },
    });
  }

  // Adicionar item ao Checklist dinamicamente
  async promptAddChecklistItem(): Promise<void> {
    const task = this.activeTask();
    if (!task) return;

    const alert = await this.alertCtrl.create({
      header: 'Novo Item de Checklist',
      subHeader: task.title,
      inputs: [
        {
          name: 'title',
          type: 'text',
          placeholder: 'Descrição da etapa ou validação...',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Adicionar',
          handler: (data) => {
            if (!data.title || !data.title.trim()) {
              this.showToast('O título do item não pode ser vazio.');
              return false;
            }
            this.taskService.addChecklistItem(task._id, data.title.trim()).subscribe({
              next: () => this.showToast('Item adicionado ao checklist!'),
              error: (err) => this.showToast(err?.error?.error?.message || 'Erro ao adicionar item.'),
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  // Desconsiderar Documento Requisitado
  async promptDisregardDocument(docReq: ITaskRequiredDocument): Promise<void> {
    const task = this.activeTask();
    if (!task || !docReq._id) return;

    const alert = await this.alertCtrl.create({
      header: 'Desconsiderar Documento Solicitado',
      subHeader: docReq.title,
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Justificativa para desconsiderar a exigência...',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: (data) => {
            this.taskService.disregardRequiredDocument(task._id, docReq._id!, data.reason).subscribe({
              next: () => this.showToast('Documento desconsiderado com justificativa.'),
              error: (err) => this.showToast(err?.error?.error?.message || 'Erro ao desconsiderar.'),
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  // Anexar arquivo ao requisito da tarefa (Upload Real com Multer e Storage)
  triggerUploadForDocument(docReq: ITaskRequiredDocument): void {
    const task = this.activeTask();
    if (!task || !docReq._id) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.xml,.ofx,.xlsx,.xls,.png,.jpg,.jpeg';
    fileInput.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const compId = task.companyId?._id || task.companyId;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('companyId', String(compId));
        formData.append('competence', task.competence || '10/2026');
        formData.append('module', task.category || 'FISCAL');
        formData.append('documentType', docReq.title.toUpperCase());
        formData.append('taskId', task._id);
        if (docReq._id) {
          formData.append('taskDocumentId', docReq._id);
        }

        this.showToast(`Enviando "${file.name}"...`);

        this.documentService.uploadDocument(formData).subscribe({
          next: () => {
            this.showToast(`Arquivo "${file.name}" anexado com sucesso!`);
            this.taskService.getById(task._id).subscribe((res) => {
              if (res.data) {
                this.taskService.tasks.update((list) => list.map((t) => (t._id === task._id ? res.data! : t)));
              }
            });
          },
          error: (err) => {
            this.showToast(err?.error?.error?.message || 'Falha ao anexar arquivo.');
          },
        });
      }
    };
    fileInput.click();
  }

  // Visualização de Arquivo do Documento Solicitado
  openDocFile(docReq: ITaskRequiredDocument): void {
    if (docReq.documentId) {
      window.open(this.documentService.getFileViewUrl(docReq.documentId), '_blank');
      return;
    }
    if (docReq.fileUrl) {
      window.open(docReq.fileUrl, '_blank');
    }
  }

  // Ação Gestta: Recobrar Documentos Pendentes
  recoverDocuments(): void {
    const task = this.activeTask();
    if (!task) return;
    this.taskService.recoverDocuments(task._id).subscribe({
      next: (res) => {
        this.showToast(res.message || 'Recobrança enviada com sucesso aos contatos da empresa!');
      },
      error: (err) => this.showToast(err?.error?.error?.message || 'Erro ao disparar recobrança.'),
    });
  }

  // Cadastrar E-mail em Cópia (Accordion E-mails Adicionais)
  async promptAddAdditionalEmail(): Promise<void> {
    const task = this.activeTask();
    if (!task) return;

    const alert = await this.alertCtrl.create({
      header: 'Cadastrar E-mail em Cópia',
      subHeader: 'Este e-mail receberá notificações sobre o trâmite desta tarefa.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'exemplo@cliente.com.br',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cadastrar',
          handler: (data) => {
            if (!data.email || !data.email.includes('@')) {
              this.showToast('Informe um e-mail válido.');
              return false;
            }
            this.taskService.addAdditionalEmail(task._id, data.email).subscribe({
              next: () => this.showToast(`E-mail ${data.email} cadastrado com sucesso!`),
              error: (err) => this.showToast(err?.error?.error?.message || 'Erro ao cadastrar e-mail.'),
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  // Alterar Notificação via E-mail
  toggleNotifyEmail(): void {
    const task = this.activeTask();
    if (!task) return;
    const newVal = !task.notifyClientEmail;
    this.taskService.updateTask(task._id, { notifyClientEmail: newVal }).subscribe({
      next: () => this.showToast(`Notificação por E-mail: ${newVal ? 'Sim' : 'Não'}`),
    });
  }

  // Alterar Notificação via WhatsApp
  toggleNotifyWhatsapp(): void {
    const task = this.activeTask();
    if (!task) return;
    const newVal = !task.notifyClientWhatsapp;
    this.taskService.updateTask(task._id, { notifyClientWhatsapp: newVal }).subscribe({
      next: () => this.showToast(`Notificação por WhatsApp: ${newVal ? 'Sim' : 'Não'}`),
    });
  }

  // Editar Valor da Tarefa
  async promptEditTaskValue(): Promise<void> {
    const task = this.activeTask();
    if (!task) return;

    const alert = await this.alertCtrl.create({
      header: 'Editar Valor da Tarefa',
      inputs: [
        {
          name: 'taskValue',
          type: 'number',
          value: task.taskValue || 0,
          placeholder: 'R$ 0,00',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Salvar',
          handler: (data) => {
            const val = parseFloat(data.taskValue) || 0;
            this.taskService.updateTask(task._id, { taskValue: val }).subscribe({
              next: () => this.showToast('Valor atualizado com sucesso!'),
            });
            return true;
          },
        },
      ],
    });
    await alert.present();
  }

  // Enviar Mensagem no Chat da Tarefa
  sendChatMessage(): void {
    const task = this.activeTask();
    const msg = this.chatInput();
    if (!task || !msg || !msg.trim()) return;

    this.taskService.addComment(task._id, msg.trim()).subscribe({
      next: () => {
        this.chatInput.set('');
        this.showToast('Mensagem enviada com sucesso!');
      },
      error: (err) => this.showToast(err?.error?.error?.message || 'Erro ao enviar mensagem.'),
    });
  }

  // Cronômetro & Apontamento de Tempo
  toggleTimer(): void {
    if (this.isTimerRunning()) {
      clearInterval(this.timerInterval);
      this.isTimerRunning.set(false);
      this.promptSaveTimer();
    } else {
      this.isTimerRunning.set(true);
      this.timerInterval = setInterval(() => {
        this.timerSeconds.update((s) => s + 1);
      }, 1000);
    }
  }

  async promptSaveTimer(): Promise<void> {
    const task = this.activeTask();
    const secs = this.timerSeconds();
    if (!task || secs === 0) return;

    const mins = Math.ceil(secs / 60);
    const alert = await this.alertCtrl.create({
      header: 'Apontar Horas na Tarefa',
      subHeader: `Tempo cronometrado: ${this.formatTimer(secs)} (~${mins} min)`,
      message: 'Deseja consolidar este tempo no histórico da tarefa?',
      buttons: [
        {
          text: 'Descartar',
          role: 'cancel',
          handler: () => this.timerSeconds.set(0),
        },
        {
          text: 'Apontar Tempo',
          handler: () => {
            this.taskService.logTime(task._id, secs).subscribe({
              next: () => {
                this.showToast(`Apontamento de ${mins} min registrado com sucesso!`);
                this.timerSeconds.set(0);
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  formatTimer(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  copyTaskEmail(): void {
    const task = this.activeTask();
    if (!task) return;
    const taskEmail = `tarefa-${task._id.slice(-6)}@inbox.taxsmart.com.br`;
    navigator.clipboard.writeText(taskEmail);
    this.showToast(`E-mail da tarefa copiado: ${taskEmail}`);
  }

  copyPixCode(pixCode?: string, amount?: number): void {
    if (!pixCode) {
      this.showToast('Código PIX não disponível para esta obrigação.');
      return;
    }
    navigator.clipboard.writeText(pixCode);
    const amountMsg = amount ? ' (Valor: R$ ' + amount.toFixed(2) + ')' : '';
    this.showToast('Código PIX Copia e Cola copiado com sucesso!' + amountMsg);
  }

  copyBarcode(barcode?: string): void {
    if (!barcode) {
      this.showToast('Linha digitável não disponível para esta obrigação.');
      return;
    }
    navigator.clipboard.writeText(barcode);
    this.showToast('Linha digitável copiada com sucesso!');
  }

  openPdf(url?: string): void {
    if (!url) return;
    window.open(url, '_blank');
  }

  private showToast(message: string): void {
    this.toastMessage.set(message);
    this.isToastOpen.set(true);
  }

  resolveImpediment(task: ITask): void {
    const rawCat = task.category;
    let targetModule = 'GERAL';
    if (rawCat === TaskCategory.CONTABIL) targetModule = 'CONTABIL';
    else if (rawCat === TaskCategory.FISCAL) targetModule = 'FISCAL';
    else if (rawCat === TaskCategory.FOLHA) targetModule = 'DP';

    const companyIdStr = typeof task.companyId === 'object' ? task.companyId._id : task.companyId;

    if (this.isAccountant()) {
      if (rawCat === TaskCategory.CONTABIL) {
        this.router.navigate(['/admin/accounting'], {
          queryParams: { companyId: companyIdStr, competence: task.competence },
        });
        return;
      }
      if (rawCat === TaskCategory.FISCAL) {
        this.router.navigate(['/admin/fiscal'], {
          queryParams: { companyId: companyIdStr, competence: task.competence },
        });
        return;
      }
      if (rawCat === TaskCategory.FOLHA) {
        this.router.navigate(['/admin/folha'], {
          queryParams: { companyId: companyIdStr, competence: task.competence },
        });
        return;
      }
    }

    this.router.navigate(['/company/documents'], {
      queryParams: { module: targetModule, competence: task.competence },
    });
  }

  async openStatusAction(task: ITask): Promise<void> {
    if (!this.isAccountant()) return;

    const alert = await this.alertCtrl.create({
      header: 'Alterar Status da Obrigação',
      subHeader: task.title,
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Justificativa ou detalhes...',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Concluir',
          cssClass: 'status-btn-success',
          handler: (data) => this.updateStatus(task._id, TaskStatus.CONCLUIDO, data.reason),
        },
        {
          text: 'Em Andamento',
          handler: (data) => this.updateStatus(task._id, TaskStatus.EM_ANDAMENTO, data.reason),
        },
        {
          text: 'Impedimento',
          cssClass: 'status-btn-warning',
          handler: (data) => this.updateStatus(task._id, TaskStatus.IMPEDIMENTO, data.reason),
        },
        {
          text: 'Desconsiderar',
          cssClass: 'status-btn-medium',
          handler: (data) => this.updateStatus(task._id, TaskStatus.DESCONSIDERADO, data.reason),
        },
        {
          text: 'Reabrir',
          handler: (data) => this.updateStatus(task._id, TaskStatus.ABERTA, data.reason),
        },
      ],
    });
    await alert.present();
  }

  updateStatus(taskId: string, status: TaskStatus, reason?: string): void {
    this.taskService.updateStatus(taskId, status, reason).subscribe({
      next: () => {
        this.showToast(`Status atualizado para ${this.getStatusLabel(status)}`);
        this.taskService.loadSummary().subscribe();
      },
      error: (err) => {
        const msg = err?.error?.error?.message || err?.error?.message || 'Erro ao alterar status';
        this.showToast(msg);
      },
    });
  }

  getStatusBadgeColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.CONCLUIDO:
        return 'success';
      case TaskStatus.EM_ANDAMENTO:
        return 'primary';
      case TaskStatus.IMPEDIMENTO:
        return 'danger';
      case TaskStatus.ABERTA:
        return 'warning';
      case TaskStatus.DESCONSIDERADO:
        return 'medium';
      default:
        return 'light';
    }
  }

  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.CONCLUIDO:
        return 'Concluído';
      case TaskStatus.EM_ANDAMENTO:
        return 'Em Andamento';
      case TaskStatus.IMPEDIMENTO:
        return 'Impedimento';
      case TaskStatus.DESCONSIDERADO:
        return 'Desconsiderado';
      case TaskStatus.ABERTA:
      default:
        return 'Aberta';
    }
  }

  getStatusIcon(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.CONCLUIDO:
        return 'checkmark-circle';
      case TaskStatus.EM_ANDAMENTO:
        return 'flash-outline';
      case TaskStatus.IMPEDIMENTO:
        return 'alert-circle';
      case TaskStatus.ABERTA:
        return 'time-outline';
      case TaskStatus.DESCONSIDERADO:
        return 'close-circle';
      default:
        return 'time-outline';
    }
  }
}
