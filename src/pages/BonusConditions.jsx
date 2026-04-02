import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Info, Shield } from 'lucide-react';

const BONUSES = [
  {
    pct: '100%',
    color: '#22c55e',
    max: '10 000 EUR',
    wager: 30,
    deposit: 100,
    bonus: 100,
    total: 200,
    desc: "Deposez 100 EUR, nous vous creditons 100 EUR supplementaires. Votre solde de depart est ainsi de 200 EUR.",
  },
  {
    pct: '200%',
    color: '#FFD700',
    max: '5 000 EUR',
    wager: 35,
    deposit: 100,
    bonus: 200,
    total: 300,
    desc: "Deposez 100 EUR, nous vous creditons 200 EUR supplementaires. Votre solde de depart est ainsi de 300 EUR.",
  },
  {
    pct: '300%',
    color: '#a855f7',
    max: '2 500 EUR',
    wager: 37,
    deposit: 100,
    bonus: 300,
    total: 400,
    desc: "Deposez 100 EUR, nous vous creditons 300 EUR supplementaires. Votre solde de depart est ainsi de 400 EUR.",
  },
];

const ALLOWED = [
  "Jouer librement sur l'ensemble des jeux disponibles (Dice, Blackjack, Plinko, Roulette, Paris Sportifs)",
  "Varier librement vos mises selon votre strategie personnelle",
  "Utiliser le bonus sur autant de parties que necessaire, sans limite de temps sur 30 jours",
  "Cumuler des gains pendant toute la duree de la periode de wager",
  "Retirer l'integralite de votre solde disponible une fois le wager integralement valide",
];

const FORBIDDEN = [
  "La martingale et toutes ses variantes (doublement de mise apres une perte, etc.)",
  "Le bet maximum systematique dans le but d'epuiser rapidement le wager",
  "Le hedging : miser simultanement sur les deux issues d'un meme evenement",
  "L'utilisation de bots, scripts ou tout systeme de pari automatise",
  "Les strategies a tres faible variance visant a contourner le risque (probabilite de gain > 95%)",
];

