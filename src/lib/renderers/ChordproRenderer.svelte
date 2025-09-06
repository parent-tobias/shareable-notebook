<!-- src/lib/renderers/ChordProRenderer.svelte -->
<script lang="ts">

    /*****
     * TODO: 
     * - Add back in the chordpro editing capabilities
     * - Add in chord chart from lit repository
     *****/
  import ChordSheetJS from 'chordsheetjs';
  
  interface Props {
    content: string;
    editable?: boolean;
    onUpdate?: (content: string) => void;
  }
  
  let { content, editable = false, onUpdate }: Props = $props();
  
  const parser = new ChordSheetJS.ChordProParser();
  const formatter = new ChordSheetJS.HtmlDivFormatter();
  
  const html = $derived(() => {
    try {
      const song = parser.parse(content);
      return formatter.format(song);
    } catch {
      return '<div>Invalid ChordPro format</div>';
    }
  });
</script>

<div class="chord-sheet">
  {@html html()}
</div>

<style>
  :global(.chord-sheet .chord) {
    font-weight: bold;
    color: #2563eb;
  }
  :global(.chord-sheet .verse) {
    margin-bottom: 1rem;
  }
</style>