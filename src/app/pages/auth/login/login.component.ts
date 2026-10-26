import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
  businessOutline,
  alertCircleOutline,
  arrowBackOutline,
} from 'ionicons/icons';
import { AuthService } from '../../../services/auth/auth.service';
import { Strings } from '../../../enum/strings';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner,
    IonText,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly strings = Strings;

  // Signals de estado
  isLoading = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Formulário Reativo (Aceita E-mail ou CNPJ)
  loginForm: FormGroup = this.fb.group({
    identifier: [
      '',
      [
        Validators.required,
        (control: AbstractControl) => {
          const val = String(control.value || '').trim();
          if (!val) return null;
          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
          const digitsOnly = val.replace(/\D/g, '');
          const isCnpj = digitsOnly.length === 14;
          return isEmail || isCnpj ? null : { invalidIdentifier: true };
        },
      ],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      arrowForwardOutline,
      shieldCheckmarkOutline,
      businessOutline,
      alertCircleOutline,
      arrowBackOutline,
    });
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.redirectAfterLogin();
    }
  }

  isCnpjInput(): boolean {
    const val = String(this.loginForm.get('identifier')?.value || '').trim();
    const digits = val.replace(/\D/g, '');
    return digits.length > 2 && !val.includes('@');
  }

  onIdentifierInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value;
    // Se o usuário estiver digitando números e sem @, aplica máscara leve de CNPJ
    if (/^\d+$/.test(val.replace(/\D/g, '')) && !val.includes('@')) {
      const digits = val.replace(/\D/g, '').slice(0, 14);
      if (digits.length > 11) {
        let formatted = digits;
        if (digits.length > 2) formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
        if (digits.length > 5) formatted = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
        if (digits.length > 8) formatted = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
        if (digits.length > 12) formatted = `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
        this.loginForm.get('identifier')?.setValue(formatted, { emitEvent: false });
      }
    }
  }

  toggleShowPassword(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);
    this.loginForm.disable();

    const rawValues = this.loginForm.getRawValue();

    this.authService
      .login({
        email: rawValues.identifier.trim(),
        password: rawValues.password,
      })
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.loginForm.enable();
          if (response.success) {
            this.authService.redirectAfterLogin();
          }
        },
        error: (err) => {
          this.isLoading.set(false);
          this.loginForm.enable();
          const message =
            err?.error?.error?.message ||
            err?.error?.message ||
            'Não foi possível conectar ao servidor. Verifique suas credenciais.';
          this.errorMessage.set(message);
        },
      });
  }
}
