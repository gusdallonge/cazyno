const bg='#080c12', crd='#111a25', b='#1a2a38', g='#00e701', s='#94a3b8', m='#4b5c6f';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-orbitron font-black mb-3" style={{color:g}}>{title}</h2>
    <div className="text-[13px] leading-relaxed space-y-3" style={{color:s}}>{children}</div>
  </div>
);

export default function AmlPolicy() {
  return (
    <div className="w-full">
      <div className="rounded-2xl p-8" style={{background:crd,border:`1px solid ${b}`}}>
        <h1 className="text-2xl font-orbitron font-black mb-2" style={{color:g}}>Politique Anti-Blanchiment (AML/KYC)</h1>
        <p className="text-sm mb-8" style={{color:m}}>Dernière mise à jour : 30 mars 2026</p>

        <Section title="1. Objectif">
          <p>La présente politique a pour objet de prévenir l'utilisation de Cazyno à des fins de blanchiment d'argent, de financement du terrorisme ou de toute autre activité financière illicite. Cazyno s'engage à respecter toutes les lois et réglementations applicables en matière de lutte contre le blanchiment d'argent.</p>
        </Section>

        <Section title="2. Cadre Réglementaire">
          <p>Cazyno opère sous licence de la Curaçao Gaming Authority et se conforme à la Landsverordening Offshore Kansspelen (LOK) ainsi qu'aux directives internationales du Groupe d'Action Financière (GAFI/FATF). Notre programme AML est conçu pour détecter et signaler les activités suspectes conformément à ces cadres réglementaires.</p>
        </Section>

        <Section title="3. Exigences KYC">
          <p>Tous les clients doivent fournir une pièce d'identité valide lors de l'inscription ou avant le premier retrait. Les documents acceptés incluent : passeport, carte d'identité nationale, permis de conduire. La vérification d'identité est obligatoire pour tout retrait supérieur à 2 000 USD ou équivalent en cryptomonnaie.</p>
        </Section>

        <Section title="4. Vigilance Standard (CDD)">
          <p>La vigilance standard (Customer Due Diligence) comprend : la vérification de l'identité du client, la vérification de l'adresse de résidence, l'évaluation du profil de risque du client, la surveillance continue des transactions. Chaque client se voit attribuer un niveau de risque (faible, moyen, élevé) déterminant le niveau de surveillance appliqué.</p>
        </Section>

        <Section title="5. Vigilance Renforcée (EDD)">
          <p>Une vigilance renforcée est appliquée dans les cas suivants : clients présentant un risque élevé, personnes politiquement exposées (PPE), transactions inhabituellement élevées, clients provenant de juridictions à haut risque. La vigilance renforcée inclut des vérifications d'identité supplémentaires, une justification de l'origine des fonds et une surveillance accrue des transactions.</p>
        </Section>

        <Section title="6. Déclaration d'Activité Suspecte">
          <p>Tout employé de Cazyno ayant connaissance d'une activité suspecte est tenu de la signaler immédiatement à l'officier de conformité. Les indicateurs d'activité suspecte incluent : des schémas de transaction inhabituels, des dépôts importants sans activité de jeu proportionnelle, des tentatives de structuration des transactions pour éviter les seuils de déclaration, et l'utilisation de multiples sources de financement sans justification.</p>
        </Section>

        <Section title="7. Conservation des Documents">
          <p>Tous les documents et enregistrements liés aux procédures KYC/AML sont conservés pendant une durée minimale de 10 ans après la fermeture du compte ou la dernière transaction. Cela inclut les copies des documents d'identité, les enregistrements de transactions, les rapports d'activité suspecte et les communications pertinentes.</p>
        </Section>

        <Section title="8. Formation du Personnel">
          <p>L'ensemble du personnel de Cazyno reçoit une formation régulière sur les procédures AML/KYC, la détection des activités suspectes et les obligations de déclaration. Les formations sont dispensées à l'embauche puis au minimum une fois par an, avec des mises à jour lors de changements réglementaires.</p>
        </Section>

        <Section title="9. Filtrage des Sanctions">
          <p>Cazyno procède au filtrage de tous les clients contre les listes de sanctions internationales, notamment : les listes de sanctions de l'ONU, les listes de l'Union Européenne, les listes de l'OFAC (États-Unis), et les listes nationales applicables. Tout match positif entraîne le gel immédiat du compte et un signalement aux autorités compétentes.</p>
        </Section>
      </div>
    </div>
  );
}
