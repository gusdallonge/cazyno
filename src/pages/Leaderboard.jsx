import { useOutletContext } from 'react-router-dom';
import { Trophy, Crown, Timer, Medal, User, Gamepad2, ArrowLeft } from 'lucide-react';
import { getLevel } from '../components/LevelDisplay';
import { useLang, t } from '../lib/i18n';

function fmt(n) { return Number(n).toLocaleString('fr-FR'); }

const PRIZES = [
  { rank: 1, amount: 30000, color: '#FFD700' },
  { rank: 2, amount: 20000, color: '#C0C0C0' },
  { rank: 3, amount: 10000, color: '#CD7F32' },
  { rank: 4, amount: 8000, color: '#7DF9FF' },
  { rank: 5, amount: 6000, color: '#7DF9FF' },
  { rank: 6, amount: 5000, color: '#A8D8EA' },
  { rank: 7, amount: 4000, color: '#A8D8EA' },
  { rank: 8, amount: 4000, color: '#888' },
  { rank: 9, amount: 3000, color: '#888' },
  { rank: 10, amount: 3000, color: '#888' },
  { rank: 11, amount: 2000, color: '#666' },
  { rank: 12, amount: 2000, color: '#666' },
  { rank: 13, amount: 1000, color: '#555' },
  { rank: 14, amount: 1000, color: '#555' },
  { rank: 15, amount: 1000, color: '#555' },
];

const FAKE_PLAYERS = [
  { name: 'BlackKing97',  wagered: 8420000, level: 'LEGEND' },
  { name: 'NightFox',     wagered: 6150000, level: 'Oxygene II' },
  { name: 'HighRoller',   wagered: 4890000, level: 'Oxygene I' },
  { name: 'Phantom_X',    wagered: 3340000, level: 'Diamant II' },
  { name: 'AceOfSpades',  wagered: 2920000, level: 'Diamant II' },
  { name: 'DiamondHands', wagered: 2180000, level: 'Diamant I' },
  { name: 'LuckyStrike',  wagered: 1640000, level: 'Diamant' },
  { name: 'VipLounger',   wagered: 1280000, level: 'Platine' },
  { name: 'CazynoKing',   wagered: 950000,  level: 'Gold' },
  { name: 'EpicBet',      wagered: 720000,  level: 'Gold' },
  { name: 'ProGambler',   wagered: 540000,  level: 'Silver' },
  { name: 'BigSpender',   wagered: 380000,  level: 'Silver' },
  { name: 'RiskTaker99',  wagered: 250000,  level: 'Silver' },
  { name: 'AllInAlpha',   wagered: 180000,  level: 'Silver' },
  { name: 'JackpotJoe',   wagered: 120000,  level: 'Silver' },
];

const RANK_ICON_MAP = { null: Gamepad2, Silver: Medal, Gold: Trophy, Platine: Medal, Diamond: Crown, Diamond1: Crown, Diamond2: Crown, Oxygen1: Crown, Oxygen2: Crown, Legend: Crown };

const now = new Date();
const cycleStart = new Date(now.getFullYear(), now.getMonth(), 1);
const cycleEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
const daysLeft = Math.ceil((cycleEnd - now) / 86400000);
const pctElapsed = Math.round(((now - cycleStart) / (cycleEnd - cycleStart)) * 100);

