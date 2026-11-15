import { useEffect } from 'react';
import { JumpscareSource, TELECHOBIS, TelechobiId } from '../types/game';
import { CobwebCorner, TelechobiSprite } from './TelechobiArt';
import { StaticCanvas } from './StaticCanvas';
import { soundEngine } from '../audio/soundEngine';

interface JumpscareOverlayProps {
  killer: TelechobiId;
  source: JumpscareSource;
  night: number;
  phase: 'JUMPSCARE' | 'GAME_OVER';
  onJumpscareDone: () => void;
  onRetryNight: () => void;
  onBackToMenu: () => void;
}

const JUMPSCARE_ANIM_MAP: Record<JumpscareSource, Record<TelechobiId, string>> = {
  door: {
    ton: 'animate-jumpscare-door-ton',
    toso: 'animate-jumpscare-door-toso',
    nita: 'animate-jumpscare-door-nita',
    tis: 'animate-jumpscare-door-tis',
  },
  hallway: {
    ton: 'animate-jumpscare-hall-ton',
    toso: 'animate-jumpscare-hall-toso',
    nita: 'animate-jumpscare-hall-nita',
    tis: 'animate-jumpscare-hall-tis',
  },
};

export function JumpscareOverlay({
  killer,
  source,
  night,
  phase,
  onJumpscareDone,
  onRetryNight,
  onBackToMenu,
}: JumpscareOverlayProps) {
  const meta = TELECHOBIS[killer];
  const animClass = JUMPSCARE_ANIM_MAP[source][killer];

  useEffect(() => {
    if (phase === 'JUMPSCARE') {
      soundEngine.stopAmbience();
      soundEngine.stopMaskBreathing();
      soundEngine.playJumpscare(killer, source);
      const t = window.setTimeout(onJumpscareDone, 1480);
      return () => window.clearTimeout(t);
    }
  }, [phase, killer, source, onJumpscareDone]);

  if (phase === 'JUMPSCARE') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
        {/* Doorframe vs Hallway perspective framing during Jumpscare */}
        <div
          className={`pointer-events-none absolute inset-0 ${
            source === 'door'
              ? 'bg-[radial-gradient(circle_at_50%_45%,rgba(80,12,12,0.22),rgba(0,0,0,0.96)_76%)]'
              : 'bg-[radial-gradient(circle_at_50%_50%,rgba(120,25,15,0.28),rgba(0,0,0,0.94)_80%)]'
          }`}
        />

        <div className={`w-full h-full flex items-center justify-center ${animClass}`}>
          <TelechobiSprite
            id={killer}
            variant="jumpscare"
            jumpscareSource={source}
            className="h-[108vh] w-auto"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 crt-scanlines opacity-55" />
        <div className="pointer-events-none absolute inset-0 bg-red-950/25 mix-blend-screen" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 opacity-75 pointer-events-none">
        <StaticCanvas intensity={0.62} tint="red" />
      </div>
      <div className="absolute inset-0 crt-scanlines opacity-75 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full rust-panel-90s border-2 p-8 text-center space-y-5 shadow-2xl overflow-hidden">
        <CobwebCorner position="top-left" />
        <CobwebCorner position="bottom-right" />

        <p className="font-mono-tech text-xs tracking-widest text-red-400">
          SEÑAL PERDIDA · NOCHE {night} ·{' '}
          {source === 'door' ? 'EMBOSCADA EN PUERTA' : 'ASALTO EN PASILLO CENTRAL'}
        </p>
        <h2 className="font-display text-5xl font-bold tracking-wider text-[#ebe3ce]">
          FIN DEL TURNO
        </h2>
        <p className="text-sm text-[#cfc6b0] leading-relaxed">
          Fuiste capturado por <strong>{meta.name}</strong>{' '}
          {source === 'door'
            ? 'al no sellar a tiempo la compuerta metálica.'
            : 'al no colocarte la máscara en el pasillo central.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(740);
              onRetryNight();
            }}
            className="flex-1 py-3 px-4 font-display text-lg tracking-wider bg-[#c9bfa4] text-black hover:bg-amber-300 border border-[#5e533e] transition-colors cursor-pointer"
          >
            Reintentar Noche {night}
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(540);
              onBackToMenu();
            }}
            className="flex-1 py-3 px-4 font-display text-lg tracking-wider bg-[#1d1a16] border border-[#5c4838] text-[#e5dcc8] hover:bg-[#2a241d] transition-colors cursor-pointer"
          >
            Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
}
