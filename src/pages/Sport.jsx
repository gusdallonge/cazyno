import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Trophy, Clock, X, TrendingUp, Radio, ChevronDown, ChevronUp, CircleDot, Dribbble, Circle, Timer, Swords, Car, Shield, Gamepad2, Flag, Disc, SquareStack, ClipboardList } from 'lucide-react';
import { useLang, t } from '../lib/i18n';
import { saveRound } from '../lib/saveRound';

function fmt(n) { return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 2 }); }

const CATEGORIES = [
  { id: 'live',    label: 'En Direct',  IconComp: Radio },
  { id: 'foot',    label: 'Football',   IconComp: CircleDot },
  { id: 'basket',  label: 'Basketball', IconComp: Dribbble },
  { id: 'tennis',  label: 'Tennis',     IconComp: Circle },
  { id: 'boxe',    label: 'Boxe / MMA', IconComp: Swords },
  { id: 'f1',      label: 'Formule 1',  IconComp: Car },
  { id: 'rugby',   label: 'Rugby',      IconComp: Shield },
  { id: 'esport',  label: 'eSport',     IconComp: Gamepad2 },
  { id: 'golf',    label: 'Golf',       IconComp: Flag },
  { id: 'hockey',  label: 'Hockey',     IconComp: Disc },
  { id: 'cricket', label: 'Cricket',    IconComp: SquareStack },
  { id: 'mybets',  label: 'Mes Paris',  IconComp: ClipboardList },
];

