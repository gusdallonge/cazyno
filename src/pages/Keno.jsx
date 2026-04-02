import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, Grid3X3, Zap } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import WinPopup from '../components/WinPopup';
import { saveRound } from '../lib/saveRound';

const NEON = '#00e701';
const RED = '#FF4444';

// Payout table: payouts[picks][matches] = multiplier
const PAYOUTS = {
  1: { 0: 0, 1: 3.6 },
  2: { 0: 0, 1: 1.5, 2: 8 },
  3: { 0: 0, 1: 1, 2: 3, 3: 24 },
  4: { 0: 0, 1: 0.5, 2: 2, 3: 8, 4: 60 },
  5: { 0: 0, 1: 0, 2: 1.5, 3: 4, 4: 20, 5: 120 },
  6: { 0: 0, 1: 0, 2: 1, 3: 2.5, 4: 10, 5: 50, 6: 300 },
  7: { 0: 0, 1: 0, 2: 0.5, 3: 2, 4: 6, 5: 25, 6: 100, 7: 600 },
  8: { 0: 0, 1: 0, 2: 0, 3: 1.5, 4: 4, 5: 15, 6: 60, 7: 250, 8: 1000 },
  9: { 0: 0, 1: 0, 2: 0, 3: 1, 4: 3, 5: 10, 6: 40, 7: 150, 8: 500, 9: 2000 },
  10: { 0: 0, 1: 0, 2: 0, 3: 0.5, 4: 2, 5: 6, 6: 25, 7: 100, 8: 400, 9: 1500, 10: 5000 },
};

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

