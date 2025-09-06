import { z as push, B as pop, N as attr, G as escape_html, O as stringify, F as attr_class, M as ensure_array_like } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils.js";
import "../../../../chunks/state.svelte.js";
import { n as notebookStore } from "../../../../chunks/notebook.svelte.js";
import "clsx";
import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import ChordSheetJS from "chordsheetjs";
import "../../../../chunks/lit-components.js";
import "prismjs";
function html(value) {
  var html2 = String(value ?? "");
  var open = "<!---->";
  return open + html2 + "<!---->";
}
function MarkdownRenderer($$payload, $$props) {
  push();
  let { content, editable = false, onUpdate } = $$props;
  const html$1 = DOMPurify.sanitize(marked(content));
  {
    $$payload.out.push("<!--[!-->");
    if (editable) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<button class="prose max-w-none text-left w-full">${html(html$1)}</button>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="prose max-w-none">${html(html$1)}</div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function ChordproRenderer($$payload, $$props) {
  push();
  let { content, editable = false, onUpdate } = $$props;
  const parser = new ChordSheetJS.ChordProParser();
  const formatter = new ChordSheetJS.HtmlDivFormatter();
  const html$1 = () => {
    try {
      const song = parser.parse(content);
      return formatter.format(song);
    } catch {
      return "<div>Invalid ChordPro format</div>";
    }
  };
  $$payload.out.push(`<div class="chord-sheet-container svelte-11fyxl1"><div class="chord-sheet-header svelte-11fyxl1"><div class="header-controls svelte-11fyxl1">`);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <button class="toggle-chords-btn svelte-11fyxl1"${attr("aria-label", `${stringify("Show")} chord charts`)}>${escape_html("Show Chords")}</button></div></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <div class="chord-sheet">${html(html$1())}</div></div>`);
  pop();
}
function PlaintextRenderer($$payload, $$props) {
  push();
  let { content, editable = false, onUpdate } = $$props;
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="whitespace-pre-wrap font-mono text-sm p-4 min-h-[200px] rounded border border-transparent hover:border-gray-200 cursor-text" role="button" tabindex="0">${escape_html(content || "Double-click to edit...")}</div>`);
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
function CodeRenderer($$payload, $$props) {
  push();
  let { content, editable = false, onUpdate, language = "javascript" } = $$props;
  let highlightedCode = "";
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="relative group"><div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><span class="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded">${escape_html(language)}</span></div> <pre${attr_class(`language-${stringify(language)} rounded-lg`)}><code${attr_class(`language-${stringify(language)}`)}>${html(highlightedCode)}</code></pre> `);
    if (editable) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="text-xs text-gray-500 mt-2">Double-click to edit</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div>`);
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
const rendererRegistry = {
  markdown: {
    component: MarkdownRenderer,
    name: "Markdown",
    description: "Rich text with formatting, links, and images",
    icon: "markdown",
    defaultContent: "# New Note\n\nStart writing your content here...",
    fileExtension: ".md"
  },
  chordpro: {
    component: ChordproRenderer,
    name: "ChordPro",
    description: "Song lyrics with chord notations",
    icon: "music",
    defaultContent: "{title: New Song}\n{artist: Artist Name}\n\n[C]Start your [G]song here...",
    fileExtension: ".chopro"
  },
  plaintext: {
    component: PlaintextRenderer,
    name: "Plain Text",
    description: "Simple text without formatting",
    icon: "text",
    defaultContent: "",
    fileExtension: ".txt"
  },
  code: {
    component: CodeRenderer,
    name: "Code",
    description: "Syntax-highlighted code editor",
    icon: "code",
    defaultContent: "// Write your code here\n",
    fileExtension: ".js"
  }
};
function getRendererConfig(type) {
  return rendererRegistry[type] || rendererRegistry.plaintext;
}
function getAvailableRenderers() {
  return Object.entries(rendererRegistry).map(([type, config]) => ({
    type,
    config
  }));
}
function _page($$payload, $$props) {
  push();
  const notebook = notebookStore.currentNotebook;
  const notes = notebookStore.sortedNotes;
  const syncStatus = notebookStore.syncStatus;
  getAvailableRenderers();
  let selectedNote = null;
  const each_array_1 = ensure_array_like(notes);
  $$payload.out.push(`<div class="flex h-screen"><aside class="w-64 border-r bg-gray-50 p-4 flex flex-col"><div class="mb-4"><h2 class="text-lg font-semibold">${escape_html(notebook?.title)}</h2> <div class="text-sm text-gray-500">`);
  if (syncStatus.syncing) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`Syncing...`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (syncStatus.lastSynced) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`Last synced: ${escape_html(syncStatus.lastSynced.toLocaleTimeString())}`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`Not synced`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div></div> <div class="mb-4 space-y-2">`);
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<button class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">New Note</button> <button class="w-full px-4 py-1 text-sm text-gray-600 hover:text-gray-800">Quick Create →</button>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="flex-1 overflow-y-auto space-y-2"><!--[-->`);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let note = each_array_1[$$index_1];
    $$payload.out.push(`<div${attr_class("w-full p-2 rounded hover:bg-gray-100 group relative", void 0, { "bg-blue-100": selectedNote?.id === note.id })}><button class="w-full text-left"><div class="flex items-start justify-between"><div class="flex-1 min-w-0 pr-6"><div class="font-medium truncate">${escape_html(note.title)}</div> <div class="text-xs text-gray-500 flex items-center gap-1"><span class="inline-block px-1.5 py-0.5 bg-gray-200 rounded text-xs">${escape_html(getRendererConfig(note.type).name)}</span></div></div></div></button> <button class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded"${attr("aria-label", `Delete note: ${stringify(note.title)}`)}><svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>`);
  }
  $$payload.out.push(`<!--]--></div></aside> <main class="flex-1 flex flex-col overflow-hidden">`);
  {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<div class="flex items-center justify-center h-full text-gray-400"><div class="text-center"><svg class="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <p class="mt-2">Select a note or create a new one</p></div></div>`);
  }
  $$payload.out.push(`<!--]--></main></div> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
export {
  _page as default
};
