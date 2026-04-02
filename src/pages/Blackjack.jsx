import { useState, useCallback, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, Spade } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

function fmt(n) { return Number(n).toLocaleString('fr-FR'); }
import { RefreshCw, TrendingUp, TrendingDown, Equal } from 'lucide-react';
import { playDealSound, playHitSound } from '../lib/soundEffects';
import WinPopup from '../components/WinPopup';
import { useLang, t } from '../lib/i18n';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function makeDeck() {
  const deck = [];
  for (const suit of SUITS)
    for (const rank of RANKS)
      deck.push({ suit, rank });
  return deck.sort(() => Math.random() - 0.5);
}

function cardValue(card) {
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 11;
  return parseInt(card.rank);
}

function handTotal(hand) {
  let total = hand.reduce((s, c) => s + cardValue(c), 0);
  let aces = hand.filter(c => c.rank === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isRed(card) {
  return card.suit === '♥' || card.suit === '♦';
}

function CardView({ card, hidden, delay = 0 }) {
  const animStyle = { animationDelay: `${delay * 0.12}s` };
  const red = !hidden && isRed(card);
  const color = red ? '#e03131' : '#111';

  if (hidden) {
    return (
      <div className="deal-anim relative select-none shrink-0"
        style={{ width: 88, height: 128, borderRadius: 12, ...animStyle }}>
        {/* Card back */}
        <div className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0a1628 0%, #0d2040 50%, #0a1628 100%)',
            border: '2px solid rgba(0,255,102,0.35)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}>
          {/* Neon grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
                <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#00e701" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{
              width: 50, height: 74, borderRadius: 8,
              border: '1.5px solid rgba(0,255,102,0.5)',
              background: 'rgba(0,255,102,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Spade className="w-6 h-6 text-[#00e701]" style={{ filter: 'drop-shadow(0 0 6px #00e701)' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="deal-anim relative select-none shrink-0"
      style={{ width: 88, height: 128, borderRadius: 12, animationDelay: `${delay * 0.12}s` }}>
      <div className="absolute inset-0 rounded-xl flex flex-col justify-between p-1.5"
        style={{
          background: 'linear-gradient(160deg, #ffffff 0%, #f0f0f0 100%)',
          border: '1.5px solid rgba(0,0,0,0.12)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}>
        {/* Top-left corner */}
        <div className="flex flex-col items-start leading-none" style={{ color }}>
          <span className="font-black leading-none" style={{ fontSize: 19, fontFamily: 'Georgia, serif' }}>{card.rank}</span>
          <span className="leading-none" style={{ fontSize: 15, marginTop: 1 }}>{card.suit}</span>
        </div>
        {/* Center suit */}
          <div className="flex items-center justify-center">
          <span style={{
            fontSize: card.rank === '10' ? 34 : 38,
            color,
            lineHeight: 1,
            filter: red ? 'drop-shadow(0 1px 2px rgba(200,0,0,0.2))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
          }}>
            {card.suit}
          </span>
        </div>
        {/* Bottom-right corner (rotated) */}
        <div className="flex flex-col items-end leading-none rotate-180" style={{ color }}>
          <span className="font-black leading-none" style={{ fontSize: 19, fontFamily: 'Georgia, serif' }}>{card.rank}</span>
          <span className="leading-none" style={{ fontSize: 15, marginTop: 1 }}>{card.suit}</span>
        </div>
      </div>
    </div>
  );
}

function HandDisplay({ label, hand, hideSecond, total, active = false }) {
  return (
    <div className={`space-y-3 p-4 rounded-2xl transition-all ${active ? 'ring-2 ring-primary bg-[#00e701]/5' : ''}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-semibold ${active ? 'text-[#00e701]' : 'text-[#94a3b8]'}`}>{label}</span>
        <span className={`font-orbitron font-bold text-2xl ${total > 21 ? 'text-destructive' : 'text-[#00e701]'}`}>
          {hideSecond ? '?' : total}
          {total > 21 && <span className="text-xs ml-1">Bust!</span>}
        </span>
      </div>
      <div className="flex gap-3 flex-wrap">
        {hand.map((card, i) => (
          <CardView key={i} card={card} hidden={hideSecond && i === 1} delay={i} />
        ))}
      </div>
    </div>
  );
}

const PHASES = { BETTING: 'betting', PLAYING: 'playing', DONE: 'done' };

export default function Blackjack() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const lang = useLang();
  const _s = (() => { try { return JSON.parse(sessionStorage.getItem('bj_state') || 'null'); } catch { return null; } })();

  // Si on revient en phase PLAYING → on continue la main
  // Si on revient en phase DONE → on remet à zéro (nouvelle mise)
  const restoredPhase = _s?.phase === PHASES.DONE ? PHASES.BETTING : (_s?.phase ?? PHASES.BETTING);

  const [bet, setBet] = useState(_s?.bet ?? '');
  const [deck, setDeck] = useState(_s?.deck ?? []);
  const [hands, setHands] = useState(restoredPhase === PHASES.BETTING ? [] : (_s?.hands ?? []));
  const [activeHandIdx, setActiveHandIdx] = useState(_s?.activeHandIdx ?? 0);
  const [dealerHand, setDealerHand] = useState(restoredPhase === PHASES.BETTING ? [] : (_s?.dealerHand ?? []));
  const [phase, setPhase] = useState(restoredPhase);
  const [outcomes, setOutcomes] = useState(_s?.outcomes ?? []);
  const [history, setHistory] = useState(_s?.history ?? []);
  const [doubled, setDoubled] = useState(_s?.doubled ?? false);
  const [splitDone, setSplitDone] = useState(_s?.splitDone ?? false);
  const [winPopup, setWinPopup] = useState(null);
  const [dealKey, setDealKey] = useState(0);

  // Auto-reset la table 2.5s après la fin d'une manche
  useEffect(() => {
    if (phase !== PHASES.DONE) return;
    const t = setTimeout(() => {
      setHands([]);
      setDealerHand([]);
      setOutcomes([]);
      setDoubled(false);
      setSplitDone(false);
      setPhase(PHASES.BETTING);
    }, 2500);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    sessionStorage.setItem('bj_state', JSON.stringify({ bet, deck, hands, activeHandIdx, dealerHand, phase, outcomes, history, doubled, splitDone }));
  }, [bet, deck, hands, activeHandIdx, dealerHand, phase, outcomes, history, doubled, splitDone]);

  const currentHand = hands[activeHandIdx] || [];
  const canDouble = phase === PHASES.PLAYING && currentHand.length === 2 && !doubled && credits >= bet;
  const canSplit = phase === PHASES.PLAYING && currentHand.length === 2 && !splitDone &&
    cardValue(currentHand[0]) === cardValue(currentHand[1]) && credits >= bet && hands.length === 1;

  const resolveHands = (allHands, dHand, deck_, betPerHand) => {
    let d = [...dHand];
    let deck__ = [...deck_];
    while (handTotal(d) < 17) d.push(deck__.shift());

    const dTotal = handTotal(d);
    let results = [];
    let totalProfit = 0;

    allHands.forEach(hand => {
      const pTotal = handTotal(hand);
      let result;
      if (pTotal > 21) result = 'bust';
      else if (pTotal === 21 && hand.length === 2 && allHands.length === 1) result = 'blackjack';
      else if (dTotal > 21 || pTotal > dTotal) result = 'win';
      else if (pTotal === dTotal) result = 'push';
      else result = 'lose';
      results.push(result);

      // win/blackjack: on rend la mise + profit (mise déjà déduite au départ)
      if (result === 'win') { setCredits(c => c + betPerHand * 2); totalProfit += betPerHand; }
      else if (result === 'blackjack') { const bj = betPerHand + Math.floor(betPerHand * 1.5); setCredits(c => c + bj); totalProfit += Math.floor(betPerHand * 1.5); }
      else if (result === 'push') { setCredits(c => c + betPerHand); } // remboursement
      // bust/lose: la mise est perdue (déjà déduite au départ, on ne fait rien)
    });

    setDealerHand(d);
    setDeck(deck__);
    setPhase(PHASES.DONE);
    setOutcomes(results);

    const wins = results.filter(r => r === 'win' || r === 'blackjack').length;
    if (wins > 0 && totalProfit > 0) {
      setWinPopup({ amount: fmt(totalProfit), ts: Date.now() });
    }

    setHistory(h => [{ results, totalProfit, ts: Date.now() }, ...h.slice(0, 7)]);
  };

  const startGame = useCallback(() => {
    if (bet <= 0 || bet > credits) return;
    setOutcomes([]);
    setDoubled(false);
    setSplitDone(false);
    setDealKey(k => k + 1);
    setCredits(c => c - bet);
    addXp(bet);
    playDealSound();
    const d = makeDeck();
    const p = [d.pop(), d.pop()];
    const dealer = [d.pop(), d.pop()];
    setDeck(d);
    setHands([p]);
    setActiveHandIdx(0);
    setDealerHand(dealer);
    setPhase(PHASES.PLAYING);

    if (handTotal(p) === 21) {
      resolveHands([p], dealer, d, bet);
    }
  }, [bet, credits]);

  const hit = () => {
    playHitSound();
    const newCard = deck[0];
    const newDeck = deck.slice(1);
    const newHand = [...currentHand, newCard];
    const newHands = hands.map((h, i) => i === activeHandIdx ? newHand : h);
    setHands(newHands);
    setDeck(newDeck);

    if (handTotal(newHand) >= 21) {
      if (activeHandIdx < newHands.length - 1) {
        setActiveHandIdx(activeHandIdx + 1);
      } else {
        resolveHands(newHands, dealerHand, newDeck, bet);
      }
    }
  };

  const stand = () => {
    if (activeHandIdx < hands.length - 1) {
      setActiveHandIdx(activeHandIdx + 1);
    } else {
      resolveHands(hands, dealerHand, deck, bet);
    }
  };

  const doubleDown = () => {
    if (!canDouble) return;
    setCredits(c => c - bet); // mise supplémentaire (1ère mise déjà déduite)
    setDoubled(true);
    const newCard = deck[0];
    const newDeck = deck.slice(1);
    const newHand = [...currentHand, newCard];
    const newHands = hands.map((h, i) => i === activeHandIdx ? newHand : h);
    setHands(newHands);
    setDeck(newDeck);
    // Auto-stand after double
    if (activeHandIdx < newHands.length - 1) {
      setActiveHandIdx(activeHandIdx + 1);
    } else {
      resolveHands(newHands, dealerHand, newDeck, bet * 2);
    }
  };

  const split = () => {
    if (!canSplit) return;
    setCredits(c => c - bet); // extra bet for second hand
    setSplitDone(true);
    const d = [...deck];
    const hand1 = [currentHand[0], d.shift()];
    const hand2 = [currentHand[1], d.shift()];
    setDeck(d);
    setHands([hand1, hand2]);
    setActiveHandIdx(0);
  };

  const reset = () => {
    setPhase(PHASES.BETTING);
    setHands([]);
    setDealerHand([]);
    setOutcomes([]);
    setDoubled(false);
    setSplitDone(false);
  };

  const dealerTotal = handTotal(dealerHand);

  const outcomeConfig = {
    win: { label: 'Victoire !', color: 'text-[#00e701]', bg: 'bg-[rgba(0,231,1,0.1)] border-[#00e701]/40' },
    blackjack: { label: 'BLACKJACK !', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/40' },
    lose: { label: 'Défaite', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/40' },
    bust: { label: 'Bust ! Défaite', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/40' },
    push: { label: 'Égalité', color: 'text-[#94a3b8]', bg: 'bg-secondary border-[#1a2a38]' },
  };

  return (
    <div className="space-y-6 fade-up max-w-4xl mx-auto px-2 py-4" style={{ fontFamily: 'monospace' }}>
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={() => setWinPopup(null)} />}

      <div className="text-center">
        <h1 className="font-orbitron text-4xl font-black" style={{ color: '#00e701', textShadow: '0 0 20px #00e70199' }}>
          BLACKJACK
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.35)' }} className="mt-1 text-sm">Atteignez 21 sans dépasser le dealer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-3 sm:space-y-4 order-last lg:order-first">
          <div className="rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0d1a12 0%, #0a1a0a 50%, #0d1510 100%)', border: '1px solid rgba(0,255,102,0.12)', boxShadow: '0 4px 40px rgba(0,0,0,0.6)' }}>

            {/* Outcome banners */}
            {outcomes.length > 0 && (
              <div className="fade-up space-y-2">
                {hands.map((hand, i) => {
                  const o = outcomes[i];
                  if (!o) return null;
                  const cfg = outcomeConfig[o];
                  return (
                    <div key={i} className={`flex items-center justify-center gap-3 rounded-xl border p-3 ${cfg.bg}`}>
                      <span className={`font-orbitron font-bold text-lg ${cfg.color}`}>
                        {hands.length > 1 ? `Main ${i + 1} : ` : ''}{cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Dealer */}
            {dealerHand.length > 0 && (
              <HandDisplay
                label="Dealer"
                hand={dealerHand}
                hideSecond={phase === PHASES.PLAYING}
                total={phase === PHASES.PLAYING ? cardValue(dealerHand[0]) : dealerTotal}
              />
            )}

            {/* Separator */}
            {dealerHand.length > 0 && hands.length > 0 && (
              <div className="border-t border-[#1a2a38/40]" />
            )}

            {/* Player hands */}
            <div className={hands.length > 1 ? 'flex gap-3' : ''}>
              {hands.map((hand, i) => (
                <HandDisplay
                  key={i}
                  label={hands.length > 1 ? `Main ${i + 1}` : 'Vous'}
                  hand={hand}
                  hideSecond={false}
                  total={handTotal(hand)}
                  active={phase === PHASES.PLAYING && i === activeHandIdx}
                />
              ))}
            </div>

            {hands.length === 0 && (
              <div className="text-center py-16 text-[#94a3b8]">
                <p className="font-semibold text-lg" style={{ color: 'rgba(255,255,255,0.2)' }}>Placez votre mise et commencez</p>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-3 sm:space-y-4 order-first lg:order-last">
          {/* Controls */}
          <div className="rounded-2xl p-4 sm:p-5 space-y-3"
            style={{ background: '#0D0D0D', border: '1px solid rgba(0,255,102,0.15)' }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{t(lang, 'dice_bet_label')}</p>
            <input
              type="number" value={bet} min={0} max={credits} placeholder="0"
              onChange={e => setBet(Number(e.target.value))}
              disabled={phase === PHASES.PLAYING}
              className="w-full rounded-xl px-4 py-3 font-orbitron font-bold text-xl text-center focus:outline-none disabled:opacity-40"
              style={{ background: 'rgba(0,255,102,0.06)', border: '1.5px solid rgba(0,255,102,0.35)', color: '#00e701', fontFamily: 'monospace' }}
            />
            <div className="grid grid-cols-3 gap-2">
              {[[t(lang, 'dice_half'), () => setBet(Math.max(1, Math.floor(bet / 2)))], [t(lang, 'dice_double'), () => setBet(Math.min(credits, Math.floor(bet * 2)))], [t(lang, 'dice_max'), () => setBet(credits)]].map(([label, fn]) => (
                <button key={label} disabled={phase === PHASES.PLAYING} onClick={fn}
                  className="py-2 rounded-xl font-bold text-xs disabled:opacity-30 transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)' }}>
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {!isAuthenticated ? (
                <button onClick={navigateToLogin}
                  className="w-full py-3 rounded-xl font-orbitron font-black text-base tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #00e701, #00CC55)', color: '#000', boxShadow: '0 0 20px rgba(0,255,102,0.4)' }}>
                  <Lock className="w-4 h-4 inline mr-2" /> Se connecter pour jouer
                </button>
              ) : (
              <>
              {phase === PHASES.BETTING && (
                <button onClick={startGame} disabled={bet > credits}
                  className="w-full py-3 rounded-xl font-orbitron font-black text-base tracking-widest disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #00e701, #00CC55)', color: '#000', boxShadow: '0 0 20px rgba(0,255,102,0.4)' }}>
                  BET
                </button>
              )}
              {phase === PHASES.PLAYING && (
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={hit}
                    className="py-3 rounded-xl font-orbitron font-black text-sm transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #00e701, #00CC55)', color: '#000', boxShadow: '0 0 16px rgba(0,255,102,0.35)' }}>
                    HIT +
                  </button>
                  <button onClick={stand}
                    className="py-3 rounded-xl font-orbitron font-black text-sm transition-all hover:scale-[1.02] active:scale-95"
                    style={{ background: 'rgba(0,255,102,0.08)', border: '2px solid rgba(0,255,102,0.4)', color: '#00e701' }}>
                    STAND
                  </button>
                  {canDouble && (
                    <button onClick={doubleDown}
                      className="py-3 rounded-xl font-orbitron font-black text-sm transition-all hover:scale-[1.02] active:scale-95"
                      style={{ background: 'rgba(255,215,0,0.08)', border: '2px solid rgba(255,215,0,0.4)', color: '#FFD700' }}>
                      DOUBLE
                    </button>
                  )}
                  {canSplit && (
                    <button onClick={split}
                      className="py-3 rounded-xl font-orbitron font-black text-sm transition-all hover:scale-[1.02] active:scale-95"
                      style={{ background: 'rgba(168,85,247,0.08)', border: '2px solid rgba(168,85,247,0.4)', color: '#c084fc' }}>
                      SPLIT
                    </button>
                  )}
                </div>
              )}
              {phase === PHASES.DONE && (
                <button onClick={startGame} disabled={bet > credits}
                  className="w-full py-3 rounded-xl font-orbitron font-black text-base tracking-widest disabled:opacity-40 transition-all hover:scale-[1.02] active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #00e701, #00CC55)', color: '#000', boxShadow: '0 0 20px rgba(0,255,102,0.4)' }}>
                  BET
                </button>
              )}
              </>
              )}
            </div>
          </div>
          <div className="rounded-2xl p-4 sm:p-5"
            style={{ background: '#0D0D0D', border: '1px solid rgba(0,255,102,0.12)' }}>
            <h3 className="font-orbitron font-bold mb-3 text-xs" style={{ color: '#00e701' }}>RÈGLES</h3>
            <ul className="space-y-1.5 text-[10px] sm:text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <li>• Atteignez 21 ou battez le dealer</li>
              <li>• As vaut 1 ou 11</li>
              <li>• J, Q, K valent 10</li>
              <li>• Le dealer tire jusqu'à 17</li>
              <li>• Blackjack paie ×1.5</li>
              <li>• <span style={{ color: '#FFD700' }}>Double</span> : ×2 mise, 1 carte</li>
              <li>• <span style={{ color: '#c084fc' }}>Split</span> : sépare 2 cartes égales</li>
            </ul>
          </div>

          <div className="rounded-2xl p-4 sm:p-5"
            style={{ background: '#0D0D0D', border: '1px solid rgba(0,255,102,0.12)' }}>
            <h3 className="font-orbitron font-bold mb-3 text-xs" style={{ color: '#00e701' }}>HISTORIQUE</h3>
            {history.length === 0 ? (
              <p className="text-[10px] sm:text-xs text-center py-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Aucune partie</p>
            ) : (
              <div className="space-y-1.5">
                {history.map(({ results, totalProfit, ts }) => (
                  <div key={ts} className="flex items-center justify-between rounded-lg px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[10px] sm:text-xs font-semibold font-orbitron"
                      style={{ color: results.every(r => r === 'lose') ? '#FF4444' : results.includes('win') || results.includes('blackjack') ? '#00e701' : '#aaa' }}>
                      {results.map(r => r === 'blackjack' ? 'BJ' : r === 'win' ? '✓' : r === 'lose' ? '✗' : '=').join(' ')}
                    </span>
                    <span className="font-orbitron text-xs sm:text-sm font-bold"
                      style={{ color: totalProfit > 0 ? '#00e701' : totalProfit < 0 ? '#FF4444' : '#aaa' }}>
                      {totalProfit > 0 ? '+' : ''}{totalProfit}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dealCard {
          from { opacity: 0; transform: translateY(-30px) rotateY(-90deg) scale(0.8); }
          50%  { transform: translateY(-10px) rotateY(-20deg) scale(1.05); }
          to   { opacity: 1; transform: translateY(0) rotateY(0deg) scale(1); }
        }
        .deal-anim { animation: dealCard 0.4s ease-out forwards; perspective: 800px; }
      `}</style>
    </div>
  );
}