export default function Keno() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [bet, setBet] = useState(10);
  const [selected, setSelected] = useState([]);
  const [drawn, setDrawn] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null); // { matches, multiplier, won }
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);

  const clampBet = (v) => Math.max(1, Math.min(Math.floor(credits), v));

  const toggleNumber = (n) => {
    if (playing || drawn.length > 0) return;
    if (selected.includes(n)) {
      setSelected(s => s.filter(x => x !== n));
    } else if (selected.length < 10) {
      setSelected(s => [...s, n]);
    }
  };

  const clearSelection = () => {
    if (playing) return;
    setSelected([]);
    setDrawn([]);
    setResult(null);
  };

  const autoSelect = (count) => {
    if (playing) return;
    const nums = [];
    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      nums.push(pool.splice(idx, 1)[0]);
    }
    setSelected(nums);
    setDrawn([]);
    setResult(null);
  };

  const play = async () => {
    if (selected.length === 0 || bet <= 0 || bet > credits || playing) return;
    setCredits(c => c - bet);
    addXp(bet);
    setPlaying(true);
    setDrawn([]);
    setResult(null);

    // Draw 10 unique random numbers
    const pool = Array.from({ length: 40 }, (_, i) => i + 1);
    const drawnNums = [];
    for (let i = 0; i < 10; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      drawnNums.push(pool.splice(idx, 1)[0]);
    }

    // Reveal one by one
    for (let i = 0; i < drawnNums.length; i++) {
      await new Promise(r => setTimeout(r, 150));
      setDrawn(d => [...d, drawnNums[i]]);
      if (selected.includes(drawnNums[i])) {
        playSound(1000 + i * 100, 150);
      }
    }

    const matches = drawnNums.filter(n => selected.includes(n)).length;
    const picks = selected.length;
    const multiplier = PAYOUTS[picks]?.[matches] ?? 0;
    const won = multiplier > 0;
    const payout = bet * multiplier;

    if (won) {
      setCredits(c => c + payout);
      playSound(1200, 220);
      setWinPopup({ amount: (payout - bet).toFixed(2), ts: Date.now() });
    } else {
      playSound(280, 350);
    }

    setResult({ matches, multiplier, won });
    saveRound({ game: 'Keno', bet, result: `Picks:${picks} Matches:${matches} x${multiplier}`, profit: won ? payout - bet : -bet });
    setHistory(h => [{ matches, picks, multiplier, won, ts: Date.now() }, ...h.slice(0, 11)]);
    setPlaying(false);
  };

  const isDrawn = (n) => drawn.includes(n);
  const isHit = (n) => selected.includes(n) && drawn.includes(n);
  const isMiss = (n) => selected.includes(n) && drawn.length === 10 && !drawn.includes(n);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 fade-up"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,102,0.06) 0%, transparent 60%), linear-gradient(180deg, #0c0f18 0%, #080a10 100%)' }}>
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: `${NEON}12`, border: `1px solid ${NEON}30` }}>
          <Grid3X3 className="w-3.5 h-3.5" style={{ color: NEON }} />
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: NEON }}>Casino</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black font-orbitron tracking-tight"
          style={{ color: '#fff', textShadow: `0 0 80px ${NEON}44` }}>KENO</h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Pick up to <span style={{ color: NEON }}>10</span> numbers. Match the draw to win big.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            {/* Grid */}
            <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="grid grid-cols-8 gap-2">
                {Array.from({ length: 40 }, (_, i) => i + 1).map(n => {
                  const sel = selected.includes(n);
                  const hit = isHit(n);
                  const miss = isMiss(n);
                  const dr = isDrawn(n) && !sel;
                  let bg = 'rgba(255,255,255,0.05)';
                  let border = 'rgba(255,255,255,0.08)';
                  let color = 'rgba(255,255,255,0.5)';
                  if (hit) { bg = `${NEON}25`; border = `${NEON}60`; color = NEON; }
                  else if (miss) { bg = `${RED}20`; border = `${RED}50`; color = RED; }
                  else if (dr) { bg = 'rgba(255,255,255,0.1)'; border = 'rgba(255,255,255,0.2)'; color = 'rgba(255,255,255,0.7)'; }
                  else if (sel) { bg = `${NEON}15`; border = `${NEON}40`; color = NEON; }

                  return (
                    <button key={n} onClick={() => toggleNumber(n)} disabled={playing}
                      className="aspect-square rounded-xl flex items-center justify-center font-bold text-sm font-orbitron transition-all hover:scale-105 active:scale-95 disabled:cursor-default"
                      style={{ background: bg, border: `1px solid ${border}`, color, boxShadow: hit ? `0 0 12px ${NEON}40` : 'none' }}>
                      {n}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={clearSelection} disabled={playing}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                  Clear
                </button>
                {[3, 5, 7, 10].map(c => (
                  <button key={c} onClick={() => autoSelect(c)} disabled={playing}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                    Auto {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            {result && (
              <div className="rounded-3xl p-5 text-center"
                style={{ background: result.won ? `${NEON}08` : `${RED}08`, border: `1px solid ${result.won ? `${NEON}30` : `${RED}30`}` }}>
                <p className="text-2xl font-black font-orbitron" style={{ color: result.won ? NEON : RED }}>
                  {result.matches} / {selected.length} matches
                </p>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {result.won ? `Won ${(bet * result.multiplier).toFixed(2)} credits (x${result.multiplier})` : 'No payout'}
                </p>
              </div>
            )}

            {/* Payout table */}
            {selected.length > 0 && (
              <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Payouts for {selected.length} picks</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(PAYOUTS[selected.length] || {}).filter(([, v]) => v > 0).map(([m, v]) => (
                    <div key={m} className="px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                      {m} hits = <span style={{ color: NEON }}>x{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>History</p>
                <div className="flex flex-wrap gap-2">
                  {history.map(({ matches, picks, multiplier, won, ts }) => (
                    <div key={ts} className="px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: won ? `${NEON}15` : `${RED}15`, border: `1px solid ${won ? `${NEON}35` : `${RED}35`}`, color: won ? NEON : RED }}>
                      {matches}/{picks} x{multiplier}
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
                <input type="number" value={bet} onChange={e => setBet(clampBet(Number(e.target.value) || 1))} disabled={playing}
                  className="w-full px-5 py-4 rounded-2xl text-2xl font-black text-center focus:outline-none disabled:opacity-40 transition-all"
                  style={{ background: 'rgba(0,255,102,0.06)', border: `1.5px solid ${NEON}35`, color: NEON, fontFamily: "'Orbitron', monospace" }} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[['1/2', () => setBet(clampBet(Math.floor(bet / 2)))], ['2x', () => setBet(clampBet(bet * 2))], ['10', () => setBet(clampBet(10))], ['Max', () => setBet(clampBet(credits))]].map(([label, fn]) => (
                  <button key={label} onClick={fn} disabled={playing}
                    className="py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Selected: <span style={{ color: NEON }}>{selected.length}</span> / 10
              </p>
            </div>

            {!isAuthenticated ? (
              <button onClick={navigateToLogin}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all active:scale-95"
                style={{ background: `linear-gradient(135deg, ${NEON}18 0%, rgba(0,150,60,0.1) 100%)`, border: `1.5px solid ${NEON}45`, color: NEON, boxShadow: `0 4px 24px ${NEON}18` }}>
                <Lock className="w-4 h-4 inline mr-2" /> Sign in to play
              </button>
            ) : (
              <button onClick={play} disabled={playing || selected.length === 0 || bet > credits}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${NEON}18 0%, rgba(0,150,60,0.1) 100%)`, border: `1.5px solid ${NEON}45`, color: NEON, boxShadow: `0 4px 24px ${NEON}18` }}>
                <Zap className="w-4 h-4 inline mr-2" />
                {playing ? 'Drawing...' : 'DRAW'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
