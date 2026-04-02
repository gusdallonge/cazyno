const bg='#080c12', crd='#111a25', b='#1a2a38', g='#00e701', s='#94a3b8', m='#4b5c6f';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-orbitron font-black mb-3" style={{color:g}}>{title}</h2>
    <div className="text-[13px] leading-relaxed space-y-3" style={{color:s}}>{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <div className="w-full">
      <div className="rounded-2xl p-8" style={{background:crd,border:`1px solid ${b}`}}>
        <h1 className="text-2xl font-orbitron font-black mb-2" style={{color:g}}>Politique de Confidentialité</h1>
        <p className="text-sm mb-8" style={{color:m}}>Dernière mise à jour : 30 mars 2026</p>

        <Section title="1. Données Collectées">
          <p><strong style={{color:'#fff'}}>Données personnelles :</strong> nom, prénom, date de naissance, adresse e-mail, numéro de téléphone, adresse postale, pièce d'identité lors de la vérification KYC.</p>
          <p><strong style={{color:'#fff'}}>Données financières :</strong> adresses de portefeuille crypto, historique des transactions, méthodes de paiement utilisées, montants déposés et retirés.</p>
          <p><strong style={{color:'#fff'}}>Données de jeu :</strong> historique des parties, mises placées, gains et pertes, préférences de jeu, durée des sessions, utilisation des bonus.</p>
          <p><strong style={{color:'#fff'}}>Données techniques :</strong> adresse IP, type de navigateur, système d'exploitation, données de cookies, pages visitées.</p>
        </Section>

        <Section title="2. Utilisation des Données">
          <p>Vos données sont utilisées pour : la gestion de votre compte et l'authentification, le traitement des transactions financières, la conformité réglementaire (KYC/AML), l'amélioration de nos services et de l'expérience utilisateur, la prévention de la fraude et la sécurité, la communication relative à votre compte et nos promotions (avec votre consentement).</p>
        </Section>

        <Section title="3. Partage des Données">
          <p><strong style={{color:'#fff'}}>Processeurs de paiement :</strong> nous partageons les données nécessaires au traitement de vos transactions avec nos partenaires de paiement agréés.</p>
          <p><strong style={{color:'#fff'}}>Autorités réglementaires :</strong> nous pouvons être amenés à communiquer des données aux autorités compétentes conformément à nos obligations légales (Curaçao Gaming Authority).</p>
          <p><strong style={{color:'#fff'}}>Prestataires techniques :</strong> nos sous-traitants techniques (hébergement, sécurité) peuvent accéder aux données dans le cadre strict de leurs missions.</p>
          <p>Nous ne vendons jamais vos données personnelles à des tiers.</p>
        </Section>

        <Section title="4. Cookies">
          <p>Nous utilisons des cookies essentiels pour le fonctionnement du site, des cookies analytiques pour comprendre l'utilisation de la plateforme, et des cookies de préférence pour mémoriser vos choix. Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.</p>
        </Section>

        <Section title="5. Conservation des Données">
          <p>Les données de compte sont conservées pendant toute la durée de votre inscription et 5 ans après la fermeture du compte. Les données de transaction sont conservées 10 ans conformément aux obligations anti-blanchiment. Les données techniques (logs) sont conservées 12 mois.</p>
        </Section>

        <Section title="6. Vos Droits">
          <p>Conformément à la réglementation applicable, vous disposez des droits suivants : droit d'accès à vos données, droit de rectification, droit à l'effacement (sous réserve des obligations légales de conservation), droit à la portabilité, droit d'opposition au traitement, droit de retirer votre consentement à tout moment.</p>
          <p>Pour exercer ces droits, contactez notre Délégué à la Protection des Données.</p>
        </Section>

        <Section title="7. Mesures de Sécurité">
          <p>Nous mettons en oeuvre des mesures techniques et organisationnelles appropriées : chiffrement SSL/TLS de toutes les communications, stockage sécurisé des mots de passe (bcrypt), authentification à deux facteurs disponible, surveillance continue des accès, audits de sécurité réguliers.</p>
        </Section>

        <Section title="8. Contact DPO">
          <p>Pour toute question relative à la protection de vos données, contactez notre Délégué à la Protection des Données :</p>
          <p>E-mail : <span style={{color:g}}>dpo@cazyno.com</span></p>
          <p>Adresse : Cazyno N.V., Kaya Richard J. Beaujon z/n, Curaçao</p>
        </Section>
      </div>
    </div>
  );
}
