import { useState, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2, RotateCcw, Repeat2, CornerDownLeft, Lock, RotateCw } from 'lucide-react';
import WinPopup from '../components/WinPopup';
import { saveRound } from '../lib/saveRound';
import { useAuth } from '../lib/AuthContext';

// ─── Constants ───────────────────────────────────────────────────────────────
const RED = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
const WHEEL_NUMS = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const ROW_TOP = [3,6,9,12,15,18,21,24,27,30,33,36];
const ROW_MID = [2,5,8,11,14,17,20,23,26,29,32,35];
const ROW_BOT = [1,4,7,10,13,16,19,22,25,28,31,34];
const CHIPS = [1,5,10,25,50,100,500,1000];
const CHIP_CLR = { 1:'#1e7a2e',5:'#1a5fa8',10:'#a83232',25:'#8a6a10',50:'#6a1a8a',100:'#8a1a5a',500:'#1a7a6a',1000:'#6a1010' };
const SEG = 360/37;
const WCX=180,WCY=180,R_O=172,R_I=32,R_B=148,R_T=120;

function clr(n){ return n===0?'green':RED.includes(n)?'red':'black'; }
function fmt(n){ return Number(n).toLocaleString('fr-FR'); }

function getOdds(key){
  if(key.startsWith('n-')) return 36;
  if(key.startsWith('split-')) return 17;
  if(key.startsWith('street-')) return 11;
  if(key.startsWith('corner-')) return 8;
  if(key.startsWith('line-')) return 5;
  if(['red','black','even','odd','1-18','19-36'].includes(key)) return 2;
  if(['d1','d2','d3','col1','col2','col3'].includes(key)) return 3;
  return 1;
}

function isWinner(key, num){
  if(key===`n-${num}`) return true;
  const parts = key.split('-').slice(1).map(Number);
  if(['split','street','corner','line'].some(p=>key.startsWith(p+'-'))) return parts.includes(num);
  if(key==='red') return clr(num)==='red';
  if(key==='black') return clr(num)==='black';
  if(key==='even') return num!==0&&num%2===0;
  if(key==='odd') return num!==0&&num%2!==0;
  if(key==='1-18') return num>=1&&num<=18;
  if(key==='19-36') return num>=19&&num<=36;
  if(key==='d1') return num>=1&&num<=12;
  if(key==='d2') return num>=13&&num<=24;
  if(key==='d3') return num>=25&&num<=36;
  if(key==='col1') return num!==0&&ROW_TOP.includes(num);
  if(key==='col2') return num!==0&&ROW_MID.includes(num);
  if(key==='col3') return num!==0&&ROW_BOT.includes(num);
  return false;
}

