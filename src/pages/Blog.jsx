import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';

const bg='#080c12', sbg='#0c1018', crd='#111a25', crdH='#162030', g='#00e701', p='#8b5cf6', s='#94a3b8', m='#4b5c6f', b='#1a2a38';

const POSTS = [
  {
    slug: 'comment-fonctionne-provably-fair',
    title: 'Comment fonctionne le Provably Fair ?',
    excerpt: 'Découvrez comment notre système cryptographique garantit l\'équité de chaque partie sur Cazyno.',
    category: 'Technologie',
    date: '2025-03-15',
    readTime: '5 min',
    content: [
      { type: 'p', text: 'Le Provably Fair est un système cryptographique qui permet à chaque joueur de vérifier que le résultat d\'une partie n\'a pas été manipulé. Contrairement aux casinos traditionnels qui reposent sur la confiance aveugle, Cazyno utilise un mécanisme transparent basé sur HMAC-SHA256.' },
      { type: 'h2', text: 'Les 3 composants' },
      { type: 'p', text: 'Chaque partie utilise trois éléments : un Server Seed (généré par nos serveurs et hashé avant la partie), un Client Seed (que vous pouvez modifier) et un Nonce (compteur qui s\'incrémente à chaque partie).' },
      { type: 'h2', text: 'Comment vérifier ?' },
      { type: 'p', text: 'Après chaque partie, vous pouvez accéder au Server Seed original et recalculer le résultat vous-même. Si le hash HMAC-SHA256 correspond, le résultat est authentique et n\'a pas été modifié.' },
      { type: 'h2', text: 'Pourquoi c\'est important' },
      { type: 'p', text: 'Le Provably Fair élimine le besoin de faire confiance au casino. Vous pouvez vérifier mathématiquement que chaque résultat est juste. C\'est la transparence maximale dans le gaming en ligne.' },
    ],
  },
  {
    slug: 'guide-debutant-casino-crypto',
    title: 'Guide du débutant : Casino Crypto',
    excerpt: 'Tout ce que vous devez savoir pour commencer à jouer sur un casino crypto en 2025.',
    category: 'Guide',
    date: '2025-03-10',
    readTime: '8 min',
    content: [
      { type: 'p', text: 'Les casinos crypto offrent des avantages significatifs par rapport aux casinos traditionnels : retraits instantanés, anonymat, fees réduits et transparence grâce au Provably Fair.' },
      { type: 'h2', text: 'Étape 1 : Obtenir du crypto' },
      { type: 'p', text: 'Si vous n\'avez pas encore de crypto, vous pouvez en acheter directement sur Cazyno via MoonPay avec votre carte bancaire. Bitcoin, Ethereum, USDT et Solana sont acceptés.' },
      { type: 'h2', text: 'Étape 2 : Créer un compte' },
      { type: 'p', text: 'L\'inscription prend 30 secondes. Email et mot de passe suffisent. Pas de KYC obligatoire avant votre premier retrait de plus de 2000$.' },
      { type: 'h2', text: 'Étape 3 : Profiter du rakeback' },
      { type: 'p', text: 'Dès votre inscription, vous bénéficiez de 50% de rakeback pendant 7 jours, sans condition de mise. Chaque pari vous rapporte automatiquement.' },
    ],
  },
  {
    slug: 'comprendre-le-house-edge',
    title: 'Comprendre le House Edge',
    excerpt: 'Qu\'est-ce que le house edge et comment il varie selon les jeux sur Cazyno.',
    category: 'Éducation',
    date: '2025-03-05',
    readTime: '4 min',
    content: [
      { type: 'p', text: 'Le house edge (avantage de la maison) est le pourcentage mathématique que le casino gagne en moyenne sur chaque mise. Plus il est bas, plus le jeu est favorable au joueur.' },
      { type: 'h2', text: 'House edge par jeu sur Cazyno' },
      { type: 'p', text: 'Dice : 2% — Blackjack : 1.5% — Roulette : 2.7% — Crash : 3-4% — Plinko : 1-3% — PulseBomb : 3% — ChickenDrop : variable selon la difficulté.' },
      { type: 'h2', text: 'Comment minimiser l\'impact' },
      { type: 'p', text: 'Choisissez des jeux à faible house edge comme le Blackjack. Utilisez le rakeback pour compenser une partie de l\'avantage. Fixez-vous des limites et jouez de manière responsable.' },
    ],
  },
  {
    slug: 'programme-vip-24-paliers',
    title: 'Notre programme VIP : 24 paliers expliqués',
    excerpt: 'De Bronze 1 à Obsidian 3, découvrez tous les avantages de notre système VIP granulaire.',
    category: 'VIP',
    date: '2025-02-28',
    readTime: '6 min',
    content: [
      { type: 'p', text: 'Le programme VIP de Cazyno est l\'un des plus détaillés du marché avec 24 micro-paliers répartis en 8 tiers. Chaque palier débloque des avantages supplémentaires.' },
      { type: 'h2', text: 'Les 8 tiers' },
      { type: 'p', text: 'Bronze (5%), Silver (7%), Gold (10%), Platinum (12%), Diamond (15%), Emerald (18%), Ruby (20%), Obsidian (25%+). Chaque tier contient 3 sous-niveaux pour maximiser la fréquence des récompenses.' },
      { type: 'h2', text: 'Avantages exclusifs' },
      { type: 'p', text: 'À partir de Platinum 2, vous bénéficiez d\'un VIP host dédié. Les Obsidian ont accès à des bonus bespoke et des événements privés.' },
    ],
  },
];

