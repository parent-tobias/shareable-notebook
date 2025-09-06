var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name, symbol) => (symbol = Symbol[name]) ? symbol : Symbol.for("Symbol." + name);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name]() {
    return __privateGet(this, extra);
  }, set [name](x) {
    return __privateSet(this, extra, x);
  } }, name));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name) : __name(target, name);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name, desc), p ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _container_dec, _chord_dec, _instrument_dec, _a, _ChordDiagram_decorators, _init, _numChords_dec, _chords_dec, _instrument_dec2, _b, _ChordList_decorators, _init2;
import { LitElement, css, html } from "lit";
import { property, query, customElement, state } from "lit/decorators.js";
import { SVGuitarChord } from "svguitar";
const keys = [
  { key: "A", accidental: "#", relativeMinor: "F#" },
  { key: "A#", accidental: "#", relativeMinor: "G" },
  { key: "Bb", accidental: "b", relativeMinor: "G" },
  { key: "B", accidental: "#", relativeMinor: "G#" },
  { key: "C", accidental: "b", relativeMinor: "A" },
  { key: "C#", accidental: "#", relativeMinor: "A#" },
  { key: "Db", accidental: "b", relativeMinor: "Bb" },
  { key: "D", accidental: "#", relativeMinor: "B" },
  { key: "D#", accidental: "#", relativeMinor: "C" },
  { key: "Eb", accidental: "b", relativeMinor: "C" },
  { key: "E", accidental: "#", relativeMinor: "C#" },
  { key: "F", accidental: "b", relativeMinor: "D" },
  { key: "F#", accidental: "#", relativeMinor: "D#" },
  { key: "Gb", accidental: "b", relativeMinor: "Eb" },
  { key: "G", accidental: "#", relativeMinor: "E" },
  { key: "G#", accidental: "#", relativeMinor: "F" },
  { key: "Ab", accidental: "b", relativeMinor: "F" }
];
const notes = [
  ["A"],
  ["A#", "Bb"],
  ["B"],
  ["C"],
  ["C#", "Db"],
  ["D"],
  ["D#", "Eb"],
  ["E"],
  ["F"],
  ["F#", "Gb"],
  ["G"],
  ["G#", "Ab"]
];
const chords = [
  { variant: "maj", tones: [0, 4, 7] },
  { variant: "m", tones: [0, 3, 7] },
  { variant: "min", tones: [0, 3, 7] },
  { variant: "dim", tones: [0, 3, 6] },
  { variant: "aug", tones: [0, 4, 8] },
  { variant: "7", tones: [0, 4, 7, 10] },
  { variant: "m7", tones: [0, 3, 7, 10] },
  { variant: "maj7", tones: [0, 4, 7, 11] },
  { variant: "aug7", tones: [0, 4, 8, 10] },
  { variant: "dim7", tones: [0, 3, 6, 9] },
  { variant: "m7b5", tones: [0, 3, 6, 10] },
  { variant: "mMaj7", tones: [0, 3, 7, 11] },
  { variant: "sus2", tones: [0, 2, 7] },
  { variant: "sus4", tones: [0, 5, 7] },
  { variant: "7sus2", tones: [0, 2, 7, 10] },
  { variant: "7sus4", tones: [0, 5, 7, 10] },
  { variant: "9", tones: [0, 4, 7, 10, 14] },
  { variant: "m9", tones: [0, 3, 7, 10, 14] },
  { variant: "maj9", tones: [0, 4, 7, 11, 14] },
  { variant: "11", tones: [0, 4, 7, 10, 14, 17] },
  { variant: "m11", tones: [0, 3, 7, 10, 14, 17] },
  { variant: "13", tones: [0, 4, 7, 10, 14, 17, 21] },
  { variant: "m13", tones: [0, 3, 7, 10, 14, 17, 21] },
  { variant: "5", tones: [0, 7] },
  { variant: "6", tones: [0, 4, 7, 9] },
  { variant: "m6", tones: [0, 3, 7, 9] },
  { variant: "add9", tones: [0, 4, 7, 14] },
  { variant: "mAdd9", tones: [0, 3, 7, 14] }
];
const instruments = [
  { name: "Standard Ukulele", strings: ["G", "C", "E", "A"], frets: 19 },
  { name: "Baritone Ukulele", strings: ["D", "G", "B", "E"], frets: 19 },
  { name: "5ths tuned Ukulele", strings: ["C", "G", "D", "A"], frets: 19 },
  { name: "Standard Guitar", strings: ["E", "A", "D", "G", "B", "E"], frets: 15 },
  { name: "Drop-D Guitar", strings: ["D", "A", "D", "G", "B", "E"], frets: 15 },
  { name: "Standard Mandolin", strings: ["G", "D", "A", "E"], frets: 20 }
];
const keyChordRegex = /\[([A-Ga-g](?:#|b)?)(m|min|maj|aug|dim|7|m7|maj7|aug7|dim7|m7b5|mMaj7|sus2|sus4|7sus2|7sus4|9|m9|maj9|11|m11|13|m13|5|6|m6|add9|mAdd9)?(-[a-zA-Z0-9]*)?\]/gm;
const parseChords = (string) => {
  const chordMap = /* @__PURE__ */ new Map();
  [...string.matchAll(keyChordRegex)].forEach(([, key, chord, alt]) => {
    chordMap.set(`${key}${chord ? chord : ""}${alt ? alt : ""}`, { key, chord, alt });
  });
  return chordMap;
};
const chordOnInstrument = (instrument) => (chord) => {
  if (!instrument || !chord) return;
  const { strings } = instrument;
  return [...strings].reverse().map((note, index) => {
    let fret = 0;
    let baseIndex = findBase(note);
    let noteNames = notes[baseIndex];
    while (noteNames.every((noteName) => !chord?.notes?.includes(noteName))) {
      ++fret;
      noteNames = notes[(fret + baseIndex) % notes.length];
    }
    return [index + 1, fret];
  });
};
const findBase = (note) => notes.findIndex((tone) => tone.includes(note));
const chordToNotes = (chordName) => {
  const chordData = Array.from(parseChords(`[${chordName}]`));
  if (!chordData || !chordData.length) return { name: "", notes: [] };
  const [, { key, chord, alt }] = chordData[0];
  const { accidental } = keys.find(
    (keySignature) => keySignature.key === key
  ) ?? { accidental: "" };
  const baseIndex = findBase(key);
  return {
    name: `${key}${chord ? chord : ""}${alt ? alt : ""}`,
    notes: chords.find((chordName2) => chord ? chordName2.variant === chord : chordName2.variant === "maj")?.tones.map(
      (tone) => notes[(tone + baseIndex) % notes.length].find((note, _, arr) => arr.length > 1 && accidental ? note.endsWith(accidental) : arr[0])
    )
  };
};
const systemDefaultChords = {
  "Standard Ukulele": {
    "Cm": {
      "barres": [],
      "fingers": [
        [3, 3],
        [2, 3],
        [1, 3]
      ]
    },
    "Cm7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 3,
        "text": "1"
      }],
      "fingers": []
    },
    "Cdim": {
      "barres": [],
      "fingers": [
        [4, 2],
        [3, 3],
        [2, 2],
        [1, 3]
      ]
    },
    "C9": {
      "barres": [],
      "fingers": [
        [3, 2],
        [1, 1]
      ]
    },
    "C#maj": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": [
        [1, 4]
      ]
    },
    "C#7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": [
        [1, 2]
      ]
    },
    "C#m7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 4
      }],
      "fingers": []
    },
    "C#dim": {
      "barres": [],
      "fingers": [
        [3, 1],
        [1, 1]
      ]
    },
    "C#6": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": []
    },
    "C#maj7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": [
        [1, 3]
      ]
    },
    "C#9": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": [
        [3, 3],
        [1, 2]
      ]
    },
    "Dbmaj": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": [
        [1, 4]
      ]
    },
    "Db7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": [
        [1, 2]
      ]
    },
    "Dbm7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 4
      }],
      "fingers": []
    },
    "Dbdim": {
      "barres": [],
      "fingers": [
        [3, 1],
        [1, 1]
      ]
    },
    "Db6": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": []
    },
    "Dbmaj7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": [
        [1, 3]
      ]
    },
    "Db9": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": [
        [3, 3],
        [1, 2]
      ]
    },
    "Dmaj": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 2
      }],
      "fingers": [
        [1, 4]
      ]
    },
    "D7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 2
      }],
      "fingers": [
        [1, 3]
      ]
    },
    "Dm7": {
      "barres": [],
      "fingers": [
        [4, 2],
        [3, 2],
        [2, 1],
        [1, 3]
      ]
    },
    "Ddim": {
      "barres": [],
      "fingers": [
        [4, 1],
        [3, 2],
        [2, 1],
        [1, 2]
      ]
    },
    "D6": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 2
      }],
      "fingers": []
    },
    "Dmaj7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 2
      }],
      "fingers": [
        [1, 4]
      ]
    },
    "D9": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 2
      }],
      "fingers": [
        [3, 4],
        [1, 3]
      ]
    },
    "D#maj": {
      "barres": [],
      "fingers": [
        [4, 3],
        [3, 3],
        [2, 3],
        [1, 1]
      ]
    },
    "D#7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 3
      }],
      "fingers": [
        [1, 4]
      ]
    },
    "D#m7": {
      "barres": [],
      "fingers": [
        [4, 3],
        [3, 3],
        [2, 2],
        [1, 4]
      ]
    },
    "D#dim": {
      "barres": [],
      "fingers": [
        [4, 2],
        [3, 3],
        [2, 2],
        [1, 3]
      ]
    },
    "D#aug": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": [
        [4, 2],
        [1, 4]
      ]
    },
    "D#6": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 3
      }],
      "fingers": []
    },
    "D#maj7": {
      "barres": [{
        "fromString": 4,
        "toString": 2,
        "fret": 3
      }],
      "fingers": []
    },
    "D#9": {
      "barres": [{
        "fromString": 3,
        "toString": 1,
        "fret": 1
      }],
      "fingers": []
    },
    "Ebmaj": {
      "barres": [],
      "fingers": [
        [4, 3],
        [3, 3],
        [2, 3],
        [1, 1]
      ]
    },
    "Eb7": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 3
      }],
      "fingers": [
        [1, 4]
      ]
    },
    "Ebm7": {
      "barres": [],
      "fingers": [
        [4, 3],
        [3, 3],
        [2, 2],
        [1, 4]
      ]
    },
    "Ebdim": {
      "barres": [],
      "fingers": [
        [4, 2],
        [3, 3],
        [2, 2],
        [1, 3]
      ]
    },
    "Ebaug": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 1
      }],
      "fingers": [
        [4, 2],
        [1, 4]
      ]
    },
    "Eb6": {
      "barres": [{
        "fromString": 4,
        "toString": 1,
        "fret": 3
      }],
      "fingers": []
    },
    "Ebmaj7": {
      "barres": [{
        "fromString": 4,
        "toString": 2,
        "fret": 3
      }],
      "fingers": []
    },
    "Eb9": {
      "barres": [{
        "fromString": 3,
        "toString": 1,
        "fret": 1
      }],
      "fingers": []
    }
  }
};
_ChordDiagram_decorators = [customElement("chord-diagram")];
class ChordDiagram extends (_a = LitElement, _instrument_dec = [property({
  type: String
})], _chord_dec = [property({
  type: String
})], _container_dec = [query(".diagram")], _a) {
  constructor() {
    super(...arguments);
    __publicField(this, "instrument", __runInitializers(_init, 8, this, "Standard Ukulele")), __runInitializers(_init, 11, this);
    __publicField(this, "chord", __runInitializers(_init, 12, this, "")), __runInitializers(_init, 15, this);
    __publicField(this, "container", __runInitializers(_init, 16, this)), __runInitializers(_init, 19, this);
  }
  render() {
    const instrumentObject = instruments.find(({ name }) => name === this.instrument) ?? { strings: [] };
    const chordFinder = chordOnInstrument(
      instrumentObject
    );
    const chordObject = chordToNotes(this.chord);
    if (!chordObject) return;
    const chartSettings = systemDefaultChords[this.instrument] && systemDefaultChords[this.instrument][this.chord] ? systemDefaultChords[this.instrument][this.chord] : {
      barres: [],
      fingers: chordFinder(chordObject) || []
    };
    let arrayOfFrets = chartSettings.fingers.map(([, fret]) => typeof fret === "number" ? fret : Infinity);
    let maxFrets = Math.max(...arrayOfFrets);
    maxFrets = maxFrets >= 4 ? maxFrets : 4;
    let divEl = document.createElement("div");
    const chart = new SVGuitarChord(divEl);
    chart.configure({
      strings: instrumentObject?.strings.length,
      frets: maxFrets,
      position: 1,
      tuning: [...instrumentObject?.strings]
    }).chord(chartSettings).draw();
    return html`
		<div class='chord chart'>
      <span>${this.chord.replace(/(maj)$/, "")}</span>
      <div class='diagram'>${divEl.firstChild}</div>  
    </div>
    `;
  }
}
_init = __decoratorStart(_a);
__decorateElement(_init, 5, "instrument", _instrument_dec, ChordDiagram);
__decorateElement(_init, 5, "chord", _chord_dec, ChordDiagram);
__decorateElement(_init, 5, "container", _container_dec, ChordDiagram);
ChordDiagram = __decorateElement(_init, 0, "ChordDiagram", _ChordDiagram_decorators, ChordDiagram);
__publicField(ChordDiagram, "styles", css`
	:host {
		display: inline-block;
		width: 100px;
		border: 1px solid silver;
		box-sizing: border-box;
	}
	.diagram {
		width: 100%;
	}
	`);
