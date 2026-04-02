export default function BonusFlyer() {
  const bonuses = [
    { title: 'BONUS 100%', amount: 'Jusqu\'à 10 000 €', desc: 'Tu déposes 100 €, on t\'en donne 100 de plus.', wager: '×30' },
    { title: 'BONUS 200%', amount: 'Jusqu\'à 5 000 €', desc: 'Dépôt de 100 € = 300 € dans ta poche.', wager: '×35' },
    { title: 'BONUS 300%', amount: 'Jusqu\'à 2 500 €', desc: 'Dépôt de 100 € = 400 € crédités.', wager: '×37' },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="text-center">
        <h2 className="font-orbitron text-2xl sm:text-3xl font-black text-primary">NOS BONUS</h2>
        <p className="text-xs sm:text-sm text-[#94a3b8] mt-1">Jusqu'à 17 500 € à gagner</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {bonuses.map((b, i) => (
          <div key={i} className="bg-gradient-to-br from-surface to-card border border-[#1a2a38]/50 rounded-2xl p-4 sm:p-5 hover:border-[rgba(0,231,1,0.5)] transition-all">
            <h3 className="font-orbitron font-black text-lg sm:text-xl text-primary mb-1">{b.title}</h3>
            <p className="text-xs sm:text-sm font-bold text-primary/80 mb-2">{b.amount}</p>
            <p className="text-xs text-[#94a3b8] mb-3 leading-snug">{b.desc}</p>
            <div className="flex items-center justify-between pt-3 border-t border-[#1a2a38]/30">
              <span className="text-[10px] sm:text-xs text-[#94a3b8]/70">Mise: {b.wager}</span>
              <a href="/TopUpPayment" className="text-xs sm:text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                → Déposer
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-[rgba(0,231,1,0.3)] rounded-2xl p-4 sm:p-5 text-center">
        <p className="text-xs sm:text-sm font-bold text-primary mb-2">JEUX BONUS EXCLUSIFS</p>
        <p className="text-xs text-[#94a3b8] mb-3">Déverrouille des jeux spéciaux et gagne jusqu'à ×1000</p>
        <a href="/Casino" className="inline-block px-4 py-2 rounded-lg bg-[#00e701] text-primary-foreground font-orbitron font-bold text-xs sm:text-sm hover:brightness-110 transition-all active:scale-95">
          Voir les jeux →
        </a>
      </div>
    </div>
  );
}