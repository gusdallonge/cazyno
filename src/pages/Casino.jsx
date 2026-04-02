import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dice6, Spade, Layers, Bomb, TrendingUp, Circle, Trophy, Search, LineChart, Gamepad2 } from 'lucide-react';
import { useLang, t } from '../lib/i18n';

const GAMES = [
  { path:'/dashboard/casino/crash',        icon:TrendingUp, name:'Crash',        desc:'Decolle avant le crash. Cash-out au bon moment!', badge:'LIVE',     glow:'#3b82f6', color:'#0d1e3d', cat:'crash'    },
  { path:'/dashboard/casino/roulette',     icon:Circle,     name:'Roulette',     desc:'Roulette europeenne avec roue physique realiste.', badge:'PREMIUM',  glow:'#ef4444', color:'#2a0808', cat:'classique' },
  { path:'/dashboard/casino/blackjack',    icon:Spade,      name:'Blackjack',    desc:'Battez le croupier sans depasser 21.',            badge:'CLASSIQUE', glow:'#22c55e', color:'#062012', cat:'classique' },
  { path:'/dashboard/casino/plinko',       icon:Layers,     name:'Plinko',       desc:'Laisse tomber la bille et vise le jackpot.',      badge:'JACKPOT',  glow:'#a855f7', color:'#160a2e', cat:'arcade'   },
  { path:'/dashboard/casino/pulse-bomb',   icon:Bomb,       name:'Pulse Bomb',   desc:'Chaque clic peut etre le dernier. Tension max.',  badge:'HARDCORE', glow:'#f97316', color:'#2a1000', cat:'arcade'   },
  { path:'/dashboard/casino/chicken-drop', icon:Dice6,      name:'Chicken Drop', desc:'Traverse la route, evite les obstacles!',         badge:'NOUVEAU',  glow:'#eab308', color:'#221800', cat:'arcade'   },
  { path:'/dashboard/casino/dice',         icon:Dice6,      name:'Dice',         desc:'Paris simples -- over/under 50. Classique.',       badge:'SIMPLE',   glow:'#10b981', color:'#062012', cat:'classique' },
  { path:'/dashboard/casino/trader',       icon:LineChart,  name:'Trader',       desc:'Tradez le Cazyno Coin. Long ou Short, cash out au bon moment!', badge:'TRADING', glow:'#06b6d4', color:'#0a1e2e', cat:'crash' },
  { path:'/dashboard/casino/mines',        icon:Layers,     name:'Mines',        desc:'Grille 5x5, revele les gemmes, evite les mines.',  badge:'NEW',      glow:'#14b8a6', color:'#061f1a', cat:'arcade'   },
  { path:'/dashboard/casino/limbo',        icon:TrendingUp, name:'Limbo',        desc:'Vise un multiplicateur. Plus haut = plus risque.', badge:'NEW',      glow:'#f43f5e', color:'#2a0515', cat:'crash'    },
  { path:'/dashboard/casino/keno',         icon:Dice6,      name:'Keno',         desc:'Selectionnez vos numeros et tentez votre chance.', badge:'NEW',      glow:'#ec4899', color:'#2a0520', cat:'arcade'   },
  { path:'/dashboard/casino/tower',        icon:Layers,     name:'Tower',        desc:'Montez les etages, evitez les pieges.',            badge:'NEW',      glow:'#f59e0b', color:'#2a1800', cat:'arcade'   },
  { path:'/dashboard/casino/coinflip',     icon:Circle,     name:'Coinflip',     desc:'Pile ou face. Simple et efficace.',                badge:'SIMPLE',   glow:'#fbbf24', color:'#2a2000', cat:'classique' },
  { path:'/dashboard/casino/hilo',         icon:TrendingUp, name:'HiLo',         desc:'La carte suivante sera plus haute ou plus basse?', badge:'CARTES',   glow:'#6366f1', color:'#0f0a2e', cat:'classique' },
  { path:'/dashboard/casino/wheel',        icon:Circle,     name:'Wheel',        desc:'Tournez la roue et gagnez jusqu a 50x.',           badge:'CHANCE',   glow:'#f472b6', color:'#2a0520', cat:'arcade'   },
  { path:'/dashboard/casino/video-poker',  icon:Spade,      name:'Video Poker',  desc:'Jacks or Better. Le poker classique.',             badge:'CARTES',   glow:'#22d3ee', color:'#0a1e2e', cat:'classique' },
];

const CATS = [
  { id:'all',      label:'Tous'      },
  { id:'crash',    label:'Crash'     },
  { id:'classique',label:'Classique' },
  { id:'arcade',   label:'Arcade'    },
];

export default function Casino() {
  const lang = useLang();
  const [cat, setCat] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = GAMES.filter(g =>
    (cat === 'all' || g.cat === cat) &&
    (!search || g.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full space-y-5 fade-up">

      {/* Header block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-base">CASINO</h2>
          </div>
          <span style={{color:'#4b5c6f'}} className="text-xs font-semibold">{GAMES.length} jeux</span>
        </div>
        <div className="px-5 py-4 space-y-3">
          {/* Category tabs */}
          <div className="flex gap-1.5 flex-wrap">
            {CATS.map(({ id, label }) => (
              <button key={id} onClick={() => setCat(id)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={cat === id
                  ? { background:'#00e701', color:'#000' }
                  : { background:'#111a25', color:'#94a3b8', border:'1px solid #1a2a38' }}>
                {label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="flex items-center gap-2 rounded-xl px-4 py-3"
            style={{ background:'#111a25', border:'1px solid #1a2a38' }}>
            <Search className="w-3.5 h-3.5 shrink-0" style={{color:'#94a3b8'}}/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un jeu..."
              className="bg-transparent text-sm text-white placeholder:text-[#94a3b8] focus:outline-none w-full"/>
          </div>
        </div>
      </div>

      {/* Games grid - 5 cols desktop, 3:4 portrait cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map(({ path, icon:Icon, name, desc, badge, glow, color }) => (
          <Link key={path} to={path}
            className="group relative overflow-hidden rounded-2xl flex flex-col transition-all duration-200 hover:-translate-y-1"
            style={{ aspectRatio:'3/4', background:`linear-gradient(135deg,${color},#060608)`, border:`1px solid ${glow}33`, boxShadow:`0 4px 20px ${glow}08` }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 40px ${glow}30`; e.currentTarget.style.borderColor = `${glow}55`; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 4px 20px ${glow}08`; e.currentTarget.style.borderColor = `${glow}33`; }}>
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                style={{ background:`${glow}20`, border:`1px solid ${glow}44` }}>
                <Icon className="w-7 h-7" style={{ color: glow }}/>
              </div>
              <h2 className="font-orbitron font-bold text-sm text-white text-center mb-1">{name}</h2>
              <p className="text-[10px] text-center leading-relaxed hidden sm:block" style={{color:'#94a3b8'}}>{desc}</p>
            </div>
            <div className="flex items-center justify-between px-4 pb-3">
              <span className="text-[9px] font-bold" style={{ color: glow }}>{badge}</span>
              <span className="text-white/40 group-hover:text-[#00e701] group-hover:translate-x-0.5 transition-all text-sm">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{color:'#94a3b8'}}>
          <Search className="w-10 h-10 mx-auto mb-3" style={{color:'#94a3b8'}} />
          <p className="font-semibold">Aucun jeu trouve</p>
        </div>
      )}
    </div>
  );
}
