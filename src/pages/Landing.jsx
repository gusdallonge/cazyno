import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu, X, Gift, Users, Crown, BookOpen, MessageSquare, Star,
  Shield, Headphones, Globe, ChevronDown, ChevronRight, ChevronLeft,
  Search, Play, Zap, UserPlus, LogIn, Home as HomeIcon, Gamepad2, Trophy
} from 'lucide-react';
import {
  RocketIcon, RouletteIcon, CardIcon, PlinkoIcon, DiceIcon, BombIcon,
  TargetIcon, ChipIcon, TrophyIcon, SportIcon, HeroVisual
} from '../components/CasinoIcons';
import AuthModal from '../components/AuthModal';

const bg='#080c12',sbg='#0c1018',crd='#111a25',crdH='#162030';
const g='#00e701',gR='rgba(0,231,1,',p='#8b5cf6',t='#fff',s='#94a3b8',m='#4b5c6f',b='#1a2a38';

const GAMES=[
  {n:'Crash',p:'crash',Svg:RocketIcon,c:'#3b82f6',pl:412},
  {n:'Roulette',p:'roulette',Svg:RouletteIcon,c:'#ef4444',pl:587},
  {n:'Blackjack',p:'blackjack',Svg:CardIcon,c:'#22c55e',pl:334},
  {n:'Plinko',p:'plinko',Svg:PlinkoIcon,c:'#a855f7',pl:256},
  {n:'Dice',p:'dice',Svg:DiceIcon,c:'#10b981',pl:189},
  {n:'Pulse Bomb',p:'pulse-bomb',Svg:BombIcon,c:'#f97316',pl:143},
  {n:'Chicken Drop',p:'chicken-drop',Svg:TargetIcon,c:'#eab308',pl:198},
  {n:'Trader',p:'trader',Svg:RocketIcon,c:'#06b6d4',pl:321},
];

const CATEGORIES=[
  {n:'CASINO',sub:'7+ Jeux Originals',btn:'Jouer',to:'/dashboard/casino/roulette',Svg:ChipIcon,c:g,grad:'linear-gradient(135deg,#0f1f2e,#1a3040)',brd2:`${g}15`},
  {n:'SPORT',sub:'Bientôt disponible',btn:'Bientôt',to:'#',Svg:SportIcon,c:p,grad:'linear-gradient(135deg,#1a0f2e,#2a1850)',brd2:`${p}15`,dim:1},
  {n:'ORIGINALS',sub:'Provably Fair',btn:'Jouer',to:'/dashboard/casino/dice',Svg:DiceIcon,c:'#10b981',grad:'linear-gradient(135deg,#0f2e1a,#1a4030)',brd2:'#10b98115'},
  {n:'VIP CLUB',sub:"Jusqu'a 25% rakeback",btn:'Decouvrir',to:'#',Svg:TrophyIcon,c:'#fbbf24',grad:'linear-gradient(135deg,#2e2a0f,#403a1a)',brd2:'#fbbf2415'},
];

const POP=['Gates of Olympus','Sweet Bonanza','Book of Dead','Wanted Dead or Wild','Sugar Rush','Reactoonz 2','Mental','Starlight Princess'];
const NAV=[{I:Gift,l:'Bonuses',c:'#fbbf24',badge:'4'},{I:Star,l:'Promotions',c:'#f97316'},{I:Trophy,l:'Tournaments',c:'#a855f7'}];
const NAV2=[{I:Users,l:'Affilie',c:'#60a5fa'},{I:Crown,l:'VIP Club',c:'#fbbf24'},{I:BookOpen,l:'Blog',c:s}];
const NAV3=[{I:Shield,l:'Jeu Responsable',c:'#34d399'},{I:Headphones,l:'Support 24/7',c:'#a78bfa'},{I:Globe,l:'Langue: Francais',c:s,dd:1}];

