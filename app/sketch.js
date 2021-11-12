let img, fft, polySynth, reverb, soundLoop, loopIntervalInSeconds, tempoSlider, confirmTempoButton, tonality, mood, moodInfoDiv, moodGifText, gifInfoDiv, gifDiv, happyGif, sadGif, calmGif, anxiousDog;
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
let canvasOffsetX = 200;
let canvasOffsetY = 120;

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
  sliderDiv.position(canvasOffsetX + 440, canvasOffsetY + 433);
  let slowerLabel = createDiv("Slower");
  slowerLabel.position(canvasOffsetX + 482, canvasOffsetY + 363);  
  let fasterLabel = createDiv("Faster");
  fasterLabel.position(canvasOffsetX + 485, canvasOffsetY + 508);
  confirmTempoButton = createButton('Confirm chosen tempo');
  confirmTempoButton.mousePressed(toggleChooseTempo);
  confirmTempoButton.position(canvasOffsetX + 455, canvasOffsetY + 530);
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
  const instructions = "<b>Instructions:</b> Use keyboard keys z,s,x,d,c,v,g,b,h,n,j,m and , to play around on the keyboard to find a chord that reflects your mood right now. " +
  "When you've found it, press the keys on the screen and choose a tempo to start the classification.";
  let textDiv = createDiv(instructions);
  textDiv.style('width', '130px');
  textDiv.style('height', '245px');
  textDiv.style('background-color', '#E8EEF0');  
  textDiv.style('padding', '10px');
  textDiv.style('border-radius', '5px');
  textDiv.position(canvasOffsetX + 455, canvasOffsetY);

  const note = "Note: It takes a second or two before a new tempo settles.";
  let noteDiv = createDiv(note);
  noteDiv.style('width', '130px');
  noteDiv.style('height', '70px');
  noteDiv.style('background-color', '#E8EEF0');  
  noteDiv.style('padding', '10px');
  noteDiv.style('border-radius', '5px');
  noteDiv.position(canvasOffsetX + 455, canvasOffsetY + 270);

  const disclaimer = "<b>Disclaimer!</b> At the moment the mood classification only works for major and minor chords played with tonic first directly followed by the third. <br><br> <i>The current version of the classification is a very simple application of the guidelines presented by Michael Nuzzolo's Music Mood Classification found here: https://sites.tufts.edu/eeseniordesignhandbook/2015/music-mood-classification/</i>";
  let disclaimerDiv = createDiv(disclaimer);
  disclaimerDiv.style('width', '400px');
  disclaimerDiv.style('height', '155px');
  disclaimerDiv.style('background-color', '#E8EEF0');  
  disclaimerDiv.style('padding', '10px');
  disclaimerDiv.style('border-radius', '5px');
  disclaimerDiv.position(canvasOffsetX, canvasOffsetY + 530);
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
      buttonDiv.position(canvasOffsetX + index*35, canvasOffsetY + 405);
    } else {
      buttonDiv.position(canvasOffsetX + index*35, canvasOffsetY + 445);
    }
    noteButton.mousePressed(() => toggleOscillatorNote(note, index));
    noteButtons[index] = {
      noteButton,
      isPlaying: false,
    };
  });
}

function stopChord() {
  chord = [];
  soundLoop.stop();
  reverb.disconnect();
  waves.forEach((wave) => {
    wave.amp(0);
  });
  mood = undefined;
  tonality = undefined;
  tempoConfirmed = false;
}

function setupArticle() {
  let article = getArticle();
  let articleDiv = createDiv(article);
  //let articleWidth = windowWidth - canvasOffsetX + "px";
  articleDiv.style('width', '700px');
  articleDiv.style('height', '750px');
  articleDiv.style('background-color', '#BBCCD2');
  articleDiv.style('color', 'black');
  articleDiv.style('padding', '20px');
  articleDiv.style('padding-top', '10px');
  articleDiv.style('font-family', 'Arial, Helvetica, sans-serif');
  articleDiv.style('border-radius', '5px');
  articleDiv.position(canvasOffsetX + 655, canvasOffsetY);
}

function setupHeader() {
  let headerDiv = createImg('./Music_moods.png');
  headerDiv.position(canvasOffsetX - 150, 20);
}

