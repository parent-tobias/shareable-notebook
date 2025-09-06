import { D as getContext, E as store_get, F as attr_class, G as escape_html, I as unsubscribe_stores, B as pop, z as push } from "../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../chunks/exports.js";
import "../../chunks/utils.js";
import "clsx";
import "../../chunks/state.svelte.js";
import { a as authStore } from "../../chunks/auth.svelte.js";
const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _layout($$payload, $$props) {
  push();
  var $$store_subs;
  let { children } = $$props;
  const user = authStore.user;
  const loading = authStore.loading;
  const isAuthPage = store_get($$store_subs ??= {}, "$page", page).route.id === "/auth";
  if (loading) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="min-h-screen flex items-center justify-center bg-gray-50"><div class="text-center"><div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div> <p class="mt-4 text-gray-600">Loading...</p></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
    if (!user && !isAuthPage) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="min-h-screen flex items-center justify-center bg-gray-50"><p class="text-gray-600">Redirecting to login...</p></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="min-h-screen bg-gray-50">`);
      if (user) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50">Skip to main content</a> <header class="bg-white border-b border-gray-200"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="flex justify-between items-center h-16"><div class="flex items-center space-x-8"><a href="/" class="flex items-center space-x-2" aria-label="Go to home page"><svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg> <span class="text-xl font-semibold">Notebooks</span></a> <nav class="hidden md:flex space-x-4" aria-label="Main navigation"><a href="/"${attr_class("px-3 py-2 rounded-md text-sm font-medium transition-colors", void 0, {
          "bg-gray-100": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/",
          "text-gray-900": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/",
          "text-gray-700": store_get($$store_subs ??= {}, "$page", page).url.pathname !== "/",
          "hover:text-gray-900": store_get($$store_subs ??= {}, "$page", page).url.pathname !== "/"
        })}>My Notebooks</a> <a href="/shared"${attr_class("px-3 py-2 rounded-md text-sm font-medium transition-colors", void 0, {
          "bg-gray-100": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/shared",
          "text-gray-900": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/shared",
          "text-gray-700": store_get($$store_subs ??= {}, "$page", page).url.pathname !== "/shared",
          "hover:text-gray-900": store_get($$store_subs ??= {}, "$page", page).url.pathname !== "/shared"
        })}>Shared with Me</a> <a href="/explore"${attr_class("px-3 py-2 rounded-md text-sm font-medium transition-colors", void 0, {
          "bg-gray-100": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/explore",
          "text-gray-900": store_get($$store_subs ??= {}, "$page", page).url.pathname === "/explore",
          "text-gray-700": store_get($$store_subs ??= {}, "$page", page).url.pathname !== "/explore",
          "hover:text-gray-900": store_get($$store_subs ??= {}, "$page", page).url.pathname !== "/explore"
        })}>Explore Public</a></nav></div> <div class="flex items-center space-x-4"><button class="p-2 text-gray-500 hover:text-gray-700" aria-label="Search"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button> <div class="relative group"><button class="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100" aria-label="User menu" aria-expanded="false" aria-haspopup="true"><div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">${escape_html(user.email?.[0].toUpperCase())}</div> <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button> <div class="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50" role="menu" aria-orientation="vertical"><div class="py-1"><div class="px-4 py-2 text-sm text-gray-700 border-b">${escape_html(user.email)}</div> <a href="/settings" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a> <button class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign Out</button></div></div></div></div></div></div></header>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--> <main id="main-content">`);
      children($$payload);
      $$payload.out.push(`<!----></main></div>`);
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _layout as default
};
