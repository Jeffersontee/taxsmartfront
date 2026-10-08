import { Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';

export interface IAppearanceConfig {
  primary_color?: string;
  theme?: 'light' | 'dark';
  logo_url?: string;
  background_image?: string;
}

const THEME_STORAGE_KEY = 'taxsmart_appearance';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;

  currentAppearance = signal<IAppearanceConfig>(this.getStoredAppearance());

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.initTheme();
  }

  private initTheme(): void {
    const stored = this.getStoredAppearance();
    this.applyTheme(stored);
  }

  /**
   * Converte uma cor em HEX para RGB
   */
  hexToRgb(hex: string): string | null {
    if (!hex) return null;
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((x) => x + x).join('');
    }
    if (cleanHex.length !== 6) return null;
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : `${r}, ${g}, ${b}`;
  }

  /**
   * Calcula se a cor de contraste deve ser clara ou escura baseada no brilho YIQ.
   */
  getContrastColor(hex: string): string {
    if (!hex) return '#ffffff';
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((x) => x + x).join('');
    }
    if (cleanHex.length !== 6) return '#ffffff';
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 160 ? '#000000' : '#ffffff';
  }

  /**
   * Aplica a cor primária globalmente e configurações de modo escuro / claro.
   */
  applyTheme(appearance: IAppearanceConfig): void {
    if (!appearance) return;

    this.currentAppearance.set(appearance);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(appearance));

    const isDark = appearance.theme !== 'light';

    if (isDark) {
      document.documentElement.classList.add('ion-palette-dark');
      document.body.classList.add('ion-palette-dark');
      document.documentElement.classList.remove('ion-palette-light');
      document.body.classList.remove('ion-palette-light');
    } else {
      document.documentElement.classList.remove('ion-palette-dark');
      document.body.classList.remove('ion-palette-dark');
      document.documentElement.classList.add('ion-palette-light');
      document.body.classList.add('ion-palette-light');
    }

    const primaryColor = appearance.primary_color || '#00d2ff';
    const rgb = this.hexToRgb(primaryColor);

    if (rgb) {
      document.documentElement.style.setProperty('--ion-color-primary', primaryColor);
      document.documentElement.style.setProperty('--ion-color-primary-rgb', rgb);
      document.body.style.setProperty('--ion-color-primary', primaryColor);
      document.body.style.setProperty('--ion-color-primary-rgb', rgb);

      const contrastHex = this.getContrastColor(primaryColor);
      const contrastRgb = this.hexToRgb(contrastHex);

      document.documentElement.style.setProperty('--ion-color-primary-contrast', contrastHex);
      if (contrastRgb) {
        document.documentElement.style.setProperty('--ion-color-primary-contrast-rgb', contrastRgb);
      }
      document.body.style.setProperty('--ion-color-primary-contrast', contrastHex);
      if (contrastRgb) {
        document.body.style.setProperty('--ion-color-primary-contrast-rgb', contrastRgb);
      }
    }

    if (appearance.background_image) {
      document.documentElement.style.setProperty('--app-custom-bg', `url("${appearance.background_image}")`);
    } else {
      document.documentElement.style.removeProperty('--app-custom-bg');
    }
  }

  resetTheme(): void {
    localStorage.removeItem(THEME_STORAGE_KEY);
    this.currentAppearance.set({
      primary_color: '#00d2ff',
      theme: 'dark',
    });
    this.applyTheme({
      primary_color: '#00d2ff',
      theme: 'dark',
    });
  }

  private getStoredAppearance(): IAppearanceConfig {
    try {
      const data = localStorage.getItem(THEME_STORAGE_KEY);
      return data
        ? JSON.parse(data)
        : {
            primary_color: '#00d2ff',
            theme: 'dark',
          };
    } catch {
      return {
        primary_color: '#00d2ff',
        theme: 'dark',
      };
    }
  }
}
