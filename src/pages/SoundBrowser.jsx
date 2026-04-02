import { useState, useEffect } from 'react';
import { Play, ThumbsUp, ThumbsDown, Volume2 } from 'lucide-react';

const crd='#111a25',b='#1a2a38',g='#00e701',s='#94a3b8',m='#4b5c6f';

function ctx(){ return new (window.AudioContext || window.webkitAudioContext)(); }

// Utility: white noise buffer
function noiseBuf(ac, dur) {
  const buf=ac.createBuffer(1,ac.sampleRate*dur,ac.sampleRate);
  const d=buf.getChannelData(0);
  for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
  return buf;
}

// Utility: filtered noise
function filteredNoise(ac, dest, freq, Q, type, vol, start, dur) {
  const n=ac.createBufferSource(); n.buffer=noiseBuf(ac,dur);
  const f=ac.createBiquadFilter(); f.type=type; f.frequency.value=freq; f.Q.value=Q;
  const ga=ac.createGain(); ga.gain.setValueAtTime(vol,start);
  ga.gain.exponentialRampToValueAtTime(0.001,start+dur);
  n.connect(f); f.connect(ga); ga.connect(dest);
  n.start(start); return n;
}

const generators = {
  // ══════════════════════════════════════════
  // SLOT MACHINE — lever pull + reels spinning + stops + result
  // ══════════════════════════════════════════
  slotLever: (ac) => {
    const t=ac.currentTime;
    // Spring mechanism — metallic twang
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.setValueAtTime(300,t);o.frequency.exponentialRampToValueAtTime(80,t+0.15);
    o.type='sawtooth';ga.gain.setValueAtTime(0.12,t);ga.gain.exponentialRampToValueAtTime(0.001,t+0.2);
    o.start(t);o.stop(t+0.2);
    // Click at start
    const o2=ac.createOscillator(),g2=ac.createGain();
    o2.connect(g2);g2.connect(ac.destination);
    o2.frequency.value=2500;o2.type='square';
    g2.gain.setValueAtTime(0.08,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.015);
    o2.start(t);o2.stop(t+0.02);
    // Mechanical slide noise
    filteredNoise(ac,ac.destination,1200,2,'bandpass',0.06,t+0.02,0.18);
  },

  slotReelSpin: (ac) => {
    const t=ac.currentTime;
    // Clicking reels — fast repeating clicks that slow down
    for(let i=0;i<30;i++){
      const speed=0.02+i*0.004+i*i*0.0003; // accelerating gaps
      const time=t+Array.from({length:i},(_, j)=>0.02+j*0.004+j*j*0.0003).reduce((a,b)=>a+b,0);
      if(time>t+2.5) break;
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=1800-i*25;o.type='square';
      ga.gain.setValueAtTime(0.04+i*0.001,time);
      ga.gain.exponentialRampToValueAtTime(0.001,time+0.01);
      o.start(time);o.stop(time+0.015);
    }
    // Underlying mechanical hum
    const o3=ac.createOscillator(),g3=ac.createGain();
    const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=400;
    o3.connect(f);f.connect(g3);g3.connect(ac.destination);
    o3.frequency.value=120;o3.type='sawtooth';
    g3.gain.setValueAtTime(0.06,t);g3.gain.linearRampToValueAtTime(0.03,t+1.5);
    g3.gain.exponentialRampToValueAtTime(0.001,t+2);
    o3.start(t);o3.stop(t+2);
  },

  slotReelStop: (ac) => {
    const t=ac.currentTime;
    // 3 reel stops with thunks
    [0,0.3,0.6].forEach((d,i)=>{
      // Thunk
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.setValueAtTime(200-i*20,t+d);o.frequency.exponentialRampToValueAtTime(60,t+d+0.1);
      o.type='sine';ga.gain.setValueAtTime(0.15,t+d);ga.gain.exponentialRampToValueAtTime(0.001,t+d+0.12);
      o.start(t+d);o.stop(t+d+0.15);
      // Impact noise
      filteredNoise(ac,ac.destination,800,1,'bandpass',0.1,t+d,0.05);
      // Mechanical click
      const o2=ac.createOscillator(),g2=ac.createGain();
      o2.connect(g2);g2.connect(ac.destination);
      o2.frequency.value=3000-i*200;o2.type='square';
      g2.gain.setValueAtTime(0.06,t+d);g2.gain.exponentialRampToValueAtTime(0.001,t+d+0.02);
      o2.start(t+d);o2.stop(t+d+0.025);
    });
  },

  slotWin: (ac) => {
    const t=ac.currentTime;
    // Coin payout cascade
    for(let i=0;i<20;i++){
      const time=t+i*0.07+Math.random()*0.03;
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=2500+Math.random()*2000;o.type='sine';
      ga.gain.setValueAtTime(0.06,time);ga.gain.exponentialRampToValueAtTime(0.001,time+0.04);
      o.start(time);o.stop(time+0.05);
      // Metallic resonance
      const o2=ac.createOscillator(),g2=ac.createGain();
      o2.connect(g2);g2.connect(ac.destination);
      o2.frequency.value=4000+Math.random()*3000;o2.type='triangle';
      g2.gain.setValueAtTime(0.03,time);g2.gain.exponentialRampToValueAtTime(0.001,time+0.06);
      o2.start(time);o2.stop(time+0.07);
    }
    // Win jingle
    [523.25,659.25,783.99,1046.5].forEach((f,i)=>{
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=f;o.type='triangle';
      ga.gain.setValueAtTime(0.1,t+0.3+i*0.12);
      ga.gain.exponentialRampToValueAtTime(0.001,t+0.3+i*0.12+0.4);
      o.start(t+0.3+i*0.12);o.stop(t+0.3+i*0.12+0.45);
    });
  },

  // ══════════════════════════════════════════
  // ROULETTE — ball spin + bouncing + landing
  // ══════════════════════════════════════════
  rouletteBallSpin: (ac) => {
    const t=ac.currentTime;
    // Ball orbiting in the wheel — frequency decreasing, gaps increasing
    for(let i=0;i<40;i++){
      const gap=0.03+i*0.003+i*i*0.0002;
      let time=t;for(let j=0;j<i;j++) time+=0.03+j*0.003+j*j*0.0002;
      if(time>t+3) break;
      const freq=3500-i*50;
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=freq;o.type='sine';
      ga.gain.setValueAtTime(0.04+i*0.001,time);
      ga.gain.exponentialRampToValueAtTime(0.001,time+0.015);
      o.start(time);o.stop(time+0.02);
    }
  },

  rouletteBallBounce: (ac) => {
    const t=ac.currentTime;
    // Ball bouncing on frets — irregular bounces, decreasing energy
    const bounces=[0,0.08,0.15,0.21,0.26,0.30,0.33,0.355,0.375,0.39,0.40];
    bounces.forEach((d,i)=>{
      const energy=1-i/bounces.length;
      // Ball hit on fret
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=800+Math.random()*600;o.type='triangle';
      ga.gain.setValueAtTime(0.08*energy,t+d);
      ga.gain.exponentialRampToValueAtTime(0.001,t+d+0.03);
      o.start(t+d);o.stop(t+d+0.04);
      // Impact resonance
      const o2=ac.createOscillator(),g2=ac.createGain();
      o2.connect(g2);g2.connect(ac.destination);
      o2.frequency.setValueAtTime(3000+Math.random()*2000,t+d);
      o2.frequency.exponentialRampToValueAtTime(500,t+d+0.05);
      o2.type='sine';g2.gain.setValueAtTime(0.04*energy,t+d);
      g2.gain.exponentialRampToValueAtTime(0.001,t+d+0.05);
      o2.start(t+d);o2.stop(t+d+0.06);
    });
    // Final settle
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.value=600;o.type='sine';
    ga.gain.setValueAtTime(0.06,t+0.42);ga.gain.exponentialRampToValueAtTime(0.001,t+0.55);
    o.start(t+0.42);o.stop(t+0.56);
  },

  // ══════════════════════════════════════════
  // CARTES — shuffle, deal, flip
  // ══════════════════════════════════════════
  cardShuffle: (ac) => {
    const t=ac.currentTime;
    // Riffle shuffle — rapid filtered noise bursts
    for(let i=0;i<24;i++){
      const time=t+i*0.015+Math.random()*0.005;
      filteredNoise(ac,ac.destination,3000+Math.random()*3000,3,'bandpass',0.04,time,0.012);
    }
    // Bridge sound
    filteredNoise(ac,ac.destination,2000,1,'highpass',0.06,t+0.4,0.15);
  },

  cardDealFlick: (ac) => {
    const t=ac.currentTime;
    // Quick swoosh + paper snap
    filteredNoise(ac,ac.destination,4000,5,'bandpass',0.08,t,0.03);
    // Snap
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.setValueAtTime(1500,t);o.frequency.exponentialRampToValueAtTime(400,t+0.04);
    o.type='triangle';ga.gain.setValueAtTime(0.07,t);ga.gain.exponentialRampToValueAtTime(0.001,t+0.05);
    o.start(t);o.stop(t+0.06);
    // Table impact
    filteredNoise(ac,ac.destination,300,1,'lowpass',0.05,t+0.04,0.03);
  },

  cardFlipOver: (ac) => {
    const t=ac.currentTime;
    // Card bending — rising noise
    filteredNoise(ac,ac.destination,2000,3,'bandpass',0.05,t,0.05);
    // Reveal snap
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.setValueAtTime(600,t+0.04);o.frequency.exponentialRampToValueAtTime(2000,t+0.06);
    o.type='sine';ga.gain.setValueAtTime(0.06,t+0.04);
    ga.gain.exponentialRampToValueAtTime(0.001,t+0.08);
    o.start(t+0.04);o.stop(t+0.09);
    // Paper settle
    filteredNoise(ac,ac.destination,5000,2,'highpass',0.03,t+0.06,0.04);
  },

  // ══════════════════════════════════════════
  // JETONS — chip toss, stack, pile
  // ══════════════════════════════════════════
  chipSingle: (ac) => {
    const t=ac.currentTime;
    // Ceramic click
    [3200,4800,6000].forEach((f,i)=>{
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=f;o.type='sine';
      ga.gain.setValueAtTime(0.06/(i+1),t);ga.gain.exponentialRampToValueAtTime(0.001,t+0.03+i*0.01);
      o.start(t);o.stop(t+0.04+i*0.01);
    });
    filteredNoise(ac,ac.destination,6000,3,'highpass',0.04,t,0.02);
  },

  chipStack: (ac) => {
    const t=ac.currentTime;
    for(let i=0;i<6;i++){
      const time=t+i*0.05;
      [3200+i*100,5000-i*100].forEach(f=>{
        const o=ac.createOscillator(),ga=ac.createGain();
        o.connect(ga);ga.connect(ac.destination);
        o.frequency.value=f;o.type='sine';
        ga.gain.setValueAtTime(0.04,time);ga.gain.exponentialRampToValueAtTime(0.001,time+0.025);
        o.start(time);o.stop(time+0.03);
      });
      filteredNoise(ac,ac.destination,5000,2,'highpass',0.03,time,0.015);
    }
  },

  chipPile: (ac) => {
    const t=ac.currentTime;
    // Handful of chips dropped
    for(let i=0;i<15;i++){
      const time=t+Math.random()*0.3;
      [3000+Math.random()*3000,5000+Math.random()*3000].forEach(f=>{
        const o=ac.createOscillator(),ga=ac.createGain();
        o.connect(ga);ga.connect(ac.destination);
        o.frequency.value=f;o.type='sine';
        ga.gain.setValueAtTime(0.03,time);ga.gain.exponentialRampToValueAtTime(0.001,time+0.025);
        o.start(time);o.stop(time+0.03);
      });
    }
    filteredNoise(ac,ac.destination,4000,1,'highpass',0.06,t,0.35);
  },

  // ══════════════════════════════════════════
  // DICE — shake + roll + bounce
  // ══════════════════════════════════════════
  diceShake: (ac) => {
    const t=ac.currentTime;
    for(let i=0;i<20;i++){
      const time=t+i*0.04+Math.random()*0.02;
      filteredNoise(ac,ac.destination,1500+Math.random()*2000,4,'bandpass',0.06,time,0.02);
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=400+Math.random()*800;o.type='triangle';
      ga.gain.setValueAtTime(0.04,time);ga.gain.exponentialRampToValueAtTime(0.001,time+0.015);
      o.start(time);o.stop(time+0.02);
    }
  },

  diceRollBounce: (ac) => {
    const t=ac.currentTime;
    // Dice bouncing on felt
    const hits=[0,0.12,0.2,0.26,0.30,0.33,0.35];
    hits.forEach((d,i)=>{
      const energy=1-i/hits.length;
      filteredNoise(ac,ac.destination,600+Math.random()*400,2,'bandpass',0.08*energy,t+d,0.04);
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=200+Math.random()*200;o.type='triangle';
      ga.gain.setValueAtTime(0.06*energy,t+d);ga.gain.exponentialRampToValueAtTime(0.001,t+d+0.05);
      o.start(t+d);o.stop(t+d+0.06);
    });
  },

  // ══════════════════════════════════════════
  // CRASH / EXPLOSION
  // ══════════════════════════════════════════
  crashRocket: (ac) => {
    const t=ac.currentTime;
    // Rising engine — modulated sawtooth
    const o=ac.createOscillator(),ga=ac.createGain();
    const f=ac.createBiquadFilter();f.type='lowpass';
    f.frequency.setValueAtTime(300,t);f.frequency.linearRampToValueAtTime(3000,t+1.5);
    o.connect(f);f.connect(ga);ga.connect(ac.destination);
    o.frequency.setValueAtTime(80,t);o.frequency.exponentialRampToValueAtTime(400,t+1.5);
    o.type='sawtooth';ga.gain.setValueAtTime(0.06,t);ga.gain.linearRampToValueAtTime(0.12,t+1);
    ga.gain.exponentialRampToValueAtTime(0.001,t+1.6);
    o.start(t);o.stop(t+1.6);
    // High freq whoosh
    filteredNoise(ac,ac.destination,2000,1,'highpass',0.04,t,1.5);
  },

  crashExplosion: (ac) => {
    const t=ac.currentTime;
    // Multi-layered explosion
    // Sub boom
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.setValueAtTime(100,t);o.frequency.exponentialRampToValueAtTime(20,t+0.5);
    o.type='sine';ga.gain.setValueAtTime(0.2,t);ga.gain.exponentialRampToValueAtTime(0.001,t+0.6);
    o.start(t);o.stop(t+0.6);
    // Mid crunch
    const o2=ac.createOscillator(),g2=ac.createGain();
    const flt=ac.createBiquadFilter();flt.type='lowpass';flt.frequency.setValueAtTime(2000,t);
    flt.frequency.exponentialRampToValueAtTime(200,t+0.4);
    o2.connect(flt);flt.connect(g2);g2.connect(ac.destination);
    o2.frequency.setValueAtTime(200,t);o2.frequency.exponentialRampToValueAtTime(50,t+0.3);
    o2.type='sawtooth';g2.gain.setValueAtTime(0.1,t);g2.gain.exponentialRampToValueAtTime(0.001,t+0.4);
    o2.start(t);o2.stop(t+0.4);
    // Noise burst
    filteredNoise(ac,ac.destination,800,0.5,'lowpass',0.2,t,0.5);
    // High debris
    filteredNoise(ac,ac.destination,4000,1,'highpass',0.06,t+0.05,0.3);
  },

  // ══════════════════════════════════════════
  // WINS
  // ══════════════════════════════════════════
  winSmall: (ac) => {
    const t=ac.currentTime;
    [523.25,659.25,783.99].forEach((f,i)=>{
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=f;o.type='sine';
      ga.gain.setValueAtTime(0,t+i*0.1);ga.gain.linearRampToValueAtTime(0.12,t+i*0.1+0.03);
      ga.gain.exponentialRampToValueAtTime(0.001,t+i*0.1+0.3);
      o.start(t+i*0.1);o.stop(t+i*0.1+0.35);
    });
  },

  winBig: (ac) => {
    const t=ac.currentTime;
    // Fanfare
    [392,523.25,659.25,783.99,1046.5].forEach((f,i)=>{
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=f;o.type='triangle';
      ga.gain.setValueAtTime(0,t+i*0.12);ga.gain.linearRampToValueAtTime(0.15,t+i*0.12+0.04);
      ga.gain.exponentialRampToValueAtTime(0.001,t+i*0.12+0.5);
      o.start(t+i*0.12);o.stop(t+i*0.12+0.55);
    });
    // Sparkle overlay
    for(let i=0;i<10;i++){
      const time=t+0.3+Math.random()*0.5;
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=2000+Math.random()*4000;o.type='sine';
      ga.gain.setValueAtTime(0.03,time);ga.gain.exponentialRampToValueAtTime(0.001,time+0.05);
      o.start(time);o.stop(time+0.06);
    }
  },

  winJackpot: (ac) => {
    const t=ac.currentTime;
    // Chord swell
    [261.63,329.63,392,523.25].forEach(f=>{
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=f;o.type='triangle';
      ga.gain.setValueAtTime(0,t);ga.gain.linearRampToValueAtTime(0.08,t+0.3);
      ga.gain.setValueAtTime(0.08,t+0.8);ga.gain.exponentialRampToValueAtTime(0.001,t+1.5);
      o.start(t);o.stop(t+1.5);
    });
    // Rising arpeggio
    [523.25,659.25,783.99,1046.5,1318.5,1568,2093].forEach((f,i)=>{
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=f;o.type='sine';
      ga.gain.setValueAtTime(0.1,t+0.4+i*0.08);
      ga.gain.exponentialRampToValueAtTime(0.001,t+0.4+i*0.08+0.3);
      o.start(t+0.4+i*0.08);o.stop(t+0.4+i*0.08+0.35);
    });
    // Coin shower
    for(let i=0;i<30;i++){
      const time=t+0.8+Math.random()*1;
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=3000+Math.random()*4000;o.type='sine';
      ga.gain.setValueAtTime(0.03,time);ga.gain.exponentialRampToValueAtTime(0.001,time+0.03);
      o.start(time);o.stop(time+0.04);
    }
  },

  // ══════════════════════════════════════════
  // LOSS
  // ══════════════════════════════════════════
  lossBuzz: (ac) => {
    const t=ac.currentTime;
    // Low descending buzz
    const o=ac.createOscillator(),ga=ac.createGain();
    const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=600;
    o.connect(f);f.connect(ga);ga.connect(ac.destination);
    o.frequency.setValueAtTime(300,t);o.frequency.linearRampToValueAtTime(100,t+0.5);
    o.type='sawtooth';ga.gain.setValueAtTime(0.1,t);ga.gain.exponentialRampToValueAtTime(0.001,t+0.6);
    o.start(t);o.stop(t+0.6);
    // Sad notes
    [392,349.23,293.66].forEach((freq,i)=>{
      const o2=ac.createOscillator(),g2=ac.createGain();
      o2.connect(g2);g2.connect(ac.destination);
      o2.frequency.value=freq;o2.type='sine';
      g2.gain.setValueAtTime(0.08,t+i*0.2);g2.gain.exponentialRampToValueAtTime(0.001,t+i*0.2+0.25);
      o2.start(t+i*0.2);o2.stop(t+i*0.2+0.3);
    });
  },

  // ══════════════════════════════════════════
  // UI SOUNDS
  // ══════════════════════════════════════════
  uiClick: (ac) => {
    const t=ac.currentTime;
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.setValueAtTime(1800,t);o.frequency.exponentialRampToValueAtTime(1200,t+0.02);
    o.type='sine';ga.gain.setValueAtTime(0.08,t);ga.gain.exponentialRampToValueAtTime(0.001,t+0.03);
    o.start(t);o.stop(t+0.035);
  },

  uiNotification: (ac) => {
    const t=ac.currentTime;
    [880,1108.73,1318.5].forEach((f,i)=>{
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=f;o.type='sine';
      ga.gain.setValueAtTime(0.08,t+i*0.12);
      ga.gain.exponentialRampToValueAtTime(0.001,t+i*0.12+0.2);
      o.start(t+i*0.12);o.stop(t+i*0.12+0.25);
    });
  },

  uiLevelUp: (ac) => {
    const t=ac.currentTime;
    // Power up sweep
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(1600,t+0.4);
    o.type='sine';ga.gain.setValueAtTime(0.1,t);ga.gain.exponentialRampToValueAtTime(0.001,t+0.5);
    o.start(t);o.stop(t+0.5);
    // Chime at top
    [1046.5,1318.5,1568].forEach((f,i)=>{
      const o2=ac.createOscillator(),g2=ac.createGain();
      o2.connect(g2);g2.connect(ac.destination);
      o2.frequency.value=f;o2.type='triangle';
      g2.gain.setValueAtTime(0.1,t+0.35+i*0.08);
      g2.gain.exponentialRampToValueAtTime(0.001,t+0.35+i*0.08+0.3);
      o2.start(t+0.35+i*0.08);o2.stop(t+0.35+i*0.08+0.35);
    });
  },

  uiCoinDrop: (ac) => {
    const t=ac.currentTime;
    // Metallic coin bounce
    const bounces=[0,0.1,0.17,0.22,0.26,0.29,0.31];
    bounces.forEach((d,i)=>{
      const energy=1-i/bounces.length;
      [4000,6500,8000].forEach(f=>{
        const o=ac.createOscillator(),ga=ac.createGain();
        o.connect(ga);ga.connect(ac.destination);
        o.frequency.value=f+Math.random()*500;o.type='sine';
        ga.gain.setValueAtTime(0.04*energy,t+d);ga.gain.exponentialRampToValueAtTime(0.001,t+d+0.03);
        o.start(t+d);o.stop(t+d+0.04);
      });
    });
    // Final ring
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.value=5500;o.type='sine';
    ga.gain.setValueAtTime(0.05,t+0.32);ga.gain.exponentialRampToValueAtTime(0.001,t+0.6);
    o.start(t+0.32);o.stop(t+0.65);
  },

  uiBetPlaced: (ac) => {
    const t=ac.currentTime;
    // Swoosh + confirm tone
    filteredNoise(ac,ac.destination,3000,3,'bandpass',0.05,t,0.06);
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.setValueAtTime(600,t+0.05);o.frequency.exponentialRampToValueAtTime(900,t+0.1);
    o.type='sine';ga.gain.setValueAtTime(0.08,t+0.05);ga.gain.exponentialRampToValueAtTime(0.001,t+0.15);
    o.start(t+0.05);o.stop(t+0.16);
  },

  uiCashOut: (ac) => {
    const t=ac.currentTime;
    // Ka-ching
    [800,1200,1600,2000].forEach((f,i)=>{
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=f;o.type='sine';
      ga.gain.setValueAtTime(0.08,t+i*0.04);ga.gain.exponentialRampToValueAtTime(0.001,t+i*0.04+0.15);
      o.start(t+i*0.04);o.stop(t+i*0.04+0.2);
    });
    // Metallic ring
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.value=5000;o.type='sine';
    ga.gain.setValueAtTime(0.04,t+0.15);ga.gain.exponentialRampToValueAtTime(0.001,t+0.5);
    o.start(t+0.15);o.stop(t+0.55);
  },

  // ══════════════════════════════════════════
  // AMBIANCE
  // ══════════════════════════════════════════
  ambianceCasino: (ac) => {
    const t=ac.currentTime;
    // Low murmur
    filteredNoise(ac,ac.destination,400,0.5,'lowpass',0.05,t,2);
    // Mid chatter
    filteredNoise(ac,ac.destination,1500,1,'bandpass',0.03,t,2);
    // Distant slot sounds
    for(let i=0;i<8;i++){
      const time=t+Math.random()*1.5;
      const o=ac.createOscillator(),ga=ac.createGain();
      o.connect(ga);ga.connect(ac.destination);
      o.frequency.value=1000+Math.random()*2000;o.type='sine';
      ga.gain.setValueAtTime(0.015,time);ga.gain.exponentialRampToValueAtTime(0.001,time+0.03);
      o.start(time);o.stop(time+0.04);
    }
    // Distant chime
    const o=ac.createOscillator(),ga=ac.createGain();
    o.connect(ga);ga.connect(ac.destination);
    o.frequency.value=2637;o.type='triangle';
    ga.gain.setValueAtTime(0.02,t+0.8);ga.gain.exponentialRampToValueAtTime(0.001,t+1.2);
    o.start(t+0.8);o.stop(t+1.3);
  },
};

