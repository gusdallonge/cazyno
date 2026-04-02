import { useState } from 'react';
import { Gift, Lock, Star, Sun, Calendar, CheckCircle, TrendingUp, Shield } from 'lucide-react';
import { getLevelIcon, LEVELS } from './LevelDisplay';

const MONTHLY_REWARDS = [
  { label: 'Bonus Fidélité Mensuel', desc: 'Basé sur vos mises du mois', amount: null },
  { label: 'Bonus VIP Mensuel', desc: 'Réservé aux membres Gold+', amount: null },
  { label: 'Cashback Mensuel', desc: 'Sur vos pertes du mois', amount: null },
];

function fmt(n) { return parseFloat(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function RewardsPanel({ gradeRewards, dailyReward, onClaimGrade, onClaimDaily, onClose }) {
  const [claimedMsg, setClaimedMsg] = useState(null);

  const claim = (fn, label) => {
    const amount = fn();
    if (amount > 0) {
      setClaimedMsg(`+${fmt(amount)} € — ${label} réclamé !`);
      setTimeout(() => setClaimedMsg(null), 2500);
    }
  };

  return (
    <div className="p-4 space-y-4">

      {/* Grade rewards */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-sm text-white">Récompenses de grade</span>
        </div>
        {gradeRewards.length === 0 && (
          <p className="text-xs text-[#94a3b8] text-center py-3">Aucune récompense de grade disponible.<br/>Passe au niveau suivant pour en gagner !</p>
        )}
        <div className="space-y-2">
           {gradeRewards.filter(r => !r.claimed).map((r, i) => (
             <div key={i} className="flex items-center gap-3 bg-[#111a25] rounded-xl px-4 py-3 border border-yellow-500/30">
               {(() => { const Ic = getLevelIcon(r.gradeName); const lvl = LEVELS.find(l => l.name === r.gradeName); return <Ic className="w-5 h-5" style={{ color: lvl?.color || '#facc15' }} />; })()}
               <div className="flex-1">
                 <p className="font-semibold text-sm text-white">{r.gradeLabel}</p>
                 <p className="text-xs text-[#94a3b8]">Récompense de passage de grade</p>
               </div>
               <button
                 onClick={() => claim(() => onClaimGrade(gradeRewards.indexOf(r)), `Grade ${r.gradeLabel}`)}
                 className="px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-orbitron font-bold text-xs hover:bg-yellow-500/30 transition-colors">
                 +{fmt(r.amount)} €
               </button>
             </div>
           ))}
           {gradeRewards.filter(r => !r.claimed).length === 0 && (
             <p className="text-xs text-[#94a3b8] text-center py-3">Aucune récompense de grade disponible.<br/>Passe au niveau suivant pour en gagner !</p>
           )}
         </div>
      </div>

      {/* Daily reward */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-4 h-4 text-orange-400" />
          <span className="font-bold text-sm text-white">Récompense quotidienne</span>
        </div>
        {dailyReward ? (
          <div className={`flex items-center gap-3 bg-[#111a25] rounded-xl px-4 py-3 border ${dailyReward.claimed ? 'border-[#1a2a38] opacity-50' : dailyReward.isWinner ? 'border-green-500/30' : 'border-red-500/30'}`}>
            {dailyReward.isWinner ? <TrendingUp className="w-5 h-5 text-green-400" /> : <Shield className="w-5 h-5 text-red-400" />}
            <div className="flex-1">
              <p className="font-semibold text-sm text-white">
                {dailyReward.isWinner ? 'Journée gagnante' : 'Journée difficile'}
              </p>
              <p className="text-xs text-[#94a3b8]">
                Récompense du jour
              </p>
            </div>
            {dailyReward.claimed ? (
              <CheckCircle className="w-5 h-5 text-primary" />
            ) : (
              <button
                onClick={() => claim(() => onClaimDaily(), 'Quotidien')}
                className={`px-3 py-1.5 rounded-lg font-orbitron font-bold text-xs transition-colors border ${dailyReward.isWinner ? 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30' : 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'}`}>
                +{fmt(dailyReward.amount)} €
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-[#111a25] rounded-xl px-4 py-3 border border-[#1a2a38] opacity-50">
            <Sun className="w-5 h-5 text-yellow-400" />
            <div className="flex-1">
              <p className="font-semibold text-sm text-white">Pas encore de données</p>
              <p className="text-xs text-[#94a3b8]">Joue pour débloquer ta récompense du jour</p>
            </div>
          </div>
        )}
      </div>

      {/* Monthly rewards — locked */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="font-bold text-sm text-white">Récompenses mensuelles</span>
          <span className="ml-auto text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">Bientôt</span>
        </div>
        <div className="space-y-2">
          {MONTHLY_REWARDS.map((r, i) => (
            <div key={i} className="flex items-center gap-3 bg-[#111a25] rounded-xl px-4 py-3 border border-[#1a2a38] opacity-40">
              <Lock className="w-5 h-5 text-[#94a3b8] shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-white">{r.label}</p>
                <p className="text-xs text-[#94a3b8]">{r.desc}</p>
              </div>
              <span className="text-xs text-[#94a3b8] font-orbitron">— €</span>
            </div>
          ))}
        </div>
      </div>

      {claimedMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#00e701] text-primary-foreground font-bold text-sm px-6 py-3 rounded-2xl shadow-xl fade-up z-[9999]">
          {claimedMsg}
        </div>
      )}
    </div>
  );
}