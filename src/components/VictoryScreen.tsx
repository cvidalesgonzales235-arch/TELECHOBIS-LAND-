import { useEffect, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';

interface VictoryScreenProps {
  night: number;
  remainingPower: number;
  isNight6: boolean;
  onContinue: () => void;
}

export function VictoryScreen({
  night,
  remainingPower,
  isNight6,
  onContinue,
}: VictoryScreenProps) {
  const [hourLabel, setHourLabel] = useState<'5:59 AM' | '6:00 AM'>('5:59 AM');

  useEffect(() => {
    soundEngine.stopAmbience();
    soundEngine.stopMaskBreathing();
    soundEngine.play6AMChime();

    const rollTimer = window.setTimeout(() => {
      setHourLabel('6:00 AM');
    }, 900);

    return () => window.clearTimeout(rollTimer);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#050403] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: hourLabel === '6:00 AM' ? 0.45 : 0.12,
          background:
            'radial-gradient(circle at 50% 42%, rgba(251,191,36,0.32) 0%, rgba(120,65,12,0.14) 40%, transparent 72%)',
        }}
      />
      <div className="absolute inset-0 crt-scanlines opacity-55 pointer-events-none" />

      <div className="relative z-10 max-w-lg space-y-6">
        <div
          className={`font-display text-7xl sm:text-8xl font-bold tracking-wider transition-all duration-500 ${
            hourLabel === '6:00 AM' ? 'text-amber-300 scale-105' : 'text-zinc-400 scale-95'
          }`}
        >
          {hourLabel}
        </div>

        <p className="font-mono-tech text-sm tracking-widest text-zinc-300">
          NOCHE {night} COMPLETADA · BATERÍA RESTANTE: {remainingPower.toFixed(0)}%
        </p>

        {isNight6 ? (
          <div className="border border-amber-500/40 bg-amber-950/20 p-5 text-left space-y-2">
            <h3 className="font-display text-2xl text-amber-300 tracking-wide">
              DEMOLICIÓN COMPLETADA · EXTRAS DESBLOQUEADOS
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Sobreviviste las seis noches en los antiguos estudios de TV Azteca. El menú de{' '}
              <strong>Extras</strong> ya está desbloqueado en Firebase con los modelos 3D,
              jumpscares y archivos confidenciales de la demanda de la BBC.
            </p>
          </div>
        ) : (
          <p className="text-sm font-mono-tech text-zinc-400">
            Progreso guardado automáticamente en Firebase. Prepárate para la Noche {night + 1}.
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick(760);
            onContinue();
          }}
          className="px-6 py-3 font-display text-xl tracking-wider bg-zinc-100 text-black hover:bg-amber-300 transition-colors cursor-pointer"
        >
          {isNight6 ? 'Volver al Menú (Ir a Extras)' : `Continuar a Noche ${night + 1}`}
        </button>
      </div>
    </div>
  );
}
