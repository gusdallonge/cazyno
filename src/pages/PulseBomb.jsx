import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { saveRound } from '../lib/saveRound';
import { useAuth } from '../lib/AuthContext';
import { RotateCcw, Volume2, VolumeX, Bomb, Lock } from 'lucide-react';
import WinPopup from '../components/WinPopup';
import { useLang, t } from '../lib/i18n';

const NEON = '#00e701';

// Distribution : 60% crash avant x1.7, bonnes chances sur les hauts multis
function generateCrashPoint() {
  const r = Math.random();
  if (r < 0.12) return 1.00;                                                    // 12%   x1 exact
  if (r < 0.27) return parseFloat((1.01 + Math.random() * 0.19).toFixed(2));   // 15%   x1.01–1.20
  if (r < 0.44) return parseFloat((1.20 + Math.random() * 0.24).toFixed(2));   // 17%   x1.20–1.44
  if (r < 0.60) return parseFloat((1.44 + Math.random() * 0.25).toFixed(2));   // 16%   x1.44–1.69  → total 60% avant x1.70
  if (r < 0.72) return parseFloat((1.70 + Math.random() * 0.29).toFixed(2));   // 12%   x1.70–1.99
  if (r < 0.82) return parseFloat((2.00 + Math.random() * 2.99).toFixed(2));   // 10%   x2–4.99
  if (r < 0.90) return parseFloat((5.00 + Math.random() * 4.99).toFixed(2));   //  8%   x5–9.99
  if (r < 0.95) return parseFloat((10   + Math.random() * 14.99).toFixed(2));  //  5%   x10–24.99
  if (r < 0.975) return parseFloat((25  + Math.random() * 74).toFixed(2));     // 2.5%  x25–99
  if (r < 0.988) return parseFloat((100 + Math.random() * 299).toFixed(2));    // 1.3%  x100–399
  if (r < 0.995) return parseFloat((400 + Math.random() * 399).toFixed(2));    // 0.7%  x400–799
  if (r < 0.999) return parseFloat((800 + Math.random() * 199).toFixed(2));    // 0.4%  x800–999
  return 1000;                                                                   // 0.1%  x1000
}

