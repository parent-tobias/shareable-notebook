import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		include: ['monaco-editor', 'lit', 'lit/decorators.js', 'svguitar']
	},
	worker: {
		format: 'es',
		rollupOptions: {
			output: {
				sourcemap: true
			}
		}
	},
	// Enable source maps for development
	css: {
		devSourcemap: true
	},
	build: {
		sourcemap: true, // Enable source maps for production builds too
		rollupOptions: {
			output: {
				sourcemap: true,
				manualChunks: (id) => {
					// Handle lit and svguitar chunks
					if (id.includes('lit') && !id.includes('node_modules')) {
						return 'lit-components';
					}
					if (id.includes('svguitar')) {
						return 'svguitar';
					}
				}
			}
		}
	},
	// Configure for web components and source maps
	define: {
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
	}
});
