import { useParams, Link } from 'react-router-dom';
import { MapPin, Shield, Zap, Gift, Star, Gamepad2, Trophy } from 'lucide-react';

const bg='#080c12', sbg='#0c1018', crd='#111a25', crdH='#162030', g='#00e701', p='#8b5cf6', s='#94a3b8', m='#4b5c6f', b='#1a2a38';

const CITIES = {
  fr: {
    paris: { name: 'Paris', country: 'France', currency: 'EUR' },
    marseille: { name: 'Marseille', country: 'France', currency: 'EUR' },
    lyon: { name: 'Lyon', country: 'France', currency: 'EUR' },
    toulouse: { name: 'Toulouse', country: 'France', currency: 'EUR' },
    nice: { name: 'Nice', country: 'France', currency: 'EUR' },
    nantes: { name: 'Nantes', country: 'France', currency: 'EUR' },
    bordeaux: { name: 'Bordeaux', country: 'France', currency: 'EUR' },
    lille: { name: 'Lille', country: 'France', currency: 'EUR' },
  },
  br: {
    'sao-paulo': { name: 'São Paulo', country: 'Brésil', currency: 'BRL' },
    rio: { name: 'Rio de Janeiro', country: 'Brésil', currency: 'BRL' },
  },
  ru: {
    moscow: { name: 'Moscou', country: 'Russie', currency: 'RUB' },
  },
};

const FEATURES = [
  { icon: Shield, title: 'Provably Fair', desc: 'Chaque résultat est vérifiable cryptographiquement via HMAC-SHA256.' },
  { icon: Zap, title: 'Retraits instantanés', desc: 'Retirez vos gains en moins de 10 minutes via crypto.' },
  { icon: Gift, title: 'Rakeback sans wagering', desc: '50% de rakeback pendant 7 jours, sans condition de mise.' },
  { icon: Star, title: 'Programme VIP', desc: '24 paliers avec des récompenses croissantes et un VIP host dédié.' },
  { icon: Gamepad2, title: 'Jeux Originaux', desc: 'Dice, Blackjack, Crash, Plinko, Roulette et bien plus.' },
  { icon: Trophy, title: 'Daily Race', desc: 'Compétition quotidienne avec prize pool automatique.' },
];

export default function CityPage() {
  const { country, city } = useParams();
  const cityData = CITIES[country]?.[city];

  if (!cityData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-2xl font-orbitron font-black text-white mb-4">Ville non trouvée</p>
          <Link to="/" className="hover:underline" style={{ color: g }}>Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{ background: `${g}12`, border: `1px solid ${g}30` }}>
            <MapPin className="w-3.5 h-3.5" style={{ color: g }} />
            <span className="text-xs font-bold uppercase tracking-[0.15em]" style={{ color: g }}>
              {cityData.country}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black font-orbitron mb-6"
            style={{ color: '#fff', textShadow: `0 0 80px ${g}44` }}>
            Casino en ligne {cityData.name}
          </h1>

          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: s }}>
            Jouez sur Cazyno depuis {cityData.name}. Casino crypto avec des jeux provably fair,
            des retraits instantanés et un programme VIP exclusif. Inscription en 30 secondes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-4 rounded-xl font-black text-base font-orbitron transition-all hover:scale-105 active:scale-95"
              style={{ background: g, color: '#000' }}
            >
              Créer un compte gratuit
            </Link>
            <Link
              to="/dashboard/casino/dice"
              className="px-8 py-4 rounded-2xl font-bold text-base transition-all hover:scale-105"
              style={{ background: crd, border: `1px solid ${b}`, color: s }}
            >
              Essayer en démo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-orbitron font-black text-center mb-12" style={{ color: '#fff' }}>
            Pourquoi jouer sur Cazyno depuis {cityData.name} ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-6"
                style={{ background: crd, border: `1px solid ${b}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${g}12` }}>
                  <Icon className="w-5 h-5" style={{ color: g }} />
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: s }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Games */}
      <section className="py-16 px-6" style={{ background: sbg }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-orbitron font-black mb-4" style={{ color: '#fff' }}>
            Nos jeux disponibles à {cityData.name}
          </h2>
          <p className="mb-10" style={{ color: s }}>
            Tous nos jeux sont provably fair et accessibles en mode démo sans inscription.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[{n:'Dice',p:'dice'},{n:'Blackjack',p:'blackjack'},{n:'Roulette',p:'roulette'},{n:'Crash',p:'crash'},{n:'Plinko',p:'plinko'},{n:'PulseBomb',p:'pulse-bomb'},{n:'ChickenDrop',p:'chicken-drop'},{n:'Trader',p:'trader'}].map(({n:game,p:path}) => (
              <Link
                key={game}
                to={`/dashboard/casino/${path}`}
                className="rounded-2xl p-5 text-center transition-all hover:scale-105"
                style={{ background: crd, border: `1px solid ${b}` }}
              >
                <Gamepad2 className="w-8 h-8 mx-auto mb-2" style={{ color: g }} />
                <span className="text-white font-bold text-sm">{game}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-orbitron font-black mb-4" style={{ color: '#fff' }}>
            Prêt à jouer depuis {cityData.name} ?
          </h2>
          <p className="mb-8" style={{ color: s }}>
            Inscription en 30 secondes. 50% de rakeback offert pendant 7 jours.
          </p>
          <Link
            to="/"
            className="inline-block px-10 py-4 rounded-xl font-black text-base font-orbitron transition-all hover:scale-105"
            style={{ background: g, color: '#000' }}
          >
            Rejoindre Cazyno
          </Link>
        </div>
      </section>
    </div>
  );
}
