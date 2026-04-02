const bg='#080c12', crd='#111a25', b='#1a2a38', g='#00e701', s='#94a3b8', m='#4b5c6f';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-orbitron font-black mb-3" style={{color:g}}>{title}</h2>
    <div className="text-[13px] leading-relaxed space-y-3" style={{color:s}}>{children}</div>
  </div>
);

const QUIZ = [
  "Avez-vous déjà joué plus longtemps que prévu ?",
  "Avez-vous déjà misé plus que ce que vous pouviez vous permettre de perdre ?",
  "Le jeu a-t-il déjà affecté vos relations personnelles ?",
  "Avez-vous déjà emprunté de l'argent pour jouer ?",
  "Ressentez-vous le besoin de jouer avec des mises de plus en plus élevées ?",
];

const ORGS = [
  { name: 'GamCare', url: 'https://www.gamcare.org.uk', desc: 'Aide et conseil pour les joueurs problématiques' },
  { name: 'BeGambleAware', url: 'https://www.begambleaware.org', desc: 'Informations et soutien pour le jeu responsable' },
  { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org', desc: 'Groupes de soutien et entraide entre pairs' },
  { name: 'Joueurs Info Service', url: 'https://www.joueurs-info-service.fr', desc: 'Service français d\'aide aux joueurs — 09 74 75 13 13' },
];

export default function ResponsibleGambling() {
  return (
    <div className="w-full">
      <div className="rounded-2xl p-8" style={{background:crd,border:`1px solid ${b}`}}>
        <h1 className="text-2xl font-orbitron font-black mb-2" style={{color:g}}>Jeu Responsable</h1>
        <p className="text-sm mb-8" style={{color:m}}>Votre bien-être est notre priorité absolue.</p>

        <Section title="Notre Engagement">
          <p>Chez Cazyno, nous croyons que le jeu doit rester un divertissement. Nous mettons en place des outils et des ressources pour vous aider à garder le contrôle de votre activité de jeu. Si le jeu cesse d'être amusant, il est temps de faire une pause.</p>
        </Section>

        <Section title="Auto-évaluation">
          <p>Répondez honnêtement aux questions suivantes. Si vous répondez "oui" à une ou plusieurs d'entre elles, nous vous recommandons de consulter les ressources d'aide ci-dessous.</p>
          <div className="space-y-3 mt-4">
            {QUIZ.map((q, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-4" style={{background:bg,border:`1px solid ${b}`}}>
                <div className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" style={{border:`2px solid ${m}`}} />
                <span className="text-[13px]" style={{color:s}}>{q}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Limites de Dépôt">
          <p>Définissez des limites de dépôt quotidiennes, hebdomadaires ou mensuelles depuis les paramètres de votre compte. Une fois une limite définie, elle prend effet immédiatement. Toute augmentation de limite ne prendra effet qu'après une période de réflexion de 24 heures.</p>
        </Section>

        <Section title="Limites de Perte">
          <p>Vous pouvez configurer une limite de perte maximale par jour, par semaine ou par mois. Une fois cette limite atteinte, vous ne pourrez plus placer de mises jusqu'à la prochaine période.</p>
        </Section>

        <Section title="Limites de Durée de Session">
          <p>Paramétrez des rappels de durée de session pour être alerté lorsque vous jouez depuis trop longtemps. Vous pouvez choisir des rappels toutes les 30, 60 ou 120 minutes.</p>
        </Section>

        <Section title="Auto-exclusion">
          <p>Si vous souhaitez faire une pause, vous pouvez vous auto-exclure pour une durée déterminée : 24 heures, 7 jours, 30 jours, 6 mois ou définitivement. Pendant la période d'exclusion, vous ne pourrez ni vous connecter ni créer un nouveau compte. L'auto-exclusion définitive est irréversible.</p>
        </Section>

        <Section title="Période de Réflexion">
          <p>La période de réflexion (cooling-off) vous permet de prendre du recul sans supprimer votre compte. Pendant cette période, vous ne recevrez plus de communications marketing et l'accès au jeu sera bloqué.</p>
        </Section>

        <Section title="Organismes d'Aide">
          <div className="grid gap-3 mt-2">
            {ORGS.map(({ name, url, desc }) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                className="block rounded-xl p-4 transition hover:opacity-80" style={{background:bg,border:`1px solid ${b}`}}>
                <span className="font-bold text-sm" style={{color:'#fff'}}>{name}</span>
                <p className="text-xs mt-1" style={{color:s}}>{desc}</p>
                <span className="text-xs mt-2 inline-block" style={{color:g}}>{url}</span>
              </a>
            ))}
          </div>
        </Section>

        <Section title="Protection des Mineurs">
          <p>Les jeux d'argent sont strictement interdits aux mineurs de moins de 18 ans. Nous effectuons des vérifications d'âge lors de l'inscription et lors du processus KYC. Nous recommandons l'utilisation de logiciels de contrôle parental tels que Net Nanny ou Cyber Patrol pour empêcher l'accès des mineurs aux sites de jeux.</p>
        </Section>
      </div>
    </div>
  );
}
