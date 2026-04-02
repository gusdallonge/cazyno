import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Wallet, ChevronDown, Zap, Bell, Crown, Plus } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getLevel } from './LevelDisplay';
import WalletDropdown from './WalletDropdown';
import DepositModal from './DepositModal';

const g='#00e701', gR='rgba(0,231,1,', s='#94a3b8', m='#4b5c6f', b='#1a2a38', crd='#111a25';

const TABS = [
  { path: '/dashboard/casino', label: 'Casino' },
  { path: '/dashboard/sport', label: 'Sports' },
];

export default function Topbar({
  inline = false, onToggleSidebar, credits = 0, setCredits,
  xp = 0, addTransaction, wallet, updateWallet, isFrozen,
  rakeback, claimRakeback, gradeRewards, getDailyReward, claimGradeReward, claimDailyReward,
  newGradeReward
}) {
  const location = useLocation();
  const { user } = useAuth();
  const { current } = getLevel(xp);
  const [walletOpen, setWalletOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);

  const content = (
    <>
      {/* Left: hamburger (mobile) + logo + tabs */}
      <div className="flex items-center gap-1">
        <button onClick={onToggleSidebar} className="md:hidden p-1.5 mr-2">
          <Menu className="w-5 h-5" style={{color:s}} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2 mr-2">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{background:`linear-gradient(135deg,${gR}0.15),${gR}0.05))`, border:`1px solid ${gR}0.2)`}}>
            <Zap className="w-4 h-4" style={{color:g}} />
          </div>
          <span className="font-orbitron font-black text-[15px] tracking-[0.08em] hidden sm:block">CAZYNO</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 ml-2">
          {TABS.map(({ path, label }) => {
            const active = location.pathname.startsWith(path);
            return (
              <Link key={path} to={path}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold transition"
                style={active ? {background:g, color:'#000'} : {color:s}}>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1" />

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Level badge */}
        <Link to="/dashboard/vip" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition hover:brightness-110"
          style={{background:`${current.color}10`, border:`1px solid ${current.color}20`}}>
          <Crown className="w-3.5 h-3.5" style={{color:current.color}} />
          <span className="text-[11px] font-bold" style={{color:current.color}}>{current.label}</span>
        </Link>

        {/* Wallet button */}
        <div className="relative">
          <button onClick={() => setWalletOpen(!walletOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
            style={{background:crd, border:`1px solid ${b}`}}>
            <Wallet className="w-4 h-4" style={{color:g}} />
            <span className="font-mono text-sm font-bold" style={{color:g}}>
              {credits.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-bold" style={{color:m}}>EUR</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${walletOpen ? 'rotate-180' : ''}`} style={{color:m}} />
          </button>
          {walletOpen && (
            <WalletDropdown
              credits={credits}
              setCredits={setCredits}
              addTransaction={addTransaction}
              wallet={wallet}
              updateWallet={updateWallet}
              isFrozen={isFrozen}
              onClose={() => setWalletOpen(false)}
            />
          )}
        </div>

        {/* Deposit button */}
        <button onClick={() => setDepositOpen(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition hover:brightness-110"
          style={{background:g, color:'#000'}}>
          <Plus className="w-3.5 h-3.5" /> Deposer
        </button>

        {/* Notifications */}
        {newGradeReward && (
          <button className="p-2 relative rounded-lg transition hover:bg-white/[0.06]">
            <Bell className="w-[18px] h-[18px]" style={{color:g}} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse" style={{background:g}} />
          </button>
        )}

        {/* Avatar */}
        <Link to="/dashboard/profile" className="pl-0.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold"
            style={{background:`${current.color}15`, border:`1.5px solid ${current.color}40`, color:current.color}}>
            {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
          </div>
        </Link>
      </div>
    </>
  );

  // Portal the deposit modal to document.body so it's not clipped by overflow
  const depositModal = depositOpen
    ? createPortal(<DepositModal onClose={() => setDepositOpen(false)} />, document.body)
    : null;

  if (inline) return (
    <>
      {content}
      {depositModal}
    </>
  );

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-[56px]" style={{background:'#0c1018', borderBottom:`1px solid ${b}`}}>
        <div className="h-full flex items-center gap-2 px-3 md:px-4">{content}</div>
      </header>
      {depositModal}
    </>
  );
}
