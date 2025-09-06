import {writable } from 'svelte/store';


export const rootDirHandle = writable(null);
export const activeWorkingHandle = writable(null);
export const activeWorkingSidebarNode = writable(null);
export const hasChanges = writable(false);

export const songText = writable('');