import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { saveRound } from '../lib/saveRound';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import WinPopup from '../components/WinPopup';
import { playAscendingTone, playCrashSound, playDealSound, playHitSound } from '../lib/soundEffects';

const BULL = '#0ecb81';
const BEAR = '#f6465d';
const GOLD = '#f0b90b';
const TXT  = '#eaecef';
const TXT2 = '#848e9c';
const TXT3 = '#5e6673';
const BG1  = '#0b0e11';
const BG2  = '#181c22';
const BG3  = '#2b3139';
const BRD  = '#2b3139';

const DURATION    = 45_000;   // 45 secondes — on prend le temps
const TICK_MS     = 1000;     // 1 tick par seconde — lisible
const LIQ         = 0.50;
const P0          = 100;
const TOTAL_TICKS = Math.floor(DURATION / TICK_MS); // 45 ticks

/* ── NEWS ── */
const IMPACT_NEWS = [
  // Crypto
  { t: 'Cazyno Coin listé sur Binance — volume en hausse de 340%', bias: +1 },
  { t: 'Visa intègre Cazyno Coin dans son réseau mondial de paiement', bias: +1 },
  { t: 'BlackRock dépose officiellement un ETF Cazyno Coin auprès de la SEC', bias: +1 },
  { t: 'Samsung ajoute CZN dans Samsung Pay — 200 millions d\'utilisateurs', bias: +1 },
  { t: 'CZN dépasse Solana en capitalisation boursière totale', bias: +1 },
  { t: 'La Fed annonce une baisse surprise des taux de 50 points de base', bias: +1 },
  { t: 'Apple accepte désormais les paiements en Cazyno Coin sur l\'App Store', bias: +1 },
  { t: 'Elon Musk tweete « CZN to the moon » — le cours explose', bias: +1 },
  { t: 'Le gouvernement du Japon reconnaît CZN comme monnaie légale', bias: +1 },
  { t: 'Amazon annonce l\'intégration de CZN comme moyen de paiement', bias: +1 },
  { t: 'Un wallet dormant de 50 000 BTC se réveille et convertit tout en CZN', bias: +1 },
  { t: 'Goldman Sachs lance un fonds d\'investissement 100% Cazyno Coin', bias: +1 },
  // Bearish crypto
  { t: 'Faille de sécurité critique détectée sur le réseau Cazyno Coin', bias: -1 },
  { t: 'La SEC engage des poursuites judiciaires contre CZN Labs', bias: -1 },
  { t: 'Whale Alert — Transfert de 2.4 millions de CZN vers un exchange', bias: -1 },
  { t: 'Bug de reentrancy détecté dans le smart contract principal de CZN', bias: -1 },
  { t: 'La Chine annonce l\'interdiction totale des transactions en CZN', bias: -1 },
  { t: 'Tether annonce le retrait immédiat de la paire CZN/USDT', bias: -1 },
  { t: 'Le fondateur de CZN Labs arrêté pour fraude fiscale à Dubaï', bias: -1 },
  { t: 'Binance gèle tous les retraits CZN suite à une activité suspecte', bias: -1 },
  { t: 'Un exchange majeur se fait hacker — 800M$ de CZN volés', bias: -1 },
  { t: 'L\'Union Européenne vote l\'interdiction du trading de CZN pour les particuliers', bias: -1 },
  { t: 'Le FBI saisit 120 000 CZN liés à un réseau de blanchiment', bias: -1 },
  { t: 'Rumeur de rug pull — le CEO de CZN Labs supprime tous ses réseaux sociaux', bias: -1 },
  // Géopolitique bullish
  { t: 'Accord de paix historique au Moyen-Orient — les marchés s\'envolent', bias: +1 },
  { t: 'L\'OPEP annonce une hausse de production — le pétrole chute, la crypto monte', bias: +1 },
  { t: 'La Russie lève les sanctions sur les crypto-actifs pour les citoyens', bias: +1 },
  { t: 'Le FMI recommande officiellement les crypto-monnaies aux pays émergents', bias: +1 },
  // Géopolitique bearish
  { t: 'Tensions militaires en mer de Chine — les marchés mondiaux paniquent', bias: -1 },
  { t: 'La Russie coupe le gaz à l\'Europe — crash généralisé des marchés', bias: -1 },
  { t: 'Cyberattaque massive sur le réseau bancaire SWIFT — panique mondiale', bias: -1 },
  { t: 'Le dollar atteint un plus haut historique — les crypto s\'effondrent', bias: -1 },
  // WTF / faits divers / addictif
  { t: 'DERNIÈRE HEURE — De nouveaux documents Epstein déclassifiés mentionnent des transactions en crypto', bias: -1 },
  { t: 'Un trader anonyme transforme 500€ en 12 millions grâce au CZN en 48h', bias: +1 },
  { t: 'Le Prince de Dubaï investit personnellement 2 milliards dans Cazyno Coin', bias: +1 },
  { t: 'WikiLeaks publie des documents sur un programme secret de la CIA lié aux crypto', bias: -1 },
  { t: 'Un adolescent de 16 ans devient milliardaire grâce au trading de CZN', bias: +1 },
  { t: 'Scandale — Un sénateur américain surpris en train d\'acheter du CZN avant un vote favorable', bias: +1 },
  { t: 'Panne mondiale d\'internet pendant 4 minutes — panique sur les marchés crypto', bias: -1 },
  { t: 'Elon Musk annonce que SpaceX acceptera uniquement le CZN pour les vols spatiaux', bias: +1 },
  { t: 'Le Vatican confirme détenir un portefeuille crypto de 500M€ dont du CZN', bias: +1 },
  { t: 'EXCLUSIF — Documents fuités : une banque suisse convertit ses réserves d\'or en CZN', bias: +1 },
  { t: 'Un mystérieux wallet envoie 1 CZN à chaque député français — enquête ouverte', bias: -1 },
  { t: 'Le cartel de Sinaloa utilisait CZN pour blanchir 3 milliards par an selon le DOJ', bias: -1 },
  { t: 'Drake perd 4 millions en CZN en live sur Twitch — le cours chute', bias: -1 },
  { t: 'Un bug dans ChatGPT recommande d\'acheter du CZN — le cours bondit de 8%', bias: +1 },
  { t: 'RUMEUR — Satoshi Nakamoto serait le fondateur anonyme de Cazyno Coin', bias: +1 },
  { t: 'La liste noire de Diddy mentionnerait des paiements en crypto-monnaies', bias: -1 },
  { t: 'Un data leak révèle que 40% des parlementaires européens détiennent du CZN', bias: +1 },
  { t: 'Mark Zuckerberg aperçu à une conférence Cazyno Coin à Singapour', bias: +1 },
  { t: 'Le gouvernement du Salvador remplace le Bitcoin par le CZN comme monnaie nationale', bias: +1 },
  { t: 'Joe Rogan consacre un épisode entier de 3h au Cazyno Coin — le cours explose', bias: +1 },
];
const NEUTRAL_NEWS = [
  'Le Bitcoin se stabilise autour des 97 000$ en ce début de semaine',
  'Ethereum 2.0 — La mise à jour Dencun se déroule sans incident majeur',
  'Le volume global des DEX atteint 180 milliards de dollars ce mois-ci',
  'Coinbase annonce l\'ouverture de nouveaux bureaux à Paris et Berlin',
  'Le marché NFT reprend des couleurs avec +12% sur 7 jours',
  'Tether publie un audit complet et certifié de ses réserves en dollars',
  'La BCE publie son rapport trimestriel sur la régulation des crypto-actifs',
  'MicroStrategy achète 3 200 BTC supplémentaires pour sa trésorerie',
  'Le staking ETH dépasse les 34 millions d\'ETH verrouillés sur le réseau',
  'Polygon déploie son zkEVM mainnet avec plus de 50 dApps partenaires',
  'Le hashrate du réseau Bitcoin atteint un nouveau record historique',
  'Uniswap V4 déployé simultanément sur 6 blockchains différentes',
  'Le Salvador ajoute 200 BTC supplémentaires à ses réserves nationales',
  'L\'Inde publie un nouveau cadre réglementaire favorable aux exchanges',
  'Ripple remporte une victoire décisive en appel contre la SEC',
  'La capitalisation totale du marché crypto dépasse les 4 000 milliards de dollars',
  'Binance enregistre un volume record de 48 milliards en 24h',
  'Le nombre de wallets actifs sur Ethereum dépasse les 100 millions',
  'L\'Argentine lance une consultation publique sur la régulation des crypto-actifs',
  'Le premier distributeur de CZN installé à Times Square, New York',
  'Le cours de l\'or atteint 2 800$/oz — les investisseurs diversifient en crypto',
  'La Banque du Japon étudie l\'intégration des stablecoins dans son système de paiement',
  'Le Nigéria devient le 3ème pays au monde en adoption crypto derrière l\'Inde et les USA',
  'OpenAI annonce un partenariat avec un exchange crypto pour les paiements API',
  'Le Super Bowl 2026 diffuse la première publicité pour une crypto-monnaie',
  'La Suisse autorise le paiement des impôts en crypto dans le canton de Zoug',
  'Le prix du gaz Ethereum tombe sous 1 gwei pour la première fois depuis 2021',
  'Tesla publie ses résultats : 1.2 milliard de gains non réalisés en crypto',
  'Un musée du Louvre accepte désormais les dons en Bitcoin et Ethereum',
  'La bourse de Tokyo lance un indice dédié aux crypto-actifs asiatiques',
];

