import { useEffect } from 'react';

export default function WinPopup({ amount, bet, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [amount]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-none bg-black/80 border-2 border-primary rounded-2xl px-10 py-6 text-center space-y-2"
        style={{
          boxShadow: '0 0 60px hsl(var(--green)/0.6), 0 0 120px hsl(var(--green)/0.2)',
          animation: 'winPopIn 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        {bet !== undefined && (
          <p className="text-sm font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.45)' }}>
            MISE&nbsp;&nbsp;<span style={{ color: 'rgba(255,255,255,0.7)' }}>{parseFloat(bet).toFixed(2)} €</span>
          </p>
        )}
        <p className="font-orbitron font-black text-5xl text-primary">+{amount} €</p>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(0,255,102,0.5)' }}>Gain</p>
      </div>
      <style>{`
        @keyframes winPopIn {
          from { opacity:0; transform: scale(0.7); }
          to   { opacity:1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}