import { useState } from 'react';

const GAMES = ['Crash','Dice','Plinko','Roulette','Blackjack','Mines','Trader','Limbo'];
const NAMES = ['CryptoKing','LuckyDice','HighRoller','NeonBet','DiamondH','GoldRush','AcePlayer','MoonShot','SilverFox','ProBet','Phantom','StormBet','MaxBet','WildCard','DeepStack'];
const GAME_COLORS = {Crash:'#3b82f6',Dice:'#10b981',Plinko:'#a855f7',Roulette:'#ef4444',Blackjack:'#22c55e',Mines:'#14b8a6',Trader:'#06b6d4',Limbo:'#f43f5e'};

function randomWin() {
  const game = GAMES[Math.floor(Math.random()*GAMES.length)];
  const amount = Math.random() > 0.9 ? (Math.random()*20000+5000) : (Math.random()*2000+10);
  return {
    name: NAMES[Math.floor(Math.random()*NAMES.length)],
    game,
    color: GAME_COLORS[game],
    amount: amount.toFixed(2),
    multi: (Math.random()*(amount>5000?100:30)+1.2).toFixed(1),
    big: amount > 5000,
  };
}

export default function LiveWinTicker() {
  const [wins] = useState(()=>Array.from({length:25},randomWin));

  return (
    <div className="h-9 overflow-hidden relative" style={{background:'#080c12'}}>
      {/* Left: Live badge */}
      <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center pl-3 pr-6"
        style={{background:'linear-gradient(90deg,#080c12 70%,transparent)'}}>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{background:'#ef4444', boxShadow:'0 0 12px rgba(239,68,68,0.4)'}}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:'#fff'}}/>
          <span className="text-[9px] font-black uppercase tracking-wider text-white">Live</span>
        </div>
      </div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10" style={{background:'linear-gradient(270deg,#080c12,transparent)'}}/>

      <div className="ticker-scroll flex items-center h-full whitespace-nowrap pl-24">
        {[...wins,...wins].map((w,i)=>(
          <div key={i} className="inline-flex items-center gap-1.5 px-3 text-[11px]">
            <span className="font-bold" style={{color:w.color}}>{w.name}</span>
            <span style={{color:'#4b5c6f'}}>a gagne</span>
            <span className="font-orbitron font-black" style={{color:w.big?'#FFD700':'#00e701'}}>
              {parseFloat(w.amount).toLocaleString('fr-FR')}€
            </span>
            <span className="font-mono font-bold px-1 py-0.5 rounded text-[9px]" style={{background:`${w.color}15`,color:w.color}}>
              {w.multi}x
            </span>
            <span style={{color:'#4b5c6f'}}>sur</span>
            <span className="font-medium" style={{color:w.color}}>{w.game}</span>
            <span className="mx-2 text-[6px]" style={{color:'#1a2a38'}}>|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