// ─── Wheel SVG ────────────────────────────────────────────────────────────────
function RouletteWheel({ wheelAngle, ballAngle, spinning, result, className='' }) {
  const br = (ballAngle-90)*Math.PI/180;
  const bx = WCX + R_B*Math.cos(br);
  const by = WCY + R_B*Math.sin(br);

  return (
    <div className={`relative aspect-square w-full ${className}`} style={{ maxWidth:340 }}>
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ boxShadow: spinning
          ? '0 0 60px rgba(0,255,102,0.5),0 0 120px rgba(0,255,102,0.2)'
          : '0 0 30px rgba(0,255,102,0.15)' }}/>

      {/* Static wood rim */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 360">
        <defs>
          <radialGradient id="wd" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="#1a0e05"/>
            <stop offset="93%" stopColor="#6a3a12"/>
            <stop offset="100%" stopColor="#1a0e05"/>
          </radialGradient>
        </defs>
        <circle cx={WCX} cy={WCY} r={R_O+10} fill="url(#wd)"/>
        <circle cx={WCX} cy={WCY} r={R_O+6} fill="none" stroke="#c9a227" strokeWidth="1.5" opacity="0.5"/>
      </svg>

      {/* Spinning wheel */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 360"
        style={{ transform:`rotate(${wheelAngle}deg)`, transition:'transform 7s cubic-bezier(0.1,0,0.05,1)' }}>
        <defs>
          <radialGradient id="hb" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#2d5a3d"/>
            <stop offset="100%" stopColor="#0a1a10"/>
          </radialGradient>
        </defs>
        <circle cx={WCX} cy={WCY} r={R_O} fill="#080808"/>
        {WHEEL_NUMS.map((n,i)=>{
          const s=(i*SEG-90)*Math.PI/180, e=((i+1)*SEG-90)*Math.PI/180;
          const x1=WCX+R_O*Math.cos(s),y1=WCY+R_O*Math.sin(s);
          const x2=WCX+R_O*Math.cos(e),y2=WCY+R_O*Math.sin(e);
          const xi1=WCX+R_I*Math.cos(s),yi1=WCY+R_I*Math.sin(s);
          const xi2=WCX+R_I*Math.cos(e),yi2=WCY+R_I*Math.sin(e);
          const m=(i+.5)*SEG-90, mr=m*Math.PI/180;
          const tx=WCX+R_T*Math.cos(mr),ty=WCY+R_T*Math.sin(mr);
          const c=clr(n);
          const fill=c==='green'?'#0d4a20':c==='red'?'#7a0f0f':'#0d0d0d';
          const stroke=c==='green'?'#22c55e40':c==='red'?'#ef444440':'#2a2a2a';
          return(
            <g key={i}>
              <path d={`M${xi1} ${yi1}L${x1} ${y1}A${R_O} ${R_O} 0 0 1 ${x2} ${y2}L${xi2} ${yi2}A${R_I} ${R_I} 0 0 0 ${xi1} ${yi1}Z`}
                fill={fill} stroke={stroke} strokeWidth="0.8"/>
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                fontSize={9} fontFamily="Orbitron,monospace" fontWeight="900" fill="white" opacity="0.95"
                transform={`rotate(${(i+.5)*SEG+90},${tx},${ty})`}>{n}</text>
            </g>
          );
        })}
        {WHEEL_NUMS.map((_,i)=>{
          const a=(i*SEG-90)*Math.PI/180;
          return <line key={i}
            x1={WCX+R_I*Math.cos(a)} y1={WCY+R_I*Math.sin(a)}
            x2={WCX+R_O*Math.cos(a)} y2={WCY+R_O*Math.sin(a)}
            stroke="#111" strokeWidth="1.2"/>;
        })}
        {WHEEL_NUMS.map((_,i)=>{
          const a=((i*SEG-90+SEG/2))*Math.PI/180;
          const dx=WCX+(R_O-7)*Math.cos(a), dy=WCY+(R_O-7)*Math.sin(a);
          return <polygon key={i}
            points={`${dx},${dy-3} ${dx+2.5},${dy} ${dx},${dy+3} ${dx-2.5},${dy}`}
            fill="#c9a227" opacity="0.6" transform={`rotate(${i*SEG+SEG/2+90},${dx},${dy})`}/>;
        })}
        <circle cx={WCX} cy={WCY} r={R_I+1} fill="url(#hb)" stroke="#22c55e" strokeWidth="1.5"/>
        <circle cx={WCX} cy={WCY} r={R_I-4} fill="#0d1a10"/>
        <circle cx={WCX} cy={WCY} r={R_I-10} fill="#22c55e" opacity="0.85"/>
        <circle cx={WCX} cy={WCY} r={5} fill="#00e701"/>
        <circle cx={WCX-1} cy={WCY-1} r={2} fill="white" opacity="0.5"/>
      </svg>

      {/* Ball (static layer) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 360">
        <defs>
          <radialGradient id="bg2" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff"/>
            <stop offset="50%" stopColor="#e0e0e0"/>
            <stop offset="100%" stopColor="#999"/>
          </radialGradient>
          <filter id="bs"><feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.8)"/></filter>
        </defs>
        <circle cx={bx} cy={by} r={8} fill="url(#bg2)" filter="url(#bs)"/>
        <circle cx={bx-2} cy={by-2.5} r={2.5} fill="white" opacity="0.8"/>
      </svg>

      {/* Marker */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none" style={{marginTop:'-2px'}}>
        <div style={{width:0,height:0,borderLeft:'7px solid transparent',borderRight:'7px solid transparent',borderTop:'24px solid #22c55e',filter:'drop-shadow(0 0 6px #22c55e)'}}/>
      </div>
    </div>
  );
}

// ─── Chip button ──────────────────────────────────────────────────────────────
function Chip({ value, selected, onClick, disabled, size=44 }){
  const c = CHIP_CLR[value]||'#333';
  const lbl = value>=1000?`${value/1000}k`:value;
  return(
    <button onClick={onClick} disabled={disabled}
      className="relative rounded-full flex items-center justify-center font-orbitron font-black text-white transition-all disabled:opacity-40 hover:scale-110 active:scale-95 shrink-0"
      style={{ width:size, height:size,
        background:`radial-gradient(circle at 35% 30%,${c}dd,${c}88)`,
        border: selected?'3px solid white':'2px solid rgba(255,255,255,0.2)',
        boxShadow: selected?`0 0 16px ${c},0 0 5px white`:`0 0 6px ${c}44`,
        fontSize: value>=100?8:10 }}>
      <div className="absolute inset-1 rounded-full border border-white/10 pointer-events-none"/>
      {lbl}
    </button>
  );
}

// ─── Cell chip overlay ────────────────────────────────────────────────────────
function CellChip({ amount }){
  if(!amount) return null;
  const k = Object.keys(CHIP_CLR).reverse().find(k=>amount>=parseInt(k));
  const c = CHIP_CLR[k]||CHIP_CLR[1];
  const lbl = amount>=1000?`${(amount/1000).toFixed(amount%1000===0?0:1)}k`:amount;
  return(
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="rounded-full flex items-center justify-center font-black text-white border border-white/40"
        style={{ width:20,height:20,fontSize:7,background:`radial-gradient(circle at 35% 30%,${c}dd,${c}88)`,boxShadow:`0 0 5px ${c}` }}>
        {lbl}
      </div>
    </div>
  );
}

// ─── Betting Table ────────────────────────────────────────────────────────────
function BettingTable({ bets, chipValue, placeBet, spinning, result }){
  const highlight = key => result!==null&&isWinner(key,result);
  const winStyle = key => highlight(key) ? {outline:'2px solid #22c55e',boxShadow:'0 0 10px #22c55e'} : {};

  function numStyle(n){
    const c=clr(n), won=result===n;
    const base=c==='green'?'#0a4a1a':c==='red'?'#5a0f0f':'#0d0d0d';
    const br=c==='green'?'#22c55e33':c==='red'?'#ef444433':'#222';
    return {
      background: won?(c==='green'?'#22c55e':c==='red'?'#ef4444':'#555'):base,
      border:`1px solid ${br}`,
      boxShadow: highlight(`n-${n}`)?'0 0 10px #22c55e':'none',
      outline: highlight(`n-${n}`)?'2px solid #22c55e':'none',
      transition:'all 0.3s',
      cursor:'pointer',
    };
  }

  const cell = "relative flex items-center justify-center font-orbitron font-black text-white text-[10px] transition-all hover:brightness-125 active:scale-95 select-none";

  return(
    <div className="w-full text-white" style={{ fontSize:'10px' }}>

      {/* Main row: 0 | grid | 2:1 */}
      <div className="flex">

        {/* 0 — narrow, spans all 3 rows height */}
        <div className={`${cell} rounded-l shrink-0`}
          style={{ ...numStyle(0), width:20, height:108, fontSize:9, writingMode:'vertical-rl', textOrientation:'mixed' }}
          onClick={()=>!spinning&&placeBet('n-0')}>
          <CellChip amount={bets['n-0']}/>
          0
        </div>

        {/* 3-row number grid */}
        <div className="flex-1 grid" style={{ gridTemplateColumns:'repeat(12,1fr)', gridTemplateRows:'repeat(3,36px)' }}>
          {[ROW_TOP,ROW_MID,ROW_BOT].map(row=>
            row.map(n=>(
              <div key={n} className={`${cell} border`} style={numStyle(n)}
                onClick={()=>!spinning&&placeBet(`n-${n}`)}>
                <CellChip amount={bets[`n-${n}`]}/>
                {n}
              </div>
            ))
          )}
        </div>

        {/* 2:1 column */}
        <div className="grid shrink-0" style={{ gridTemplateRows:'repeat(3,36px)', width:24 }}>
          {(['col1','col2','col3']).map(k=>(
            <div key={k} className={`${cell} text-green-400 border border-green-900/30 bg-green-950/30 hover:bg-green-900/30 text-[8px]`}
              style={winStyle(k)} onClick={()=>!spinning&&placeBet(k)}>
              <CellChip amount={bets[k]}/>2:1
            </div>
          ))}
        </div>
      </div>

      {/* Dozens */}
      <div className="grid grid-cols-3" style={{ marginLeft:20 }}>
        {[['d1','1st 12'],['d2','2nd 12'],['d3','3rd 12']].map(([k,l])=>(
          <div key={k} className={`${cell} border border-green-900/30 bg-green-950/20 text-green-400 hover:bg-green-900/30 py-2 text-[9px]`}
            style={winStyle(k)} onClick={()=>!spinning&&placeBet(k)}>
            <CellChip amount={bets[k]}/>{l}
          </div>
        ))}
      </div>

      {/* Outside bets */}
      <div className="grid grid-cols-6" style={{ marginLeft:20 }}>
        {[
          { k:'1-18', l:'1-18', s:{} },
          { k:'even', l:'Even', s:{} },
          { k:'red',  l:'●',    s:{ color:'#ef4444', background:'rgba(160,15,15,0.4)' } },
          { k:'black',l:'●',    s:{ color:'#bbb', background:'rgba(20,20,20,0.8)' } },
          { k:'odd',  l:'Odd',  s:{} },
          { k:'19-36',l:'19-36',s:{} },
        ].map(({k,l,s})=>(
          <div key={k} className={`${cell} border border-slate-700/30 bg-slate-900/50 hover:bg-slate-700/30 py-2`}
            style={{...s,...winStyle(k)}} onClick={()=>!spinning&&placeBet(k)}>
            <CellChip amount={bets[k]}/>{l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Roulette(){
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();

  const [bets, setBets] = useState({});
  const [chip, setChip] = useState(10);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [wheelAngle, setWheelAngle] = useState(0);
  const [ballAngle, setBallAngle] = useState(0);
  const [history, setHistory] = useState([]);
  const [winPopup, setWinPopup] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [lastBets, setLastBets] = useState({});
  const [betHistory, setBetHistory] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);

  const wheelRef = useRef(0);
  const ballRef = useRef(0);
  const rafRef = useRef(null);
  const totalBet = Object.values(bets).reduce((a,b)=>a+b,0);

  const placeBet = useCallback((key)=>{
    if(spinning) return;
    setBets(prev=>{ setBetHistory(h=>[...h,prev]); return {...prev,[key]:(prev[key]||0)+chip}; });
  },[spinning,chip]);

  const clearBets = ()=>{ if(!spinning){ setBetHistory([]); setBets({}); } };
  const undoBet = ()=>{ if(spinning||!betHistory.length) return; setBets(betHistory[betHistory.length-1]); setBetHistory(h=>h.slice(0,-1)); };
  const doubleBets = ()=>{
    if(spinning||!totalBet) return;
    setBets(prev=>{ const n={}; Object.entries(prev).forEach(([k,v])=>{n[k]=v*2;}); setBetHistory(h=>[...h,prev]); return n; });
  };
  const reBet = ()=>{ if(!spinning&&Object.keys(lastBets).length) setBets(lastBets); };

  const spin = async()=>{
    if(spinning||!totalBet||totalBet>credits) return;
    if(!isAuthenticated){ navigateToLogin(); return; }

    setCredits(c=>c-totalBet);
    addXp(totalBet);
    setSpinning(true);
    setResult(null);
    setLastResult(null);
    setShowOverlay(true);

    const num = Math.floor(Math.random()*37);
    const idx = WHEEL_NUMS.indexOf(num);
    const finalBall = Math.random()*360;
    const slotCenter = (idx*SEG+SEG/2)%360;
    const neededMod = ((finalBall-slotCenter)%360+360)%360;
    const curMod = ((wheelRef.current%360)+360)%360;
    const extra = (neededMod-curMod+360)%360;
    const finalWheel = wheelRef.current + (22+Math.floor(Math.random()*6))*360 + extra;

    wheelRef.current = finalWheel;
    setWheelAngle(finalWheel);

    const SPIN_MS = 7000;
    const ballStart = ballRef.current;
    const spins = 13+Math.floor(Math.random()*5);
    const cwOff = ((finalBall-ballStart)%360+360)%360;
    const ballDelta = -(spins*360+(cwOff>0?360-cwOff:0));
    const t0 = performance.now();

    await new Promise(resolve=>{
      const tick = now=>{
        const t = Math.min((now-t0)/SPIN_MS,1);
        const eased = t<0.75?t:0.75+0.25*(1-Math.pow(1-(t-0.75)/0.25,3));
        const a = ((ballStart+ballDelta*eased)%360+360)%360;
        ballRef.current = a;
        setBallAngle(a);
        if(t<1) rafRef.current=requestAnimationFrame(tick);
        else { ballRef.current=finalBall; setBallAngle(finalBall); resolve(); }
      };
      rafRef.current=requestAnimationFrame(tick);
    });

    await new Promise(r=>setTimeout(r,400));

    const currentBets = {...bets};
    let totalWin = 0;
    Object.entries(currentBets).forEach(([k,amt])=>{ if(isWinner(k,num)) totalWin+=amt*getOdds(k); });
    if(totalWin>0){
      setCredits(c=>c+totalWin);
      if(totalWin>totalBet) setWinPopup({ amount:fmt(totalWin-totalBet), ts:Date.now() });
    }
    saveRound({ game:'Roulette', bet:totalBet, result:`${num}`, profit:parseFloat((totalWin-totalBet).toFixed(2)) });

    const r = { number:num, color:clr(num), totalWin, totalBet, ts:Date.now() };
    setResult(num);
    setLastResult(r);
    setHistory(h=>[r,...h.slice(0,19)]);
    setLastBets(currentBets);
    setSpinning(false);
    setBets({});
    setBetHistory([]);
  };

  const DOT = { red:'#ef4444', black:'#555', green:'#22c55e' };

  // Shared action buttons
  const Actions = ()=>(
    <>
      <div className="grid grid-cols-4 gap-2">
        {[
          { l:'Annuler', icon:<CornerDownLeft size={13}/>, fn:undoBet, dis:spinning||!betHistory.length, s:'border-white/10 bg-white/5 text-white/60' },
          { l:'Effacer', icon:<Trash2 size={13}/>, fn:clearBets, dis:spinning||!totalBet, s:'border-red-500/30 bg-red-500/10 text-red-400' },
          { l:'×2', icon:<span className="text-sm">×2</span>, fn:doubleBets, dis:spinning||!totalBet||totalBet*2>credits, s:'border-yellow-400/30 bg-yellow-400/10 text-yellow-400' },
          { l:'Remiser', icon:<Repeat2 size={13}/>, fn:reBet, dis:spinning||!Object.keys(lastBets).length, s:'border-[rgba(0,231,1,0.3)] bg-[rgba(0,231,1,0.1)] text-[#00e701]' },
        ].map(({l,icon,fn,dis,s})=>(
          <button key={l} onClick={fn} disabled={dis}
            className={`py-2.5 rounded-xl border ${s} text-[10px] font-bold disabled:opacity-25 active:scale-95 transition-all flex flex-col items-center gap-0.5`}>
            {icon}{l}
          </button>
        ))}
      </div>
      {!isAuthenticated
        ? <button onClick={navigateToLogin} className="w-full py-3.5 rounded-xl font-orbitron font-black text-sm flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg,#00e701,#00CC55)',color:'#000'}}><Lock className="w-4 h-4" /> Se connecter</button>
        : <button onClick={spin} disabled={spinning||!totalBet||totalBet>credits}
            className="w-full py-3.5 rounded-xl font-orbitron font-black text-sm disabled:opacity-40 active:scale-[0.98] transition-all"
            style={{background:'linear-gradient(135deg,#00e701,#00CC55)',color:'#000',boxShadow:'0 0 20px rgba(0,255,102,0.4)'}}>
            {spinning?'En cours...':totalBet>0?`LANCER — ${fmt(totalBet)} €`:'Placez vos mises'}
          </button>
      }
    </>
  );

  return (
    <div className="fade-up pb-24 md:pb-8 max-w-screen-xl mx-auto">
      {winPopup && <WinPopup key={winPopup.ts} amount={winPopup.amount} onClose={()=>setWinPopup(null)}/>}

      {/* ═══════════════ MOBILE ═══════════════ */}
      <div className="lg:hidden space-y-3 px-2">

        <div className="text-center pt-2">
          <h1 className="font-orbitron text-2xl font-black text-[#00e701]">ROULETTE</h1>
        </div>

        {/* History pills */}
        {history.length>0&&(
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {history.map(({number,color,ts})=>(
              <div key={ts} className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-orbitron font-bold text-[9px] text-white border border-white/10"
                style={{background:DOT[color]}}>
                {number}
              </div>
            ))}
          </div>
        )}

        {/* Chips */}
        <div className="rounded-2xl p-3" style={{background:'#0a0a0a',border:'1px solid rgba(0,255,102,0.1)'}}>
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 mb-2">Jeton</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CHIPS.map(v=><Chip key={v} value={v} selected={chip===v} onClick={()=>setChip(v)} disabled={spinning} size={44}/>)}
          </div>
        </div>

        {/* Betting table — scrollable */}
        <div className="rounded-2xl overflow-hidden" style={{background:'linear-gradient(160deg,#08100a,#030805)',border:'1px solid rgba(0,255,102,0.12)'}}>
          <div className="overflow-x-auto p-2">
            <div style={{minWidth:300}}>
              <BettingTable bets={bets} chipValue={chip} placeBet={placeBet} spinning={spinning} result={result}/>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl py-2.5 text-center" style={{background:'rgba(0,255,102,0.06)',border:'1px solid rgba(0,255,102,0.15)'}}>
            <p style={{fontSize:9,color:'rgba(255,255,255,0.3)'}}>MISE</p>
            <p className="font-orbitron font-black text-sm text-[#00e701]">{fmt(totalBet)} €</p>
          </div>
          <div className="rounded-xl py-2.5 text-center" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
            <p style={{fontSize:9,color:'rgba(255,255,255,0.3)'}}>SOLDE</p>
            <p className="font-orbitron font-black text-sm text-white">{fmt(credits)} €</p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Actions/>
        </div>

        {/* Mobile spin overlay */}
        {showOverlay&&(
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 px-4"
            style={{background:'radial-gradient(ellipse at 50% 30%,hsl(142 30% 8%) 0%,hsl(222 20% 4%) 85%)'}}>
            <p className="font-orbitron text-xl font-black text-[#00e701]">ROULETTE</p>
            <div className="w-full flex justify-center">
              <RouletteWheel wheelAngle={wheelAngle} ballAngle={ballAngle} spinning={spinning} result={result}/>
            </div>
            {spinning&&<p className="text-xs text-[#00e701] font-orbitron font-black tracking-widest animate-pulse">LA BILLE TOURNE...</p>}
            {lastResult&&!spinning&&(
              <div className="fade-up w-full max-w-xs space-y-3">
                <div className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-[#1a2a38/40] bg-black/50">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-orbitron font-black text-xl text-white shrink-0 border-2"
                    style={{background:DOT[lastResult.color],borderColor:DOT[lastResult.color]}}>
                    {lastResult.number}
                  </div>
                  <div>
                    <p className={`font-orbitron font-black text-xl ${lastResult.totalWin>=lastResult.totalBet?'text-[#00e701]':'text-destructive'}`}>
                      {lastResult.totalWin>=lastResult.totalBet?`+${fmt(lastResult.totalWin-lastResult.totalBet)}`:
                        `-${fmt(lastResult.totalBet-lastResult.totalWin)}`} €
                    </p>
                    <p className="text-xs text-[#94a3b8] capitalize">{lastResult.color} · {lastResult.number}</p>
                  </div>
                </div>
                <button onClick={()=>setShowOverlay(false)}
                  className="w-full py-4 rounded-2xl font-orbitron font-black text-base active:scale-95 transition-all"
                  style={{background:'linear-gradient(135deg,#00e701,#00CC55)',color:'#000',boxShadow:'0 0 30px rgba(0,255,102,0.5)'}}>
                  Rejouer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════ DESKTOP ═══════════════ */}
      <div className="hidden lg:block px-4">
        <div className="text-center mb-6">
          <h1 className="font-orbitron text-4xl font-black text-[#00e701]">ROULETTE</h1>
          <p className="text-[#94a3b8] text-sm mt-1">Roulette Européenne · 37 numéros</p>
        </div>

        {history.length>0&&(
          <div className="flex gap-1.5 overflow-x-auto pb-3 mb-2">
            {history.map(({number,color,ts})=>(
              <div key={ts} className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-orbitron font-bold text-[9px] text-white"
                style={{background:DOT[color]}}>{number}</div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-[360px_1fr] gap-6">
          {/* Left */}
          <div className="space-y-4">
            <div className="rounded-2xl p-5 flex flex-col items-center gap-4"
              style={{background:'radial-gradient(ellipse at 50% 0%,hsl(142 30% 8%),hsl(222 20% 6%))',border:'1px solid rgba(0,255,102,0.15)'}}>
              <RouletteWheel wheelAngle={wheelAngle} ballAngle={ballAngle} spinning={spinning} result={result} className="max-w-[320px]"/>
              {lastResult&&!spinning&&(
                <div className="fade-up w-full flex items-center gap-3 bg-black/40 rounded-xl px-4 py-3 border border-[#1a2a38/40]">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-orbitron font-black text-lg text-white shrink-0 border-2"
                    style={{background:DOT[lastResult.color],borderColor:DOT[lastResult.color]}}>
                    {lastResult.number}
                  </div>
                  <div>
                    <p className={`font-orbitron font-black text-lg ${lastResult.totalWin>=lastResult.totalBet?'text-[#00e701]':'text-destructive'}`}>
                      {lastResult.totalWin>=lastResult.totalBet?`+${fmt(lastResult.totalWin-lastResult.totalBet)}`:
                        `-${fmt(lastResult.totalBet-lastResult.totalWin)}`} €
                    </p>
                    <p className="text-xs text-[#94a3b8] capitalize">{lastResult.color} · {lastResult.number}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-2xl p-4 space-y-4" style={{background:'#0a0a0a',border:'1px solid rgba(0,255,102,0.15)'}}>
              <div>
                <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-2">Valeur du jeton</p>
                <div className="flex gap-2 flex-wrap">
                  {CHIPS.map(v=><Chip key={v} value={v} selected={chip===v} onClick={()=>setChip(v)} disabled={spinning}/>)}
                </div>
              </div>
              <Actions/>
            </div>
          </div>

          {/* Right */}
          <div className="rounded-2xl p-4" style={{background:'linear-gradient(160deg,#0a1a0f,#060d08)',border:'1px solid rgba(0,255,102,0.15)'}}>
            <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-widest mb-4 text-center">Tableau de Mise</p>
            <BettingTable bets={bets} chipValue={chip} placeBet={placeBet} spinning={spinning} result={result}/>
            {Object.keys(bets).length>0&&(
              <div className="mt-3 rounded-xl p-3 border border-[#1a2a38]/30 bg-black/20">
                <p className="text-[10px] font-semibold text-[#94a3b8] uppercase mb-2">
                  {Object.keys(bets).length} pari(s) · {fmt(totalBet)} €
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(bets).map(([k,v])=>(
                    <button key={k} onClick={()=>!spinning&&setBets(p=>{const n={...p};delete n[k];return n;})} disabled={spinning}
                      className="text-[11px] bg-[rgba(0,231,1,0.1)] border border-[rgba(0,231,1,0.3)] rounded-lg px-2 py-1 hover:bg-destructive/20 hover:border-destructive/50 transition-colors disabled:opacity-40">
                      <span className="text-[#94a3b8]">{k.replace(/^n-/,'#').substring(0,8)}</span>
                      <span className="font-bold text-[#00e701] ml-1">{fmt(v)}€</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}