export default function Leaderboard() {
  const { xp } = useOutletContext();
  const lang = useLang();
  const { current } = getLevel(xp);

  const myEntry = { name: 'Moi', wagered: xp, isMe: true, level: current.label };
  const allPlayers = [...FAKE_PLAYERS, myEntry].sort((a, b) => b.wagered - a.wagered).slice(0, 20);
  const myRank = allPlayers.findIndex(p => p.isMe) + 1;
  const myPrize = PRIZES[myRank - 1];

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Cycle timer block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-base">{t(lang, 'lb_title')}</h2>
          </div>
          <span className="text-xs font-semibold" style={{color:'#eab308'}}>{t(lang, 'lb_subtitle')} <span className="font-bold">100 000 EUR</span></span>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4" style={{color:'#eab308'}} />
              <span className="font-semibold text-sm text-white">{t(lang, 'lb_cycle')}</span>
            </div>
            <span className="font-orbitron font-black text-sm" style={{color:'#eab308'}}>{daysLeft} {t(lang, 'lb_days_left')}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{background:'#0b1219'}}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pctElapsed}%`, background: 'linear-gradient(to right, #eab308, #fde68a)' }} />
          </div>
          <p className="text-xs mt-1" style={{color:'#94a3b8'}}>{pctElapsed}{t(lang, 'lb_elapsed')}</p>
        </div>
      </div>

      {/* Podium block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5" style={{color:'#FFD700'}} />
            <h2 className="font-orbitron font-black text-white text-sm">Podium</h2>
          </div>
        </div>
        <div className="px-5 py-5">
          <div className="grid grid-cols-3 gap-3">
            {[allPlayers[1], allPlayers[0], allPlayers[2]].map((p, i) => {
              const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3;
              const prize = PRIZES[actualRank - 1];
              const heights = ['h-28', 'h-36', 'h-24'];
              return p ? (
                <div key={p.name} className={`flex flex-col items-center justify-end ${heights[i]} rounded-2xl p-4`}
                  style={{ border: `1px solid ${prize.color}55`, background: `${prize.color}08` }}>
                  <div className="mb-1"><User className="w-7 h-7 mx-auto" style={{ color: prize.color }} /></div>
                  <p className="font-orbitron font-bold text-xs text-center" style={{ color: prize.color }}>{p.name}</p>
                  <p className="text-[10px]" style={{color:'#94a3b8'}}>{fmt(p.wagered)} EUR</p>
                  <div className="mt-1 px-2 py-0.5 rounded-full font-orbitron font-black text-xs" style={{ background: prize.color + '22', color: prize.color }}>
                    #{actualRank} {fmt(prize.amount)} EUR
                  </div>
                </div>
              ) : <div key={i} />;
            })}
          </div>
        </div>
      </div>

      {/* My position */}
      <div className="rounded-2xl px-5 py-4 flex items-center gap-4" style={{background:'rgba(0,231,1,0.08)', border:'2px solid rgba(0,231,1,0.4)'}}>
        <div className="font-orbitron font-black text-3xl" style={{color:'#00e701'}}>#{myRank}</div>
        <div className="flex-1">
          <p className="font-orbitron font-bold text-white text-sm flex items-center gap-1">{t(lang, 'lb_my_pos')} {(() => { const RIcon = RANK_ICON_MAP[current.name] || Gamepad2; return <RIcon className="w-4 h-4 inline" style={{ color: current.color }} />; })()} {current.label}</p>
          <p className="text-xs" style={{color:'#94a3b8'}}>{fmt(xp)} {t(lang, 'lb_wagered_month')}</p>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{color:'#94a3b8'}}>{t(lang, 'lb_est_reward')}</p>
          <p className="font-orbitron font-black text-xl" style={{ color: myPrize?.color || '#888' }}>
            {myPrize ? `${fmt(myPrize.amount)} EUR` : t(lang, 'lb_outside_top')}
          </p>
        </div>
      </div>

      {/* Table block */}
      <div className="rounded-2xl overflow-hidden" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Medal className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">Classement</h2>
          </div>
        </div>
        <div className="px-5 py-3 flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f', borderBottom:'1px solid #1a2a38'}}>
          <span className="w-10">#</span>
          <span className="flex-1">{t(lang, 'lb_player')}</span>
          <span className="hidden sm:block w-28">{t(lang, 'lb_level')}</span>
          <span className="w-28 text-right">{t(lang, 'lb_wagered')}</span>
          <span className="w-24 text-right">{t(lang, 'lb_reward')}</span>
        </div>
        {allPlayers.map((player, i) => {
          const rank = i + 1;
          const prize = PRIZES[rank - 1];
          return (
            <div key={player.name}
              className="flex items-center gap-3 px-5 py-3 transition-colors"
              style={{
                borderBottom:'1px solid rgba(26,42,56,0.4)',
                background: player.isMe ? 'rgba(0,231,1,0.06)' : rank <= 3 ? 'rgba(234,179,8,0.03)' : 'transparent',
                borderLeft: player.isMe ? '2px solid #00e701' : '2px solid transparent'
              }}>
              <div className="w-10 text-center">
                {rank === 1 ? <Trophy className="w-5 h-5 mx-auto" style={{ color: '#FFD700' }} />
                  : rank === 2 ? <Medal className="w-5 h-5 mx-auto" style={{ color: '#C0C0C0' }} />
                  : rank === 3 ? <Medal className="w-5 h-5 mx-auto" style={{ color: '#CD7F32' }} />
                  : <span className="font-orbitron font-bold text-sm" style={{color:'#94a3b8'}}>{rank}</span>}
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{background:'#111a25', border:'1px solid #1a2a38'}}><User className="w-4 h-4" style={{color:'#94a3b8'}} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-orbitron font-bold text-sm truncate" style={{color: player.isMe ? '#00e701' : '#fff'}}>
                  {player.name}{player.isMe && <ArrowLeft className="w-3 h-3 inline ml-1" />}
                </p>
              </div>
              <span className="hidden sm:block w-28 text-xs" style={{color:'#94a3b8'}}>{player.level}</span>
              <span className="w-28 text-right font-orbitron font-bold text-xs text-white">{fmt(player.wagered)} EUR</span>
              <div className="w-24 text-right">
                {prize
                  ? <span className="font-orbitron font-black text-sm" style={{ color: prize.color }}>{fmt(prize.amount)} EUR</span>
                  : <span className="text-xs" style={{color:'rgba(148,163,184,0.5)'}}>--</span>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-center" style={{color:'#94a3b8'}}>{t(lang, 'lb_realtime')}</p>
    </div>
  );
}
