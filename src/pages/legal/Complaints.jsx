const bg='#080c12', crd='#111a25', b='#1a2a38', g='#00e701', s='#94a3b8', m='#4b5c6f';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-orbitron font-black mb-3" style={{color:g}}>{title}</h2>
    <div className="text-[13px] leading-relaxed space-y-3" style={{color:s}}>{children}</div>
  </div>
);

const STEPS = [
  { step: '1', title: 'Identifiez votre réclamation', desc: 'Rassemblez toutes les informations pertinentes : numéro de transaction, captures d\'écran, dates et heures, description détaillée du problème.' },
  { step: '2', title: 'Contactez le support', desc: 'Envoyez votre réclamation par e-mail à complaints@cazyno.com ou via le formulaire dédié dans votre espace personnel. Précisez "RÉCLAMATION" dans l\'objet.' },
  { step: '3', title: 'Accusé de réception', desc: 'Vous recevrez un accusé de réception sous 48 heures avec un numéro de dossier unique pour le suivi de votre réclamation.' },
  { step: '4', title: 'Traitement', desc: 'Notre équipe examine votre dossier et peut vous contacter pour des informations complémentaires. Le délai de traitement standard est de 14 jours.' },
  { step: '5', title: 'Résolution', desc: 'Vous recevez une réponse détaillée avec la décision prise et, le cas échéant, les mesures correctives appliquées.' },
];

export default function Complaints() {
  return (
    <div className="w-full">
      <div className="rounded-2xl p-8" style={{background:crd,border:`1px solid ${b}`}}>
        <h1 className="text-2xl font-orbitron font-black mb-2" style={{color:g}}>Procédure de Réclamation</h1>
        <p className="text-sm mb-8" style={{color:m}}>Nous prenons chaque réclamation au sérieux et nous nous engageons à résoudre vos problèmes rapidement.</p>

        <Section title="Comment Déposer une Réclamation">
          <p>Si vous n'êtes pas satisfait de nos services ou si vous pensez qu'une erreur a été commise, vous avez le droit de déposer une réclamation formelle. Nous vous encourageons à d'abord contacter notre support client via le chat en direct pour une résolution rapide. Si le problème persiste, suivez la procédure ci-dessous.</p>
        </Section>

        <Section title="Étapes de la Procédure">
          <div className="space-y-3 mt-2">
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

        <Section title="Processus de Résolution Interne">
          <p>Chaque réclamation est examinée par un membre dédié de notre équipe de conformité. L'examen prend en compte l'historique de votre compte, les logs techniques, les enregistrements de transaction et tout autre élément pertinent. Notre objectif est de parvenir à une résolution juste et transparente.</p>
          <p>Si des informations supplémentaires sont nécessaires, nous vous contacterons par e-mail. Votre coopération est essentielle pour accélérer le processus de résolution.</p>
        </Section>

        <Section title="Délais">
          <div className="rounded-xl p-4 space-y-2" style={{background:bg,border:`1px solid ${b}`}}>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{color:'#fff'}}>Accusé de réception</span>
              <span className="text-sm font-mono" style={{color:g}}>48 heures</span>
            </div>
            <div style={{borderTop:`1px solid ${b}`}} />
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{color:'#fff'}}>Résolution standard</span>
              <span className="text-sm font-mono" style={{color:g}}>14 jours</span>
            </div>
            <div style={{borderTop:`1px solid ${b}`}} />
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{color:'#fff'}}>Cas complexes (maximum)</span>
              <span className="text-sm font-mono" style={{color:g}}>30 jours</span>
            </div>
          </div>
        </Section>

        <Section title="Escalade vers un Organisme Externe">
          <p>Si vous n'êtes pas satisfait de la résolution proposée par Cazyno, vous avez le droit de soumettre votre réclamation à un organisme externe indépendant :</p>
          <div className="rounded-xl p-4 mt-2" style={{background:bg,border:`1px solid ${b}`}}>
            <h3 className="font-bold text-sm mb-2" style={{color:'#fff'}}>Curaçao Gaming Authority</h3>
            <p>En tant qu'autorité de régulation de Cazyno, la Curaçao Gaming Authority peut examiner votre plainte de manière indépendante.</p>
            <p className="mt-2">Site web : <span style={{color:g}}>www.curacao-egaming.com</span></p>
            <p>E-mail : <span style={{color:g}}>complaints@curacao-egaming.com</span></p>
          </div>
          <p>Avant de soumettre votre réclamation à l'organisme externe, assurez-vous d'avoir complété la procédure interne et d'inclure votre numéro de dossier Cazyno.</p>
        </Section>

        <Section title="Contact Direct">
          <p>E-mail réclamations : <span style={{color:g}}>complaints@cazyno.com</span></p>
          <p>Support général : <span style={{color:g}}>support@cazyno.com</span></p>
          <p>Adresse postale : Cazyno N.V., Kaya Richard J. Beaujon z/n, Willemstad, Curaçao</p>
        </Section>
      </div>
    </div>
  );
}