function CountUp({end}){const[v,setV]=useState(0);const ref=useRef(null);useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){const st=Date.now();const tk=()=>{const pr=Math.min((Date.now()-st)/1800,1);setV(Math.floor((1-Math.pow(1-pr,3))*end));if(pr<1)requestAnimationFrame(tk);};tk();obs.disconnect();}},{threshold:0.3});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect();},[end]);return<span ref={ref}>{v.toLocaleString('fr-FR')}</span>;}

function Carousel({children}){let r;return(
  <div className="relative group">
    <div ref={e=>{r=e}} className="flex gap-3 overflow-x-auto no-scrollbar pb-1">{children}</div>
    {[[-1,ChevronLeft,'left-0'],[1,ChevronRight,'right-0']].map(([d,Ic,pos])=>(
      <button key={d} onClick={()=>r?.scrollBy({left:d*280,behavior:'smooth'})}
        className={`absolute ${pos} top-1/2 -translate-y-1/2 w-8 h-8 rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition hidden sm:flex z-10`}
        style={{background:crd,border:`1px solid ${b}`,boxShadow:'0 4px 16px rgba(0,0,0,0.6)'}}>
        <Ic className="w-4 h-4" style={{color:s}}/>
      </button>
    ))}
  </div>
);}

function SideNavItem({I,l,c,dd,badge}){return(
  <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition hover:bg-white/[0.03]">
    <div className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0" style={{background:`${c}12`,border:`1px solid ${c}18`}}>
      <I className="w-3.5 h-3.5" style={{color:c}}/>
    </div>
    <span className="text-[13px] font-medium flex-1" style={{color:s}}>{l}</span>
    {badge&&<span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:g,color:'#000'}}>{badge}</span>}
    {dd&&<ChevronDown className="w-3.5 h-3.5" style={{color:m}}/>}
  </button>
);}

