import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { getTotalWagered } from '@/api';
import {
  ChevronRight, ChevronLeft, Zap, Play, Flame, Trophy, TrendingUp,
  Gift, Clock, Star, ArrowRight, Crown
} from 'lucide-react';
import {
  RocketIcon, RouletteIcon, CardIcon, PlinkoIcon, DiceIcon, BombIcon,
  TargetIcon
} from '../components/CasinoIcons';
import { getLevel } from '../components/LevelDisplay';
import { C, T, card, blockHeader, btn, iconBox, badge } from '../lib/design';

const GAMES=[
  {n:'Crash',path:'crash',Svg:RocketIcon,c:'#3b82f6',pl:412,tag:'HOT'},
  {n:'Roulette',path:'roulette',Svg:RouletteIcon,c:'#ef4444',pl:587,tag:'LIVE'},
  {n:'Blackjack',path:'blackjack',Svg:CardIcon,c:'#22c55e',pl:334,tag:'CLASSIQUE'},
  {n:'Plinko',path:'plinko',Svg:PlinkoIcon,c:'#a855f7',pl:256,tag:'JACKPOT'},
  {n:'Dice',path:'dice',Svg:DiceIcon,c:'#10b981',pl:189,tag:'SIMPLE'},
  {n:'Pulse Bomb',path:'pulse-bomb',Svg:BombIcon,c:'#f97316',pl:143,tag:'HARDCORE'},
  {n:'Chicken Drop',path:'chicken-drop',Svg:TargetIcon,c:'#eab308',pl:198,tag:'ARCADE'},
  {n:'Trader',path:'trader',Svg:RocketIcon,c:'#06b6d4',pl:321,tag:'TRADING'},
  {n:'Mines',path:'mines',Svg:TargetIcon,c:'#14b8a6',pl:267,tag:'NEW'},
  {n:'Limbo',path:'limbo',Svg:TrendingUp,c:'#f43f5e',pl:178,tag:'NEW'},
  {n:'Keno',path:'keno',Svg:DiceIcon,c:'#ec4899',pl:145,tag:'NEW'},
  {n:'Tower',path:'tower',Svg:PlinkoIcon,c:'#f59e0b',pl:203,tag:'NEW'},
  {n:'Coinflip',path:'coinflip',Svg:CardIcon,c:'#fbbf24',pl:312,tag:'SIMPLE'},
  {n:'HiLo',path:'hilo',Svg:TrendingUp,c:'#6366f1',pl:189,tag:'CARTES'},
  {n:'Wheel',path:'wheel',Svg:RouletteIcon,c:'#f472b6',pl:234,tag:'CHANCE'},
  {n:'Video Poker',path:'video-poker',Svg:CardIcon,c:'#22d3ee',pl:156,tag:'CARTES'},
];

const FAKE_WINS = [
  {user:'Alex***',game:'Crash',amount:2847,mult:'14.2x',color:'#3b82f6'},
  {user:'Kev***',game:'Roulette',amount:1250,mult:'36x',color:'#ef4444'},
  {user:'Sam***',game:'Plinko',amount:5600,mult:'100x',color:'#a855f7'},
  {user:'Max***',game:'Blackjack',amount:890,mult:'2.5x',color:'#22c55e'},
  {user:'Yas***',game:'Dice',amount:420,mult:'2x',color:'#10b981'},
  {user:'Tom***',game:'Crash',amount:12500,mult:'48x',color:'#3b82f6'},
  {user:'Lea***',game:'Trader',amount:3200,mult:'8x',color:'#06b6d4'},
  {user:'Nic***',game:'Mines',amount:1890,mult:'12x',color:'#14b8a6'},
];

