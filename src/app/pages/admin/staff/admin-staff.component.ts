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
  IonSearchbar,
  IonAvatar,
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
} from 'ionicons/icons';
import { StaffService } from '../../../services/staff/staff.service';
import { User, UserRole } from '../../../models/user.model';


@Component({
  selector: 'app-admin-staff',
  templateUrl: './admin-staff.component.html',
  styleUrls: ['./admin-staff.component.scss'],
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
    IonSearchbar,
    IonAvatar,
  ],
})
export class AdminStaffComponent implements OnInit {
  private staffService = inject(StaffService);
  private fb = inject(FormBuilder);

  staffMembers = this.staffService.staffMembers;
  isLoading = this.staffService.isLoading;

  searchTerm = signal<string>('');
  selectedRole = signal<string>('');
  isModalOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  currentStaffId = signal<string | null>(null);

  staffForm: FormGroup;

  rolesList = [
    { value: UserRole.SUPER_ADMIN, label: 'Super Administrador' },
    { value: UserRole.ACCOUNTANT, label: 'Contador Responsável' },
    { value: UserRole.FISCAL_ANALYST, label: 'Analista Fiscal' },
    { value: UserRole.PAYROLL_ANALYST, label: 'Analista DP / RH' },
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
    });

    this.staffForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: [UserRole.ACCOUNTANT, [Validators.required]],
      phone: [''],
    });
  }

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.staffService.loadStaffMembers().subscribe();
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.currentStaffId.set(null);
    this.staffForm.reset({
      role: UserRole.ACCOUNTANT,
    });
    this.staffForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.staffForm.get('password')?.updateValueAndValidity();
    this.isModalOpen.set(true);
  }

  openEditModal(member: User): void {
    this.isEditing.set(true);
    this.currentStaffId.set(member._id || null);
    this.staffForm.patchValue({
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone || '',
    });
    // Senha opcional na edição
    this.staffForm.get('password')?.clearValidators();
    this.staffForm.get('password')?.updateValueAndValidity();
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  saveStaff(): void {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    const formVal = this.staffForm.getRawValue();

    if (this.isEditing() && this.currentStaffId()) {
      const updatePayload: any = {
        name: formVal.name,
        email: formVal.email,
        role: formVal.role,
        phone: formVal.phone,
      };
      if (formVal.password) {
        updatePayload.password = formVal.password;
      }

      this.staffService.updateStaffMember(this.currentStaffId()!, updatePayload).subscribe({
        next: () => this.closeModal(),
      });
    } else {
      this.staffService.createStaffMember(formVal).subscribe({
        next: () => this.closeModal(),
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
}