const CATEGORIES = ['Tous', 'Technologie', 'Guide', 'Éducation', 'VIP'];

function BlogList() {
  const [filter, setFilter] = useState('Tous');
  const filtered = filter === 'Tous' ? POSTS : POSTS.filter(p => p.category === filter);

  return (
    <>
      {/* Hero */}
      <section className="py-16 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black font-orbitron mb-4"
          style={{ color: '#fff', textShadow: `0 0 60px ${g}44` }}>
          Blog Cazyno
        </h1>
        <p style={{ color: s }} className="max-w-xl mx-auto">
          Guides, actualités et conseils pour les joueurs de casino crypto.
        </p>
      </section>

      {/* Categories */}
      <div className="max-w-4xl mx-auto px-6 mb-10">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={{
                background: filter === cat ? `${g}12` : crd,
                border: `1px solid ${filter === cat ? `${g}30` : b}`,
                color: filter === cat ? g : m,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid gap-6">
          {filtered.map(post => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group rounded-2xl p-6 transition-all hover:scale-[1.01]"
              style={{ background: crd, border: `1px solid ${b}` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: `${g}12`, border: `1px solid ${g}30`, color: g }}>
                  {post.category}
                </span>
                <span className="text-xs flex items-center gap-1" style={{ color: m }}>
                  <Clock className="w-3 h-3" /> {post.readTime}
                </span>
                <span className="text-xs" style={{ color: m }}>{new Date(post.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2 transition-colors" style={{ color: '#fff' }}>
                {post.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: s }}>{post.excerpt}</p>
              <div className="flex items-center gap-1 mt-4 text-xs font-bold" style={{ color: g }}>
                Lire l'article <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-2xl font-orbitron font-black text-white mb-4">Article non trouvé</p>
          <Link to="/blog" className="hover:underline" style={{ color: g }}>Retour au blog</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <article className="max-w-3xl mx-auto px-6 py-16">
        <button onClick={() => navigate('/blog')}
          className="flex items-center gap-2 hover:text-white transition mb-8 text-sm"
          style={{ color: s }}>
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
            style={{ background: `${g}12`, border: `1px solid ${g}30`, color: g }}>
            {post.category}
          </span>
          <span className="text-xs flex items-center gap-1" style={{ color: m }}>
            <Clock className="w-3 h-3" /> {post.readTime}
          </span>
          <span className="text-xs" style={{ color: m }}>{new Date(post.date).toLocaleDateString('fr-FR')}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black font-orbitron mb-8"
          style={{ color: '#fff', textShadow: `0 0 40px ${g}33` }}>
          {post.title}
        </h1>

        <div className="space-y-6">
          {post.content.map((block, i) => {
            if (block.type === 'h2') {
              return <h2 key={i} className="text-xl font-bold mt-10 mb-3 font-orbitron" style={{ color: '#fff' }}>{block.text}</h2>;
            }
            return <p key={i} className="leading-relaxed" style={{ color: s }}>{block.text}</p>;
          })}
        </div>
      </article>

      {/* Related posts */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        <h3 className="text-lg font-orbitron font-black mb-6" style={{ color: '#fff' }}>Articles similaires</h3>
        <div className="grid gap-4">
          {POSTS.filter(p => p.slug !== slug).slice(0, 2).map(p => (
            <Link key={p.slug} to={`/blog/${p.slug}`}
              className="rounded-2xl p-4 flex items-center gap-4 transition-all hover:scale-[1.01]"
              style={{ background: crd, border: `1px solid ${b}` }}>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">{p.title}</p>
                <p className="text-xs mt-1" style={{ color: m }}>{p.readTime}</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: m }} />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default function Blog() {
  const { slug } = useParams();

  return slug ? <BlogPost /> : <BlogList />;
}
