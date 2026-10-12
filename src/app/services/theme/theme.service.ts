import { Injectable, Renderer2, RendererFactory2, signal } from '@angular/core';

export interface IAppearanceConfig {
  primary_color?: string;
  secondary_color?: string;
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
    return yiq >= 160 ? '#0f172a' : '#ffffff';
  }

  /**
   * Aplica cores primária, secundária e tema globalmente
   */
  applyTheme(appearance: IAppearanceConfig): void {
    if (!appearance) return;

    this.currentAppearance.set(appearance);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(appearance));

    const isLight = appearance.theme === 'light';
    const root = document.documentElement;
    const body = document.body;

    if (isLight) {
      root.setAttribute('data-theme', 'light');
      body.setAttribute('data-theme', 'light');
      root.classList.add('theme-light', 'ion-palette-light');
      body.classList.add('theme-light', 'ion-palette-light');
      root.classList.remove('theme-dark', 'ion-palette-dark');
      body.classList.remove('theme-dark', 'ion-palette-dark');
    } else {
      root.setAttribute('data-theme', 'dark');
      body.setAttribute('data-theme', 'dark');
      root.classList.add('theme-dark', 'ion-palette-dark');
      body.classList.add('theme-dark', 'ion-palette-dark');
      root.classList.remove('theme-light', 'ion-palette-light');
      body.classList.remove('theme-light', 'ion-palette-light');
    }

    // Cor Primária
    const primaryColor = appearance.primary_color || '#ea580c';
    const primaryRgb = this.hexToRgb(primaryColor);
    if (primaryRgb) {
      root.style.setProperty('--ion-color-primary', primaryColor);
      root.style.setProperty('--ion-color-primary-rgb', primaryRgb);
      root.style.setProperty('--app-primary', primaryColor);
      root.style.setProperty('--app-primary-rgb', primaryRgb);
      body.style.setProperty('--ion-color-primary', primaryColor);
      body.style.setProperty('--ion-color-primary-rgb', primaryRgb);

      const contrastHex = this.getContrastColor(primaryColor);
      const contrastRgb = this.hexToRgb(contrastHex);
      root.style.setProperty('--ion-color-primary-contrast', contrastHex);
      if (contrastRgb) {
        root.style.setProperty('--ion-color-primary-contrast-rgb', contrastRgb);
      }
      body.style.setProperty('--ion-color-primary-contrast', contrastHex);
      if (contrastRgb) {
        body.style.setProperty('--ion-color-primary-contrast-rgb', contrastRgb);
      }
    }

    // Cor Secundária
    const secondaryColor = appearance.secondary_color || '#00d2ff';
    const secondaryRgb = this.hexToRgb(secondaryColor);
    if (secondaryRgb) {
      root.style.setProperty('--ion-color-secondary', secondaryColor);
      root.style.setProperty('--ion-color-secondary-rgb', secondaryRgb);
      root.style.setProperty('--app-secondary', secondaryColor);
      root.style.setProperty('--app-secondary-rgb', secondaryRgb);
      body.style.setProperty('--ion-color-secondary', secondaryColor);
      body.style.setProperty('--ion-color-secondary-rgb', secondaryRgb);
    }

    if (appearance.background_image) {
      root.style.setProperty('--app-custom-bg', `url("${appearance.background_image}")`);
    } else {
      root.style.removeProperty('--app-custom-bg');
    }
  }

  resetTheme(): void {
    localStorage.removeItem(THEME_STORAGE_KEY);
    const defaultConfig: IAppearanceConfig = {
      primary_color: '#ea580c',
      secondary_color: '#00d2ff',
      theme: 'light',
    };
    this.currentAppearance.set(defaultConfig);
    this.applyTheme(defaultConfig);
  }

  private getStoredAppearance(): IAppearanceConfig {
    try {
      const data = localStorage.getItem(THEME_STORAGE_KEY);
      return data
        ? JSON.parse(data)
        : {
            primary_color: '#ea580c',
            secondary_color: '#00d2ff',
            theme: 'light',
          };
    } catch {
      return {
        primary_color: '#ea580c',
        secondary_color: '#00d2ff',
        theme: 'light',
      };
    }
  }
}
