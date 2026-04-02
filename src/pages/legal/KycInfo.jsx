const bg='#080c12', crd='#111a25', b='#1a2a38', g='#00e701', s='#94a3b8', m='#4b5c6f';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-orbitron font-black mb-3" style={{color:g}}>{title}</h2>
    <div className="text-[13px] leading-relaxed space-y-3" style={{color:s}}>{children}</div>
  </div>
);

const STEPS = [
  { step: '1', title: 'Soumission', desc: 'Téléchargez vos documents via votre espace personnel dans la section "Vérification".' },
  { step: '2', title: 'Examen', desc: 'Notre équipe de conformité examine vos documents dans un délai de 24 à 72 heures.' },
  { step: '3', title: 'Validation', desc: 'Vous recevez une notification par e-mail confirmant la validation de votre compte.' },
  { step: '4', title: 'Accès complet', desc: 'Une fois vérifié, vous bénéficiez de limites de retrait étendues et d\'un accès complet à la plateforme.' },
];

export default function KycInfo() {
  return (
    <div className="w-full">
      <div className="rounded-2xl p-8" style={{background:crd,border:`1px solid ${b}`}}>
        <h1 className="text-2xl font-orbitron font-black mb-2" style={{color:g}}>Processus de Vérification KYC</h1>
        <p className="text-sm mb-8" style={{color:m}}>Know Your Customer — Connaître notre client pour votre sécurité.</p>

        <Section title="Pourquoi nous vérifions votre identité">
          <p>La vérification d'identité est une obligation légale qui nous permet de prévenir le blanchiment d'argent, protéger votre compte contre les accès non autorisés, garantir que vous avez l'âge légal pour jouer, et respecter les réglementations de la Curaçao Gaming Authority. C'est aussi une mesure de protection pour vous en tant que joueur.</p>
        </Section>

        <Section title="Quand la vérification est-elle requise">
          <p>La vérification KYC est déclenchée dans les cas suivants :</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Lors de votre premier retrait supérieur à 2 000 USD (ou équivalent crypto)</li>
            <li>Lorsque le cumul de vos dépôts dépasse 10 000 USD</li>
            <li>En cas de détection d'activité inhabituelle sur votre compte</li>
            <li>À la demande de notre équipe de conformité</li>
            <li>Lors d'un changement de méthode de paiement</li>
          </ul>
        </Section>

        <Section title="Documents Requis">
          <div className="space-y-4 mt-2">
            <div className="rounded-xl p-4" style={{background:bg,border:`1px solid ${b}`}}>
              <h3 className="font-bold text-sm mb-2" style={{color:'#fff'}}>Pièce d'identité (obligatoire)</h3>
              <p>Passeport, carte d'identité nationale ou permis de conduire en cours de validité. Le document doit être en couleur, lisible et montrer toutes les informations (nom, date de naissance, photo, date d'expiration).</p>
            </div>
            <div className="rounded-xl p-4" style={{background:bg,border:`1px solid ${b}`}}>
              <h3 className="font-bold text-sm mb-2" style={{color:'#fff'}}>Justificatif de domicile (obligatoire)</h3>
              <p>Facture de services publics (eau, électricité, gaz, internet) ou relevé bancaire datant de moins de 3 mois. Le document doit afficher votre nom complet et votre adresse.</p>
            </div>
            <div className="rounded-xl p-4" style={{background:bg,border:`1px solid ${b}`}}>
              <h3 className="font-bold text-sm mb-2" style={{color:'#fff'}}>Vérification du moyen de paiement (si applicable)</h3>
              <p>Pour les paiements par carte : photo de la carte (masquez les 8 chiffres du milieu et le CVV). Pour les cryptomonnaies : capture d'écran de votre portefeuille montrant l'adresse utilisée.</p>
            </div>
          </div>
        </Section>

        <Section title="Étapes du Processus">
          <div className="grid gap-3 mt-2">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4 rounded-xl p-4" style={{background:bg,border:`1px solid ${b}`}}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-orbitron font-bold text-sm"
                  style={{background:'rgba(0,231,1,0.1)',border:`1px solid ${b}`,color:g}}>
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{color:'#fff'}}>{title}</h3>
                  <p className="text-xs mt-1" style={{color:s}}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Délais de Traitement">
          <p>La vérification standard est traitée sous 24 à 72 heures ouvrées. En cas de forte affluence ou de nécessité de vérifications supplémentaires, le délai peut être étendu à 5 jours ouvrés. Vous recevrez une notification par e-mail à chaque étape du processus.</p>
        </Section>

        <Section title="Sécurité de vos Documents">
          <p>Vos documents sont transmis via une connexion chiffrée SSL/TLS et stockés sur des serveurs sécurisés avec chiffrement au repos (AES-256). L'accès aux documents est strictement limité à l'équipe de conformité autorisée. Les documents sont supprimés conformément à notre politique de conservation des données après la période légale de 10 ans.</p>
        </Section>
      </div>
    </div>
  );
}
