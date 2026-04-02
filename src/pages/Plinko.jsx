import { useState, useRef, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, Target } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import WinPopup from '../components/WinPopup';
import { useLang, t } from '../lib/i18n';
import { saveRound } from '../lib/saveRound';

// Board config
const ROWS = 14;
const BUCKETS = ROWS + 1; // 15 buckets for 14 rows

// Multipliers - center is low, edges are HIGH
// With 14 rows, bucket 0 & 14 = far edge (jackpot)
const MODES = {
  normal: {
    multipliers: [100, 20, 5, 2, 1, 0.5, 0.3, 0.2, 0.3, 0.5, 1, 2, 5, 20, 100],
    colors: ['#FFD700','#f97316','#22c55e','#3b82f6','#6b7280','#4b5563','#374151','#374151','#374151','#4b5563','#6b7280','#3b82f6','#22c55e','#f97316','#FFD700'],
  },
  medium: {
    multipliers: [500, 50, 10, 3, 1, 0.5, 0.2, 0.1, 0.2, 0.5, 1, 3, 10, 50, 500],
    colors: ['#FFD700','#FFD700','#f97316','#22c55e','#3b82f6','#4b5563','#374151','#1f2937','#374151','#4b5563','#3b82f6','#22c55e','#f97316','#FFD700','#FFD700'],
  },
  expert: {
    multipliers: [2000, 200, 20, 5, 1, 0.3, 0.1, 0.05, 0.1, 0.3, 1, 5, 20, 200, 2000],
    colors: ['#FFD700','#FFD700','#FFD700','#f97316','#22c55e','#3b82f6','#374151','#1f2937','#374151','#3b82f6','#22c55e','#f97316','#FFD700','#FFD700','#FFD700'],
  },
};

const SVG_W = 560;
const COL_STEP = SVG_W / (BUCKETS + 1);
const ROW_STEP = 34;
const PAD_TOP = 40;
const PEG_R = 5;
const BALL_R = 8;
const BUCKET_Y = PAD_TOP + ROWS * ROW_STEP + 16;
const BUCKET_H = 44;
const SVG_H = BUCKET_Y + BUCKET_H + 20;

function pegX(row, col) {
  const numPegs = row + 3;
  const totalWidth = (numPegs - 1) * COL_STEP;
  const startX = (SVG_W - totalWidth) / 2;
  return startX + col * COL_STEP;
}

function pegY(row) {
  return PAD_TOP + row * ROW_STEP;
}

function bucketCenterX(i) {
  return COL_STEP * (i + 1);
}

// Real physics simulation — Galton board
// Each peg: 50% go left, 50% go right (unbiased)
// No artificial clamping → true binomial distribution
// Ball can reach ANY bucket including extreme edges
function simulate() {
  // Position as continuous float: 0 = leftmost, 1 = rightmost among available pegs for that row
  // At row r, there are r+3 pegs → r+2 gaps → bucket can be 0..r+2
  // We track column index from the leftmost peg
  
  const path = [];
  path.push({ x: SVG_W / 2, y: PAD_TOP - 20, row: -1 });

  // Use a true random walk: col starts at center, each step ±1 no clamping
  let col = (ROWS + 2) / 2; // start at center (for ROWS=14, col=8)
  
  for (let r = 0; r < ROWS; r++) {
    // True 50/50 random bounce
    const goRight = Math.random() > 0.5;
    if (goRight) col += 1;
    // col stays as-is for left
    
    // The peg hit: the peg at (r, Math.floor(col - (numPegs - (r+3)) / ?))
    // Simpler: track absolute horizontal position in SVG coords
    const numPegs = r + 3;
    const totalWidth = (numPegs - 1) * COL_STEP;
    const startX = (SVG_W - totalWidth) / 2;
    
    // Which peg? Approximate based on col fraction
    const colFraction = (col - (ROWS + 2 - (r + 2)) / 2) / (r + 2); // normalized 0..1
    const clampedFraction = Math.max(0, Math.min(1, colFraction));
    const pegIndex = Math.round(clampedFraction * (numPegs - 1));
    const px = startX + pegIndex * COL_STEP;
    const py = pegY(r);
    
    path.push({ x: px, y: py, row: r });
    playPegSound();
  }

  // Final bucket based on how many rights were taken
  // col started at center=(ROWS+2)/2, each right adds 1
  // After ROWS rows, col is in range [center, center+ROWS] if all right
  // But we also don't go left so col is in [(ROWS+2)/2, (ROWS+2)/2 + ROWS]
  // Wait, I need to rethink this — let me use a proper index

  // Redo: use integer bucket tracking
  return simulateProper();
}

