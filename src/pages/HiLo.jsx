import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, ArrowUp, ArrowDown, Banknote } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import WinPopup from '../components/WinPopup';
import { saveRound } from '../lib/saveRound';

const NEON = '#00e701';
const RED = '#FF4444';

const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUIT_SYMBOLS = { spades: 'S', hearts: 'H', diamonds: 'D', clubs: 'C' };
const SUIT_COLORS = { spades: '#fff', hearts: RED, diamonds: RED, clubs: '#fff' };

function rankValue(rank) {
  const idx = RANKS.indexOf(rank);
  return idx + 2; // 2-14
}

function randomCard() {
  return { rank: RANKS[Math.floor(Math.random() * 13)], suit: SUITS[Math.floor(Math.random() * 4)] };
}

function calcProbability(currentRank, direction) {
  const val = rankValue(currentRank);
  if (direction === 'higher') {
    const higher = 14 - val; // cards strictly higher
    return Math.max(0.05, higher / 13);
  } else {
    const lower = val - 2; // cards strictly lower
    return Math.max(0.05, lower / 13);
  }
}

function calcMultiplier(prob) {
  // House edge ~3%
  return Math.max(1.05, parseFloat((0.97 / prob).toFixed(2)));
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

export default function HiLo() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [bet, setBet] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [nextCard, setNextCard] = useState(null);
  const [streak, setStreak] = useState(0);
  const [totalMultiplier, setTotalMultiplier] = useState(1);
  const [revealing, setRevealing] = useState(false);
  const [lastGuessWon, setLastGuessWon] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);

  const clampBet = (v) => Math.max(1, Math.min(Math.floor(credits), v));

  const startGame = () => {
    if (bet <= 0 || bet > credits) return;
    setCredits(c => c - bet);
    addXp(bet);
    const card = randomCard();
    setCurrentCard(card);
    setNextCard(null);
    setStreak(0);
    setTotalMultiplier(1);
    setGameOver(false);
    setLastGuessWon(null);
    setPlaying(true);
  };

  const guess = async (direction) => {
    if (!playing || revealing || gameOver) return;
    setRevealing(true);

    const next = randomCard();
    setNextCard(next);
    await new Promise(r => setTimeout(r, 600));

    const curVal = rankValue(currentCard.rank);
    const nextVal = rankValue(next.rank);
    let won;
    if (direction === 'higher') won = nextVal > curVal;
    else won = nextVal < curVal;
    // Tie = loss
    if (nextVal === curVal) won = false;

    setLastGuessWon(won);

    if (won) {
      const prob = calcProbability(currentCard.rank, direction);
      const mult = calcMultiplier(prob);
      const newTotal = parseFloat((totalMultiplier * mult).toFixed(2));
      setTotalMultiplier(newTotal);
      setStreak(s => s + 1);
      playSound(1000 + streak * 100, 150);

      // Move to next
      await new Promise(r => setTimeout(r, 500));
      setCurrentCard(next);
      setNextCard(null);
      setLastGuessWon(null);
    } else {
      playSound(280, 350);
      setGameOver(true);
      setPlaying(false);
      saveRound({ game: 'HiLo', bet, result: `Streak:${streak} Lost on ${direction}`, profit: -bet });
      setHistory(h => [{ streak, won: false, multiplier: totalMultiplier, ts: Date.now() }, ...h.slice(0, 11)]);
    }

    setRevealing(false);
  };

  const cashOut = () => {
    if (!playing || gameOver || streak === 0) return;
    const payout = bet * totalMultiplier;
    setCredits(c => c + payout);
    setGameOver(true);
    setPlaying(false);
    playSound(1200, 220);
    setWinPopup({ amount: (payout - bet).toFixed(2), ts: Date.now() });
    saveRound({ game: 'HiLo', bet, result: `Streak:${streak} Cashed out x${totalMultiplier}`, profit: payout - bet });
    setHistory(h => [{ streak, won: true, multiplier: totalMultiplier, ts: Date.now() }, ...h.slice(0, 11)]);
  };

  const higherProb = currentCard ? calcProbability(currentCard.rank, 'higher') : 0;
  const lowerProb = currentCard ? calcProbability(currentCard.rank, 'lower') : 0;
  const higherMult = calcMultiplier(higherProb);
  const lowerMult = calcMultiplier(lowerProb);

  const renderCard = (card, hidden = false) => {
    if (!card) return null;
    const color = SUIT_COLORS[card.suit];
    return (
      <div className="w-28 h-40 rounded-2xl flex flex-col items-center justify-center font-orbitron relative"
        style={{
          background: hidden ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          border: `1px solid ${hidden ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)'}`,
          boxShadow: hidden ? 'none' : '0 4px 20px rgba(0,0,0,0.3)',
        }}>
        {hidden ? (
          <span className="text-3xl" style={{ color: 'rgba(255,255,255,0.15)' }}>?</span>
        ) : (
          <>
            <span className="text-3xl font-black" style={{ color }}>{card.rank}</span>
            <span className="text-lg mt-1" style={{ color }}>{SUIT_SYMBOLS[card.suit]}</span>
          </>
        )}
      </div>
    );
  };

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
          style={{ color: '#fff', textShadow: `0 0 80px ${NEON}44` }}>HI-LO</h1>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Guess if the next card is <span style={{ color: NEON }}>higher</span> or <span style={{ color: RED }}>lower</span>. Build your streak.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            {/* Card Display */}
            <div className="rounded-3xl p-8 flex flex-col items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.08)', minHeight: 300 }}>

              {currentCard ? (
                <div className="flex items-center gap-6">
                  {renderCard(currentCard)}
                  {nextCard ? (
                    <>
                      <div className="text-2xl font-orbitron" style={{ color: 'rgba(255,255,255,0.2)' }}>vs</div>
                      {renderCard(nextCard)}
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-orbitron" style={{ color: 'rgba(255,255,255,0.2)' }}>vs</div>
                      {renderCard({ rank: '?', suit: 'spades' }, true)}
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="text-7xl font-black font-orbitron" style={{ color: 'rgba(255,255,255,0.08)' }}>?</div>
                  <p className="text-xs tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>Place a bet to start</p>
                </div>
              )}

              {lastGuessWon !== null && (
                <div className="mt-6 px-5 py-1.5 rounded-full font-bold text-sm tracking-widest uppercase"
                  style={{ background: lastGuessWon ? `${NEON}18` : `${RED}18`, border: `1px solid ${lastGuessWon ? `${NEON}40` : `${RED}40`}`, color: lastGuessWon ? NEON : RED }}>
                  {lastGuessWon ? 'CORRECT' : 'WRONG'}
                </div>
              )}

              {playing && !gameOver && (
                <div className="mt-4 flex gap-6 text-center">
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Streak</p>
                    <p className="text-2xl font-black font-orbitron" style={{ color: NEON }}>{streak}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Multiplier</p>
                    <p className="text-2xl font-black font-orbitron" style={{ color: NEON }}>x{totalMultiplier}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Potential</p>
                    <p className="text-2xl font-black font-orbitron" style={{ color: NEON }}>{(bet * totalMultiplier).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="rounded-3xl p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>History</p>
                <div className="flex flex-wrap gap-2">
                  {history.map(({ streak: s, won: w, multiplier, ts }) => (
                    <div key={ts} className="px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: w ? `${NEON}15` : `${RED}15`, border: `1px solid ${w ? `${NEON}35` : `${RED}35`}`, color: w ? NEON : RED }}>
                      {s} streak {w ? `x${multiplier}` : 'BUST'}
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
                {gameOver ? 'PLAY AGAIN' : 'DEAL CARD'}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => guess('higher')} disabled={revealing}
                    className="relative py-6 rounded-2xl font-black text-sm tracking-wider font-orbitron overflow-hidden transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                    style={{ background: `linear-gradient(135deg, ${NEON}18 0%, rgba(0,150,60,0.1) 100%)`, border: `1.5px solid ${NEON}45`, color: NEON }}>
                    <ArrowUp className="w-5 h-5 mx-auto mb-1" />
                    <div>HIGHER</div>
                    <div className="text-xs mt-1 opacity-60">x{higherMult}</div>
                  </button>

                  <button onClick={() => guess('lower')} disabled={revealing}
                    className="relative py-6 rounded-2xl font-black text-sm tracking-wider font-orbitron overflow-hidden transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                    style={{ background: `linear-gradient(135deg, ${RED}18 0%, rgba(180,0,0,0.1) 100%)`, border: `1.5px solid ${RED}45`, color: RED }}>
                    <ArrowDown className="w-5 h-5 mx-auto mb-1" />
                    <div>LOWER</div>
                    <div className="text-xs mt-1 opacity-60">x{lowerMult}</div>
                  </button>
                </div>

                {streak > 0 && (
                  <button onClick={cashOut} disabled={revealing}
                    className="w-full py-5 rounded-2xl font-black text-sm tracking-wider font-orbitron transition-all disabled:opacity-40 active:scale-95 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, rgba(255,200,0,0.18) 0%, rgba(200,150,0,0.1) 100%)', border: '1.5px solid rgba(255,200,0,0.45)', color: '#FFD700' }}>
                    <Banknote className="w-4 h-4 inline mr-2" /> CASH OUT {(bet * totalMultiplier).toFixed(2)}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
