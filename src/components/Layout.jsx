import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronLeft, Ban } from 'lucide-react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import LiveWinTicker from './LiveWinTicker';
import MobileNav from './MobileNav';
import SupportChat from './SupportChat';
import GradeRewardPopup from './GradeRewardPopup';
import { LEVELS, getLevel } from './LevelDisplay';
import { api } from '@/api';
import { useAuth } from '@/lib/AuthContext';

function getTodayKey() { return new Date().toISOString().slice(0, 10); }

const DEFAULT_WALLET = { btc: 0, eth: 0, usdt: 0, sol: 0 };

const bg='#080c12', sbg='#0c1018', crd='#111a25', b='#1a2a38', g='#00e701', gR='rgba(0,231,1,', s='#94a3b8', m='#4b5c6f';

export default function Layout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Sidebar & Chat state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('cazyno_sidebar') === 'collapsed';
  });

  // Profile state (same as before)
  const [profile, setProfile] = useState(null);
  const [profileId, setProfileId] = useState(null);
  const [credits, setCreditsState] = useState(0);
  const [totalWagered, setTotalWagered] = useState(0);
  const [totalWon, setTotalWon] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [xp, setXp] = useState(0);
  const [rakeback, setRakeback] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [gradeRewards, setGradeRewards] = useState([]);
  const [gradeRewardPopup, setGradeRewardPopup] = useState(null);
  const [dailyStats, setDailyStats] = useState({});
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState('');
  const [wallet, setWallet] = useState(DEFAULT_WALLET);
  const [loaded, setLoaded] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isBanned, setIsBanned] = useState(false);

  const saveTimeout = useRef(null);
  const localRef = useRef({});

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('cazyno_sidebar', sidebarCollapsed ? 'collapsed' : 'expanded');
  }, [sidebarCollapsed]);

  // Dark mode always on
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Load profile from DB on mount
  useEffect(() => {
    (async () => {
      try {
        const me = await api.auth.me();
        const existing = await api.entities.UserProfile.filter({ user_email: me.email });
        let p;
        if (existing.length > 0) {
          p = existing[0];
        } else {
          p = await api.entities.UserProfile.create({
            auth_user_id: me.id,
            user_email: me.email,
            user_name: me.full_name,
            credits: 1000, xp: 0, rakeback: 0,
            total_wagered: 0, total_won: 0, games_played: 0,
            transactions: [], grade_rewards: [],
            daily_stats: {}, daily_reward_claimed: '',
            wallet: DEFAULT_WALLET,
            is_banned: false, admin_notes: '',
            last_seen: new Date().toISOString(),
          });
        }
        setProfileId(p.id);
        setProfile(p);
        setCreditsState(p.credits ?? 0);
        setTotalWagered(p.total_wagered ?? 0);
        setTotalWon(p.total_won ?? 0);
        setGamesPlayed(p.games_played ?? 0);
        setXp(p.xp ?? 0);
        setRakeback(p.rakeback ?? 0);
        setTransactions(p.transactions ?? []);
        setGradeRewards(p.grade_rewards ?? []);
        setDailyStats(p.daily_stats ?? {});
        setDailyRewardClaimed(p.daily_reward_claimed ?? '');
        setWallet(p.wallet ?? DEFAULT_WALLET);
        setIsFrozen(p.is_frozen ?? false);
        setIsBanned(p.is_banned ?? false);
        api.entities.UserProfile.update(p.id, { last_seen: new Date().toISOString() });
      } catch (e) {
        console.error('Error loading profile', e);
      }
      setLoaded(true);
    })();
  }, []);

  // Debounced save to DB
  const scheduleSave = (patch) => {
    localRef.current = { ...localRef.current, ...patch };
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      if (profileId) api.entities.UserProfile.update(profileId, localRef.current);
    }, 800);
  };

  const setCredits = (fn) => {
    setCreditsState(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      const rounded = parseFloat(next.toFixed(2));
      scheduleSave({ credits: rounded });
      return rounded;
    });
  };

  const addTransaction = (type, amount, label) => {
    const tx = { id: Date.now(), type, amount, label, date: new Date().toISOString() };
    setTransactions(prev => {
      const next = [tx, ...prev].slice(0, 100);
      scheduleSave({ transactions: next });
      return next;
    });
  };

  const updateWallet = (crypto, amount) => {
    setWallet(prev => {
      const updated = { ...prev, [crypto]: (prev[crypto] || 0) + amount };
      scheduleSave({ wallet: updated });
      return updated;
    });
  };

  const addXp = (betAmount, winAmount = 0) => {
    const rb = betAmount * 0.001;
    const today = getTodayKey();

    setXp(prevXp => {
      const oldLevel = getLevel(prevXp);
      const newXp = prevXp + Math.floor(betAmount);
      const newLevel = getLevel(newXp);

      let newGradeRewards = [...(localRef.current.grade_rewards || gradeRewards)];
      if (oldLevel.current.name !== newLevel.current.name) {
        const reward = parseFloat((newLevel.current.xp * 0.0015).toFixed(2));
        const alreadyExists = newGradeRewards.some(r => r.gradeName === newLevel.current.name);
        if (!alreadyExists && newLevel.current.name) {
          const newReward = {
            gradeName: newLevel.current.name,
            gradeLabel: newLevel.current.label,
            xpRequired: newLevel.current.xp,
            amount: reward,
            claimed: false,
          };
          newGradeRewards = [...newGradeRewards, newReward];
          setGradeRewards(newGradeRewards);
          setGradeRewardPopup(newReward);
          scheduleSave({ grade_rewards: newGradeRewards });
        }
      }

      setRakeback(prevRb => {
        const next = parseFloat((prevRb + rb).toFixed(2));
        scheduleSave({ rakeback: next });
        return next;
      });

      setDailyStats(prev => {
        const day = prev[today] || { wagered: 0, won: 0 };
        const updated = { ...prev, [today]: { wagered: day.wagered + betAmount, won: day.won + winAmount } };
        const newTotalWagered = (localRef.current.total_wagered || totalWagered) + betAmount;
        const newTotalWon = (localRef.current.total_won || totalWon) + winAmount;
        const newGamesPlayed = (localRef.current.games_played || gamesPlayed) + 1;
        setTotalWagered(newTotalWagered);
        setTotalWon(newTotalWon);
        setGamesPlayed(newGamesPlayed);
        scheduleSave({
          xp: newXp, daily_stats: updated,
          total_wagered: newTotalWagered, total_won: newTotalWon, games_played: newGamesPlayed,
        });
        return updated;
      });

      return newXp;
    });
  };

  const claimRakeback = () => {
    if (rakeback <= 0) return 0;
    const amount = rakeback;
    setCredits(c => c + amount);
    setRakeback(0);
    scheduleSave({ rakeback: 0 });
    return amount;
  };

  const claimGradeReward = (index) => {
    const r = gradeRewards[index];
    if (!r || r.claimed) return 0;
    setCredits(c => c + r.amount);
    setGradeRewards(prev => {
      const updated = prev.map((x, i) => i === index ? { ...x, claimed: true } : x);
      scheduleSave({ grade_rewards: updated });
      return updated;
    });
    return r.amount;
  };

  const getDailyReward = () => {
    const today = getTodayKey();
    const stats = dailyStats[today];
    if (!stats || stats.wagered === 0) return null;
    const isWinner = stats.won > stats.wagered;
    const losses = Math.max(0, stats.wagered - stats.won);
    const amount = isWinner
      ? parseFloat((stats.wagered * 0.0015).toFixed(2))
      : parseFloat((losses * 0.01).toFixed(2));
    const claimed = dailyRewardClaimed === today;
    return { totalWagered: stats.wagered, won: stats.won, isWinner, amount, claimed };
  };

  const claimDailyReward = () => {
    const r = getDailyReward();
    if (!r || r.claimed || r.amount <= 0) return 0;
    setCredits(c => c + r.amount);
    const today = getTodayKey();
    setDailyRewardClaimed(today);
    scheduleSave({ daily_reward_claimed: today });
    return r.amount;
  };

  // Loading
  if (!loaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{background:bg}}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 rounded-full animate-spin" style={{borderColor:`${gR}0.3)`,borderTopColor:g}} />
          <span className="font-orbitron text-xs tracking-widest" style={{color:m}}>LOADING</span>
        </div>
      </div>
    );
  }

  // Banned
  if (isBanned) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{background:bg}}>
        <div className="max-w-md w-full text-center space-y-6">
          <Ban className="w-16 h-16 mx-auto text-red-500" />
          <h1 className="font-orbitron text-3xl font-black" style={{color:'#ef4444'}}>BANNI</h1>
          <p className="text-sm leading-relaxed" style={{color:s}}>
            Votre compte a été suspendu. Contactez le support si vous pensez qu'il s'agit d'une erreur.
          </p>
          <p className="text-xs" style={{color:m}}>{profile?.user_email}</p>
        </div>
        <SupportChat />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background:bg, color:'#fff', fontFamily:"'Satoshi',sans-serif"}}>
      <div className="rotating-glow"/>
      <div className="relative z-10 flex gap-2.5 p-2.5">

        {/* ══════ SIDEBAR ══════ */}
        <div className={`hidden md:block shrink-0 sticky top-2.5 h-[calc(100vh-20px)] transition-all duration-300 ${sidebarCollapsed?'w-[68px]':'w-[220px]'}`}>
          <aside className="h-full flex flex-col rounded-2xl overflow-y-auto no-scrollbar" style={{background:sbg, border:`1px solid ${b}`, boxShadow:`0 0 30px ${gR}0.05)`}}>
            {/* Collapse toggle */}
            <div className={`flex ${sidebarCollapsed?'justify-center':'justify-between items-center px-4'} pt-4 pb-2`}>
              {!sidebarCollapsed && <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{color:m}}>Menu</span>}
              <button onClick={()=>setSidebarCollapsed(c=>!c)} className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-white/[0.06]" style={{background:crd, border:`1px solid ${b}`}}>
                <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed?'rotate-180':''}`} style={{color:s}}/>
              </button>
            </div>

            {/* Nav items rendered by Sidebar component (content only) */}
            <Sidebar collapsed={sidebarCollapsed} onToggle={()=>setSidebarCollapsed(c=>!c)} xp={xp} isAdmin={isAdmin} />
          </aside>
        </div>

        {/* ══════ MAIN CONTENT ══════ */}
        <main className="flex-1 min-w-0 h-[calc(100vh-20px)] sticky top-2.5 rounded-2xl overflow-y-auto no-scrollbar" style={{background:sbg, border:`1px solid ${b}`, boxShadow:`0 0 30px ${gR}0.05)`}}>

          {/* Header sticky INSIDE the scroll */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 backdrop-blur-xl" style={{background:`${sbg}e8`, borderBottom:`1px solid ${b}50`}}>
            <Topbar
              inline
              onToggleSidebar={() => setSidebarCollapsed(c => !c)}
              onSearch={() => {}}
              credits={credits}
              setCredits={setCredits}
              xp={xp}
              addTransaction={addTransaction}
              wallet={wallet}
              updateWallet={updateWallet}
              isFrozen={isFrozen}
              rakeback={rakeback}
              claimRakeback={claimRakeback}
              gradeRewards={gradeRewards}
              getDailyReward={getDailyReward}
              claimGradeReward={claimGradeReward}
              claimDailyReward={claimDailyReward}
              newGradeReward={gradeRewardPopup}
            />
          </div>

          {/* Page content */}
          <div className="px-5 py-4 pb-16">
            <Outlet context={{
              credits, setCredits, xp, addXp, rakeback, claimRakeback,
              transactions, addTransaction, totalWagered, totalWon, gamesPlayed
            }} />
          </div>

          {/* Live Win Ticker — fixed at bottom of main block */}
          <div className="sticky bottom-0 z-20" style={{borderTop:`1px solid ${b}50`}}>
            <LiveWinTicker />
          </div>
        </main>
      </div>

      {/* Chat panel */}

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Support chat bubble */}
      <SupportChat />

      {/* Grade reward popup */}
      {gradeRewardPopup && (
        <GradeRewardPopup
          reward={gradeRewardPopup}
          onClose={() => setGradeRewardPopup(null)}
          onClaim={() => {
            const idx = gradeRewards.findIndex(r => r.gradeName === gradeRewardPopup.gradeName);
            if (idx >= 0) claimGradeReward(idx);
            setGradeRewardPopup(null);
          }}
        />
      )}
    </div>
  );
}