function useAnimatedCounter(target, duration=2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      setVal(Math.floor(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [target, duration]);
  return val;
}

const WINNER_NAMES = ['CryptoKing','LuckyDice','HighRoller','NeonBet','DiamondH','GoldRush','AcePlayer','MoonShot','SilverFox','ProBet','DarkHorse','BetMaster','CoinFlip','RocketMan','StarDust','MaxBet','NightOwl','Phantom','WildCard','DeepStack','IronBet','FlashBet','StormBet','ZenPlayer','Maverick','Blaze','Crypto7','JackPot','Venom','Shadow'];
const WINNER_GAMES = [
  {n:'Crash',c:'#3b82f6'},{n:'Roulette',c:'#ef4444'},{n:'Blackjack',c:'#22c55e'},
  {n:'Plinko',c:'#a855f7'},{n:'Dice',c:'#10b981'},{n:'Mines',c:'#14b8a6'},
  {n:'Trader',c:'#06b6d4'},{n:'Limbo',c:'#f43f5e'},
];

function generateWinner(rank) {
  const game = WINNER_GAMES[Math.floor(Math.random()*WINNER_GAMES.length)];
  const multi = rank <= 3 ? (Math.random()*200+50).toFixed(1) : rank <= 10 ? (Math.random()*50+5).toFixed(1) : (Math.random()*20+1.5).toFixed(1);
  const bet = rank <= 3 ? Math.floor(Math.random()*500+100) : rank <= 10 ? Math.floor(Math.random()*200+20) : Math.floor(Math.random()*100+5);
  return {
    rank,
    name: WINNER_NAMES[rank-1] || `Player${rank}`,
    game,
    bet,
    multi: parseFloat(multi),
    gain: parseFloat((bet * multi).toFixed(2)),
  };
}

function TopWinnersTable() {
  const [winners, setWinners] = useState(()=>Array.from({length:10},(_,i)=>generateWinner(i+1)).sort((a,b)=>b.gain-a.gain).map((w,i)=>({...w,rank:i+1})));

  useEffect(()=>{
    const i = setInterval(()=>{
      setWinners(prev => {
        const updated = [...prev];
        const count = Math.floor(Math.random()*2)+1;
        for(let j=0;j<count;j++){
          const idx = Math.floor(Math.random()*10);
          updated[idx] = generateWinner(idx+1);
        }
        return updated.sort((a,b)=>b.gain-a.gain).map((w,i)=>({...w,rank:i+1}));
      });
    }, 2000);
    return ()=>clearInterval(i);
  },[]);

  return (
    <div>
      {winners.map((w,i)=>{
        const isTop3 = i < 3;
        const rankColors = [C.gold,'#C0C0C0','#CD7F32'];
        const rankBg = isTop3 ? `${rankColors[i]}08` : 'transparent';
        return (
          <div key={`${w.name}-${i}`}
            className="flex items-center gap-3 px-4 py-3 transition-all duration-300 hover:bg-white/[0.03]"
            style={{borderBottom:`1px solid ${C.b}30`, background:rankBg}}>

            {/* Rank */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-orbitron font-black text-xs"
              style={{
                background: isTop3 ? `${rankColors[i]}15` : `${C.b}50`,
                border: isTop3 ? `1px solid ${rankColors[i]}30` : 'none',
                color: isTop3 ? rankColors[i] : C.m,
              }}>
              {w.rank}
            </div>

            {/* Player */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate" style={{color:isTop3?C.white:C.s}}>{w.name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{background:w.game.c}}/>
                <span style={{...T.tiny, letterSpacing:'normal',textTransform:'none',fontWeight:500,color:w.game.c}}>{w.game.n}</span>
              </div>
            </div>

            {/* Multiplier */}
            <div className="text-right shrink-0">
              <span className="font-mono font-black text-sm" style={{
                color: w.multi >= 50 ? C.gold : w.multi >= 10 ? C.g : w.multi >= 5 ? '#fbbf24' : C.s,
                textShadow: w.multi >= 50 ? '0 0 10px rgba(255,215,0,0.3)' : 'none',
              }}>
                {w.multi}x
              </span>
            </div>

            {/* Gain */}
            <div className="text-right shrink-0 min-w-[90px]">
              <p className="font-orbitron font-black text-sm" style={{
                color: w.gain >= 10000 ? C.gold : C.g,
                textShadow: w.gain >= 10000 ? '0 0 12px rgba(255,215,0,0.3)' : `0 0 8px ${C.gR}0.2)`,
              }}>
                +{w.gain.toLocaleString('fr-FR')}€
              </p>
              <p style={{...T.tiny, fontFamily:'monospace',letterSpacing:'normal',textTransform:'none'}}>mise {w.bet}€</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const { xp, credits, rakeback, totalWagered, gamesPlayed } = useOutletContext();
  const { current, next, progress } = getLevel(xp || 0);
  const [jp, setJp] = useState(0);
  const [liveWinIdx, setLiveWinIdx] = useState(0);
  const jpDisplay = useAnimatedCounter(jp, 1500);

  useEffect(()=>{
    getTotalWagered().then(tw=>setJp(Math.floor((tw||0)*0.001))).catch(()=>setJp(12784));
    const i=setInterval(()=>setJp(v=>v+Math.floor(Math.random()*5+1)),5000);
    return()=>clearInterval(i);
  },[]);

  useEffect(()=>{
    const i=setInterval(()=>setLiveWinIdx(v=>(v+1)%FAKE_WINS.length),3000);
    return()=>clearInterval(i);
  },[]);

  const currentWin = FAKE_WINS[liveWinIdx];

  return (
    <div className="w-full fade-up">

      {/* --- JACKPOT --- */}
      <div className="mb-4 rounded-2xl overflow-hidden" style={{border:`1px solid ${C.gold}1f`}}>
        <div className="flex items-center gap-4 px-5 py-3" style={{background:`linear-gradient(90deg,${C.gold}08 0%,${C.gold}14 50%,${C.gold}08 100%)`}}>
          <div className="flex items-center gap-2.5 shrink-0">
            <div style={iconBox(C.gold, 32)}>
              <Zap className="w-4 h-4" style={{color:C.gold}}/>
            </div>
            <div>
              <p style={{...badge.standard, textTransform:'uppercase',letterSpacing:'0.1em',color:`${C.gold}66`}}>Jackpot</p>
              <p className="font-orbitron font-black text-lg sm:text-xl shimmer-text leading-none">
                {jpDisplay.toLocaleString('fr-FR',{minimumFractionDigits:2})} €
              </p>
            </div>
          </div>
          <div className="flex-1 h-px" style={{background:`linear-gradient(90deg,transparent,${C.gold}26,transparent)`}}/>
          <div className="hidden sm:flex items-center gap-4" style={T.tiny}>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:C.g}}/>47 923 en ligne</span>
            <span>42 jeux</span>
            <span>{'<'}10min retrait</span>
          </div>
          <Link to="/dashboard/casino" className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition hover:brightness-110"
            style={{...btn.small, background:`${C.gold}1f`,border:`1px solid ${C.gold}40`,color:C.gold}}>
            <Play className="w-3 h-3" fill={C.gold}/> Jouer
          </Link>
        </div>
      </div>

      {/* --- JEUX ORIGINAUX --- */}
      <section className="pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{color:C.g}}/>
            <h2 style={T.h2}>Nos jeux</h2>
            <span style={{...badge.standard, background:`${C.gR}0.1)`,color:C.g}}>{GAMES.length} jeux</span>
          </div>
          <Link to="/dashboard/casino" className="flex items-center gap-1 transition hover:gap-2" style={T.small}>
            Voir tout <ChevronRight className="w-3.5 h-3.5"/>
          </Link>
        </div>

        {/* Grille 5 colonnes desktop, 3 mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {GAMES.map(({n,path,Svg,c,pl,tag})=>(
            <Link to={`/dashboard/casino/${path}`} key={n}
              className="group relative rounded-2xl overflow-hidden transition-all duration-200 hover:scale-[1.03]"
              style={{border:`1px solid ${C.b}`}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=`${c}50`;e.currentTarget.style.boxShadow=`0 8px 30px ${c}20`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=C.b;e.currentTarget.style.boxShadow='none';}}>

              {/* Tag */}
              <div className="absolute top-2 right-2 z-10"
                style={{fontSize:'10px',fontWeight:800,padding:'3px 10px',borderRadius:'8px',background:c,color:C.black}}>{tag}</div>

              {/* Card content */}
              <div className="aspect-[3/4] flex flex-col items-center justify-center gap-2 relative overflow-hidden"
                style={{background:`linear-gradient(160deg,${c}08,${C.crd})`}}>

                {/* Glow */}
                <div className="absolute w-24 h-24 rounded-full opacity-[0.1] group-hover:opacity-[0.25] transition-opacity"
                  style={{background:`radial-gradient(circle,${c},transparent 70%)`,animation:'pulseSlow 4s ease-in-out infinite'}}/>

                {/* Icon */}
                <div className="relative group-hover:scale-110 transition-transform z-10">
                  <Svg size={44} color={c}/>
                </div>
                <span className="relative z-10" style={{fontSize:'14px',fontWeight:700,color:C.white}}>{n}</span>
                <span className="flex items-center gap-1.5 relative z-10">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:C.g}}/>
                  <span style={{fontSize:'12px',fontWeight:600,color:C.s}}>{pl} joueurs</span>
                </span>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20">
                  <span className="flex items-center gap-2 px-5 py-2.5 rounded-xl"
                    style={{fontSize:'13px',fontWeight:700,background:c,color:C.black}}>
                    <Play className="w-4 h-4" fill={C.black}/>Jouer
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- STATS RAPIDES + DAILY RACE --- */}
      <div className="pb-5 grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Daily Race */}
        <div className="lg:col-span-2 rounded-2xl p-5 relative overflow-hidden"
          style={{background:`linear-gradient(135deg,#0f1a2e,#1a0f2e)`,border:`1px solid ${C.p}33`}}>
          <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.06]" style={{background:`radial-gradient(circle,${C.p},transparent 70%)`}}/>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4" style={{color:'#f97316'}}/>
              <span style={{...T.tiny, color:'#f97316'}}>Daily Race</span>
              <span style={{...badge.standard, background:'rgba(249,115,22,0.15)',color:'#f97316'}}>EN COURS</span>
            </div>
            <p style={{...T.h1, fontSize:'24px',marginBottom:'4px'}}>100 000 €</p>
            <p style={{...T.body, marginBottom:'16px'}}>Prize pool distribue aux top 15 joueurs chaque mois</p>
            <div className="flex items-center gap-3">
              <Link to="/dashboard/leaderboard" className="flex items-center gap-2 px-4 py-2 rounded-xl transition hover:brightness-110"
                style={{...btn.small, background:C.p,border:'none',color:C.white}}>
                <Trophy className="w-3.5 h-3.5"/> Voir le classement
              </Link>
              <div className="flex items-center gap-2">
                <span style={T.small}>Votre position :</span>
                <span className="font-orbitron font-bold text-sm" style={{color:C.g}}>#{Math.floor(Math.random()*50)+1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={card}>
            <p style={{...T.tiny, marginBottom:'4px'}}>Total mise</p>
            <p style={{...T.h1, fontSize:'18px'}}>
              {(totalWagered||0).toLocaleString('fr-FR',{minimumFractionDigits:2})} €
            </p>
          </div>
          <div className="rounded-2xl p-4" style={card}>
            <p style={{...T.tiny, marginBottom:'4px'}}>Parties jouees</p>
            <p style={{...T.h1, fontSize:'18px'}}>
              {(gamesPlayed||0).toLocaleString('fr-FR')}
            </p>
          </div>
          <Link to="/dashboard/vip" className="block rounded-2xl p-4 transition hover:scale-[1.02]"
            style={{background:`linear-gradient(135deg,${current.color}10,${current.color}05)`,border:`1px solid ${current.color}25`}}>
            <div className="flex items-center justify-between">
              <div>
                <p style={{...T.tiny, marginBottom:'4px'}}>Prochain palier</p>
                <p className="font-orbitron font-bold text-sm" style={{color:current.color}}>
                  {next ? next.label : 'MAX'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4" style={{color:current.color}}/>
            </div>
            <div className="w-full h-1.5 rounded-full mt-2 overflow-hidden" style={{background:'rgba(255,255,255,0.06)'}}>
              <div className="h-full rounded-full transition-all duration-700" style={{width:`${progress}%`,background:current.color}}/>
            </div>
          </Link>
        </div>
      </div>

      {/* --- PROMOS RAPIDES --- */}
      <section className="pb-5">
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div style={blockHeader}>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" style={{color:'#fbbf24'}}/>
              <h2 style={T.h2}>Offres du moment</h2>
            </div>
            <Link to="/dashboard/promotions" className="flex items-center gap-1" style={T.small}>
              Tout voir <ChevronRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-x" style={{borderColor:C.b}}>
            {[
              {title:'50% Rakeback',sub:'7 jours, sans condition',c:C.g,icon:Gift,to:'/dashboard/promotions'},
              {title:'Daily Reward',sub:'Connecte-toi chaque jour',c:'#fbbf24',icon:Clock,to:'/dashboard/rewards'},
              {title:'Club VIP',sub:"Jusqu'a 25% rakeback a vie",c:C.p,icon:Crown,to:'/dashboard/vip'},
            ].map(({title,sub,c,icon:Icon,to})=>(
              <Link to={to} key={title} className="group flex items-center gap-3 p-4 transition-all hover:bg-white/[0.02]"
                style={{borderColor:C.b}}>
                <div style={iconBox(c, 40)}>
                  <Icon className="w-5 h-5" style={{color:c}}/>
                </div>
                <div className="flex-1">
                  <p style={T.h3}>{title}</p>
                  <p style={T.tiny}>{sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{color:C.m}}/>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- TOP 30 WINNERS --- */}
      <section className="pb-5">
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div style={blockHeader}>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{color:C.gold}}/>
              <h2 style={T.h2}>Top Winners</h2>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{background:C.red}}/>
              <span style={{...T.tiny, color:C.red}}>Live</span>
            </div>
            <Link to="/dashboard/leaderboard" className="flex items-center gap-1" style={T.small}>
              Classement complet <ChevronRight className="w-3.5 h-3.5"/>
            </Link>
          </div>

          {/* Rows */}
          <TopWinnersTable />
        </div>
      </section>

    </div>
  );
}
