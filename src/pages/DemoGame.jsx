import { useState, useCallback } from 'react';
import { useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';
import { X, Zap, Play } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const MAX_FREE_PLAYS = 5;
const DEMO_CREDITS = 10000;

export default function DemoGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // If logged in, redirect to real game
  if (isAuthenticated) {
    const slug = location.pathname.replace('/demo/', '');
    return <Navigate to={`/dashboard/casino/${slug}`} replace />;
  }
  const [credits, setCreditsRaw] = useState(DEMO_CREDITS);
  const [plays, setPlays] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  const setCredits = useCallback((fn) => {
    setCreditsRaw(prev => {
      const next = typeof fn === 'function' ? fn(prev) : fn;
      return parseFloat(next.toFixed(2));
    });
  }, []);

  const addXp = useCallback(() => {
    setPlays(prev => {
      const next = prev + 1;
      if (next >= MAX_FREE_PLAYS) {
        setTimeout(() => setShowPopup(true), 1500);
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#080c12] relative">
      {/* Demo top bar */}
      <div className="sticky top-0 z-50 h-12 bg-[#161b22]/95 backdrop-blur-md border-b border-[#00e701]/20 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00e701]" />
            <span className="font-orbitron font-bold text-xs text-[#00e701]">CAZYNO</span>
          </button>
          <div className="h-5 w-px bg-[#30363D]" />
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-[#00e701]/10 text-[#00e701] border border-[#00e701]/20">
            DEMO
          </span>
          <span className="text-[11px] text-[#8B949E] hidden sm:block capitalize">{game}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(0,255,102,0.06)', border: '1px solid rgba(0,255,102,0.15)' }}>
            <span className="font-mono text-sm font-bold text-[#00e701]">
              {credits.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
            </span>
          </div>
          <span className="text-[11px] text-[#8B949E] hidden sm:block">
            {Math.max(0, MAX_FREE_PLAYS - plays)} tours gratuits
          </span>
          <button onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-[11px] transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #00e701, #00cc55)', color: '#000' }}>
            S'inscrire
          </button>
        </div>
      </div>

      {/* Game renders via Outlet — this provides useOutletContext */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <Outlet context={{
          credits, setCredits, xp: 0, addXp,
          rakeback: 0, claimRakeback: () => 0,
          transactions: [], addTransaction: () => {},
          totalWagered: 0, totalWon: 0, gamesPlayed: 0,
        }} />
      </div>

      {/* Login popup after MAX_FREE_PLAYS */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm fade-in" onClick={() => setShowPopup(false)}>
          <div className="relative max-w-md w-full mx-4 rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #161b22, #080c12)', border: '1px solid #30363D' }}
            onClick={e => e.stopPropagation()}>

            <button onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-[#8B949E] hover:text-white transition-colors z-10">
              <X className="w-5 h-5" />
            </button>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-20 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #00e701, transparent 70%)' }} />

            <div className="relative p-8 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#00e701]/10 border border-[#00e701]/25 flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-[#00e701]" />
              </div>

              <div>
                <h2 className="font-orbitron font-black text-xl text-white mb-2">
                  Tu kiffes ? Continue !
                </h2>
                <p className="text-[14px] text-[#8B949E] leading-relaxed">
                  Inscris-toi pour jouer en illimité avec <span className="text-[#00e701] font-bold">1000€ offerts</span> et <span className="text-[#FFD700] font-bold">50% de rakeback</span> pendant 7 jours.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: 'rgba(0,255,102,0.05)', border: '1px solid rgba(0,255,102,0.12)' }}>
                  <p className="text-[10px] text-[#8B949E] uppercase tracking-wider">Solde demo</p>
                  <p className="font-mono font-bold text-lg text-[#00e701]">{credits.toLocaleString('fr-FR')}€</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.12)' }}>
                  <p className="text-[10px] text-[#8B949E] uppercase tracking-wider">Tours joués</p>
                  <p className="font-mono font-bold text-lg text-[#FFD700]">{plays}</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <button onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-orbitron font-black text-sm transition-all hover:brightness-110 active:scale-[0.97]"
                  style={{ background: 'linear-gradient(135deg, #00e701, #00cc55)', color: '#000', boxShadow: '0 4px 32px rgba(0,255,102,0.3)' }}>
                  <Play className="w-4 h-4" fill="black" />
                  Créer mon compte gratuitement
                </button>
                <button onClick={() => setShowPopup(false)}
                  className="w-full py-2.5 rounded-xl text-[13px] text-[#8B949E] hover:text-white transition-colors">
                  Continuer à regarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
