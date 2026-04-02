import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, ArrowUp, Banknote } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import WinPopup from '../components/WinPopup';
import { saveRound } from '../lib/saveRound';

const NEON = '#00e701';
const RED = '#FF4444';
const MULTIPLIERS = [1.2, 1.5, 2, 3, 5, 8, 15, 30];
const COLS = 3;

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

function generateTraps() {
  return Array.from({ length: 8 }, () => Math.floor(Math.random() * COLS));
}

export default function Tower() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [bet, setBet] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [traps, setTraps] = useState([]);
  const [currentRow, setCurrentRow] = useState(0);
  const [revealed, setRevealed] = useState([]); // [{row, col, safe}]
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);

  const clampBet = (v) => Math.max(1, Math.min(Math.floor(credits), v));
  const currentMultiplier = currentRow > 0 ? MULTIPLIERS[currentRow - 1] : 1;

  const startGame = () => {
    if (bet <= 0 || bet > credits || playing) return;
    setCredits(c => c - bet);
    addXp(bet);
    setTraps(generateTraps());
    setCurrentRow(0);
    setRevealed([]);
    setGameOver(false);
    setWon(false);
    setPlaying(true);
  };

  const pickTile = (row, col) => {
    if (!playing || gameOver || row !== currentRow) return;
    const isTrap = traps[row] === col;

    if (isTrap) {
      // Reveal all traps
      const allRevealed = traps.map((t, r) => ({ row: r, col: t, safe: false }));
      setRevealed(prev => [...prev, { row, col, safe: false }, ...allRevealed.filter(x => !prev.some(p => p.row === x.row))]);
      setGameOver(true);
      setWon(false);
      setPlaying(false);
      playSound(280, 350);
      saveRound({ game: 'Tower', bet, result: `Hit trap at row ${row + 1}`, profit: -bet });
      setHistory(h => [{ row: row + 1, won: false, multiplier: 0, ts: Date.now() }, ...h.slice(0, 11)]);
    } else {
      setRevealed(prev => [...prev, { row, col, safe: true }]);
      const nextRow = row + 1;
      setCurrentRow(nextRow);
      playSound(800 + row * 100, 150);

      if (nextRow >= 8) {
        // Cleared all rows
        const payout = bet * MULTIPLIERS[7];
        setCredits(c => c + payout);
        setGameOver(true);
        setWon(true);
        setPlaying(false);
        playSound(1200, 220);
        setWinPopup({ amount: (payout - bet).toFixed(2), ts: Date.now() });
        saveRound({ game: 'Tower', bet, result: `Cleared all 8 rows x${MULTIPLIERS[7]}`, profit: payout - bet });
        setHistory(h => [{ row: 8, won: true, multiplier: MULTIPLIERS[7], ts: Date.now() }, ...h.slice(0, 11)]);
      }
    }
  };

  const cashOut = () => {
    if (!playing || currentRow === 0 || gameOver) return;
    const payout = bet * currentMultiplier;
    setCredits(c => c + payout);
    setGameOver(true);
    setWon(true);
    setPlaying(false);
    playSound(1200, 220);
    setWinPopup({ amount: (payout - bet).toFixed(2), ts: Date.now() });
    // Reveal traps
    const allRevealed = traps.map((t, r) => ({ row: r, col: t, safe: false }));
    setRevealed(prev => [...prev, ...allRevealed.filter(x => !prev.some(p => p.row === x.row && p.col === x.col))]);
    saveRound({ game: 'Tower', bet, result: `Cashed out row ${currentRow} x${currentMultiplier}`, profit: payout - bet });
    setHistory(h => [{ row: currentRow, won: true, multiplier: currentMultiplier, ts: Date.now() }, ...h.slice(0, 11)]);
  };

  const getRevealedTile = (row, col) => revealed.find(r => r.row === row && r.col === col);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 fade-up"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,102,0.06) 0%, transparent 60%), linear-gradient(180deg, #0c0f18 0%, #080a10 100%)' }}>
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: `${NEON}12`, border: `1px solid ${NEON}30` }}>
          <ArrowUp className="w-3.5 h-3.5" style={{ color: NEON }} />
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: NEON }}>Casino</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black font-orbitron tracking-tight"
          style={{ color: '#fff', textShadow: `0 0 80px ${NEON}44` }}>TOWER</h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Climb <span style={{ color: NEON }}>8</span> rows. Avoid the traps. Cash out anytime.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            {/* Tower Grid - rows from top (7) to bottom (0) */}
            <div className="rounded-3xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {[...Array(8)].map((_, ri) => {
                const row = 7 - ri; // Display top-to-bottom
                const isActive = playing && row === currentRow && !gameOver;
                return (
                  <div key={row} className="flex items-center gap-3 mb-2">
                    <div className="w-16 text-right">
                      <span className="text-xs font-bold font-orbitron" style={{ color: row < currentRow && playing ? NEON : 'rgba(255,255,255,0.3)' }}>
                        x{MULTIPLIERS[row]}
                      </span>
                    </div>
                    <div className="flex-1 flex gap-2">
                      {[...Array(COLS)].map((_, col) => {
                        const rev = getRevealedTile(row, col);
                        let bg = 'rgba(255,255,255,0.05)';
                        let border = 'rgba(255,255,255,0.08)';
                        let content = '';
                        let color = 'transparent';

                        if (rev) {
                          if (rev.safe) {
                            bg = `${NEON}20`; border = `${NEON}50`; color = NEON;
                          } else {
                            bg = `${RED}20`; border = `${RED}50`; color = RED;
                          }
                        } else if (isActive) {
                          bg = `${NEON}10`; border = `${NEON}30`;
                        }

                        return (
                          <button key={col} onClick={() => pickTile(row, col)}
                            disabled={!isActive}
                            className="flex-1 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-default"
                            style={{ background: bg, border: `1px solid ${border}`, color, boxShadow: rev && rev.safe ? `0 0 10px ${NEON}30` : rev && !rev.safe ? `0 0 10px ${RED}30` : 'none' }}>
                            {rev ? (rev.safe ? <ArrowUp className="w-5 h-5" /> : <span className="text-xl">X</span>) : isActive ? '?' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>History</p>
                <div className="flex flex-wrap gap-2">
                  {history.map(({ row, won: w, multiplier, ts }) => (
                    <div key={ts} className="px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: w ? `${NEON}15` : `${RED}15`, border: `1px solid ${w ? `${NEON}35` : `${RED}35`}`, color: w ? NEON : RED }}>
                      Row {row} {w ? `x${multiplier}` : 'TRAP'}
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

            {playing && currentRow > 0 && !gameOver && (
              <div className="rounded-3xl p-4 text-center" style={{ background: `${NEON}08`, border: `1px solid ${NEON}25` }}>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Current multiplier</p>
                <p className="text-3xl font-black font-orbitron" style={{ color: NEON }}>x{currentMultiplier}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{(bet * currentMultiplier).toFixed(2)} credits</p>
              </div>
            )}

            {!isAuthenticated ? (
              <button onClick={navigateToLogin}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all active:scale-95"
                style={{ background: `linear-gradient(135deg, ${NEON}18 0%, rgba(0,150,60,0.1) 100%)`, border: `1.5px solid ${NEON}45`, color: NEON, boxShadow: `0 4px 24px ${NEON}18` }}>
                <Lock className="w-4 h-4 inline mr-2" /> Sign in to play
              </button>
            ) : !playing || gameOver ? (
              <button onClick={startGame} disabled={bet > credits}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${NEON}18 0%, rgba(0,150,60,0.1) 100%)`, border: `1.5px solid ${NEON}45`, color: NEON, boxShadow: `0 4px 24px ${NEON}18` }}>
                {gameOver ? 'PLAY AGAIN' : 'START CLIMB'}
              </button>
            ) : (
              <button onClick={cashOut} disabled={currentRow === 0}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, rgba(255,200,0,0.18) 0%, rgba(200,150,0,0.1) 100%)', border: '1.5px solid rgba(255,200,0,0.45)', color: '#FFD700', boxShadow: '0 4px 24px rgba(255,200,0,0.18)' }}>
                <Banknote className="w-4 h-4 inline mr-2" /> CASH OUT x{currentMultiplier}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
