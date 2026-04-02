import { useState } from 'react';

const CW = 80;   // cell width
const CH = 90;   // cell height
const ZW = 60;   // zero width
const COLS = 12;
const ROWS = 3;

const GRID = [
  [3,6,9,12,15,18,21,24,27,30,33,36],
  [2,5,8,11,14,17,20,23,26,29,32,35],
  [1,4,7,10,13,16,19,22,25,28,31,34],
];

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
function getColor(n) {
  if (n === 0) return 'green';
  return RED_NUMBERS.includes(n) ? 'red' : 'black';
}

// Refined colors: deeper reds, pure blacks, casino green
const FILL  = { red: '#8b0000', black: '#0a0a0a', green: '#1a5a2a' };
const HOVER = { red: '#c41e3a', black: '#1a1a1a', green: '#2d8a3d' };

// Premium chip colors - darker, more refined
const CHIP_COLORS_MAP = {
  1:    '#6b7280',  // dark gray
  5:    '#0369a1',  // dark sky blue
  10:   '#047857',  // dark emerald
  25:   '#b45309',  // dark amber
  50:   '#7f1d1d',  // dark red
  100:  '#5b21b6',  // dark violet
  500:  '#be185d',  // dark pink
  1000: '#92400e',  // dark orange
};

function chipColor(amount) {
  const keys = Object.keys(CHIP_COLORS_MAP).map(Number).sort((a,b) => b-a);
  return CHIP_COLORS_MAP[keys.find(k => amount >= k) || 1];
}
function chipLabel(amount) {
  if (amount >= 1000) return `${(amount/1000).toFixed(amount%1000===0?0:1)}k`;
  return String(amount);
}

function colOf(n) { return Math.ceil(n/3) - 1; }
function rowOf(n) { return GRID.findIndex(r => r.includes(n)); }
function cellX(n) { return ZW + colOf(n)*CW; }
function cellY(n) { return rowOf(n)*CH; }

const SVG_W = ZW + COLS*CW + 70;
const OUTSIDE_Y = ROWS*CH + 8;
const DOZ_H = 44;
const OUT_H = 44;
const OUTSIDE_Y2 = OUTSIDE_Y + DOZ_H + 6;
const SVG_H = OUTSIDE_Y2 + OUT_H + 8;

