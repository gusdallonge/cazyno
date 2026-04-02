import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import WinPopup from '../components/WinPopup';
import { saveRound } from '../lib/saveRound';

const NEON = '#00e701';
const RED = '#FF4444';

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

export default function Dice() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const savedBet = (() => { try { return JSON.parse(sessionStorage.getItem('dice_bet')); } catch { return null; } })();
  const [bet, setBet] = useState(savedBet ?? 10);
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [choice, setChoice] = useState(null);
  const [won, setWon] = useState(null);
  const [displayNum, setDisplayNum] = useState(null);
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);

  useEffect(() => { sessionStorage.setItem('dice_bet', JSON.stringify(bet)); }, [bet]);

  const clampBet = (v) => Math.max(1, Math.min(Math.floor(credits), v));

  const roll = async (picked) => {
    if (bet <= 0 || bet > credits || rolling) return;
    setCredits(c => c - bet);
    addXp(bet);
    setRolling(true);
    setResult(null);
    setWon(null);
    setChoice(picked);

    for (let i = 0; i < 16; i++) {
      await new Promise(r => setTimeout(r, 55));
      setDisplayNum(Math.floor(Math.random() * 100) + 1);
    }

    const num = Math.floor(Math.random() * 100) + 1;
    setDisplayNum(num);
    setResult(num);

    const didWin = (picked === 'over' && num > 50) || (picked === 'under' && num < 50);
    setWon(didWin);

    if (didWin) {
      setCredits(c => c + bet * 2);
      playSound(1200, 220);
      setWinPopup({ amount: bet.toFixed(2), ts: Date.now() });
    } else {
      playSound(280, 350);
    }

    saveRound({ game: 'Dice', bet, result: `${picked} — ${num}`, profit: didWin ? bet : -bet });
    setHistory(h => [{ num, choice: picked, won: didWin, ts: Date.now() }, ...h.slice(0, 11)]);
    setRolling(false);
  };

  const numColor = result === null ? 'rgba(255,255,255,0.15)' : won ? NEON : RED;
  const numGlow = result === null ? 'none' : won ? `0 0 60px ${NEON}99` : `0 0 60px ${RED}99`;
  const borderColor = result !== null && won ? `${NEON}40` : result !== null ? `${RED}40` : 'rgba(255,255,255,0.08)';
  const cardShadow = result !== null ? (won ? `0 0 40px ${NEON}18, inset 0 0 60px ${NEON}06` : `0 0 40px ${RED}18, inset 0 0 60px ${RED}06`) : 'none';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-10 fade-up"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,102,0.06) 0%, transparent 60%), linear-gradient(180deg, #0c0f18 0%, #080a10 100%)' }}
    >
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: `${NEON}12`, border: `1px solid ${NEON}30` }}>
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: NEON }}>Casino</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black font-orbitron tracking-tight"
          style={{ color: '#fff', textShadow: `0 0 80px ${NEON}44` }}>
          DICE
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Guess higher or lower than <span style={{ color: NEON }}>50</span>. Win <span style={{ color: NEON }}>2x</span> your bet.
        </p>
      </div>

      {/* Main layout */}
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left: Number display + history */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Number Display */}
            <div
              className="relative rounded-3xl overflow-hidden flex flex-col items-center justify-center py-14"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: `1px solid ${borderColor}`,
                boxShadow: cardShadow,
                transition: 'all 0.4s ease',
                minHeight: 300,
              }}
            >
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 opacity-20"
                  style={{ background: `linear-gradient(180deg, ${NEON}, transparent)` }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-8 opacity-20"
                  style={{ background: `linear-gradient(0deg, ${NEON}, transparent)` }} />
              </div>

              {displayNum !== null ? (
                <>
                  <div
                    className="text-[6rem] md:text-[8rem] font-black font-orbitron leading-none tabular-nums"
                    style={{ color: numColor, textShadow: numGlow, transition: 'color 0.3s, text-shadow 0.3s' }}
                  >
                    {String(displayNum).padStart(2, '0')}
                  </div>
                  {result !== null && !rolling && (
                    <div
                      className="mt-4 px-5 py-1.5 rounded-full font-bold text-sm tracking-widest uppercase"
                      style={{
                        background: won ? `${NEON}18` : `${RED}18`,
                        border: `1px solid ${won ? `${NEON}40` : `${RED}40`}`,
                        color: won ? NEON : RED,
                        animation: 'fadeUp 0.3s ease-out',
                      }}
                    >
                      {won ? '✦ WIN' : '✗ LOSS'}
                    </div>
                  )}
                  {rolling && (
                    <p className="mt-3 text-xs tracking-[0.3em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>Rolling…</p>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-7xl font-black font-orbitron" style={{ color: 'rgba(255,255,255,0.08)' }}>—</div>
                  <p className="text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Place a bet</p>
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-3xl p-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Last rolls</p>
                <div className="flex flex-wrap gap-2">
                  {history.map(({ num, won: w, ts }) => (
                    <div key={ts}
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm font-orbitron transition-all hover:scale-110"
                      style={{
                        background: w ? `${NEON}15` : `${RED}15`,
                        border: `1px solid ${w ? `${NEON}35` : `${RED}35`}`,
                        color: w ? NEON : RED,
                      }}>
                      {num}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            {/* Bet Controls */}
            <div className="rounded-3xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Bet amount</span>
                <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Balance: <span style={{ color: NEON }}>{credits.toFixed(2)} €</span>
                </span>
              </div>

              <div className="relative mb-3">
                <input
                  type="number"
                  value={bet}
                  onChange={e => setBet(clampBet(Number(e.target.value) || 1))}
                  disabled={rolling}
                  className="w-full px-5 py-4 rounded-2xl text-2xl font-black text-center focus:outline-none disabled:opacity-40 transition-all"
                  style={{
                    background: 'rgba(0,255,102,0.06)',
                    border: `1.5px solid ${NEON}35`,
                    color: NEON,
                    fontFamily: "'Orbitron', monospace",
                    letterSpacing: '0.05em',
                  }}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: `${NEON}60` }}>€</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[['½', () => setBet(clampBet(Math.floor(bet / 2)))], ['2×', () => setBet(clampBet(bet * 2))], ['10', () => setBet(clampBet(10))], ['Max', () => setBet(clampBet(credits))]].map(([label, fn]) => (
                  <button key={label} onClick={fn} disabled={rolling}
                    className="py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Buttons */}
            {!isAuthenticated ? (
              <button
                onClick={navigateToLogin}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, rgba(0,255,102,0.18) 0%, rgba(0,150,60,0.1) 100%)', border: '1.5px solid rgba(0,255,102,0.45)', color: '#00e701', boxShadow: '0 4px 24px rgba(0,255,102,0.18)' }}
              >
                <Lock className="w-4 h-4 inline mr-2" /> Se connecter pour jouer
              </button>
            ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => roll('under')}
                disabled={rolling || bet > credits}
                className="relative py-8 rounded-2xl font-black text-base tracking-wider font-orbitron overflow-hidden transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,68,68,0.18) 0%, rgba(180,0,0,0.1) 100%)',
                  border: `1.5px solid ${RED}45`,
                  color: RED,
                  boxShadow: `0 4px 24px ${RED}18`,
                }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
                <div className="relative">
                  <div className="text-2xl mb-1">↓</div>
                  <div>UNDER 50</div>
                </div>
              </button>

              <button
                onClick={() => roll('over')}
                disabled={rolling || bet > credits}
                className="relative py-8 rounded-2xl font-black text-base tracking-wider font-orbitron overflow-hidden transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${NEON}18 0%, rgba(0,150,60,0.1) 100%)`,
                  border: `1.5px solid ${NEON}45`,
                  color: NEON,
                  boxShadow: `0 4px 24px ${NEON}18`,
                }}
              >
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
                <div className="relative">
                  <div className="text-2xl mb-1">↑</div>
                  <div>OVER 50</div>
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