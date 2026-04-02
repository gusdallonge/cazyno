const bg='#080c12', crd='#111a25', b='#1a2a38', g='#00e701', s='#94a3b8', m='#4b5c6f';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-orbitron font-black mb-3" style={{color:g}}>{title}</h2>
    <div className="text-[13px] leading-relaxed space-y-3" style={{color:s}}>{children}</div>
  </div>
);

const HOUSE_EDGES = [
  { game: 'Dice', edge: '2,00%' },
  { game: 'Blackjack', edge: '1,50%' },
  { game: 'Roulette', edge: '2,70%' },
  { game: 'Crash', edge: '3,00%' },
  { game: 'Plinko', edge: '2,00%' },
  { game: 'Pulse Bomb', edge: '3,50%' },
  { game: 'Chicken Drop', edge: '2,50%' },
  { game: 'Limbo', edge: '2,00%' },
];

export default function Fairness() {
  return (
    <div className="w-full">
      <div className="rounded-2xl p-8" style={{background:crd,border:`1px solid ${b}`}}>
        <h1 className="text-2xl font-orbitron font-black mb-2" style={{color:g}}>Provably Fair & Équité des Jeux</h1>
        <p className="text-sm mb-8" style={{color:m}}>La transparence et l'équité sont au coeur de Cazyno.</p>

        <Section title="Comment fonctionne le Provably Fair">
          <p>Le système Provably Fair utilise la cryptographie pour garantir que chaque résultat de jeu est équitable et vérifiable. L'algorithme repose sur HMAC-SHA256, une fonction de hachage cryptographique qui produit un résultat déterministe et impossible à manipuler après coup, tant par le casino que par le joueur.</p>
        </Section>

        <Section title="Server Seed, Client Seed & Nonce">
          <p><strong style={{color:'#fff'}}>Server Seed :</strong> généré par Cazyno avant chaque série de paris. Le hash du server seed est affiché avant le jeu, mais le seed lui-même reste secret jusqu'à ce que vous le changiez. Cela prouve que le résultat était prédéterminé.</p>
          <p><strong style={{color:'#fff'}}>Client Seed :</strong> généré par votre navigateur ou choisi par vous. Il garantit que Cazyno ne peut pas prédire le résultat final, car celui-ci dépend aussi de votre seed.</p>
          <p><strong style={{color:'#fff'}}>Nonce :</strong> un compteur qui s'incrémente à chaque pari. Il garantit qu'un résultat unique est produit pour chaque pari, même avec les mêmes seeds.</p>
          <div className="rounded-xl p-4 mt-3 font-mono text-xs" style={{background:bg,border:`1px solid ${b}`,color:'#fff'}}>
            <p>résultat = HMAC-SHA256(server_seed, client_seed:nonce)</p>
          </div>
        </Section>

        <Section title="Comment Vérifier les Résultats">
          <p>Après chaque partie, vous pouvez vérifier l'équité du résultat en suivant ces étapes :</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Notez le hash du server seed affiché avant votre partie.</li>
            <li>Changez votre server seed pour révéler l'ancien seed.</li>
            <li>Utilisez un vérificateur HMAC-SHA256 en ligne ou notre outil intégré.</li>
            <li>Entrez le server seed, votre client seed et le nonce du pari.</li>
            <li>Vérifiez que le hash correspond et que le résultat calculé correspond au résultat de votre partie.</li>
          </ol>
        </Section>

        <Section title="Certification RNG">
          <p>En complément du système Provably Fair, notre générateur de nombres aléatoires (RNG) est certifié par un laboratoire indépendant. Le RNG utilise des sources d'entropie cryptographiquement sécurisées pour garantir l'imprévisibilité totale des résultats.</p>
        </Section>

        <Section title="Transparence de l'Avantage Maison">
          <p>Chez Cazyno, nous affichons clairement l'avantage maison (house edge) de chaque jeu. Voici les avantages maison de nos jeux :</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {HOUSE_EDGES.map(({ game, edge }) => (
              <div key={game} className="flex items-center justify-between rounded-xl px-4 py-3" style={{background:bg,border:`1px solid ${b}`}}>
                <span className="text-sm font-medium" style={{color:'#fff'}}>{game}</span>
                <span className="text-sm font-mono" style={{color:g}}>{edge}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Audit par des Tiers">
          <p>Cazyno fait régulièrement auditer ses systèmes par des organismes indépendants pour garantir l'intégrité des jeux, la conformité des taux de redistribution et le bon fonctionnement du système Provably Fair. Les rapports d'audit sont disponibles sur demande auprès de notre équipe de support.</p>
        </Section>
      </div>
    </div>
  );
}
