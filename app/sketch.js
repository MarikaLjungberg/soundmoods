let wave1;
let wave2;
let wave3;
let playing = false;
let freqSlider1;
let freqSlider2;
let freqSlider3;
let env1;
let env2;
let env3;
let fft;
let toggleSoundButton;
const defaultAmp = 0.1;
const numOfBuckets = 256;
let polysynth;
const notes = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A5', 'A#5', 'B5', 'C5'];
let noteButtons = [];
const noteFreqs = [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25]; 
let waves = [];

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

/*
function createSliderDiv(freqSlider) {
  let div = createDiv();
  div.style('transform: rotate(270deg);');
  div.child(freqSlider);
  return div;
}
*/
/*
function setupSliders() {
  freqSlider1 = createSlider(100, 1000, 100, 20);
  let d1 = createSliderDiv(freqSlider1);
  d1.position(-50,210);
  freqSlider2 = createSlider(100, 1000, 100, 20);
  let d2 = createSliderDiv(freqSlider2);
  d2.position(-20,210);
  freqSlider3 = createSlider(100, 1000, 100, 20);
  let d3 = createSliderDiv(freqSlider3);
  d3.position(10,210);
}
*/
/*
function setupSoundToggleButton() {
  let buttonDiv = createDiv();
  toggleSoundButton = createButton('Play');
  toggleSoundButton.mousePressed(toggleSound);
  buttonDiv.child(toggleSoundButton);
  buttonDiv.position(5,405);
}
*/

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
  fft = new p5.FFT(0.8, 2048);
  setupKeyButtons();
  polysynth = new p5.PolySynth();
  //reverb = new p5.Reverb();
  //reverb.process(polysynth, 3, 2);
}

function draw() {
  if (playing) {
    //background(232, 251, 244);
    background(31, 88, 107);
    //background(0);
  } else {
    //background(239, 239, 239);
    background(31, 88, 107);
  }

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
  } else {
    waves[index].amp(0.2);
    noteButtons[index].isPlaying = true;
  }
  if (noteButtons[index].isPlaying) {
    noteButtons[index].noteButton.style('background-color', '#4CAF50');
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
    if (fft.getEnergy(freq) > 250) {
      noteButtons[index].noteButton.style('background-color', '#4CAF50');
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
  polysynth.play(notes[index], 0.2, 0, 1);
  noteButtons[index].isPlaying = true;
  noteButtons[index].noteButton.style('background-color', '#4CAF50');
}