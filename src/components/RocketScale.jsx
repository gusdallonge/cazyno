export default function RocketScale({ multiplier, maxMultiplier = 10 }) {
  const percentage = (multiplier / maxMultiplier) * 100;

  return (
    <div className="flex gap-4 items-end justify-center h-64 sm:h-80">
      {/* Échelle gauche */}
      <div className="flex flex-col justify-between h-full text-xs font-orbitron font-bold text-[#94a3b8]">
        <div>10x</div>
        <div>8x</div>
        <div>6x</div>
        <div>4x</div>
        <div>2x</div>
        <div>1x</div>
      </div>

      {/* Fusée + barre de progression */}
      <div className="relative flex flex-col gap-2 items-center">
        {/* Barre de progression verticale */}
        <div className="w-20 sm:w-28 bg-[#111a25] border-2 border-[#1a2a38] rounded-full overflow-hidden flex-1 relative flex flex-col-reverse">
          {/* Remplissage progressif */}
          <div
            className="w-full bg-gradient-to-t from-primary/80 to-primary/40 rounded-full transition-all duration-100"
            style={{ height: `${Math.min(percentage, 100)}%` }}
          />

          {/* Marqueurs */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[1, 2, 4, 6, 8, 10].map((val) => (
              <div key={val} className="w-full h-px bg-border/50" />
            ))}
          </div>

          {/* Fusée positionnée */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 transition-all duration-100 text-4xl sm:text-5xl filter drop-shadow-lg"
            style={{ bottom: `${Math.min(percentage, 100)}%` }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-primary"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
          </div>
        </div>

        {/* Multiplicateur actuel */}
        <div className="text-center">
          <p className="font-orbitron font-black text-3xl sm:text-4xl text-primary">
            {multiplier.toFixed(2)}x
          </p>
        </div>
      </div>

      {/* Espace à droite pour équilibre */}
      <div className="w-12" />
    </div>
  );
}