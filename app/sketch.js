let fft, polySynth, soundLoop, loopIntervalInSeconds, tempoSlider;
const numOfBuckets = 256;
const defaultAmp = 0.005;
const defaultTempo = 0.2;
const playingColour = '#84d99e'; // #4CAF50
const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A5', 'A#5', 'B5', 'C5'];
const noteFreqs = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25]; 
let noteButtons = [];
let waves = [];
let chord = [];

function setupWaves() {
  noteFreqs.forEach((freq, index) => {
    wave = new p5.Oscillator();
    wave.setType('sine');
    wave.start();
    wave.freq(freq);
    wave.amp(0);
    waves[index] = wave;
  });
}

function createSliderDiv(slider) {
  let div = createDiv();
  div.style('transform: rotate(270deg);');
  div.child(slider);
  return div;
}

function setupTempoSlider() {
  tempoSlider = createSlider(1, 200, 20);
  let d1 = createSliderDiv(tempoSlider);
  d1.position(460,440);
}

function setupInstructions() {
  const instructions = "Use keyboard keys z,s,x,d,c,v,g,b,h,n,j,m and , to play around on the keyboard to find a chord that reflects your mood right now." +
  "When you've found it, press the keys on the screen and choose a tempo to start the analysis.";
  let textDiv = createDiv(instructions);
  textDiv.style('width', '130px');
  textDiv.style('height', '170px');
  textDiv.position(455, 5);
}

function setupKeyButtons() {
  notes.forEach((note, index) => {
    let buttonDiv = createDiv();
    let noteButton = createButton(note.slice(0, note.length -1));
    noteButton.style('height', '70px');
    noteButton.style('width', '30px');
    noteButton.style('border-radius', '3px');
    buttonDiv.child(noteButton);
    if (note.slice(note.length - 2, note.length - 1) === '#') {
      noteButton.style('background-color', '#000000');
      noteButton.style('color', '#ffffff');
      buttonDiv.position(index*35,405);
    } else {
      buttonDiv.position(index*35,445);
    }
    noteButton.mousePressed(() => toggleOscillatorNote(note, index));
    noteButtons[index] = {
      noteButton,
      isPlaying: false,
    };
  });
}


function setup() {
  createCanvas(450, 400);
  setupInstructions();
  setupWaves();
  setupTempoSlider();
  fft = new p5.FFT(0.8, 2048);
  setupKeyButtons();
  polySynth = new p5.PolySynth();
  reverb = new p5.Reverb();
  reverb.process(polySynth, 3, 2);
  soundLoop = new p5.SoundLoop(onSoundLoop, defaultTempo);
}

function draw() {
  background(31, 88, 107);

  var spectrum = fft.analyze();
  noFill();
  beginShape();
  spectrum.forEach((amp, index) => {
    let mappedAmp = map(amp, 0, 255, 355, 0)
    stroke(index, 255, 255);
    vertex(index*4, mappedAmp);
  });
  endShape();

  checkPlayingNotes();
}

function toggleOscillatorNote(note, index) {
  if (noteButtons[index].isPlaying) {
    waves[index].amp(0);
    noteButtons[index].isPlaying = false;
    chord.splice(chord.indexOf(note), 1);
  } else {
    waves[index].amp(defaultAmp);
    noteButtons[index].isPlaying = true;
    chord.push(note);
  }
  if (noteButtons[index].isPlaying) {
    noteButtons[index].noteButton.style('background-color', playingColour);
  }
  if (chord.includes(note)) {
    noteButtons[index].noteButton.style('border-color', playingColour);
    noteButtons[index].noteButton.style('border-width', '3px');
  }
  
  if (chord.length > 0) {
    soundLoop.start();
  } else {
    soundLoop.stop();
  }
}

function keyPressed() {
  switch(key){
    case 'z':
      handleKeyboardKeyPress(0);
      break;
    case 's':
      handleKeyboardKeyPress(1);
      break;
    case 'x':
      handleKeyboardKeyPress(2);
      break;
    case 'd':
      handleKeyboardKeyPress(3);
      break;
    case 'c':
      handleKeyboardKeyPress(4);
      break;
    case 'v':
      handleKeyboardKeyPress(5);
      break;
    case 'g':
      handleKeyboardKeyPress(6);
      break;
    case 'b':
      handleKeyboardKeyPress(7);
      break;
    case 'h':
      handleKeyboardKeyPress(8);
      break;
    case 'n':
      handleKeyboardKeyPress(9);
      break;
    case 'j':
      handleKeyboardKeyPress(10);
      break;
    case 'm':
      handleKeyboardKeyPress(11);
      break;
    case ',':
      handleKeyboardKeyPress(12);
      break;
  }
}

function checkPlayingNotes() {
  noteFreqs.forEach((freq, index) => {
    if (fft.getEnergy(freq) > 200) {
      noteButtons[index].noteButton.style('background-color', playingColour);
    } else {
      if (notes[index].slice(notes[index].length - 2, notes[index].length - 1) === '#') {
        noteButtons[index].noteButton.style('background-color', '#000000');
        noteButtons[index].noteButton.style('color', '#ffffff');
      } else {
        notes[index].slice(notes[index].length - 2, notes[index].length - 1) === '#'
        noteButtons[index].noteButton.style('background-color', '#f2f2f2');
      }
    }
  });
}

function handleKeyboardKeyPress(index) {
  polySynth.play(notes[index], defaultAmp*50, 0, 1);
  noteButtons[index].isPlaying = true;
  noteButtons[index].noteButton.style('background-color', playingColour);
}

function onSoundLoop(timeFromNow) {
  const intervalInSeconds = tempoSlider.value() / 100;
  soundLoop.interval = intervalInSeconds;
  let noteIndex = Math.floor(Math.random() * chord.length);
  polySynth.play(chord[noteIndex], 0, timeFromNow, 0.1*intervalInSeconds*10);
}