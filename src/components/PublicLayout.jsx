import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Menu, X, Gift, Users, Crown, BookOpen, Star,
  Shield, Headphones, Globe, ChevronDown, ChevronRight, ChevronLeft,
  Zap, LogIn, Home as HomeIcon, Gamepad2, Trophy
} from 'lucide-react';
import AuthModal from './AuthModal';

const bg='#080c12',sbg='#0c1018',crd='#111a25';
const g='#00e701',gR='rgba(0,231,1,',p='#8b5cf6',s='#94a3b8',m='#4b5c6f',b='#1a2a38';

const NAV=[{I:Gift,l:'Bonuses',c:'#fbbf24',badge:'4'},{I:Star,l:'Promotions',c:'#f97316'},{I:Trophy,l:'Tournaments',c:'#a855f7'}];
const NAV2=[{I:Users,l:'Affilie',c:'#60a5fa'},{I:Crown,l:'VIP Club',c:'#fbbf24'},{I:BookOpen,l:'Blog',c:s,to:'/blog'}];
const NAV3=[{I:Shield,l:'Jeu Responsable',c:'#34d399',to:'/responsible-gambling'},{I:Headphones,l:'Support 24/7',c:'#a78bfa'},{I:Globe,l:'Langue: Francais',c:s,dd:1}];

function SideNavItem({I,l,c,dd,badge,to}){
  const Comp=to?Link:'button';
  const extra=to?{to}:{};
  return(
    <Comp {...extra} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition hover:bg-white/[0.03]">
      <div className="w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0" style={{background:`${c}12`,border:`1px solid ${c}18`}}>
        <I className="w-3.5 h-3.5" style={{color:c}}/>
      </div>
      <span className="text-[13px] font-medium flex-1" style={{color:s}}>{l}</span>
      {badge&&<span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:g,color:'#000'}}>{badge}</span>}
      {dd&&<ChevronDown className="w-3.5 h-3.5" style={{color:m}}/>}
    </Comp>
  );
}

