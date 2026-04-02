import { useState } from 'react';
import { X, Lock } from 'lucide-react';

export default function VaultModal({ credits, vault, onDeposit, onClose }) {
  const [amount, setAmount] = useState('');
  const [isLocking, setIsLocking] = useState(false);

  const handleDeposit = async () => {
    const num = parseFloat(amount);
    if (num <= 0 || num > credits) return;
    
    setIsLocking(true);
    await new Promise(r => setTimeout(r, 800));
    onDeposit(num);
    setAmount('');
    setIsLocking(false);
  };

  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="border border-[#1a2a38] rounded-2xl p-4 sm:p-6 max-w-sm w-full mx-4 space-y-4 my-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron font-bold text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Coffre</h3>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className={`mb-3 transition-all flex justify-center ${isLocking ? 'animate-pulse' : ''}`}>
              <Lock className="w-14 h-14 text-primary" />
            </div>
            <p className="text-sm text-[#94a3b8]">Verrouille ton argent en toute sécurité</p>
          </div>

          <div className="bg-[#111a25] rounded-xl p-3 border border-[#1a2a38]">
            <p className="text-xs text-[#94a3b8] mb-1">Solde disponible</p>
            <p className="font-orbitron font-bold text-lg text-primary">{credits.toFixed(2)} €</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#94a3b8] block mb-2">Montant à verrouiller</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLocking}
              className="w-full bg-[#111a25] border border-[#1a2a38] rounded-xl px-4 py-3 font-orbitron font-bold text-lg text-primary focus:outline-none focus:border-[#00e701] disabled:opacity-50"
            />
          </div>

          <button
            onClick={handleDeposit}
            disabled={isLocking || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > credits}
            className="w-full py-3 rounded-xl bg-[#00e701] text-primary-foreground font-orbitron font-bold hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
            {isLocking ? (
              <>
                <Lock className="w-4 h-4 animate-spin" /> Verrouillage...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Verrouiller
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}