__runInitializers(_init, 1, ChordDiagram);
_ChordList_decorators = [customElement("chord-list")];
class ChordList extends (_b = LitElement, _instrument_dec2 = [property({
  type: String
})], _chords_dec = [property()], _numChords_dec = [state()], _b) {
  constructor() {
    super(...arguments);
    __publicField(this, "instrument", __runInitializers(_init2, 8, this, "Standard Ukulele")), __runInitializers(_init2, 11, this);
    __publicField(this, "chords", __runInitializers(_init2, 12, this, "[]")), __runInitializers(_init2, 15, this);
    __publicField(this, "numChords", __runInitializers(_init2, 16, this, 0)), __runInitializers(_init2, 19, this);
  }
  get parsedChords() {
    try {
      return Array.isArray(this.chords) ? this.chords : JSON.parse(this.chords);
    } catch {
      return [];
    }
  }
  updated(changedProperties) {
    if (changedProperties.has("chords"))
      this.numChords = this.parsedChords.length;
  }
  render() {
    return html`<header><h3>${this.instrument}</h3></header>
		<div class='list'>
			${this.parsedChords.map(
      (chord) => html`<chord-diagram chord=${chord} instrument='${this.instrument}'></chord-diagram>`
    )}
			<style>
				chord-diagram {
		  	  width: calc(100%/${this.numChords});
					min-width:  100px;
    		}
			</style>
		</div>`;
  }
}
_init2 = __decoratorStart(_b);
__decorateElement(_init2, 5, "instrument", _instrument_dec2, ChordList);
__decorateElement(_init2, 5, "chords", _chords_dec, ChordList);
__decorateElement(_init2, 5, "numChords", _numChords_dec, ChordList);
ChordList = __decorateElement(_init2, 0, "ChordList", _ChordList_decorators, ChordList);
__publicField(ChordList, "styles", css`
	  :host {
			display: block;
			width: 30vw;
      height: fit-content(100%);
		}
		.list {
	    display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-around;
      align-items: flex-start;
		}

	`);
__runInitializers(_init2, 1, ChordList);
