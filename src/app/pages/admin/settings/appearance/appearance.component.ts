import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonFooter,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  imageOutline,
  checkmarkOutline,
  colorFilterOutline,
  addOutline,
  menuOutline,
  cashOutline,
  mailOutline,
  lockClosedOutline,
  gridOutline,
  businessOutline,
  timeOutline,
  walletOutline,
  cloudUploadOutline,
  refreshOutline,
  colorPaletteOutline,
} from 'ionicons/icons';
import { ThemeService, IAppearanceConfig } from '../../../../services/theme/theme.service';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-appearance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonIcon,
    IonSpinner,
    IonFooter,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonToast,
  ],
  templateUrl: './appearance.component.html',
  styleUrl: './appearance.component.scss',
})
export class AppearanceComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  // Signals para reatividade
  selectedColor = signal<string>('#00d2ff');
  selectedTheme = signal<'light' | 'dark'>('dark');
  logoPreview = signal<string | null>(null);
  backgroundPreview = signal<string | null>(null);
  currentPreviewScreen = signal<'dashboard' | 'login'>('dashboard');
  isSaving = signal<boolean>(false);

  toastMessage = signal<string>('');
  isToastOpen = signal<boolean>(false);

  originalAppearance: IAppearanceConfig | null = null;

  // Paleta de cores recomendadas para a TaxSmart
  presetColors = [
    { name: 'Cyan Tech (TaxSmart)', value: '#00d2ff' },
    { name: 'Laranja Corporativo', value: '#ea580c' },
    { name: 'Verde Fiscal', value: '#10b981' },
    { name: 'Azul Safira', value: '#3b82f6' },
    { name: 'Roxo Moderno', value: '#8b5cf6' },
    { name: 'Dourado Prime', value: '#f59e0b' },
  ];

  constructor() {
    addIcons({
      imageOutline,
      checkmarkOutline,
      colorFilterOutline,
      addOutline,
      menuOutline,
      cashOutline,
      mailOutline,
      lockClosedOutline,
      gridOutline,
      businessOutline,
      timeOutline,
      walletOutline,
      cloudUploadOutline,
      refreshOutline,
      colorPaletteOutline,
    });
  }

  ngOnInit(): void {
    const current = this.themeService.currentAppearance();
    this.originalAppearance = { ...current };

    if (current.primary_color) this.selectedColor.set(current.primary_color);
    if (current.theme) this.selectedTheme.set(current.theme);
    if (current.logo_url) this.logoPreview.set(current.logo_url);
    if (current.background_image) this.backgroundPreview.set(current.background_image);
  }

  applyPreview(): void {
    this.themeService.applyTheme({
      primary_color: this.selectedColor(),
      theme: this.selectedTheme(),
      logo_url: this.logoPreview() || undefined,
      background_image: this.backgroundPreview() || undefined,
    });
  }

  setColor(color: string): void {
    this.selectedColor.set(color);
    this.applyPreview();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.selectedTheme.set(theme);
    this.applyPreview();
  }

  isCustomColor(): boolean {
    return !this.presetColors.some(
      (c) => c.value.toLowerCase() === this.selectedColor().toLowerCase()
    );
  }

  onCustomColorChange(event: any): void {
    const color = event.target.value;
    this.selectedColor.set(color);
    this.applyPreview();
  }

  async onLogoSelected(event: any): Promise<void> {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.showToast('A imagem da logo deve ter no máximo 2MB.');
        return;
      }
      try {
        const base64 = (await this.fileToBase64(file)) as string;
        this.logoPreview.set(base64);
        this.applyPreview();
      } catch {
        this.showToast('Erro ao processar imagem.');
      }
    }
  }

  removeLogo(): void {
    this.logoPreview.set(null);
    this.applyPreview();
  }

  async onBackgroundSelected(event: any): Promise<void> {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        this.showToast('A imagem de fundo deve ter no máximo 3MB.');
        return;
      }
      try {
        const base64 = (await this.fileToBase64(file)) as string;
        this.backgroundPreview.set(base64);
        this.applyPreview();
      } catch {
        this.showToast('Erro ao processar fundo.');
      }
    }
  }

  removeBackground(): void {
    this.backgroundPreview.set(null);
    this.applyPreview();
  }

  getContrastColor(hex: string): string {
    return this.themeService.getContrastColor(hex);
  }

  async saveSettings(): Promise<void> {
    this.isSaving.set(true);

    const config: IAppearanceConfig = {
      primary_color: this.selectedColor(),
      theme: this.selectedTheme(),
      logo_url: this.logoPreview() || '',
      background_image: this.backgroundPreview() || '',
    };

    this.themeService.applyTheme(config);
    this.originalAppearance = { ...config };

    setTimeout(() => {
      this.isSaving.set(false);
      this.showToast('Configurações de aparência salvas com sucesso!');
    }, 400);
  }

  showToast(message: string): void {
    this.toastMessage.set(message);
    this.isToastOpen.set(true);
  }

  ngOnDestroy(): void {
    if (this.originalAppearance) {
      this.themeService.applyTheme(this.originalAppearance);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}
