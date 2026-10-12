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
  sparklesOutline,
  sunnyOutline,
  moonOutline,
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
  selectedColor = signal<string>('#ea580c');
  selectedSecondaryColor = signal<string>('#00d2ff');
  selectedTheme = signal<'light' | 'dark'>('light');
  logoPreview = signal<string | null>(null);
  backgroundPreview = signal<string | null>(null);
  currentPreviewScreen = signal<'dashboard' | 'login'>('dashboard');
  isSaving = signal<boolean>(false);

  toastMessage = signal<string>('');
  isToastOpen = signal<boolean>(false);

  originalAppearance: IAppearanceConfig | null = null;

  // Paleta de cores Primárias recomendadas (TaxSmart Branding)
  primaryPresetColors = [
    { name: 'Laranja Corporativo (TaxSmart)', value: '#ea580c' },
    { name: 'Laranja Flamejante', value: '#f97316' },
    { name: 'Cyan Tech', value: '#00d2ff' },
    { name: 'Azul Safira', value: '#2563eb' },
    { name: 'Verde Fiscal', value: '#10b981' },
    { name: 'Roxo Royal', value: '#7c3aed' },
    { name: 'Dourado Prime', value: '#f59e0b' },
    { name: 'Grafite Nobre', value: '#334155' },
  ];

  // Paleta de cores Secundárias / Apoio recomendadas
  secondaryPresetColors = [
    { name: 'Cyan Tech', value: '#00d2ff' },
    { name: 'Laranja Corporativo', value: '#ea580c' },
    { name: 'Azul Cobalto', value: '#3b82f6' },
    { name: 'Esmeralda', value: '#059669' },
    { name: 'Púrpura', value: '#9333ea' },
    { name: 'Âmbar', value: '#d97706' },
    { name: 'Cinza Platina', value: '#64748b' },
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
      sparklesOutline,
      sunnyOutline,
      moonOutline,
    });
  }

  ngOnInit(): void {
    const current = this.themeService.currentAppearance();
    this.originalAppearance = { ...current };

    if (current.primary_color) this.selectedColor.set(current.primary_color);
    if (current.secondary_color) this.selectedSecondaryColor.set(current.secondary_color);
    if (current.theme) this.selectedTheme.set(current.theme);
    if (current.logo_url) this.logoPreview.set(current.logo_url);
    if (current.background_image) this.backgroundPreview.set(current.background_image);
  }

  applyPreview(): void {
    this.themeService.applyTheme({
      primary_color: this.selectedColor(),
      secondary_color: this.selectedSecondaryColor(),
      theme: this.selectedTheme(),
      logo_url: this.logoPreview() || undefined,
      background_image: this.backgroundPreview() || undefined,
    });
  }

  setColor(color: string): void {
    this.selectedColor.set(color);
    this.applyPreview();
  }

  setSecondaryColor(color: string): void {
    this.selectedSecondaryColor.set(color);
    this.applyPreview();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.selectedTheme.set(theme);
    this.applyPreview();
  }

  isCustomPrimaryColor(): boolean {
    return !this.primaryPresetColors.some(
      (c) => c.value.toLowerCase() === this.selectedColor().toLowerCase()
    );
  }

  isCustomSecondaryColor(): boolean {
    return !this.secondaryPresetColors.some(
      (c) => c.value.toLowerCase() === this.selectedSecondaryColor().toLowerCase()
    );
  }

  onCustomPrimaryColorChange(event: any): void {
    const color = event.target.value;
    this.selectedColor.set(color);
    this.applyPreview();
  }

  onCustomSecondaryColorChange(event: any): void {
    const color = event.target.value;
    this.selectedSecondaryColor.set(color);
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
      secondary_color: this.selectedSecondaryColor(),
      theme: this.selectedTheme(),
      logo_url: this.logoPreview() || '',
      background_image: this.backgroundPreview() || '',
    };

    this.themeService.applyTheme(config);
    this.originalAppearance = { ...config };

    setTimeout(() => {
      this.isSaving.set(false);
      this.showToast('Configurações de aparência salvas e aplicadas com sucesso!');
    }, 300);
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
