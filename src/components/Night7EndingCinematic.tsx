import { useEffect, useState } from 'react';
import { Flame, RotateCcw, SkipForward, Sparkles } from 'lucide-react';
import { OFFICE_ASSETS, TELECHOBIS, TelechobiId } from '../types/game';
import { StaticCanvas } from './StaticCanvas';
import { soundEngine } from '../audio/soundEngine';

interface Night7EndingCinematicProps {
  remainingPower: number;
  onContinue: () => void;
}

type CinematicPhase = '6am' | 'ignite' | 'burning' | 'souls' | 'epilogue';

interface FreedSoul {
  id: string;
  label: string;
  color: string;
  glow: string;
  leftPct: number;
  delaySec: number;
}

const FREED_SOULS: FreedSoul[] = [
  { id: 'omar', label: 'Omar Pacheco (Ton)', color: '#60a5fa', glow: 'rgba(96,165,250,0.9)', leftPct: 16, delaySec: 0.0 },
  { id: 'rocio', label: 'Rocío Lara (Toso)', color: '#4ade80', glow: 'rgba(74,222,128,0.9)', leftPct: 28, delaySec: 0.45 },
  { id: 'iris', label: 'Iris Flores (Nita)', color: '#fbbf24', glow: 'rgba(251,191,36,0.9)', leftPct: 40, delaySec: 0.85 },
  { id: 'saidda', label: 'Saidda Lara (Tis)', color: '#fb7185', glow: 'rgba(251,113,133,0.9)', leftPct: 52, delaySec: 1.25 },
  { id: 'beatriz', label: 'Beatriz', color: '#e9d5ff', glow: 'rgba(216,180,254,0.95)', leftPct: 64, delaySec: 1.65 },
  { id: 'alonso', label: 'Alonso Córdova (Árbol)', color: '#fdba74', glow: 'rgba(253,186,116,0.9)', leftPct: 75, delaySec: 2.05 },
  { id: 'set1', label: 'Alma · Ñon', color: '#fde047', glow: 'rgba(253,224,71,0.85)', leftPct: 34, delaySec: 2.45 },
  { id: 'set2', label: 'Alma · Champi', color: '#6ee7b7', glow: 'rgba(110,231,183,0.85)', leftPct: 84, delaySec: 2.85 },
];

const BURNING_SUITS: Array<{ id: TelechobiId; leftPct: number; scale: number }> = [
  { id: 'ton', leftPct: 14, scale: 0.88 },
  { id: 'toso', leftPct: 27, scale: 0.84 },
  { id: 'nita', leftPct: 39, scale: 0.85 },
  { id: 'tis', leftPct: 51, scale: 0.83 },
  { id: 'arbol', leftPct: 65, scale: 1.04 },
  { id: 'non', leftPct: 78, scale: 0.8 },
  { id: 'champi', leftPct: 89, scale: 0.82 },
];

const EMBERS = Array.from({ length: 24 }, (_, idx) => ({
  id: idx,
  leftPct: ((idx * 17 + 7) % 94) + 3,
  sizePx: 3 + (idx % 4) * 1.5,
  delaySec: (idx % 9) * 0.42,
  durationSec: 3.1 + (idx % 5) * 0.55,
}));

