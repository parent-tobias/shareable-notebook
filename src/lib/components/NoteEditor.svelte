<!-- src/lib/components/NoteEditor.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { editor } from 'monaco-editor';
  import { getRenderer, getRendererConfig } from '$lib/renderers';
  import type { Note, NoteType } from '$lib/types';
  
  interface Props {
    note: Note;
    onUpdate: (updates: Partial<Note>) => void;
    onDelete?: () => void;
  }
  
  let { note, onUpdate, onDelete }: Props = $props();
  
  let editorContainer: HTMLDivElement;
  let monacoEditor: editor.IStandaloneCodeEditor | null = null;
  let Monaco: any;
  let activeTab = $state<'edit' | 'preview'>('edit');
  let content = $state(note.content);
  let title = $state(note.title);
  let isDirty = $state(false);
  
  const Renderer = $derived(getRenderer(note.type));
  const config = $derived(getRendererConfig(note.type));
  
  // Map note types to Monaco language modes
  const languageMap: Record<NoteType, string> = {
    markdown: 'markdown',
    plaintext: 'plaintext',
    code: 'javascript', // Default to JS, but could be configurable
    chordpro: 'plaintext' // ChordPro doesn't have native Monaco support
  };
  
  let saveTimeout: number;
  
  // Create or recreate editor when switching tabs or notes
  async function initializeEditor() {
    if (!editorContainer || activeTab !== 'edit') return;
    
    // Dispose existing editor if any
    if (monacoEditor) {
      monacoEditor.dispose();
      monacoEditor = null;
    }
    
    // Import Monaco if not already loaded
    if (!Monaco) {
      Monaco = await import('monaco-editor');
    }
    
    // Small delay to ensure container is rendered
    await new Promise(resolve => setTimeout(resolve, 0));
    
    if (!editorContainer) return;
    
    // Configure Monaco Editor
    monacoEditor = Monaco.editor.create(editorContainer, {
      value: content,
      language: languageMap[note.type] || 'plaintext',
      theme: 'vs',
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: note.type === 'code' ? 'on' : 'off',
      wordWrap: note.type !== 'code' ? 'on' : 'off',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      padding: { top: 16, bottom: 16 },
      quickSuggestions: note.type === 'code',
      suggestOnTriggerCharacters: note.type === 'code',
      tabSize: 2,
      fontFamily: note.type === 'code' 
        ? '"Fira Code", "Cascadia Code", Consolas, monospace' 
        : 'inherit',
      readOnly: false,
      domReadOnly: false
    });
    
    // Focus the editor
    monacoEditor.focus();
    
    // Listen for content changes
    monacoEditor.onDidChangeModelContent(() => {
      if (!monacoEditor) return;
      const newContent = monacoEditor.getValue();
      if (newContent !== content) {
        content = newContent;
        isDirty = true;
        
        // Auto-save after delay
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          if (isDirty) {
            saveContent();
          }
        }, 2000);
      }
    });
    
    // Keyboard shortcuts
    monacoEditor.addCommand(Monaco.KeyMod.CtrlCmd | Monaco.KeyCode.KeyS, () => {
      saveContent();
    });
    
    // Switch to preview on Ctrl+Shift+P
    monacoEditor.addCommand(
      Monaco.KeyMod.CtrlCmd | Monaco.KeyMod.Shift | Monaco.KeyCode.KeyP, 
      () => {
        activeTab = 'preview';
      }
    );
  }
  
  // Initialize editor when component mounts or tab changes to edit
  $effect(() => {
    if (activeTab === 'edit') {
      initializeEditor();
    }
  });
  
  // Handle note changes (when switching between notes)
  $effect(() => {
    const noteId = note.id;
    content = note.content;
    title = note.title;
    isDirty = false;
    
    // If editor exists and we're in edit mode, update its content
    if (monacoEditor && activeTab === 'edit') {
      const currentValue = monacoEditor.getValue();
      if (currentValue !== note.content) {
        monacoEditor.setValue(note.content);
        
        // Update language mode
        const language = languageMap[note.type] || 'plaintext';
        const model = monacoEditor.getModel();
        if (model) {
          Monaco.editor.setModelLanguage(model, language);
        }
      }
    }
  });
  
  onDestroy(() => {
    clearTimeout(saveTimeout);
    if (isDirty) {
      saveContent();
    }
    if (monacoEditor) {
      monacoEditor.dispose();
      monacoEditor = null;
    }
  });
  
  function saveContent() {
    if (content !== note.content) {
      onUpdate({ content });
      isDirty = false;
    }
  }
  
  function saveTitle() {
    if (title !== note.title) {
      onUpdate({ title });
    }
  }
  
  function handleKeyDown(e: KeyboardEvent) {
    // Cmd/Ctrl + E to switch to edit mode
    if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
      e.preventDefault();
      activeTab = 'edit';
      setTimeout(() => monacoEditor?.focus(), 0);
    }
    // Cmd/Ctrl + P to switch to preview mode  
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
      e.preventDefault();
      activeTab = 'preview';
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="flex flex-col h-full">
  <!-- Header with title and tabs -->
  <div class="border-b bg-white">
    <div class="px-6 pt-4">
      <div class="flex items-center justify-between mb-3">
        <input 
          bind:value={title}
          onblur={saveTitle}
          onkeydown={(e) => e.key === 'Enter' && saveTitle()}
          class="text-2xl font-bold flex-1 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 -ml-2"
          placeholder="Untitled"
        />
        <div class="flex items-center gap-2">
          {#if isDirty}
            <span class="text-xs text-gray-500">Unsaved changes</span>
          {/if}
          <span class="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
            {config.name}
          </span>
          {#if onDelete}
            <button
              onclick={onDelete}
              class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
              aria-label="Delete note: {note.title}"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          {/if}
        </div>
      </div>
      
      <!-- Tabs -->
      <div class="flex gap-1" role="tablist">
        <button
          onclick={() => activeTab = 'edit'}
          class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors"
          class:bg-gray-100={activeTab === 'edit'}
          class:text-gray-900={activeTab === 'edit'}
          class:text-gray-600={activeTab !== 'edit'}
          class:hover:text-gray-900={activeTab !== 'edit'}
          role="tab"
          aria-selected={activeTab === 'edit'}
          aria-controls="edit-panel"
        >
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Edit
            {#if activeTab !== 'edit'}
              <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-gray-200 rounded">⌘E</kbd>
            {/if}
          </div>
        </button>
        <button
          onclick={() => { activeTab = 'preview'; saveContent(); }}
          class="px-4 py-2 text-sm font-medium rounded-t-lg transition-colors"
          class:bg-gray-100={activeTab === 'preview'}
          class:text-gray-900={activeTab === 'preview'}
          class:text-gray-600={activeTab !== 'preview'}
          class:hover:text-gray-900={activeTab !== 'preview'}
          role="tab"
          aria-selected={activeTab === 'preview'}
          aria-controls="preview-panel"
        >
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Preview
            {#if activeTab !== 'preview'}
              <kbd class="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-gray-200 rounded">⌘⇧P</kbd>
            {/if}
          </div>
        </button>
        
        <div class="flex-1"></div>
        
        {#if isDirty}
          <button
            onclick={saveContent}
            class="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
          >
            Save
            <kbd class="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 rounded">⌘S</kbd>
          </button>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Content area -->
  <div class="flex-1 overflow-hidden bg-white">
    <div class="h-full" style="display: {activeTab === 'edit' ? 'block' : 'none'}" role="tabpanel" id="edit-panel" aria-labelledby="edit-tab">
      <div bind:this={editorContainer} class="h-full"></div>
    </div>
    {#if activeTab === 'preview'}
      <div class="h-full overflow-y-auto" role="tabpanel" id="preview-panel" aria-labelledby="preview-tab">
        <div class="max-w-4xl mx-auto px-6 py-8">
          <Renderer 
            content={content}
            editable={false}
            onUpdate={() => {}}
          />
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Monaco Editor custom styles */
  :global(.monaco-editor .margin) {
    background-color: transparent !important;
  }
  
  :global(.monaco-editor) {
    font-feature-settings: "liga" on, "calt" on;
  }
</style>