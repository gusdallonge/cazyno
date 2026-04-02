import { Gamepad2, Medal, Trophy as TrophyIcon, Diamond, Sparkles, Crown, Gem, Circle, Shield } from 'lucide-react';

const LEVEL_ICON_MAP = {
  null: Gamepad2, Silver: Medal, Gold: TrophyIcon, Platine: Medal, Diamond: Diamond, Diamond1: Diamond, Diamond2: Diamond,
  Oxygen1: Sparkles, Oxygen2: Sparkles, Legend: Crown, Sapphire1: Gem, Sapphire2: Gem, Emerald1: Sparkles, Emerald2: Sparkles,
  Ruby1: Circle, Ruby2: Circle, Amethyst: Gem, Opal: Gem, Obsidian: Shield, Onyx: Crown,
};

export const LEVELS = [
  { name: null,        label: 'Débutant',    xp: 0,          color: '#888888' },
  { name: 'Silver',    label: 'Silver',      xp: 5000,       color: '#C0C0C0' },
  { name: 'Gold',      label: 'Gold',        xp: 56000,      color: '#FFD700' },
  { name: 'Platine',   label: 'Platine',     xp: 224000,     color: '#A8D8EA' },
  { name: 'Diamond',   label: 'Diamant',     xp: 560000,     color: '#B9F2FF' },
  { name: 'Diamond1',  label: 'Diamant I',   xp: 1120000,    color: '#7DF9FF' },
  { name: 'Diamond2',  label: 'Diamant II',  xp: 1680000,    color: '#00BFFF' },
  { name: 'Oxygen1',   label: 'Oxygène I',   xp: 2240000,    color: '#A8FF78' },
  { name: 'Oxygen2',   label: 'Oxygène II',  xp: 2800000,    color: '#56FFA4' },
  { name: 'Legend',    label: 'LEGEND',      xp: 3360000,    color: '#FF6B35' },
  { name: 'Sapphire1', label: 'Saphir I',    xp: 3920000,    color: '#0EA5E9' },
  { name: 'Sapphire2', label: 'Saphir II',   xp: 4800000,    color: '#06B6D4' },
  { name: 'Emerald1',  label: 'Émeraude I',  xp: 6000000,    color: '#10B981' },
  { name: 'Emerald2',  label: 'Émeraude II', xp: 7500000,    color: '#059669' },
  { name: 'Ruby1',     label: 'Rubis I',     xp: 9500000,    color: '#DC2626' },
  { name: 'Ruby2',     label: 'Rubis II',    xp: 12000000,   color: '#B91C1C' },
  { name: 'Amethyst',  label: 'Améthyste',   xp: 15000000,   color: '#A855F7' },
  { name: 'Opal',      label: 'Opale',       xp: 18500000,   color: '#EC4899' },
  { name: 'Obsidian',  label: 'Obsidienne',  xp: 22000000,   color: '#94a3b8' },
  { name: 'Onyx',      label: 'Onyx',        xp: 30000000,   color: '#E8E8E8' },
];

export function getLevel(xp) {
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) { idx = i; break; }
  }
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  const progress = next
    ? Math.min(100, ((xp - current.xp) / (next.xp - current.xp)) * 100)
    : 100;
  return { current, next, progress };
}

export function getLevelIcon(name) {
  return LEVEL_ICON_MAP[name] || Gamepad2;
}

export default function LevelDisplay({ xp }) {
  const { current, next, progress } = getLevel(xp);
  const LvlIcon = getLevelIcon(current.name);

  return (
    <div className="w-full max-w-sm mx-auto select-none">
      <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${current.color}15, ${current.color}05)`,
          border: `1px solid ${current.color}40`,
          boxShadow: `0 0 20px ${current.color}15`
        }}>
        <LvlIcon className="w-6 h-6 shrink-0" style={{ color: current.color }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-orbitron font-black text-sm" style={{ color: current.color }}>{current.label}</span>
            {next && <span className="text-[10px] text-[#94a3b8]">→ {next.label}</span>}
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background:'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-700 relative overflow-hidden"
              style={{ width:`${progress}%`, background:`linear-gradient(90deg,${current.color}99,${current.color})` }}>
              <div className="absolute inset-0 bg-white/20 animate-pulse"/>
            </div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-[#94a3b8] font-mono">{(xp||0).toLocaleString('fr-FR')} XP</span>
            <span className="text-[9px] font-bold" style={{ color: current.color }}>{Math.floor(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}