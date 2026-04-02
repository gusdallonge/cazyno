import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Gamepad2, Dice1, Spade, Layers, TrendingUp, Circle, Bomb,
  Trophy, Gift, Users, Shield, ChevronLeft,
  Flame, Zap, Target, BarChart2, Coins, LineChart,
  Grid3X3, Gauge, Crown, Percent, Calendar, User, Settings
} from 'lucide-react';
import { getLevel } from './LevelDisplay';

const b='#1a2a38', s='#94a3b8', m='#4b5c6f';

const NAV_SECTIONS = [
  {
    label: 'JEUX',
    items: [
      { path: '/dashboard/casino', icon: Gamepad2, label: 'Casino', badge: null },
      { path: '/dashboard/sport', icon: Trophy, label: 'Sport', badge: 'LIVE' },
    ],
  },
  {
    label: 'ORIGINALS',
    items: [
      { path: '/dashboard/casino/crash', icon: TrendingUp, label: 'Crash', color: '#3b82f6' },
      { path: '/dashboard/casino/roulette', icon: Circle, label: 'Roulette', color: '#ef4444' },
      { path: '/dashboard/casino/blackjack', icon: Spade, label: 'Blackjack', color: '#22c55e' },
      { path: '/dashboard/casino/plinko', icon: Layers, label: 'Plinko', color: '#a855f7' },
      { path: '/dashboard/casino/dice', icon: Dice1, label: 'Dice', color: '#10b981' },
      { path: '/dashboard/casino/pulse-bomb', icon: Bomb, label: 'Pulse Bomb', color: '#f97316' },
      { path: '/dashboard/casino/chicken-drop', icon: Target, label: 'Chicken Drop', color: '#eab308' },
      { path: '/dashboard/casino/trader', icon: LineChart, label: 'Trader', color: '#06b6d4' },
      { path: '/dashboard/casino/mines', icon: Grid3X3, label: 'Mines', color: '#14b8a6', badge: 'NEW' },
      { path: '/dashboard/casino/limbo', icon: Gauge, label: 'Limbo', color: '#f43f5e', badge: 'NEW' },
      { path: '/dashboard/casino/keno', icon: Grid3X3, label: 'Keno', color: '#ec4899', badge: 'NEW' },
      { path: '/dashboard/casino/tower', icon: Layers, label: 'Tower', color: '#f59e0b', badge: 'NEW' },
      { path: '/dashboard/casino/coinflip', icon: Coins, label: 'Coinflip', color: '#fbbf24', badge: 'NEW' },
      { path: '/dashboard/casino/hilo', icon: TrendingUp, label: 'HiLo', color: '#6366f1', badge: 'NEW' },
      { path: '/dashboard/casino/wheel', icon: Circle, label: 'Wheel', color: '#f472b6', badge: 'NEW' },
      { path: '/dashboard/casino/video-poker', icon: Spade, label: 'Video Poker', color: '#22d3ee', badge: 'NEW' },
    ],
  },
  {
    label: 'RÉCOMPENSES',
    items: [
      { path: '/dashboard/vip', icon: Crown, label: 'Club VIP' },
      { path: '/dashboard/promotions', icon: Percent, label: 'Promotions' },
      { path: '/dashboard/rewards', icon: Calendar, label: 'Récompenses' },
      { path: '/dashboard/bonus', icon: Gift, label: 'Bonus' },
      { path: '/dashboard/leaderboard', icon: Flame, label: 'Leaderboard' },
    ],
  },
  {
    label: 'COMPTE',
    items: [
      { path: '/dashboard/stats', icon: BarChart2, label: 'Statistiques' },
      { path: '/dashboard/transactions', icon: Coins, label: 'Transactions' },
      { path: '/dashboard/affiliate', icon: Users, label: 'Affilié' },
      { path: '/dashboard/profile', icon: User, label: 'Profil' },
      { path: '/dashboard/settings', icon: Settings, label: 'Paramètres' },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle, xp = 0, isAdmin = false }) {
  const location = useLocation();
  const { current, next, progress } = getLevel(xp);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navContent = (
    <>
      {/* Nav sections */}
      <nav className={`flex-1 overflow-y-auto py-3 ${collapsed?'px-1.5':'px-2.5'} space-y-4 no-scrollbar`}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{color:m}}>
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(({ path, icon: Icon, label, badge, color }) => {
                const active = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`group flex items-center gap-3 rounded-lg transition-all duration-150 relative
                      ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'}
                      ${active
                        ? ''
                        : 'hover:bg-white/[0.03]'
                      }`}
                    style={active ? {background:'rgba(0,231,1,0.08)'} : undefined}
                    title={collapsed ? label : undefined}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" style={{color: active ? (color || '#00e701') : s}} />
                    {!collapsed && (
                      <>
                        <span className="text-[13px] font-medium truncate" style={{color: active ? '#fff' : s}}>{label}</span>
                        {badge && (
                          <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded" style={{background:'rgba(239,68,68,0.2)',color:'#ef4444'}}>
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                    {active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{background:'#00e701'}} />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Admin link */}
        {isAdmin && (
          <div>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em]" style={{color:m}}>
                ADMIN
              </p>
            )}
            <Link
              to="/dashboard/admin"
              className={`group flex items-center gap-3 rounded-lg transition-all duration-150
                ${collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'}
                ${location.pathname === '/dashboard/admin'
                  ? ''
                  : 'hover:bg-white/[0.03]'
                }`}
              style={location.pathname === '/dashboard/admin' ? {background:'rgba(239,68,68,0.1)'} : undefined}
              title={collapsed ? 'Admin' : undefined}
            >
              <Shield className="w-[18px] h-[18px] shrink-0" style={{color: location.pathname === '/dashboard/admin' ? '#ef4444' : s}} />
              {!collapsed && <span className="text-[13px] font-medium" style={{color: location.pathname === '/dashboard/admin' ? '#ef4444' : s}}>Admin Panel</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* VIP Progress Bar */}
      <div className={`p-3 ${collapsed ? 'px-2' : ''}`} style={{borderTop:`1px solid ${b}`}}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              style={{ background: `${current.color}15`, border: `1px solid ${current.color}33` }}>
              <Zap className="w-4 h-4" style={{ color: current.color }} />
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{background:`${b}`}}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: current.color }} />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-orbitron text-[11px] font-bold" style={{ color: current.color }}>
                {current.label}
              </span>
              {next && (
                <span className="text-[10px]" style={{color:m}}>
                  {next.label}
                </span>
              )}
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background:`${b}`}}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: current.color }} />
            </div>
            {next && (
              <p className="text-[10px] text-right" style={{color:m}}>
                {Math.floor(xp).toLocaleString('fr-FR')} / {next.xp.toLocaleString('fr-FR')} XP
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop: render just the nav content (wrapper provided by Layout.jsx) */}
      {navContent}

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-[280px] overflow-y-auto no-scrollbar" style={{background:'#0c1018', borderRight:`1px solid ${b}`}}>
            <div className="h-14 flex items-center justify-between px-4" style={{borderBottom:`1px solid ${b}50`}}>
              <span className="font-orbitron font-bold text-sm" style={{color:'#00e701'}}>CAZYNO</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5">
                <ChevronLeft className="w-5 h-5" style={{color:s}} />
              </button>
            </div>
            {navContent}
          </aside>
        </>
      )}
    </>
  );
}
