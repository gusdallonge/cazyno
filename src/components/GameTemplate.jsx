import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import WinPopup from './WinPopup';

export const NEON = '#00e701';
export const RED = '#FF4444';

export function playSound(freq, duration) {
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

const GameTemplate = forwardRef(function GameTemplate({
  title,
  subtitle,
  gameKey,
  children,
  onPlay,
  playLabel = 'PLAY',
  playDisabled = false,
  extraControls,
  historyItems,
  accentColor,
  showPlayButton = true,
}, ref) {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const accent = accentColor || NEON;

  const savedBet = (() => { try { return JSON.parse(sessionStorage.getItem(`${gameKey}_bet`)); } catch { return null; } })();
  const [bet, setBet] = useState(savedBet ?? 10);
  const [winPopup, setWinPopup] = useState(null);

  useEffect(() => { sessionStorage.setItem(`${gameKey}_bet`, JSON.stringify(bet)); }, [bet, gameKey]);

  const clampBet = useCallback((v) => Math.max(1, Math.min(Math.floor(credits), v)), [credits]);

  const showWin = useCallback((amount) => {
    setWinPopup({ amount: typeof amount === 'number' ? amount.toFixed(2) : amount, ts: Date.now() });
  }, []);

  useImperativeHandle(ref, () => ({ showWin, bet, clampBet }), [showWin, bet, clampBet]);

  const handlePlay = () => {
    if (!onPlay || bet <= 0 || bet > credits) return;
    onPlay({ bet, credits, clampBet });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 py-10 fade-up"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}0F 0%, transparent 60%), linear-gradient(180deg, #080c12 0%, #080c12 100%)` }}
    >
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}>
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: accent }}>Casino</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black font-orbitron tracking-tight"
          style={{ color: '#fff', textShadow: `0 0 80px ${accent}44` }}>
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm" style={{ color: '#4b5c6f' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Main layout */}
      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">

          {/* Left: Game area + history */}
          <div className="flex-1 flex flex-col gap-4">
            {typeof children === 'function'
              ? children({ bet, setBet, credits, setCredits, addXp, clampBet, showWin, isAuthenticated })
              : children}

            {/* History strip */}
            {historyItems && historyItems.length > 0 && (
              <div className="rounded-3xl p-5"
                style={{ background: '#111a25', border: '1px solid #1a2a38' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#4b5c6f' }}>Last games</p>
                <div className="flex flex-wrap gap-2">
                  {historyItems.map((item) => (
                    <div key={item.key}
                      className="px-3 h-10 rounded-xl flex items-center justify-center font-black text-sm font-orbitron transition-all hover:scale-110"
                      style={{
                        background: item.won ? `${accent}15` : `${RED}15`,
                        border: `1px solid ${item.won ? `${accent}35` : `${RED}35`}`,
                        color: item.won ? accent : RED,
                      }}>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Controls */}
          <div className="w-full md:w-80 flex flex-col gap-4">
            {/* Bet Controls Card */}
            <div className="rounded-3xl p-6"
              style={{ background: '#111a25', border: '1px solid #1a2a38' }}>

              {/* Extra controls (e.g. mine count, target multiplier) */}
              {extraControls && <div className="mb-4">{extraControls}</div>}

              {/* Bet header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#4b5c6f' }}>Bet amount</span>
                <span className="text-xs font-bold" style={{ color: '#4b5c6f' }}>
                  Balance: <span style={{ color: accent }}>{credits.toFixed(2)} €</span>
                </span>
              </div>

              {/* Bet input */}
              <div className="relative mb-3">
                <input
                  type="number"
                  value={bet}
                  onChange={e => setBet(clampBet(Number(e.target.value) || 1))}
                  disabled={playDisabled}
                  className="w-full px-5 py-4 rounded-2xl text-2xl font-black text-center focus:outline-none disabled:opacity-40 transition-all"
                  style={{
                    background: `${accent}0F`,
                    border: `1.5px solid ${accent}35`,
                    color: accent,
                    fontFamily: "'Orbitron', monospace",
                    letterSpacing: '0.05em',
                  }}
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: `${accent}60` }}>€</span>
              </div>

              {/* Quick bet buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  ['½', () => setBet(clampBet(Math.floor(bet / 2)))],
                  ['2×', () => setBet(clampBet(bet * 2))],
                  ['10', () => setBet(clampBet(10))],
                  ['Max', () => setBet(clampBet(credits))],
                ].map(([label, fn]) => (
                  <button key={label} onClick={fn} disabled={playDisabled}
                    className="py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-30 hover:scale-105 active:scale-95"
                    style={{ background: '#162030', border: '1px solid #1a2a38', color: '#94a3b8' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Play / Login button */}
            {!isAuthenticated ? (
              <button
                onClick={navigateToLogin}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${accent}18 0%, rgba(0,150,60,0.1) 100%)`,
                  border: `1.5px solid ${accent}45`,
                  color: accent,
                  boxShadow: `0 4px 24px ${accent}18`,
                }}
              >
                Se connecter pour jouer
              </button>
            ) : showPlayButton && (
              <button
                onClick={handlePlay}
                disabled={playDisabled || bet > credits}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron overflow-hidden transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${accent}18 0%, rgba(0,150,60,0.1) 100%)`,
                  border: `1.5px solid ${accent}45`,
                  color: accent,
                  boxShadow: `0 4px 24px ${accent}18`,
                }}
              >
                {playLabel}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
});

export default GameTemplate;