export default function BonusConditions() {
  return (
    <div className="w-full space-y-5 fade-up pb-20">

      {/* Nav */}
      <div className="pt-2">
        <Link to="/Home" className="inline-flex items-center gap-2 text-sm font-medium transition-colors" style={{color:'#94a3b8'}}>
          <ArrowLeft className="w-4 h-4" /> Retour a l'accueil
        </Link>
      </div>

      {/* Hero block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-base">Conditions des Bonus</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>Offres de bienvenue</span>
        </div>
        <div className="px-5 py-5">
          <p className="text-sm leading-relaxed" style={{color:'#94a3b8'}}>
            Retrouvez ici le detail complet de nos trois offres de depot, les regles de wager applicables et les conditions d'utilisation.
          </p>
        </div>
      </div>

      {/* Wager explanation block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-sm">Qu'est-ce que le wager ?</h2>
          </div>
        </div>
        <div className="px-5 py-5 space-y-3">
          <p className="text-sm leading-relaxed" style={{color:'#94a3b8'}}>
            Le <strong className="text-white font-semibold">wager</strong> est le montant total de mises que vous devez effectuer sur la plateforme avant de pouvoir retirer vos fonds. Il est calcule sur la base de votre <strong className="text-white font-semibold">solde total</strong> (depot + bonus cumules) multiplie par le coefficient propre a l'offre activee.
          </p>
          <p className="text-sm leading-relaxed" style={{color:'#94a3b8'}}>
            Le bonus est immediatement jouable des reception, mais les fonds -- depot, bonus et gains -- ne deviennent retirables qu'une fois le wager integralement complete.
          </p>
        </div>
      </div>

      {/* Bonus cards */}
      {BONUSES.map((b) => (
        <div key={b.pct} className="rounded-2xl overflow-hidden" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          {/* Top stripe */}
          <div className="h-1 w-full" style={{ background: b.color }} />

          <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{color: b.color}} />
              <h2 className="font-orbitron font-black text-white text-sm">Bonus {b.pct}</h2>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>Jusqu'a</p>
              <p className="font-orbitron font-black text-lg" style={{ color: b.color }}>{b.max}</p>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <p className="text-xs" style={{color:'#94a3b8'}}>{b.desc}</p>

            {/* Calculation breakdown */}
            <div className="rounded-xl overflow-hidden" style={{border:'1px solid #1a2a38'}}>
              <div className="px-4 py-2.5" style={{background:'rgba(17,26,37,0.6)', borderBottom:'1px solid #1a2a38'}}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>Exemple de calcul - depot de {b.deposit} EUR</p>
              </div>
              <div className="grid grid-cols-3" style={{borderBottom:'1px solid #1a2a38'}}>
                <div className="px-4 py-3 text-center" style={{borderRight:'1px solid #1a2a38'}}>
                  <p className="text-[10px] mb-1" style={{color:'#94a3b8'}}>Votre depot</p>
                  <p className="font-orbitron font-bold text-base text-white">{b.deposit} EUR</p>
                </div>
                <div className="px-4 py-3 text-center" style={{borderRight:'1px solid #1a2a38'}}>
                  <p className="text-[10px] mb-1" style={{color:'#94a3b8'}}>Bonus Cazyno</p>
                  <p className="font-orbitron font-bold text-base" style={{ color: b.color }}>+{b.bonus} EUR</p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-[10px] mb-1" style={{color:'#94a3b8'}}>Solde total</p>
                  <p className="font-orbitron font-bold text-base text-white">{b.total} EUR</p>
                </div>
              </div>
            </div>

            {/* Wager formula */}
            <div className="rounded-xl px-5 py-4 space-y-2" style={{ border: `1px solid ${b.color}33`, background: `${b.color}08` }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: b.color }}>Formule de wager</p>
              <p className="text-sm text-white font-semibold">
                {b.total} EUR (solde total) x {b.wager} = <span style={{ color: b.color }}>{(b.total * b.wager).toLocaleString('fr-FR')} EUR a miser</span>
              </p>
              <p className="text-xs leading-relaxed" style={{color:'#94a3b8'}}>
                Une fois {(b.total * b.wager).toLocaleString('fr-FR')} EUR de mises atteints, votre wager est valide et vous pouvez retirer l'integralite de votre solde sans restriction.
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Allowed / Forbidden */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Allowed */}
        <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
          <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" style={{color:'#00e701'}} />
              <h2 className="font-orbitron font-black text-white text-sm">Autorise</h2>
            </div>
          </div>
          <div className="px-5 py-4">
            <ul className="space-y-2.5">
              {ALLOWED.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{color:'#00e701'}} />
                  <span className="text-xs leading-relaxed" style={{color:'#94a3b8'}}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Forbidden */}
        <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid rgba(239,68,68,0.2)'}}>
          <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" style={{color:'#ef4444'}} />
              <h2 className="font-orbitron font-black text-white text-sm">Interdit</h2>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-[10px] leading-relaxed" style={{color:'rgba(148,163,184,0.7)'}}>
              Toute strategie visant a contourner les conditions de wager entraine l'annulation du bonus et des gains associes.
            </p>
            <ul className="space-y-2.5">
              {FORBIDDEN.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{color:'#ef4444'}} />
                  <span className="text-xs leading-relaxed" style={{color:'#94a3b8'}}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="flex gap-3 rounded-2xl px-5 py-4" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)'}}>
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{color:'#f59e0b'}} />
        <p className="text-xs leading-relaxed" style={{color:'rgba(253,224,71,0.7)'}}>
          Cazyno se reserve le droit de controler l'historique de jeu de tout utilisateur beneficiant d'un bonus. En cas de detection d'une strategie abusive, le bonus sera annule sans preavis et les fonds concernes seront geles le temps de l'analyse.
        </p>
      </div>

      {/* Fine print block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5" style={{color:'#4b5c6f'}} />
            <h2 className="font-orbitron font-black text-sm" style={{color:'#4b5c6f'}}>Conditions generales</h2>
          </div>
        </div>
        <div className="px-5 py-4 space-y-2 text-[11px] leading-relaxed" style={{color:'rgba(148,163,184,0.6)'}}>
          <p>- Les bonus sont valables <strong style={{color:'rgba(148,163,184,0.8)'}}>30 jours</strong> a compter de leur activation. Passe ce delai, le bonus non utilise est automatiquement annule.</p>
          <p>- Un seul bonus actif par compte a la fois. Il n'est pas possible de cumuler deux offres simultanement.</p>
          <p>- Le depot minimum pour activer une offre est de <strong style={{color:'rgba(148,163,184,0.8)'}}>20 EUR</strong>.</p>
          <p>- Les bonus sont reserves aux joueurs ayant effectue leur premier depot sur la plateforme.</p>
          <p>- Cazyno se reserve le droit de modifier, suspendre ou annuler toute offre sans preavis en cas d'utilisation abusive.</p>
          <p>- Le jeu peut creer une dependance. Jouez de facon responsable. Si vous pensez avoir un probleme, contactez notre support.</p>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link to="/Home" className="rounded-xl font-bold inline-flex items-center gap-2 px-8 py-3 text-sm"
          style={{background:'#00e701', color:'#000'}}>
          <ArrowLeft className="w-4 h-4" /> Retour a l'accueil
        </Link>
      </div>
    </div>
  );
}
