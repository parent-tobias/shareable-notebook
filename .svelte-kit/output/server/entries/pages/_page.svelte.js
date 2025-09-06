import { G as escape_html, M as ensure_array_like, N as attr, F as attr_class, O as stringify, B as pop, z as push } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "../../chunks/state.svelte.js";
import { n as notebookStore } from "../../chunks/notebook.svelte.js";
import { a as authStore } from "../../chunks/auth.svelte.js";
function _page($$payload, $$props) {
  push();
  const notebooks = notebookStore.notebooks;
  authStore.user;
  let searchQuery = "";
  let viewMode = "grid";
  const filteredNotebooks = notebooks.filter((nb) => nb.title.toLowerCase().includes(searchQuery.toLowerCase()) || nb.description?.toLowerCase().includes(searchQuery.toLowerCase()));
  const recentNotebooks = [...notebooks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 3);
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = /* @__PURE__ */ new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1e3 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  $$payload.out.push(`<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="mb-8"><h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1> <p class="text-gray-600">You have ${escape_html(notebooks.length)} notebook${escape_html(notebooks.length !== 1 ? "s" : "")}</p></div> `);
  if (recentNotebooks.length > 0) {
    $$payload.out.push("<!--[-->");
    const each_array = ensure_array_like(recentNotebooks);
    $$payload.out.push(`<section class="mb-8" aria-labelledby="recent-notebooks"><h2 id="recent-notebooks" class="text-lg font-semibold text-gray-900 mb-4">Recent Notebooks</h2> <div class="grid grid-cols-1 md:grid-cols-3 gap-4"><!--[-->`);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let notebook = each_array[$$index];
      $$payload.out.push(`<button class="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"><div class="flex items-start justify-between"><div class="flex-1"><h3 class="font-medium text-gray-900 truncate">${escape_html(notebook.title)}</h3> <p class="text-sm text-gray-500 mt-1">Updated ${escape_html(formatDate(notebook.updated_at))}</p></div> <svg class="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></div></button>`);
    }
    $$payload.out.push(`<!--]--></div></section>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> <section class="mb-6 flex flex-col sm:flex-row gap-4" aria-label="Notebook management"><div class="flex-1 relative"><label for="search-notebooks" class="sr-only">Search notebooks</label> <input id="search-notebooks" type="text"${attr("value", searchQuery)} placeholder="Search notebooks..." class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/> <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div> <div class="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg p-1"><button${attr_class("p-1.5 rounded", void 0, { "bg-gray-100": viewMode === "grid" })} aria-label="Switch to grid view"${attr("aria-pressed", viewMode === "grid")}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg></button> <button${attr_class("p-1.5 rounded", void 0, { "bg-gray-100": viewMode === "list" })} aria-label="Switch to list view"${attr("aria-pressed", viewMode === "list")}><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button></div> <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> <span>New Notebook</span></button></section> <main aria-label="Notebooks list">`);
  if (filteredNotebooks.length === 0) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300"><svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> <h3 class="mt-2 text-sm font-medium text-gray-900">No notebooks</h3> <p class="mt-1 text-sm text-gray-500">Get started by creating a new notebook.</p> <div class="mt-6"><button class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Create your first notebook</button></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    {
      $$payload.out.push("<!--[-->");
      const each_array_1 = ensure_array_like(filteredNotebooks);
      $$payload.out.push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><!--[-->`);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let notebook = each_array_1[$$index_1];
        $$payload.out.push(`<div class="bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all group relative"><button class="w-full text-left p-6 rounded-lg"><div class="flex items-start justify-between mb-4"><h3 class="text-lg font-semibold text-gray-900 truncate flex-1 pr-8">${escape_html(notebook.title)}</h3></div> `);
        if (notebook.description) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<p class="text-gray-600 text-sm mb-4 line-clamp-2">${escape_html(notebook.description)}</p>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--> <div class="flex items-center text-xs text-gray-500"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${escape_html(formatDate(notebook.updated_at))}</div></button> <button class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"${attr("aria-label", `Delete notebook: ${stringify(notebook.title)}`)}><svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>`);
      }
      $$payload.out.push(`<!--]--></div>`);
    }
    $$payload.out.push(`<!--]-->`);
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
