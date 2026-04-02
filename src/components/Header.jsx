import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Zap, Spade, Trophy } from 'lucide-react';
import TopUpModal from './TopUpModal';
import ProfileMenu from './ProfileMenu';
import LanguageSelector from './LanguageSelector';
import CurrencySelector, { formatAmount } from './CurrencySelector';
import BalancePopup from './BalancePopup';
import VaultModal from './VaultModal';
import WithdrawModal from './WithdrawModal';
import { useLang, t } from '../lib/i18n';
import { useAuth } from '../lib/AuthContext';

export default function Header({ credits, setCredits, dark, setDark, xp, rakeback, claimRakeback, addTransaction, gradeRewards, getDailyReward, claimGradeReward, claimDailyReward, newGradeReward, wallet, updateWallet, isFrozen }) {
  const { isAuthenticated, navigateToLogin } = useAuth();
  const location = useLocation();
  const lang = useLang();
  const [showTopUp, setShowTopUp] = useState(false);
  const [showBalancePopup, setShowBalancePopup] = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [currency, setCurrency] = useState(() => localStorage.getItem('cazyno_currency') || 'EUR');
  const [vault, setVault] = useState(() => parseFloat(localStorage.getItem('cazyno_vault') || '0'));
  const [showNotif, setShowNotif] = useState(!!newGradeReward);

  const handleSetCurrency = (c) => {
    setCurrency(c);
    localStorage.setItem('cazyno_currency', c);
  };

  const handleVault = (amount) => {
    setCredits(c => c - amount);
    setVault(v => {
      const newVault = v + amount;
      localStorage.setItem('cazyno_vault', newVault.toFixed(2));
      return newVault;
    });
    setShowVault(false);
    setShowBalancePopup(false);
  };

  const handleWithdraw = (crypto, amount) => {
    setCredits(c => c - amount);
    updateWallet(crypto.id, amount);
    addTransaction('withdraw', amount, `Retrait ${crypto.symbol}`);
    setShowWithdraw(false);
    setShowBalancePopup(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
    <header className="sticky top-0 z-50 w-full"
      style={{ background:'rgba(6,8,16,0.88)', borderBottom:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', boxShadow:'0 4px 32px rgba(0,0,0,0.5)' }}>

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex max-w-7xl mx-auto px-6 h-16 items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center overflow-hidden border border-[#00e701]/40"
            style={{ boxShadow:'0 0 12px rgba(0,255,102,0.3)' }}>
            <img src="/logo.png" alt="Cazyno" className="w-full h-full object-cover"/>
          </div>
          <span className="font-orbitron font-black text-sm tracking-widest" style={{ color:'#00e701', textShadow:'0 0 12px rgba(0,255,102,0.5)' }}>CAZYNO</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {[{ path:'/dashboard/casino', label: t(lang,'casino'), icon:Spade }, { path:'/dashboard/sport', label: t(lang,'sport'), icon:Trophy }].map(({ path, label, icon:Icon }) => (
            <Link key={path} to={path}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                isActive(path)
                  ? 'text-primary'
                  : 'text-white/45 hover:text-white/80'
              }`}
              style={isActive(path) ? { background:'rgba(0,255,102,0.1)', border:'1px solid rgba(0,255,102,0.25)' } : {}}>
              <Icon className="w-3.5 h-3.5"/>{label}
            </Link>
          ))}
        </nav>

        {/* Balance */}
        {isAuthenticated && (
          <div className="flex items-center gap-1 rounded-xl px-3 py-2 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background:'rgba(0,255,102,0.08)', border:'1px solid rgba(0,255,102,0.22)' }}
            onClick={() => setShowBalancePopup(true)}>
            <Zap className="w-4 h-4 text-primary shrink-0"/>
            <span className="font-orbitron font-bold text-primary text-sm tracking-widest">{formatAmount(credits, currency)}</span>
            <div className="w-px h-4 mx-1" style={{ background:'rgba(0,255,102,0.2)' }}/>
            <CurrencySelector currency={currency} setCurrency={handleSetCurrency}/>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <LanguageSelector/>

          {showNotif && newGradeReward && (
            <button onClick={() => setShowNotif(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-black animate-pulse"
              style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow:'0 0 14px rgba(34,197,94,0.5)' }}>
              +{newGradeReward.amount.toLocaleString('fr-FR')} €
            </button>
          )}

          {isAuthenticated ? (
            <ProfileMenu xp={xp} rakeback={rakeback} claimRakeback={claimRakeback} gradeRewards={gradeRewards} getDailyReward={getDailyReward} claimGradeReward={claimGradeReward} claimDailyReward={claimDailyReward} vault={vault} setVault={setVault}/>
          ) : (
            <button onClick={navigateToLogin}
              className="bg-[#00e701] text-black rounded-xl font-bold px-5 py-2 text-sm font-orbitron font-bold">
              S'inscrire / Connexion
            </button>
          )}
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="md:hidden px-3 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center overflow-hidden border border-[#00e701]/40"
            style={{ boxShadow:'0 0 8px rgba(0,255,102,0.3)' }}>
            <img src="/logo.png" alt="Cazyno" className="w-full h-full object-cover"/>
          </div>
          <span className="font-orbitron font-black text-xs tracking-widest" style={{ color:'#00e701' }}>CAZYNO</span>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 cursor-pointer"
            style={{ background:'rgba(0,255,102,0.08)', border:'1px solid rgba(0,255,102,0.22)' }}
            onClick={() => setShowBalancePopup(true)}>
            <Zap className="w-3.5 h-3.5 text-primary shrink-0"/>
            <span className="font-orbitron font-bold text-primary text-xs tracking-widest">{formatAmount(credits, currency)}</span>
            <div className="w-px h-3.5 mx-0.5" style={{ background:'rgba(0,255,102,0.2)' }}/>
            <CurrencySelector currency={currency} setCurrency={handleSetCurrency}/>
          </div>
        )}

        <div className="flex items-center gap-1">
          {showNotif && newGradeReward && (
            <button onClick={() => setShowNotif(false)}
              className="px-2 py-1 rounded-lg text-[10px] font-bold text-black animate-pulse"
              style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>
              +{newGradeReward.amount.toLocaleString('fr-FR')} €
            </button>
          )}
          {isAuthenticated ? (
            <ProfileMenu xp={xp} rakeback={rakeback} claimRakeback={claimRakeback} gradeRewards={gradeRewards} getDailyReward={getDailyReward} claimGradeReward={claimGradeReward} claimDailyReward={claimDailyReward} vault={vault} setVault={setVault}/>
          ) : (
            <button onClick={navigateToLogin}
              className="bg-[#00e701] text-black rounded-xl font-bold px-3 py-1.5 text-[10px] font-orbitron font-bold">
              Connexion
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex gap-2 px-3 pb-2" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
        {[{ path:'/dashboard/casino', label: t(lang,'casino'), icon:Spade }, { path:'/dashboard/sport', label: t(lang,'sport'), icon:Trophy }].map(({ path, label, icon:Icon }) => (
          <Link key={path} to={path}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isActive(path) ? 'text-primary' : 'text-white/40'
            }`}
            style={isActive(path) ? { background:'rgba(0,255,102,0.1)', border:'1px solid rgba(0,255,102,0.25)' } : { background:'rgba(255,255,255,0.03)' }}>
            <Icon className="w-3 h-3"/>{label}
          </Link>
        ))}
      </div>

      {/* Modals */}
      {showBalancePopup && <BalancePopup credits={credits} vault={vault} onDeposit={() => { setShowBalancePopup(false); setShowTopUp(true); }} onVault={() => { setShowBalancePopup(false); setShowVault(true); }} onWithdraw={() => { setShowBalancePopup(false); setShowWithdraw(true); }} onClose={() => setShowBalancePopup(false)}/>}
      {showTopUp && <TopUpModal onClose={() => setShowTopUp(false)} onTopUp={amount => { setCredits(c => c + amount); addTransaction('deposit', amount, 'Dépôt crypto'); setShowTopUp(false); }}/>}
      {showVault && <VaultModal credits={credits} vault={vault} onDeposit={handleVault} onClose={() => setShowVault(false)}/>}
      {showWithdraw && <WithdrawModal credits={credits} onWithdraw={handleWithdraw} onClose={() => setShowWithdraw(false)} isFrozen={isFrozen}/>}
    </header>
    </>
  );
}