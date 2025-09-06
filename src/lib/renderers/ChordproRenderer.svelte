<!-- src/lib/renderers/ChordProRenderer.svelte -->
<script lang="ts">
  import chordsheetjs from 'chordsheetjs';
  
  import { onMount } from 'svelte';
  
  // Client-side only imports to avoid SSR issues
  onMount(async () => {
    // Import Lit components only on client side
    await import('../components/lit/Chord/chord.js');
    await import('../components/lit/ChordList/chord-list.js');
  });
  
  interface Props {
    content: string;
  }
  
  let { content }: Props = $props();
  
  // Use chordsheetjs for better formatting like your original
  const parser = new chordsheetjs.ChordProParser();
  const htmlFormatter = new chordsheetjs.HtmlDivFormatter();
  const textFormatter = new chordsheetjs.TextFormatter();
  
  let mode = $state<'html' | 'text'>('html');
  let showChords = $state(false);
  let selectedInstrument = $state('Standard Ukulele');
  
  // Format the chord sheet using your approach
  const formattedSheet = $derived(() => {
    if (!content) return undefined;
    try {
      const song = parser.parse(content);
      const formatter = mode === 'html' ? htmlFormatter : textFormatter;
      return formatter.format(song);
    } catch {
      return mode === 'html' ? '<div>Invalid ChordPro format</div>' : 'Invalid ChordPro format';
    }
  });
  
  // Extract unique chords for Lit component display
  const extractedChords = $derived(() => {
    try {
      const song = parser.parse(content);
      const chords = new Set<string>();
      
      song.lines.forEach((line: any) => {
        line.items.forEach((item: any) => {
          // ChordSheetJS ChordLyricsPair has chords as a string
          if (item.chords && typeof item.chords === 'string') {
            const chordString = item.chords.trim();
            if (chordString) {
              chords.add(chordString);
            }
          }
        });
      });
      
      return Array.from(chords).sort();
    } catch (error) {
      console.error('❌ Chord extraction error:', error);
      return [];
    }
  });
  
  // Available instruments from your music utils
  const availableInstruments = [
    'Standard Ukulele',
    'Baritone Ukulele', 
    '5ths tuned Ukulele',
    'Standard Guitar',
    'Drop-D Guitar'
  ];
</script>

<div class="songsheet-panel">
  <!-- Header controls -->
  <div class="chord-sheet-header">
    <div class="header-controls">
      <div class="mode-toggle">
        <button 
          class="mode-btn" 
          class:active={mode === 'html'}
          onclick={() => mode = 'html'}
        >
          Formatted
        </button>
        <button 
          class="mode-btn" 
          class:active={mode === 'text'}
          onclick={() => mode = 'text'}
        >
          Text
        </button>
      </div>
      
      {#if showChords}
        <label for="instrument-select" class="instrument-label">Instrument:</label>
        <select 
          id="instrument-select"
          bind:value={selectedInstrument}
          class="instrument-select"
        >
          {#each availableInstruments as instrument}
            <option value={instrument}>{instrument}</option>
          {/each}
        </select>
      {/if}
      
      <button 
        class="toggle-chords-btn"
        onclick={() => showChords = !showChords}
        aria-label="{showChords ? 'Hide' : 'Show'} chord charts"
      >
        {showChords ? 'Hide Chords' : 'Show Chords'}
      </button>
    </div>
  </div>
  
  <!-- Chord charts section -->
   <h3>Extracted chords length: { extractedChords().length }</h3>
  {#if showChords && extractedChords().length > 0}
    <div class="chord-charts-section">
      <chord-list 
        chords={JSON.stringify(extractedChords())}
        instrument={selectedInstrument}
      ></chord-list>
    </div>
  {/if}
  
  <!-- Song content using your styling approach -->
  <div class="chord-sheet-viewer" data-mode={mode}>
    {#if formattedSheet()}
      {#if mode === 'html'}
        {@html formattedSheet()}
      {:else}
        <pre>{formattedSheet()}</pre>
      {/if}
    {:else}
      <div>No content</div>
    {/if}
  </div>
</div>

<style>
  @charset "UTF-8";

  .songsheet-panel {
    box-sizing: border-box;
    height: 100%;
    background-color: #2F3131;
    color: #f8f8f8;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    font-size: 1em;
    margin: 0;
    max-height: 100%;
    min-height: 100%;
    padding: 20px;
  }

  .chord-sheet-header {
    margin-bottom: 1rem;
    flex-shrink: 0;
  }

  .header-controls {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .mode-toggle {
    display: flex;
    background: #4a5568;
    border-radius: 6px;
    overflow: hidden;
  }

  .mode-btn {
    padding: 6px 12px;
    background: transparent;
    color: #f8f8f8;
    border: none;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .mode-btn.active {
    background: #3182ce;
  }

  .mode-btn:hover:not(.active) {
    background: #2d3748;
  }

  .instrument-label {
    font-size: 14px;
    font-weight: 500;
    color: #f8f8f8;
  }

  .instrument-select {
    padding: 6px 12px;
    border: 1px solid #4a5568;
    border-radius: 6px;
    background: #2d3748;
    color: #f8f8f8;
    font-size: 14px;
    min-width: 150px;
  }

  .instrument-select:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }

  .toggle-chords-btn {
    padding: 8px 16px;
    background: #3182ce;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .toggle-chords-btn:hover {
    background: #2c5aa0;
  }

  .chord-charts-section {
    margin-bottom: 2rem;
    padding: 1rem;
    background: #4a5568;
    border-radius: 8px;
    border: 1px solid #2d3748;
    flex-shrink: 0;
  }

  .chord-sheet-viewer {
    background-color: antiquewhite;
    color: #2F3131;
    flex: 1 0 auto;
    overflow: auto;
    padding: 10px;
    white-space: pre;
    width: 100%;
  }

  .chord-sheet-viewer[data-mode=text] {
    font-family: Inconsolata, Monaco, "Andale Mono", "Lucida Console", "Bitstream Vera Sans Mono", "Courier New", Courier, monospace;
    font-size: 14px;
    outline-color: rgba(248, 248, 248, 0.5);
    transition: background-color 100ms ease-out;
    text-align: left;
  }

  .chord-sheet-viewer[data-mode=html] :global(h2) {
    font-size: 1.1em;
  }

  .chord-sheet-viewer[data-mode=html] :global(.chord) {
    font-weight: 600;
  }

  .chord-sheet-viewer[data-mode=html] :global(.chord:not(:last-child)) {
    padding-right: 10px;
  }

  .chord-sheet-viewer[data-mode=html] :global(.empty-line) {
    height: 1em;
  }

  .chord-sheet-viewer[data-mode=html] :global(.paragraph) {
    margin-bottom: 1em;
  }

  .chord-sheet-viewer[data-mode=html] :global(.chord:after),
  .chord-sheet-viewer[data-mode=html] :global(.lyrics:after) {
    content: "​";
  }

  .chord-sheet-viewer[data-mode=html] :global(.row) {
    display: flex;
    line-height: 150%;
  }
</style>