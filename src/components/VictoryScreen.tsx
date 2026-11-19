import { useEffect, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Night7EndingCinematic } from './Night7EndingCinematic';

interface VictoryScreenProps {
  night: number;
  remainingPower: number;
  isNight6: boolean;
  isNight7?: boolean;
  isDefinitiveNight?: boolean;
  isSecretBrainrotNight?: boolean;
  fromNightSelector?: boolean;
  onContinue: () => void;
}

export function VictoryScreen({
  night,
  remainingPower,
  isNight6,
  isNight7 = false,
  isDefinitiveNight = false,
  isSecretBrainrotNight = false,
  fromNightSelector = false,
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
    <div className="relative w-full h-dvh bg-[#050403] flex justify-center p-4 sm:p-6 text-center overflow-y-auto overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-1000"
        style={{
          opacity: hourLabel === '6:00 AM' ? 0.45 : 0.12,
          background: isDefinitiveNight
            ? 'radial-gradient(circle at 50% 42%, rgba(239,68,68,0.34) 0%, rgba(127,29,29,0.16) 40%, transparent 72%)'
            : 'radial-gradient(circle at 50% 42%, rgba(251,191,36,0.32) 0%, rgba(120,65,12,0.14) 40%, transparent 72%)',
        }}
      />
      <div className="fixed inset-0 crt-scanlines opacity-55 pointer-events-none" />

      <div className="relative z-10 my-auto w-full max-w-lg space-y-4 sm:space-y-6 py-4">
        <div
          className={`font-display text-6xl sm:text-8xl font-bold tracking-wider transition-all duration-500 ${
            hourLabel === '6:00 AM' ? 'text-amber-300 scale-105' : 'text-zinc-400 scale-95'
          }`}
        >
          {hourLabel}
        </div>

        <p className="font-mono-tech text-xs sm:text-sm tracking-widest text-zinc-300">
          {isSecretBrainrotNight
            ? `NOCHE SECRETA COMPLETADA · OXÍGENO RESTANTE: ${remainingPower.toFixed(0)}%`
            : isDefinitiveNight
              ? `NOCHE DEFINITIVA (8/40) SUPERADA · BATERÍA RESTANTE: ${remainingPower.toFixed(0)}%`
              : `NOCHE ${night} COMPLETADA · BATERÍA RESTANTE: ${remainingPower.toFixed(0)}%`}
        </p>

        {isSecretBrainrotNight ? (
          <div className="border-2 border-amber-500/75 bg-amber-950/35 p-4 sm:p-5 text-left space-y-2">
            <h3 className="font-display text-xl sm:text-2xl text-amber-300 tracking-wide">
              ¡DESBLOQUEO SECRETO COMPLETADO!
            </h3>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed">
              Sobreviviste a la Segunda Oficina. Se han desbloqueado{' '}
              <strong className="text-amber-300">Glamrock Aura</strong> y{' '}
              <strong className="text-amber-300">Tralalero Faz-Shark</strong> en toda la sección de{' '}
              <strong>Extras</strong> (Modelos y Lore, Guía de Ataques y Jumpscares) y en{' '}
              <strong>Personalized Night</strong>, junto al selector entre la Oficina Principal y
              la Segunda Oficina.
            </p>
          </div>
        ) : isDefinitiveNight ? (
          <div className="border border-red-500/60 bg-red-950/30 p-4 sm:p-5 text-left space-y-2">
            <h3 className="font-display text-xl sm:text-2xl text-amber-300 tracking-wide">
              DESAFÍO SECRETO 8/40 COMPLETADO
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Activaste el código secreto <strong>1999</strong> en{' '}
              <strong>Personalized Night</strong> y sobreviviste a los 8 animatrónicos y jefes en{' '}
              <strong>Dificultad 40</strong>. Este reto no altera tu progreso oficial de campaña en
              Firebase.
            </p>
          </div>
        ) : isNight6 ? (
          <div className="border border-amber-500/40 bg-amber-950/20 p-4 sm:p-5 text-left space-y-2">
            <h3 className="font-display text-xl sm:text-2xl text-amber-300 tracking-wide">
              DEMOLICIÓN COMPLETADA · NOCHE 7 DESBLOQUEADA
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Sobreviviste las seis noches originales en los antiguos estudios de TV Azteca. Una
              última transmisión de Ricardo Salinas Pliego te aguarda en la{' '}
              <strong>Noche 7</strong> para desbloquear todo el archivo de <strong>Extras</strong>{' '}
              y <strong>Seleccionar Noche</strong>.
            </p>
          </div>
        ) : fromNightSelector ? (
          <p className="text-xs sm:text-sm font-mono-tech text-zinc-400">
            Progreso actualizado en Firebase: <strong className="text-amber-300">Noche {night}</strong>{' '}
            quedó registrada junto a <strong>Continuar</strong> en el Menú Principal.
          </p>
        ) : (
          <p className="text-xs sm:text-sm font-mono-tech text-zinc-400">
            Progreso guardado automáticamente en Firebase. Prepárate para la Noche {night + 1}.
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            soundEngine.playClick(760);
            onContinue();
          }}
          className="w-full sm:w-auto min-h-[44px] px-6 py-3 font-display text-lg sm:text-xl tracking-wider bg-zinc-100 text-black hover:bg-amber-300 transition-colors cursor-pointer"
        >
          {isSecretBrainrotNight || isDefinitiveNight || fromNightSelector
            ? 'Volver al Menú'
            : `Continuar a Noche ${night + 1}`}
        </button>
      </div>
    </div>
  );
}
