import { useOutletContext } from 'react-router-dom';
import { Gift, Percent, UserCheck, Trophy, Calendar, Repeat, Star, Zap } from 'lucide-react';

const PROMOS = [
  {
    title: 'Rakeback de bienvenue 50%',
    desc: 'Pendant vos 7 premiers jours, recevez 50% de rakeback sur toutes vos mises. Sans aucune condition de mise.',
    cta: 'Actif automatiquement',
    icon: Gift,
    color: '#00e701',
    tag: 'Nouveau joueur',
  },
  {
    title: 'Bonus KYC $10',
    desc: 'Completez la verification de votre identite et recevez $10 de bonus credits instantanement sur votre compte.',
    cta: 'Verifier mon identite',
    icon: UserCheck,
    color: '#3b82f6',
    tag: 'Verification',
  },
  {
    title: 'Course quotidienne',
    desc: 'Chaque jour, un prize pool est distribue aux joueurs les plus actifs. Plus vous misez, plus vous grimpez dans le classement.',
    cta: 'Voir le classement',
    icon: Trophy,
    color: '#FFD700',
    tag: 'Quotidien',
  },
  {
    title: 'Tirage hebdomadaire',
    desc: 'Chaque semaine, participez automatiquement au tirage au sort. Chaque $100 mise = 1 ticket. Lots allant de $50 a $10,000.',
    cta: 'En savoir plus',
    icon: Star,
    color: '#a855f7',
    tag: 'Hebdomadaire',
  },
  {
    title: 'Cashback 10% a vie',
    desc: 'Recevez 10% de cashback sur vos pertes nettes, chaque semaine, pour toujours. Aucune condition de mise requise.',
    cta: 'Actif automatiquement',
    icon: Percent,
    color: '#ef4444',
    tag: 'Permanent',
  },
  {
    title: 'Reload Bonus',
    desc: "Exclusif aux joueurs Platinum et au-dessus. Bonus de 50% sur chaque depot, jusqu'a $500 par semaine.",
    cta: 'Platinum+ requis',
    icon: Repeat,
    color: '#E5E4E2',
    tag: 'VIP',
  },
  {
    title: 'Calendrier de recompenses',
    desc: 'Connectez-vous chaque jour pour reclamer votre recompense quotidienne. Les montants augmentent tout au long du mois.',
    cta: 'Ouvrir le calendrier',
    icon: Calendar,
    color: '#22c55e',
    tag: 'Quotidien',
  },
];

export default function Promotions() {
  useOutletContext();

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Hero block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-base">Promotions</h2>
          </div>
        </div>
        <div className="px-5 py-6 text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: 'rgba(0,231,1,0.1)', border: '1px solid rgba(0,231,1,0.3)' }}>
            <Zap className="w-8 h-8" style={{color:'#00e701'}} />
          </div>
          <p className="text-sm max-w-lg mx-auto" style={{color:'#94a3b8'}}>
            Profitez de nos offres exclusives pour maximiser vos gains. Des bonus sans wagering, du cashback a vie, et bien plus encore.
          </p>
        </div>
      </div>

      {/* Promo cards block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">Offres disponibles</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>{PROMOS.length} offres</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROMOS.map(promo => {
              const Icon = promo.icon;
              return (
                <div key={promo.title}
                  className="rounded-2xl p-5 transition-all"
                  style={{background:'rgba(17,26,37,0.5)', border:'1px solid #1a2a38'}}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${promo.color}15`, border: `1px solid ${promo.color}30` }}>
                      <Icon className="w-6 h-6" style={{ color: promo.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: `${promo.color}15`, color: promo.color }}>
                          {promo.tag}
                        </span>
                      </div>
                      <h3 className="font-orbitron text-sm font-bold text-white mb-1">{promo.title}</h3>
                      <p className="text-xs leading-relaxed mb-3" style={{color:'#94a3b8'}}>{promo.desc}</p>
                      <button className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: `${promo.color}15`, color: promo.color, border: `1px solid ${promo.color}25` }}>
                        {promo.cta}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-center" style={{color:'#94a3b8'}}>
        Les conditions generales s'appliquent. Jouez de maniere responsable.
      </p>
    </div>
  );
}
