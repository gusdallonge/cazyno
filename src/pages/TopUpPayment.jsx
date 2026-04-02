import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle2, Clock, Shield, Loader2 } from 'lucide-react';

const CRYPTO_INFO = {
  btc: {
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin Network',
    color: '#F7931A',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    confirmations: 3,
    time: '~10-30 min',
    logo: (
      <svg viewBox="0 0 64 64" className="w-8 h-8">
        <circle cx="32" cy="32" r="32" fill="#F7931A"/>
        <path d="M44.1 27.8c.5-3.6-2.2-5.5-6-6.8l1.2-4.9-3-.7-1.2 4.8c-.8-.2-1.6-.4-2.4-.5l1.2-4.8-3-.7-1.2 4.9c-.6-.1-1.3-.3-1.9-.4v0l-4.1-1-.8 3.2s2.2.5 2.1.5c1.2.3 1.4 1.1 1.4 1.7l-1.4 5.8c.1 0 .2.1.3.1-.1 0-.2 0-.3-.1l-2 8c-.1.4-.5.9-1.4.7 0 .1-2.1-.5-2.1-.5l-1.5 3.4 3.9.9c.7.2 1.4.4 2.1.5l-1.2 4.9 3 .7 1.2-4.9c.8.2 1.6.4 2.4.6l-1.2 4.8 3 .7 1.2-4.9c5.1.9 9 .5 10.6-4 1.3-3.7-.1-5.8-2.7-7.2 1.9-.4 3.4-1.7 3.8-4.4zm-6.8 9.5c-.9 3.7-7.1 1.7-9.1 1.2l1.6-6.5c2 .5 8.6 1.5 7.5 5.3zm.9-9.6c-.9 3.3-6.1 1.6-7.8 1.2l1.5-5.8c1.7.4 7.2 1.2 6.3 4.6z" fill="white"/>
      </svg>
    ),
    rate: 0.0000165,
  },
  eth: {
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'Ethereum (ERC-20)',
    color: '#627EEA',
    address: '0x742d35Cc6634C0532925a3b8D4C9B2e5e1234567',
    confirmations: 12,
    time: '~2-5 min',
    logo: (
      <svg viewBox="0 0 64 64" className="w-8 h-8">
        <circle cx="32" cy="32" r="32" fill="#627EEA"/>
        <path d="M32 10v16.5l13.9 6.2L32 10z" fill="white" fillOpacity=".6"/>
        <path d="M32 10L18.1 32.7l13.9-6.2V10z" fill="white"/>
        <path d="M32 43.8v10.2l13.9-19.2L32 43.8z" fill="white" fillOpacity=".6"/>
        <path d="M32 54V43.8L18.1 34.8 32 54z" fill="white"/>
        <path d="M32 41.2l13.9-8.5L32 26.5v14.7z" fill="white" fillOpacity=".2"/>
        <path d="M18.1 32.7L32 41.2V26.5L18.1 32.7z" fill="white" fillOpacity=".6"/>
      </svg>
    ),
    rate: 0.00028,
  },
  sol: {
    name: 'Solana',
    symbol: 'SOL',
    network: 'Solana Network',
    color: '#9945FF',
    address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgHkv',
    confirmations: 32,
    time: '~30 sec',
    logo: (
      <svg viewBox="0 0 64 64" className="w-8 h-8">
        <circle cx="32" cy="32" r="32" fill="#9945FF"/>
        <path d="M18 41h21c.4 0 .7-.1.9-.3l3.5-3.5c.2-.2.3-.5.3-.8H22.5c-.4 0-.7.1-.9.3L18 41z" fill="white"/>
        <path d="M18 32h21c.4 0 .7-.1.9-.3l3.5-3.5c.2-.2.3-.5.3-.8H22.5c-.4 0-.7.1-.9.3L18 32z" fill="white"/>
        <path d="M43.7 22.8c-.2-.2-.5-.3-.9-.3H21.9L18 26h21.1c.4 0 .7-.1.9-.3l3.7-2.9z" fill="white"/>
      </svg>
    ),
    rate: 0.0052,
  },
};

