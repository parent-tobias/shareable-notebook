<!-- src/lib/components/Settings.svelte -->
<script lang="ts">
  import { settingsStore } from '$lib/stores/settings.svelte';
  import { notebookStore } from '$lib/stores/notebook.svelte';
  import type { UserSettings } from '$lib/stores/settings.svelte';

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen, onClose }: Props = $props();

  const settings = $derived(settingsStore.settings);
  const isDarkMode = $derived(settingsStore.isDarkMode);

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ] as const;

  const noteTypes = [
    { value: 'markdown', label: 'Markdown' },
    { value: 'chordpro', label: 'ChordPro' },
    { value: 'code', label: 'Code' }
  ] as const;

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ] as const;

  const syncIntervals = [
    { value: 10, label: '10 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 300, label: '5 minutes' },
    { value: 900, label: '15 minutes' }
  ] as const;

  const availableInstruments = [
    'Standard Ukulele',
    'Baritone Ukulele',
    '5ths tuned Ukulele',
    'Standard Guitar',
    'Drop-D Guitar'
  ];

  const chordListPositions = [
    { value: 'top', label: 'Top' },
    { value: 'right', label: 'Right' },
    { value: 'bottom', label: 'Bottom' }
  ] as const;

  function updateSetting<K extends keyof UserSettings>(key: K, value: UserSettings[K]) {
    settingsStore.updateSetting(key, value);
    
    // If auto-sync related settings changed, update notebook store
    if (key === 'autoSync' || key === 'syncInterval') {
      notebookStore.updateAutoSyncSettings();
    }
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div 
    class="settings-overlay"
    onclick={handleBackdropClick}
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="settings-title"
  >
    <div class="settings-modal">
      <div class="settings-header">
        <h2 id="settings-title">Settings</h2>
        <button 
          onclick={onClose}
          class="close-btn"
          aria-label="Close settings"
        >
          ✕
        </button>
      </div>

      <div class="settings-content">
        <!-- Appearance Section -->
        <section class="settings-section">
          <h3>Appearance</h3>
          
          <div class="setting-item">
            <label for="theme-select">Theme</label>
            <select 
              id="theme-select"
              value={settings.theme}
              onchange={(e) => updateSetting('theme', e.currentTarget.value as any)}
            >
              {#each themes as theme}
                <option value={theme.value}>{theme.label}</option>
              {/each}
            </select>
          </div>

          <div class="setting-item">
            <label for="font-size-select">Font Size</label>
            <select 
              id="font-size-select"
              value={settings.fontSize}
              onchange={(e) => updateSetting('fontSize', e.currentTarget.value as any)}
            >
              {#each fontSizes as size}
                <option value={size.value}>{size.label}</option>
              {/each}
            </select>
          </div>

          <div class="setting-item">
            <label>
              <input 
                type="checkbox"
                checked={settings.compactMode}
                onchange={(e) => updateSetting('compactMode', e.currentTarget.checked)}
              />
              Compact mode
            </label>
          </div>
        </section>

        <!-- Sync Section -->
        <section class="settings-section">
          <h3>Synchronization</h3>
          
          <div class="setting-item">
            <label>
              <input 
                type="checkbox"
                checked={settings.autoSync}
                onchange={(e) => updateSetting('autoSync', e.currentTarget.checked)}
              />
              Auto-sync enabled
            </label>
          </div>

          {#if settings.autoSync}
            <div class="setting-item">
              <label for="sync-interval-select">Sync interval</label>
              <select 
                id="sync-interval-select"
                value={settings.syncInterval}
                onchange={(e) => updateSetting('syncInterval', parseInt(e.currentTarget.value))}
              >
                {#each syncIntervals as interval}
                  <option value={interval.value}>{interval.label}</option>
                {/each}
              </select>
            </div>
          {/if}

          <div class="setting-item">
            <label>
              <input 
                type="checkbox"
                checked={settings.notifications}
                onchange={(e) => updateSetting('notifications', e.currentTarget.checked)}
              />
              Show sync notifications
            </label>
          </div>
        </section>

        <!-- Content Section -->
        <section class="settings-section">
          <h3>Content</h3>
          
          <div class="setting-item">
            <label for="default-note-type-select">Default note type</label>
            <select 
              id="default-note-type-select"
              value={settings.defaultNoteType}
              onchange={(e) => updateSetting('defaultNoteType', e.currentTarget.value as any)}
            >
              {#each noteTypes as noteType}
                <option value={noteType.value}>{noteType.label}</option>
              {/each}
            </select>
          </div>

          <div class="setting-item">
            <label for="chord-instrument-select">Default chord instrument</label>
            <select
              id="chord-instrument-select"
              value={settings.chordInstrument}
              onchange={(e) => updateSetting('chordInstrument', e.currentTarget.value)}
            >
              {#each availableInstruments as instrument}
                <option value={instrument}>{instrument}</option>
              {/each}
            </select>
          </div>

          <div class="setting-item">
            <label for="chord-list-position-select">Chord list position</label>
            <select
              id="chord-list-position-select"
              value={settings.chordListPosition}
              onchange={(e) => updateSetting('chordListPosition', e.currentTarget.value as 'top' | 'right' | 'bottom')}
            >
              {#each chordListPositions as position}
                <option value={position.value}>{position.label}</option>
              {/each}
            </select>
          </div>
        </section>

        <!-- Actions -->
        <section class="settings-section">
          <h3>Actions</h3>
          
          <div class="setting-actions">
            <button 
              onclick={() => settingsStore.resetToDefaults()}
              class="reset-btn"
            >
              Reset to Defaults
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
{/if}

<style>
  .settings-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .settings-modal {
    background: var(--bg-primary, white);
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
  }

  .settings-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary, #6b7280);
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: var(--bg-secondary, #f3f4f6);
    color: var(--text-primary, #111827);
  }

  .settings-content {
    max-height: calc(90vh - 5rem);
    overflow-y: auto;
    padding: 1.5rem;
  }

  .settings-section {
    margin-bottom: 2rem;
  }

  .settings-section:last-child {
    margin-bottom: 0;
  }

  .settings-section h3 {
    margin: 0 0 1rem 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-primary, #111827);
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    padding-bottom: 0.5rem;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0;
    gap: 1rem;
  }

  .setting-item label {
    font-weight: 500;
    color: var(--text-primary, #374151);
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .setting-item select {
    min-width: 150px;
    padding: 0.5rem;
    border: 1px solid var(--border-color, #d1d5db);
    border-radius: 6px;
    background: var(--bg-primary, white);
    color: var(--text-primary, #111827);
    font-size: 0.875rem;
  }

  .setting-item select:focus {
    outline: none;
    border-color: var(--accent-color, #3b82f6);
    box-shadow: 0 0 0 3px var(--accent-color-light, rgba(59, 130, 246, 0.1));
  }

  .setting-item input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    accent-color: var(--accent-color, #3b82f6);
  }

  .setting-actions {
    display: flex;
    gap: 1rem;
  }

  .reset-btn {
    padding: 0.75rem 1.5rem;
    background: var(--bg-secondary, #f3f4f6);
    color: var(--text-primary, #374151);
    border: 1px solid var(--border-color, #d1d5db);
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-btn:hover {
    background: var(--bg-tertiary, #e5e7eb);
  }

  /* Dark mode variables */
  :global(.dark) .settings-modal {
    --bg-primary: #1f2937;
    --bg-secondary: #374151;
    --bg-tertiary: #4b5563;
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --border-color: #4b5563;
    --accent-color: #60a5fa;
    --accent-color-light: rgba(96, 165, 250, 0.1);
  }

  /* Light mode variables */
  :global(.light) .settings-modal,
  .settings-modal {
    --bg-primary: white;
    --bg-secondary: #f3f4f6;
    --bg-tertiary: #e5e7eb;
    --text-primary: #111827;
    --text-secondary: #6b7280;
    --border-color: #e5e7eb;
    --accent-color: #3b82f6;
    --accent-color-light: rgba(59, 130, 246, 0.1);
  }
</style>