function simulateProper() {
  const path = [];
  path.push({ x: SVG_W / 2, y: PAD_TOP - 20 });
  
  // Track position as bucket offset (0 = leftmost possible bucket)
  // At row r, ball can be in position 0..r (meaning it went right r times)
  let position = 0; // number of right turns taken
  
  const pegPositions = [];
  
  for (let r = 0; r < ROWS; r++) {
    const goRight = Math.random() > 0.5;
    if (goRight) position += 1;
    
    // Current peg position in SVG
    // Row r has r+3 pegs, and the ball is at peg index = position + 1 (accounting for offset)
    const numPegs = r + 3;
    const totalWidth = (numPegs - 1) * COL_STEP;
    const startX = (SVG_W - totalWidth) / 2;
    // The ball hits peg at index: center peg is at (numPegs-1)/2, offset by position - r/2
    // Simpler: ball position in [0..r] maps to peg index [1..r+1] (first and last are edge pegs)
    const pegIndex = position + 1; // peg index within row (1-indexed accounting for first peg)
    
    // But we need to constrain to valid pegs
    const safePegIndex = Math.max(0, Math.min(numPegs - 1, pegIndex));
    const px = startX + safePegIndex * COL_STEP;
    const py = pegY(r);
    
    path.push({ x: px, y: py });
    pegPositions.push({ x: px, y: py, row: r });
  }
  
  // Bucket = position (0 to ROWS)
  const bucket = Math.max(0, Math.min(BUCKETS - 1, position));
  path.push({ x: bucketCenterX(bucket), y: BUCKET_Y + BUCKET_H / 2 });
  
  return { path, bucket };
}

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  return audioCtx;
}

function playPegSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch(e) {}
}

function playWinSound(multiplier) {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const freq = multiplier >= 100 ? 800 : multiplier >= 10 ? 600 : 400;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 2, ctx.currentTime + 0.3);
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } catch(e) {}
}