export default function Landing(){
  const[mob,setMob]=useState(false);
  const[authOpen,setAuthOpen]=useState(false);
  const[collapsed,setCollapsed]=useState(()=>localStorage.getItem('cz_sb')==='1');
  const[jp,setJp]=useState(12784367);
  const[activeTab,setActiveTab]=useState('home');
  const toggleSb=()=>setCollapsed(v=>{const n=!v;localStorage.setItem('cz_sb',n?'1':'0');return n;});
  useEffect(()=>{document.documentElement.classList.add('dark');const i=setInterval(()=>setJp(v=>v+Math.floor(Math.random()*40+10)),3000);return()=>clearInterval(i);},[]);

  return(
    <div className="min-h-screen relative overflow-hidden" style={{background:bg,color:t,fontFamily:"'Satoshi',sans-serif"}}>
      <div className="rotating-glow"/>
      <div className="relative z-10 flex gap-2.5 p-2.5">

        {/* ══════ SIDEBAR — collapsible ══════ */}
        <div className={`hidden md:block shrink-0 sticky top-2.5 h-[calc(100vh-20px)] transition-all duration-300 ${collapsed?'w-[68px]':'w-[220px]'}`}>
          <aside className="h-full flex flex-col rounded-2xl overflow-y-auto no-scrollbar" style={{background:sbg,border:`1px solid ${b}`,boxShadow:`0 0 30px ${gR}0.05)`}}>

            {/* Collapse toggle — clear bar */}
            <div className={`flex ${collapsed?'justify-center':'justify-between items-center px-4'} pt-4 pb-2`}>
              {!collapsed&&<span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{color:m}}>Menu</span>}
              <button onClick={toggleSb} className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-white/[0.06]" style={{background:crd,border:`1px solid ${b}`}} title={collapsed?'Ouvrir le menu':'Réduire le menu'}>
                <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed?'rotate-180':''}`} style={{color:s}}/>
              </button>
            </div>

            <div className={`flex-1 ${collapsed?'px-1.5':'px-2.5'} space-y-1 overflow-y-auto no-scrollbar`}>
              {/* Main */}
              {collapsed?(
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${gR}0.08)`,border:`1px solid ${gR}0.15)`}}>
                    <HomeIcon className="w-4 h-4" style={{color:g}}/>
                  </div>
                  {[{I:Gamepad2,c:g},{I:Trophy,c:p}].map(({I,c},i)=>(
                    <Link to="/dashboard/casino/roulette" key={i} className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:bg-white/[0.04]" style={{background:`${c}08`,border:`1px solid ${c}12`}}>
                      <I className="w-4 h-4" style={{color:c}}/>
                    </Link>
                  ))}
                  <div className="w-6 my-2 h-px" style={{background:`${b}80`}}/>
                  {[...NAV,...NAV2,...NAV3].map(({I,c},i)=>(
                    <button key={i} className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:bg-white/[0.04]">
                      <I className="w-4 h-4" style={{color:c}}/>
                    </button>
                  ))}
                </div>
              ):(
                <>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{background:`${gR}0.06)`,borderLeft:`2px solid ${g}`}}>
                    <HomeIcon className="w-[15px] h-[15px]" style={{color:g}}/><span className="text-[13px] font-semibold" style={{color:g}}>Accueil</span>
                  </div>
                  {[{I:Gamepad2,l:'Casino',c:g,dd:1},{I:Trophy,l:'Sport',c:p,dd:1}].map(({I,l,c,dd})=>(
                    <Link to="/dashboard/casino/roulette" key={l} className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition hover:bg-white/[0.03]">
                      <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{background:`${c}12`,border:`1px solid ${c}18`}}><I className="w-3.5 h-3.5" style={{color:c}}/></div>
                      <span className="text-[13px] font-medium flex-1" style={{color:s}}>{l}</span>
                      {dd&&<ChevronDown className="w-3.5 h-3.5" style={{color:m}}/>}
                    </Link>
                  ))}
                  <div className="mx-2 my-3 h-px" style={{background:`linear-gradient(90deg,transparent,${b}80,transparent)`}}/>
                  {NAV.map(x=><SideNavItem key={x.l} {...x}/>)}
                  <div className="mx-2 my-3 h-px" style={{background:`linear-gradient(90deg,transparent,${b}80,transparent)`}}/>
                  {NAV2.map(x=><SideNavItem key={x.l} {...x}/>)}
                  <div className="mx-2 my-3 h-px" style={{background:`linear-gradient(90deg,transparent,${b}60,transparent)`}}/>
                  {NAV3.map(x=><SideNavItem key={x.l} {...x}/>)}
                </>
              )}
            </div>

            {/* Auth button */}
            <div className={`${collapsed?'px-1.5':'px-3'} pb-2`}>
              {collapsed?(
                <button onClick={()=>setAuthOpen(true)} className="w-9 h-9 mx-auto rounded-xl flex items-center justify-center transition hover:brightness-110" style={{background:g,color:'#000'}}>
                  <LogIn className="w-4 h-4"/>
                </button>
              ):(
                <button onClick={()=>setAuthOpen(true)} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[12px] font-bold transition hover:brightness-110" style={{background:g,color:'#000',boxShadow:`0 4px 15px ${gR}0.2)`}}>
                  <LogIn className="w-3.5 h-3.5"/> Connexion / Inscription
                </button>
              )}
            </div>

            {/* PWA teaser */}
            {!collapsed&&(
              <div className="px-3 pb-3">
                <div className="rounded-xl p-3 flex items-center gap-3" style={{background:crd,border:`1px solid ${b}`}}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${gR}0.1)`}}><Zap className="w-4 h-4" style={{color:g}}/></div>
                  <div className="flex-1"><p className="text-[11px] font-bold">Cazyno App</p><p className="text-[9px]" style={{color:m}}>Installer la PWA</p></div>
                  <ChevronRight className="w-4 h-4" style={{color:m}}/>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Mobile sidebar */}
        {mob&&<>
          <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={()=>setMob(false)}/>
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-[260px] overflow-y-auto no-scrollbar" style={{background:sbg,borderRight:`1px solid ${b}`}}>
            <div className="h-14 flex items-center justify-between px-4" style={{borderBottom:`1px solid ${b}50`}}>
              <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:`${gR}0.12)`}}><Zap className="w-4 h-4" style={{color:g}}/></div><span className="font-orbitron font-black text-sm">CAZYNO</span></div>
              <button onClick={()=>setMob(false)}><X className="w-5 h-5" style={{color:s}}/></button>
            </div>
            <div className="py-4 px-3 space-y-1">
              {GAMES.map(({n,p:path,Svg,c})=>(<Link to={`/dashboard/casino/${path}`} key={n} onClick={()=>setMob(false)} className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.03]"><div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:`${c}10`}}><Svg size={20} color={c}/></div><span className="text-[13px] font-medium" style={{color:s}}>{n}</span></Link>))}
            </div>
            <div className="px-4 py-3"><button onClick={()=>{setMob(false);setAuthOpen(true);}} className="flex items-center justify-center w-full py-2.5 rounded-xl text-[13px] font-bold" style={{background:g,color:'#000'}}>Connexion / Inscription</button></div>
          </aside>
        </>}

        {/* ══════ CONTENT ══════ */}
        <main className="flex-1 min-w-0 h-[calc(100vh-20px)] sticky top-2.5 rounded-2xl overflow-y-auto no-scrollbar" style={{background:sbg,border:`1px solid ${b}`,boxShadow:`0 0 30px ${gR}0.05)`}}>

          {/* Header — sticky inside scroll */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 backdrop-blur-xl" style={{background:`${sbg}e8`,borderBottom:`1px solid ${b}50`}}>
            <div className="flex items-center gap-1">
              <button onClick={()=>setMob(!mob)} className="md:hidden p-1.5 mr-2"><Menu className="w-5 h-5" style={{color:s}}/></button>
              <div className="flex items-center gap-2 mr-4">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{background:`linear-gradient(135deg,${gR}0.15),${gR}0.05))`,border:`1px solid ${gR}0.2)`}}>
                  <Zap className="w-4 h-4" style={{color:g}}/>
                </div>
                <span className="font-orbitron font-black text-[15px] tracking-[0.08em] hidden sm:block">CAZYNO</span>
              </div>
              {[{t:'Accueil',k:'home',I:HomeIcon},{t:'Casino',k:'casino',I:Gamepad2},{t:'Sport',k:'sport',I:Trophy}].map(({t:label,k,I})=>(
                <button key={k} onClick={()=>setActiveTab(k)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold transition"
                  style={activeTab===k?{background:g,color:'#000'}:{color:s}}>
                  <I className="w-3.5 h-3.5"/>{label}
                </button>
              ))}
            </div>
            <button onClick={()=>setAuthOpen(true)} className="px-5 py-2 rounded-xl text-[13px] font-bold transition hover:brightness-110" style={{background:g,color:'#000',boxShadow:`0 3px 12px ${gR}0.25)`}}>
              Connexion / Inscription
            </button>
          </div>

          {/* Hero + Category cards */}
          <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Hero — 2 cols */}
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden flex" style={{background:'linear-gradient(145deg,#0c1a28,#101e2e)',border:`1px solid ${b}`,minHeight:'300px'}}>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-50px] right-[-50px] w-[300px] h-[300px] opacity-[0.06]" style={{background:`radial-gradient(circle,${g},transparent 65%)`}}/>
                <div className="absolute bottom-[-40px] left-[-40px] w-[250px] h-[250px] opacity-[0.04]" style={{background:`radial-gradient(circle,${p},transparent 65%)`}}/>
              </div>

              {/* Left text */}
              <div className="relative z-10 flex-1 p-6 sm:p-8 flex flex-col justify-center">
                <h1 className="text-[26px] sm:text-[34px] lg:text-[40px] font-black leading-[1.3] mb-3 tracking-tight">
                  <span className="opacity-0" style={{animation:'heroWordIn 0.5s ease-out 0s forwards',display:'inline-block'}}>Let's&nbsp;make&nbsp;</span>
                  <span className="opacity-0" style={{animation:'heroWordIn 0.5s ease-out 0.12s forwards',display:'inline-block',background:`linear-gradient(135deg,${g},#34d399)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>gambling</span>
                  <br/>
                  <span className="opacity-0" style={{animation:'heroWordIn 0.5s ease-out 0.24s forwards',display:'inline-block'}}>great&nbsp;again.</span>
                </h1>
                <p className="text-[14px] mb-5 leading-relaxed max-w-sm opacity-0" style={{color:s,animation:'heroFadeIn 0.5s ease-out 0.4s forwards'}}>
                  Rakeback instantane. Resultats prouvables on-chain. Retraits crypto en 10 minutes. Le casino ou la maison ne triche pas.
                </p>
                <div className="opacity-0" style={{animation:'heroFadeIn 0.4s ease-out 0.6s forwards'}}>
                  <Link to="/dashboard/casino/roulette" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold transition hover:brightness-110 active:scale-[0.97]"
                    style={{background:g,color:'#000',boxShadow:`0 4px 20px ${gR}0.3)`,animation:'breatheGlow 3s ease-in-out infinite'}}>
                    <Play className="w-4 h-4" fill="#000"/> Jouer maintenant
                  </Link>
                </div>
              </div>

              {/* Right — animated SVG composition */}
              <div className="hidden sm:block w-[200px] lg:w-[260px] shrink-0 relative">
                <HeroVisual/>
              </div>
            </div>

            {/* 4 Category cards */}
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(({n,sub,btn,to,Svg,c,grad,brd2,dim})=>(
                <Link to={to} key={n} className={`relative rounded-2xl overflow-hidden p-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] group ${dim?'opacity-50 cursor-not-allowed':''}`}
                  style={{background:grad,border:`1px solid ${brd2}`,minHeight:'120px'}}
                  onMouseEnter={e=>{if(!dim)e.currentTarget.style.boxShadow=`0 6px 25px ${brd2}`;}}
                  onMouseLeave={e=>{e.currentTarget.style.boxShadow='none';}}>
                  <div>
                    <p className="text-[13px] font-black tracking-wide mb-0.5">{n}</p>
                    <p className="text-[10px]" style={{color:m}}>{sub}</p>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-bold" style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.06)'}}>{btn}</span>
                    <div className="opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all">
                      <Svg size={40} color={c}/>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Jackpot bar */}
          <div className="mx-5 mb-5 rounded-2xl px-5 py-4 flex flex-wrap items-center gap-4" style={{background:`linear-gradient(135deg,${gR}0.03),${gR}0.06))`,border:`1px solid ${gR}0.12)`,boxShadow:`0 0 40px ${gR}0.04)`}}>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{background:g,boxShadow:`0 0 8px ${g}`}}/>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{color:`${g}60`}}>Jackpot</span>
            </div>
            <p className="font-orbitron font-black text-[22px] sm:text-[28px] shimmer-text leading-none shrink-0">
              {(jp/100).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})} €
            </p>
            <div className="hidden sm:flex items-center gap-3 ml-auto text-[11px]" style={{color:m}}>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full" style={{background:g}}/><CountUp end={47923}/> en ligne</span>
              <span style={{color:b}}>|</span>
              <span>42 jeux</span>
              <span style={{color:b}}>|</span>
              <span>{'<'} 10 min retrait</span>
            </div>
          </div>

          {/* Search + filters */}
          <div className="px-5 mb-5 flex gap-3">
            <div className="flex-1 flex items-center gap-3 rounded-xl px-4 py-3" style={{background:crd,border:`1px solid ${b}`}}>
              <Search className="w-4 h-4" style={{color:m}}/><span className="text-[13px]" style={{color:m}}>Cherchez votre jeu</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium" style={{background:crd,border:`1px solid ${b}`,color:s}}>Theme <ChevronDown className="w-3.5 h-3.5" style={{color:m}}/></button>
            <button className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-medium" style={{background:crd,border:`1px solid ${b}`,color:s}}>Providers <ChevronDown className="w-3.5 h-3.5" style={{color:m}}/></button>
          </div>

          {/* Originals */}
          <section className="px-5 pb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2"><Zap className="w-4 h-4" style={{color:g}}/><h2 className="text-[16px] font-bold">Cazyno Originals</h2></div>
              <Link to="/dashboard/casino/roulette" className="text-[12px] font-medium flex items-center gap-1 transition hover:gap-2" style={{color:s}}>Voir tout <ChevronRight className="w-3.5 h-3.5"/></Link>
            </div>
            <Carousel>
              {GAMES.map(({n,p:path,Svg,c,pl})=>(
                <Link to={`/dashboard/casino/${path}`} key={n}
                  className="shrink-0 w-[140px] sm:w-[155px] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] group"
                  style={{border:`1px solid ${b}`}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${c}40`;e.currentTarget.style.boxShadow=`0 8px 25px ${c}15`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=b;e.currentTarget.style.boxShadow='none';}}>
                  <div className="aspect-[3/4] flex flex-col items-center justify-center gap-2 relative overflow-hidden" style={{background:`linear-gradient(160deg,${c}06,${crd})`}}>
                    {/* Animated glow orb behind icon */}
                    <div className="absolute w-24 h-24 rounded-full opacity-[0.08] group-hover:opacity-[0.15] transition-opacity" style={{background:`radial-gradient(circle,${c},transparent 70%)`,animation:'pulseSlow 4s ease-in-out infinite'}}/>
                    {/* Orbiting dot */}
                    <div className="absolute w-1 h-1 rounded-full" style={{background:c,opacity:0.3,animation:`orbitDot 6s linear infinite`,transformOrigin:'0 30px'}}/>
                    <div className="relative group-hover:scale-110 transition-transform z-10"><Svg size={48} color={c}/></div>
                    <span className="text-[13px] font-bold relative z-10">{n}</span>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-t-2xl z-20">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold" style={{background:c,color:'#000'}}><Play className="w-3 h-3" fill="#000"/>Jouer</span>
                    </div>
                  </div>
                  <div className="px-3 py-2 flex items-center gap-1.5" style={{background:crd}}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:g}}/><span className="text-[10px]" style={{color:m}}>{pl} joueurs</span>
                  </div>
                </Link>
              ))}
            </Carousel>
          </section>

          {/* Populaires */}
          <section className="px-5 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold">Jeux populaires</h2>
              <Link to="/dashboard/casino/roulette" className="text-[12px] font-medium flex items-center gap-1 transition hover:gap-2" style={{color:s}}>Voir tout <ChevronRight className="w-3.5 h-3.5"/></Link>
            </div>
            <Carousel>
              {POP.map(n=>(
                <div key={n} className="shrink-0 w-[140px] sm:w-[155px] rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                  style={{background:crd,border:`1px solid ${b}`}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${p}30`;e.currentTarget.style.boxShadow=`0 6px 20px ${p}10`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=b;e.currentTarget.style.boxShadow='none';}}>
                  <div className="aspect-[3/4] flex items-center justify-center p-3" style={{background:`linear-gradient(150deg,${p}06,${crd})`}}>
                    <span className="text-center text-[11px] font-bold leading-snug" style={{color:s}}>{n}</span>
                  </div>
                  <div className="px-3 py-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{background:g}}/><span className="text-[10px]" style={{color:m}}>{Math.floor(Math.random()*300+50)} joueurs</span>
                  </div>
                </div>
              ))}
            </Carousel>
          </section>

          {/* Footer */}
          <footer className="px-5 py-4" style={{borderTop:`1px solid ${b}30`}}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background:`${gR}0.1)`}}><Zap className="w-3 h-3" style={{color:g}}/></div>
                <span className="font-orbitron font-bold text-[12px]" style={{color:m}}>CAZYNO</span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px]" style={{color:m}}>
                <span>Licence Curacao</span><span>18+</span><span>Provably Fair</span><span>CGU</span><span>Confidentialite</span><span>2026</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  );
}