function QRCode({ value, size = 180 }) {
  // Simple visual QR code placeholder with a distinctive pattern
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 37 37" width={size} height={size} className="rounded-xl">
        <rect width="37" height="37" fill="white"/>
        {/* Top-left position marker */}
        <rect x="1" y="1" width="9" height="9" rx="1" fill="black"/>
        <rect x="2" y="2" width="7" height="7" rx="0.5" fill="white"/>
        <rect x="3" y="3" width="5" height="5" rx="0.3" fill="black"/>
        {/* Top-right position marker */}
        <rect x="27" y="1" width="9" height="9" rx="1" fill="black"/>
        <rect x="28" y="2" width="7" height="7" rx="0.5" fill="white"/>
        <rect x="29" y="3" width="5" height="5" rx="0.3" fill="black"/>
        {/* Bottom-left position marker */}
        <rect x="1" y="27" width="9" height="9" rx="1" fill="black"/>
        <rect x="2" y="28" width="7" height="7" rx="0.5" fill="white"/>
        <rect x="3" y="29" width="5" height="5" rx="0.3" fill="black"/>
        {/* Data modules - pseudo-random pattern based on address */}
        {[
          [12,1],[14,1],[16,1],[18,1],[20,1],[22,1],[24,1],
          [11,2],[13,2],[15,2],[19,2],[21,2],[23,2],[25,2],
          [12,3],[16,3],[18,3],[20,3],[24,3],
          [13,4],[14,4],[17,4],[19,4],[22,4],[23,4],
          [11,5],[15,5],[16,5],[18,5],[21,5],[25,5],
          [12,6],[13,6],[17,6],[20,6],[22,6],[24,6],
          [1,11],[3,11],[5,11],[7,11],[9,11],[11,11],[13,11],[15,11],[17,11],[19,11],[21,11],[23,11],[25,11],[27,11],[29,11],[31,11],[33,11],[35,11],
          [2,12],[4,12],[6,12],[10,12],[14,12],[16,12],[20,12],[22,12],[26,12],[28,12],[30,12],[34,12],
          [1,13],[5,13],[7,13],[9,13],[13,13],[17,13],[19,13],[23,13],[25,13],[27,13],[31,13],[33,13],[35,13],
          [2,14],[4,14],[8,14],[12,14],[16,14],[18,14],[22,14],[24,14],[28,14],[32,14],[34,14],
          [1,15],[3,15],[7,15],[9,15],[11,15],[15,15],[17,15],[21,15],[23,15],[27,15],[29,15],[33,15],[35,15],
          [2,16],[6,16],[8,16],[14,16],[18,16],[20,16],[24,16],[26,16],[30,16],[32,16],
          [1,17],[3,17],[5,17],[11,17],[13,17],[17,17],[19,17],[23,17],[25,17],[29,17],[31,17],[35,17],
          [12,19],[14,19],[16,19],[20,19],[22,19],[24,19],
          [11,20],[13,20],[17,20],[19,20],[21,20],[23,20],[25,20],
          [12,21],[15,21],[18,21],[22,21],[24,21],
          [13,22],[16,22],[17,22],[19,22],[21,22],[23,22],
          [11,23],[14,23],[16,23],[20,23],[22,23],[24,23],
          [27,19],[29,19],[31,19],[33,19],[35,19],
          [28,20],[30,20],[34,20],
          [27,21],[31,21],[33,21],[35,21],
          [28,22],[30,22],[32,22],
          [27,23],[29,23],[33,23],[35,23],
          [28,25],[30,25],[32,25],[34,25],
          [27,26],[29,26],[31,26],[33,26],[35,26],
          [28,27],[30,27],[32,27],[34,27],
          [27,28],[31,28],[33,28],[35,28],
          [28,29],[30,29],[32,29],
        ].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="1" height="1" fill="black"/>
        ))}
      </svg>
    </div>
  );
}