function gauss() {
  const u = Math.random(), v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function generateRound() {
  // 3-5 normal impacts + 1-2 big — beaucoup de news
  const impactCount = 3 + Math.floor(Math.random() * 3);
  const pool = [...IMPACT_NEWS].sort(() => Math.random() - 0.5).slice(0, impactCount);
  const events = pool.map((n, i) => ({
    ...n, tick: 4 + Math.floor(Math.random() * (TOTAL_TICKS - 8)),
    magnitude: n.bias * (0.02 + Math.random() * 0.02),
    big: false, id: i,
  }));
  // 1-2 BIG bumps
  const bigCount = 1 + Math.floor(Math.random() * 2);
  for (let b = 0; b < bigCount; b++) {
    const bigNews = IMPACT_NEWS[Math.floor(Math.random() * IMPACT_NEWS.length)];
    events.push({
      ...bigNews, tick: 6 + Math.floor(Math.random() * (TOTAL_TICKS - 12)),
      magnitude: bigNews.bias * (0.06 + Math.random() * 0.06),
      big: true, id: impactCount + b,
    });
  }
  events.sort((a, b) => a.tick - b.tick);

  // Generate prices
  const prices = [P0];
  let p = P0;
  for (let i = 1; i <= TOTAL_TICKS; i++) {
    let move = gauss() * 0.004; // small per-tick noise
    for (const ev of events) {
      if (ev.tick === i) move += ev.magnitude;
      if (ev.tick === i - 1) move += ev.magnitude * 0.4;
      if (ev.tick === i - 2) move += ev.magnitude * 0.2;
      if (ev.tick === i - 3) move += ev.magnitude * 0.1;
    }
    p = Math.max(15, Math.min(600, p * (1 + move)));
    prices.push(parseFloat(p.toFixed(2)));
  }
  return { prices, events };
}

function buildTicker() {
  const items = [];
  const ns = [...NEUTRAL_NEWS].sort(() => Math.random() - 0.5);
  const is2 = [...IMPACT_NEWS].sort(() => Math.random() - 0.5);
  let ni = 0, ii = 0;
  for (let i = 0; i < 24; i++) {
    if (i % 6 === 4 && ii < is2.length) {
      const n = is2[ii++];
      items.push({ text: n.t, type: n.bias > 0 ? 'bull' : 'bear' });
    } else {
      items.push({ text: ns[ni % ns.length], type: 'neutral' });
      ni++;
    }
  }
  return items;
}

export default function Trader() {
  const { credits, setCredits, addXp } = useOutletContext();

  const savedBet = (() => { try { return JSON.parse(sessionStorage.getItem('trader_bet')); } catch { return null; } })();
  const [bet, setBet] = useState(savedBet ?? 50);
  useEffect(() => { sessionStorage.setItem('trader_bet', JSON.stringify(bet)); }, [bet]);

  const [dir, setDir]         = useState('long');
  const [gs, setGs]           = useState('idle');
  const [price, setPrice]     = useState(P0);
  const [mult, setMult]       = useState(1);
  const [pnl, setPnl]         = useState(0);
  const [pnlPct, setPnlPct]   = useState(0);
  const [history, setHistory] = useState([]);
  const [winPop, setWinPop]   = useState(null);
  const [shake, setShake]     = useState(false);
  const [flash, setFlash]     = useState(false);
  // Ticker bar alert state
  const [barAlert, setBarAlert] = useState(null); // { text, bias, big }

  const [ticker] = useState(() => buildTicker());

  const roundRef = useRef(null);
  const timerRef = useRef(null);
  const gsR      = useRef('idle');
  const betR     = useRef(bet);
  const dirR     = useRef('long');
  const tickR    = useRef(0);
  const cvs      = useRef(null);
  const dprRef   = useRef(1);

  useEffect(() => { betR.current = bet; }, [bet]);
  useEffect(() => { dirR.current = dir; }, [dir]);

  // Retina
  useEffect(() => {
    const c = cvs.current; if (!c) return;
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = BG1;
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  /* ═══════ CANVAS ═══════ */
  const draw = useCallback((currentTick) => {
    const c = cvs.current; if (!c) return;
    const round = roundRef.current; if (!round) return;
    const ctx = c.getContext('2d');
    const dpr = dprRef.current;
    const W = c.width / dpr;
    const H = c.height / dpr;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = BG1;
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = BRD + '60';
    ctx.lineWidth = 0.5;
    for (let i = 1; i < 5; i++) { const y = (i / 5) * H; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let i = 1; i < 10; i++) { const x = (i / 10) * W; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

    const vis = round.prices.slice(0, currentTick + 1);
    if (vis.length < 2) return;

    const cp = vis[vis.length - 1];
    const d = dirR.current;
    const pad = { l: 52, r: 10, t: 12, b: 22 };

    // Stable viewport using all known prices + 1 ahead
    const known = round.prices.slice(0, Math.min(currentTick + 4, round.prices.length));
    const dMin = Math.min(...known);
    const dMax = Math.max(...known);
    const range = Math.max(dMax - dMin, 3);
    const ctr = (dMax + dMin) / 2;
    const vMin = ctr - range * 0.72;
    const vMax = ctr + range * 0.72;

    const toX = i => pad.l + (i / TOTAL_TICKS) * (W - pad.l - pad.r);
    const toY = p => pad.t + ((vMax - p) / (vMax - vMin)) * (H - pad.t - pad.b);

    const inProfit = d === 'long' ? cp >= P0 : cp <= P0;
    const lineC = inProfit ? BULL : BEAR;

    // Points
    const pts = vis.map((p, i) => ({ x: toX(i), y: toY(p) }));

    // Cardinal spline
    function spline(points) {
      const tension = 0.18;
      ctx.moveTo(points[0].x, points[0].y);
      if (points.length === 2) { ctx.lineTo(points[1].x, points[1].y); return; }
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[Math.max(i - 1, 0)];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[Math.min(i + 2, points.length - 1)];
        ctx.bezierCurveTo(
          p1.x + (p2.x - p0.x) * tension, p1.y + (p2.y - p0.y) * tension,
          p2.x - (p3.x - p1.x) * tension, p2.y - (p3.y - p1.y) * tension,
          p2.x, p2.y
        );
      }
    }

    // Area
    const entryY = toY(P0);
    const aGrad = ctx.createLinearGradient(0, 0, 0, H);
    aGrad.addColorStop(0, lineC + '0e');
    aGrad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, entryY);
    ctx.lineTo(pts[0].x, pts[0].y);
    spline(pts);
    ctx.lineTo(pts[pts.length - 1].x, entryY);
    ctx.closePath();
    ctx.fillStyle = aGrad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = lineC;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    spline(pts);
    ctx.stroke();

    // Dot
    const last = pts[pts.length - 1];
    ctx.beginPath();
    ctx.fillStyle = lineC;
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = lineC + '35';
    ctx.lineWidth = 1.5;
    ctx.arc(last.x, last.y, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Dashed price → right
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = lineC + '25';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(last.x + 10, last.y); ctx.lineTo(W, last.y); ctx.stroke();

    // Entry
    ctx.strokeStyle = TXT3 + '18';
    if (entryY > pad.t && entryY < H - pad.b) {
      ctx.beginPath(); ctx.moveTo(pad.l, entryY); ctx.lineTo(W, entryY); ctx.stroke();
    }

    // Liq
    const liqP = d === 'long' ? P0 * LIQ : P0 * (2 - LIQ);
    const liqY = toY(liqP);
    if (liqY > pad.t - 5 && liqY < H - pad.b + 5) {
      ctx.strokeStyle = BEAR + '18';
      ctx.beginPath(); ctx.moveTo(pad.l, liqY); ctx.lineTo(W, liqY); ctx.stroke();
    }
    ctx.setLineDash([]);

    // Y labels
    ctx.fillStyle = TXT3;
    ctx.font = '10px monospace';
    const yS = range > 30 ? 10 : range > 12 ? 5 : range > 5 ? 2 : 1;
    for (let p = Math.ceil(vMin / yS) * yS; p <= vMax; p += yS) {
      const y = toY(p);
      if (y > pad.t + 6 && y < H - pad.b - 4) ctx.fillText(p.toFixed(1), 4, y + 4);
    }

    // Price tag
    const cpY = toY(cp);
    if (cpY > 2 && cpY < H - 2) {
      const tw = 52, th = 18, rx = W - tw, ry = cpY - th / 2, r = 3;
      ctx.fillStyle = lineC;
      ctx.beginPath();
      ctx.moveTo(rx + r, ry); ctx.lineTo(rx + tw - r, ry); ctx.arcTo(rx + tw, ry, rx + tw, ry + r, r);
      ctx.lineTo(rx + tw, ry + th - r); ctx.arcTo(rx + tw, ry + th, rx + tw - r, ry + th, r);
      ctx.lineTo(rx + r, ry + th); ctx.arcTo(rx, ry + th, rx, ry + th - r, r);
      ctx.lineTo(rx, ry + r); ctx.arcTo(rx, ry, rx + r, ry, r);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(cp.toFixed(2), rx + 4, cpY + 4);
    }

    // X
    ctx.fillStyle = TXT3 + '80';
    ctx.font = '9px monospace';
    for (let i = 0; i <= TOTAL_TICKS; i += 10) {
      const x = toX(i);
      if (x > pad.l + 8) ctx.fillText(Math.round(i * TICK_MS / 1000) + 's', x - 5, H - 4);
    }
  }, []);

  /* ═══════ START ═══════ */
  const startRound = () => {
    if (!bet || bet < 1 || bet > credits) return;
    clearInterval(timerRef.current);
    betR.current = bet; dirR.current = dir;
    setCredits(c => c - bet);
    addXp(bet);

    const round = generateRound();
    roundRef.current = round;
    tickR.current = 0;
    gsR.current = 'playing';
    setGs('playing');
    setPrice(P0); setMult(1); setPnl(0); setPnlPct(0); setBarAlert(null);
    draw(0);

    timerRef.current = setInterval(() => {
      if (gsR.current !== 'playing') return;
      tickR.current += 1;
      const t = tickR.current;
      const p = round.prices[t];

      // Check events → push to bottom bar
      for (const ev of round.events) {
        if (ev.tick === t) {
          playDealSound();
          setBarAlert({ text: ev.t, bias: ev.bias, big: ev.big, ts: Date.now(), id: ev.id });
          const duration = ev.big ? 10000 : 8000; // 8-10s pour lire tranquille
          setTimeout(() => setBarAlert(prev => prev && prev.id === ev.id ? null : prev), duration);
        }
      }

      const d = dirR.current;
      const ch = (p - P0) / P0;
      const m = Math.max(0, Math.min(5, 1 + (d === 'long' ? ch : -ch)));
      const b = betR.current;

      setPrice(p); setMult(m);
      setPnl(parseFloat((b * m - b).toFixed(2)));
      setPnlPct(parseFloat(((m - 1) * 100).toFixed(1)));
      draw(t);

      if (m <= LIQ) { endRound('liquidated', 0); return; }
      if (t >= TOTAL_TICKS) { endRound(m >= 1 ? 'won' : 'lost', m); }
    }, TICK_MS);
  };

  const cashOut = () => {
    if (gsR.current !== 'playing') return;
    const p = roundRef.current.prices[tickR.current];
    const ch = (p - P0) / P0;
    const m = Math.max(0, Math.min(5, 1 + (dirR.current === 'long' ? ch : -ch)));
    endRound(m >= 1 ? 'won' : 'lost', m);
  };

  const endRound = (state, m) => {
    clearInterval(timerRef.current);
    gsR.current = state; setGs(state);
    const b = betR.current, d = dirR.current;
    let profit;
    if (state === 'liquidated') {
      profit = -b; playCrashSound();
      setShake(true); setFlash(true);
      setTimeout(() => { setShake(false); setFlash(false); }, 700);
    } else {
      const win = parseFloat((b * m).toFixed(2));
      profit = parseFloat((win - b).toFixed(2));
      setCredits(c => c + win);
      if (profit > 0) { playAscendingTone(); setWinPop({ amount: profit.toFixed(2), ts: Date.now() }); }
      else playHitSound();
    }
    draw(tickR.current);
    saveRound({ game: 'Trader', bet: b, result: `${d.toUpperCase()} x${(m || 0).toFixed(2)} — ${state.toUpperCase()}`, profit });
    setHistory(h => [{ dir: d, pct: parseFloat(((m - 1) * 100).toFixed(1)), won: state === 'won', liq: state === 'liquidated', ts: Date.now() }, ...h.slice(0, 19)]);
  };

  const reset = () => {
    clearInterval(timerRef.current);
    roundRef.current = null; tickR.current = 0;
    gsR.current = 'idle'; setGs('idle'); setPrice(P0); setMult(1); setPnl(0); setPnlPct(0); setBarAlert(null);
    const c = cvs.current;
    if (c) { const ctx = c.getContext('2d'); const d = dprRef.current; ctx.fillStyle = BG1; ctx.fillRect(0, 0, c.width / d, c.height / d); }
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const canBet  = gs === 'idle' || gs === 'won' || gs === 'lost' || gs === 'liquidated';
  const playing = gs === 'playing';
  const ended   = gs === 'won' || gs === 'lost' || gs === 'liquidated';
  const bull    = mult >= 1;
  const clr     = bull ? BULL : BEAR;
  const timeLeft = Math.max(0, (TOTAL_TICKS - tickR.current) * TICK_MS);

  return (
    <div className="fade-up max-w-6xl mx-auto px-1 sm:px-2 py-2 flex flex-col" style={{ fontFamily: 'monospace' }}>
      {winPop && <WinPopup key={winPop.ts} amount={winPop.amount} onClose={() => setWinPop(null)} />}

      {/* HEADER */}
      <div className="flex items-center justify-between px-3 py-2.5 mb-2 rounded-lg" style={{ background: BG2, border: `1px solid ${BRD}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: GOLD + '18', border: `1.5px solid ${GOLD}40` }}>
            <span className="text-base font-black" style={{ color: GOLD }}>C</span>
          </div>
          <div className="mr-2">
            <p className="font-bold text-[15px] leading-none" style={{ color: TXT }}>Cazyno Coin</p>
            <p className="text-[10px] leading-none mt-1" style={{ color: TXT3 }}>CZN / USD · Perpetual</p>
          </div>
          <div className="h-7 w-px hidden sm:block" style={{ background: BRD }} />
          <div className="hidden sm:flex items-center gap-5 ml-1">
            <div>
              <p className="text-[9px] leading-none" style={{ color: TXT3 }}>Prix</p>
              <p className="text-[15px] font-bold leading-none mt-0.5" style={{ color: clr }}>{price.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[9px] leading-none" style={{ color: TXT3 }}>24h</p>
              <p className="text-xs font-bold leading-none mt-0.5" style={{ color: clr }}>{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</p>
            </div>
          </div>
        </div>
        <div className="flex gap-1 items-center">
          {history.slice(0, 5).map((h, i) => (
            <span key={i} className="px-2 py-1 rounded text-[9px] font-bold"
              style={{ background: h.liq ? BEAR + '18' : h.won ? BULL + '12' : BEAR + '12', color: h.liq ? BEAR : h.won ? BULL : BEAR }}>
              {h.liq ? 'LIQ' : `${h.pct >= 0 ? '+' : ''}${h.pct}%`}
            </span>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 flex-1 min-h-0">

        {/* CHART */}
        <div className={`lg:col-span-3 rounded-xl overflow-hidden relative flex flex-col ${shake ? 'animate-shake' : ''}`}
          style={{ background: BG1, border: `1px solid ${BRD}`, minHeight: 400 }}>

          {playing && (
            <div className="absolute top-0 left-0 h-[3px] z-20 rounded-r-full"
              style={{ width: `${(timeLeft / DURATION) * 100}%`, background: GOLD, transition: `width ${TICK_MS}ms linear` }} />
          )}

          {/* Chart bar */}
          <div className="flex items-center justify-between px-3 py-1.5 shrink-0" style={{ borderBottom: `1px solid ${BRD}60`, background: BG2 + '60' }}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold" style={{ color: TXT2 }}>CZN/USD</span>
              {(playing || ended) && (
                <span className="text-[9px] px-2 py-0.5 rounded font-bold"
                  style={{ background: (dirR.current === 'long' ? BULL : BEAR) + '18', color: dirR.current === 'long' ? BULL : BEAR }}>
                  {dirR.current === 'long' ? '↑ LONG' : '↓ SHORT'}
                </span>
              )}
              {playing && <span className="text-[10px] font-bold" style={{ color: clr }}>PNL {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}€</span>}
            </div>
            {playing && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                style={{ background: timeLeft < 5000 ? BEAR + '18' : BG3, color: timeLeft < 5000 ? BEAR : TXT2 }}>
                {Math.ceil(timeLeft / 1000)}s
              </span>
            )}
          </div>

          {/* Center overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            {gs === 'idle' && (
              <div className="text-center">
                <p className="font-bold text-[32px] leading-none" style={{ color: TXT3 + '15' }}>Cazyno Coin</p>
                <p className="text-[10px] mt-2" style={{ color: TXT3 + '40' }}>Sélectionne ta direction et ouvre ta position</p>
              </div>
            )}
            {gs === 'liquidated' && (
              <div className="text-center px-6 py-4 rounded-xl" style={{ background: BG1 + 'e8', border: `2px solid ${BEAR}40` }}>
                <AlertTriangle className="w-8 h-8 mx-auto mb-2" style={{ color: BEAR }} />
                <p className="font-bold text-sm tracking-wider" style={{ color: BEAR }}>LIQUIDATION</p>
                <p className="font-bold text-2xl mt-1" style={{ color: BEAR }}>-{betR.current.toFixed(2)} €</p>
              </div>
            )}
            {(gs === 'won' || gs === 'lost') && (
              <div className="text-center px-6 py-4 rounded-xl" style={{ background: BG1 + 'e8', border: `1px solid ${gs === 'won' ? BULL : BEAR}30` }}>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: gs === 'won' ? BULL : BEAR }}>Position fermée · x{mult.toFixed(2)}</p>
                <p className="font-bold text-2xl mt-1" style={{ color: gs === 'won' ? BULL : BEAR }}>{pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} €</p>
              </div>
            )}
          </div>

          {flash && <div className="absolute inset-0 z-30 pointer-events-none" style={{ background: BEAR + '10', animation: 'fadeIn 0.15s ease-out' }} />}

          <div className="flex-1 min-h-0">
            <canvas ref={cvs} className="w-full h-full" style={{ display: 'block', width: '100%', height: '100%', minHeight: 340 }} />
          </div>
        </div>

        {/* CONTROLS */}
        <div className="space-y-2 order-first lg:order-last">
          <div className="rounded-xl overflow-hidden" style={{ background: BG2, border: `1px solid ${BRD}` }}>
            <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: `1px solid ${BRD}` }}>
              <span className="text-[11px] font-bold" style={{ color: TXT }}>Ordre</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: GOLD + '12', color: GOLD }}>PERP × 2</span>
            </div>
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-2 rounded-lg overflow-hidden" style={{ border: `1px solid ${BRD}` }}>
                <button onClick={() => canBet && setDir('long')}
                  className="py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  style={{ background: dir === 'long' ? BULL + '18' : 'transparent', color: dir === 'long' ? BULL : TXT3, borderRight: `1px solid ${BRD}` }}>
                  <TrendingUp className="w-3.5 h-3.5" /> Long
                </button>
                <button onClick={() => canBet && setDir('short')}
                  className="py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  style={{ background: dir === 'short' ? BEAR + '18' : 'transparent', color: dir === 'short' ? BEAR : TXT3 }}>
                  <TrendingDown className="w-3.5 h-3.5" /> Short
                </button>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px]" style={{ color: TXT3 }}>Montant</span>
                  <span className="text-[10px]" style={{ color: TXT3 }}>Solde: <b style={{ color: TXT2 }}>{credits.toFixed(0)}€</b></span>
                </div>
                <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${BRD}`, background: BG1 }}>
                  <span className="px-2 py-2 text-[10px] font-bold self-center" style={{ color: TXT3 }}>€</span>
                  <input type="number" value={bet || ''} min={1} disabled={!canBet} placeholder="0"
                    onChange={e => setBet(Math.max(1, Number(e.target.value) || 1))}
                    className="flex-1 bg-transparent px-1 py-2 text-sm font-bold text-right focus:outline-none disabled:opacity-40"
                    style={{ color: TXT }} />
                </div>
                <div className="flex gap-1 mt-1.5">
                  {[['25%', 0.25], ['50%', 0.5], ['75%', 0.75], ['Max', 1]].map(([l, p]) => (
                    <button key={l} disabled={!canBet} onClick={() => setBet(Math.max(1, Math.floor(credits * p)))}
                      className="flex-1 text-[9px] py-1 rounded font-bold disabled:opacity-25 hover:brightness-125"
                      style={{ background: BG3, color: TXT3 }}>{l}</button>
                  ))}
                </div>
              </div>
              {canBet ? (
                <button onClick={startRound} disabled={!bet || bet > credits}
                  className="w-full py-3 rounded-lg font-bold text-sm disabled:opacity-25 hover:brightness-110 active:scale-[0.98] transition-all"
                  style={{ background: dir === 'long' ? BULL : BEAR, color: '#fff' }}>
                  {dir === 'long' ? '↑ Ouvrir Long' : '↓ Ouvrir Short'}
                </button>
              ) : playing ? (
                <button onClick={cashOut}
                  className="w-full py-3 rounded-lg font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all"
                  style={{ background: GOLD, color: '#000' }}>Fermer la position</button>
              ) : (
                <button onClick={reset}
                  className="w-full py-3 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
                  style={{ background: BG3, color: TXT }}>Nouvelle position</button>
              )}
            </div>
          </div>

          {(playing || ended) && (
            <div className="rounded-xl overflow-hidden" style={{ background: BG2, border: `1px solid ${BRD}` }}>
              <div className="px-3 py-1.5" style={{ borderBottom: `1px solid ${BRD}` }}>
                <span className="text-[10px] font-bold" style={{ color: TXT2 }}>Position</span>
              </div>
              <div className="p-3 space-y-1.5">
                {[
                  ['Entrée', P0.toFixed(2), TXT2],
                  ['Mark Price', price.toFixed(2), clr],
                  ['PNL', `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} €`, clr],
                  ['ROI', `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(1)}%`, clr],
                  ['Liq. Price', (dirR.current === 'long' ? P0 * LIQ : P0 * (2 - LIQ)).toFixed(2), BEAR + '90'],
                ].map(([k, v, c]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[10px]" style={{ color: TXT3 }}>{k}</span>
                    <span className="text-[10px] font-bold" style={{ color: c }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ BOTTOM NEWS BAR — BBC STYLE ═══════ */}
      <div className="mt-2 rounded-lg overflow-hidden relative transition-all duration-300"
        style={{
          height: barAlert ? 52 : 36,
          background: barAlert ? (barAlert.bias > 0 ? BULL + '12' : BEAR + '12') : BG2,
          border: `1px solid ${barAlert ? (barAlert.bias > 0 ? BULL + '40' : BEAR + '40') : BRD}`,
        }}>

        {/* ALERT MODE — replaces ticker when an event fires */}
        {barAlert && (
          <div className="absolute inset-0 z-20 flex items-center px-4 gap-3"
            style={{ animation: 'alertSlide 0.3s ease-out' }}>
            {/* Colored left block — BBC style label */}
            <div className="shrink-0 px-3 py-1 rounded font-black text-[10px] uppercase tracking-wider"
              style={{
                background: barAlert.bias > 0 ? BULL : BEAR,
                color: '#fff',
              }}>
              {barAlert.big ? 'ALERTE' : barAlert.bias > 0 ? 'HAUSSE' : 'BAISSE'}
            </div>
            {/* News text */}
            <p className="text-[12px] font-semibold truncate flex-1"
              style={{ color: barAlert.bias > 0 ? BULL : BEAR }}>
              {barAlert.text}
            </p>
            {barAlert.big && (
              <span className="shrink-0 text-[9px] font-black px-2 py-1 rounded animate-pulse"
                style={{ background: (barAlert.bias > 0 ? BULL : BEAR) + '30', color: barAlert.bias > 0 ? BULL : BEAR }}>
                IMPACT MAJEUR
              </span>
            )}
          </div>
        )}

        {/* NORMAL TICKER — scrolling neutral news */}
        <div className={`flex items-center h-full whitespace-nowrap transition-opacity duration-300 ${barAlert ? 'opacity-0' : 'opacity-100'}`}>
          <div className="absolute inset-y-0 left-0 w-16 z-10" style={{ background: `linear-gradient(90deg, ${BG2}, transparent)` }} />
          <div className="absolute inset-y-0 right-0 w-16 z-10" style={{ background: `linear-gradient(270deg, ${BG2}, transparent)` }} />
          <div className="flex items-center h-full ticker-slow">
            {[...ticker, ...ticker].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 mx-5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{
                  background: item.type === 'bull' ? BULL : item.type === 'bear' ? BEAR : TXT3 + '50',
                }} />
                <span className="text-[11px]" style={{
                  color: item.type === 'bull' ? BULL + 'cc' : item.type === 'bear' ? BEAR + 'cc' : TXT3,
                  fontWeight: item.type !== 'neutral' ? 600 : 400,
                }}>
                  {item.text}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 10%{transform:translateX(-5px) rotate(-0.3deg)} 30%{transform:translateX(5px) rotate(0.3deg)} 50%{transform:translateX(-3px)} 70%{transform:translateX(3px)} 90%{transform:translateX(-1px)} }
        .animate-shake { animation: shake 0.6s ease-in-out; }
        @keyframes alertSlide { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
        @keyframes tickerSlow { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .ticker-slow { animation: tickerSlow 90s linear infinite; }
      `}</style>
    </div>
  );
}
