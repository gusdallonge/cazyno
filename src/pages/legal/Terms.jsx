const bg='#080c12', crd='#111a25', b='#1a2a38', g='#00e701', s='#94a3b8', m='#4b5c6f';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-orbitron font-black mb-3" style={{color:g}}>{title}</h2>
    <div className="text-[13px] leading-relaxed space-y-3" style={{color:s}}>{children}</div>
  </div>
);

export default function Terms() {
  return (
    <div className="w-full">
      <div className="rounded-2xl p-8" style={{background:crd,border:`1px solid ${b}`}}>
        <h1 className="text-2xl font-orbitron font-black mb-2" style={{color:g}}>Conditions Générales d'Utilisation</h1>
        <p className="text-sm mb-8" style={{color:m}}>Dernière mise à jour : 30 mars 2026</p>

        <Section title="1. Acceptation des Conditions">
          <p>En accédant à Cazyno.com et en utilisant nos services, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre plateforme.</p>
        </Section>

        <Section title="2. Éligibilité">
          <p>Vous devez avoir au moins 18 ans (ou l'âge légal de jeu dans votre juridiction) pour utiliser Cazyno. En créant un compte, vous confirmez que vous avez l'âge requis. Cazyno se réserve le droit de demander une preuve d'âge à tout moment.</p>
          <p>Il est de votre responsabilité de vérifier que les jeux d'argent en ligne sont autorisés dans votre juridiction de résidence.</p>
        </Section>

        <Section title="3. Règles de Compte">
          <p>Chaque utilisateur ne peut détenir qu'un seul compte. Les informations fournies lors de l'inscription doivent être exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants de connexion. Tout usage non autorisé de votre compte doit être signalé immédiatement.</p>
        </Section>

        <Section title="4. Dépôts et Retraits">
          <p>Les dépôts sont crédités après confirmation sur la blockchain. Les retraits sont traités dans un délai de 24 heures, sous réserve de vérification d'identité. Cazyno se réserve le droit d'appliquer des limites minimales et maximales de transaction. Des frais de réseau peuvent s'appliquer aux transactions en cryptomonnaie.</p>
        </Section>

        <Section title="5. Conditions de Bonus">
          <p>Tous les bonus sont soumis à des conditions de mise spécifiques. Les conditions de mise doivent être remplies avant tout retrait des gains issus d'un bonus. Cazyno se réserve le droit de modifier ou d'annuler les offres promotionnelles à tout moment. L'abus de bonus entraînera la confiscation des bonus et des gains associés.</p>
        </Section>

        <Section title="6. Jeu Responsable">
          <p>Cazyno s'engage à promouvoir le jeu responsable. Nous mettons à disposition des outils d'auto-exclusion, de limites de dépôt et de limites de session. Si vous pensez avoir un problème de jeu, nous vous encourageons à consulter notre page dédiée au jeu responsable et à contacter les organismes d'aide.</p>
        </Section>

        <Section title="7. Activités Interdites">
          <p>Sont strictement interdits : la création de comptes multiples, le blanchiment d'argent, l'utilisation de logiciels automatisés (bots), la collusion entre joueurs, l'exploitation de bugs ou de failles techniques, et toute activité frauduleuse. Toute violation entraînera la fermeture immédiate du compte.</p>
        </Section>

        <Section title="8. Résiliation de Compte">
          <p>Cazyno se réserve le droit de suspendre ou de fermer tout compte en cas de violation des présentes conditions, de suspicion de fraude ou d'activité illégale. L'utilisateur peut à tout moment demander la fermeture de son compte en contactant le support.</p>
        </Section>

        <Section title="9. Limitation de Responsabilité">
          <p>Cazyno ne saurait être tenu responsable des pertes financières résultant de l'utilisation de la plateforme. Le jeu comporte des risques inhérents et les joueurs sont seuls responsables de leurs décisions de mise. Cazyno ne garantit pas la disponibilité ininterrompue du service.</p>
        </Section>

        <Section title="10. Droit Applicable">
          <p>Les présentes conditions sont régies par les lois de Curaçao. Tout litige sera soumis à la juridiction exclusive des tribunaux de Curaçao. Cazyno opère sous licence délivrée par la Curaçao Gaming Authority (licence n° 365/JAZ).</p>
        </Section>

        <Section title="11. Contact">
          <p>Pour toute question relative aux présentes conditions, contactez-nous à <span style={{color:g}}>legal@cazyno.com</span> ou via notre formulaire de contact disponible sur la plateforme.</p>
        </Section>
      </div>
    </div>
  );
}
