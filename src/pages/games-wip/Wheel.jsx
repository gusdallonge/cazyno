import { useRef } from 'react';
import { RotateCw } from 'lucide-react';
import GameTemplate, { NEON } from '../../components/GameTemplate';

export default function Wheel() {
  const templateRef = useRef();

  return (
    <GameTemplate
      ref={templateRef}
      title="WHEEL"
      subtitle="Bientot disponible"
      gameKey="wheel"
      onPlay={({ bet }) => {
        // TODO: implementer la logique du jeu
        console.log('Play', bet);
      }}
    >
      <div className="rounded-3xl flex items-center justify-center py-20"
        style={{ background: '#111a25', border: '1px solid #1a2a38', minHeight: 300 }}>
        <div className="text-center">
          <RotateCw className="w-16 h-16 mx-auto mb-4 text-[#00e701]" />
          <p className="font-orbitron font-black text-xl text-white mb-2">WHEEL</p>
          <p className="text-sm" style={{ color: '#4b5c6f' }}>Jeu en cours de developpement</p>
        </div>
      </div>
    </GameTemplate>
  );
}
