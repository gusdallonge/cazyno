import { useOutletContext } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, Trophy, Dice6, Wallet } from 'lucide-react';
import { useLang, t } from '../lib/i18n';

function fmt(n) { return Number(parseFloat(n || 0)).toLocaleString('fr-FR'); }

function timeAgo(dateStr, lang) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return t(lang, 'tx_now');
  if (m < 60) return t(lang, 'tx_min_ago').replace('{m}', m);
  const h = Math.floor(m / 60);
  if (h < 24) return t(lang, 'tx_h_ago').replace('{h}', h);
  return t(lang, 'tx_d_ago').replace('{d}', Math.floor(h / 24));
}

export default function Transactions() {
  const { transactions, credits } = useOutletContext();
  const lang = useLang();

  const typeConfig = {
    deposit: { icon: ArrowDownCircle, color: '#3b82f6', label: t(lang, 'tx_transaction'), sign: '+' },
    win: { icon: Trophy, color: '#00e701', label: t(lang, 'sport_won'), sign: '+' },
    bet: { icon: Dice6, color: '#94a3b8', label: 'Mise', sign: '-' },
    rakeback: { icon: ArrowUpCircle, color: '#eab308', label: 'Rakeback', sign: '+' },
  };

  const deposits = transactions.filter(tx => tx.type === 'deposit');
  const totalDeposited = deposits.reduce((s, tx) => s + tx.amount, 0);

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t(lang, 'tx_balance'), value: `${fmt(credits)} EUR`, color: '#00e701' },
          { label: t(lang, 'tx_total_dep'), value: `${fmt(totalDeposited)} EUR`, color: '#3b82f6' },
          { label: t(lang, 'tx_nb_dep'), value: deposits.length, color: '#fff' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4 text-center" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:'#4b5c6f'}}>{label}</p>
            <p className="font-orbitron font-black text-xl" style={{color}}>{value}</p>
          </div>
        ))}
      </div>

      {/* Transactions table block */}
      <div className="rounded-2xl overflow-hidden" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">{t(lang, 'tx_title')}</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>{t(lang, 'tx_subtitle')}</span>
        </div>
        <div className="px-5 py-3 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f', borderBottom:'1px solid #1a2a38'}}>
          <span className="flex-1">{t(lang, 'tx_transaction')}</span>
          <span>{t(lang, 'tx_amount')}</span>
          <span className="w-24 text-right">{t(lang, 'tx_date')}</span>
        </div>

        {transactions.length === 0 ? (
          <div className="py-16 text-center" style={{color:'#94a3b8'}}>
            <ArrowDownCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">{t(lang, 'tx_no_tx')}</p>
            <p className="text-xs mt-1">{t(lang, 'tx_appear')}</p>
          </div>
        ) : (
          transactions.map(tx => {
            const cfg = typeConfig[tx.type] || typeConfig.bet;
            const Icon = cfg.icon;
            return (
              <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:brightness-110"
                style={{borderBottom:'1px solid rgba(26,42,56,0.5)'}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{background:`${cfg.color}15`, border:`1px solid ${cfg.color}25`}}>
                  <Icon className="w-4 h-4" style={{color: cfg.color}} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{tx.label || cfg.label}</p>
                  <p className="text-xs" style={{color:'#94a3b8'}}>{cfg.label}</p>
                </div>
                <span className="font-orbitron font-black text-sm" style={{color: cfg.sign === '+' ? '#00e701' : '#94a3b8'}}>
                  {cfg.sign}{fmt(tx.amount)} EUR
                </span>
                <span className="text-xs w-24 text-right shrink-0" style={{color:'#94a3b8'}}>{timeAgo(tx.date, lang)}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
