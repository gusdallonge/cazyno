import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bomb, Rocket, Sparkles } from 'lucide-react';

const GAME_ICONS = { bomb: Bomb, rocket: Rocket, sparkles: Sparkles };

export default function BonusCarousel() {
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      type: 'bonus',
      title: 'Bienvenue',
      subtitle: 'Jusqu\'à 17 500 € de bonus',
      bonuses: [
        { level: 1, amount: '10 000 €', percent: '100%', wager: '×30' },
        { level: 2, amount: '5 000 €', percent: '200%', wager: '×35' },
        { level: 3, amount: '2 500 €', percent: '300%', wager: '×37' },
      ],
    },
    {
      type: 'games',
      title: 'Jeux Exceptionnels',
      subtitle: 'Nouveaux jeux à découvrir',
      games: [
        { icon: 'bomb', name: 'Pulse Bomb', desc: 'Tension extrême' },
        { icon: 'rocket', name: 'Crash Game', desc: 'Avant le crash' },
        { icon: 'sparkles', name: 'Et plus...', desc: 'Toutes les sensations' },
      ],
    }
  ];

  const slide = slides[current];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full space-y-4">
      <div className="relative overflow-hidden">
        {/* Main carousel */}
        <div className={`relative rounded-2xl border overflow-hidden transition-all duration-500 ${
          slide.type === 'bonus' 
            ? 'bg-gradient-to-br from-primary/20 via-card to-surface border-primary/30' 
            : 'bg-gradient-to-br from-yellow-500/20 via-card to-surface border-yellow-500/30'
        }`}>
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 p-6 sm:p-8 min-h-[320px] flex flex-col justify-between">
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <h2 className="font-orbitron text-3xl sm:text-4xl font-black text-primary">
                {slide.title}
              </h2>
              <p className="text-sm text-[#94a3b8]">{slide.subtitle}</p>
            </div>

            {/* Content */}
            {slide.type === 'bonus' && (
              <div className="flex items-end justify-between gap-4">
                {/* Left chips decoration */}
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 flex items-center justify-center font-orbitron font-black text-xl sm:text-2xl ${
                        i === 1
                          ? 'bg-gradient-to-br from-primary to-primary/80 border-primary text-primary-foreground'
                          : i === 2
                          ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 border-yellow-400 text-yellow-950'
                          : 'bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white'
                      }`}
                      style={{
                        boxShadow: `0 8px 16px ${i === 1 ? 'rgba(34,197,94,0.4)' : i === 2 ? 'rgba(234,179,8,0.4)' : 'rgba(239,68,68,0.4)'}`,
                      }}
                    >
                      {i}
                    </div>
                  ))}
                </div>

                {/* Center content */}
                <div className="flex-1 space-y-3">
                  {slide.bonuses.map((b, i) => (
                    <div
                      key={i}
                      className="bg-black/30 backdrop-blur-sm border border-primary/40 rounded-xl p-3 sm:p-4 text-center hover:bg-black/40 transition-all"
                    >
                      <p className="text-xs sm:text-sm font-orbitron font-bold text-primary mb-1">
                        Bonus {b.level}
                      </p>
                      <p className="text-lg sm:text-2xl font-orbitron font-black text-primary">
                        {b.percent}
                      </p>
                      <p className="text-xs text-[#94a3b8] mt-0.5">
                        Jusqu'à {b.amount}
                      </p>
                      <p className="text-[10px] text-[#94a3b8]/70">
                        Mise: {b.wager}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Right button */}
                <div className="flex flex-col items-center gap-2">
                  <a
                    href="/TopUpPayment"
                    className="px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-primary text-primary-foreground font-orbitron font-bold text-xs sm:text-sm hover:brightness-110 transition-all active:scale-95 whitespace-nowrap"
                    style={{
                      boxShadow: '0 0 20px hsl(var(--green) / 0.4)',
                    }}
                  >
                    Déposer
                  </a>
                </div>
              </div>
            )}

            {slide.type === 'games' && (
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {slide.games.map((g, i) => (
                  <div
                    key={i}
                    className="bg-black/30 backdrop-blur-sm border border-yellow-500/40 rounded-xl p-4 sm:p-5 text-center hover:border-yellow-500/60 transition-all"
                  >
                    <div className="flex justify-center mb-2">{(() => { const Ic = GAME_ICONS[g.icon] || Sparkles; return <Ic className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />; })()}</div>
                    <p className="text-sm sm:text-base font-orbitron font-bold text-primary mb-1">
                      {g.name}
                    </p>
                    <p className="text-xs sm:text-sm text-[#94a3b8]">
                      {g.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/40 border border-primary/50 flex items-center justify-center transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-primary" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/40 border border-primary/50 flex items-center justify-center transition-all"
        >
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all ${
              i === current
                ? 'bg-primary w-8 h-2.5'
                : 'bg-border w-2.5 h-2.5 hover:bg-primary/50'
            } rounded-full`}
          />
        ))}
      </div>
    </div>
  );
}