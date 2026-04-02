import { Howl, Howler } from 'howler';

// Howler gère automatiquement le déverrouillage audio sur mobile/Safari
// On utilise des sons synthétisés via Web Audio API encapsulés dans Howler

let audioContext = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = Howler.ctx || new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

// Génère un buffer audio à partir d'une fonction de synthèse
function createSynthSound(generator, duration = 0.3) {
  const ctx = getAudioContext();
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  generator(data, sampleRate, length);

  // Encode buffer to WAV blob pour Howler
  const wav = encodeWAV(data, sampleRate);
  const blob = new Blob([wav], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

// Lazy-created Howl instances
const sounds = {};

function getSound(name, generator, duration) {
  if (!sounds[name]) {
    try {
      const url = createSynthSound(generator, duration);
      sounds[name] = new Howl({ src: [url], format: ['wav'], volume: 0.3 });
    } catch {
      return null;
    }
  }
  return sounds[name];
}

// ─── Sound generators ───

function genAscending(data, sr, len) {
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const freq = 261.63 + (392.0 - 261.63) * (t / 0.15);
    const vol = t < 0.1 ? 0.2 + 0.05 * (t / 0.1) : 0.25 * Math.exp(-8 * (t - 0.1));
    data[i] = Math.sin(2 * Math.PI * freq * t) * vol;
  }
}

function genCrash(data, sr, len) {
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const noise = (Math.random() * 2 - 1) * 0.4 * Math.exp(-4 * t);
    const freq = 150 * Math.exp(-3.5 * t);
    const osc = Math.sin(2 * Math.PI * freq * t) * 0.3 * Math.exp(-6 * t);
    data[i] = noise + osc;
  }
}

function genDeal(data, sr, len) {
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const freq = 900 * Math.exp(-5 * t);
    const vol = 0.12 * Math.exp(-25 * t);
    data[i] = Math.sin(2 * Math.PI * freq * t) * vol;
  }
}

function genHit(data, sr, len) {
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const freq = 1100 * Math.exp(-4.5 * t);
    const vol = 0.1 * Math.exp(-30 * t);
    data[i] = (2 * ((freq * t) % 1) - 1) * vol; // triangle-ish
  }
}

function genChickenStep(data, sr, len) {
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const freq = 600 + 300 * (t / 0.08);
    const vol = 0.08 * Math.exp(-30 * t);
    data[i] = Math.sin(2 * Math.PI * freq * t) * vol;
  }
}

function genChickenDead(data, sr, len) {
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const freq = 400 * Math.exp(-4 * t);
    const phase = 2 * Math.PI * freq * t;
    const vol = 0.2 * Math.exp(-5 * t);
    data[i] = (2 * ((phase / (2 * Math.PI)) % 1) - 1) * vol; // sawtooth
  }
}

// ─── Exports ───

export const playAscendingTone = () => getSound('ascending', genAscending, 0.25)?.play();
export const playCrashSound = () => getSound('crash', genCrash, 0.5)?.play();
export const playDealSound = () => getSound('deal', genDeal, 0.12)?.play();
export const playHitSound = () => getSound('hit', genHit, 0.1)?.play();
export const playChickenStep = () => getSound('step', genChickenStep, 0.1)?.play();
export const playChickenDead = () => getSound('dead', genChickenDead, 0.4)?.play();