const MATCHES = {
  live: [
    { id: 9001, live: true, score: '1 - 0', minute: "67'", league: 'Ligue 1', home: 'PSG', away: 'Lyon', time: 'LIVE', odds: { home: 1.45, draw: 4.20, away: 6.50 }, props: [{ id:'p1', label:'Plus de 2.5 buts', odds:1.70 },{ id:'p2', label:'Moins de 2.5 buts', odds:2.10 },{ id:'p3', label:'PSG marque encore', odds:1.55 },{ id:'p4', label:'Lyon egalise', odds:3.20 }] },
    { id: 9002, live: true, score: '78 - 72', minute: "Q3 4'", league: 'NBA', home: 'Lakers', away: 'Celtics', time: 'LIVE', odds: { home: 1.85, away: 2.05 }, props: [{ id:'p1', label:'LeBron finit > 30 pts', odds:2.20 },{ id:'p2', label:'Prolongation', odds:5.50 },{ id:'p3', label:'Total > 215 pts', odds:1.80 }] },
    { id: 9003, live: true, score: '0 - 0', minute: "28'", league: 'Premier League', home: 'Man City', away: 'Arsenal', time: 'LIVE', odds: { home: 1.95, draw: 3.30, away: 3.80 }, props: [{ id:'p1', label:'Haaland buteur', odds:2.10 },{ id:'p2', label:'Saka buteur', odds:3.50 },{ id:'p3', label:'Plus de 3 buts', odds:2.90 }] },
    { id: 9004, live: true, score: '1 - 1', minute: "54'", league: 'La Liga', home: 'Real Madrid', away: 'Barcelona', time: 'LIVE', odds: { home: 2.10, draw: 3.10, away: 2.80 }, props: [{ id:'p1', label:'Vinicius buteur', odds:2.60 },{ id:'p2', label:'Yamal buteur', odds:3.00 }] },
    { id: 9005, live: true, score: '6-4 3-5', minute: "Set 3", league: 'Wimbledon', home: 'Alcaraz', away: 'Sinner', time: 'LIVE', odds: { home: 1.80, away: 2.10 }, props: [{ id:'p1', label:'Tie-break en set 3', odds:2.20 },{ id:'p2', label:'Plus de 40 jeux', odds:1.90 }] },
  ],
  foot: [
    { id: 1, league: 'Champions League', home: 'Real Madrid', away: 'Bayern Munich', time: '21:00', date: 'Ce soir', odds: { home: 2.10, draw: 3.40, away: 3.20 }, props: [{ id:'p1', label:'Plus de 2.5 buts', odds:1.75 },{ id:'p2', label:'Vinicius buteur', odds:2.60 },{ id:'p3', label:'Kane buteur', odds:2.40 },{ id:'p4', label:'Les deux equipes marquent', odds:1.65 },{ id:'p5', label:'Victoire 2-1', odds:7.50 }] },
    { id: 2, league: 'Ligue 1', home: 'PSG', away: 'Marseille', time: '20:45', date: 'Ce soir', odds: { home: 1.55, draw: 3.80, away: 5.20 }, props: [{ id:'p1', label:'Plus de 3.5 buts', odds:1.90 },{ id:'p2', label:'Carton rouge', odds:3.80 },{ id:'p3', label:'Corner > 9', odds:1.85 }] },
    { id: 3, league: 'La Liga', home: 'Barcelona', away: 'Atletico', time: '21:00', date: 'Demain', odds: { home: 2.10, draw: 3.20, away: 3.40 }, props: [{ id:'p1', label:'Plus de 2.5 buts', odds:1.80 },{ id:'p2', label:'Yamal buteur', odds:3.10 }] },
    { id: 4, league: 'Premier League', home: 'Liverpool', away: 'Chelsea', time: '17:30', date: 'Samedi', odds: { home: 1.90, draw: 3.50, away: 4.00 }, props: [{ id:'p1', label:'Salah buteur', odds:2.30 },{ id:'p2', label:'Plus de 2.5 buts', odds:1.70 }] },
    { id: 5, league: 'Bundesliga', home: 'Dortmund', away: 'Leipzig', time: '18:30', date: 'Samedi', odds: { home: 2.20, draw: 3.10, away: 3.00 }, props: [{ id:'p1', label:'Plus de 3 buts', odds:1.95 },{ id:'p2', label:'Moins de 2.5 buts', odds:2.05 }] },
    { id: 6, league: 'Serie A', home: 'Inter Milan', away: 'Juventus', time: '20:45', date: 'Dimanche', odds: { home: 2.30, draw: 3.00, away: 2.90 }, props: [{ id:'p1', label:"Derby d'Italie -- Nul", odds:2.95 },{ id:'p2', label:'Moins de 2 buts', odds:2.40 }] },
    { id: 7, league: 'Ligue des Nations', home: 'France', away: 'Espagne', time: '20:45', date: 'Mardi', odds: { home: 1.95, draw: 3.20, away: 3.80 }, props: [{ id:'p1', label:'Mbappe buteur', odds:2.80 },{ id:'p2', label:'Yamal buteur', odds:3.20 },{ id:'p3', label:'Plus de 2.5 buts', odds:1.85 }] },
    { id: 8, league: 'Europa League', home: 'Roma', away: 'Ajax', time: '21:00', date: 'Jeudi', odds: { home: 1.80, draw: 3.50, away: 4.20 }, props: [{ id:'p1', label:'Roma gagne par 2+', odds:2.60 },{ id:'p2', label:'Les deux marquent', odds:1.70 }] },
  ],
  basket: [
    { id: 301, league: 'NBA', home: 'Lakers', away: 'Celtics', time: '02:30', date: 'Ce soir', odds: { home: 2.10, away: 1.85 }, props: [{ id:'p1', label:'LeBron > 28 pts', odds:2.00 },{ id:'p2', label:'Total > 220 pts', odds:1.75 },{ id:'p3', label:'Tatum > 30 pts', odds:2.40 },{ id:'p4', label:'Prolongation', odds:5.50 }] },
    { id: 302, league: 'NBA', home: 'Warriors', away: 'Nets', time: '04:00', date: 'Ce soir', odds: { home: 1.70, away: 2.40 }, props: [{ id:'p1', label:'Curry > 35 pts', odds:2.60 },{ id:'p2', label:'3 pts > 14 au total', odds:1.90 }] },
    { id: 303, league: 'NBA', home: 'Bucks', away: '76ers', time: '01:30', date: 'Demain', odds: { home: 1.65, away: 2.30 }, props: [{ id:'p1', label:'Giannis > 30 pts', odds:1.95 },{ id:'p2', label:'Total < 215 pts', odds:2.10 }] },
    { id: 304, league: 'NBA', home: 'Suns', away: 'Heat', time: '03:00', date: 'Demain', odds: { home: 1.90, away: 2.00 }, props: [{ id:'p1', label:'Durant top scorer', odds:2.20 },{ id:'p2', label:'Total > 225 pts', odds:1.80 }] },
    { id: 305, league: 'Euroleague', home: 'Real Madrid', away: 'Olympiakos', time: '20:30', date: 'Jeudi', odds: { home: 1.65, away: 2.50 }, props: [{ id:'p1', label:'Victoire par 10+', odds:2.10 },{ id:'p2', label:'Total < 155 pts', odds:1.95 }] },
    { id: 306, league: 'Euroleague', home: 'CSKA Moscou', away: 'Barcelona', time: '19:30', date: 'Jeudi', odds: { home: 2.80, away: 1.50 }, props: [{ id:'p1', label:'Barcelona gagne facile', odds:1.45 },{ id:'p2', label:'Total > 160 pts', odds:2.00 }] },
  ],
  tennis: [
    { id: 401, league: 'Roland Garros', home: 'Alcaraz', away: 'Djokovic', time: '14:00', date: 'Demain', odds: { home: 2.20, away: 1.80 }, props: [{ id:'p1', label:'Match en 3 sets', odds:1.85 },{ id:'p2', label:'Match en 5 sets', odds:3.40 },{ id:'p3', label:'Tie-break dans le match', odds:1.90 }] },
    { id: 402, league: 'Wimbledon', home: 'Sinner', away: 'Medvedev', time: '12:00', date: 'Mercredi', odds: { home: 1.75, away: 2.30 }, props: [{ id:'p1', label:'Sinner sans perdre set', odds:2.90 },{ id:'p2', label:'Plus de 38 jeux', odds:1.85 }] },
    { id: 403, league: 'US Open', home: 'Rublev', away: 'Zverev', time: '21:00', date: 'Lundi', odds: { home: 2.10, away: 1.80 }, props: [{ id:'p1', label:'Plus de 40 jeux', odds:1.95 },{ id:'p2', label:'Zverev gagne 1er set', odds:2.10 }] },
    { id: 404, league: 'WTA Miami', home: 'Swiatek', away: 'Gauff', time: '20:00', date: 'Lundi', odds: { home: 1.55, away: 2.60 }, props: [{ id:'p1', label:'Swiatek en 2 sets', odds:1.90 },{ id:'p2', label:'Plus de 20 jeux', odds:2.20 }] },
  ],
  boxe: [
    { id: 101, league: 'WBC Heavyweight', home: 'Tyson Fury', away: 'Anthony Joshua', time: '22:00', date: 'Samedi', odds: { home: 1.70, away: 2.20 }, props: [{ id:'p1', label:'KO avant round 8', odds:2.80 },{ id:'p2', label:'Aller aux 12 rounds', odds:2.10 },{ id:'p3', label:'Fury gagne par KO', odds:2.50 }] },
    { id: 102, league: 'IBF Super Welter', home: 'Canelo Alvarez', away: 'Charlo', time: '23:00', date: 'Samedi', odds: { home: 1.40, away: 3.00 }, props: [{ id:'p1', label:'Canelo gagne par KO', odds:2.20 },{ id:'p2', label:'Plus de 9 rounds', odds:1.95 }] },
    { id: 103, league: 'UFC 305', home: 'Jon Jones', away: 'Stipe Miocic', time: '05:00', date: 'Dimanche', odds: { home: 1.55, away: 2.50 }, props: [{ id:'p1', label:'Jones par soumission', odds:3.20 },{ id:'p2', label:'Fin avant round 3', odds:2.40 },{ id:'p3', label:'5 rounds complets', odds:2.80 }] },
    { id: 104, league: 'UFC Fight Night', home: 'Adesanya', away: 'Du Plessis', time: '23:00', date: 'Samedi', odds: { home: 1.90, away: 2.00 }, props: [{ id:'p1', label:'KO/TKO', odds:1.80 },{ id:'p2', label:'Decision unanime', odds:2.60 }] },
  ],
  f1: [
    { id: 201, league: 'Grand Prix de Monaco', home: 'Verstappen', away: 'Leclerc', time: '15:00', date: 'Dimanche', odds: { home: 1.90, away: 2.80 }, props: [{ id:'p1', label:'Safety Car', odds:1.55 },{ id:'p2', label:'Leclerc gagne a domicile', odds:2.60 },{ id:'p3', label:'Hamilton podium', odds:3.80 }] },
    { id: 202, league: 'Grand Prix de Silverstone', home: 'Norris', away: 'Hamilton', time: '15:00', date: 'Dimanche', odds: { home: 2.20, away: 2.50 }, props: [{ id:'p1', label:'Norris gagne devant Ham', odds:2.00 },{ id:'p2', label:'Plus de 2 Safety Cars', odds:3.00 }] },
    { id: 203, league: "Grand Prix d'Italie", home: 'Leclerc', away: 'Verstappen', time: '15:00', date: 'Samedi', odds: { home: 2.40, away: 1.75 }, props: [{ id:'p1', label:'Ferrari 1-2', odds:4.50 },{ id:'p2', label:"Abandon d'un top 3", odds:3.40 }] },
    { id: 204, league: 'Grand Prix du Japon', home: 'Verstappen', away: 'Piastri', time: '07:00', date: 'Dimanche', odds: { home: 1.85, away: 2.60 }, props: [{ id:'p1', label:'Meilleur tour en course', odds:2.10 },{ id:'p2', label:'Piastri podium', odds:1.95 }] },
  ],
  rugby: [
    { id: 501, league: 'Top 14', home: 'Toulouse', away: 'Racing 92', time: '20:45', date: 'Vendredi', odds: { home: 1.70, draw: 12.00, away: 2.20 }, props: [{ id:'p1', label:'Plus de 45 pts au total', odds:1.85 },{ id:'p2', label:'Handicap Toulouse -7', odds:1.90 }] },
    { id: 502, league: 'Champions Cup', home: 'La Rochelle', away: 'Leinster', time: '16:00', date: 'Samedi', odds: { home: 2.40, draw: 15.00, away: 1.65 }, props: [{ id:'p1', label:'Leinster gagne par 10+', odds:2.20 },{ id:'p2', label:'Moins de 40 pts', odds:2.00 }] },
    { id: 503, league: 'Test Match', home: 'All Blacks', away: 'Springboks', time: '14:00', date: 'Samedi', odds: { home: 1.80, draw: 18.00, away: 2.10 }, props: [{ id:'p1', label:'Plus de 50 pts au total', odds:2.10 },{ id:'p2', label:'NZ gagne 1ere mi-temps', odds:1.95 }] },
  ],
  esport: [
    { id: 601, league: 'League of Legends -- LCK', home: 'T1', away: 'Gen.G', time: '12:00', date: 'Demain', odds: { home: 1.75, away: 2.20 }, props: [{ id:'p1', label:'T1 gagne 2-0', odds:2.50 },{ id:'p2', label:'Match en 3 parties', odds:2.10 }] },
    { id: 602, league: 'CS2 -- Blast Major', home: 'Natus Vincere', away: 'FaZe Clan', time: '19:00', date: 'Demain', odds: { home: 2.00, away: 1.90 }, props: [{ id:'p1', label:'FaZe gagne 2-0', odds:3.10 },{ id:'p2', label:'Plus de 2 maps', odds:1.65 }] },
    { id: 603, league: 'Valorant -- VCT Masters', home: 'Fnatic', away: 'NRG', time: '17:00', date: 'Mercredi', odds: { home: 2.10, away: 1.80 }, props: [{ id:'p1', label:'Fnatic gagne par 2 maps', odds:2.80 },{ id:'p2', label:'NRG remonte 1-0', odds:2.40 }] },
    { id: 604, league: 'Dota 2 -- The International', home: 'Team Spirit', away: 'Evil Geniuses', time: '13:00', date: 'Samedi', odds: { home: 1.65, away: 2.40 }, props: [{ id:'p1', label:'Spirit gagne 2-0', odds:2.20 },{ id:'p2', label:'Match en 3 games', odds:2.00 }] },
  ],
  golf: [
    { id: 701, league: "Masters d'Augusta", home: 'Rory McIlroy', away: 'Scottie Scheffler', time: '14:00', date: 'Dimanche', odds: { home: 2.50, away: 2.10 }, props: [{ id:'p1', label:'Scheffler en tete apres R3', odds:1.90 },{ id:'p2', label:'Hole-in-one en journee', odds:8.00 }] },
    { id: 702, league: 'The Open Championship', home: 'Jon Rahm', away: 'Viktor Hovland', time: '14:00', date: 'Dimanche', odds: { home: 2.30, away: 2.80 }, props: [{ id:'p1', label:'Rahm gagne < -10', odds:3.00 },{ id:'p2', label:'Playoff necessaire', odds:5.50 }] },
  ],
  hockey: [
    { id: 801, league: 'NHL -- Playoffs', home: 'Colorado Avalanche', away: 'Tampa Bay Lightning', time: '02:00', date: 'Ce soir', odds: { home: 1.85, away: 2.05 }, props: [{ id:'p1', label:'Prolongation', odds:3.20 },{ id:'p2', label:'Plus de 6 buts', odds:1.90 },{ id:'p3', label:'Avalanche gagne par 2+', odds:2.40 }] },
    { id: 802, league: 'NHL -- Playoffs', home: 'Toronto Maple Leafs', away: 'Boston Bruins', time: '00:30', date: 'Ce soir', odds: { home: 2.20, away: 1.80 }, props: [{ id:'p1', label:'Moins de 5.5 buts', odds:1.95 },{ id:'p2', label:'Bruins gagnent', odds:1.80 }] },
  ],
  cricket: [
    { id: 901, league: 'Test Cricket -- Ashes', home: 'England', away: 'Australia', time: '11:00', date: 'Demain', odds: { home: 2.60, draw: 2.80, away: 2.20 }, props: [{ id:'p1', label:'Angleterre gagne le 1er jour', odds:2.30 },{ id:'p2', label:'Australie 1er batteur > 50 runs', odds:2.10 }] },
    { id: 902, league: 'IPL T20', home: 'Mumbai Indians', away: 'Chennai Super Kings', time: '16:30', date: 'Demain', odds: { home: 1.95, away: 2.00 }, props: [{ id:'p1', label:'Total > 350 runs', odds:2.00 },{ id:'p2', label:'Derniere balle decisive', odds:4.00 }] },
  ],
};