export function Night7EndingCinematic({
  remainingPower,
  onContinue,
}: Night7EndingCinematicProps) {
  const [phase, setPhase] = useState<CinematicPhase>('6am');
  const [hourLabel, setHourLabel] = useState<'5:59 AM' | '6:00 AM'>('5:59 AM');
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    setPhase('6am');
    setHourLabel('5:59 AM');
    soundEngine.stopAmbience();
    soundEngine.stopMaskBreathing();
    soundEngine.stopEndingFireSound();
    soundEngine.play6AMChime();

    const tClock = window.setTimeout(() => setHourLabel('6:00 AM'), 850);
    const tIgnite = window.setTimeout(() => {
      setPhase('ignite');
      soundEngine.playMatchIgnite();
      soundEngine.startEndingFireSound();
    }, 2400);
    const tBurn = window.setTimeout(() => {
      setPhase('burning');
    }, 7600);
    const tSouls = window.setTimeout(() => {
      setPhase('souls');
      soundEngine.playSoulReleaseChord();
    }, 13600);
    const tEpilogue = window.setTimeout(() => {
      setPhase('epilogue');
      soundEngine.stopEndingFireSound();
    }, 20800);

    return () => {
      window.clearTimeout(tClock);
      window.clearTimeout(tIgnite);
      window.clearTimeout(tBurn);
      window.clearTimeout(tSouls);
      window.clearTimeout(tEpilogue);
      soundEngine.stopEndingFireSound();
    };
  }, [replayKey]);

  const handleSkip = () => {
    soundEngine.playClick(720);
    soundEngine.stopEndingFireSound();
    setPhase('epilogue');
  };

  if (phase === '6am') {
    return (
      <div className="relative w-screen h-screen bg-[#050403] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{
            opacity: hourLabel === '6:00 AM' ? 0.5 : 0.14,
            background:
              'radial-gradient(circle at 50% 42%, rgba(251,191,36,0.34) 0%, rgba(120,65,12,0.14) 40%, transparent 72%)',
          }}
        />
        <div className="absolute inset-0 crt-scanlines opacity-55 pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div
            className={`font-display text-7xl sm:text-8xl font-bold tracking-wider transition-all duration-500 ${
              hourLabel === '6:00 AM' ? 'text-amber-300 scale-105' : 'text-zinc-400 scale-95'
            }`}
          >
            {hourLabel}
          </div>
          <p className="font-mono-tech text-xs sm:text-sm tracking-[0.26em] text-zinc-300 uppercase">
            NOCHE 7 SUPERADA · FIN DEL TURNO EN FORO 4
          </p>
        </div>
      </div>
    );
  }

  const fireIntensity = phase === 'ignite' ? 0.55 : phase === 'burning' ? 1 : 0.72;

  return (
    <div className="relative w-screen h-screen bg-[#070403] overflow-hidden flex flex-col justify-between select-none">
      {/* Studio backdrop transitioning into roaring blaze and dawn sky */}
      <img
        src={OFFICE_ASSETS.officeBg}
        alt="Foro 4 en llamas"
        referrerPolicy="no-referrer"
        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ${
          phase === 'ignite'
            ? 'brightness-[0.38] contrast-125 sepia-[0.35]'
            : phase === 'burning'
              ? 'brightness-[0.32] contrast-150 saturate-150 hue-rotate-[-12deg] scale-105'
              : phase === 'souls'
                ? 'brightness-[0.2] contrast-125 blur-[1px]'
                : 'brightness-[0.14] grayscale contrast-150'
        }`}
      />

      {/* Heat & dawn gradient atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background:
            phase === 'souls'
              ? 'linear-gradient(to top, rgba(185,28,28,0.68) 0%, rgba(120,53,15,0.42) 34%, rgba(15,23,42,0.82) 74%, rgba(30,58,138,0.45) 100%)'
              : phase === 'epilogue'
                ? 'radial-gradient(circle at 50% 38%, rgba(251,146,60,0.16) 0%, rgba(5,4,4,0.96) 72%)'
                : 'linear-gradient(to top, rgba(220,38,38,0.75) 0%, rgba(234,88,12,0.45) 35%, rgba(10,5,4,0.86) 82%)',
        }}
      />

      {/* Rising glowing embers */}
      {phase !== 'epilogue' && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
          {EMBERS.map((e) => (
            <span
              key={e.id}
              className="absolute bottom-0 rounded-full bg-amber-300 animate-ending-ember"
              style={{
                left: `${e.leftPct}%`,
                width: `${e.sizePx}px`,
                height: `${e.sizePx}px`,
                boxShadow: '0 0 8px 2px rgba(251,146,60,0.85)',
                animationDelay: `${e.delaySec}s`,
                animationDuration: `${e.durationSec}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Scene 1: Protagonist igniting fuel with gasoline can & match */}
      {phase === 'ignite' && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-end justify-center pb-24 sm:pb-28">
          <div className="relative flex flex-col items-center">
            {/* Match spark flash */}
            <div
              className="w-24 h-24 rounded-full animate-pulse mb-2"
              style={{
                background:
                  'radial-gradient(circle, rgba(254,240,138,0.95) 0%, rgba(249,115,22,0.6) 45%, transparent 75%)',
              }}
            />
            {/* Silhouette of the night guard pouring gasoline and dropping the match */}
            <svg
              viewBox="0 0 260 210"
              aria-hidden="true"
              className="w-64 sm:w-80 h-auto drop-shadow-[0_0_28px_rgba(249,115,22,0.65)]"
            >
              {/* Protagonist silhouette */}
              <circle cx="110" cy="48" r="20" fill="#0c0a09" stroke="#f59e0b" strokeWidth="1.5" />
              {/* Guard cap visor */}
              <path d="M 92 40 L 136 37 L 134 45 L 90 45 Z" fill="#1c1917" />
              {/* Torso & coat */}
              <path
                d="M 80 72 Q 110 66 138 72 L 146 155 L 74 155 Z"
                fill="#0c0a09"
                stroke="#ea580c"
                strokeWidth="1.3"
              />
              {/* Arm holding red gasoline can */}
              <path d="M 82 82 L 54 112 L 66 120 L 92 92 Z" fill="#14110f" />
              <rect
                x="26"
                y="108"
                width="34"
                height="44"
                rx="4"
                fill="#991b1b"
                stroke="#fca5a5"
                strokeWidth="1.5"
              />
              <path d="M 56 116 L 76 128" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" />
              {/* Extended arm dropping lit match */}
              <path d="M 134 80 L 188 94 L 185 104 L 130 92 Z" fill="#14110f" />
              <line x1="188" y1="98" x2="198" y2="112" stroke="#fef08a" strokeWidth="2.5" />
              <circle cx="199" cy="116" r="6" fill="#fb923c" />
              {/* Pool of igniting fuel on studio floor */}
              <ellipse cx="195" cy="186" rx="54" ry="12" fill="rgba(249,115,22,0.8)" />
              <ellipse cx="195" cy="184" rx="34" ry="7" fill="rgba(254,240,138,0.9)" />
            </svg>
          </div>
        </div>
      )}

      {/* Scene 2: Burning Telechobis & Night 7 Entities inside the flames */}
      {phase === 'burning' && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {BURNING_SUITS.map((suit, idx) => (
            <div
              key={suit.id}
              className="absolute bottom-14 -translate-x-1/2 transition-opacity duration-1000"
              style={{
                left: `${suit.leftPct}%`,
                transform: `translateX(-50%) scale(${suit.scale})`,
                opacity: 0.78,
                filter: 'brightness(0.18) sepia(1) hue-rotate(-28deg) saturate(4) drop-shadow(0 0 18px rgba(239,68,68,0.9))',
                animationDelay: `${idx * 0.12}s`,
              }}
            >
              <img
                src={TELECHOBIS[suit.id].spritePath}
                alt={TELECHOBIS[suit.id].name}
                referrerPolicy="no-referrer"
                className="h-44 sm:h-60 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      )}

      {/* Scene 3: Freed Souls ascending peacefully above the ashes */}
      {phase === 'souls' && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {FREED_SOULS.map((soul) => (
            <div
              key={soul.id}
              className="absolute bottom-24 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-ending-soul"
              style={{
                left: `${soul.leftPct}%`,
                animationDelay: `${soul.delaySec}s`,
              }}
            >
              <div
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle, #ffffff 10%, ${soul.color} 55%, transparent 78%)`,
                  boxShadow: `0 0 28px 10px ${soul.glow}`,
                }}
              >
                <Sparkles className="w-4 h-4 text-white/90" />
              </div>
              <span className="px-2 py-0.5 bg-black/65 border border-white/20 font-mono-tech text-[9px] sm:text-[10px] text-zinc-100 whitespace-nowrap">
                {soul.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Layered animated wall of fire along bottom */}
      {phase !== 'epilogue' && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-44 sm:h-56 z-15 transition-opacity duration-1000"
          style={{ opacity: fireIntensity }}
        >
          <svg
            viewBox="0 0 1200 260"
            preserveAspectRatio="none"
            className="w-full h-full animate-ending-flame origin-bottom"
          >
            <defs>
              <linearGradient id="fireGradOuter" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#991b1b" />
                <stop offset="55%" stopColor="#ea580c" stopOpacity="0.92" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="fireGradInner" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="55%" stopColor="#fde047" stopOpacity="0.88" />
                <stop offset="100%" stopColor="#fef9c3" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 260 L0 150 Q65 40 130 140 Q190 15 260 135 Q325 35 395 145 Q470 10 540 130 Q620 25 695 140 Q765 20 845 135 Q925 30 1000 140 Q1080 25 1145 135 L1200 155 L1200 260 Z"
              fill="url(#fireGradOuter)"
            />
            <path
              d="M0 260 L0 185 Q80 95 155 180 Q240 65 320 175 Q410 85 495 180 Q580 55 660 175 Q745 80 830 180 Q915 70 995 175 Q1085 85 1150 180 L1200 185 L1200 260 Z"
              fill="url(#fireGradInner)"
            />
          </svg>
        </div>
      )}

      {/* Analog VHS scanlines & static overlay */}
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-35 z-20">
        <StaticCanvas intensity={phase === 'epilogue' ? 0.16 : 0.28} tint="neutral" />
      </div>
      <div className="pointer-events-none absolute inset-0 crt-scanlines opacity-55 z-20" />
      <div className="pointer-events-none absolute inset-0 crt-vignette z-20" />

      {/* Top VHS Stamp + Skip Button */}
      <header className="relative z-30 flex items-center justify-between px-5 sm:px-8 pt-5">
        <div className="inline-flex items-center gap-2 bg-black/75 border border-amber-500/40 px-3 py-1 font-mono-tech text-[11px] text-amber-200">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>CINTA FINAL · 1999/11/15 · 06:00 AM</span>
        </div>

        {phase !== 'epilogue' && (
          <button
            type="button"
            onClick={handleSkip}
            className="px-3.5 py-1.5 bg-black/80 border border-[#5c4838] hover:border-amber-400 text-[#e5dcc8] font-mono-tech text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Saltar Cinemática</span>
          </button>
        )}
      </header>

      {/* Center Epilogue Card (Phase 4) */}
      {phase === 'epilogue' ? (
        <main className="relative z-30 my-auto px-4 sm:px-6 flex justify-center">
          <div className="max-w-xl w-full rust-panel-90s border-2 border-amber-500/50 p-6 sm:p-8 text-center space-y-5 shadow-[0_24px_80px_rgba(0,0,0,0.96)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-950/75 border border-orange-500/60 font-mono-tech text-[11px] text-amber-200">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>FORO 4 REDUCIDO A CENIZAS · ALMAS LIBERADAS</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl text-[#f3ebd5] tracking-wider leading-none">
              FIN DE TELECHOBIS LAND
            </h2>

            <p className="font-mono-tech text-xs text-amber-300 tracking-widest">
              NOCHE 7 COMPLETADA · BATERÍA RESTANTE: {remainingPower.toFixed(0)}%
            </p>

            <div className="border border-red-500/45 bg-black/65 p-4 text-left space-y-2">
              <p className="text-xs sm:text-sm text-[#e5dcc8] leading-relaxed">
                El fuego consumió las botargas selladas, las cintas ocultas y el pacto de{' '}
                <strong className="text-amber-300">Alonso Córdova</strong>. Las almas de{' '}
                <strong className="text-amber-200">Omar, Rocío, Iris, Saidda y Beatriz</strong>{' '}
                quedaron libres entre el humo del amanecer.
              </p>
              <p className="text-xs text-emerald-300 font-mono-tech">
                ✓ Extras, Seleccionar Noche (1–7) y Personalized Night (8 enemigos) desbloqueados.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(640);
                  setReplayKey((k) => k + 1);
                }}
                className="px-4 py-3 bg-[#1d1a16] border border-[#5c4838] text-[#e5dcc8] hover:border-amber-400 font-mono-tech text-xs inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ver Cinemática de Nuevo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(780);
                  soundEngine.stopEndingFireSound();
                  onContinue();
                }}
                className="flex-1 px-6 py-3 font-display text-xl tracking-wider bg-[#c9bfa4] text-black hover:bg-amber-300 transition-colors cursor-pointer"
              >
                Volver al Menú (Ir a Extras)
              </button>
            </div>
          </div>
        </main>
      ) : (
        <div />
      )}

      {/* Bottom Cinematic Subtitle Bar during Scenes 1–3 */}
      {phase !== 'epilogue' ? (
        <footer className="relative z-30 px-4 sm:px-10 pb-8 flex justify-center">
          <div className="max-w-2xl w-full bg-black/82 border border-[#5c4838] px-5 py-3.5 text-center shadow-2xl">
            <p className="font-mono-tech text-xs sm:text-sm text-[#f3ebd5] leading-relaxed">
              {phase === 'ignite' &&
                '06:00 AM · El guardia rocía gasolina por todo el Foro 4 y enciende el último fósforo para terminar con la maldición de TV Azteca.'}
              {phase === 'burning' &&
                'Las llamas devoran las botargas selladas, el escenario y el pacto entre Alonso Córdova y El Charro Negro.'}
              {phase === 'souls' &&
                'Entre las brasas del estudio incendiado, las almas de Omar, Rocío, Iris, Saidda, Beatriz y del set ascienden libres hacia la luz.'}
            </p>
          </div>
        </footer>
      ) : (
        <div className="pb-4" />
      )}
    </div>
  );
}
