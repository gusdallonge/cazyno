/* ═══════════════════════════════════════
   Casino SVG Icons — animated, no emojis
   ═══════════════════════════════════════ */

// Playing Card (Spade Ace)
export function CardIcon({ size=48, color='#22c55e', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <rect x="4" y="2" width="40" height="44" rx="6" fill={`${color}10`} stroke={color} strokeWidth="1.5" opacity="0.8"/>
      <rect x="8" y="6" width="32" height="36" rx="4" fill={`${color}08`}/>
      <path d="M24 14 C24 14 18 20 18 24 C18 27 20.5 29 24 29 C27.5 29 30 27 30 24 C30 20 24 14 24 14Z" fill={color} opacity="0.9"/>
      <path d="M24 27 L24 34" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 32 C20 32 22 30 24 34 C26 30 28 32 28 32" fill={color} opacity="0.7"/>
      <text x="10" y="16" fill={color} fontSize="10" fontWeight="bold" fontFamily="monospace">A</text>
    </svg>
  );
}

// Roulette Wheel
export function RouletteIcon({ size=48, color='#ef4444', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill={`${color}08`} stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <circle cx="24" cy="24" r="14" fill="none" stroke={color} strokeWidth="1" opacity="0.4" strokeDasharray="4 3"/>
      <circle cx="24" cy="24" r="6" fill={`${color}20`} stroke={color} strokeWidth="1"/>
      <circle cx="24" cy="24" r="2" fill={color}/>
      {[0,45,90,135,180,225,270,315].map((a,i)=>(
        <line key={i} x1="24" y1="24" x2={24+Math.cos(a*Math.PI/180)*20} y2={24+Math.sin(a*Math.PI/180)*20} stroke={color} strokeWidth="0.5" opacity="0.3"/>
      ))}
      <circle cx="24" cy="6" r="2.5" fill={color} opacity="0.8">
        <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="8s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

// Dice
export function DiceIcon({ size=48, color='#10b981', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <rect x="6" y="6" width="36" height="36" rx="8" fill={`${color}10`} stroke={color} strokeWidth="1.5" opacity="0.8"/>
      {/* Face dots — showing 5 */}
      <circle cx="16" cy="16" r="3" fill={color} opacity="0.9"/>
      <circle cx="32" cy="16" r="3" fill={color} opacity="0.9"/>
      <circle cx="24" cy="24" r="3" fill={color} opacity="0.9"/>
      <circle cx="16" cy="32" r="3" fill={color} opacity="0.9"/>
      <circle cx="32" cy="32" r="3" fill={color} opacity="0.9"/>
    </svg>
  );
}

// Crash/Rocket
export function RocketIcon({ size=48, color='#3b82f6', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 4 C24 4 36 14 36 28 C36 36 30 42 24 44 C18 42 12 36 12 28 C12 14 24 4 24 4Z" fill={`${color}12`} stroke={color} strokeWidth="1.5" opacity="0.8"/>
      <circle cx="24" cy="22" r="5" fill={`${color}25`} stroke={color} strokeWidth="1"/>
      <circle cx="24" cy="22" r="2" fill={color} opacity="0.8"/>
      {/* Fins */}
      <path d="M12 28 L6 36 L14 32" fill={color} opacity="0.4"/>
      <path d="M36 28 L42 36 L34 32" fill={color} opacity="0.4"/>
      {/* Flame */}
      <path d="M20 42 Q24 50 28 42 Q26 46 24 48 Q22 46 20 42Z" fill="#f97316" opacity="0.7">
        <animate attributeName="opacity" values="0.5;0.9;0.5" dur="0.8s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

// Plinko / Triangle grid
export function PlinkoIcon({ size=48, color='#a855f7', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 4 L42 40 L6 40 Z" fill={`${color}08`} stroke={color} strokeWidth="1.5" opacity="0.6"/>
      {/* Pegs */}
      {[[24,14],[18,22],[30,22],[12,30],[24,30],[36,30],[8,38],[18,38],[28,38],[38,38]].map(([cx,cy],i)=>(
        <circle key={i} cx={cx} cy={cy} r="2" fill={color} opacity="0.6"/>
      ))}
      {/* Ball */}
      <circle cx="24" cy="10" r="3" fill={color}>
        <animate attributeName="cy" values="10;38" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="cx" values="24;18;28;20;30" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;1;0" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

// Bomb
export function BombIcon({ size=48, color='#f97316', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="28" r="16" fill={`${color}12`} stroke={color} strokeWidth="1.5" opacity="0.8"/>
      <path d="M28 14 Q32 6 36 8" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      {/* Spark */}
      <circle cx="36" cy="7" r="3" fill={color} opacity="0.8">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="0.6s" repeatCount="indefinite"/>
        <animate attributeName="r" values="2;4;2" dur="0.6s" repeatCount="indefinite"/>
      </circle>
      {/* Highlight */}
      <circle cx="19" cy="23" r="3" fill={color} opacity="0.15"/>
    </svg>
  );
}

// Target / Crosshair
export function TargetIcon({ size=48, color='#eab308', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="18" fill="none" stroke={color} strokeWidth="1.5" opacity="0.4"/>
      <circle cx="24" cy="24" r="12" fill="none" stroke={color} strokeWidth="1" opacity="0.3"/>
      <circle cx="24" cy="24" r="6" fill={`${color}15`} stroke={color} strokeWidth="1.5"/>
      <circle cx="24" cy="24" r="2" fill={color}/>
      <line x1="24" y1="2" x2="24" y2="14" stroke={color} strokeWidth="1" opacity="0.5"/>
      <line x1="24" y1="34" x2="24" y2="46" stroke={color} strokeWidth="1" opacity="0.5"/>
      <line x1="2" y1="24" x2="14" y2="24" stroke={color} strokeWidth="1" opacity="0.5"/>
      <line x1="34" y1="24" x2="46" y2="24" stroke={color} strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

// Casino Chip
export function ChipIcon({ size=48, color='#00e701', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="20" fill={`${color}10`} stroke={color} strokeWidth="2" opacity="0.7"/>
      <circle cx="24" cy="24" r="14" fill="none" stroke={color} strokeWidth="1" opacity="0.4" strokeDasharray="6 4"/>
      <circle cx="24" cy="24" r="8" fill={`${color}15`} stroke={color} strokeWidth="1.5"/>
      <text x="24" y="28" fill={color} fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">C</text>
    </svg>
  );
}

// Trophy
export function TrophyIcon({ size=48, color='#fbbf24', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M14 8 L34 8 L32 24 C32 30 28 34 24 34 C20 34 16 30 16 24 Z" fill={`${color}12`} stroke={color} strokeWidth="1.5"/>
      <path d="M14 8 L14 16 C8 16 6 12 8 8 Z" fill={`${color}08`} stroke={color} strokeWidth="1" opacity="0.6"/>
      <path d="M34 8 L34 16 C40 16 42 12 40 8 Z" fill={`${color}08`} stroke={color} strokeWidth="1" opacity="0.6"/>
      <rect x="20" y="34" width="8" height="4" rx="1" fill={color} opacity="0.5"/>
      <rect x="16" y="38" width="16" height="4" rx="2" fill={`${color}20`} stroke={color} strokeWidth="1"/>
      {/* Star */}
      <path d="M24 14 L25.5 18 L30 18 L26.5 21 L28 25 L24 22 L20 25 L21.5 21 L18 18 L22.5 18 Z" fill={color} opacity="0.7"/>
    </svg>
  );
}

// Shield / Security
export function ShieldIcon({ size=48, color='#22c55e', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <path d="M24 4 L40 12 L40 24 C40 34 32 42 24 46 C16 42 8 34 8 24 L8 12 Z" fill={`${color}08`} stroke={color} strokeWidth="1.5" opacity="0.8"/>
      <path d="M20 24 L23 28 L30 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Sport ball
export function SportIcon({ size=48, color='#8b5cf6', className='' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      <circle cx="24" cy="24" r="18" fill={`${color}10`} stroke={color} strokeWidth="1.5" opacity="0.7"/>
      <path d="M8 18 Q24 24 40 18" fill="none" stroke={color} strokeWidth="1" opacity="0.4"/>
      <path d="M8 30 Q24 24 40 30" fill="none" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="24" y1="6" x2="24" y2="42" stroke={color} strokeWidth="1" opacity="0.3"/>
      {/* Pentagon shapes */}
      <path d="M24 12 L30 18 L28 26 L20 26 L18 18 Z" fill={`${color}15`} stroke={color} strokeWidth="0.8" opacity="0.5"/>
    </svg>
  );
}

// Hero composition — animated casino scene
export function HeroVisual({ className='' }) {
  return (
    <div className={`relative ${className}`} style={{width:'100%',height:'100%',minHeight:200}}>
      {/* Floating card */}
      <div className="absolute top-[10%] left-[15%]" style={{animation:'floatSlow 6s ease-in-out infinite'}}>
        <CardIcon size={70} color="#22c55e"/>
      </div>
      {/* Roulette */}
      <div className="absolute top-[20%] right-[10%]" style={{animation:'floatSlow 7s ease-in-out infinite',animationDelay:'-2s'}}>
        <RouletteIcon size={80} color="#ef4444"/>
      </div>
      {/* Dice */}
      <div className="absolute bottom-[15%] left-[25%]" style={{animation:'floatSlow 5s ease-in-out infinite',animationDelay:'-1s'}}>
        <DiceIcon size={55} color="#10b981"/>
      </div>
      {/* Chip */}
      <div className="absolute top-[50%] right-[30%]" style={{animation:'floatSlow 8s ease-in-out infinite',animationDelay:'-3s'}}>
        <ChipIcon size={50} color="#00e701"/>
      </div>
      {/* Rocket small */}
      <div className="absolute bottom-[30%] right-[15%]" style={{animation:'floatSlow 6s ease-in-out infinite',animationDelay:'-4s'}}>
        <RocketIcon size={45} color="#3b82f6"/>
      </div>
      {/* Glow orbs */}
      <div className="absolute top-[30%] left-[50%] w-32 h-32 rounded-full opacity-[0.06]" style={{background:'radial-gradient(circle,#00e701,transparent 70%)',animation:'pulseSlow 4s ease-in-out infinite'}}/>
      <div className="absolute bottom-[20%] right-[20%] w-24 h-24 rounded-full opacity-[0.04]" style={{background:'radial-gradient(circle,#8b5cf6,transparent 70%)',animation:'pulseSlow 5s ease-in-out infinite',animationDelay:'-2s'}}/>
    </div>
  );
}