const SOUNDS = [
  // Slot Machine
  { id:'slotLever', name:'Slot — Lever Pull', cat:'Slot Machine', color:'#a855f7', dur:300 },
  { id:'slotReelSpin', name:'Slot — Reels Spinning', cat:'Slot Machine', color:'#a855f7', dur:2200 },
  { id:'slotReelStop', name:'Slot — Reels Stop', cat:'Slot Machine', color:'#a855f7', dur:1000 },
  { id:'slotWin', name:'Slot — Win Payout', cat:'Slot Machine', color:'#FFD700', dur:1800 },
  // Roulette
  { id:'rouletteBallSpin', name:'Roulette — Ball Spin', cat:'Roulette', color:'#ef4444', dur:2500 },
  { id:'rouletteBallBounce', name:'Roulette — Ball Bounce', cat:'Roulette', color:'#ef4444', dur:700 },
  // Cartes
  { id:'cardShuffle', name:'Cartes — Shuffle', cat:'Cartes', color:'#22c55e', dur:600 },
  { id:'cardDealFlick', name:'Cartes — Deal', cat:'Cartes', color:'#22c55e', dur:150 },
  { id:'cardFlipOver', name:'Cartes — Flip', cat:'Cartes', color:'#22c55e', dur:150 },
  // Jetons
  { id:'chipSingle', name:'Jeton — Simple', cat:'Jetons', color:'#fbbf24', dur:100 },
  { id:'chipStack', name:'Jetons — Stack', cat:'Jetons', color:'#fbbf24', dur:400 },
  { id:'chipPile', name:'Jetons — Pile', cat:'Jetons', color:'#fbbf24', dur:500 },
  // Des
  { id:'diceShake', name:'Des — Shake', cat:'Des', color:'#10b981', dur:900 },
  { id:'diceRollBounce', name:'Des — Roll', cat:'Des', color:'#10b981', dur:500 },
  // Crash
  { id:'crashRocket', name:'Crash — Rocket', cat:'Crash', color:'#3b82f6', dur:1800 },
  { id:'crashExplosion', name:'Crash — Explosion', cat:'Crash', color:'#f97316', dur:700 },
  // Wins & Loss
  { id:'winSmall', name:'Win — Petit', cat:'Resultats', color:'#22c55e', dur:500 },
  { id:'winBig', name:'Win — Gros', cat:'Resultats', color:'#22c55e', dur:1000 },
  { id:'winJackpot', name:'Win — Jackpot', cat:'Resultats', color:'#FFD700', dur:2000 },
  { id:'lossBuzz', name:'Loss — Buzz', cat:'Resultats', color:'#ef4444', dur:700 },
  // UI
  { id:'uiClick', name:'UI — Click', cat:'Interface', color:'#94a3b8', dur:80 },
  { id:'uiNotification', name:'UI — Notification', cat:'Interface', color:'#3b82f6', dur:500 },
  { id:'uiLevelUp', name:'UI — Level Up', cat:'Interface', color:'#FFD700', dur:800 },
  { id:'uiCoinDrop', name:'UI — Coin Drop', cat:'Interface', color:'#fbbf24', dur:700 },
  { id:'uiBetPlaced', name:'UI — Bet Placed', cat:'Interface', color:'#3b82f6', dur:200 },
  { id:'uiCashOut', name:'UI — Cash Out', cat:'Interface', color:'#22c55e', dur:600 },
  // Ambiance
  { id:'ambianceCasino', name:'Ambiance — Casino', cat:'Ambiance', color:'#8b5cf6', dur:2500 },
];

