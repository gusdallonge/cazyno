import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Gift, Check, Flame, Calendar, Star } from 'lucide-react';

const REWARD_SCHEDULE = {
  1: 0.5, 2: 0.5, 3: 0.5, 4: 1, 5: 1, 6: 1, 7: 2,
  8: 1, 9: 1, 10: 1, 11: 2, 12: 2, 13: 2, 14: 5,
  15: 2, 16: 2, 17: 3, 18: 3, 19: 3, 20: 5, 21: 10,
  22: 3, 23: 3, 24: 5, 25: 5, 26: 5, 27: 10, 28: 25,
  29: 10, 30: 50, 31: 50,
};

const DAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS_FR = ['Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'];

export default function RewardsCalendar() {
  const { credits, setCredits } = useOutletContext();
  const storageKey = 'cazyno_rewards_claimed';

  const [claimed, setClaimed] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
  });

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();
  const todayKey = `${year}-${month}-${today}`;

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [year, month]);

  const streak = useMemo(() => {
    let s = 0;
    for (let d = today; d >= 1; d--) {
      if (claimed[`${year}-${month}-${d}`]) s++;
      else break;
    }
    return s;
  }, [claimed, today, year, month]);

  const totalClaimed = Object.values(claimed).reduce((sum, v) => sum + (v || 0), 0);

  const claimToday = () => {
    if (claimed[todayKey]) return;
    const reward = REWARD_SCHEDULE[today] || 0.5;
    const multiplier = streak >= 7 ? 2 : streak >= 3 ? 1.5 : 1;
    const amount = parseFloat((reward * multiplier).toFixed(2));
    const next = { ...claimed, [todayKey]: amount };
    setClaimed(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    setCredits(c => c + amount);
  };

  const todayReward = REWARD_SCHEDULE[today] || 0.5;
  const todayClaimed = !!claimed[todayKey];

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Serie actuelle', value: `${streak} jour${streak > 1 ? 's' : ''}`, icon: Flame, color: '#f97316' },
          { label: 'Total reclame', value: `$${totalClaimed.toFixed(2)}`, icon: Star, color: '#eab308' },
          { label: 'Multiplicateur', value: streak >= 7 ? 'x2' : streak >= 3 ? 'x1.5' : 'x1', icon: Gift, color: '#00e701' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
            <Icon className="w-5 h-5 mx-auto mb-2" style={{color}} />
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'#4b5c6f'}}>{label}</p>
            <p className="font-orbitron font-bold text-white text-sm">{value}</p>
          </div>
        ))}
      </div>

      {/* Claim button block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">Recompense du jour</h2>
          </div>
        </div>
        <div className="px-5 py-6 text-center">
          <p className="font-orbitron text-3xl font-black mb-4" style={{color:'#00e701'}}>${todayReward.toFixed(2)}</p>
          {todayClaimed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold" style={{background:'rgba(0,231,1,0.1)', color:'#00e701'}}>
              <Check className="w-5 h-5" /> Deja reclame aujourd'hui
            </div>
          ) : (
            <button onClick={claimToday}
              className="rounded-xl font-bold px-8 py-3 font-orbitron text-sm animate-pulse"
              style={{background:'#00e701', color:'#000'}}>
              Reclamer ${todayReward.toFixed(2)}
            </button>
          )}
        </div>
      </div>

      {/* Calendar grid block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">{MONTHS_FR[month]} {year}</h2>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_FR.map(d => (
              <div key={d} className="text-center text-[10px] font-bold py-1" style={{color:'#4b5c6f'}}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const dayKey = `${year}-${month}-${day}`;
              const isClaimed = !!claimed[dayKey];
              const isToday = day === today;
              const isPast = day < today;
              const reward = REWARD_SCHEDULE[day] || 0.5;

              return (
                <div key={dayKey}
                  className="rounded-xl p-2 text-center transition-all min-h-[52px] flex flex-col items-center justify-center"
                  style={
                    isToday && !isClaimed ? { background:'rgba(0,231,1,0.12)', border:'1px solid rgba(0,231,1,0.4)' } :
                    isClaimed ? { background:'rgba(0,231,1,0.08)', border:'1px solid rgba(0,231,1,0.2)' } :
                    isPast ? { background:'#111a25', border:'1px solid transparent', opacity: 0.4 } :
                    { background:'#111a25', border:'1px solid rgba(26,42,56,0.4)' }
                  }>
                  <span className="text-[10px] font-bold" style={{color: isToday ? '#00e701' : '#94a3b8'}}>{day}</span>
                  {isClaimed ? (
                    <Check className="w-3.5 h-3.5 mt-0.5" style={{color:'#00e701'}} />
                  ) : isPast ? (
                    <span className="text-[9px] mt-0.5" style={{color:'#94a3b8'}}>--</span>
                  ) : (
                    <span className="text-[9px] mt-0.5" style={{color:'#94a3b8'}}>${reward}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Streak info */}
      <div className="rounded-2xl p-4 text-center" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <p className="text-xs" style={{color:'#94a3b8'}}>
          3 jours consecutifs = multiplicateur x1.5 -- 7 jours consecutifs = multiplicateur x2
        </p>
      </div>
    </div>
  );
}
