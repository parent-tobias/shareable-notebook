import { LitElement, css, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

// given an instrument and a chord, we should be able to generate a chord chart dynamically.
import { instruments, chordOnInstrument, chordToNotes } from "../../../services/music/musicUtils";
import { systemDefaultChords } from "../../../services/music/systemDefaultChords";

import { SVGuitarChord } from 'svguitar';


@customElement('chord-diagram')
export class ChordDiagram extends LitElement {

	static styles = css`
	:host {
		display: block;
		width: 100%;
		min-width: 100px;
		max-width: 150px;
		border: 1px solid #4a5568;
		border-radius: 4px;
		background: #2d3748;
		padding: 0.5rem;
		box-sizing: border-box;
	}

	.chord {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
	}

	.chord span {
		color: #f8f8f8;
		font-size: 0.9rem;
		font-weight: 500;
		margin-bottom: 0.25rem;
		text-align: center;
	}

	.diagram {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.diagram :global(svg) {
		max-width: 100%;
		height: auto;
	}
	`
	@property({
		type: String
	})
	instrument='Standard Ukulele';

	@property({
		type: String
	})
	chord='';

	@query('.diagram')
	container?:HTMLElement;

  render() {
			const instrumentObject = instruments.find(({name})=>name===this.instrument) ?? {name: 'None', strings: [], frets: 0};

			const chordFinder = chordOnInstrument(
				instrumentObject
			);
	
			// given the chord name (G7, Bbmin), we need the notes in the chord
			const chordObject = chordToNotes(this.chord);
	
			if(!chordObject) return;
	
			
			const chartSettings = systemDefaultChords[this.instrument] && systemDefaultChords[this.instrument][this.chord]?
				systemDefaultChords[this.instrument][this.chord] : 
				{
					barres: [],
					fingers: chordFinder(chordObject) || []
				};
	
				let arrayOfFrets:number[] = chartSettings.fingers.map( ([,fret]):number=>typeof fret==='number'? fret : Infinity);

				let maxFrets = Math.max(...arrayOfFrets );
				maxFrets = maxFrets >=4 ? maxFrets : 4;
	
			let divEl = document.createElement("div");

			const chart = new SVGuitarChord(divEl);
			chart
				.configure({
					strings: instrumentObject?.strings.length,
					frets: maxFrets,
					position: 1,
					tuning: [...instrumentObject?.strings]
				})
				.chord(chartSettings)
				.draw();


    return html`
		<div class='chord'>
      <span>${this.chord.replace(/(maj)$/, '')}</span>
      <div class='diagram'>${divEl.firstChild}</div>
    </div>
    `
  }

}