function SportIcon({ id, size = 'w-5 h-5' }) {
  const cat = CATEGORIES.find(c => c.id === id);
  const Ic = cat?.IconComp || Trophy;
  return <Ic className={size} />;
}

export default function Sport() {
  const { credits, setCredits, addXp } = useOutletContext();
  const { isAuthenticated, navigateToLogin } = useAuth();
  const lang = useLang();
  const [activeCategory, setActiveCategory] = useState('live');
  const [selections, setSelections] = useState({});
  const [betAmount, setBetAmount] = useState(50);
  const [pendingBets, setPendingBets] = useState([]);
  const [expandedProps, setExpandedProps] = useState({});
  const resolveTimers = useRef({});

  const currentMatches = MATCHES[activeCategory] || [];

  const toggleSelection = (key, label, odds) => {
    setSelections(prev => {
      if (prev[key]) { const n = { ...prev }; delete n[key]; return n; }
      return { ...prev, [key]: { label, odds } };
    });
  };

  const selectionCount = Object.keys(selections).length;
  const totalOdds = Object.values(selections).reduce((acc, s) => acc * s.odds, 1);
  const potentialGain = (betAmount * totalOdds).toFixed(2);

  const placeBet = () => {
    if (selectionCount === 0 || betAmount > credits) return;
    setCredits(c => c - betAmount);
    addXp(betAmount);

    const betId = Date.now();
    const mySelections = { ...selections };
    const myOdds = totalOdds;
    const myGain = parseFloat(potentialGain);
    const myBet = betAmount;

    const newBet = {
      id: betId,
      selections: Object.values(mySelections).map(s => ({ label: s.label, odds: s.odds })),
      amount: myBet,
      odds: myOdds,
      potential: myGain,
      status: 'pending',
      date: new Date().toISOString(),
      resolveAt: new Date(Date.now() + 30000).toISOString(),
    };

    setPendingBets(prev => [newBet, ...prev]);
    setSelections({});

    resolveTimers.current[betId] = setTimeout(() => {
      const win = Math.random() > 0.45;
      const gain = win ? myGain : 0;
      if (win) {
        setCredits(c => c + gain);
        saveRound({ game: 'Sport', bet: myBet, result: `Gagne x${myOdds.toFixed(2)}`, profit: parseFloat((gain - myBet).toFixed(2)) });
      } else {
        saveRound({ game: 'Sport', bet: myBet, result: `Perdu x${myOdds.toFixed(2)}`, profit: -myBet });
      }
      setPendingBets(prev => prev.map(b => b.id === betId ? { ...b, status: win ? 'won' : 'lost', gain } : b));
    }, 30000);
  };

  useEffect(() => () => Object.values(resolveTimers.current).forEach(clearTimeout), []);

  const pendingCount = pendingBets.filter(b => b.status === 'pending').length;

  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-4 fade-up pb-24 lg:pb-0">

      {/* Header block */}
      <div className="rounded-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{borderBottom:'1px solid #1a2a38'}}>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{color:'#00e701'}} />
            <h2 className="font-orbitron font-black text-white text-base">{t(lang, 'sport_title')}</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>{t(lang, 'sport_subtitle')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.filter(c => c.id !== 'mybets').map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-all"
            style={activeCategory === cat.id
              ? { background:'#00e701', color:'#000', border:'1px solid #00e701' }
              : { background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8' }}>
            <cat.IconComp className="w-4 h-4" />
            <span className="hidden sm:inline">{cat.label}</span>
            {cat.id === 'live' && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* My bets + mobile cart */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative lg:hidden">
          {selectionCount > 0 && (
            <>
              {mobileCartOpen && (
                <>
                  <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMobileCartOpen(false)} />
                  <div className="absolute bottom-full mb-2 left-0 w-80 max-w-[90vw] rounded-2xl p-4 space-y-3 z-50 shadow-2xl" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-orbitron font-bold text-sm flex items-center gap-2"><Trophy className="w-4 h-4" style={{color:'#00e701'}} /> Mon pari ({selectionCount})</h3>
                      <button onClick={() => setMobileCartOpen(false)}><X className="w-4 h-4" style={{color:'#94a3b8'}} /></button>
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {Object.entries(selections).map(([key, sel]) => (
                        <div key={key} className="flex items-start justify-between rounded-xl px-3 py-2 gap-2" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white leading-tight">{sel.label}</p>
                            <p className="text-xs font-orbitron font-bold" style={{color:'#00e701'}}>x{sel.odds.toFixed(2)}</p>
                          </div>
                          <button onClick={() => toggleSelection(key, sel.label, sel.odds)} style={{color:'#94a3b8'}}>
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm pt-2" style={{borderTop:'1px solid #1a2a38'}}>
                      <span style={{color:'#94a3b8'}}>Cote totale</span>
                      <span className="font-orbitron font-bold" style={{color:'#00e701'}}>x{totalOdds.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{color:'#94a3b8'}}>Gain potentiel</span>
                      <span className="font-orbitron font-bold" style={{color:'#00e701'}}>{fmt(potentialGain)} EUR</span>
                    </div>
                    <div className="flex gap-1.5">
                      {[10, 25, 50, 100].map(v => (
                        <button key={v} onClick={() => setBetAmount(v)}
                          className="flex-1 py-1.5 rounded-xl text-xs font-orbitron font-bold transition-all"
                          style={betAmount === v ? {background:'#00e701', color:'#000', border:'1px solid #00e701'} : {background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>
                          {v}
                        </button>
                      ))}
                    </div>
                    <input type="number" value={betAmount} min={1}
                      onChange={e => setBetAmount(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full rounded-xl px-3 py-2 font-orbitron font-bold text-base text-center focus:outline-none"
                      style={{background:'#111a25', border:'1px solid #1a2a38', color:'#00e701'}} />
                    {!isAuthenticated ? (
                      <button onClick={navigateToLogin} className="rounded-xl font-bold w-full py-3 font-orbitron text-sm" style={{background:'#00e701', color:'#000'}}>Se connecter</button>
                    ) : (
                      <button onClick={() => { placeBet(); setMobileCartOpen(false); }} disabled={betAmount > credits}
                        className="rounded-xl font-bold w-full py-3 font-orbitron text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{background:'#00e701', color:'#000'}}>
                        <TrendingUp className="w-4 h-4" />
                        Parier {fmt(betAmount)} EUR &rarr; {fmt(potentialGain)} EUR
                      </button>
                    )}
                  </div>
                </>
              )}
              <button onClick={() => setMobileCartOpen(o => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all"
                style={{background:'#00e701', color:'#000', border:'2px solid #00e701'}}>
                {selectionCount} selection{selectionCount > 1 ? 's' : ''}
                <span className="font-orbitron font-bold">x{totalOdds.toFixed(2)}</span>
              </button>
            </>
          )}
        </div>

        <div className="ml-auto">
          <button onClick={() => setActiveCategory('mybets')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all"
            style={activeCategory === 'mybets'
              ? {background:'#00e701', color:'#000', border:'1px solid #00e701'}
              : {background:'#111a25', border:'1px solid rgba(0,231,1,0.4)', color:'#00e701'}}>
            <ClipboardList className="w-4 h-4" />
            Mes Paris
            {pendingCount > 0 && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{background:'#f97316', color:'#000'}}>{pendingCount}</span>
            )}
          </button>
        </div>
      </div>

      {/* My Bets view */}
      {activeCategory === 'mybets' ? (
        <div className="space-y-3">
          {pendingBets.length === 0 && (
            <div className="text-center py-20" style={{color:'#94a3b8'}}>
              <ClipboardList className="w-10 h-10 mx-auto mb-3" style={{color:'#94a3b8'}} />
              <p className="font-semibold">Aucun pari place</p>
              <p className="text-sm mt-1">Tes paris apparaitront ici apres avoir parie.</p>
            </div>
          )}
          {pendingBets.map(bet => {
            const resolveIn = Math.max(0, Math.ceil((new Date(bet.resolveAt) - now) / 1000));
            return (
              <div key={bet.id} className="rounded-2xl p-4"
                style={{
                  background:'#111a25',
                  border: bet.status === 'won' ? '1px solid rgba(0,231,1,0.5)' : bet.status === 'lost' ? '1px solid rgba(239,68,68,0.5)' : '1px solid #1a2a38'
                }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {bet.status === 'pending' && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full animate-pulse" style={{background:'rgba(234,179,8,0.15)', color:'#eab308', border:'1px solid rgba(234,179,8,0.3)'}}>
                          <Timer className="w-3 h-3 inline mr-1" />En cours
                        </span>
                      )}
                      {bet.status === 'won' && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(0,231,1,0.15)', color:'#00e701', border:'1px solid rgba(0,231,1,0.3)'}}>
                          <TrendingUp className="w-3 h-3 inline mr-1" />Gagne
                        </span>
                      )}
                      {bet.status === 'lost' && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(239,68,68,0.15)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.3)'}}>
                          <X className="w-3 h-3 inline mr-1" />Perdu
                        </span>
                      )}
                      <span className="text-xs" style={{color:'#94a3b8'}}>{new Date(bet.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-orbitron font-bold text-sm" style={{color:'#00e701'}}>x{bet.odds.toFixed(2)}</p>
                    {bet.status === 'won' && <p className="text-xs font-bold" style={{color:'#00e701'}}>+{fmt(bet.gain - bet.amount)} EUR</p>}
                    {bet.status === 'lost' && <p className="text-xs font-bold" style={{color:'#ef4444'}}>-{fmt(bet.amount)} EUR</p>}
                  </div>
                </div>
                <div className="space-y-1.5 mb-3">
                  {bet.selections.map((s, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl px-3 py-1.5 text-xs" style={{background:'rgba(17,26,37,0.8)', border:'1px solid #1a2a38'}}>
                      <span className="text-white/80 truncate flex-1 mr-2">{s.label}</span>
                      <span className="font-orbitron font-bold shrink-0" style={{color:'#00e701'}}>x{s.odds.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs pt-2" style={{borderTop:'1px solid #1a2a38'}}>
                  <span style={{color:'#94a3b8'}}>Mise : <span className="font-bold text-white">{fmt(bet.amount)} EUR</span></span>
                  <span style={{color:'#94a3b8'}}>
                    Gain potentiel : <span className="font-bold" style={{color:'#00e701'}}>{fmt(bet.potential)} EUR</span>
                  </span>
                  {bet.status === 'pending' && resolveIn > 0 && (
                    <span className="flex items-center gap-1" style={{color:'#94a3b8'}}>
                      <Clock className="w-3 h-3" /> ~{resolveIn}s
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Matches list */}
          <div className="lg:col-span-2 space-y-3">
            {currentMatches.map(match => {
              const oddsEntries = Object.entries(match.odds).filter(([, v]) => v !== null);
              const showProps = expandedProps[match.id];
              return (
                <div key={match.id} className="rounded-2xl overflow-hidden" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                  <div className="px-4 pt-3 pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      {match.live && (
                        <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{color:'#ef4444', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)'}}>
                          <Radio className="w-3 h-3" /> LIVE {match.minute}
                        </span>
                      )}
                      <span className="text-xs font-semibold" style={{color:'#94a3b8'}}>{match.league}</span>
                      {!match.live && (
                        <div className="ml-auto flex items-center gap-1 text-xs" style={{color:'#94a3b8'}}>
                          <Clock className="w-3 h-3" />{match.date} {match.time}
                        </div>
                      )}
                      {match.live && match.score && (
                        <span className="ml-auto font-orbitron font-black text-sm" style={{color:'#00e701'}}>{match.score}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <p className="flex-1 font-orbitron font-bold text-sm text-white text-center truncate">{match.home}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {oddsEntries.map(([type, odds]) => {
                          const key = `${match.id}-${type}`;
                          const labels = { home: '1', draw: 'N', away: '2' };
                          return (
                            <button key={type} onClick={() => toggleSelection(key, `${match.home} vs ${match.away} - ${labels[type]}`, odds)}
                              className="flex flex-col items-center px-2.5 py-2 rounded-xl transition-all min-w-[52px]"
                              style={selections[key]
                                ? { border:'2px solid #00e701', background:'rgba(0,231,1,0.12)' }
                                : { border:'2px solid #1a2a38', background:'#111a25' }}>
                              <span className="text-[9px] font-semibold" style={{color:'#94a3b8'}}>{labels[type]}</span>
                              <span className="font-orbitron font-bold text-sm" style={{color: selections[key] ? '#00e701' : '#fff'}}>{odds.toFixed(2)}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="flex-1 font-orbitron font-bold text-sm text-white text-center truncate">{match.away}</p>
                    </div>
                  </div>

                  {match.props && (
                    <div style={{borderTop:'1px solid rgba(26,42,56,0.5)'}}>
                      <button onClick={() => setExpandedProps(p => ({ ...p, [match.id]: !p[match.id] }))}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-colors"
                        style={{color:'#94a3b8'}}>
                        <TrendingUp className="w-3 h-3" />
                        {showProps ? 'Masquer les paris speciaux' : `+${match.props.length} paris speciaux`}
                        {showProps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {showProps && (
                        <div className="px-4 pb-4 grid grid-cols-2 gap-1.5">
                          {match.props.map(prop => {
                            const key = `${match.id}-prop-${prop.id}`;
                            return (
                              <button key={prop.id} onClick={() => toggleSelection(key, prop.label, prop.odds)}
                                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                                style={selections[key]
                                  ? { border:'1px solid #00e701', background:'rgba(0,231,1,0.08)' }
                                  : { border:'1px solid #1a2a38', background:'#111a25' }}>
                                <span className="text-xs leading-tight" style={{color:'#94a3b8'}}>{prop.label}</span>
                                <span className="font-orbitron font-bold text-sm shrink-0" style={{color: selections[key] ? '#00e701' : '#fff'}}>{prop.odds.toFixed(2)}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bet slip desktop */}
          <div className="hidden lg:block space-y-4">
            <div className="rounded-2xl p-5 sticky top-24 space-y-4" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" style={{color:'#00e701'}} />
                <h3 className="font-orbitron font-bold text-white text-sm">Mon pari</h3>
                {selectionCount > 0 && <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'#00e701', color:'#000'}}>{selectionCount}</span>}
              </div>

              {selectionCount === 0 ? (
                <p className="text-xs text-center py-6" style={{color:'#94a3b8'}}>Selectionne des matchs pour composer ton pari</p>
              ) : (
                <>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto">
                    {Object.entries(selections).map(([key, sel]) => (
                      <div key={key} className="flex items-start justify-between rounded-xl px-3 py-2 gap-2" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white leading-tight">{sel.label}</p>
                          <p className="text-xs font-orbitron font-bold" style={{color:'#00e701'}}>x{sel.odds.toFixed(2)}</p>
                        </div>
                        <button onClick={() => toggleSelection(key, sel.label, sel.odds)} className="shrink-0 mt-0.5" style={{color:'#94a3b8'}}>
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 space-y-1 text-sm" style={{borderTop:'1px solid #1a2a38'}}>
                    <div className="flex justify-between" style={{color:'#94a3b8'}}>
                      <span>Cote totale</span>
                      <span className="font-orbitron font-bold" style={{color:'#00e701'}}>x{totalOdds.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between" style={{color:'#94a3b8'}}>
                      <span>Gain potentiel</span>
                      <span className="font-orbitron font-bold" style={{color:'#00e701'}}>{fmt(potentialGain)} EUR</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex gap-1.5 flex-wrap">
                      {[10, 25, 50, 100].map(v => (
                        <button key={v} onClick={() => setBetAmount(v)}
                          className="flex-1 py-2 rounded-xl text-xs font-orbitron font-bold transition-all"
                          style={betAmount === v
                            ? {background:'#00e701', color:'#000', border:'1px solid #00e701'}
                            : {background:'#111a25', border:'1px solid #1a2a38', color:'#94a3b8'}}>
                          {v}
                        </button>
                      ))}
                    </div>
                    <input type="number" value={betAmount} min={1}
                      onChange={e => setBetAmount(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full rounded-xl px-4 py-2.5 font-orbitron font-bold text-lg text-center focus:outline-none"
                      style={{background:'#111a25', border:'1px solid #1a2a38', color:'#00e701'}} />
                  </div>

                  {!isAuthenticated ? (
                    <button onClick={navigateToLogin} className="rounded-xl font-bold w-full py-3.5 font-orbitron text-sm" style={{background:'#00e701', color:'#000'}}>
                      Se connecter pour parier
                    </button>
                  ) : (
                    <button onClick={placeBet} disabled={betAmount > credits}
                      className="rounded-xl font-bold w-full py-3.5 font-orbitron text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{background:'#00e701', color:'#000'}}>
                      <TrendingUp className="w-4 h-4" />
                      Parier {fmt(betAmount)} EUR &rarr; {fmt(potentialGain)} EUR
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Pending bets preview desktop */}
            {pendingBets.length > 0 && (
              <div className="rounded-2xl p-4" style={{background:'#111a25', border:'1px solid #1a2a38'}}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{color:'#4b5c6f'}}>Mes derniers paris</h4>
                  <button onClick={() => setActiveCategory('mybets')} className="text-xs font-semibold" style={{color:'#00e701'}}>Voir tout</button>
                </div>
                <div className="space-y-2">
                  {pendingBets.slice(0, 3).map(b => (
                    <div key={b.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{background:'rgba(17,26,37,0.8)', border:'1px solid #1a2a38'}}>
                      <div className="flex items-center gap-2">
                        {b.status === 'pending' && <Timer className="w-3 h-3" style={{color:'#eab308'}} />}
                        {b.status === 'won' && <TrendingUp className="w-3 h-3" style={{color:'#00e701'}} />}
                        {b.status === 'lost' && <X className="w-3 h-3" style={{color:'#ef4444'}} />}
                        <span className="text-xs" style={{color:'#94a3b8'}}>x{b.odds.toFixed(2)}</span>
                      </div>
                      <span className="font-orbitron text-xs font-bold" style={{color:'#94a3b8'}}>{fmt(b.amount)} EUR</span>
                      <span className="font-orbitron text-xs font-bold" style={{color: b.status === 'won' ? '#00e701' : b.status === 'lost' ? '#ef4444' : '#eab308'}}>
                        {b.status === 'won' ? `+${fmt(b.gain - b.amount)}` : b.status === 'lost' ? `-${fmt(b.amount)}` : `-> ${fmt(b.potential)}`} EUR
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
