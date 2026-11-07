import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToggle,
  IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline, flashOutline, calendarOutline, businessOutline, personOutline } from 'ionicons/icons';
import { TaskService } from '../../services/task/task.service';
import { CompanyService } from '../../services/company/company.service';
import { StaffService } from '../../services/staff/staff.service';
import { TaskCategory, ITask } from '../../models/task.model';

@Component({
  standalone: true,
  selector: 'app-task-create-modal',
  templateUrl: './task-create-modal.component.html',
  styleUrls: ['./task-create-modal.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonToggle,
    IonSpinner,
  ],
})
export class TaskCreateModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private toastCtrl = inject(ToastController);
  taskService = inject(TaskService);
  companyService = inject(CompanyService);
  staffService = inject(StaffService);

  // Inputs e Outputs (Angular 18 API)
  isOpen = input<boolean>(false);
  defaultCompetence = input<string>('10/2026');
  onClose = output<void>();
  onCreated = output<ITask>();

  isSubmitting = signal<boolean>(false);

  form!: FormGroup;

  readonly categories = [
    { label: 'Fiscal / Tributário', value: TaskCategory.FISCAL },
    { label: 'Contábil / Balancetes', value: TaskCategory.CONTABIL },
    { label: 'Folha de Pagamento / DP', value: TaskCategory.FOLHA },
    { label: 'Legalização / Societário', value: TaskCategory.LEGALIZACAO },
    { label: 'Financeiro / BPO', value: TaskCategory.FINANCEIRO },
  ];

  constructor() {
    addIcons({
      closeOutline,
      checkmarkOutline,
      flashOutline,
      calendarOutline,
      businessOutline,
      personOutline,
    });
    this.initForm();
  }

  ngOnInit(): void {
    this.taskService.loadTemplates().subscribe();
    this.companyService.loadCompanies().subscribe();
    this.staffService.loadStaffMembers().subscribe();
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      templateId: [''],
      title: ['', [Validators.required, Validators.minLength(3)]],
      dueDate: [today, [Validators.required]],
      competence: [this.defaultCompetence(), [Validators.required]],
      category: [TaskCategory.FISCAL, [Validators.required]],
      companyId: ['', [Validators.required]],
      assignedTo: ['', [Validators.required]],
      taxAmount: [null],
      description: ['', [Validators.maxLength(1000)]],
      notifyClientEmail: [false],
      isClientVisible: [true],
    });

    // Ao mudar o template, preenche automaticamente os campos padrão
    this.form.get('templateId')?.valueChanges.subscribe((tplId) => {
      if (!tplId) return;
      const tpl = this.taskService.templates().find((t) => t._id === tplId);
      if (tpl) {
        this.form.patchValue({
          title: tpl.name,
          category: tpl.category,
          description: tpl.description || '',
          notifyClientEmail: tpl.notifyClientEmail,
          isClientVisible: tpl.isClientVisible,
        });
      }
    });
  }

  closeModal(): void {
    this.onClose.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const rawValue = this.form.getRawValue();

    // Se template for livre (''), remove para não buscar ID inválido
    const payload = { ...rawValue };
    if (!payload.templateId) {
      delete payload.templateId;
    }

    this.taskService.createTask(payload).subscribe({
      next: async (res) => {
        this.isSubmitting.set(false);
        const toast = await this.toastCtrl.create({
          message: 'Tarefa criada com sucesso no cronograma!',
          duration: 3000,
          color: 'success',
          position: 'top',
        });
        await toast.present();
        if (res.data) {
          this.onCreated.emit(res.data);
        }
        this.form.reset({
          templateId: '',
          dueDate: new Date().toISOString().split('T')[0],
          competence: this.defaultCompetence(),
          category: TaskCategory.FISCAL,
          isClientVisible: true,
          notifyClientEmail: false,
        });
        this.closeModal();
      },
      error: async (err) => {
        this.isSubmitting.set(false);
        const msg = err?.error?.error?.message || err?.error?.message || 'Erro ao criar tarefa.';
        const toast = await this.toastCtrl.create({
          message: msg,
          duration: 3500,
          color: 'danger',
          position: 'top',
        });
        await toast.present();
      },
    });
  }
}