export default function PulseBomb() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const lang = useLang();

  const savedBet = (() => { try { return JSON.parse(sessionStorage.getItem('pulsebomb_bet')); } catch { return null; } })();
  const [bet, setBet] = useState(savedBet ?? '');
  const [gameState, setGameState] = useState('idle'); // idle, active, exploded, won
  const [multiplier, setMultiplier] = useState(1.00);
  const [clickCount, setClickCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);

  const gameLoopRef = useRef(null);
  const crashPointRef = useRef(0);
  const startTimeRef = useRef(0);
  const multiplierRef = useRef(1);
  const gameStateRef = useRef('idle');
  const betRef = useRef(10);
  const audioCtxRef = useRef(null);

  useEffect(() => { betRef.current = bet; sessionStorage.setItem('pulsebomb_bet', JSON.stringify(bet)); }, [bet]);

  useEffect(() => {
    audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {};
  }, []);

  const playTick = (mult) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const freq = Math.min(1400, 600 + mult * 60);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.start(now); osc.stop(now + 0.05);
  };

  const playExplosion = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const bufSize = ctx.sampleRate * 0.5;
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    src.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    src.start(now);
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.connect(og); og.connect(ctx.destination);
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
    og.gain.setValueAtTime(0.08, now);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.start(now); osc.stop(now + 0.4);
  };

  const startGame = () => {
    if (bet > credits || bet < 1) return;
    setCredits(c => c - bet);
    addXp(bet);

    const cp = generateCrashPoint();
    crashPointRef.current = cp;
    startTimeRef.current = performance.now();
    multiplierRef.current = 1;
    gameStateRef.current = 'active';

    setMultiplier(1.00);
    setClickCount(0);
    setGameState('active');

    // Pas de loop automatique — la bombe n'avance qu'au clic
    
  };

  const handleTap = () => {
    if (gameStateRef.current !== 'active') return;

    const m = multiplierRef.current;
    // Vérifie si ce clic explose (basé sur le crash point prédéterminé)
    const nextM = parseFloat(Math.min(9999, m * 1.07 + 0.01).toFixed(2));

    if (nextM >= crashPointRef.current) {
      // EXPLOSION sur ce clic
      multiplierRef.current = crashPointRef.current;
      gameStateRef.current = 'exploded';
      setMultiplier(crashPointRef.current);
      setGameState('exploded');
      playExplosion();
      saveRound({ game: 'PulseBomb', bet: betRef.current, result: `Crash ×${crashPointRef.current}`, profit: -betRef.current });
      setHistory(h => [{ bet: betRef.current, result: 0, mult: crashPointRef.current }, ...h.slice(0, 19)]);
      return;
    }

    // Safe — monte le multiplicateur
    multiplierRef.current = nextM;
    setMultiplier(nextM);
    setClickCount(c => c + 1);
    playTick(nextM);
  };

  const cashOut = () => {
    if (gameStateRef.current !== 'active') return;
    gameStateRef.current = 'won';
    cancelAnimationFrame(gameLoopRef.current);

    const m = multiplierRef.current;
    const win = parseFloat((bet * m).toFixed(2));
    setCredits(c => c + win);
    setGameState('won');
    saveRound({ game: 'PulseBomb', bet, result: `Cash Out ×${m.toFixed(2)}`, profit: parseFloat((win - bet).toFixed(2)) });
    setHistory(h => [{ bet, result: win, mult: m }, ...h.slice(0, 19)]);
    if (win > bet) setWinPopup({ amount: (win - bet).toFixed(2), ts: Date.now() });
  };

  const reset = () => {
    cancelAnimationFrame(gameLoopRef.current);
    // Relance directement une nouvelle partie avec la même mise
    const currentBet = betRef.current;
    if (currentBet > credits) {
      gameStateRef.current = 'idle';
      setGameState('idle');
      setMultiplier(1.00);
      return;
    }
    setCredits(c => c - currentBet);
    addXp(currentBet);
    const cp = generateCrashPoint();
    crashPointRef.current = cp;
    multiplierRef.current = 1;
    gameStateRef.current = 'active';
    setMultiplier(1.00);
    setClickCount(0);
    setGameState('active');
  };

  useEffect(() => () => cancelAnimationFrame(gameLoopRef.current), []);

  const potentialWin = (bet * multiplier).toFixed(2);
  const progress = Math.min(1, (multiplier - 1) / 9);

  return (
    <div className="fade-up max-w-4xl mx-auto px-2 py-2 select-none" style={{ fontFamily: 'monospace', userSelect: 'none' }}>
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      {/* TITRE compact */}
      <div className="text-center mb-2">
        <h1 className="font-orbitron text-2xl font-black" style={{ color: NEON, textShadow: `0 0 20px ${NEON}99` }}>PULSE BOMB</h1>
      </div>

      {/* LAYOUT DESKTOP : grille 3 colonnes | MOBILE : tout en colonne */}
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3">

        {/* BOMBE — toujours en premier = en haut sur mobile */}
        <div className="lg:col-span-2 rounded-2xl flex flex-col items-center justify-center gap-3"
          style={{ background: '#0D0D0D', border: '1px solid rgba(0,255,102,0.12)', padding: '1.25rem', minHeight: 'clamp(0px, 50vw, 380px)' }}>

          {/* Multiplicateur */}
          <p className="font-orbitron font-black text-center bomb-mult"
            style={{
              fontSize: '2.8rem',
              color: gameState === 'exploded' ? '#FF4444' : NEON,
              textShadow: `0 0 30px ${NEON}`,
              transition: 'color 0.3s', lineHeight: 1,
            }}>
            ×{multiplier.toFixed(2)}
          </p>

          {/* Bombe cliquable */}
          <div className="bomb-circle relative flex items-center justify-center cursor-pointer"
            onClick={handleTap}
            style={{
              width: 150, height: 150, borderRadius: '50%',
              background: gameState === 'exploded' ? 'radial-gradient(circle, rgba(255,50,50,0.5), rgba(200,0,0,0.2))' : 'radial-gradient(circle, rgba(0,255,102,0.12), rgba(0,255,102,0.03))',
              border: `3px solid ${gameState === 'exploded' ? '#FF4444' : 'rgba(0,255,102,0.3)'}`,
              boxShadow: gameState === 'exploded' ? '0 0 60px rgba(255,50,50,0.6)' : gameState === 'active' ? `0 0 40px ${NEON}44` : 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s',
              animation: gameState === 'active' && progress > 0.7 ? 'bombShake 0.1s ease-in-out infinite' : 'none',
            }}>
            <div className="text-center select-none">
              {(gameState === 'idle' || gameState === 'active') && <div className="bomb-emoji"><Bomb className="w-14 h-14 text-orange-400" /></div>}
              {gameState === 'exploded' && <div className="bomb-emoji" style={{ animation: 'popBoom 0.3s ease-out' }}><Bomb className="w-16 h-16 text-red-500" /></div>}
              {gameState === 'won' && <div className="bomb-emoji"><Bomb className="w-14 h-14 text-green-400" /></div>}
            </div>
          </div>



          {gameState === 'exploded' && <p className="font-orbitron font-black text-lg" style={{ color: '#FF4444' }}>EXPLOSION à ×{multiplier.toFixed(2)}</p>}
          {gameState === 'won' && <p className="font-orbitron font-black text-lg" style={{ color: NEON }}>+{(bet * multiplier - bet).toFixed(2)} €</p>}
          {gameState === 'idle' && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Place ta mise et démarre</p>}
        </div>

        {/* CONTRÔLES */}
        <div className="space-y-2">

          {/* Mise */}
          <div className="rounded-2xl p-3 space-y-2"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{t(lang, 'dice_bet_label')}</p>
            <input
              type="number" value={bet || ''} min={0}
              disabled={gameState === 'active'}
              placeholder="0"
              onChange={e => setBet(Math.max(1, Number(e.target.value) || 1))}
              className="w-full rounded-xl px-3 py-2 text-lg font-black text-center focus:outline-none disabled:opacity-40"
              style={{ background: 'rgba(0,255,102,0.06)', border: '1.5px solid rgba(0,255,102,0.35)', color: NEON, fontFamily: 'monospace' }}
            />
            <div className="grid grid-cols-3 gap-1">
              {[[t(lang, 'dice_half'), () => setBet(Math.max(1, Math.floor(bet/2)))], [t(lang, 'dice_double'), () => setBet(Math.min(credits, bet*2))], [t(lang, 'dice_max'), () => setBet(credits)]].map(([l, fn]) => (
                <button key={l} onClick={fn} disabled={gameState === 'active'}
                  className="py-1 rounded-lg text-xs font-bold disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Bouton DÉMARRER / REJOUER */}
          {!isAuthenticated ? (
            <button onClick={navigateToLogin}
              className="w-full py-4 rounded-2xl font-orbitron font-black text-base tracking-widest transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00e701, #00CC55)', color: '#000', boxShadow: '0 0 20px rgba(0,255,102,0.4)' }}>
              <Lock className="w-4 h-4 inline mr-2" /> Se connecter pour jouer
            </button>
          ) : (gameState === 'idle' || gameState === 'exploded' || gameState === 'won') && (
            <button onClick={gameState === 'idle' ? startGame : reset} disabled={bet > credits && gameState === 'idle'}
              className="w-full py-4 rounded-2xl font-orbitron font-black text-base tracking-widest disabled:opacity-40 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #00e701, #00CC55)', color: '#000', boxShadow: '0 0 20px rgba(0,255,102,0.4)' }}>
              {gameState === 'idle' ? 'DÉMARRER' : 'REJOUER'}
            </button>
          )}

          {/* Bouton CASH OUT */}
          {gameState === 'active' && (
            <button onClick={cashOut} disabled={clickCount === 0}
              className="w-full py-4 rounded-2xl font-orbitron font-black text-xl tracking-widest transition-all active:scale-95 disabled:opacity-30"
              style={{ background: clickCount > 0 ? 'linear-gradient(135deg, #FFD700, #FF9900)' : 'rgba(255,215,0,0.1)', color: '#000', boxShadow: clickCount > 0 ? '0 0 28px rgba(255,215,0,0.5)' : 'none', border: clickCount === 0 ? '1px solid rgba(255,215,0,0.2)' : 'none' }}>
              CASH OUT
              </button>
          )}

          {/* Son + Gain potentiel côte à côte */}
          <div className="flex gap-2 items-center">
            <button onClick={() => setSoundEnabled(s => !s)}
              className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
              {soundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              {soundEnabled ? 'ON' : 'OFF'}
            </button>
            <div className="flex-1 rounded-xl py-2 px-3 text-center"
              style={{ background: 'rgba(0,255,102,0.06)', border: '1px solid rgba(0,255,102,0.2)' }}>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Gain potentiel</p>
              <p className="font-orbitron font-black text-lg" style={{ color: NEON }}>{potentialWin} €</p>
            </div>
          </div>

          {/* Historique */}
          {history.length > 0 && (
            <div className="rounded-2xl p-3"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Historique</p>
              <div className="space-y-1">
                {history.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex justify-between rounded-lg px-2 py-1 text-xs"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="font-orbitron" style={{ color: 'rgba(255,255,255,0.4)' }}>×{h.mult.toFixed(2)}</span>
                    <span className="font-orbitron font-bold" style={{ color: h.result > h.bet ? NEON : '#FF4444' }}>
                      {h.result > h.bet ? '+' : ''}{(h.result - h.bet).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bombShake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        @keyframes popBoom {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (min-width: 1024px) {
          .bomb-circle { width: 200px !important; height: 200px !important; }
          .bomb-emoji { font-size: 72px !important; }
          .bomb-mult { font-size: 3.5rem !important; }
        }
      `}</style>
    </div>
  );
}