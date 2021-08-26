let fft, polySynth, soundLoop, loopIntervalInSeconds, tempoSlider, confirmTempoButton, tonality, mood, moodInfoDiv, moodGifText, gifInfoDiv, gifDiv, happyGif, sadGif, calmGif, anxiousGif;
const numOfBuckets = 256;
const defaultAmp = 0.005;
const defaultTempo = 0.2;
const playingColour = '#84d99e'; // #4CAF50
const defaultBorderColour = '#757575';
let tempoConfirmed = false;
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
  tempoSlider = createSlider(1, 400, 20);
  let sliderDiv = createSliderDiv(tempoSlider);
  sliderDiv.position(460,420);
  let slowerLabel = createDiv("Slower");
  slowerLabel.position(502, 345);  
  let fasterLabel = createDiv("Faster");
  fasterLabel.position(505, 500);
  confirmTempoButton = createButton('Confirm chosen tempo');
  confirmTempoButton.mousePressed(toggleChooseTempo);
  confirmTempoButton.position(505, 530);
}

function toggleChooseTempo() {
  if (!tempoConfirmed) {
    confirmTempoButton.style('background-color', playingColour);
    confirmTempoButton.html('Change tempo');
    tempoConfirmed = true;
    tempoSlider.attribute('disabled', '');
  } else {
    confirmTempoButton.style('background-color', '#f2f2f2');
    confirmTempoButton.html('Confirm chosen tempo');
    tempoConfirmed = false;
    tempoSlider.removeAttribute('disabled');
  }
}

function setupInstructions() {
  const instructions = "Use keyboard keys z,s,x,d,c,v,g,b,h,n,j,m and , to play around on the keyboard to find a chord that reflects your mood right now." +
  "When you've found it, press the keys on the screen and choose a tempo to start the analysis.";
  let textDiv = createDiv(instructions);
  textDiv.style('width', '130px');
  textDiv.style('height', '170px');
  textDiv.position(455, 5);
  const disclaimer = "Note: It takes a second or two before a new tempo settles.";
  let disclaimerDiv = createDiv(disclaimer);
  disclaimerDiv.style('width', '130px');
  disclaimerDiv.style('height', '170px');
  disclaimerDiv.position(455, 245);
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
  calmGif = loadImage('./calmDog.gif');
  happyGif = loadImage('./happyDog.gif');
  sadGif = loadImage('./sadDog.gif');
  anxiousGif = loadImage('./anxiousGif.gif');
  createCanvas(450, 400);
  setupInstructions();
  setupWaves();
  setupTempoSlider();
  fft = new p5.FFT(0.8, 2048);
  setupKeyButtons();
  polySynth = new p5.PolySynth();
  reverb = new p5.Reverb();
  reverb.process(polySynth, 3, 2, true);
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

  if (tempoConfirmed) {
    calculateTonality();
    calculateMood();
    displayMood();
    showGif();
  } else {
    if (moodInfoDiv && gifInfoDiv && gifDiv) {
      moodInfoDiv.remove();
      gifInfoDiv.remove();
      gifDiv.remove();
    }
  }
}


