import { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Gift, Trophy, LogOut, Shield, BarChart2, ArrowDownCircle, Users, Lock, Unlock, Gamepad2, Medal, Crown, Gem, Diamond, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLevel, LEVELS } from './LevelDisplay';
import RewardsPanel from './RewardsPanel';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../lib/AuthContext';
import { api } from '@/api';

const LEVEL_ICON_MAP = { null: Gamepad2, Silver: Medal, Gold: Trophy, Platine: Medal, Diamond: Diamond, Diamond1: Diamond, Diamond2: Diamond, Oxygen1: Sparkles, Oxygen2: Sparkles, Legend: Crown, Sapphire1: Gem, Sapphire2: Gem, Emerald1: Sparkles, Emerald2: Sparkles, Ruby1: Gem, Ruby2: Gem, Amethyst: Gem, Opal: Gem, Obsidian: Shield, Onyx: Crown };

function LevelIcon({ name, color, size = 'w-4 h-4' }) {
  const Ic = LEVEL_ICON_MAP[name] || Gamepad2;
  return <Ic className={size} style={{ color }} />;
}

export default function ProfileMenu({ xp, rakeback, claimRakeback, gradeRewards = [], getDailyReward, claimGradeReward, claimDailyReward, vault = 0, setVault }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('profile'); // 'profile' | 'rewards' | 'vault'
  const [claimed, setClaimed] = useState(null);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { current, next, progress } = getLevel(xp);

  const dailyReward = getDailyReward ? getDailyReward() : null;
  const pendingRewards = (gradeRewards.filter(r => !r.claimed).length) + (dailyReward && !dailyReward.claimed && dailyReward.amount > 0 ? 1 : 0);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClaim = () => {
    const amount = claimRakeback();
    if (amount > 0) {
      setClaimed(amount.toFixed(2));
      setTimeout(() => setClaimed(null), 2500);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className="relative md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#1a2a38] bg-[#111a25] hover:bg-[#111a25] transition-colors md:px-3 md:py-2">
        <div className="w-6 h-6 rounded-full bg-[#00e701]/20 border border-[#00e701]/40 flex items-center justify-center">
          <User className="w-3 h-3 text-primary" />
        </div>
        <span className="font-orbitron text-xs font-bold hidden lg:block flex items-center gap-1" style={{ color: current.color }}>
          <LevelIcon name={current.name} color={current.color} /> {current.label}
        </span>
        <ChevronDown className={`w-2.5 h-2.5 text-[#94a3b8] transition-transform ${open ? 'rotate-180' : ''}`} />
        {pendingRewards > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 text-black font-black text-[9px] flex items-center justify-center">
            {pendingRewards}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 border border-[#1a2a38] rounded-2xl z-50 overflow-hidden">
          {/* Header always visible */}
          <div className="p-4 border-b border-[#1a2a38] bg-[#111a25/50]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00e701]/20 border border-[#00e701]/40 flex items-center justify-center">
                <LevelIcon name={current.name} color={current.color} size="w-5 h-5" />
              </div>
              <div>
                <p className="font-orbitron font-black text-sm" style={{ color: current.color }}>{current.label}</p>
                {next && <p className="text-xs text-[#94a3b8]">Prochain niveau : {next.label}</p>}
              </div>
            </div>
            <div className="mt-3 w-full h-1.5 bg-[#111a25] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: current.color }} />
            </div>
            {next && <p className="text-xs text-[#94a3b8] mt-1 text-right">→ {next.label} à {next.xp.toLocaleString('fr-FR')} €</p>}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[#1a2a38]">
            <button onClick={() => setTab('profile')}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors ${tab === 'profile' ? 'text-primary border-b-2 border-[#00e701]' : 'text-[#94a3b8] hover:text-white'}`}>
              Mon profil
            </button>
            <button onClick={() => setTab('vault')}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors ${tab === 'vault' ? 'text-primary border-b-2 border-[#00e701]' : 'text-[#94a3b8] hover:text-white'}`}>
              <Lock className="w-3 h-3 inline" /> Coffre
            </button>
            <button onClick={() => setTab('rewards')}
              className={`flex-1 py-2.5 text-xs font-bold transition-colors relative ${tab === 'rewards' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-[#94a3b8] hover:text-white'}`}>
              <Gift className="w-3 h-3 inline" /> Récompenses
              {pendingRewards > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-400 text-black font-black text-[9px]">
                  {pendingRewards}
                </span>
              )}
            </button>
          </div>

          {tab === 'vault' && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-primary" />
                <span className="font-semibold text-sm text-white">Coffre sécurisé</span>
              </div>
              {vault > 0 ? (
                <>
                  <div className="bg-[rgba(0,231,1,0.1)] rounded-xl p-4 border border-[rgba(0,231,1,0.3)] text-center">
                    <p className="text-xs text-[#94a3b8] mb-1">Montant verrouillé</p>
                    <p className="font-orbitron font-black text-2xl text-primary">{vault.toFixed(2)} €</p>
                  </div>
                  <button
                    onClick={() => {
                      setVault(v => {
                        localStorage.setItem('cazyno_vault', '0');
                        return 0;
                      });
                      // Credits should be updated in Layout
                    }}
                    className="w-full py-3 rounded-xl bg-accent/15 border border-accent/30 text-accent font-semibold hover:bg-accent/25 transition-all active:scale-95">
                    <Unlock className="w-4 h-4 inline mr-1" /> Retirer du coffre
                  </button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Unlock className="w-6 h-6 mx-auto mb-2 text-[#94a3b8]" />
                  <p className="text-sm text-[#94a3b8]">Ton coffre est vide</p>
                  <p className="text-xs text-[#94a3b8] mt-2">Clique sur ton solde pour verrouiller de l'argent</p>
                </div>
              )}
            </div>
          )}

          {tab === 'profile' ? (
            <>
              {/* Rakeback */}
              <div className="p-4 border-b border-[#1a2a38]">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-yellow-400" />
                  <span className="font-semibold text-sm text-white">Rakeback</span>
                  <span className="ml-auto text-xs text-[#94a3b8]">Vos gains accumulés</span>
                </div>
                <div className="flex items-center justify-between bg-[#111a25] rounded-xl px-4 py-3">
                  <div>
                    <p className="font-orbitron font-black text-xl text-yellow-400">{rakeback.toFixed(2)} €</p>
                    <p className="text-xs text-[#94a3b8]">disponible</p>
                  </div>
                  <button onClick={handleClaim} disabled={rakeback <= 0}
                    className="px-4 py-2 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-orbitron font-bold text-sm hover:bg-yellow-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Réclamer
                  </button>
                </div>
                {claimed && (
                  <p className="text-xs text-yellow-400 font-semibold text-center mt-2 fade-up">
                    +{claimed} € ajoutés !
                  </p>
                )}
              </div>

              {/* Language selector - Mobile only */}
              <div className="md:hidden p-4 border-b border-[#1a2a38]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">Langue</span>
                  <LanguageSelector />
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                {[
                  { path: '/dashboard/leaderboard', icon: Trophy, label: 'Classement' },
                  { path: '/dashboard/stats', icon: BarChart2, label: 'Statistiques' },
                  { path: '/dashboard/transactions', icon: ArrowDownCircle, label: 'Transactions' },
                  { path: '/dashboard/affiliate', icon: Users, label: 'Programme Affilié' },
                  ...(isAdmin ? [{ path: '/dashboard/admin', icon: Shield, label: 'Admin Panel' }] : []),
                ].map(({ path, icon: Icon, label, external }) => (
                  <button key={label} onClick={() => {
                    if (external) { window.open(external, '_blank'); setOpen(false); }
                    else { navigate(path); setOpen(false); }
                  }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#111a25] transition-colors text-sm text-[#94a3b8] hover:text-white">
                    <Icon className="w-4 h-4" /> {label}
                    {external && <span className="ml-auto text-[10px] text-[#94a3b8]/50">↗</span>}
                  </button>
                ))}
                <button onClick={() => { setOpen(false); api.auth.logout(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#111a25] transition-colors text-sm text-destructive">
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </button>
              </div>
            </>
          ) : (
            <div className="max-h-[420px] overflow-y-auto">
              <RewardsPanel
                gradeRewards={gradeRewards}
                dailyReward={dailyReward}
                onClaimGrade={claimGradeReward}
                onClaimDaily={claimDailyReward}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}