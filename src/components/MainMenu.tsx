import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { Lock, LogIn, LogOut, Volume2, VolumeX } from 'lucide-react';
import { OFFICE_ASSETS, PlayerSave, TelechobiId } from '../types/game';
import { StaticCanvas } from './StaticCanvas';
import { CobwebCorner, TelechobiSprite } from './TelechobiArt';
import { soundEngine } from '../audio/soundEngine';
import { getContinueNight } from '../firebase/client';

interface MainMenuProps {
  user: User | null;
  authLoading: boolean;
  playerSave: PlayerSave | null;
  saveLoading: boolean;
  authError: string | null;
  muted: boolean;
  onToggleMute: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  onNewGame: () => void;
  onContinue: () => void;
  onSelectNight: () => void;
  onOpenExtras: () => void;
}

const MENU_ROSTER: TelechobiId[] = ['ton', 'toso', 'nita', 'tis'];

export function MainMenu({
  user,
  authLoading,
  playerSave,
  saveLoading,
  authError,
  muted,
  onToggleMute,
  onSignIn,
  onSignOut,
  onNewGame,
  onContinue,
  onSelectNight,
  onOpenExtras,
}: MainMenuProps) {
  const [activeChar, setActiveChar] = useState<TelechobiId>('ton');
  const [twitchState, setTwitchState] = useState<number>(0);
  const [staticBurst, setStaticBurst] = useState<number>(0.24);
  const [hoveredIdx, setHoveredIdx] = useState<number>(0);

  // Authentic FNAF-style erratic animatronic twitching + VHS static spikes + Menu OST
  useEffect(() => {
    soundEngine.startAmbience('menu');
    soundEngine.startMenuMusic();
    soundEngine.preloadNightSfx();

    let timerId = 0;
    const scheduleTwitch = () => {
      const waitMs = 1400 + Math.random() * 2800;
      timerId = window.setTimeout(() => {
        const roll = Math.random();
        if (roll < 0.45) {
          // Rapid head jerk & endo flash
          setTwitchState(1);
          setStaticBurst(0.55);
          soundEngine.playStaticBurst(0.14, 0.08);
          window.setTimeout(() => {
            setTwitchState(Math.random() < 0.5 ? 2 : 3);
            setActiveChar(MENU_ROSTER[Math.floor(Math.random() * MENU_ROSTER.length)]);
          }, 70);
          window.setTimeout(() => {
            setTwitchState(0);
            setActiveChar('ton');
            setStaticBurst(0.24);
          }, 210);
        } else if (roll < 0.75) {
          // Brief static tear + secondary Telechobi silhouette flash
          setTwitchState(2);
          setActiveChar(MENU_ROSTER[1 + Math.floor(Math.random() * 3)]);
          setStaticBurst(0.46);
          window.setTimeout(() => {
            setTwitchState(0);
            setActiveChar('ton');
            setStaticBurst(0.24);
          }, 120);
        } else {
          // Black eye sockets stare
          setTwitchState(3);
          window.setTimeout(() => setTwitchState(0), 280);
        }
        scheduleTwitch();
      }, waitMs);
    };

    scheduleTwitch();
    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  const canContinue = Boolean(user && playerSave && !saveLoading);
  const progressionUnlocked = Boolean(
    user && (playerSave?.extrasUnlocked || playerSave?.night7Completed)
  );

  return (
    <div className="relative w-full min-h-dvh h-dvh bg-[#040405] overflow-y-auto overflow-x-hidden flex flex-col justify-between">
      <CobwebCorner position="top-left" className="w-16 sm:w-24 h-16 sm:h-24 opacity-45 z-20" />
      <CobwebCorner position="bottom-right" className="w-16 sm:w-24 h-16 sm:h-24 opacity-40 z-20" />

      {/* Right-Side Looming Animatronics Portrait (FNAF 1 menu composition with all 4 extracted Telechobis) */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-[75%] md:w-[68%] flex items-center justify-end pointer-events-none">
        {/* Faint shadowed silhouettes of Toso, Nita & Tis lurking behind Ton */}
        <div className="hidden sm:flex absolute inset-y-0 right-10 w-[440px] lg:w-[640px] items-end justify-between opacity-25">
          <TelechobiSprite id="toso" variant="menu" className="w-36 lg:w-48 h-[68dvh] lg:h-[72dvh]" />
          <TelechobiSprite id="nita" variant="menu" className="w-36 lg:w-48 h-[72dvh] lg:h-[76dvh]" />
          <TelechobiSprite id="tis" variant="menu" className="w-36 lg:w-48 h-[66dvh] lg:h-[70dvh]" />
        </div>

        {/* Primary Looming Twitching Bust on the Right */}
        <div
          className={`relative w-[78vw] max-w-[380px] sm:max-w-none sm:w-[440px] md:w-[500px] lg:w-[660px] h-[78dvh] sm:h-[90dvh] max-h-[820px] opacity-60 sm:opacity-100 transition-transform duration-75 ${
            twitchState === 1 ? 'translate-x-2 -translate-y-1 scale-[1.03]' : ''
          }`}
        >
          <TelechobiSprite
            id={activeChar}
            variant="menu"
            twitchState={twitchState}
            className="w-full h-full opacity-95 drop-shadow-[0_0_80px_rgba(0,0,0,1)]"
          />
        </div>
        {/* Deep Chiaroscuro Fade to Left */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #040405 16%, rgba(4,4,5,0.78) 48%, rgba(4,4,5,0.28) 82%, rgba(4,4,5,0.85) 100%)',
          }}
        />
      </div>

      {/* Analog 1990s TV Static, Scanlines & Rolling VHS Tracking Bar */}
      <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-65">
        <StaticCanvas intensity={staticBurst} />
      </div>
      <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-75" />
      <div className="absolute inset-0 pointer-events-none crt-vignette" />

      {/* Top Bar: Audio Toggle & Firebase Cloud Auth */}
      <header className="relative z-20 flex items-center justify-between gap-2 px-4 sm:px-8 md:px-14 pt-4 sm:pt-7">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={OFFICE_ASSETS.camerasIcon}
            alt="Logo CCTV Estudios Ajusco 1999"
            referrerPolicy="no-referrer"
            className="w-9 h-9 object-cover shrink-0 opacity-90"
            style={{
              maskImage: 'radial-gradient(circle, black 48%, transparent 96%)',
              WebkitMaskImage: 'radial-gradient(circle, black 48%, transparent 96%)',
            }}
          />
          <div className="text-[10px] sm:text-xs font-mono-tech tracking-widest text-[#cfc6b0] truncate">
            <span className="hidden sm:inline">TV AZTECA · FORO 4 AJUSCO · ARCHIVO 1998-1999</span>
            <span className="sm:hidden">FORO 4 AJUSCO · 1998-99</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
          {authLoading ? (
            <span className="text-[11px] sm:text-xs font-mono-tech text-zinc-400">Conectando...</span>
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-mono-tech text-zinc-300">
              <span className="truncate max-w-[110px] sm:max-w-[200px]">
                {user.displayName || 'Guardia'}
              </span>
              <span className="text-zinc-600">/</span>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(520);
                  onSignOut();
                }}
                className="inline-flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                soundEngine.unlock();
                soundEngine.playClick(640);
                onSignIn();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-mono-tech rust-panel-90s border text-[#e6dec8] hover:border-amber-400 transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Iniciar sesión con Google</span>
              <span className="sm:hidden">Google</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              onToggleMute();
            }}
            aria-label={muted ? 'Activar sonido' : 'Silenciar sonido'}
            className="p-2 rust-panel-90s border text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Left Menu Column (FNAF 1 layout) */}
      <main className="relative z-20 px-5 sm:px-8 md:px-14 py-4 sm:py-6 short-landscape:py-2 my-auto max-w-xl">
        <div className="mb-5 sm:mb-8 md:mb-10 short-landscape:mb-3">
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl short-landscape:text-4xl font-bold tracking-tight text-[#ede5d0] leading-[0.94] drop-shadow-[0_2px_18px_rgba(255,255,255,0.12)]">
            TELECHOBIS
            <br />
            LAND
          </h1>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm font-mono-tech text-[#b4aa92] tracking-wide">
            Vigilancia Nocturna · Estudios Abandonados
          </p>
        </div>

        <nav className="flex flex-col items-start gap-1.5 sm:gap-2.5 md:gap-3 short-landscape:gap-1" aria-label="Menú principal">
          {/* Option 1: Nuevo Juego */}
          <button
            type="button"
            onMouseEnter={() => {
              setHoveredIdx(0);
              soundEngine.playClick(620);
            }}
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playClick(820);
              onNewGame();
            }}
            className="group flex items-center gap-2.5 sm:gap-3 min-h-[44px] short-landscape:min-h-[36px] py-1 text-left font-display text-2xl sm:text-3xl md:text-4xl short-landscape:text-2xl tracking-wide text-zinc-100 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:text-amber-300"
          >
            <span
              className={`font-mono-tech text-lg sm:text-2xl transition-opacity ${
                hoveredIdx === 0 ? 'opacity-100 text-amber-400' : 'opacity-0'
              }`}
            >
              &gt;&gt;
            </span>
            <span>Nuevo Juego</span>
          </button>

          {/* Option 2: Continuar (disabled & gray until cloud save exists in Firebase) */}
          <button
            type="button"
            disabled={!canContinue}
            onMouseEnter={() => {
              if (canContinue) {
                setHoveredIdx(1);
                soundEngine.playClick(620);
              }
            }}
            onClick={() => {
              if (!canContinue) return;
              soundEngine.unlock();
              soundEngine.playClick(820);
              onContinue();
            }}
            className={`group flex items-center gap-2.5 sm:gap-3 min-h-[44px] short-landscape:min-h-[36px] py-1 text-left font-display text-2xl sm:text-3xl md:text-4xl short-landscape:text-2xl tracking-wide transition-colors ${
              canContinue
                ? 'text-zinc-100 hover:text-white cursor-pointer'
                : 'text-zinc-400/60 cursor-not-allowed'
            }`}
          >
            <span
              className={`font-mono-tech text-lg sm:text-2xl transition-opacity ${
                canContinue && hoveredIdx === 1 ? 'opacity-100 text-amber-400' : 'opacity-0'
              }`}
            >
              &gt;&gt;
            </span>
            <span>Continuar</span>
            {canContinue && playerSave && (
              <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-mono-tech text-amber-400/90 tracking-normal">
                Noche {getContinueNight(playerSave)}
              </span>
            )}
          </button>

          {/* Option 3: Seleccionar Noche (locked until Night 7 completed or legacy v1 Night-6 save) */}
          <button
            type="button"
            disabled={!progressionUnlocked}
            onMouseEnter={() => {
              if (progressionUnlocked) {
                setHoveredIdx(2);
                soundEngine.playClick(620);
              }
            }}
            onClick={() => {
              if (!progressionUnlocked) return;
              soundEngine.unlock();
              soundEngine.playClick(820);
              onSelectNight();
            }}
            className={`group flex items-center gap-2.5 sm:gap-3 min-h-[44px] short-landscape:min-h-[36px] py-1 text-left font-display text-2xl sm:text-3xl md:text-4xl short-landscape:text-2xl tracking-wide transition-colors ${
              progressionUnlocked
                ? 'text-zinc-100 hover:text-amber-200 cursor-pointer focus-visible:outline-none focus-visible:text-amber-300'
                : 'text-zinc-400/60 cursor-not-allowed'
            }`}
          >
            <span
              className={`font-mono-tech text-lg sm:text-2xl transition-opacity ${
                progressionUnlocked && hoveredIdx === 2 ? 'opacity-100 text-amber-400' : 'opacity-0'
              }`}
            >
              &gt;&gt;
            </span>
            <span className="inline-flex items-center gap-2.5">
              Seleccionar Noche
              {!progressionUnlocked && (
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400/65" aria-hidden="true" />
              )}
            </span>
          </button>

          {/* Option 4: Extras (locked until Night 7 completed or legacy v1 Night-6 save) */}
          <button
            type="button"
            disabled={!progressionUnlocked}
            onMouseEnter={() => {
              if (progressionUnlocked) {
                setHoveredIdx(3);
                soundEngine.playClick(620);
              }
            }}
            onClick={() => {
              if (!progressionUnlocked) return;
              soundEngine.unlock();
              soundEngine.playClick(820);
              onOpenExtras();
            }}
            className={`group flex items-center gap-2.5 sm:gap-3 min-h-[44px] short-landscape:min-h-[36px] py-1 text-left font-display text-2xl sm:text-3xl md:text-4xl short-landscape:text-2xl tracking-wide transition-colors ${
              progressionUnlocked
                ? 'text-zinc-100 hover:text-amber-300 cursor-pointer'
                : 'text-zinc-400/60 cursor-not-allowed'
            }`}
          >
            <span
              className={`font-mono-tech text-lg sm:text-2xl transition-opacity ${
                progressionUnlocked && hoveredIdx === 3 ? 'opacity-100 text-amber-400' : 'opacity-0'
              }`}
            >
              &gt;&gt;
            </span>
            <span className="inline-flex items-center gap-2.5">
              Extras
              {!progressionUnlocked && (
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400/65" aria-hidden="true" />
              )}
            </span>
          </button>
        </nav>

        {!user && !authLoading && (
          <p className="mt-4 sm:mt-6 text-[11px] sm:text-xs font-mono-tech text-zinc-400 max-w-md leading-relaxed">
            Conecta tu cuenta de Google para guardar tus noches superadas en Firebase y habilitar
            Continuar, Seleccionar Noche y Extras.
          </p>
        )}

        {authError && (
          <p className="mt-3 sm:mt-4 text-xs font-mono-tech text-red-400 max-w-md">{authError}</p>
        )}
      </main>
    </div>
  );
}