// Chip with 3D effect and gradient
function ChipDot({ cx, cy, amount, r = 12 }) {
  const color = chipColor(amount);
  const label = chipLabel(amount);
  const fs = r < 10 ? 8 : 9.5;
  
  return (
    <g>
      {/* Shadow */}
      <circle cx={cx} cy={cy+r*0.3} r={r+1} fill="black" opacity="0.3"/>
      
      {/* Chip base with gradient */}
      <defs>
        <radialGradient id={`chipGrad${cx}${cy}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor={color} stopOpacity="1"/>
          <stop offset="70%" stopColor={color} stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.4"/>
        </radialGradient>
      </defs>
      
      <circle cx={cx} cy={cy} r={r} fill={`url(#chipGrad${cx}${cy})`} stroke="rgba(255,255,255,0.6)" strokeWidth="2"/>
      
      {/* Shine effect */}
      <circle cx={cx-r*0.35} cy={cy-r*0.35} r={r*0.35} fill="white" opacity="0.3"/>
      
      {/* Amount text */}
      <text x={cx} y={cy+fs*0.3} textAnchor="middle" dominantBaseline="middle"
        fontSize={fs} fontFamily="Orbitron,monospace" fontWeight="900" fill="white"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
        {label}
      </text>
    </g>
  );
}

function NumberCell({ n, x, y, w, h, hasBet, betAmount, isHovered, onClick, onEnter, onLeave }) {
  const col = getColor(n);
  const fill = isHovered ? HOVER[col] : FILL[col];
  const border = hasBet ? '#fbbf24' : (col === 'green' ? '#1e5a38' : col === 'red' ? '#7c0a02' : '#1a1a1a');
  
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {/* Subtle inset shadow */}
      <rect x={x+1} y={y+1} width={w-2} height={h-2} rx="8" fill="black" opacity="0.25"/>
      
      {/* Main cell */}
      <rect x={x} y={y} width={w} height={h} rx="8"
        fill={fill} stroke={border} strokeWidth={hasBet ? 3 : 1.5}/>
      
      {/* Subtle inner border */}
      <rect x={x+1.5} y={y+1.5} width={w-3} height={h-3} rx="7" fill="none"
        stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
      
      {/* Number text */}
      <text x={x+w/2} y={y+h/2+2} textAnchor="middle" dominantBaseline="middle"
        fontSize="18" fontFamily="Orbitron,monospace" fontWeight="900" fill="white" opacity="0.98">
        {n}
      </text>
      
      {hasBet && <ChipDot cx={x+w/2} cy={y+h/2} amount={betAmount} r={14}/>}
    </g>
  );
}

function OutsideCell({ k, label, x, y, w, h, hasBet, betAmount, isHovered, onClick, onEnter, onLeave, customFill, customHover }) {
  const baseFill = customFill || '#1a1a2e';
  const fill = isHovered ? (customHover || '#2d2d4a') : baseFill;
  
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {/* Cell */}
      <rect x={x} y={y} width={w} height={h} rx="8"
        fill={fill} stroke={hasBet ? '#fbbf24' : '#ffffff20'} strokeWidth={hasBet ? 3 : 1.5}/>
      
      {/* Inner highlight */}
      <rect x={x+1.5} y={y+1.5} width={w-3} height={h-3} rx="7" fill="none"
        stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
      
      {/* Label text */}
      <text x={x+w/2} y={y+h*0.4} textAnchor="middle" dominantBaseline="middle"
        fontSize="12" fontFamily="Orbitron,monospace" fontWeight="700" fill="rgba(255,255,255,0.8)">
        {label.split(' · ')[0]}
      </text>
      {label.includes('·') && (
        <text x={x+w/2} y={y+h*0.68} textAnchor="middle" dominantBaseline="middle"
          fontSize="10" fontFamily="Orbitron,monospace" fontWeight="600" fill="rgba(255,215,0,0.8)">
          {label.split(' · ')[1]}
        </text>
      )}
      
      {hasBet && <ChipDot cx={x+w/2} cy={y+h*0.6} amount={betAmount} r={12}/>}
    </g>
  );
}

// Transparent hover zone
function BetZone({ k, cx, cy, size, bets, hovered, setHovered, handle, chipR = 10 }) {
  const hasBet = !!bets[k];
  const isH = hovered === k;
  
  return (
    <g style={{ cursor: 'pointer' }}
      onClick={() => handle(k)}
      onMouseEnter={() => setHovered(k)}
      onMouseLeave={() => setHovered(null)}>
      <rect x={cx-size} y={cy-size} width={size*2} height={size*2} fill="transparent"/>
      {!hasBet && isH && (
        <circle cx={cx} cy={cy} r={7} fill="white" opacity="0.3"/>
      )}
      {hasBet && <ChipDot cx={cx} cy={cy} amount={bets[k]} r={chipR}/>}
    </g>
  );
}

