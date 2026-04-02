import { useOutletContext } from 'react-router-dom';
import { Crown, Zap, Gift, Users, Medal, Trophy, Gem, Diamond, Sparkles, Circle, Shield, Star } from 'lucide-react';

function fmtXp(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 0)}K`;
  return n.toString();
}

const TIERS = [
  { group: 'Bronze', color: '#CD7F32', IconComponent: Medal, levels: [
    { sub: 1, xp: 0, rakeback: 5, bonus: 5 }, { sub: 2, xp: 5000, rakeback: 5, bonus: 15 }, { sub: 3, xp: 15000, rakeback: 5, bonus: 30 },
  ]},
  { group: 'Silver', color: '#C0C0C0', IconComponent: Medal, levels: [
    { sub: 1, xp: 30000, rakeback: 7, bonus: 50 }, { sub: 2, xp: 60000, rakeback: 7, bonus: 80 }, { sub: 3, xp: 100000, rakeback: 7, bonus: 120 },
  ]},
  { group: 'Gold', color: '#FFD700', IconComponent: Trophy, levels: [
    { sub: 1, xp: 200000, rakeback: 10, bonus: 200 }, { sub: 2, xp: 400000, rakeback: 10, bonus: 350 }, { sub: 3, xp: 700000, rakeback: 10, bonus: 500 },
  ]},
  { group: 'Platinum', color: '#E5E4E2', IconComponent: Gem, levels: [
    { sub: 1, xp: 1000000, rakeback: 12, bonus: 800 }, { sub: 2, xp: 2000000, rakeback: 12, bonus: 1200 }, { sub: 3, xp: 3500000, rakeback: 12, bonus: 2000 },
  ]},
  { group: 'Diamond', color: '#B9F2FF', IconComponent: Diamond, levels: [
    { sub: 1, xp: 5000000, rakeback: 15, bonus: 3000 }, { sub: 2, xp: 8000000, rakeback: 15, bonus: 5000 }, { sub: 3, xp: 12000000, rakeback: 15, bonus: 8000 },
  ]},
  { group: 'Emerald', color: '#50C878', IconComponent: Sparkles, levels: [
    { sub: 1, xp: 18000000, rakeback: 18, bonus: 12000 }, { sub: 2, xp: 25000000, rakeback: 18, bonus: 18000 }, { sub: 3, xp: 35000000, rakeback: 18, bonus: 25000 },
  ]},
  { group: 'Ruby', color: '#E0115F', IconComponent: Circle, levels: [
    { sub: 1, xp: 50000000, rakeback: 20, bonus: 35000 }, { sub: 2, xp: 75000000, rakeback: 20, bonus: 50000 }, { sub: 3, xp: 100000000, rakeback: 20, bonus: 70000 },
  ]},
  { group: 'Obsidian', color: '#3D3D3D', IconComponent: Shield, levels: [
    { sub: 1, xp: 150000000, rakeback: 25, bonus: null }, { sub: 2, xp: 250000000, rakeback: 25, bonus: null }, { sub: 3, xp: 500000000, rakeback: 25, bonus: null },
  ]},
];

const ALL_LEVELS = TIERS.flatMap(t => t.levels.map(l => ({ ...l, group: t.group, color: t.color, IconComponent: t.IconComponent })));

function getCurrentTier(xp) {
  let current = ALL_LEVELS[0];
  for (const lvl of ALL_LEVELS) {
    if (xp >= lvl.xp) current = lvl;
  }
  return current;
}

export default function VipClub() {
  const { xp } = useOutletContext();
  const current = getCurrentTier(xp || 0);
  const currentIdx = ALL_LEVELS.indexOf(current);
  const next = ALL_LEVELS[currentIdx + 1];
  const progress = next ? Math.min(100, ((xp - current.xp) / (next.xp - current.xp)) * 100) : 100;

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Current tier hero block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-base">Club VIP</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>24 niveaux exclusifs</span>
        </div>
        <div className="px-5 py-6 text-center space-y-3">
          <div className="flex justify-center"><current.IconComponent className="w-12 h-12" style={{ color: current.color }} /></div>
          <h2 className="font-orbitron text-2xl font-black" style={{ color: current.color }}>
            {current.group} {current.sub}
          </h2>
          <p className="text-sm" style={{color:'#94a3b8'}}>Rakeback : {current.rakeback}%</p>
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-xs mb-1" style={{color:'#94a3b8'}}>
              <span>{fmtXp(xp || 0)} XP</span>
              <span>{next ? `${fmtXp(next.xp)} XP` : 'MAX'}</span>
            </div>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{background:'#0b1219'}}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: current.color }} />
            </div>
            {next && (
              <p className="text-xs mt-1" style={{color:'#94a3b8'}}>
                Prochain : {next.group} {next.sub} -- Bonus {next.bonus ? `$${next.bonus.toLocaleString()}` : 'Sur mesure'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tier grid */}
      <div className="space-y-4">
        {TIERS.map(tier => (
          <div key={tier.group} className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
              <div className="flex items-center gap-2">
                <tier.IconComponent className="w-5 h-5" style={{ color: tier.color }} />
                <h3 className="font-orbitron font-black text-sm" style={{ color: tier.color }}>{tier.group}</h3>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-3 gap-3">
                {tier.levels.map(lvl => {
                  const isActive = current.group === tier.group && current.sub === lvl.sub;
                  const isReached = (xp || 0) >= lvl.xp;
                  return (
                    <div key={`${tier.group}-${lvl.sub}`}
                      className="rounded-xl p-3 text-center transition-all"
                      style={isActive
                        ? { background:'rgba(0,231,1,0.08)', border:'1px solid rgba(0,231,1,0.4)' }
                        : isReached
                          ? { background:'#111a25', border:'1px solid #1a2a38' }
                          : { background:'#111a25', border:'1px solid rgba(26,42,56,0.4)', opacity: 0.5 }}>
                      <p className="font-orbitron text-xs font-bold mb-1" style={{ color: isActive ? '#00e701' : tier.color }}>
                        Niv. {lvl.sub}
                      </p>
                      <p className="text-[10px]" style={{color:'#94a3b8'}}>{fmtXp(lvl.xp)} XP</p>
                      <p className="text-[10px]" style={{color:'#94a3b8'}}>{lvl.rakeback}% rakeback</p>
                      <p className="text-[10px] font-bold" style={{ color: tier.color }}>
                        {lvl.bonus ? `$${lvl.bonus.toLocaleString()}` : 'Sur mesure'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">Avantages VIP</h2>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Zap, label: 'Rakeback instantane', desc: 'Recevez votre rakeback en temps reel sur chaque mise' },
              { icon: Users, label: 'VIP Host dedie', desc: 'A partir de Platinum 2, un host personnel' },
              { icon: Gift, label: 'Reload Bonus', desc: 'Bonus de rechargement exclusifs pour Platinum+' },
              { icon: Crown, label: 'Avantages sur mesure', desc: 'Les niveaux Obsidian recoivent des perks uniques' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="rounded-xl p-4" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4" style={{color:'#00e701'}} />
                  <span className="text-sm font-bold text-white">{label}</span>
                </div>
                <p className="text-xs" style={{color:'#94a3b8'}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
