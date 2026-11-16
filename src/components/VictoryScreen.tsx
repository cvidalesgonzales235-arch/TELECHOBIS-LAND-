import { useEffect, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Night7EndingCinematic } from './Night7EndingCinematic';

interface VictoryScreenProps {
  night: number;
  remainingPower: number;
  isNight6: boolean;
  isNight7?: boolean;
  isDefinitiveNight?: boolean;
  onContinue: () => void;
}

export function VictoryScreen({
  night,
  remainingPower,
  isNight6,
  isNight7 = false,
  isDefinitiveNight = false,
  onContinue,
}: VictoryScreenProps) {
  const [hourLabel, setHourLabel] = useState<'5:59 AM' | '6:00 AM'>('5:59 AM');

  useEffect(() => {
    if (isNight7) return;
    soundEngine.stopAmbience();
    soundEngine.stopMaskBreathing();
    soundEngine.play6AMChime();

    const rollTimer = window.setTimeout(() => {
      setHourLabel('6:00 AM');
    }, 900);

    return () => window.clearTimeout(rollTimer);
  }, [isNight7]);

  if (isNight7) {
    return (
      <Night7EndingCinematic
        remainingPower={remainingPower}
        onContinue={onContinue}
      />
    );
  }

  return (
    <div className="relative w-screen h-screen bg-[#050403] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          opacity: hourLabel === '6:00 AM' ? 0.45 : 0.12,
          background: isDefinitiveNight
            ? 'radial-gradient(circle at 50% 42%, rgba(239,68,68,0.34) 0%, rgba(127,29,29,0.16) 40%, transparent 72%)'
            : 'radial-gradient(circle at 50% 42%, rgba(251,191,36,0.32) 0%, rgba(120,65,12,0.14) 40%, transparent 72%)',
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
          {isDefinitiveNight
            ? `NOCHE DEFINITIVA (8/40) SUPERADA · BATERÍA RESTANTE: ${remainingPower.toFixed(0)}%`
            : `NOCHE ${night} COMPLETADA · BATERÍA RESTANTE: ${remainingPower.toFixed(0)}%`}
        </p>

        {isDefinitiveNight ? (
          <div className="border border-red-500/60 bg-red-950/30 p-5 text-left space-y-2">
            <h3 className="font-display text-2xl text-amber-300 tracking-wide">
              DESAFÍO SECRETO 8/40 COMPLETADO
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Sobreviviste a los 8 animatrónicos y jefes en <strong>Dificultad 40</strong> desde el
              archivo secreto de Extras. Este reto es independiente y no altera tu progreso oficial
              de campaña en Firebase.
            </p>
          </div>
        ) : isNight6 ? (
          <div className="border border-amber-500/40 bg-amber-950/20 p-5 text-left space-y-2">
            <h3 className="font-display text-2xl text-amber-300 tracking-wide">
              DEMOLICIÓN COMPLETADA · NOCHE 7 DESBLOQUEADA
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Sobreviviste las seis noches originales en los antiguos estudios de TV Azteca. Una
              última transmisión de Ricardo Salinas Pliego te aguarda en la{' '}
              <strong>Noche 7</strong> para desbloquear todo el archivo de <strong>Extras</strong>{' '}
              y <strong>Seleccionar Noche</strong>.
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
          {isDefinitiveNight ? 'Volver al Menú' : `Continuar a Noche ${night + 1}`}
        </button>
      </div>
    </div>
  );
}
