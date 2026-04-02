import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, ArrowLeft, Search, Inbox, CheckCircle, PartyPopper } from 'lucide-react';

const CRYPTOS = [
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    color: '#F7931A',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    qrSeed: 42,
    logo: '₿',
    bg: 'rgba(247,147,26,0.12)',
    border: 'rgba(247,147,26,0.35)',
  },
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    color: '#627EEA',
    address: '0x742d35Cc6634C0532925a3b8D4C9B2e5e1234567',
    qrSeed: 137,
    logo: 'Ξ',
    bg: 'rgba(98,126,234,0.12)',
    border: 'rgba(98,126,234,0.35)',
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    color: '#9945FF',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv',
    qrSeed: 999,
    logo: '◎',
    bg: 'rgba(153,69,255,0.12)',
    border: 'rgba(153,69,255,0.35)',
  },
];

const STEPS = [
  { label: 'Transaction détectée',  IconComp: Search },
  { label: 'Transaction reçue',     IconComp: Inbox },
  { label: 'Transaction confirmée', IconComp: CheckCircle },
];

/* ── Faux QR code SVG ── */
function FakeQR({ seed, color }) {
  const SIZE = 10;
  const CELL = 16;
  const TOTAL = SIZE * CELL;

  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };

  const isCorner = (r, c) => (r < 3 && c < 3) || (r < 3 && c >= SIZE - 3) || (r >= SIZE - 3 && c < 3);
  const cornerFilled = (r, c) => {
    const lr = r < 3 ? r : SIZE - 1 - r;
    const lc = c < 3 ? c : SIZE - 1 - c;
    if (lr === 1 && lc === 1) return true;
    return lr === 0 || lr === 2 || lc === 0 || lc === 2;
  };

  const cells = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const filled = isCorner(r, c) ? cornerFilled(r, c) : rand() > 0.42;
      if (filled) cells.push({ r, c });
    }
  }

  return (
    <svg width={TOTAL} height={TOTAL} viewBox={`0 0 ${TOTAL} ${TOTAL}`}>
      <rect width={TOTAL} height={TOTAL} fill="white" rx="6" />
      {cells.map(({ r, c }) => (
        <rect
          key={`${r}-${c}`}
          x={c * CELL + 1.5} y={r * CELL + 1.5}
          width={CELL - 3} height={CELL - 3}
          rx="2.5"
          fill={color}
        />
      ))}
    </svg>
  );
}

