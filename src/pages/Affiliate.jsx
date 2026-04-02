import { useState } from 'react';
import { Copy, Check, Users, TrendingUp, Wallet, ArrowDownToLine, Gift, Link2, Medal, Trophy, Gem, Landmark, Zap } from 'lucide-react';
import { useLang, t } from '../lib/i18n';

function generateRefCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CZY-';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function fmt(n) { return Number(n).toFixed(2).replace('.', ','); }

const TIERS = [
  { name: 'Bronze', minRefs: 0,  commission: 0.05, color: '#cd7f32' },
  { name: 'Silver', minRefs: 5,  commission: 0.08, color: '#C0C0C0' },
  { name: 'Gold',   minRefs: 20, commission: 0.12, color: '#FFD700' },
  { name: 'VIP',    minRefs: 50, commission: 0.15, color: '#22c55e' },
];

function getTier(refs) {
  let tier = TIERS[0];
  for (const tr of TIERS) if (refs >= tr.minRefs) tier = tr;
  return tier;
}

export default function Affiliate() {
  const lang = useLang();
  const [refCode] = useState(() => {
    let code = localStorage.getItem('cazyno_ref_code');
    if (!code) { code = generateRefCode(); localStorage.setItem('cazyno_ref_code', code); }
    return code;
  });

  const [stats] = useState(() => JSON.parse(localStorage.getItem('cazyno_aff_stats') || JSON.stringify({
    clicks: 142, refs: 7, totalEarned: 183.50, available: 47.20, withdrawn: 136.30,
    history: [
      { date: '2026-03-15', user: 'User_7F2A', wagered: 2400, earned: 12.00, status: 'paid' },
      { date: '2026-03-12', user: 'User_B91C', wagered: 1800, earned: 9.00, status: 'paid' },
      { date: '2026-03-08', user: 'User_44DE', wagered: 5200, earned: 26.00, status: 'pending' },
    ]
  })));

  const tier = getTier(stats.refs);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1] || null;
  const refLink = `https://cazyno.com/join?ref=${refCode}`;
  const [copied, setCopied] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('crypto');

  const copy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > stats.available) return;
    setWithdrawing(true);
    await new Promise(r => setTimeout(r, 1800));
    setWithdrawing(false);
    setWithdrawn(true);
    setTimeout(() => setWithdrawn(false), 3000);
  };

  const tierIcon = { Bronze: Medal, Silver: Medal, Gold: Trophy, VIP: Gem };

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Tier card block */}
      <div className="rounded-2xl overflow-hidden" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-base">{t(lang, 'aff_title')}</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>{t(lang, 'aff_subtitle')}</span>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ borderColor: tier.color, background: `${tier.color}22`, border: `2px solid ${tier.color}55` }}>
                {(() => { const TierIcon = tierIcon[tier.name]; return <TierIcon className="w-8 h-8" style={{ color: tier.color }} />; })()}
              </div>
              <div>
                <p className="font-orbitron font-black text-2xl" style={{ color: tier.color }}>{tier.name}</p>
                <p className="text-sm" style={{color:'#94a3b8'}}>{stats.refs} {t(lang, 'aff_active_refs')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-orbitron font-black text-3xl" style={{color:'#00e701'}}>{(tier.commission * 100).toFixed(0)}%</p>
              <p className="text-xs" style={{color:'#94a3b8'}}>{t(lang, 'aff_commission')}</p>
            </div>
          </div>
          {nextTier && (
            <div className="mt-4 pt-4" style={{borderTop:'1px solid rgba(26,42,56,0.5)'}}>
              <div className="flex items-center justify-between text-xs mb-1.5" style={{color:'#94a3b8'}}>
                <span>{t(lang, 'aff_progress_to')} {nextTier.name} ({nextTier.commission * 100}%)</span>
                <span>{stats.refs}/{nextTier.minRefs} {t(lang, 'aff_refs')}</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{background:'#0b1219'}}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (stats.refs / nextTier.minRefs) * 100)}%`, background: tier.color }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: t(lang, 'aff_clicks'), value: stats.clicks, icon: Link2, color: '#3b82f6' },
          { label: t(lang, 'aff_refs_label'), value: stats.refs, icon: Users, color: '#a855f7' },
          { label: t(lang, 'aff_total_earned'), value: `${fmt(stats.totalEarned)} EUR`, icon: TrendingUp, color: '#00e701' },
          { label: t(lang, 'aff_available'), value: `${fmt(stats.available)} EUR`, icon: Wallet, color: '#eab308' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
            <Icon className="w-5 h-5 mb-2" style={{color}} />
            <p className="font-orbitron font-black text-2xl" style={{color}}>{value}</p>
            <p className="text-xs mt-0.5" style={{color:'#94a3b8'}}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Referral link block */}
        <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" style={{color:'#00e701'}} />
              <h2 className="font-orbitron font-black text-white text-sm">{t(lang, 'aff_your_link')}</h2>
            </div>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className="rounded-xl px-4 py-3 font-mono text-sm break-all" style={{background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>{refLink}</div>
            <button onClick={copy}
              className="w-full rounded-xl font-bold py-3 flex items-center justify-center gap-2 transition-all"
              style={{background: copied ? '#22c55e' : '#00e701', color:'#000'}}>
              {copied ? <><Check className="w-4 h-4" /> {t(lang, 'aff_copied')}</> : <><Copy className="w-4 h-4" /> {t(lang, 'aff_copy')}</>}
            </button>
            <div className="flex items-center gap-2 text-xs rounded-xl px-4 py-3" style={{background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>
              <span className="font-orbitron font-bold text-white">{refCode}</span>
              <span>-</span>
              <span>{t(lang, 'aff_unique_code')}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{color:'#94a3b8'}}>
              Chaque joueur vous rapporte <strong style={{color:'#00e701'}}>{(tier.commission * 100).toFixed(0)}% {t(lang, 'aff_earn_info')}</strong>
            </p>
          </div>
        </div>

        {/* Withdrawal block */}
        <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5" style={{color:'#00e701'}} />
              <h2 className="font-orbitron font-black text-white text-sm">{t(lang, 'aff_withdraw')}</h2>
            </div>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className="rounded-xl px-4 py-3 flex items-center justify-between" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
              <span className="text-sm" style={{color:'#94a3b8'}}>{t(lang, 'aff_avail_balance')}</span>
              <span className="font-orbitron font-bold text-xl" style={{color:'#00e701'}}>{fmt(stats.available)} EUR</span>
            </div>
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>{t(lang, 'aff_method')}</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'crypto', label: t(lang, 'aff_crypto'), IconComp: Wallet },
                  { id: 'bank', label: t(lang, 'aff_bank'), IconComp: Landmark },
                  { id: 'balance', label: t(lang, 'aff_balance_m'), IconComp: Zap },
                ].map(m => (
                  <button key={m.id} onClick={() => setWithdrawMethod(m.id)}
                    className="py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5"
                    style={withdrawMethod === m.id
                      ? { background:'rgba(0,231,1,0.1)', border:'1px solid #00e701', color:'#00e701' }
                      : { background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8' }}>
                    <m.IconComp className="w-3.5 h-3.5" /> {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <input type="number" placeholder={t(lang, 'aff_amount_ph')} value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                className="flex-1 rounded-xl px-4 py-3 font-orbitron font-bold text-center focus:outline-none"
                style={{background:'#111a25', border:'1px solid #1a2a38', color:'#00e701'}} />
              <button onClick={() => setWithdrawAmount(String(stats.available))}
                className="px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>{t(lang, 'aff_max')}</button>
            </div>
            <button onClick={handleWithdraw}
              disabled={withdrawing || withdrawn || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > stats.available}
              className="w-full rounded-xl font-bold py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{background:'#00e701', color:'#000'}}>
              {withdrawing ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> {t(lang, 'aff_processing')}</>
                : withdrawn ? <><Check className="w-4 h-4" /> {t(lang, 'aff_sent')}</>
                : <><ArrowDownToLine className="w-4 h-4" /> {t(lang, 'aff_withdraw_btn')}</>}
            </button>
            <p className="text-xs text-center" style={{color:'#94a3b8'}}>{t(lang, 'aff_delay')}</p>
          </div>
        </div>
      </div>

      {/* History block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">{t(lang, 'aff_activity')}</h2>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest" style={{color:'#4b5c6f', borderBottom:'1px solid #1a2a38'}}>
                  <th className="pb-3 pr-4">{t(lang, 'aff_date')}</th>
                  <th className="pb-3 pr-4">{t(lang, 'aff_player')}</th>
                  <th className="pb-3 pr-4">{t(lang, 'aff_total_wager')}</th>
                  <th className="pb-3 pr-4">{t(lang, 'aff_commission_col')}</th>
                  <th className="pb-3">{t(lang, 'aff_status')}</th>
                </tr>
              </thead>
              <tbody>
                {stats.history.map((row, i) => (
                  <tr key={i} className="transition-colors hover:brightness-110" style={{borderBottom:'1px solid rgba(26,42,56,0.4)'}}>
                    <td className="py-3 pr-4 text-xs" style={{color:'#94a3b8'}}>{row.date}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-white">{row.user}</td>
                    <td className="py-3 pr-4 font-orbitron font-bold text-white">{row.wagered.toLocaleString('fr-FR')} EUR</td>
                    <td className="py-3 pr-4 font-orbitron font-bold" style={{color:'#00e701'}}>+{fmt(row.earned)} EUR</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={row.status === 'paid'
                          ? { background:'rgba(0,231,1,0.1)', color:'#00e701' }
                          : { background:'rgba(234,179,8,0.1)', color:'#eab308' }}>
                        {row.status === 'paid' ? t(lang, 'aff_paid') : t(lang, 'aff_pending')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tiers block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">{t(lang, 'aff_tiers')}</h2>
          </div>
        </div>
        <div className="px-5 py-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {TIERS.map(tr => (
              <div key={tr.name} className="rounded-xl p-4 text-center"
                style={tier.name === tr.name
                  ? { border: `2px solid ${tr.color}`, background: `${tr.color}11` }
                  : { background:'#111a25', border:'1px solid #1a2a38' }}>
                <p className="font-orbitron font-black text-xl" style={{ color: tr.color }}>{(tr.commission * 100).toFixed(0)}%</p>
                <p className="font-bold text-sm text-white mt-0.5">{tr.name}</p>
                <p className="text-xs" style={{color:'#94a3b8'}}>{tr.minRefs}{t(lang, 'aff_refs_min')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
