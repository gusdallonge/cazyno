import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Gem, Bomb, Lock } from 'lucide-react';
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

function generateMines(count) {
  const positions = new Set();
  while (positions.size < count) positions.add(Math.floor(Math.random() * 25));
  return positions;
}

export default function Mines() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const savedBet = (() => { try { return JSON.parse(sessionStorage.getItem('mines_bet')); } catch { return null; } })();
  const [bet, setBet] = useState(savedBet ?? 10);
  const [mineCount, setMineCount] = useState(3);
  const [phase, setPhase] = useState('idle'); // idle | playing | won | lost
  const [minePositions, setMinePositions] = useState(new Set());
  const [revealed, setRevealed] = useState(new Set());
  const [multiplier, setMultiplier] = useState(1);
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);

  useEffect(() => { sessionStorage.setItem('mines_bet', JSON.stringify(bet)); }, [bet]);

  const clampBet = (v) => Math.max(1, Math.min(Math.floor(credits), v));

  const calcMultiplier = (revealedCount, mines) => {
    let m = 1;
    for (let i = 0; i < revealedCount; i++) {
      m *= (25 - i) / (25 - mines - i);
    }
    return Math.floor(m * 0.98 * 100) / 100; // 2% house edge
  };

  const startGame = () => {
    if (bet <= 0 || bet > credits || phase === 'playing') return;
    setCredits(c => c - bet);
    addXp(bet);
    setMinePositions(generateMines(mineCount));
    setRevealed(new Set());
    setMultiplier(1);
    setPhase('playing');
  };

  const revealTile = (idx) => {
    if (phase !== 'playing' || revealed.has(idx)) return;

    if (minePositions.has(idx)) {
      // Hit a mine
      playSound(280, 350);
      setRevealed(new Set([...revealed, idx]));
      setPhase('lost');
      saveRound({ game: 'Mines', bet, result: `${mineCount} mines — hit at ${revealed.size + 1} reveals`, profit: -bet });
      setHistory(h => [{ mult: '0.00', won: false, ts: Date.now() }, ...h.slice(0, 11)]);
      return;
    }

    // Safe tile
    playSound(800 + revealed.size * 60, 120);
    const newRevealed = new Set([...revealed, idx]);
    setRevealed(newRevealed);
    const newMult = calcMultiplier(newRevealed.size, mineCount);
    setMultiplier(newMult);

    // Auto-win if all safe tiles revealed
    if (newRevealed.size === 25 - mineCount) {
      const profit = bet * newMult - bet;
      setCredits(c => c + bet * newMult);
      setPhase('won');
      playSound(1200, 220);
      setWinPopup({ amount: (bet * newMult).toFixed(2), ts: Date.now() });
      saveRound({ game: 'Mines', bet, result: `${mineCount} mines — ${newRevealed.size} reveals — ${newMult}x`, profit });
      setHistory(h => [{ mult: newMult.toFixed(2), won: true, ts: Date.now() }, ...h.slice(0, 11)]);
    }
  };

  const cashOut = () => {
    if (phase !== 'playing' || revealed.size === 0) return;
    const payout = bet * multiplier;
    const profit = payout - bet;
    setCredits(c => c + payout);
    setPhase('won');
    playSound(1200, 220);
    setWinPopup({ amount: payout.toFixed(2), ts: Date.now() });
    saveRound({ game: 'Mines', bet, result: `${mineCount} mines — ${revealed.size} reveals — ${multiplier}x`, profit });
    setHistory(h => [{ mult: multiplier.toFixed(2), won: true, ts: Date.now() }, ...h.slice(0, 11)]);
  };

  const resetGame = () => {
    setPhase('idle');
    setRevealed(new Set());
    setMinePositions(new Set());
    setMultiplier(1);
  };

  const showBoard = phase === 'lost' || phase === 'won';

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
          MINES
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Reveal gems, avoid mines. Cash out anytime.
        </p>
      </div>

      {/* Main layout */}
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left: Grid + history */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Multiplier display */}
            {phase === 'playing' && revealed.size > 0 && (
              <div className="text-center">
                <span className="text-3xl font-black font-orbitron" style={{ color: NEON, textShadow: `0 0 30px ${NEON}66` }}>
                  {multiplier.toFixed(2)}x
                </span>
                <span className="ml-3 text-lg font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  +{(bet * multiplier - bet).toFixed(2)} €
                </span>
              </div>
            )}

            {/* Grid */}
            <div
              className="rounded-3xl p-4 md:p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                border: `1px solid rgba(255,255,255,0.08)`,
              }}
            >
              <div className="grid grid-cols-5 gap-2 md:gap-3 max-w-[400px] mx-auto">
                {Array.from({ length: 25 }, (_, i) => {
                  const isRevealed = revealed.has(i);
                  const isMine = minePositions.has(i);
                  const showMine = showBoard && isMine;
                  const showGem = isRevealed && !isMine;

                  return (
                    <button
                      key={i}
                      onClick={() => revealTile(i)}
                      disabled={phase !== 'playing' || isRevealed}
                      className="aspect-square rounded-xl font-bold text-xl transition-all duration-200 disabled:cursor-default hover:scale-105 active:scale-95"
                      style={{
                        background: showGem
                          ? `${NEON}20`
                          : showMine
                            ? `${RED}20`
                            : phase === 'playing'
                              ? 'rgba(255,255,255,0.06)'
                              : 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${showGem ? `${NEON}50` : showMine ? `${RED}50` : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: showGem ? `0 0 20px ${NEON}30` : showMine ? `0 0 20px ${RED}30` : 'none',
                        color: showGem ? NEON : showMine ? RED : 'transparent',
                      }}
                    >
                      {showGem ? <Gem className="w-5 h-5" /> : showMine ? <Bomb className="w-5 h-5" /> : ''}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-3xl p-5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Last games</p>
                <div className="flex flex-wrap gap-2">
                  {history.map(({ mult, won: w, ts }) => (
                    <div key={ts}
                      className="px-3 h-10 rounded-xl flex items-center justify-center font-black text-sm font-orbitron transition-all hover:scale-110"
                      style={{
                        background: w ? `${NEON}15` : `${RED}15`,
                        border: `1px solid ${w ? `${NEON}35` : `${RED}35`}`,
                        color: w ? NEON : RED,
                      }}>
                      {mult}x
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
                  disabled={phase === 'playing'}
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

              <div className="grid grid-cols-4 gap-2 mb-4">
                {[['½', () => setBet(clampBet(Math.floor(bet / 2)))], ['2×', () => setBet(clampBet(bet * 2))], ['10', () => setBet(clampBet(10))], ['Max', () => setBet(clampBet(credits))]].map(([label, fn]) => (
                  <button key={label} onClick={fn} disabled={phase === 'playing'}
                    className="py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Mine count */}
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Mines</span>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="range"
                  min="1" max="24"
                  value={mineCount}
                  onChange={e => setMineCount(Number(e.target.value))}
                  disabled={phase === 'playing'}
                  className="flex-1 accent-[#00e701]"
                />
                <span className="w-10 text-center font-black font-orbitron text-lg" style={{ color: RED }}>{mineCount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {!isAuthenticated ? (
              <button
                onClick={navigateToLogin}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, rgba(0,255,102,0.18) 0%, rgba(0,150,60,0.1) 100%)', border: '1.5px solid rgba(0,255,102,0.45)', color: '#00e701', boxShadow: '0 4px 24px rgba(0,255,102,0.18)' }}
              >
                <Lock className="w-4 h-4 inline mr-2" /> Se connecter pour jouer
              </button>
            ) : phase === 'idle' || phase === 'won' || phase === 'lost' ? (
              <button
                onClick={() => { if (phase !== 'idle') resetGame(); setTimeout(startGame, phase !== 'idle' ? 50 : 0); }}
                disabled={bet > credits}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron overflow-hidden transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${NEON}18 0%, rgba(0,150,60,0.1) 100%)`,
                  border: `1.5px solid ${NEON}45`,
                  color: NEON,
                  boxShadow: `0 4px 24px ${NEON}18`,
                }}
              >
                {phase === 'lost' || phase === 'won' ? 'NEW GAME' : 'START GAME'}
              </button>
            ) : (
              <button
                onClick={cashOut}
                disabled={revealed.size === 0}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron overflow-hidden transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${NEON}25 0%, rgba(0,150,60,0.15) 100%)`,
                  border: `1.5px solid ${NEON}60`,
                  color: NEON,
                  boxShadow: `0 4px 24px ${NEON}25`,
                }}
              >
                <div>CASH OUT</div>
                <div className="text-2xl mt-1">{(bet * multiplier).toFixed(2)} €</div>
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