export default function PublicLayout(){
  const[mob,setMob]=useState(false);
  const[authOpen,setAuthOpen]=useState(false);
  const[collapsed,setCollapsed]=useState(()=>localStorage.getItem('cz_sb')==='1');
  const location=useLocation();
  const toggleSb=()=>setCollapsed(v=>{const n=!v;localStorage.setItem('cz_sb',n?'1':'0');return n;});
  useEffect(()=>{document.documentElement.classList.add('dark');},[]);
  useEffect(()=>{setMob(false);},[location.pathname]);

  return(
    <div className="min-h-screen relative overflow-hidden" style={{background:bg,color:'#fff',fontFamily:"'Satoshi',sans-serif"}}>
      <div className="rotating-glow"/>
      <div className="relative z-10 flex gap-2.5 p-2.5">

        {/* ══════ SIDEBAR ══════ */}
        <div className={`hidden md:block shrink-0 sticky top-2.5 h-[calc(100vh-20px)] transition-all duration-300 ${collapsed?'w-[68px]':'w-[220px]'}`}>
          <aside className="h-full flex flex-col rounded-2xl overflow-y-auto no-scrollbar" style={{background:sbg,border:`1px solid ${b}`,boxShadow:`0 0 30px ${gR}0.05)`}}>

            <div className={`flex ${collapsed?'justify-center':'justify-between items-center px-4'} pt-4 pb-2`}>
              {!collapsed&&<span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{color:m}}>Menu</span>}
              <button onClick={toggleSb} className="w-8 h-8 rounded-xl flex items-center justify-center transition hover:bg-white/[0.06]" style={{background:crd,border:`1px solid ${b}`}}>
                <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed?'rotate-180':''}`} style={{color:s}}/>
              </button>
            </div>

            <div className={`flex-1 ${collapsed?'px-1.5':'px-2.5'} space-y-1 overflow-y-auto no-scrollbar`}>
              {collapsed?(
                <div className="flex flex-col items-center gap-1">
                  <Link to="/" className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:`${gR}0.08)`,border:`1px solid ${gR}0.15)`}}>
                    <HomeIcon className="w-4 h-4" style={{color:g}}/>
                  </Link>
                  {[{I:Gamepad2,c:g,to:'/dashboard/casino/roulette'},{I:Trophy,c:p,to:'/'}].map(({I,c,to},i)=>(
                    <Link to={to} key={i} className="w-9 h-9 rounded-xl flex items-center justify-center transition hover:bg-white/[0.04]" style={{background:`${c}08`,border:`1px solid ${c}12`}}>
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
                  <Link to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl" style={{background:`${gR}0.06)`,borderLeft:`2px solid ${g}`}}>
                    <HomeIcon className="w-[15px] h-[15px]" style={{color:g}}/><span className="text-[13px] font-semibold" style={{color:g}}>Accueil</span>
                  </Link>
                  {[{I:Gamepad2,l:'Casino',c:g,dd:1,to:'/dashboard/casino/roulette'},{I:Trophy,l:'Sport',c:p,dd:1,to:'/'}].map(({I,l,c,dd,to})=>(
                    <Link to={to} key={l} className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition hover:bg-white/[0.03]">
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
              <Link to="/" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.03]"><HomeIcon className="w-5 h-5" style={{color:g}}/><span className="text-[13px] font-medium" style={{color:s}}>Accueil</span></Link>
              <Link to="/dashboard/casino/roulette" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.03]"><Gamepad2 className="w-5 h-5" style={{color:g}}/><span className="text-[13px] font-medium" style={{color:s}}>Casino</span></Link>
              <Link to="/blog" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.03]"><BookOpen className="w-5 h-5" style={{color:s}}/><span className="text-[13px] font-medium" style={{color:s}}>Blog</span></Link>
              <Link to="/responsible-gambling" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.03]"><Shield className="w-5 h-5" style={{color:'#34d399'}}/><span className="text-[13px] font-medium" style={{color:s}}>Jeu Responsable</span></Link>
              <Link to="/about" className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.03]"><Zap className="w-5 h-5" style={{color:g}}/><span className="text-[13px] font-medium" style={{color:s}}>A propos</span></Link>
            </div>
            <div className="px-4 py-3"><button onClick={()=>{setMob(false);setAuthOpen(true);}} className="flex items-center justify-center w-full py-2.5 rounded-xl text-[13px] font-bold" style={{background:g,color:'#000'}}>Connexion / Inscription</button></div>
          </aside>
        </>}

        {/* ══════ CONTENT ══════ */}
        <main className="flex-1 min-w-0 h-[calc(100vh-20px)] sticky top-2.5 rounded-2xl overflow-y-auto no-scrollbar" style={{background:sbg,border:`1px solid ${b}`,boxShadow:`0 0 30px ${gR}0.05)`}}>

          {/* Header sticky */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3 backdrop-blur-xl" style={{background:`${sbg}e8`,borderBottom:`1px solid ${b}50`}}>
            <div className="flex items-center gap-1">
              <button onClick={()=>setMob(!mob)} className="md:hidden p-1.5 mr-2"><Menu className="w-5 h-5" style={{color:s}}/></button>
              <Link to="/" className="flex items-center gap-2 mr-4">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center" style={{background:`linear-gradient(135deg,${gR}0.15),${gR}0.05))`,border:`1px solid ${gR}0.2)`}}>
                  <Zap className="w-4 h-4" style={{color:g}}/>
                </div>
                <span className="font-orbitron font-black text-[15px] tracking-[0.08em] hidden sm:block">CAZYNO</span>
              </Link>
              {[{t:'Accueil',to:'/',I:HomeIcon},{t:'Casino',to:'/dashboard/casino/roulette',I:Gamepad2},{t:'Blog',to:'/blog',I:BookOpen}].map(({t:label,to,I})=>(
                <Link key={label} to={to}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold transition"
                  style={location.pathname===to?{background:g,color:'#000'}:{color:s}}>
                  <I className="w-3.5 h-3.5"/>{label}
                </Link>
              ))}
            </div>
            <button onClick={()=>setAuthOpen(true)} className="px-5 py-2 rounded-xl text-[13px] font-bold transition hover:brightness-110" style={{background:g,color:'#000',boxShadow:`0 3px 12px ${gR}0.25)`}}>
              Connexion / Inscription
            </button>
          </div>

          {/* Page content */}
          <div className="p-5">
            <Outlet/>
          </div>
        </main>
      </div>

      {authOpen&&<AuthModal onClose={()=>setAuthOpen(false)}/>}
    </div>
  );
}
