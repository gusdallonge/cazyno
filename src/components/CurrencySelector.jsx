import { useState, useRef, useEffect } from 'react';

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', label: 'Euro', rate: 1, flag: 'EU' },
  { code: 'USD', symbol: '$', label: 'Dollar US', rate: 1.08, flag: 'US' },
  { code: 'RUB', symbol: '₽', label: 'Rouble Russe', rate: 100, flag: 'RU' },
  { code: 'GBP', symbol: '£', label: 'Livre Sterling', rate: 0.85, flag: 'GB' },
  { code: 'BRL', symbol: 'R$', label: 'Réal Brésilien', rate: 5.5, flag: 'BR' },
  { code: 'BTC', symbol: '₿', label: 'Bitcoin', rate: 0.000015, flag: 'BTC', decimals: 6 },
  { code: 'ETH', symbol: 'Ξ', label: 'Ethereum', rate: 0.00028, flag: 'ETH', decimals: 5 },
];

export function formatAmount(credits, currency) {
  const cur = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const amount = credits * cur.rate;
  if (cur.decimals) return amount.toFixed(cur.decimals);
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CurrencySelector({ currency, setCurrency }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="text-xs text-[#94a3b8] hover:text-white font-orbitron font-bold transition-colors px-1 underline-offset-2 hover:underline">
        {current.symbol} {current.code}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 border border-[#1a2a38] rounded-xl shadow-2xl z-50 overflow-hidden"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest px-3 pt-3 pb-1">Devise d'affichage</p>
          {CURRENCIES.map(c => (
            <button key={c.code} onClick={() => { setCurrency(c.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-[#111a25] transition-colors ${c.code === currency ? 'text-primary font-bold bg-[#00e701]/5' : 'text-white'}`}>
              <span className="text-base w-6 text-center">{c.flag}</span>
              <span className="flex-1 text-left">{c.label}</span>
              <span className="font-orbitron font-bold text-xs text-[#94a3b8]">{c.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}