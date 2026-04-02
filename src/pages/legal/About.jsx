import { Link } from 'react-router-dom';

const bg='#080c12', crd='#111a25', b='#1a2a38', g='#00e701', s='#94a3b8', m='#4b5c6f';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-orbitron font-black mb-3" style={{color:g}}>{title}</h2>
    <div className="text-[13px] leading-relaxed space-y-3" style={{color:s}}>{children}</div>
  </div>
);

const VALUES = [
  { title: 'Transparence', desc: 'Chaque résultat est vérifiable grâce à notre système Provably Fair. Aucun résultat caché, aucune manipulation.' },
  { title: 'Équité', desc: 'Des avantages maison parmi les plus bas du marché et une redistribution maximale aux joueurs.' },
  { title: 'Innovation', desc: 'Nous repoussons les limites du jeu en ligne avec des jeux originaux et une technologie de pointe.' },
  { title: 'Responsabilité', desc: 'Le bien-être de nos joueurs passe avant tout. Nous promouvons activement le jeu responsable.' },
];

export default function About() {
  return (
    <div className="w-full">
      <div className="rounded-2xl p-8" style={{background:crd,border:`1px solid ${b}`}}>
        <h1 className="text-2xl font-orbitron font-black mb-2" style={{color:g}}>À Propos de Cazyno</h1>
        <p className="text-sm mb-8" style={{color:m}}>Le casino en ligne nouvelle génération.</p>

        <Section title="Présentation">
          <p>Cazyno est un casino en ligne crypto-natif, conçu pour offrir une expérience de jeu moderne, transparente et équitable. Fondé en 2025, nous combinons la technologie blockchain avec des jeux originaux développés en interne pour proposer une plateforme de divertissement unique.</p>
          <p>Notre approche crypto-native signifie des dépôts et retraits instantanés, des frais réduits et une transparence totale grâce à la blockchain. Nous acceptons les principales cryptomonnaies : Bitcoin, Ethereum, Litecoin, USDT et USDC.</p>
        </Section>

        <Section title="Notre Mission">
          <p>Notre mission est de redéfinir l'expérience du casino en ligne en plaçant la confiance et la transparence au centre de tout ce que nous faisons. Nous voulons prouver qu'un casino peut être à la fois divertissant et honnête, grâce à la technologie Provably Fair qui permet à chaque joueur de vérifier l'équité de chaque résultat.</p>
        </Section>

        <Section title="Licence et Régulation">
          <div className="rounded-xl p-4" style={{background:bg,border:`1px solid ${b}`}}>
            <p><strong style={{color:'#fff'}}>Entité légale :</strong> Cazyno N.V.</p>
            <p><strong style={{color:'#fff'}}>Numéro de licence :</strong> 365/JAZ</p>
            <p><strong style={{color:'#fff'}}>Autorité de régulation :</strong> Curaçao Gaming Authority</p>
            <p><strong style={{color:'#fff'}}>Adresse :</strong> Kaya Richard J. Beaujon z/n, Willemstad, Curaçao</p>
            <p><strong style={{color:'#fff'}}>Numéro d'enregistrement :</strong> 162450</p>
          </div>
        </Section>

        <Section title="Nos Valeurs">
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            {VALUES.map(({ title, desc }) => (
              <div key={title} className="rounded-xl p-4" style={{background:bg,border:`1px solid ${b}`}}>
                <h3 className="font-bold text-sm mb-2" style={{color:'#fff'}}>{title}</h3>
                <p className="text-xs" style={{color:s}}>{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Technologie">
          <p><strong style={{color:'#fff'}}>Provably Fair :</strong> chaque résultat de jeu utilise un système cryptographique HMAC-SHA256 vérifiable par le joueur. Nous ne pouvons pas manipuler les résultats et vous pouvez le prouver.</p>
          <p><strong style={{color:'#fff'}}>Transactions instantanées :</strong> grâce à l'intégration native des cryptomonnaies, vos dépôts sont crédités dès confirmation blockchain et vos retraits traités en quelques minutes.</p>
          <p><strong style={{color:'#fff'}}>Infrastructure sécurisée :</strong> notre plateforme est hébergée sur une infrastructure cloud distribuée avec chiffrement de bout en bout, surveillance 24/7 et sauvegardes automatiques.</p>
        </Section>

        <Section title="Jeu Responsable">
          <p>Nous prenons le jeu responsable très au sérieux. Cazyno propose des outils d'auto-exclusion, de limites de dépôt et de durée de session. Nous collaborons avec des organismes reconnus comme GamCare et BeGambleAware. Pour en savoir plus, consultez notre <Link to="/responsible-gambling" style={{color:g}}>page dédiée au jeu responsable</Link>.</p>
        </Section>

        <Section title="Nous Contacter">
          <p>Support général : <span style={{color:g}}>support@cazyno.com</span></p>
          <p>Questions juridiques : <span style={{color:g}}>legal@cazyno.com</span></p>
          <p>Protection des données : <span style={{color:g}}>dpo@cazyno.com</span></p>
          <p>Partenariats : <span style={{color:g}}>partners@cazyno.com</span></p>
          <p className="mt-2">Support disponible 24h/24, 7j/7 via le chat en direct sur la plateforme.</p>
        </Section>
      </div>
    </div>
  );
}
