<!-- src/lib/renderers/MarkdownRenderer.svelte -->
<script lang="ts">
  import { marked } from 'marked';
  import DOMPurify from 'isomorphic-dompurify';
  
  interface Props {
    content: string;
    editable?: boolean;
    onUpdate?: (content: string) => void;
  }
  
  let { content, editable = false, onUpdate }: Props = $props();
  
  let editing = $state(false);
  let editContent = $state(content);
  
  const html = $derived(DOMPurify.sanitize(marked(content)));
  
  function startEdit() {
    editing = true;
    editContent = content;
  }
  
  function save() {
    onUpdate?.(editContent);
    editing = false;
  }
</script>

{#if editing}
  <div class="editor">
    <textarea bind:value={editContent} class="w-full h-64 p-4 border rounded"></textarea>
    <div class="mt-2 space-x-2">
      <button onclick={save} class="px-4 py-2 bg-blue-500 text-white rounded">
        Save
      </button>
      <button onclick={() => editing = false} class="px-4 py-2 border rounded">
        Cancel
      </button>
    </div>
  </div>
{:else}
  <div class="prose max-w-none" ondblclick={editable ? startEdit : undefined}>
    {@html html}
  </div>
{/if}