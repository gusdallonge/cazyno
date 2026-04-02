import { X, Lock, CreditCard, ArrowDownToLine } from 'lucide-react';

export default function BalancePopup({ credits, vault, onVault, onDeposit, onWithdraw, onClose }) {
  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="border border-[#1a2a38] rounded-2xl p-5 max-w-xs w-full mx-4 space-y-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron font-bold text-lg text-white">Solde</h3>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#111a25] rounded-xl p-4 border border-[#1a2a38] text-center">
          <p className="text-xs text-[#94a3b8] mb-1">Solde disponible</p>
          <p className="font-orbitron font-black text-3xl text-primary">{credits.toFixed(2)} €</p>
        </div>

        {vault > 0 && (
          <div className="bg-[rgba(0,231,1,0.1)] rounded-xl p-3 border border-[rgba(0,231,1,0.3)] text-center">
            <p className="text-xs text-[#94a3b8] mb-1 flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Coffre verrouillé</p>
            <p className="font-orbitron font-black text-xl text-primary">{vault.toFixed(2)} €</p>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onDeposit}
            className="flex-1 py-3 rounded-xl bg-[rgba(0,231,1,0.15)] border border-[rgba(0,231,1,0.3)] text-primary font-semibold hover:bg-[#00e701]/25 transition-all active:scale-95 text-sm">
            <CreditCard className="w-3.5 h-3.5 inline mr-1" /> Déposer
          </button>
          <button onClick={onWithdraw}
            className="flex-1 py-3 rounded-xl bg-[#111a25] border border-[#1a2a38] text-white font-semibold hover:bg-[#111a25] transition-all active:scale-95 text-sm">
            <ArrowDownToLine className="w-3.5 h-3.5 inline mr-1" /> Retirer
          </button>
          <button onClick={onVault}
            className="flex-1 py-3 rounded-xl bg-[#111a25] border border-[#1a2a38] text-white font-semibold hover:bg-[#111a25] transition-all active:scale-95 text-sm">
            <Lock className="w-3.5 h-3.5 inline mr-1" /> Coffre
          </button>
        </div>
      </div>
    </div>
  );
}