import { useEffect } from 'react';
import { StaticCanvas } from './StaticCanvas';
import { soundEngine } from '../audio/soundEngine';

import { CustomNightLaunchConfig } from '../types/game';

interface NightIntroScreenProps {
  night: number;
  launchConfig?: CustomNightLaunchConfig;
  onReady: () => void;
}

export function NightIntroScreen({ night, launchConfig, onReady }: NightIntroScreenProps) {
  useEffect(() => {
    soundEngine.preloadNightSfx();
    soundEngine.playNightStartCue();
    const timer = window.setTimeout(onReady, 2600);
    return () => window.clearTimeout(timer);
  }, [onReady]);

  const title = launchConfig?.title || `NOCHE ${night}`;
  const minutes = launchConfig ? launchConfig.durationMinutes : null;
  const locationLabel =
    launchConfig?.isSecretBrainrotNight || launchConfig?.officeId === 'second'
      ? 'Segunda Oficina'
      : 'Estudios Abandonados TV Azteca';

  return (
    <div className="relative w-full h-dvh bg-[#040405] flex flex-col items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 opacity-35 pointer-events-none mix-blend-screen">
        <StaticCanvas intensity={0.22} />
      </div>
      <div className="absolute inset-0 crt-scanlines opacity-70 pointer-events-none" />
      <div className="absolute inset-0 crt-vignette pointer-events-none" />

      <div className="relative z-10 text-center space-y-2 animate-crt-flicker max-w-2xl">
        <p className="font-mono-tech text-sm sm:text-lg tracking-widest text-zinc-400">12:00 AM</p>
        <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-wider text-[#efe7d2] break-words">
          {title}
        </h2>
        <p className="font-mono-tech text-[11px] sm:text-xs text-zinc-400 pt-2 leading-relaxed">
          {minutes !== null
            ? `Duración configurada: ${minutes} min · ${locationLabel}`
            : `${locationLabel} · 1999`}
        </p>
      </div>
    </div>
  );
}
