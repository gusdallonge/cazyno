import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, Play, RefreshCw } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import WinPopup from '../components/WinPopup';
import { saveRound } from '../lib/saveRound';

const NEON = '#00e701';
const RED = '#FF4444';

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUIT_SYMBOLS = { spades: 'S', hearts: 'H', diamonds: 'D', clubs: 'C' };
const SUIT_COLORS = { spades: '#fff', hearts: RED, diamonds: RED, clubs: '#fff' };

// Jacks or Better pay table (multiplier on bet)
const PAY_TABLE = [
  { name: 'Royal Flush', mult: 250 },
  { name: 'Straight Flush', mult: 50 },
  { name: 'Four of a Kind', mult: 25 },
  { name: 'Full House', mult: 9 },
  { name: 'Flush', mult: 6 },
  { name: 'Straight', mult: 4 },
  { name: 'Three of a Kind', mult: 3 },
  { name: 'Two Pair', mult: 2 },
  { name: 'Jacks or Better', mult: 1 },
];

function buildDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ rank, suit });
    }
  }
  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function rankVal(r) { return RANKS.indexOf(r); }

function evaluateHand(cards) {
  const ranks = cards.map(c => rankVal(c.rank)).sort((a, b) => a - b);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);

  // Check straight
  let isStraight = false;
  const unique = [...new Set(ranks)];
  if (unique.length === 5) {
    if (unique[4] - unique[0] === 4) isStraight = true;
    // A-2-3-4-5 (wheel)
    if (unique[0] === 0 && unique[1] === 1 && unique[2] === 2 && unique[3] === 3 && unique[4] === 12) isStraight = true;
  }

  // Count ranks
  const counts = {};
  for (const r of ranks) counts[r] = (counts[r] || 0) + 1;
  const vals = Object.values(counts).sort((a, b) => b - a);

  // Royal Flush
  if (isFlush && isStraight && ranks.includes(12) && ranks.includes(11) && ranks.includes(10) && ranks.includes(9) && ranks.includes(8)) {
    return { name: 'Royal Flush', mult: 250 };
  }
  if (isFlush && isStraight) return { name: 'Straight Flush', mult: 50 };
  if (vals[0] === 4) return { name: 'Four of a Kind', mult: 25 };
  if (vals[0] === 3 && vals[1] === 2) return { name: 'Full House', mult: 9 };
  if (isFlush) return { name: 'Flush', mult: 6 };
  if (isStraight) return { name: 'Straight', mult: 4 };
  if (vals[0] === 3) return { name: 'Three of a Kind', mult: 3 };
  if (vals[0] === 2 && vals[1] === 2) return { name: 'Two Pair', mult: 2 };
  if (vals[0] === 2) {
    // Jacks or better: pair must be J, Q, K, or A (index >= 9)
    const pairRank = Number(Object.entries(counts).find(([, v]) => v === 2)?.[0]);
    if (pairRank >= 9) return { name: 'Jacks or Better', mult: 1 };
  }
  return { name: 'No Win', mult: 0 };
}

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