export default function RouletteCarpet({ bets, placeBet, removeBet, spinning }) {
  const [hovered, setHovered] = useState(null);

  const handle = (key) => {
    if (spinning) return;
    placeBet(key);
  };
  const H = (key) => hovered === key;

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: SVG_W }}>
        <svg width={SVG_W} height={SVG_H} style={{ display: 'block', userSelect: 'none' }}>

          {/* ── Zero ── */}
          <NumberCell n={0} x={0} y={0} w={ZW} h={ROWS*CH}
            hasBet={!!bets['n-0']} betAmount={bets['n-0']}
            isHovered={H('n-0')}
            onClick={() => handle('n-0')}
            onEnter={() => setHovered('n-0')}
            onLeave={() => setHovered(null)}/>

          {/* ── Number cells ── */}
          {GRID.map((row, ri) => row.map(n => {
            const key = `n-${n}`;
            const x = cellX(n), y = cellY(n);
            return (
              <NumberCell key={n} n={n} x={x} y={y} w={CW} h={CH}
                hasBet={!!bets[key]} betAmount={bets[key]}
                isHovered={H(key)}
                onClick={() => handle(key)}
                onEnter={() => setHovered(key)}
                onLeave={() => setHovered(null)}/>
            );
          }))}

          {/* ── Split entre zéro et 1, 2, 3 ── */}
          {[0,1,2].map(ri => {
            const n = GRID[ri][0];
            const k = `split-0-${n}`;
            const cx2 = ZW;
            const cy2 = ri*CH + CH/2;
            return (
              <BetZone key={k} k={k} cx={cx2} cy={cy2} size={12}
                bets={bets} hovered={hovered} setHovered={setHovered} handle={handle}/>
            );
          })}

          {/* ── Corner zéro+1+2 et zéro+2+3 ── */}
          {[
            { k:'corner-0-1-2-3', cx: ZW, cy: CH },
            { k:'corner-0-2-3', cx: ZW, cy: CH*2 },
          ].map(({k, cx: cx2, cy: cy2}) => (
            <BetZone key={k} k={k} cx={cx2} cy={cy2} size={10}
              bets={bets} hovered={hovered} setHovered={setHovered} handle={handle} chipR={9}/>
          ))}

          {/* ── Split H: between same-row adjacent numbers ── */}
          {GRID.map((row, ri) => row.slice(0,-1).map((n, ci) => {
            const b = GRID[ri][ci+1];
            const k = `split-${Math.min(n,b)}-${Math.max(n,b)}`;
            const cx2 = ZW + (ci+1)*CW;
            const cy2 = ri*CH + CH/2;
            return (
              <BetZone key={k} k={k} cx={cx2} cy={cy2} size={12}
                bets={bets} hovered={hovered} setHovered={setHovered} handle={handle}/>
            );
          }))}

          {/* ── Split V: between same-col adjacent rows ── */}
          {GRID[0].map((_, ci) => [0,1].map(ri => {
            const a = GRID[ri][ci], b = GRID[ri+1][ci];
            const k = `split-${Math.min(a,b)}-${Math.max(a,b)}`;
            const cx2 = ZW + ci*CW + CW/2;
            const cy2 = (ri+1)*CH;
            return (
              <BetZone key={k} k={k} cx={cx2} cy={cy2} size={12}
                bets={bets} hovered={hovered} setHovered={setHovered} handle={handle}/>
            );
          }))}

          {/* ── Corner: 4 numbers at intersection ── */}
          {GRID[0].slice(0,-1).map((_, ci) => [0,1].map(ri => {
            const a=GRID[ri][ci], b=GRID[ri][ci+1], c2=GRID[ri+1][ci], d=GRID[ri+1][ci+1];
            const sorted=[a,b,c2,d].sort((x,y)=>x-y);
            const k=`corner-${sorted.join('-')}`;
            const cx2=ZW+(ci+1)*CW, cy2=(ri+1)*CH;
            return (
              <BetZone key={k} k={k} cx={cx2} cy={cy2} size={10}
                bets={bets} hovered={hovered} setHovered={setHovered} handle={handle} chipR={9}/>
            );
          }))}

          {/* ── Street: right edge of each column (3 numbers) ── */}
          {GRID[0].map((_, ci) => {
            const nums = GRID.map(r=>r[ci]).sort((a,b)=>a-b);
            const k = `street-${nums.join('-')}`;
            const sx = ZW + (ci+1)*CW;
            const sy = ROWS*CH/2;
            return (
              <BetZone key={k} k={k} cx={sx} cy={sy} size={14}
                bets={bets} hovered={hovered} setHovered={setHovered} handle={handle}/>
            );
          })}

          {/* ── Line: bottom border between 2 adjacent columns (6 numbers) ── */}
          {GRID[0].slice(0,-1).map((_, ci) => {
            const c1=GRID.map(r=>r[ci]), c2=GRID.map(r=>r[ci+1]);
            const sorted=[...c1,...c2].sort((a,b)=>a-b);
            const k=`line-${sorted.join('-')}`;
            const lx=ZW+(ci+1)*CW, ly=ROWS*CH;
            return (
              <BetZone key={k} k={k} cx={lx} cy={ly} size={10}
                bets={bets} hovered={hovered} setHovered={setHovered} handle={handle} chipR={9}/>
            );
          })}

          {/* ── Dozens ── */}
          {[
            {k:'d1', label:'1ère · ×3', x:ZW, w:CW*4},
            {k:'d2', label:'2ème · ×3',  x:ZW+CW*4, w:CW*4},
            {k:'d3', label:'3ème · ×3',  x:ZW+CW*8, w:CW*4},
          ].map(({k,label,x,w}) => (
            <OutsideCell key={k} k={k} label={label} x={x} y={OUTSIDE_Y} w={w} h={DOZ_H}
              hasBet={!!bets[k]} betAmount={bets[k]} isHovered={H(k)}
              onClick={()=>handle(k)} onEnter={()=>setHovered(k)} onLeave={()=>setHovered(null)}/>
          ))}

          {/* ── 2:1 column buttons ── */}
          {[
            {k:'col1', y:0},
            {k:'col2', y:CH},
            {k:'col3', y:CH*2},
          ].map(({k,y}) => (
            <OutsideCell key={k} k={k} label="2:1" x={ZW+COLS*CW+8} y={y} w={54} h={CH}
              hasBet={!!bets[k]} betAmount={bets[k]} isHovered={H(k)}
              onClick={()=>handle(k)} onEnter={()=>setHovered(k)} onLeave={()=>setHovered(null)}/>
          ))}

          {/* ── Outside bets ── */}
          {[
            {k:'1-18',  label:'1–18'},
            {k:'even',  label:'PAIR'},
            {k:'red',   label:'ROUGE', customFill:'#8b0000', customHover:'#c41e3a'},
            {k:'black', label:'NOIR',   customFill:'#0a0a0a', customHover:'#1a1a1a'},
            {k:'odd',   label:'IMPAIR'},
            {k:'19-36', label:'19–36'},
          ].map(({k,label}, idx) => (
            <OutsideCell key={k} k={k} label={label} x={ZW+idx*CW*2} y={OUTSIDE_Y2} w={CW*2} h={OUT_H}
              hasBet={!!bets[k]} betAmount={bets[k]} isHovered={H(k)}
              onClick={()=>handle(k)} onEnter={()=>setHovered(k)} onLeave={()=>setHovered(null)}
              customFill={label.includes('ROUGE') || label.includes('NOIR') ? (label.includes('ROUGE') ? '#8b0000' : '#0a0a0a') : undefined}
              customHover={label.includes('ROUGE') || label.includes('NOIR') ? (label.includes('ROUGE') ? '#c41e3a' : '#1a1a1a') : undefined}/>
          ))}
        </svg>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 gap-y-2 text-xs text-[#94a3b8]/70 px-2 font-orbitron">
          <span>Plein <span className="text-amber-400/80">×36</span></span>
          <span>•</span>
          <span>Split <span className="text-amber-400/80">×18</span></span>
          <span>•</span>
          <span>Cheval <span className="text-amber-400/80">×18</span></span>
          <span>•</span>
          <span>Rue <span className="text-amber-400/80">×12</span></span>
          <span>•</span>
          <span>Carré <span className="text-amber-400/80">×9</span></span>
          <span>•</span>
          <span>Sixain <span className="text-amber-400/80">×6</span></span>
        </div>
      </div>
    </div>
  );
}