const CATS = ['Tous','Slot Machine','Roulette','Cartes','Jetons','Des','Crash','Resultats','Interface','Ambiance'];

function SoundCard({ sound, pref, onPref }) {
  const [playing, setPlaying] = useState(false);

  const play = () => {
    if(playing) return;
    try {
      const ac = ctx();
      generators[sound.id](ac);
      setPlaying(true);
      setTimeout(() => { setPlaying(false); ac.close(); }, sound.dur || 800);
    } catch(e) { console.error(e); }
  };

  return (
    <div className="rounded-2xl p-4 transition-all" style={{ background: crd, border: `1px solid ${playing ? sound.color+'60' : b}`, boxShadow: playing ? `0 0 24px ${sound.color}20` : 'none' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${sound.color}15`, border: `1px solid ${sound.color}25` }}>
          <Volume2 className="w-5 h-5" style={{ color: sound.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{sound.name}</p>
          <p className="text-[11px]" style={{ color: m }}>{sound.cat}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-[2px] h-8 mb-3">
        {Array.from({length:24}).map((_,i)=>{
          const h = playing ? 6+Math.sin(Date.now()/50+i*0.8)*8+Math.random()*8 : 3;
          return <div key={i} className="w-[2.5px] rounded-full" style={{
            height: playing ? `${h}px` : '3px',
            background: playing ? sound.color : `${m}40`,
            transition: 'height 0.08s ease',
          }}/>;
        })}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={play} disabled={playing}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
          style={{ background: playing ? `${sound.color}25` : g, color: playing ? sound.color : '#000' }}>
          <Play className="w-3.5 h-3.5"/>{playing ? 'Playing...' : 'Play'}
        </button>

        <button onClick={() => onPref(sound.id, pref === 'like' ? null : 'like')}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: pref === 'like' ? 'rgba(0,231,1,0.15)' : b, border: `1px solid ${pref === 'like' ? g+'50' : b}` }}>
          <ThumbsUp className="w-4 h-4" style={{ color: pref === 'like' ? g : m }} />
        </button>

        <button onClick={() => onPref(sound.id, pref === 'dislike' ? null : 'dislike')}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          style={{ background: pref === 'dislike' ? 'rgba(239,68,68,0.15)' : b, border: `1px solid ${pref === 'dislike' ? '#ef444450' : b}` }}>
          <ThumbsDown className="w-4 h-4" style={{ color: pref === 'dislike' ? '#ef4444' : m }} />
        </button>
      </div>
    </div>
  );
}

export default function SoundBrowser() {
  const [filter, setFilter] = useState('Tous');
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cazyno_sound_prefs')) || {}; } catch { return {}; }
  });

  useEffect(() => { localStorage.setItem('cazyno_sound_prefs', JSON.stringify(prefs)); }, [prefs]);

  const setPref = (id, val) => setPrefs(p => ({ ...p, [id]: val }));
  const filtered = filter === 'Tous' ? SOUNDS : SOUNDS.filter(s => s.cat === filter);
  const liked = Object.values(prefs).filter(v => v === 'like').length;
  const disliked = Object.values(prefs).filter(v => v === 'dislike').length;

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-orbitron font-black text-white mb-2">Bruitages Casino</h1>
        <p className="text-[13px]" style={{ color: s }}>
          Ecoute chaque son et selectionne ceux que tu veux garder.
          <span className="ml-3 font-bold" style={{ color: g }}>{liked} likes</span>
          <span className="ml-2 font-bold" style={{ color: '#ef4444' }}>{disliked} dislikes</span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATS.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className="px-4 py-2 rounded-xl text-[12px] font-bold transition-all"
            style={{
              background: filter === cat ? `${g}15` : crd,
              border: `1px solid ${filter === cat ? g+'40' : b}`,
              color: filter === cat ? g : s,
            }}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(sound => (
          <SoundCard key={sound.id} sound={sound} pref={prefs[sound.id]} onPref={setPref} />
        ))}
      </div>
    </div>
  );
}
