import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, Trophy, Bird, Dog, Car, CheckCircle, HelpCircle, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import WinPopup from '../components/WinPopup';
import { useLang, t } from '../lib/i18n';
import { saveRound } from '../lib/saveRound';
import { playChickenStep, playChickenDead } from '../lib/soundEffects';

const NEON = '#00e701';
const COLS = 4;

const DIFFICULTY = {
  easy:   { cars: 1, label: 'Facile', color: '#00e701' },
  medium: { cars: 2, label: 'Moyen', color: '#FFD700' },
  hard:   { cars: 3, label: 'Hard', color: '#FF4444' },
};

const MULTIPLIERS = {
  easy:   [1.15, 1.25, 1.40, 1.60, 2.00, 3.00, 5.00, 8.00],
  medium: [1.30, 1.60, 2.00, 2.80, 4.00, 7.00, 15.00, 40.00],
  hard:   [2.00, 3.00, 6.00, 12.00, 30.00, 80.00, 250.00, 1000.00],
};

function generateRow(difficulty, step) {
  const numCars = DIFFICULTY[difficulty].cars + (step > 10 ? 1 : 0);
  const safe = Math.min(numCars, COLS - 1);
  const cars = new Set();
  while (cars.size < safe) cars.add(Math.floor(Math.random() * COLS));
  return Array.from({ length: COLS }, (_, i) => cars.has(i) ? 'car' : 'safe');
}

function MultBadge({ value, isPassed, isActive }) {
  if (isPassed) return (
    <div className="w-14 shrink-0 flex justify-end">
      <span className="text-xs font-black px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(0,255,102,0.15)', color: NEON }}>
        ✓ {value}x
      </span>
    </div>
  );
  if (isActive) return (
    <div className="w-14 shrink-0 flex justify-end">
      <span className="text-xs font-black px-1.5 py-0.5 rounded-md animate-pulse" style={{ background: 'rgba(255,215,0,0.2)', color: '#FFD700', border: '1px solid rgba(255,215,0,0.4)' }}>
        {value}x
      </span>
    </div>
  );
  return (
    <div className="w-14 shrink-0 flex justify-end">
      <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.2)' }}>{value}x</span>
    </div>
  );
}

