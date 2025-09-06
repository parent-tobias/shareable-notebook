// src/lib/stores/settings.svelte.ts
import { browser } from '$app/environment';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  autoSync: boolean;
  syncInterval: number; // in seconds
  notifications: boolean;
  defaultNoteType: 'markdown' | 'chordpro' | 'code';
  chordInstrument: string;
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  autoSync: true,
  syncInterval: 30,
  notifications: true,
  defaultNoteType: 'markdown',
  chordInstrument: 'Standard Ukulele',
  fontSize: 'medium',
  compactMode: false
};

class SettingsStore {
  private _settings = $state<UserSettings>(DEFAULT_SETTINGS);
  private _currentTheme = $state<'light' | 'dark'>('light');
  private mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

  constructor() {
    if (browser) {
      this.loadSettings();
      this.applyTheme();
    }
  }

  get settings() {
    return this._settings;
  }

  get currentTheme() {
    return this._currentTheme;
  }

  get isDarkMode() {
    return this._currentTheme === 'dark';
  }

  private loadSettings() {
    const stored = localStorage.getItem('user-settings');
    if (stored) {
      try {
        const parsedSettings = JSON.parse(stored);
        this._settings = { ...DEFAULT_SETTINGS, ...parsedSettings };
      } catch (error) {
        console.error('Failed to parse stored settings:', error);
      }
    }
  }

  private saveSettings() {
    if (browser) {
      localStorage.setItem('user-settings', JSON.stringify(this._settings));
    }
  }

  private applyTheme() {
    if (!browser) return;

    // Remove existing media query listener
    if (this.mediaQueryListener) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.removeEventListener('change', this.mediaQueryListener);
      this.mediaQueryListener = null;
    }

    let theme: 'light' | 'dark' = 'light';

    if (this._settings.theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      theme = this._settings.theme;
    }

    this._currentTheme = theme;

    // Apply theme to document
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);

    console.log('🎨 Applied theme:', theme, 'from setting:', this._settings.theme);

    // Listen for system theme changes if using system setting
    if (this._settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQueryListener = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        this._currentTheme = newTheme;
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
        root.setAttribute('data-theme', newTheme);
        console.log('🎨 System theme changed to:', newTheme);
      };
      mediaQuery.addEventListener('change', this.mediaQueryListener);
    }
  }

  updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    this._settings[key] = value;
    this.saveSettings();

    if (key === 'theme') {
      this.applyTheme();
    }
  }

  updateSettings(newSettings: Partial<UserSettings>) {
    const hadThemeChange = newSettings.theme && newSettings.theme !== this._settings.theme;
    
    this._settings = { ...this._settings, ...newSettings };
    this.saveSettings();

    if (hadThemeChange) {
      this.applyTheme();
    }
  }

  resetToDefaults() {
    this._settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    this.applyTheme();
  }

  toggleTheme() {
    const currentTheme = this._settings.theme === 'system' 
      ? this._currentTheme 
      : this._settings.theme;
    
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.updateSetting('theme', newTheme);
  }

  toggleAutoSync() {
    this.updateSetting('autoSync', !this._settings.autoSync);
  }
}

export const settingsStore = new SettingsStore();