function toggleOscillatorNote(note, index) {
  if (chord.includes(note)) {
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
  } else {
    noteButtons[index].noteButton.style('border-color', defaultBorderColour);
    noteButtons[index].noteButton.style('border-width', '2px');
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
  polySynth.play(notes[index], defaultAmp*15, 0, 1);
  noteButtons[index].isPlaying = true;
  noteButtons[index].noteButton.style('background-color', playingColour);
}

function onSoundLoop(timeFromNow) {
  const intervalInSeconds = tempoSlider.value() / 100;
  soundLoop.interval = intervalInSeconds;
  let noteIndex = Math.floor(Math.random() * chord.length);
  let noteLength = Math.random() * intervalInSeconds;
  polySynth.setADSR(0.1, 0.5, 0.5, noteLength);
  //let randomNoteDelay = Math.random() * 10 * timeFromNow;
  //polySynth.play(chord[noteIndex], 0, randomNoteDelay);
  polySynth.play(chord[noteIndex], 0, timeFromNow);
}

function calculateTonality() {
  const majorRatios = [1.2599, 1.1892];
  const minorRatios = [1.1892, 1.2599];

  if (chord.length > 1) {
    const freqsInChord = chord.map((note) => {
      const noteIndex = notes.indexOf(note);
      return noteFreqs[noteIndex];
    });
  
    const ratios = freqsInChord.map((freq, index) => {
      if (index > 0) {
        return freq/freqsInChord[index-1]
      } else {
        return 1;
      }
    });
  
    const firstTersRatio = parseFloat(ratios[1].toFixed(4));
    if (firstTersRatio === parseFloat(1.2599)) {
      tonality = "major";
    } else if (firstTersRatio === parseFloat(1.1892)) {
      tonality = "minor";
    } else {
      tonality = undefined;
    }
  }
}

function calculateMood() {
  let tempo = tempoSlider.value()-100;
  if (tonality === "major" && tempo > 50) {
    mood = "calm";
    moodGifText = "Here's your buddy!";
  } else if (tonality === "major" && tempo < 50) {
    mood = "happy";
    moodGifText = "Just like this guy here!";
  } else if (tonality === "minor" && tempo > 50) {
    mood = "sad";
    moodGifText = "Here's a little something to console you ...";
  } else if (tonality === "minor" && tempo < 50) {
    mood = "anxious";
    moodGifText = "That's all right. It happens sometimes.";
  } else if (tonality === undefined) {
    mood = undefined;
  }
}

function displayMood() {
  if (!!moodInfoDiv && !!gifInfoDiv) {
    moodInfoDiv.remove();
    gifInfoDiv.remove();
    gifDiv.remove();
  }
  let moodText = !mood ? "" : "You seem " + mood;
  moodInfoDiv = createDiv(moodText);
  moodInfoDiv = setGeneralMoodInfoStyle(moodInfoDiv);
  moodInfoDiv.style('color', '#d4f3ff');
  if (moodText !== "") {
    gifInfoDiv = createDiv(moodGifText);
    gifInfoDiv = setGeneralMoodInfoStyle(gifInfoDiv);
    gifInfoDiv.style('color', '#d4f3ff');
    gifInfoDiv.style('font-size', '15px');
    gifInfoDiv.style('padding-top', '20px');
    gifInfoDiv.position(200, 60);
  }
}

function setGeneralMoodInfoStyle(moodInfoDiv) {
  moodInfoDiv.style('font-family', 'Arial');
  moodInfoDiv.style('font-size', '20px');
  moodInfoDiv.style('width', '250px');
  moodInfoDiv.style('height', '170px');
  moodInfoDiv.position(200, 30);
  return moodInfoDiv;
}

function showGif() {
  const styleGif = (img) => {
    img.style('width', '200px');
    img.position(220, 140);
  }

  /*
   if (!mood && !!gifDiv) {
    gifDiv.remove();
  } else if (mood === "calm") {
    background(calmGif);
  } else if (mood === "happy") {
    background(happyGif);
  } else if (mood === "sad") {
    background(sadGif);
  } else if (mood === "anxious") {
    background(anxiousGif);
  }
  */

  if (!mood && !!gifDiv) {
    gifDiv.remove();
  } else if (mood === "calm") {
    gifDiv = createImg('./calmDog.gif', 'A cuddly dog');
    styleGif(gifDiv);
    gifDiv.style('height', '165px');
  } else if (mood === "happy") {
    gifDiv = createImg('./happyDog.gif', 'A cuddly dog');
    styleGif(gifDiv);
    gifDiv.style('height', '160px');
  } else if (mood === "sad") {
    gifDiv = createImg('./sadDog.gif', 'A cuddly dog');
    styleGif(gifDiv);
    gifDiv.style('height', '130px');
  } else if (mood === "anxious") {
    gifDiv = createImg('./anxiousGif.gif', 'A cuddly dog');
    styleGif(gifDiv);
  }
  
}