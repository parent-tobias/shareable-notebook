<!-- src/lib/renderers/PlaintextRenderer.svelte -->
<script lang="ts">
  interface Props {
    content: string;
    editable?: boolean;
    onUpdate?: (content: string) => void;
  }
  
  let { content, editable = false, onUpdate }: Props = $props();
  
  let editing = $state(false);
  let editContent = $state(content);
  let textarea = $state<HTMLTextAreaElement | undefined>();
  
  function startEdit() {
    if (!editable) return;
    editing = true;
    editContent = content;
    // Focus textarea after render
    setTimeout(() => textarea?.focus(), 0);
  }
  
  function save() {
    onUpdate?.(editContent);
    editing = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      editing = false;
    } else if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      save();
    }
  }
</script>

{#if editing}
  <div class="editor">
    <textarea 
      bind:this={textarea}
      bind:value={editContent} 
      onkeydown={handleKeydown}
      class="w-full h-96 p-4 font-mono text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Start typing..."
    ></textarea>
    <div class="mt-2 space-x-2">
      <button onclick={save} class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Save
      </button>
      <button onclick={() => editing = false} class="px-4 py-2 border rounded hover:bg-gray-100">
        Cancel
      </button>
    </div>
  </div>
{:else}
  <div 
    class="whitespace-pre-wrap font-mono text-sm p-4 min-h-[200px] rounded border border-transparent hover:border-gray-200 cursor-text"
    ondblclick={startEdit}
    role="button"
    tabindex="0"
    onkeypress={(e) => e.key === 'Enter' && startEdit()}
  >
    {content || 'Double-click to edit...'}
  </div>
{/if}