export default function ChickenDrop() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const lang = useLang();

  const savedBet = (() => { try { return JSON.parse(sessionStorage.getItem('chicken_bet')); } catch { return null; } })();
  const [bet, setBet] = useState(savedBet ?? '');
  const [difficulty, setDifficulty] = useState('medium');
  const [gameState, setGameState] = useState('idle');
  const [rows, setRows] = useState([]);
  const [chickenRow, setChickenRow] = useState(-1);
  const [chickenCol, setChickenCol] = useState(1);
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState([]);
  const [history, setHistory] = useState([3.50, 1.15, 2.50, 1.75, 5.50, 8.00, 1.03]);
  const [winPopup, setWinPopup] = useState(null);
  const [deadCol, setDeadCol] = useState(null);
  const [deadRow, setDeadRow] = useState(null);
  const [flashGreen, setFlashGreen] = useState(false);

  useEffect(() => { sessionStorage.setItem('chicken_bet', JSON.stringify(bet)); }, [bet]);

  const NUM_ROWS = 8;
  const mults = MULTIPLIERS[difficulty];
  const multiplier = step > 0 ? mults[Math.min(step - 1, mults.length - 1)] : 1;
  const potentialWin = parseFloat((bet * multiplier).toFixed(2));
  const canBet = gameState === 'idle' || gameState === 'dead' || gameState === 'won';

  const startGame = () => {
    if (bet > credits || bet < 1) return;
    setCredits(c => c - bet);
    addXp(bet);
    const newRows = Array.from({ length: NUM_ROWS }, (_, i) => generateRow(difficulty, i));
    setRows(newRows);
    setStep(0);
    setChickenRow(NUM_ROWS);
    setChickenCol(Math.floor(COLS / 2));
    setRevealed([]);
    setDeadCol(null);
    setDeadRow(null);
    setGameState('playing');
  };

  const clickCell = (rowIdx, colIdx) => {
    if (gameState !== 'playing') return;
    const targetRow = NUM_ROWS - 1 - step;
    if (rowIdx !== targetRow) return;

    const cell = rows[rowIdx][colIdx];
    setRevealed(r => [...r, { row: rowIdx, col: colIdx }]);
    setChickenCol(colIdx);
    setChickenRow(rowIdx);

    if (cell === 'car') {
      playChickenDead();
      setDeadCol(colIdx);
      setDeadRow(rowIdx);
      setGameState('dead');
      saveRound({ game: 'ChickenDrop', bet, result: `Mort ×${multiplier.toFixed(2)}`, profit: -bet });
      setHistory(h => [parseFloat(multiplier.toFixed(2)), ...h.slice(0, 19)]);
    } else {
      playChickenStep();
      const newStep = step + 1;
      setStep(newStep);
      if (newStep >= NUM_ROWS) doWin(newStep);
    }
  };

  const doWin = (s) => {
    const m = mults[Math.min((s || step) - 1, mults.length - 1)];
    const win = parseFloat((bet * m).toFixed(2));
    setCredits(c => c + win);
    setGameState('won');
    setFlashGreen(true);
    setTimeout(() => setFlashGreen(false), 700);
    saveRound({ game: 'ChickenDrop', bet, result: `Cash Out ×${m.toFixed(2)}`, profit: parseFloat((win - bet).toFixed(2)) });
    setHistory(h => [parseFloat(m.toFixed(2)), ...h.slice(0, 19)]);
    if (win > bet) setWinPopup({ amount: (win - bet).toFixed(2), ts: Date.now() });
  };

  const cashOut = () => {
    if (gameState !== 'playing' || step === 0) return;
    doWin(step);
  };

  const isRevealed = (rowIdx, colIdx) => revealed.some(r => r.row === rowIdx && r.col === colIdx);

  return (
    <div className="fade-up max-w-5xl mx-auto px-2 py-4" style={{ fontFamily: "'Inter', monospace", background: 'transparent' }}>
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      {flashGreen && (
        <div className="fixed inset-0 pointer-events-none z-50 rounded-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,255,102,0.25) 0%, transparent 70%)', animation: 'flashFade 0.7s ease-out forwards' }} />
      )}

      <style>{`
        @keyframes chickenLand { 0% { transform: translateY(-12px) scale(1.2); } 60% { transform: translateY(3px) scale(0.9); } 100% { transform: translateY(0) scale(1); } }
        @keyframes deadPulse { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
        @keyframes flashFade { 0% { opacity:1; } 100% { opacity:0; } }
        @keyframes cellPop { 0% { transform: scale(0.75); opacity:0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity:1; } }
        @keyframes activeGlow { 0%,100% { box-shadow: 0 0 10px rgba(255,215,0,0.2), inset 0 0 8px rgba(255,215,0,0.05); } 50% { box-shadow: 0 0 18px rgba(255,215,0,0.4), inset 0 0 14px rgba(255,215,0,0.1); } }
        @keyframes roadScroll { 0% { background-position: 0 0; } 100% { background-position: 0 40px; } }
        @keyframes chickenIdle { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes wolfEating { 0% { transform: translateX(-100px) scaleX(-1); opacity: 0; } 20% { opacity: 1; } 60% { transform: translateX(10px) scaleX(-1); } 100% { transform: translateX(80px) scaleX(-1); opacity: 0; } }
        @keyframes chickenScatter { 0% { opacity: 1; transform: scale(1) translateY(0); } 50% { opacity: 1; transform: scale(0.7) translateY(-30px); } 100% { opacity: 0; transform: scale(0.2) translateY(-60px); } }
        .active-cell:hover { transform: scale(1.04); }
      `}</style>

      <div className="text-center mb-6">
        <h1 className="font-orbitron text-4xl font-black flex items-center justify-center gap-3" style={{ color: NEON, textShadow: `0 0 20px ${NEON}99` }}><Bird className="w-8 h-8" /> CHICKEN DROP <Dog className="w-8 h-8" /></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── CONTROLS ── */}
        <div className="space-y-3 order-first lg:order-last">

          {/* Bet panel */}
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>

            <div>
              <p className="text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{t(lang, 'dice_bet_label')}</p>
              <div className="relative">
                <input
                   type="number" value={bet || ''} min={0}
                   disabled={!canBet}
                   placeholder="0"
                   onChange={e => setBet(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full rounded-xl px-4 py-3 text-xl font-black text-center focus:outline-none disabled:opacity-40 transition-all"
                  style={{ background: 'rgba(0,255,102,0.06)', border: '1.5px solid rgba(0,255,102,0.35)', color: NEON, fontFamily: 'monospace', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)' }}
                />
              </div>
              <div className="grid grid-cols-3 gap-1 mt-2">
                {[[t(lang, 'dice_half'), () => setBet(Math.max(1, Math.floor(bet / 2)))], [t(lang, 'dice_double'), () => setBet(Math.min(credits, Math.floor(bet * 2)))], [t(lang, 'dice_max'), () => setBet(credits)]].map(([label, fn]) => (
                  <button key={label} disabled={!canBet} onClick={fn}
                    className="text-xs py-1.5 rounded-lg font-bold disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-xs font-bold mb-2 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Difficulté</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(DIFFICULTY).map(([key, d]) => (
                  <button key={key} disabled={!canBet} onClick={() => setDifficulty(key)}
                    className="py-3 rounded-xl font-bold disabled:opacity-30 transition-all text-sm"
                    style={{
                      background: difficulty === key ? `${d.color}18` : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${difficulty === key ? `${d.color}55` : 'rgba(255,255,255,0.07)'}`,
                      color: difficulty === key ? d.color : 'rgba(255,255,255,0.4)',
                      boxShadow: difficulty === key ? `0 0 12px ${d.color}22` : 'none',
                    }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {!isAuthenticated ? (
            <button onClick={navigateToLogin}
              className="w-full py-4 rounded-2xl font-black text-base tracking-widest transition-all hover:scale-[1.02] active:scale-95 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #00e701 0%, #00CC55 100%)', color: '#000', boxShadow: '0 0 24px rgba(0,255,102,0.45)' }}>
              <Lock className="w-4 h-4 inline mr-2" /> Se connecter pour jouer
            </button>
          ) : canBet && (
            <button onClick={startGame} disabled={bet > credits}
              className="w-full py-4 rounded-2xl font-black text-base tracking-widest disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #00e701 0%, #00CC55 100%)', color: '#000', boxShadow: '0 0 24px rgba(0,255,102,0.45), 0 4px 16px rgba(0,0,0,0.4)' }}>
              <span className="relative z-10">ALLEZ !</span>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
            </button>
          )}

          {gameState === 'playing' && (
            <>
              <button onClick={cashOut} disabled={step === 0}
                className="w-full py-4 rounded-2xl font-black text-base tracking-widest disabled:opacity-30 transition-all hover:scale-[1.02] active:scale-95 relative overflow-hidden"
                style={{
                  background: step > 0 ? 'linear-gradient(135deg, #FFD700 0%, #FF9900 100%)' : 'rgba(255,255,255,0.04)',
                  color: step > 0 ? '#000' : 'rgba(255,255,255,0.2)',
                  boxShadow: step > 0 ? '0 0 24px rgba(255,215,0,0.45), 0 4px 16px rgba(0,0,0,0.4)' : 'none',
                  border: step > 0 ? 'none' : '1px solid rgba(255,255,255,0.08)',
                }}>
                {step > 0 && <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />}
                <span className="relative z-10">RETRAIT {step > 0 ? `${multiplier.toFixed(2)}x` : ''}</span>
              </button>

              {/* Live stats */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: 'linear-gradient(135deg, rgba(0,255,102,0.07) 0%, rgba(0,255,102,0.02) 100%)', border: '1px solid rgba(0,255,102,0.15)' }}>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Multiplicateur</span>
                  <span className="font-black text-2xl" style={{ color: NEON, textShadow: `0 0 16px ${NEON}` }}>{multiplier.toFixed(2)}x</span>
                </div>
                <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,102,0.2), transparent)' }} />
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Gain potentiel</span>
                  <span className="font-black text-lg" style={{ color: NEON }}>{potentialWin.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Progression</span>
                  <span className="font-bold text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{step}/{NUM_ROWS} étapes</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${(step / NUM_ROWS) * 100}%`, background: `linear-gradient(90deg, ${NEON}, #00CC55)`, boxShadow: `0 0 8px ${NEON}` }} />
                </div>
              </div>
            </>
          )}

          {/* Balance card */}
          <div className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Solde</p>
              <p className="font-black text-xl mt-0.5" style={{ color: NEON }}>{credits.toFixed(2)} €</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'rgba(0,255,102,0.08)', border: '1px solid rgba(0,255,102,0.15)' }}>
              <CreditCard className="w-5 h-5 text-[#00e701]" />
            </div>
          </div>

          {gameState === 'playing' && (
            <div className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.1)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,215,0,0.6)' }}>
                <AlertTriangle className="w-3 h-3 inline mr-1" /> Clique sur une case pour avancer.<br />
                Evite les obstacles ou perds tout !
              </p>
            </div>
          )}

          {history.length > 0 && (
            <div className="rounded-2xl p-4"
              style={{ background: 'linear-gradient(135deg, rgba(0,255,102,0.05), rgba(0,255,102,0.01))', border: '1px solid rgba(0,255,102,0.1)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Historique</p>
              <div className="space-y-1.5">
                {history.slice(0, 8).map((h, i) => (
                  <div key={i} className="flex justify-between rounded-lg px-2.5 py-1.5 text-xs"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="font-orbitron font-bold" style={{ color: h >= 5 ? NEON : h >= 2 ? '#7fff9e' : h < 1.3 ? '#ff8888' : '#999' }}>×{h.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── GAME BOARD ── */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden relative order-last lg:order-first"
          style={{ background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d0d 100%)', border: '1px solid rgba(0,255,102,0.12)', minHeight: 500, boxShadow: '0 0 40px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.4)' }}>

          {/* Road lane dividers */}
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.035 }}>
            {[1,2,3].map(i => (
              <div key={i} className="absolute top-0 bottom-0" style={{ left: `${(i/4)*100}%`, width: 1, background: 'linear-gradient(180deg, transparent, #fff 20%, #fff 80%, transparent)' }} />
            ))}
            {[1,2,3].map(i => (
              <div key={`d${i}`} className="absolute top-0 bottom-0" style={{ left: `calc(${(i/4)*100}% - 1px)`, width: 2, backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 12px, transparent 12px, transparent 24px)', backgroundSize: '100% 24px', animation: 'roadScroll 0.6s linear infinite' }} />
            ))}
          </div>

          {/* Overlays */}
          {gameState === 'dead' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)', animation: 'popIn 0.25s ease-out' }}>
              <div className="relative w-full h-56 flex items-center justify-center mb-2">
                <div className="absolute" style={{ animation: 'wolfEating 1.4s ease-in-out forwards' }}><Dog className="w-16 h-16 text-red-400" /></div>
                <div className="absolute" style={{ animation: 'chickenScatter 1s ease-out forwards' }}><Bird className="w-10 h-10 text-yellow-400" /></div>
              </div>
              <p className="font-black text-3xl mb-1" style={{ color: '#FF4444', textShadow: '0 0 30px rgba(255,68,68,0.6)' }}>MANGÉ !</p>
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Multiplicateur final : <span style={{ color: '#FF6666' }}>{multiplier.toFixed(2)}x</span></p>
              <div className="w-40 h-px mx-auto mb-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,68,68,0.4), transparent)' }} />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Place une nouvelle mise pour rejouer</p>
            </div>
          )}

          {gameState === 'won' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(4px)', animation: 'popIn 0.25s ease-out' }}>
              <div className="text-center">
                <div className="flex justify-center mb-3"><Trophy className="w-16 h-16 text-yellow-400" /></div>
                <p className="font-black text-3xl mb-1" style={{ color: NEON, textShadow: `0 0 30px ${NEON}` }}>CHAMPION !</p>
                <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  +<span style={{ color: NEON, fontWeight: 900 }}>{(bet * multiplier - bet).toFixed(2)} €</span> de profit
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Multiplicateur : {multiplier.toFixed(2)}x</p>
              </div>
            </div>
          )}

          {gameState === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="mb-4" style={{ animation: 'chickenIdle 1.5s ease-in-out infinite', display: 'inline-block' }}><Bird className="w-16 h-16 text-yellow-400" /></div>
                <p className="font-bold text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>Configure ta mise et appuie sur</p>
                <p className="font-black text-lg mt-1" style={{ color: NEON }}>ALLEZ !</p>
              </div>
            </div>
          )}

          {/* Grid */}
          {gameState !== 'idle' && (
            <div className="p-4 space-y-2">
              {Array.from({ length: NUM_ROWS }, (_, displayIdx) => {
                const rowIdx = NUM_ROWS - 1 - displayIdx;
                const isActive = rowIdx === NUM_ROWS - 1 - step && gameState === 'playing';
                const isPassed = rowIdx > NUM_ROWS - 1 - step;
                const multForRow = mults[NUM_ROWS - 1 - rowIdx] || 1;

                return (
                  <div key={rowIdx} className="flex gap-2 items-center">
                    <MultBadge value={multForRow.toFixed(2)} isPassed={isPassed} isActive={isActive} />

                    {Array.from({ length: COLS }, (_, colIdx) => {
                      const rev = isRevealed(rowIdx, colIdx);
                      const isCar = rows[rowIdx]?.[colIdx] === 'car';
                      const isChickenHere = chickenRow === rowIdx && chickenCol === colIdx;
                      const isDead = deadRow === rowIdx && deadCol === colIdx;
                      const showContent = rev || gameState === 'dead' || gameState === 'won';

                      let bg, border, shadow;
                      if (isDead) {
                        bg = 'linear-gradient(135deg, rgba(255,68,68,0.3), rgba(200,0,0,0.2))';
                        border = '1px solid rgba(255,68,68,0.7)';
                        shadow = '0 0 20px rgba(255,68,68,0.3)';
                      } else if (rev && !isCar) {
                        bg = 'linear-gradient(135deg, rgba(0,255,102,0.18), rgba(0,180,60,0.1))';
                        border = '1px solid rgba(0,255,102,0.5)';
                        shadow = '0 0 12px rgba(0,255,102,0.2)';
                      } else if (isActive) {
                        bg = 'linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,180,0,0.04))';
                        border = '1px solid rgba(255,215,0,0.35)';
                        shadow = 'none';
                      } else if (isPassed) {
                        bg = 'rgba(0,255,102,0.04)';
                        border = '1px solid rgba(0,255,102,0.08)';
                        shadow = 'none';
                      } else {
                        bg = 'rgba(255,255,255,0.03)';
                        border = '1px solid rgba(255,255,255,0.06)';
                        shadow = 'none';
                      }

                      return (
                        <button
                          key={colIdx}
                          onClick={() => clickCell(rowIdx, colIdx)}
                          disabled={!isActive}
                          className={`flex-1 rounded-xl flex items-center justify-center font-black transition-all duration-100 relative overflow-hidden ${isActive ? 'active-cell' : ''}`}
                          style={{
                            height: 52,
                            background: bg,
                            border,
                            boxShadow: isActive ? (shadow || '0 0 0px rgba(255,215,0,0)') : shadow,
                            animation: isActive ? 'activeGlow 2s ease-in-out infinite' : 'none',
                            cursor: isActive ? 'pointer' : 'default',
                          }}>

                          {isActive && (
                            <div className="absolute inset-0 rounded-xl pointer-events-none"
                              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%)' }} />
                          )}

                          {isChickenHere && (gameState === 'playing' || gameState === 'won') && (
                            <Bird className="w-6 h-6 text-yellow-400" style={{ animation: 'chickenLand 0.3s ease-out', zIndex: 1 }} />
                          )}
                          {isDead && (
                            <Dog className="w-6 h-6 text-red-400" style={{ animation: 'deadPulse 0.4s ease-out', zIndex: 1 }} />
                          )}
                          {showContent && !isChickenHere && !isDead && (
                            <span style={{ animation: 'cellPop 0.25s ease-out', display: 'block', zIndex: 1 }}>
                              {isCar ? <Car className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
                            </span>
                          )}
                          {isActive && !showContent && (
                            <div className="flex flex-col items-center gap-0.5">
                              <HelpCircle className="w-5 h-5" style={{ opacity: 0.5, color: 'rgba(255,255,255,0.3)' }} />
                            </div>
                          )}
                          {!isActive && !isPassed && !showContent && (
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {/* Chicken start zone */}
              <div className="flex gap-2 items-center mt-1">
                <div className="w-14 shrink-0" />
                {Array.from({ length: COLS }, (_, i) => (
                  <div key={i} className="flex-1 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                    {chickenRow === NUM_ROWS && i === chickenCol && gameState === 'playing' && step === 0 && (
                      <Bird className="w-5 h-5 text-yellow-400" />
                    )}
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