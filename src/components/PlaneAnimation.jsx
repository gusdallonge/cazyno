export default function PlaneAnimation({ multiplier, maxMultiplier = 10 }) {
  const percentage = (multiplier / maxMultiplier) * 100;
  const planeHeight = (percentage / 100) * 280;

  return (
    <div className="flex gap-6 items-end justify-center h-80">
      {/* Échelle gauche */}
      <div className="flex flex-col justify-between h-full text-xs font-orbitron font-bold text-[#94a3b8]">
        <div>10x</div>
        <div>8x</div>
        <div>6x</div>
        <div>4x</div>
        <div>2x</div>
        <div>1x</div>
      </div>

      {/* Avion qui monte */}
      <div className="relative w-32 h-80 border-2 border-[#1a2a38] rounded-2xl overflow-hidden bg-[#111a25]/30">
        {/* Avion */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-75 text-4xl filter drop-shadow-lg"
          style={{ bottom: `${planeHeight}px` }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
        </div>

        {/* Marqueurs d'altitude */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full h-px bg-border/40" />
          ))}
        </div>
      </div>

      {/* Multiplicateur */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-orbitron font-black text-4xl text-primary">
          {multiplier.toFixed(2)}x
        </p>
      </div>
    </div>
  );
}