export default function VideoPoker() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [bet, setBet] = useState(10);
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [held, setHeld] = useState([false, false, false, false, false]);
  const [phase, setPhase] = useState('idle'); // idle, deal, draw, result
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);

  const clampBet = (v) => Math.max(1, Math.min(Math.floor(credits), v));

  const deal = () => {
    if (bet <= 0 || bet > credits || phase === 'deal') return;
    setCredits(c => c - bet);
    addXp(bet);
    const d = buildDeck();
    const h = d.splice(0, 5);
    setDeck(d);
    setHand(h);
    setHeld([false, false, false, false, false]);
    setResult(null);
    setPhase('deal');
  };

  const toggleHold = (idx) => {
    if (phase !== 'deal') return;
    setHeld(h => h.map((v, i) => i === idx ? !v : v));
  };

  const draw = () => {
    if (phase !== 'deal') return;
    const newHand = [...hand];
    const remainingDeck = [...deck];
    for (let i = 0; i < 5; i++) {
      if (!held[i]) {
        newHand[i] = remainingDeck.shift();
      }
    }
    setHand(newHand);
    setDeck(remainingDeck);

    const eval_ = evaluateHand(newHand);
    setResult(eval_);
    setPhase('result');

    if (eval_.mult > 0) {
      const payout = bet * eval_.mult;
      setCredits(c => c + payout);
      playSound(1200, 220);
      if (payout > bet) {
        setWinPopup({ amount: (payout - bet).toFixed(2), ts: Date.now() });
      }
    } else {
      playSound(280, 350);
    }

    saveRound({ game: 'VideoPoker', bet, result: eval_.name, profit: eval_.mult > 0 ? bet * eval_.mult - bet : -bet });
    setHistory(h => [{ name: eval_.name, mult: eval_.mult, won: eval_.mult > 0, ts: Date.now() }, ...h.slice(0, 11)]);
  };

  const renderCard = (card, idx) => {
    if (!card) return null;
    const isHeld = held[idx];
    const color = SUIT_COLORS[card.suit];
    return (
      <button key={idx} onClick={() => toggleHold(idx)}
        className="relative flex flex-col items-center justify-center rounded-2xl transition-all hover:scale-105"
        style={{
          width: '18%', aspectRatio: '2.5/3.5',
          background: isHeld
            ? `linear-gradient(135deg, ${NEON}15 0%, ${NEON}05 100%)`
            : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          border: `2px solid ${isHeld ? `${NEON}60` : 'rgba(255,255,255,0.12)'}`,
          boxShadow: isHeld ? `0 0 15px ${NEON}25` : '0 4px 20px rgba(0,0,0,0.3)',
          cursor: phase === 'deal' ? 'pointer' : 'default',
        }}>
        <span className="text-2xl md:text-3xl font-black font-orbitron" style={{ color }}>{card.rank}</span>
        <span className="text-sm md:text-base" style={{ color }}>{SUIT_SYMBOLS[card.suit]}</span>
        {isHeld && phase === 'deal' && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
            style={{ background: NEON, color: '#111' }}>HOLD</div>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10 fade-up"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(0,255,102,0.06) 0%, transparent 60%), linear-gradient(180deg, #0c0f18 0%, #080a10 100%)' }}>
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
          style={{ background: `${NEON}12`, border: `1px solid ${NEON}30` }}>
          <Play className="w-3.5 h-3.5" style={{ color: NEON }} />
          <span className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: NEON }}>Casino</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black font-orbitron tracking-tight"
          style={{ color: '#fff', textShadow: `0 0 80px ${NEON}44` }}>VIDEO POKER</h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Jacks or Better. Hold your best cards, draw the rest.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            {/* Cards */}
            <div className="rounded-3xl p-6 flex flex-col items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.08)', minHeight: 280 }}>
              {hand.length > 0 ? (
                <>
                  <div className="flex gap-3 justify-center w-full">
                    {hand.map((card, i) => renderCard(card, i))}
                  </div>
                  {phase === 'deal' && (
                    <p className="mt-4 text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      Click cards to hold, then draw
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-7xl font-black font-orbitron" style={{ color: 'rgba(255,255,255,0.08)' }}>VP</div>
                  <p className="text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Deal to start</p>
                </div>
              )}

              {result && (
                <div className="mt-4 px-5 py-2 rounded-full font-bold text-sm tracking-widest uppercase"
                  style={{ background: result.mult > 0 ? `${NEON}18` : `${RED}18`, border: `1px solid ${result.mult > 0 ? `${NEON}40` : `${RED}40`}`, color: result.mult > 0 ? NEON : RED }}>
                  {result.name} {result.mult > 0 ? `x${result.mult}` : ''}
                </div>
              )}
            </div>

            {/* Pay Table */}
            <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Pay table</p>
              <div className="grid grid-cols-3 gap-2">
                {PAY_TABLE.map(({ name, mult }) => (
                  <div key={name} className="px-3 py-2 rounded-xl text-xs font-bold flex justify-between"
                    style={{
                      background: result?.name === name ? `${NEON}15` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${result?.name === name ? `${NEON}40` : 'rgba(255,255,255,0.06)'}`,
                      color: result?.name === name ? NEON : 'rgba(255,255,255,0.5)',
                    }}>
                    <span>{name}</span>
                    <span style={{ color: NEON }}>{mult}x</span>
                  </div>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>History</p>
                <div className="flex flex-wrap gap-2">
                  {history.map(({ name, mult, won, ts }) => (
                    <div key={ts} className="px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: won ? `${NEON}15` : `${RED}15`, border: `1px solid ${won ? `${NEON}35` : `${RED}35`}`, color: won ? NEON : RED }}>
                      {name} {mult > 0 ? `x${mult}` : ''}
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
                <input type="number" value={bet} onChange={e => setBet(clampBet(Number(e.target.value) || 1))} disabled={phase === 'deal'}
                  className="w-full px-5 py-4 rounded-2xl text-2xl font-black text-center focus:outline-none disabled:opacity-40 transition-all"
                  style={{ background: 'rgba(0,255,102,0.06)', border: `1.5px solid ${NEON}35`, color: NEON, fontFamily: "'Orbitron', monospace" }} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[['1/2', () => setBet(clampBet(Math.floor(bet / 2)))], ['2x', () => setBet(clampBet(bet * 2))], ['10', () => setBet(clampBet(10))], ['Max', () => setBet(clampBet(credits))]].map(([label, fn]) => (
                  <button key={label} onClick={fn} disabled={phase === 'deal'}
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
            ) : phase === 'deal' ? (
              <button onClick={draw}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all active:scale-95 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, rgba(255,200,0,0.18) 0%, rgba(200,150,0,0.1) 100%)', border: '1.5px solid rgba(255,200,0,0.45)', color: '#FFD700', boxShadow: '0 4px 24px rgba(255,200,0,0.18)' }}>
                <RefreshCw className="w-4 h-4 inline mr-2" /> DRAW
              </button>
            ) : (
              <button onClick={deal} disabled={bet > credits}
                className="w-full py-8 rounded-2xl font-black text-base tracking-wider font-orbitron transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                style={{ background: `linear-gradient(135deg, ${NEON}18 0%, rgba(0,150,60,0.1) 100%)`, border: `1.5px solid ${NEON}45`, color: NEON, boxShadow: `0 4px 24px ${NEON}18` }}>
                <Play className="w-4 h-4 inline mr-2" /> DEAL
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
