import ChordSheetJS, { ChordSheetParser } from 'chordsheetjs';
import { parse as parseChord } from 'chordjs';

const processChord = (item, processor) => {
  if(item instanceof ChordSheetJS.ChordLyricsPair && item.chords) {
    const parsedChord = parseChord(item.chords);

    if(parsedChord){
      const processedChordLyricsPair = item.clone();
      processedChordLyricsPair.chords = processor(parsedChord).toString();
      return processedChordLyricsPair;
    }
  }
  return item;
}

const getChord = (item) => {
  if(item instanceof ChordSheetJS.ChordLyricsPair && item.chords){
    return item.chords
  }
}


const transformSong = (song, processor) => {
  const processedSong = song.clone();
  processedSong.lines = song.lines.map( (line) => {
    const processedLine = line.clone();
    processedLine.items = line.items.map((item)=>processChord(item, processor))
    return processedLine;
  })
  
  return processedSong;
}

const transformChordSheet = (song, processor=(chord)=>chord) => {
  return transformSong(song, processor);
}

export const transposeUp = (chordSheet) => {
  return transformChordSheet(chordSheet, (chord) => chord.transposeUp());
}

export const transposeDown = (chordSheet) => {
  return transformChordSheet(chordSheet, (chord) => chord.transposeDown());
}

export const formatChordSheet = (chordSheet) => {
  return new ChordSheetJS.ChordProParser().parse(chordSheet);
  ;
}

export const convertChordSheetToChordPro = (chordSheet) => {
  const parser = new ChordSheetJS.ChordSheetParser({ preserveWhitespace: false });
  const formatter = new ChordSheetJS.ChordProFormatter();
  const song = parser.parse(chordSheet);
  return formatter.format(song);
};

export const getChords = (song) => {
  const chords = [...new Set(song.lines.map((line)=>{
    return line.clone().items.map((item)=>{
      return getChord(item)
    })
  }).flat() )].filter((chord)=>chord);
  return chords;
}
