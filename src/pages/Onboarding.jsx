import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { Gamepad2, Table2, Rocket, Trophy, Sparkles, Wallet, CreditCard, Play, ChevronRight, X } from 'lucide-react';

const STEPS = [
  {
    title: 'Quel type de joueur es-tu ?',
    key: 'player_type',
    options: [
      { id: 'slots', label: 'Slots', desc: 'Machines a sous et jackpots', icon: Sparkles, color: '#a855f7' },
      { id: 'table', label: 'Jeux de table', desc: 'Blackjack, Roulette, Poker', icon: Table2, color: '#FFD700' },
      { id: 'crash', label: 'Crash & Originaux', desc: 'Crash, Dice, Plinko, Mines', icon: Rocket, color: '#00e701' },
      { id: 'sport', label: 'Sport', desc: 'Paris sportifs et e-sport', icon: Trophy, color: '#3b82f6' },
      { id: 'all', label: 'Tout', desc: 'Je veux tout explorer', icon: Gamepad2, color: '#ef4444' },
    ],
  },
  {
    title: 'Ton budget par session ?',
    key: 'budget',
    options: [
      { id: 'fun', label: 'Fun', desc: '$10 -- $50 par session', icon: Play, color: '#22c55e' },
      { id: 'regular', label: 'Regular', desc: '$50 -- $200 par session', icon: Gamepad2, color: '#3b82f6' },
      { id: 'highroller', label: 'High Roller', desc: '$200+ par session', icon: Sparkles, color: '#FFD700' },
    ],
  },
  {
    title: 'Comment tu veux deposer ?',
    key: 'deposit_method',
    options: [
      { id: 'crypto', label: "J'ai deja du crypto", desc: 'Deposer via portefeuille crypto', icon: Wallet, color: '#f59e0b' },
      { id: 'card', label: 'Carte bancaire', desc: 'Acheter du crypto via MoonPay', icon: CreditCard, color: '#3b82f6' },
      { id: 'demo', label: "Je veux d'abord essayer", desc: 'Mode demo sans depot', icon: Play, color: '#22c55e' },
    ],
  },
];

export default function Onboarding() {
  useOutletContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState({});

  const currentStep = STEPS[step];
  const selected = selections[currentStep.key];

  const handleSelect = (id) => {
    const next = { ...selections, [currentStep.key]: id };
    setSelections(next);

    if (step < STEPS.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      localStorage.setItem('cazyno_onboarding', JSON.stringify(next));
      navigate('/dashboard');
    }
  };

  const skip = () => {
    localStorage.setItem('cazyno_onboarding', JSON.stringify({ skipped: true }));
    navigate('/dashboard');
  };

  return (
    <div className="w-full fade-up flex flex-col items-center justify-center min-h-[70vh]">
      {/* Skip */}
      <button onClick={skip}
        className="absolute top-6 right-6 text-xs font-bold flex items-center gap-1 transition-colors"
        style={{color:'#94a3b8'}}>
        Passer <X className="w-3 h-3" />
      </button>

      {/* Progress */}
      <div className="w-full max-w-xs mb-10">
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:'#111a25'}}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: i < step ? '100%' : i === step ? '50%' : '0%', background: i <= step ? '#00e701' : 'transparent' }} />
            </div>
          ))}
        </div>
        <p className="text-center text-xs mt-2" style={{color:'#94a3b8'}}>Etape {step + 1} sur {STEPS.length}</p>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <h1 className="font-orbitron text-2xl font-black text-white">{currentStep.title}</h1>
      </div>

      {/* Options */}
      <div className="w-full max-w-xl space-y-3">
        {currentStep.options.map(opt => {
          const Icon = opt.icon;
          const isSelected = selected === opt.id;
          return (
            <button key={opt.id} onClick={() => handleSelect(opt.id)}
              className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all"
              style={isSelected
                ? { background:'rgba(0,231,1,0.08)', border:'1px solid rgba(0,231,1,0.4)' }
                : { background:'#111a25', border:'1px solid #1a2a38' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${opt.color}15`, border: `1px solid ${opt.color}30` }}>
                <Icon className="w-6 h-6" style={{ color: opt.color }} />
              </div>
              <div className="flex-1">
                <p className="font-orbitron text-sm font-bold text-white">{opt.label}</p>
                <p className="text-xs" style={{color:'#94a3b8'}}>{opt.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5" style={{color:'#94a3b8'}} />
            </button>
          );
        })}
      </div>

      {/* Back */}
      {step > 0 && (
        <button onClick={() => setStep(step - 1)}
          className="mt-6 text-sm transition-colors"
          style={{color:'#94a3b8'}}>
          Retour
        </button>
      )}
    </div>
  );
}