export default function TopUpPayment() {
  const navigate = useNavigate();
  const { setCredits } = useOutletContext();
  const params = new URLSearchParams(window.location.search);
  const cryptoId = params.get('crypto') || 'btc';
  const amount = parseInt(params.get('amount') || '100');

  const crypto = CRYPTO_INFO[cryptoId] || CRYPTO_INFO.btc;
  const cryptoAmount = (amount * crypto.rate).toFixed(6);

  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirmStep, setConfirmStep] = useState(0);

  const handleCopy = () => {
    navigator.clipboard.writeText(crypto.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = async () => {
    setSending(true);
    // Simulate confirmation steps
    for (let i = 1; i <= 3; i++) {
      await new Promise(r => setTimeout(r, 900));
      setConfirmStep(i);
    }
    await new Promise(r => setTimeout(r, 600));
    setSending(false);
    setSent(true);
    setCredits(c => c + amount);
  };

  if (sent) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6 fade-up">
        <div className="w-24 h-24 rounded-full bg-[rgba(0,231,1,0.15)] border-2 border-[#00e701] flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-[#00e701]" />
        </div>
        <div>
          <h2 className="font-orbitron font-black text-3xl text-[#00e701]">Paiement reçu !</h2>
          <p className="text-[#94a3b8] mt-2">+{amount} € ont été ajoutés à ton compte</p>
        </div>
        <div className="border border-[#1a2a38] rounded-2xl p-4 text-sm text-left space-y-2">
          <div className="flex justify-between"><span className="text-[#94a3b8]">Montant</span><span className="font-semibold text-[#00e701]">{amount} €</span></div>
          <div className="flex justify-between"><span className="text-[#94a3b8]">Crypto</span><span className="font-semibold">{cryptoAmount} {crypto.symbol}</span></div>
          <div className="flex justify-between"><span className="text-[#94a3b8]">Statut</span><span className="font-semibold text-[#00e701]">Confirmé ✓</span></div>
          <div className="flex justify-between"><span className="text-[#94a3b8]">TX Hash</span><span className="font-mono text-xs text-[#94a3b8]">0x9f3a...d28e</span></div>
        </div>
        <button onClick={() => navigate('/Home')} className="bg-[#00e701] text-black rounded-xl font-bold w-full py-4 font-orbitron">
          Retour au casino
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 fade-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors font-semibold text-sm">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <div className="text-center space-y-1">
        <h1 className="font-orbitron font-black text-2xl text-white">Paiement en {crypto.symbol}</h1>
        <p className="text-[#94a3b8] text-sm">Envoie exactement le montant indiqué pour créditer ton compte</p>
      </div>

      {/* Main card */}
      <div className="border border-[#1a2a38] rounded-2xl overflow-hidden">
        {/* Amount header */}
        <div className="p-6 text-center border-b border-[#1a2a38]" style={{ background: `${crypto.color}12` }}>
          <div className="flex items-center justify-center gap-3 mb-1">
            {crypto.logo}
            <div>
              <div className="font-orbitron font-black text-3xl" style={{ color: crypto.color }}>{cryptoAmount} {crypto.symbol}</div>
              <div className="text-sm text-[#94a3b8]">≈ {amount} €</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs text-[#94a3b8]">
            <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{crypto.time}</div>
            <div className="flex items-center gap-1"><Shield className="w-3 h-3" />{crypto.confirmations} confirmations</div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-4 p-6 border-b border-[#1a2a38]">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest">Scanner le QR code</p>
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <QRCode value={crypto.address} size={180} />
          </div>
          <p className="text-xs text-[#94a3b8]">Réseau : <span className="text-white font-semibold">{crypto.network}</span></p>
        </div>

        {/* Address */}
        <div className="p-6 space-y-3">
          <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest">Adresse de dépôt</p>
          <div className="flex items-center gap-2 bg-[#111a25] border border-[#1a2a38] rounded-xl p-3">
            <span className="font-mono text-xs text-white flex-1 break-all">{crypto.address}</span>
            <button
              onClick={handleCopy}
              className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-[#00e701]" /> : <Copy className="w-4 h-4 text-[#94a3b8]" />}
            </button>
          </div>
          <p className="text-xs text-[#94a3b8] text-center">
            Envoie uniquement du <strong>{crypto.symbol}</strong> sur ce réseau
          </p>
        </div>
      </div>

      {/* Confirmation status */}
      {sending && (
        <div className="border border-[rgba(0,231,1,0.3)] rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-[#00e701] text-center">Confirmation en cours...</p>
          <div className="flex justify-between gap-2">
            {['Transaction détectée', 'Confirmation réseau', 'Crédits ajoutés'].map((label, i) => (
              <div key={i} className="flex-1 text-center space-y-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto border-2 transition-all duration-500 ${
                  confirmStep > i ? 'bg-[#00e701] border-[#00e701]' : confirmStep === i ? 'border-[#00e701] animate-pulse' : 'border-[#1a2a38]'
                }`}>
                  {confirmStep > i
                    ? <CheckCircle2 className="w-4 h-4 text-[#00e701]-foreground" />
                    : confirmStep === i
                    ? <Loader2 className="w-4 h-4 text-[#00e701] animate-spin" />
                    : <span className="text-xs text-[#94a3b8]">{i + 1}</span>
                  }
                </div>
                <p className="text-[10px] text-[#94a3b8] leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={sending}
        className="bg-[#00e701] text-black rounded-xl font-bold w-full py-4 font-orbitron text-base flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {sending ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Traitement...</>
        ) : (
          `J'ai envoyé ${cryptoAmount} ${crypto.symbol}`
        )}
      </button>

      <p className="text-center text-xs text-[#94a3b8] pb-4">
        Simulation démo · Aucun vrai paiement requis
      </p>
    </div>
  );
}