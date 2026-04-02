import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, Circle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import WinPopup from '../components/WinPopup';
import { saveRound } from '../lib/saveRound';

const NEON = '#00e701';
const RED = '#FF4444';
const GOLD = '#FFD700';
const SILVER = '#C0C0C0';
const PAYOUT = 1.98;

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

export default function Coinflip() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [bet, setBet] = useState(10);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null); // 'heads' | 'tails'
  const [choice, setChoice] = useState(null);
  const [won, setWon] = useState(null);
  const [flipAngle, setFlipAngle] = useState(0);
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);

  const clampBet = (v) => Math.max(1, Math.min(Math.floor(credits), v));

  const flip = async (side) => {
    if (bet <= 0 || bet > credits || flipping) return;
    setCredits(c => c - bet);
    addXp(bet);
    setFlipping(true);
    setResult(null);
    setWon(null);
    setChoice(side);

    // Animate
    const totalSpins = 8 + Math.floor(Math.random() * 4);
    for (let i = 0; i < totalSpins; i++) {
      await new Promise(r => setTimeout(r, 60 + i * 10));
      setFlipAngle(prev => prev + 180);
    }

    const outcome = Math.random() < 0.5 ? 'heads' : 'tails';
    // Ensure final angle matches outcome
    const finalAngle = outcome === 'heads' ? 0 : 180;
    setFlipAngle(finalAngle);
    setResult(outcome);

    const didWin = side === outcome;
    setWon(didWin);

    if (didWin) {
      const payout = bet * PAYOUT;
      setCredits(c => c + payout);
      playSound(1200, 220);
      setWinPopup({ amount: (payout - bet).toFixed(2), ts: Date.now() });
    } else {
      playSound(280, 350);
    }

    saveRound({ game: 'Coinflip', bet, result: `${side} -> ${outcome}`, profit: didWin ? bet * (PAYOUT - 1) : -bet });
    setHistory(h => [{ outcome, choice: side, won: didWin, ts: Date.now() }, ...h.slice(0, 11)]);
    setFlipping(false);
  };

  const coinFace = flipping ? null : result;
  const coinColor = coinFace === 'heads' ? GOLD : coinFace === 'tails' ? SILVER : 'rgba(255,255,255,0.15)';

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 fade-up"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,102,0.06) 0%, transparent 60%), linear-gradient(180deg, #0c0f18 0%, #080a10 100%)' }}>
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: `${NEON}12`, border: `1px solid ${NEON}30` }}>
          <Circle className="w-3.5 h-3.5" style={{ color: NEON }} />
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: NEON }}>Casino</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black font-orbitron tracking-tight"
          style={{ color: '#fff', textShadow: `0 0 80px ${NEON}44` }}>COINFLIP</h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Heads or Tails. Win <span style={{ color: NEON }}>{PAYOUT}x</span> your bet.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            {/* Coin Display */}
            <div className="relative rounded-3xl overflow-hidden flex flex-col items-center justify-center py-14"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: `1px solid ${result !== null ? (won ? `${NEON}40` : `${RED}40`) : 'rgba(255,255,255,0.08)'}`, minHeight: 300, transition: 'all 0.4s ease' }}>

              {/* Coin */}
              <div className="relative" style={{ perspective: '600px' }}>
                <div style={{
                  width: 160, height: 160, borderRadius: '50%',
                  transform: `rotateY(${flipAngle}deg)`,
                  transition: flipping ? 'transform 0.15s linear' : 'transform 0.5s ease-out',
                  transformStyle: 'preserve-3d',
                }}>
                  {/* Heads face */}
                  <div className="absolute inset-0 rounded-full flex items-center justify-center font-black font-orbitron text-3xl"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${GOLD}, #B8860B)`,
                      backfaceVisibility: 'hidden',
                      color: '#111',
                      boxShadow: `0 0 40px ${GOLD}40`,
                      border: `3px solid ${GOLD}80`,
                    }}>
                    H
                  </div>
                  {/* Tails face */}
                  <div className="absolute inset-0 rounded-full flex items-center justify-center font-black font-orbitron text-3xl"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${SILVER}, #808080)`,
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      color: '#111',
                      boxShadow: `0 0 40px ${SILVER}40`,
                      border: `3px solid ${SILVER}80`,
                    }}>
                    T
                  </div>
                </div>
              </div>

              {result !== null && !flipping && (
                <div className="mt-6 px-5 py-1.5 rounded-full font-bold text-sm tracking-widest uppercase"
                  style={{
                    background: won ? `${NEON}18` : `${RED}18`,
                    border: `1px solid ${won ? `${NEON}40` : `${RED}40`}`,
                    color: won ? NEON : RED,
                  }}>
                  {won ? 'WIN' : 'LOSS'} - {result.toUpperCase()}
                </div>
              )}

              {flipping && (
                <p className="mt-4 text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Flipping...</p>
              )}

              {!result && !flipping && (
                <div className="flex flex-col items-center gap-2 mt-4">
                  <p className="text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Pick a side</p>
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Last flips</p>
                <div className="flex flex-wrap gap-2">
                  {history.map(({ outcome, won: w, ts }) => (
                    <div key={ts}
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-orbitron transition-all"
                      style={{ background: w ? `${NEON}15` : `${RED}15`, border: `1px solid ${w ? `${NEON}35` : `${RED}35`}`, color: w ? NEON : RED }}>
                      {outcome === 'heads' ? 'H' : 'T'}
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
                <input type="number" value={bet} onChange={e => setBet(clampBet(Number(e.target.value) || 1))} disabled={flipping}
                  className="w-full px-5 py-4 rounded-2xl text-2xl font-black text-center focus:outline-none disabled:opacity-40 transition-all"
                  style={{ background: 'rgba(0,255,102,0.06)', border: `1.5px solid ${NEON}35`, color: NEON, fontFamily: "'Orbitron', monospace" }} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[['1/2', () => setBet(clampBet(Math.floor(bet / 2)))], ['2x', () => setBet(clampBet(bet * 2))], ['10', () => setBet(clampBet(10))], ['Max', () => setBet(clampBet(credits))]].map(([label, fn]) => (
                  <button key={label} onClick={fn} disabled={flipping}
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
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => flip('heads')} disabled={flipping || bet > credits}
                  className="relative py-8 rounded-2xl font-black text-base tracking-wider font-orbitron overflow-hidden transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${GOLD}18 0%, ${GOLD}08 100%)`, border: `1.5px solid ${GOLD}45`, color: GOLD, boxShadow: `0 4px 24px ${GOLD}18` }}>
                  <div className="relative">
                    <div className="text-2xl mb-1">H</div>
                    <div>HEADS</div>
                  </div>
                </button>

                <button onClick={() => flip('tails')} disabled={flipping || bet > credits}
                  className="relative py-8 rounded-2xl font-black text-base tracking-wider font-orbitron overflow-hidden transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                  style={{ background: `linear-gradient(135deg, ${SILVER}18 0%, ${SILVER}08 100%)`, border: `1.5px solid ${SILVER}45`, color: SILVER, boxShadow: `0 4px 24px ${SILVER}18` }}>
                  <div className="relative">
                    <div className="text-2xl mb-1">T</div>
                    <div>TAILS</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
