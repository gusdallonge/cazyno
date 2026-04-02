import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Target, Zap, BarChart2, TrendingDown, Gamepad2, Medal, Trophy, Crown, Gem } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getLevel } from '../components/LevelDisplay';
import { useLang, t } from '../lib/i18n';

function fmt(n) { return Number(parseFloat(n || 0)).toLocaleString('fr-FR'); }

export default function Stats() {
  const { xp, credits, transactions, totalWagered, totalWon, gamesPlayed } = useOutletContext();
  const lang = useLang();
  const { current, next, progress } = getLevel(xp);

  const totalDeposited = transactions.filter(tr => tr.type === 'deposit').reduce((s, tr) => s + tr.amount, 0);
  const totalLost = Math.max(0, (totalWagered || 0) - (totalWon || 0));
  const netResult = (totalWon || 0) - (totalWagered || 0);
  const roi = (totalWagered || 0) > 0 ? (((totalWon || 0) / totalWagered - 1) * 100).toFixed(1) : '0.0';

  const cards = [
    { label: t(lang, 'stats_total_wagered'), value: `${fmt(totalWagered)} EUR`, icon: Target, color: '#3b82f6' },
    { label: t(lang, 'stats_total_deposited'), value: `${fmt(totalDeposited)} EUR`, icon: Zap, color: '#eab308' },
    { label: t(lang, 'stats_total_won'), value: `${fmt(totalWon)} EUR`, icon: TrendingUp, color: '#00e701' },
    { label: 'Total perdu', value: `${fmt(totalLost)} EUR`, icon: TrendingDown, color: '#ef4444' },
    { label: t(lang, 'stats_current_balance'), value: `${fmt(credits)} EUR`, icon: BarChart2, color: '#a855f7' },
    { label: 'Resultat net', value: `${netResult >= 0 ? '+' : ''}${fmt(netResult)} EUR`, icon: netResult >= 0 ? TrendingUp : TrendingDown, color: netResult >= 0 ? '#00e701' : '#ef4444' },
  ];

  const chartData = (() => {
    let balance = 0;
    const sorted = [...transactions].reverse();
    return sorted.slice(-20).map((tr, i) => {
      balance += tr.amount || 0;
      return { name: i + 1, solde: parseFloat(balance.toFixed(2)) };
    });
  })();

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Level block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            {(() => { const iconMap = { null: Gamepad2, Silver: Medal, Gold: Trophy, Legend: Crown }; const LvlIcon = iconMap[current.name] || Gem; return <LvlIcon className="w-5 h-5" style={{ color: current.color }} />; })()}
            <h2 className="font-orbitron font-black text-white text-base">{t(lang, 'stats_title')}</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>{t(lang, 'stats_subtitle')}</span>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: `${current.color}22`, border: `2px solid ${current.color}55` }}>
              {(() => { const iconMap = { null: Gamepad2, Silver: Medal, Gold: Trophy, Legend: Crown }; const LvlIcon = iconMap[current.name] || Gem; return <LvlIcon className="w-8 h-8" style={{ color: current.color }} />; })()}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-orbitron font-black text-xl" style={{ color: current.color }}>{current.label}</span>
                <span className="font-orbitron font-bold text-white">{Math.floor(progress)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full overflow-hidden mb-1" style={{background:'#111a25'}}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: current.color }} />
              </div>
              {next && (
                <p className="text-xs" style={{color:'#94a3b8'}}>
                  {t(lang, 'stats_next_rank')} : <span style={{ color: next.color }}>{next.label}</span> a {fmt(next.xp)} {t(lang, 'stats_wagered_at')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{color}} />
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>{label}</span>
            </div>
            <p className="font-orbitron font-black text-2xl" style={{color}}>{value}</p>
          </div>
        ))}
      </div>

      {/* Chart block */}
      {chartData.length >= 2 && (
        <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{color:'#00e701'}} />
              <h2 className="font-orbitron font-black text-white text-sm">Evolution du solde</h2>
            </div>
          </div>
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#111a25', border: '1px solid #1a2a38', borderRadius: 12, color: '#00e701' }}
                  formatter={(v) => [`${v} EUR`, 'Solde']}
                />
                <Line type="monotone" dataKey="solde" stroke="#00e701" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Breakdown block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">{t(lang, 'stats_breakdown')}</h2>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          {[
            { game: 'Roulette', pct: 35, color: '#ef4444' },
            { game: 'Blackjack', pct: 28, color: '#FFD700' },
            { game: t(lang, 'sport_title'), pct: 22, color: '#22c55e' },
            { game: 'Dice', pct: 10, color: '#3b82f6' },
            { game: 'Plinko', pct: 5, color: '#a855f7' },
          ].map(({ game, pct, color }) => (
            <div key={game}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{color:'#94a3b8'}}>{game}</span>
                <span className="font-orbitron font-bold text-white">{pct}%</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{background:'#0b1219'}}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-5 text-center" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'#4b5c6f'}}>{t(lang, 'stats_games_played')}</p>
          <p className="font-orbitron font-black text-3xl text-white">{gamesPlayed || 0}</p>
        </div>
        <div className="rounded-2xl p-5 text-center" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'#4b5c6f'}}>{t(lang, 'stats_roi')}</p>
          <p className="font-orbitron font-black text-3xl" style={{color: parseFloat(roi) >= 0 ? '#00e701' : '#ef4444'}}>
            {parseFloat(roi) >= 0 ? '+' : ''}{roi}%
          </p>
        </div>
      </div>
    </div>
  );
}
