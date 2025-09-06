// src/lib/renderers/index.ts
import type { Component } from 'svelte';
import type { NoteType } from '$lib/types';
import MarkdownRenderer from './MarkdownRenderer.svelte';
import ChordProRenderer from './ChordProRenderer.svelte';
import PlaintextRenderer from './PlaintextRenderer.svelte';
import CodeRenderer from './CodeRenderer.svelte';

// Define the props interface that all renderers must accept
export interface RendererProps {
  content: string;
  editable?: boolean;
  onUpdate?: (content: string) => void;
}

// Define metadata for each renderer
export interface RendererConfig {
  component: Component<RendererProps>;
  name: string;
  description: string;
  icon?: string;
  defaultContent?: string;
  fileExtension?: string;
}

// Registry of all available renderers
const rendererRegistry: Record<NoteType, RendererConfig> = {
  markdown: {
    component: MarkdownRenderer,
    name: 'Markdown',
    description: 'Rich text with formatting, links, and images',
    icon: 'markdown',
    defaultContent: '# New Note\n\nStart writing your content here...',
    fileExtension: '.md'
  },
  chordpro: {
    component: ChordProRenderer,
    name: 'ChordPro',
    description: 'Song lyrics with chord notations',
    icon: 'music',
    defaultContent: '{title: New Song}\n{artist: Artist Name}\n\n[C]Start your [G]song here...',
    fileExtension: '.chopro'
  },
  plaintext: {
    component: PlaintextRenderer,
    name: 'Plain Text',
    description: 'Simple text without formatting',
    icon: 'text',
    defaultContent: '',
    fileExtension: '.txt'
  },
  code: {
    component: CodeRenderer,
    name: 'Code',
    description: 'Syntax-highlighted code editor',
    icon: 'code',
    defaultContent: '// Write your code here\n',
    fileExtension: '.js'
  }
};

/**
 * Get the renderer component for a specific note type
 */
export function getRenderer(type: NoteType): Component<RendererProps> {
  const config = rendererRegistry[type];
  if (!config) {
    console.warn(`No renderer found for type: ${type}, falling back to plaintext`);
    return rendererRegistry.plaintext.component;
  }
  return config.component;
}

/**
 * Get the full configuration for a renderer
 */
export function getRendererConfig(type: NoteType): RendererConfig {
  return rendererRegistry[type] || rendererRegistry.plaintext;
}

/**
 * Get all available renderer types
 */
export function getAvailableRenderers(): Array<{ type: NoteType; config: RendererConfig }> {
  return Object.entries(rendererRegistry).map(([type, config]) => ({
    type: type as NoteType,
    config
  }));
}

/**
 * Check if a renderer exists for a given type
 */
export function hasRenderer(type: string): type is NoteType {
  return type in rendererRegistry;
}

/**
 * Register a new custom renderer at runtime
 * Useful for plugins or dynamic renderer loading
 */
export function registerRenderer(type: string, config: RendererConfig): void {
  // This would need to be coordinated with the TypeScript types
  // In practice, you might want to handle custom types differently
  (rendererRegistry as any)[type] = config;
}

/**
 * Get default content for a note type
 */
export function getDefaultContent(type: NoteType): string {
  return getRendererConfig(type).defaultContent || '';
}

/**
 * Get file extension for export
 */
export function getFileExtension(type: NoteType): string {
  return getRendererConfig(type).fileExtension || '.txt';
}

// Export a type for the renderer component props
export type RendererComponent = Component<RendererProps>;