<!-- src/lib/renderers/CodeRenderer.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import Prism from 'prismjs';
  import 'prismjs/themes/prism-tomorrow.css';
  
  interface Props {
    content: string;
    editable?: boolean;
    onUpdate?: (content: string) => void;
    language?: string;
  }
  
  let { content, editable = false, onUpdate, language = 'javascript' }: Props = $props();
  
  let editing = $state(false);
  let editContent = $state(content);
  let codeElement: HTMLElement;
  
  // Syntax highlighted HTML
  let highlightedCode = $state('');
  
  $effect(() => {
    if (!editing && content) {
      try {
        highlightedCode = Prism.highlight(
          content, 
          Prism.languages[language] || Prism.languages.plaintext, 
          language
        );
      } catch {
        highlightedCode = content;
      }
    }
  });
  
  function startEdit() {
    if (!editable) return;
    editing = true;
    editContent = content;
  }
  
  function save() {
    onUpdate?.(editContent);
    editing = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = editContent.substring(0, start) + '  ' + editContent.substring(end);
      editContent = newValue;
      // Reset cursor position after the indent
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    } else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      save();
    }
  }
</script>

{#if editing}
  <div class="editor">
    <div class="mb-2 flex items-center justify-between">
      <select 
        bind:value={language} 
        class="px-2 py-1 text-sm border rounded"
      >
        <option value="javascript">JavaScript</option>
        <option value="typescript">TypeScript</option>
        <option value="python">Python</option>
        <option value="css">CSS</option>
        <option value="html">HTML</option>
        <option value="sql">SQL</option>
        <option value="json">JSON</option>
        <option value="bash">Bash</option>
      </select>
      <div class="space-x-2">
        <button onclick={save} class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
          Save
        </button>
        <button onclick={() => editing = false} class="px-3 py-1 text-sm border rounded hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </div>
    <textarea 
      bind:value={editContent}
      onkeydown={handleKeydown}
      class="w-full h-96 p-4 font-mono text-sm bg-gray-900 text-gray-100 rounded"
      spellcheck="false"
    />
  </div>
{:else}
  <div 
    class="relative group"
    ondblclick={startEdit}
  >
    <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <span class="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">
        {language}
      </span>
    </div>
    <pre class="language-{language} rounded-lg"><code bind:this={codeElement} class="language-{language}">{@html highlightedCode}</code></pre>
    {#if editable}
      <div class="text-xs text-gray-500 mt-2">Double-click to edit</div>
    {/if}
  </div>
{/if}

<style>
  /* Override Prism theme for better contrast */
  :global(pre[class*="language-"]) {
    background: #1e1e1e;
    padding: 1rem;
    overflow-x: auto;
  }
</style>