export default function TopUpModal({ onClose, onTopUp }) {
  const [phase, setPhase] = useState('select'); // select | qr | processing | done
  const [crypto, setCrypto] = useState(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [amount, setAmount] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSelect = (c) => {
    setCrypto(c);
    setPhase('qr');
  };

  const handlePay = () => {
    const fakeAmount = Math.floor(Math.random() * 450 + 50);
    setAmount(fakeAmount);
    setPhase('processing');
    setStepIndex(0);
    setTimeout(() => setStepIndex(1), 1800);
    setTimeout(() => setStepIndex(2), 3600);
    setTimeout(() => {
      setPhase('done');
      onTopUp(fakeAmount);
    }, 5200);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(crypto.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const modal = (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: 24,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 0 80px rgba(0,0,0,0.8)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a2a38]">
          {phase === 'qr' && (
            <button onClick={() => setPhase('select')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4 text-[#94a3b8]" />
            </button>
          )}
          <h2 className="font-orbitron font-bold text-base text-white flex-1">
            {phase === 'select'    && 'Déposer des fonds'}
            {phase === 'qr'        && `Dépôt ${crypto?.symbol}`}
            {phase === 'processing' && 'Vérification…'}
            {phase === 'done'      && 'Dépôt confirmé !'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors shrink-0">
            <X className="w-4 h-4 text-[#94a3b8]" />
          </button>
        </div>

        <div className="p-5">

          {/* ── SÉLECTION ── */}
          {phase === 'select' && (
            <div className="space-y-4">
              <p className="text-sm text-center text-[#94a3b8]">
                Choisissez votre cryptomonnaie pour afficher l'adresse de dépôt
              </p>
              <div className="grid grid-cols-3 gap-3">
                {CRYPTOS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className="flex flex-col items-center gap-2 py-5 px-2 rounded-2xl border-2 border-[#1a2a38] hover:border-[#00e701]/60 bg-[#111a25] hover:bg-[#111a25] transition-all active:scale-95"
                  >
                    <span className="text-3xl font-orbitron font-black" style={{ color: c.color }}>{c.logo}</span>
                    <span className="font-orbitron font-bold text-xs text-white">{c.symbol}</span>
                    <span className="text-[10px] text-[#94a3b8]">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── QR CODE ── */}
          {phase === 'qr' && crypto && (
            <div className="space-y-4">
              {/* QR */}
              <div className="flex flex-col items-center gap-3">
                <div
                  className="p-3 rounded-2xl"
                  style={{ background: crypto.bg, border: `2px solid ${crypto.border}` }}
                >
                  <FakeQR seed={crypto.qrSeed} color={crypto.color} />
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl w-full"
                  style={{ background: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))' }}
                >
                  <p className="font-mono text-[10px] text-[#94a3b8] flex-1 truncate">{crypto.address}</p>
                  <button
                    onClick={copyAddress}
                    className="text-[10px] font-bold shrink-0 px-2 py-1 rounded-lg transition-colors"
                    style={{ color: copied ? crypto.color : undefined }}
                  >
                    {copied ? '✓ Copié' : 'Copier'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-center text-[#94a3b8]">
                Envoyez vos {crypto.symbol} à cette adresse.<br />
                La transaction est détectée automatiquement.
              </p>

              <button
                onClick={handlePay}
                className="w-full py-3.5 rounded-2xl font-orbitron font-black text-sm transition-all active:scale-95"
                style={{
                  background: crypto.color,
                  color: '#fff',
                  boxShadow: `0 0 20px ${crypto.color}55`,
                }}
              >
                J'ai envoyé les fonds →
              </button>
            </div>
          )}

          {/* ── TRAITEMENT ── */}
          {phase === 'processing' && (
            <div className="py-4 space-y-5">
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-[rgba(0,231,1,0.2)] border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-center text-sm text-[#94a3b8]">Vérification sur la blockchain…</p>
              <div className="space-y-2.5">
                {STEPS.map((step, i) => {
                  const done  = i < stepIndex;
                  const active = i === stepIndex;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-500"
                      style={{
                        background: done ? 'rgba(34,197,94,0.08)' : active ? 'hsl(var(--surface2))' : 'hsl(var(--surface))',
                        borderColor: done ? 'rgba(34,197,94,0.3)' : 'hsl(var(--border))',
                        opacity: i > stepIndex ? 0.35 : 1,
                      }}
                    >
                      {done ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> : <step.IconComp className="w-5 h-5 text-[#94a3b8] shrink-0" />}
                      <span className="font-semibold text-sm text-white flex-1">{step.label}</span>
                      {done && <Check className="w-4 h-4 text-green-500" />}
                      {active && <div className="w-3 h-3 border-2 border-[#00e701]/40 border-t-primary rounded-full animate-spin" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SUCCÈS ── */}
          {phase === 'done' && (
            <div className="py-4 text-center space-y-5">
              <div className="flex justify-center"><CheckCircle className="w-12 h-12 text-primary" /></div>
              <div>
                <p className="font-orbitron font-black text-3xl text-primary">+{amount} €</p>
                <p className="text-sm text-[#94a3b8] mt-1">crédités sur votre compte</p>
              </div>
              <div className="space-y-2">
                {STEPS.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
                    style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.25)' }}>
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                    <span className="font-semibold text-sm text-green-400">{step.label}</span>
                    <Check className="w-3.5 h-3.5 text-green-500 ml-auto" />
                  </div>
                ))}
              </div>
              <button onClick={onClose} className="bg-[#00e701] text-black rounded-xl font-bold w-full py-3.5 font-orbitron text-sm">
                Retour au casino
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}