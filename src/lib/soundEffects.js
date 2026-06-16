// Sound effects using Web Audio API
let audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone({ freq = 440, type = 'sine', duration = 0.1, volume = 0.3, freqEnd = null, delay = 0 }) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + delay + duration);

    gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration);
  } catch (e) {}
}

export function playCoinSound() {
  playTone({ freq: 880, type: 'sine', duration: 0.08, volume: 0.25 });
  playTone({ freq: 1100, type: 'sine', duration: 0.08, volume: 0.2, delay: 0.05 });
}

export function playStarSound(tier = 1) {
  // 3 rising tones based on tier
  const baseFreq = 600 + tier * 200;
  for (let i = 0; i < 4; i++) {
    playTone({ freq: baseFreq + i * 150, type: 'sine', duration: 0.12, volume: 0.3, delay: i * 0.07 });
  }
}

export function playGameOverSound() {
  playTone({ freq: 400, type: 'sawtooth', duration: 0.15, volume: 0.3 });
  playTone({ freq: 280, type: 'sawtooth', duration: 0.2, volume: 0.3, delay: 0.15 });
  playTone({ freq: 180, type: 'sawtooth', duration: 0.4, volume: 0.3, delay: 0.35 });
}

export function playLaneChangeSound() {
  playTone({ freq: 300, freqEnd: 450, type: 'square', duration: 0.06, volume: 0.1 });
}

export function resumeAudioContext() {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}