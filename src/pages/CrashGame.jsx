import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { saveRound } from '../lib/saveRound';
import { useAuth } from '../lib/AuthContext';
import { RotateCcw, Lock, Plane } from 'lucide-react';
import WinPopup from '../components/WinPopup';
import { playCrashSound } from '../lib/soundEffects';
import { useLang, t } from '../lib/i18n';

const NEON = '#00e701';
const BG = '#0D0D0D';

export default function CrashGame() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const lang = useLang();

  const savedBet = (() => { try { return JSON.parse(sessionStorage.getItem('crash_bet')); } catch { return null; } })();
  const [bet, setBet] = useState(savedBet ?? '');
  const [autoCashOut, setAutoCashOut] = useState('');
  const [gameState, setGameState] = useState('idle'); // idle, waiting, playing, crashed, cashed
  const [multiplier, setMultiplier] = useState(1);
  const [history, setHistory] = useState([2.34, 1.05, 7.12, 1.88, 3.50, 1.03, 5.80, 2.10]);
  const [winPopup, setWinPopup] = useState(null);
  const [cashOutMultiplier, setCashOutMultiplier] = useState(null);
  const [crashedAt, setCrashedAt] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const gameLoopRef = useRef(null);
  const pointsRef = useRef([]);
  const startTimeRef = useRef(0);
  const crashPointRef = useRef(0);
  const multiplierRef = useRef(1);
  const canvasRef = useRef(null);
  const cashedRef = useRef(false);
  const gameStateRef = useRef('idle');
  const betRef = useRef(bet);

  useEffect(() => { betRef.current = bet; }, [bet]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const pts = pointsRef.current;
    const mult = multiplierRef.current;
    const state = gameStateRef.current; // use ref to avoid stale closure

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * H;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let i = 0; i <= 6; i++) {
      const x = (i / 6) * W;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    if (pts.length < 2) { drawAxes(ctx, W, H, 2); return; }

    const maxMult = Math.max(mult * 1.3, 2);
    const maxTime = Math.max((pts[pts.length - 1]?.t || 1) * 1.2, 5);

    function toX(t) { return (t / maxTime) * (W - 50) + 30; }
    function toY(m) { return H - 25 - ((m - 1) / Math.max(maxMult - 1, 0.1)) * (H - 50); }

    // Fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    const crashed = state === 'crashed';
    grad.addColorStop(0, crashed ? 'rgba(255,68,68,0.2)' : 'rgba(0,255,102,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(1));
    pts.forEach(p => ctx.lineTo(toX(p.t), toY(p.m)));
    ctx.lineTo(toX(pts[pts.length - 1].t), H);
    ctx.lineTo(toX(0), H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.shadowColor = crashed ? '#FF4444' : NEON;
    ctx.shadowBlur = 14;
    ctx.strokeStyle = crashed ? '#FF4444' : NEON;
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    pts.forEach((p, i) => {
      if (i === 0) ctx.moveTo(toX(p.t), toY(p.m));
      else ctx.lineTo(toX(p.t), toY(p.m));
    });
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dot
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.shadowColor = crashed ? '#FF4444' : NEON;
    ctx.shadowBlur = 24;
    ctx.fillStyle = crashed ? '#FF4444' : NEON;
    ctx.arc(toX(last.t), toY(last.m), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    drawAxes(ctx, W, H, maxMult);

    function drawAxes(ctx, W, H, maxMult) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '11px monospace';
      [1, 2, 5, 10].forEach(s => {
        if (s <= maxMult + 0.5) {
          const y = H - 25 - ((s - 1) / Math.max(maxMult - 1, 0.1)) * (H - 50);
          if (y > 10 && y < H) ctx.fillText(`${s}x`, 4, y + 4);
        }
      });
    }
  });

  const startRound = () => {
    if (bet > credits || bet < 1) return;
    cancelAnimationFrame(gameLoopRef.current);
    betRef.current = bet;
    gameStateRef.current = 'waiting';
    setCredits(c => c - bet);
    addXp(bet);
    setGameState('waiting');
    setMultiplier(1);
    setCashOutMultiplier(null);
    setCrashedAt(null);
    cashedRef.current = false;
    pointsRef.current = [];
    multiplierRef.current = 1;
    // Efface le canvas immédiatement
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Countdown 2s
    setCountdown(2);
    let c = 2;
    const countInterval = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countInterval);
        launchGame();
      }
    }, 1000);
  };

  const launchGame = () => {
    // Crash point: house edge, mostly low crashes
    const r = Math.random();
    const crash = r < 0.4 ? 1 + Math.random() * 1.5
      : r < 0.7 ? 2 + Math.random() * 3
      : r < 0.9 ? 5 + Math.random() * 5
      : 10 + Math.random() * 20;
    crashPointRef.current = parseFloat(crash.toFixed(2));

    startTimeRef.current = performance.now();
    gameStateRef.current = 'playing';
    setGameState('playing');

    const loop = (now) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      // Exponential-ish growth
      const m = Math.pow(Math.E, elapsed * 0.18);
      const rounded = parseFloat(m.toFixed(2));
      multiplierRef.current = rounded;

      pointsRef.current.push({ t: elapsed, m: rounded });

      setMultiplier(rounded);
      drawCanvas();

      // Auto cash out
      const auto = parseFloat(autoCashOutRef.current);
      if (!isNaN(auto) && auto >= 1.01 && rounded >= auto) {
        doCashOut(rounded);
        return;
      }

      if (rounded >= crashPointRef.current) {
        playCrashSound();
        multiplierRef.current = rounded;
        if (cashedRef.current) {
          gameStateRef.current = 'crashed_after_cash';
          drawCanvas();
          setCrashedAt(parseFloat(rounded.toFixed(2)));
          setGameState('crashed_after_cash');
        } else {
          gameStateRef.current = 'crashed';
          drawCanvas();
          setGameState('crashed');
          saveRound({ game: 'CrashGame', bet: betRef.current, result: `Crash ×${rounded.toFixed(2)}`, profit: -betRef.current });
          setHistory(h => [parseFloat(rounded.toFixed(2)), ...h.slice(0, 19)]);
        }
        return;
      }

      gameLoopRef.current = requestAnimationFrame(loop);
    };

    gameLoopRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => { sessionStorage.setItem('crash_bet', JSON.stringify(bet)); }, [bet]);

  const autoCashOutRef = useRef('');
  useEffect(() => { autoCashOutRef.current = autoCashOut; }, [autoCashOut]);

  const doCashOut = (mult) => {
    cashedRef.current = true;
    const m = mult || multiplierRef.current;
    const b = betRef.current;
    const winAmount = parseFloat((b * m).toFixed(2));
    setCredits(c => c + winAmount);
    gameStateRef.current = 'cashed';
    setGameState('cashed');
    setCashOutMultiplier(parseFloat(m.toFixed(2)));
    saveRound({ game: 'CrashGame', bet: b, result: `Cash Out ×${m.toFixed(2)}`, profit: parseFloat((winAmount - b).toFixed(2)) });
    setHistory(h => [parseFloat(m.toFixed(2)), ...h.slice(0, 19)]);
    if (winAmount > bet) {
      setWinPopup({ amount: (winAmount - bet).toFixed(2), ts: Date.now() });
    }
  };

  const cashOut = () => {
    if (gameState !== 'playing') return;
    doCashOut();
  };

  const reset = () => {
    cancelAnimationFrame(gameLoopRef.current);
    pointsRef.current = [];
    multiplierRef.current = 1;
    gameStateRef.current = 'idle';
    setGameState('idle');
    setMultiplier(1);
    setCashOutMultiplier(null);
    // clear canvas
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, []);

  const multColor = (gameState === 'crashed' || gameState === 'crashed_after_cash') ? '#FF4444' : NEON;
  const isPlaying = gameState === 'playing';
  const canBet = gameState === 'idle' || gameState === 'crashed' || gameState === 'cashed' || gameState === 'crashed_after_cash';

  return (
    <div className="fade-up max-w-5xl mx-auto px-2 py-4" style={{ fontFamily: 'monospace' }}>
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      {/* History badges */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2">
        {history.slice(0, 12).map((h, i) => (
          <span key={i} className="shrink-0 px-2.5 py-1 rounded-full text-xs font-black font-orbitron"
            style={{
              background: h >= 5 ? 'rgba(0,255,102,0.15)' : h >= 2 ? 'rgba(255,215,0,0.12)' : 'rgba(255,68,68,0.12)',
              color: h >= 5 ? '#00e701' : h >= 2 ? '#FFD700' : '#FF4444',
              border: `1px solid ${h >= 5 ? 'rgba(0,255,102,0.3)' : h >= 2 ? 'rgba(255,215,0,0.25)' : 'rgba(255,68,68,0.25)'}`,
            }}>
            {h.toFixed(2)}x
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph area */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden relative order-last lg:order-first"
          style={{ background: BG, border: '1px solid rgba(0,255,102,0.15)', minHeight: 360 }}>

          {/* Multiplier overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            {gameState === 'waiting' && (
              <div className="text-center">
                <p className="text-white/50 text-sm mb-2">Départ dans</p>
                <p className="font-black text-6xl" style={{ color: NEON, textShadow: `0 0 30px ${NEON}` }}>
                  {countdown}
                </p>
              </div>
            )}
            {(gameState === 'playing' || gameState === 'crashed' || gameState === 'cashed' || gameState === 'crashed_after_cash') && (
              <div className="text-center">
                {gameState === 'crashed' && <p className="text-red-400 text-sm font-bold mb-1 animate-pulse">CRASH</p>}
                {gameState === 'cashed' && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold" style={{ color: NEON }}>CASH OUT a {cashOutMultiplier?.toFixed(2)}x</p>
                    <p className="text-xs text-white/40">Le crash arrive à...</p>
                  </div>
                )}
                {gameState === 'crashed_after_cash' && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold" style={{ color: NEON }}>Cash out a {cashOutMultiplier?.toFixed(2)}x</p>
                    <p className="text-xs font-bold text-red-400">Crash a {crashedAt?.toFixed(2)}x</p>
                  </div>
                )}
                <p className="font-black"
                  style={{
                    fontSize: '3.5rem',
                    color: (gameState === 'crashed' || gameState === 'crashed_after_cash') ? '#FF4444' : NEON,
                    textShadow: `0 0 40px ${(gameState === 'crashed' || gameState === 'crashed_after_cash') ? '#FF4444' : NEON}`,
                    lineHeight: 1,
                  }}>
                  {gameState === 'cashed' ? multiplier.toFixed(2) : (gameState === 'crashed_after_cash' ? crashedAt?.toFixed(2) : (cashOutMultiplier || multiplier).toFixed(2))}x
                </p>
              </div>
            )}
            {gameState === 'idle' && (
              <p className="text-white/20 text-lg">Place ta mise pour jouer</p>
            )}
          </div>

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            width={600}
            height={340}
            className="w-full h-full"
            style={{ display: 'block', minHeight: 340 }}
          />
        </div>

        {/* Controls */}
        <div className="space-y-3 order-first lg:order-last" style={{ color: '#fff' }}>
          {/* Bet input */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">{t(lang, 'dice_bet_label')}</p>
              <div className="flex gap-2 items-center">
                <input
                   type="number"
                   value={bet || ''}
                   min={0}
                   disabled={!canBet}
                   placeholder="0"
                   onChange={e => setBet(Math.max(1, Number(e.target.value) || 1))}
                  className="flex-1 rounded-lg px-3 py-2 text-lg font-black text-center focus:outline-none disabled:opacity-40"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(0,255,102,0.3)', color: NEON, fontFamily: 'monospace' }}
                />
              </div>
              <div className="flex gap-1 mt-1">
                {[[t(lang, 'dice_half'), () => setBet(Math.max(1, Math.floor(bet / 2)))], [t(lang, 'dice_double'), () => setBet(Math.min(credits, Math.floor(bet * 2)))], [t(lang, 'dice_max'), () => setBet(credits)]].map(([label, fn]) => (
                  <button key={label} disabled={!canBet} onClick={fn}
                    className="flex-1 text-xs py-1 rounded-lg font-bold disabled:opacity-30 transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto cash out */}
            <div>
              <p className="text-xs text-white/40 mb-1 uppercase tracking-wider">Auto Cash Out</p>
               <input
                 type="number"
                 value={autoCashOut}
                 placeholder="0"
                min={1.01}
                step={0.1}
                onChange={e => setAutoCashOut(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm text-center focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'monospace' }}
              />
            </div>
          </div>

          {/* Action buttons */}
          {!isAuthenticated ? (
            <button onClick={navigateToLogin}
              className="w-full py-4 rounded-xl font-black text-base tracking-widest transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: `linear-gradient(135deg, rgba(0,255,102,0.9) 0%, rgba(0,200,80,0.9) 100%)`, color: '#000', boxShadow: `0 0 20px rgba(0,255,102,0.4)`, fontFamily: 'monospace' }}>
              <Lock className="w-4 h-4 inline mr-2" /> Se connecter pour jouer
            </button>
          ) : canBet && (
            <button onClick={startRound} disabled={bet > credits}
              className="w-full py-4 rounded-xl font-black text-base tracking-widest disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: `linear-gradient(135deg, rgba(0,255,102,0.9) 0%, rgba(0,200,80,0.9) 100%)`, color: '#000', boxShadow: `0 0 20px rgba(0,255,102,0.4)`, fontFamily: 'monospace' }}>
              BET
            </button>
          )}

          {isPlaying && (
            <button onClick={cashOut}
              className="w-full py-4 rounded-xl font-black text-base tracking-widest transition-all hover:scale-[1.02] active:scale-95 animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FF9900 100%)',
                color: '#000',
                boxShadow: '0 0 24px rgba(255,215,0,0.5)',
                fontFamily: 'monospace',
              }}>
              CASH OUT {multiplier.toFixed(2)}x
            </button>
          )}

          {gameState === 'waiting' && (
            <button disabled className="w-full py-4 rounded-xl font-black text-base opacity-50"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', fontFamily: 'monospace' }}>
              Démarrage...
            </button>
          )}

          {/* Balance */}
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs text-white/30 mb-0.5">SOLDE</p>
            <p className="font-black text-lg" style={{ color: NEON }}>{credits.toFixed(2)} €</p>
          </div>

          {/* Potential win */}
          {isPlaying && (
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(0,255,102,0.05)', border: '1px solid rgba(0,255,102,0.2)' }}>
              <p className="text-xs text-white/30 mb-0.5">GAIN POTENTIEL</p>
              <p className="font-black text-xl" style={{ color: NEON, textShadow: `0 0 10px ${NEON}` }}>
                {(bet * multiplier).toFixed(2)} €
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}