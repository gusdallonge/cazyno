import { useRef } from 'react';
import { ArrowUpDown } from 'lucide-react';
import GameTemplate, { NEON } from '../../components/GameTemplate';

export default function HiLo() {
  const templateRef = useRef();

  return (
    <GameTemplate
      ref={templateRef}
      title="HI-LO"
      subtitle="Bientot disponible"
      gameKey="hilo"
      onPlay={({ bet }) => {
        // TODO: implementer la logique du jeu
        console.log('Play', bet);
      }}
    >
      <div className="rounded-3xl flex items-center justify-center py-20"
        style={{ background: '#111a25', border: '1px solid #1a2a38', minHeight: 300 }}>
        <div className="text-center">
          <ArrowUpDown className="w-16 h-16 mx-auto mb-4 text-[#00e701]" />
          <p className="font-orbitron font-black text-xl text-white mb-2">HI-LO</p>
          <p className="text-sm" style={{ color: '#4b5c6f' }}>Jeu en cours de developpement</p>
        </div>
      </div>
    </GameTemplate>
  );
}
