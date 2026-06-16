/**
 * Surf Rock Music Generator using Web Audio API
 * Procedurally generates a surf rock loop with:
 * - Reverb-drenched guitar (tremolo + vibrato)
 * - Driving drum pattern
 * - Walking bass line
 */

let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let scheduledNodes = [];
let lookahead = null;
let nextNoteTime = 0;
let currentBeat = 0;
let tempo = 160; // BPM - surf rock tempo

// Surf rock notes (E minor pentatonic with surf flavor)
const GUITAR_MELODY = [
  'E4','E4','G4','A4','B4','A4','G4','E4',
  'D4','D4','F#4','G4','A4','G4','F#4','D4',
  'A3','A3','C4','D4','E4','D4','C4','A3',
  'B3','B3','D4','E4','F#4','E4','D4','B3',
];

const BASS_LINE = [
  'E2','E2','A2','A2','D2','D2','A2','A2',
  'E2','E2','G2','G2','A2','A2','E2','E2',
];

const noteFreqs = {
  'E2': 82.41, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47, 'D2': 73.42,
  'A3': 220.00, 'B3': 246.94, 'C4': 261.63, 'D4': 293.66, 'E4': 329.63,
  'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
  'D3': 146.83, 'E3': 164.81, 'G3': 196.00,
};

function createReverb(ctx, duration = 1.5, decay = 2.0) {
  const convolver = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const length = rate * duration;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let c = 0; c < 2; c++) {
    const channel = impulse.getChannelData(c);
    for (let i = 0; i < length; i++) {
      channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

function createTremolo(ctx, rate = 6, depth = 0.4) {
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = rate;
  lfoGain.gain.value = depth;
  lfo.connect(lfoGain);
  lfo.start();
  return lfoGain;
}

function playNote(freq, startTime, duration, type = 'sawtooth', vol = 0.3) {
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  // Slight vibrato
  osc.frequency.setValueAtTime(freq * 1.002, startTime + 0.05);
  osc.frequency.setValueAtTime(freq, startTime + 0.1);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gainNode);
  gainNode.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
  scheduledNodes.push(osc, gainNode);
}

function playDrum(startTime, type) {
  if (!audioCtx) return;

  if (type === 'kick') {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    gainNode.gain.setValueAtTime(1.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
    osc.connect(gainNode);
    gainNode.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.35);
    scheduledNodes.push(osc, gainNode);
  }

  if (type === 'snare') {
    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;

    gainNode.gain.setValueAtTime(0.7, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);
    noise.start(startTime);
    scheduledNodes.push(noise, gainNode);
  }

  if (type === 'hihat') {
    const bufferSize = audioCtx.sampleRate * 0.05;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 7000;

    gainNode.gain.setValueAtTime(0.25, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);
    noise.start(startTime);
    scheduledNodes.push(noise, gainNode);
  }
}

function scheduleNote(beatNumber, time) {
  const beatInBar = beatNumber % 16;
  const sixteenth = 60 / tempo / 4;

  // Guitar melody (every 2 beats)
  if (beatInBar % 2 === 0) {
    const noteIdx = (beatInBar / 2) % GUITAR_MELODY.length;
    const note = GUITAR_MELODY[noteIdx];
    const freq = noteFreqs[note];
    if (freq) playNote(freq, time, sixteenth * 1.8, 'sawtooth', 0.18);
  }

  // Bass line (every 4 beats)
  if (beatInBar % 4 === 0) {
    const noteIdx = (beatInBar / 4) % BASS_LINE.length;
    const note = BASS_LINE[noteIdx];
    const freq = noteFreqs[note];
    if (freq) playNote(freq, time, sixteenth * 3.5, 'triangle', 0.22);
  }

  // Drums
  // Kick on beats 0 and 8 (1 and 3 in 4/4)
  if (beatInBar === 0 || beatInBar === 8) playDrum(time, 'kick');
  // Snare on beats 4 and 12 (2 and 4 in 4/4)
  if (beatInBar === 4 || beatInBar === 12) playDrum(time, 'snare');
  // Hi-hat every beat
  playDrum(time, 'hihat');
  // Extra hihat subdivisions for surf feel
  if (beatInBar % 2 === 1) playDrum(time + sixteenth * 0.5, 'hihat');
}

function scheduler() {
  if (!audioCtx || !isPlaying) return;
  const sixteenth = 60 / tempo / 4;
  while (nextNoteTime < audioCtx.currentTime + 0.2) {
    scheduleNote(currentBeat, nextNoteTime);
    nextNoteTime += sixteenth;
    currentBeat = (currentBeat + 1) % 32;
  }
  lookahead = setTimeout(scheduler, 50);
}

export function startSurfMusic(volume = 0.5) {
  if (isPlaying) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = volume;

    // Add slight compression for loudness
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 10;
    compressor.ratio.value = 4;
    masterGain.connect(compressor);
    compressor.connect(audioCtx.destination);

    nextNoteTime = audioCtx.currentTime + 0.1;
    currentBeat = 0;
    isPlaying = true;
    scheduler();
  } catch (e) {
    console.warn('Audio not supported:', e);
  }
}

export function stopSurfMusic() {
  isPlaying = false;
  if (lookahead) clearTimeout(lookahead);
  scheduledNodes.forEach(n => { try { n.disconnect(); } catch(_) {} });
  scheduledNodes = [];
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}

export function setSurfMusicVolume(vol) {
  if (masterGain) masterGain.gain.setTargetAtTime(vol, audioCtx.currentTime, 0.1);
}

export function isSurfMusicPlaying() {
  return isPlaying;
}