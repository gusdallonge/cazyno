import { useState, useEffect } from 'react';
import { getLevelIcon } from './LevelDisplay';
import { LEVELS } from './LevelDisplay';

export default function GradeRewardPopup({ reward, onClaim, onClose }) {
  const [claimed, setClaimed] = useState(false);

  const handleClaim = () => {
    onClaim();
    setClaimed(true);
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onClose} />
      
      <div
        className="pointer-events-auto relative bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-[#00e701] rounded-3xl p-8 text-center max-w-sm"
        style={{
          boxShadow: '0 0 60px hsl(var(--green)/0.6), inset 0 0 30px hsl(var(--green)/0.1)',
          animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        {/* Icon */}
        <div className="mb-4 animate-bounce flex justify-center">
          {(() => { const Ic = getLevelIcon(reward.gradeName); const lvl = LEVELS.find(l => l.name === reward.gradeName); return <Ic className="w-14 h-14" style={{ color: lvl?.color || '#00e701' }} />; })()}
        </div>

        {/* Grade Label */}
        <p className="font-orbitron font-black text-xs text-[#94a3b8] uppercase tracking-widest mb-2">
          Nouveau Grade
        </p>

        {/* Grade Name */}
        <h2 className="font-orbitron font-black text-3xl text-primary mb-3">
          {reward.gradeLabel}
        </h2>

        {/* Reward Amount */}
        <p className="text-sm text-[#94a3b8] mb-6">
          Récompense de grade obtenue
        </p>
        <p className="font-orbitron font-black text-4xl text-primary mb-6">
          +{reward.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
        </p>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={claimed}
          className="bg-[#00e701] text-black rounded-xl font-bold w-full py-3 font-orbitron text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {claimed ? 'Récompense Reçue ✓' : 'Réclamer'}
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity:0; transform: scale(0.6) translateY(-20px); }
          to   { opacity:1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}