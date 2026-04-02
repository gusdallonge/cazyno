import { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, RotateCw } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import WinPopup from '../components/WinPopup';
import { saveRound } from '../lib/saveRound';

const NEON = '#00e701';
const RED = '#FF4444';

// 10 segments with multipliers and colors
// Distribution: 0x(2), 1x(3), 2x(2), 3x(1), 5x(1), 10x(0.5 weight via positioning), 50x(0.5)
const SEGMENTS = [
  { mult: 0, color: '#1a2a38', label: '0x' },
  { mult: 1, color: '#2a3a48', label: '1x' },
  { mult: 2, color: '#1a4a38', label: '2x' },
  { mult: 1, color: '#2a3a48', label: '1x' },
  { mult: 3, color: '#3a2a48', label: '3x' },
  { mult: 0, color: '#1a2a38', label: '0x' },
  { mult: 1, color: '#2a3a48', label: '1x' },
  { mult: 5, color: '#4a3a18', label: '5x' },
  { mult: 2, color: '#1a4a38', label: '2x' },
  { mult: 50, color: '#00e701', label: '50x' },
];

function playSound(freq, duration) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (e) {}
}

export default function Wheel() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [bet, setBet] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [won, setWon] = useState(null);
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);
  const wheelRef = useRef(null);

  const clampBet = (v) => Math.max(1, Math.min(Math.floor(credits), v));
  const segAngle = 360 / SEGMENTS.length;

  const spin = async () => {
    if (bet <= 0 || bet > credits || spinning) return;
    setCredits(c => c - bet);
    addXp(bet);
    setSpinning(true);
    setResult(null);
    setWon(null);

    // Pick random segment
    const idx = Math.floor(Math.random() * SEGMENTS.length);
    const segment = SEGMENTS[idx];

    // Calculate rotation: multiple full spins + land on segment
    // The pointer is at top (0 degrees). We need the segment center to align with top.
    const segCenter = idx * segAngle + segAngle / 2;
    const fullSpins = 5 + Math.floor(Math.random() * 3);
    const targetRotation = rotation + fullSpins * 360 + (360 - segCenter);

    setRotation(targetRotation);

    // Wait for animation
    await new Promise(r => setTimeout(r, 4000));

    const mult = segment.mult;
    const payout = bet * mult;
    const didWin = mult > 0;

    setResult({ mult, payout });
    setWon(didWin);

    if (didWin) {
      setCredits(c => c + payout);
      playSound(1200, 220);
      if (payout > bet) {
        setWinPopup({ amount: (payout - bet).toFixed(2), ts: Date.now() });
      }
    } else {
      playSound(280, 350);
    }

    saveRound({ game: 'Wheel', bet, result: `x${mult}`, profit: didWin ? payout - bet : -bet });
    setHistory(h => [{ mult, won: didWin, ts: Date.now() }, ...h.slice(0, 11)]);
    setSpinning(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 fade-up"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,102,0.06) 0%, transparent 60%), linear-gradient(180deg, #0c0f18 0%, #080a10 100%)' }}>
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: `${NEON}12`, border: `1px solid ${NEON}30` }}>
          <RotateCw className="w-3.5 h-3.5" style={{ color: NEON }} />
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: NEON }}>Casino</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black font-orbitron tracking-tight"
          style={{ color: '#fff', textShadow: `0 0 80px ${NEON}44` }}>WHEEL</h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Spin to win up to <span style={{ color: NEON }}>50x</span> your bet.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            {/* Wheel */}
            <div className="rounded-3xl p-8 flex flex-col items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.08)', minHeight: 380 }}>

              {/* Pointer */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                <div style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', borderTop: `20px solid ${NEON}`, filter: `drop-shadow(0 0 6px ${NEON}80)` }} />
              </div>

              {/* Wheel SVG */}
              <svg ref={wheelRef} viewBox="-110 -110 220 220" width="280" height="280"
                style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none' }}>
                {SEGMENTS.map((seg, i) => {
                  const startAngle = (i * segAngle - 90) * (Math.PI / 180);
                  const endAngle = ((i + 1) * segAngle - 90) * (Math.PI / 180);
                  const x1 = 100 * Math.cos(startAngle);
                  const y1 = 100 * Math.sin(startAngle);
                  const x2 = 100 * Math.cos(endAngle);
                  const y2 = 100 * Math.sin(endAngle);
                  const largeArc = segAngle > 180 ? 1 : 0;
                  const midAngle = ((i + 0.5) * segAngle - 90) * (Math.PI / 180);
                  const tx = 65 * Math.cos(midAngle);
                  const ty = 65 * Math.sin(midAngle);

                  return (
                    <g key={i}>
                      <path d={`M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={seg.color} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                      <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central"
                        fill={seg.mult === 50 ? '#111' : seg.mult >= 5 ? '#FFD700' : '#fff'}
                        fontSize="11" fontWeight="900" fontFamily="Orbitron, monospace"
                        transform={`rotate(${(i + 0.5) * segAngle}, ${tx}, ${ty})`}>
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
                <circle r="18" fill="#111a25" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                <circle r="3" fill={NEON} />
              </svg>

              {result !== null && !spinning && (
                <div className="mt-4 px-5 py-1.5 rounded-full font-bold text-sm tracking-widest uppercase"
                  style={{ background: won ? `${NEON}18` : `${RED}18`, border: `1px solid ${won ? `${NEON}40` : `${RED}40`}`, color: won ? NEON : RED }}>
                  {result.mult > 0 ? `x${result.mult} — ${result.payout.toFixed(2)} credits` : 'x0 — No win'}
                </div>
              )}
            </div>

            {/* Segment legend */}
            <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Segments</p>
              <div className="flex flex-wrap gap-2">
                {[...new Set(SEGMENTS.map(s => s.mult))].sort((a, b) => a - b).map(m => {
                  const count = SEGMENTS.filter(s => s.mult === m).length;
                  return (
                    <div key={m} className="px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: m >= 10 ? NEON : m >= 3 ? '#FFD700' : 'rgba(255,255,255,0.6)' }}>
                      x{m} ({count}/{SEGMENTS.length})
                    </div>
                  );
                })}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Last spins</p>
                <div className="flex flex-wrap gap-2">
                  {history.map(({ mult, won: w, ts }) => (
                    <div key={ts} className="w-12 h-10 rounded-xl flex items-center justify-center font-black text-xs font-orbitron"
                      style={{ background: w ? `${NEON}15` : `${RED}15`, border: `1px solid ${w ? `${NEON}35` : `${RED}35`}`, color: w ? NEON : RED }}>
                      x{mult}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Bet amount</span>
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Balance: <span style={{ color: NEON }}>{credits.toFixed(2)} credits</span>
                </span>
              </div>
              <div className="relative mb-3">
                <input type="number" value={bet} onChange={e => setBet(clampBet(Number(e.target.value) || 1))} disabled={spinning}
                  className="w-full px-5 py-4 rounded-2xl text-2xl font-black text-center focus:outline-none disabled:opacity-40 transition-all"
                  style={{ background: 'rgba(0,255,102,0.06)', border: `1.5px solid ${NEON}35`, color: NEON, fontFamily: "'Orbitron', monospace" }} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[['1/2', () => setBet(clampBet(Math.floor(bet / 2)))], ['2x', () => setBet(clampBet(bet * 2))], ['10', () => setBet(clampBet(10))], ['Max', () => setBet(clampBet(credits))]].map(([label, fn]) => (
                  <button key={label} onClick={fn} disabled={spinning}
                    className="py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {!isAuthenticated ? (
              <button onClick={navigateToLogin}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all active:scale-95"
                style={{ background: `linear-gradient(135deg, ${NEON}18 0%, rgba(0,150,60,0.1) 100%)`, border: `1.5px solid ${NEON}45`, color: NEON, boxShadow: `0 4px 24px ${NEON}18` }}>
                <Lock className="w-4 h-4 inline mr-2" /> Sign in to play
              </button>
            ) : (
              <button onClick={spin} disabled={spinning || bet > credits}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${NEON}18 0%, rgba(0,150,60,0.1) 100%)`, border: `1.5px solid ${NEON}45`, color: NEON, boxShadow: `0 4px 24px ${NEON}18` }}>
                <RotateCw className="w-4 h-4 inline mr-2" />
                {spinning ? 'SPINNING...' : 'SPIN'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
