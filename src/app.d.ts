// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	
	// Custom element type definitions for Lit components
	namespace svelteHTML {
		interface IntrinsicElements {
			'chord-diagram': {
				chord?: string;
				instrument?: string;
			};
			'chord-list': {
				chords?: string[];
				instrument?: string;
			};
		}
	}
}

export {};