export default function Plinko() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const lang = useLang();

  const [mode, setMode] = useState('normal');
  const [bet, setBet] = useState(10);
  const [balls, setBalls] = useState([]); // [{id, path, pathIdx, x, y}]
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);
  const [landedBucket, setLandedBucket] = useState(null);
  const isDropping = balls.length > 0;

  const { multipliers, colors } = MODES[mode];

  const drop = useCallback(async () => {
    if (!isAuthenticated) { navigateToLogin(); return; }
    if (bet > credits || bet < 1) return;
    
    setCredits(c => c - bet);
    addXp(bet);

    const { path, bucket } = simulateProper();
    const ballId = Date.now() + Math.random();

    // Animate ball through path
    const ball = { id: ballId, x: path[0].x, y: path[0].y };
    setBalls(prev => [...prev, ball]);

    for (let i = 1; i < path.length; i++) {
      const delay = i === path.length - 1 ? 120 : 70 + i * 2; // gravity acceleration
      await new Promise(r => setTimeout(r, delay));
      setBalls(prev => prev.map(b => b.id === ballId ? { ...b, x: path[i].x, y: path[i].y } : b));
      if (i < path.length - 1) playPegSound();
    }

    const multiplier = multipliers[bucket];
    const gain = parseFloat((bet * multiplier).toFixed(2));
    setCredits(c => c + gain);
    setLandedBucket(bucket);
    playWinSound(multiplier);
    saveRound({ game: 'Plinko', bet, result: `×${multiplier}`, profit: parseFloat((gain - bet).toFixed(2)) });
    setHistory(h => [{ multiplier, gain, bet, bucket, ts: Date.now() }, ...h.slice(0, 9)]);

    if (gain > bet) {
      setWinPopup({ amount: Number((gain - bet).toFixed(2)).toLocaleString('fr-FR'), ts: Date.now() });
    }

    await new Promise(r => setTimeout(r, 800));
    setBalls(prev => prev.filter(b => b.id !== ballId));
    setTimeout(() => setLandedBucket(null), 1500);
  }, [bet, credits, mode, isAuthenticated]);

  return (
    <div className="space-y-4 fade-up max-w-4xl mx-auto px-1 sm:px-4 pb-8" style={{ fontFamily: 'monospace' }}>
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      <div className="text-center">
        <h1 className="font-orbitron text-4xl font-black" style={{ color: '#00e701', textShadow: '0 0 20px #00e70199' }}>
          PLINKO
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.35)' }} className="mt-1 text-sm">Laisse tomber la bille et gagne gros</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Board */}
        <div className="lg:col-span-2 rounded-2xl p-2 sm:p-4 flex flex-col items-center order-last lg:order-first"
          style={{ background: 'linear-gradient(160deg, #080c10 0%, #04060a 100%)', border: '1px solid rgba(0,255,102,0.1)', boxShadow: '0 4px 40px rgba(0,0,0,0.7)' }}>

          <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ maxWidth: SVG_W, display: 'block' }}>
            <defs>
              {multipliers.map((m, i) => (
                <radialGradient key={i} id={`bucketGrad${i}`} cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor={colors[i]} stopOpacity="0.9"/>
                  <stop offset="100%" stopColor={colors[i]} stopOpacity="0.3"/>
                </radialGradient>
              ))}
              <radialGradient id="pegGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="60%" stopColor="#aaddcc"/>
                <stop offset="100%" stopColor="#336655"/>
              </radialGradient>
              <radialGradient id="ballGrad2" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffffff"/>
                <stop offset="60%" stopColor="#ffeeaa"/>
                <stop offset="100%" stopColor="#cc8800"/>
              </radialGradient>
              <filter id="pegGlow2">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="ballGlow2">
                <feGaussianBlur stdDeviation="4" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Pegs — triangular grid */}
            {Array.from({ length: ROWS }, (_, row) =>
              Array.from({ length: row + 3 }, (_, col) => (
                <circle
                  key={`${row}-${col}`}
                  cx={pegX(row, col)}
                  cy={pegY(row)}
                  r={PEG_R}
                  fill="url(#pegGrad)"
                  filter="url(#pegGlow2)"
                />
              ))
            )}

            {/* Buckets */}
            {multipliers.map((m, i) => {
              const cx = bucketCenterX(i);
              const bw = COL_STEP - 3;
              const bx = cx - bw / 2;
              const isLanded = landedBucket === i;
              const isHigh = m >= 50;
              const isMid = m >= 5 && m < 50;
              return (
                <g key={i}>
                  <rect
                    x={bx} y={BUCKET_Y} width={bw} height={BUCKET_H} rx={6}
                    fill={`url(#bucketGrad${i})`}
                    stroke={isLanded ? '#00e701' : colors[i]}
                    strokeWidth={isLanded ? 2.5 : 0.8}
                    style={{ transition: 'stroke-width 0.3s, filter 0.3s', filter: isLanded ? `drop-shadow(0 0 8px ${colors[i]})` : 'none' }}
                  />
                  <text
                    x={cx} y={BUCKET_Y + BUCKET_H / 2 + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={m >= 1000 ? 7 : m >= 100 ? 8 : m >= 10 ? 9 : 10}
                    fontFamily="Orbitron,monospace" fontWeight="900"
                    fill={isHigh ? '#FFD700' : isMid ? '#00e701' : '#aaa'}
                    style={{ filter: isLanded ? `drop-shadow(0 0 4px ${colors[i]})` : 'none' }}
                  >
                    {m >= 1 ? `×${m >= 1000 ? `${m/1000}k` : m}` : `×${m}`}
                  </text>
                </g>
              );
            })}

            {/* Drop zone marker */}
            <line x1={SVG_W/2 - 20} y1={PAD_TOP - 25} x2={SVG_W/2 + 20} y2={PAD_TOP - 25}
              stroke="rgba(0,255,102,0.3)" strokeWidth="1" strokeDasharray="4,4"/>
            <polygon points={`${SVG_W/2},${PAD_TOP - 10} ${SVG_W/2-6},${PAD_TOP - 20} ${SVG_W/2+6},${PAD_TOP - 20}`}
              fill="rgba(0,255,102,0.4)"/>

            {/* Balls */}
            {balls.map(ball => (
              <g key={ball.id}>
                <circle
                  cx={ball.x}
                  cy={ball.y}
                  r={BALL_R + 4}
                  fill="rgba(255,220,100,0.15)"
                  filter="url(#ballGlow2)"
                  style={{ transition: `cx ${70}ms linear, cy ${70}ms linear` }}
                />
                <circle
                  cx={ball.x}
                  cy={ball.y}
                  r={BALL_R}
                  fill="url(#ballGrad2)"
                  filter="url(#ballGlow2)"
                  style={{ transition: `cx ${70}ms linear, cy ${70}ms linear` }}
                />
                <circle
                  cx={ball.x - 2}
                  cy={ball.y - 2}
                  r={2.5}
                  fill="white" opacity="0.8"
                  style={{ transition: `cx ${70}ms linear, cy ${70}ms linear` }}
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Controls */}
        <div className="space-y-3 order-first lg:order-last">
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: '#0a0a0a', border: '1px solid rgba(0,255,102,0.15)' }}>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Mise</p>
              <input
                type="number" value={bet || ''} min={1}
                onChange={e => setBet(Math.max(1, Number(e.target.value) || 1))}
                placeholder="10"
                className="w-full rounded-xl px-4 py-3 font-orbitron font-bold text-xl text-center focus:outline-none"
                style={{ background: 'rgba(0,255,102,0.06)', border: '1.5px solid rgba(0,255,102,0.35)', color: '#00e701', fontFamily: 'monospace' }}
              />
              <div className="flex gap-1.5 mt-2">
                {[['½', () => setBet(Math.max(1, Math.floor(bet / 2)))], ['×2', () => setBet(Math.min(credits, bet * 2))], ['Max', () => setBet(credits)]].map(([lbl, fn]) => (
                  <button key={lbl} onClick={fn} disabled={isDropping}
                    className="flex-1 py-1.5 rounded-lg font-bold text-xs disabled:opacity-40 transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Mode selector */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Difficulté</p>
              <div className="flex gap-1.5">
                {Object.keys(MODES).map(m => (
                  <button key={m} onClick={() => setMode(m)} disabled={isDropping}
                    className="flex-1 py-2 rounded-lg text-xs font-orbitron font-bold transition-all disabled:opacity-50 capitalize"
                    style={{
                      background: mode === m ? 'rgba(0,255,102,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${mode === m ? 'rgba(0,255,102,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      color: mode === m ? '#00e701' : '#666',
                    }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {!isAuthenticated ? (
              <button onClick={navigateToLogin}
                className="w-full py-3.5 rounded-xl font-orbitron font-black text-sm tracking-widest transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #00e701, #00CC55)', color: '#000', boxShadow: '0 0 20px rgba(0,255,102,0.4)' }}>
                <Lock className="w-4 h-4 inline mr-2" /> Se connecter pour jouer
              </button>
            ) : (
              <button onClick={drop} disabled={bet > credits || bet < 1}
                className="w-full py-3.5 rounded-xl font-orbitron font-black text-base tracking-widest disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #00e701, #00CC55)', color: '#000', boxShadow: '0 0 20px rgba(0,255,102,0.4)' }}>
                LANCER
              </button>
            )}

            {/* Solde */}
            <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] text-white/30 mb-0.5">SOLDE</p>
              <p className="font-black text-lg font-orbitron" style={{ color: '#00e701' }}>{credits.toFixed(2)} €</p>
            </div>
          </div>

          {/* Multiplier legend */}
          <div className="rounded-2xl p-3.5" style={{ background: '#0a0a0a', border: '1px solid rgba(0,255,102,0.1)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Multiplicateurs</p>
            <div className="space-y-1">
              {[
                { label: mode === 'expert' ? '×2000' : mode === 'medium' ? '×500' : '×100', desc: 'Jackpot (extrêmes)', color: '#FFD700' },
                { label: mode === 'expert' ? '×200' : mode === 'medium' ? '×50' : '×20', desc: 'Excellent', color: '#f97316' },
                { label: mode === 'expert' ? '×20' : mode === 'medium' ? '×10' : '×5', desc: 'Bon gain', color: '#22c55e' },
                { label: mode === 'expert' ? '×1' : mode === 'medium' ? '×1' : '×1', desc: 'Remise en jeu', color: '#3b82f6' },
                { label: mode === 'expert' ? '×0.05' : mode === 'medium' ? '×0.1' : '×0.2', desc: 'Centre (perte)', color: '#6b7280' },
              ].map(({ label, desc, color }) => (
                <div key={label} className="flex justify-between items-center text-xs">
                  <span className="font-orbitron font-bold" style={{ color }}>{label}</span>
                  <span className="text-[#94a3b8]">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="rounded-2xl p-3.5" style={{ background: '#0a0a0a', border: '1px solid rgba(0,255,102,0.1)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Historique</p>
              <div className="space-y-1.5">
                {history.map(({ multiplier, gain, bet: b, ts }) => (
                  <div key={ts} className="flex items-center justify-between rounded-lg px-3 py-1.5 text-xs"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="font-orbitron font-bold" style={{ color: multiplier >= 10 ? '#FFD700' : multiplier >= 1 ? '#00e701' : '#aaa' }}>×{multiplier}</span>
                    <span className="font-orbitron font-bold" style={{ color: gain >= b ? '#00e701' : '#FF4444' }}>
                      {gain >= b ? '+' : ''}{(gain - b).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}