import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  // Formulário Reativo
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
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
        email: rawValues.email.trim(),
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
