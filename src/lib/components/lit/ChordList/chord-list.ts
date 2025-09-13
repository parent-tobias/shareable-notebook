import { LitElement, css, html, type PropertyValues } from 'lit';
import { customElement, property, state, } from 'lit/decorators.js';

@customElement('chord-list')
export class ChordList extends LitElement {
	@property({
		type: String
	})
	instrument='Standard Ukulele';

	@property()
	chords: string = '[]';
	
	private get parsedChords(): string[] {
		try {
			return Array.isArray(this.chords) ? this.chords : JSON.parse(this.chords);
		} catch {
			return [];
		}
	}

	@state()
	numChords = 0;
	
	static styles = css`
	  :host {
			display: block;
			width: 100%;
      height: fit-content;
			container-type: inline-size;
		}

		header {
			margin-bottom: 0.5rem;
		}

		header h3 {
			margin: 0;
			font-size: 1rem;
			color: #f8f8f8;
		}

		.list {
	    display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 0.5rem;
      align-items: start;
		}

		/* Responsive adjustments for different container widths */
		@container (max-width: 400px) {
			.list {
				grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
				gap: 0.3rem;
			}
		}

		@container (min-width: 600px) {
			.list {
				grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
			}
		}

	`



	updated(changedProperties: PropertyValues<this>){
		if(changedProperties.has("chords"))
			this.numChords = this.parsedChords.length;
	}

	render(){
		return html`
			<header><h3>${this.instrument}</h3></header>
			<div class='list'>
				${this.parsedChords.map((chord)=>
					html`<chord-diagram chord=${chord} instrument='${this.instrument}'></chord-diagram>`
				)}
			</div>
		`;
	}
}