function setup() {
  calmGif = loadImage('./calmDog.gif');
  happyGif = loadImage('./happyDog.gif');
  sadGif = loadImage('./sadDog.gif');
  anxiousDog = loadImage('./anxiousDog.gif');
  let cnv = createCanvas(450, 400);
  cnv.position(canvasOffsetX, canvasOffsetY);
  cnv.style('border-radius', '5px');
  setupHeader();
  setupInstructions();
  setupWaves();
  setupTempoSlider();
  fft = new p5.FFT(0.8, 2048);
  setupKeyButtons();
  polySynth = new p5.PolySynth();
  reverb = new p5.Reverb();
  reverb.process(polySynth, 3, 2, true);
  soundLoop = new p5.SoundLoop(onSoundLoop, defaultTempo);

  stopButton = createButton('Stop');
  stopButton.mousePressed(stopChord);
  stopButton.position(canvasOffsetX + 455, canvasOffsetY + 560);

  setupArticle();
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
    gifInfoDiv.position(canvasOffsetX + 200, canvasOffsetY + 60);
  }
}

function setGeneralMoodInfoStyle(moodInfoDiv) {
  moodInfoDiv.style('font-family', 'Arial');
  moodInfoDiv.style('font-size', '20px');
  moodInfoDiv.style('width', '250px');
  moodInfoDiv.style('height', '170px');
  moodInfoDiv.position(canvasOffsetX + 200, canvasOffsetY + 30);
  return moodInfoDiv;
}

function showGif() {
  const styleGif = (img) => {
    img.style('width', '200px');
    img.position(canvasOffsetX + 220, canvasOffsetY + 140);
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
    background(anxiousDog);
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
    gifDiv = createImg('./anxiousDog.gif', 'A cuddly dog');
    styleGif(gifDiv);
  }
}

function getArticle() {
  let article = `How come music maps so well to our inner landscapes? How come rhythms and melodies - mere vibrations in air - can both mimic and trigger surges in our internal lives, even more so than spoken or written language? What only the most empathetic of people can accomplish through words, music can mediate in an instant. The infinitesimal nuances in emotion can be reproduced to near perfection in music - and vice versa. They are eerily interchangeable.
<br>
<br>
Sound and hearing are mechanical matters. From a flute or a string or someone’s vocal organ, air density variations slam into our eardrums, causing ripples that jiggle some in-ear hair cells. So far, music exists only in one place: the mind of the player. But in the fraction of a second, as the neurological signals triggered by these hairs reach the brain, music arises also in the listener. The auditory cortex, limbic system and prefrontal cortex of the listener have awoken the mere vibrations and neural charge distributions into spirited life.
<br>
<br>
Of course, one could argue that music conveys emotion simply because we use it for that exact purpose; it is merely a tool. It maps so well because we made the mapping. (Possibly contradicting this is the fact that people spontaneously sing or use music-like speech to catch the attention of infants*). But why auditory stimulus specifically and not, say, visual? Why is it that just one note can stir intense longing and nostalgia, hope or grit, in a way that one colour never could? Soundwaves are temporally dependent whereas visual art is usually not - is this a clue as to why it is music that is the closest thing we have to direct emotional transfer (albeit we all have our personal interpretations and associations)? Does the temporal unfolding of music mimic some nature of our emotional processes? One common aspect of this is the tendency of unexpected events in music to elicit strong emotion**.
<br>
<br>
But more than that, it is the layering, the harmonies, or just one note in relation to others. We all know, instinctively, when a certain musical chord or interval is ‘sad’ or ‘happy’. The innate relational aspects of music must somehow, it seems, directly reflect some intrinsic aspect of emotional mechanisms. The explanation that it is a learned response feels hardly convincing, though it is true that large portions of our modern lives include music, and memories of certain periods can often be catalogued by the songs that accompanied them. Professor of psychology Patrik N. Juslin suggested a complex framework for the underlying mechanisms of emotional induction by music, involving six different mechanisms. These range from brain stem reflexes to the recollection of memories and actual subjective evaluation of the quality of the music, requiring vast and various areas of the brain. 
<br>
<br>
And maybe this is one explanation to why music is so tightly coupled to our inner lives: it affects them on all levels, engaging many of the systems involved in producing our experiences of our consious selves. It activates memories we already have and alters the ones we are currently making. Like an intricate set-up of dominoes, the impression of one single note will ripple through the brain and activate conscious and subconscious processes alike. We can explore this with modern brain imaging technology and we might be able to answer <i>how</i> music does it, but to me, it still seems unclear whether we will ever find a way to assess why <i>music</i> does it.
<br>
<br>
<br>
*e.g. Nakata & Trehub, 2004 and Fernald et al., 1989 <br>
**Arjmand et al., 2017
  `;
  return article; 
}