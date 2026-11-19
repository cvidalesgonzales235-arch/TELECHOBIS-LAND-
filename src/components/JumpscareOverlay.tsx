import { useEffect } from 'react';
import { RotateCcw, ShieldAlert } from 'lucide-react';
import { JumpscareSource, OFFICE_ASSETS, TELECHOBIS, TelechobiId } from '../types/game';
import { CobwebCorner, TelechobiSprite } from './TelechobiArt';
import { StaticCanvas } from './StaticCanvas';
import { soundEngine } from '../audio/soundEngine';

interface JumpscareOverlayProps {
  killer: TelechobiId;
  source: JumpscareSource;
  night: number;
  isCustomNight?: boolean;
  phase: 'JUMPSCARE' | 'GAME_OVER';
  onJumpscareDone: () => void;
  onRetryNight: () => void;
  onBackToMenu: () => void;
}

const JUMPSCARE_ANIM_MAP: Record<JumpscareSource, Partial<Record<TelechobiId, string>>> = {
  left_door: {
    ton: 'animate-jumpscare-door-ton',
    toso: 'animate-jumpscare-door-toso',
    nita: 'animate-jumpscare-door-nita',
    tis: 'animate-jumpscare-door-tis',
    arbol: 'animate-jumpscare-door-arbol',
    champi: 'animate-jumpscare-door-champi',
  },
  right_door: {
    ton: 'animate-jumpscare-door-ton',
    toso: 'animate-jumpscare-door-toso',
    nita: 'animate-jumpscare-door-nita',
    tis: 'animate-jumpscare-door-tis',
    arbol: 'animate-jumpscare-door-arbol',
    champi: 'animate-jumpscare-door-champi',
  },
  door: {
    ton: 'animate-jumpscare-door-ton',
    toso: 'animate-jumpscare-door-toso',
    nita: 'animate-jumpscare-door-nita',
    tis: 'animate-jumpscare-door-tis',
    arbol: 'animate-jumpscare-door-arbol',
    champi: 'animate-jumpscare-door-champi',
  },
  hallway: {
    ton: 'animate-jumpscare-hall-ton',
    toso: 'animate-jumpscare-hall-toso',
    nita: 'animate-jumpscare-hall-nita',
    tis: 'animate-jumpscare-hall-tis',
    arbol: 'animate-jumpscare-hall-arbol',
    champi: 'animate-jumpscare-hall-champi',
  },
  vent: {
    ton: 'animate-jumpscare-vent-ton',
    toso: 'animate-jumpscare-vent-toso',
    nita: 'animate-jumpscare-vent-nita',
    tis: 'animate-jumpscare-vent-tis',
    arbol: 'animate-jumpscare-vent-arbol',
    non: 'animate-jumpscare-vent-non',
  },
  office: {
    charro: 'animate-jumpscare-office-charro',
    glamrock: 'animate-jumpscare-office-charro',
    tralalero: 'animate-jumpscare-office-charro',
  },
  oxygen: {},
};

const KILLER_GAMEOVER_THEME: Record<
  TelechobiId,
  {
    titleGradient: string;
    glowRgba: string;
    badgeClass: string;
    borderClass: string;
    tipTint: string;
  }
> = {
  ton: {
    titleGradient: 'from-sky-300 via-blue-400 to-amber-300',
    glowRgba: 'rgba(56, 189, 248, 0.24)',
    badgeClass: 'border-sky-400/70 bg-sky-950/75 text-sky-200',
    borderClass: 'border-sky-700/60',
    tipTint: 'text-sky-300',
  },
  toso: {
    titleGradient: 'from-emerald-300 via-green-400 to-pink-400',
    glowRgba: 'rgba(74, 222, 128, 0.24)',
    badgeClass: 'border-emerald-400/70 bg-emerald-950/75 text-emerald-200',
    borderClass: 'border-emerald-700/60',
    tipTint: 'text-emerald-300',
  },
  nita: {
    titleGradient: 'from-amber-200 via-yellow-400 to-lime-400',
    glowRgba: 'rgba(250, 204, 21, 0.24)',
    badgeClass: 'border-amber-400/70 bg-amber-950/75 text-amber-200',
    borderClass: 'border-amber-700/60',
    tipTint: 'text-amber-300',
  },
  tis: {
    titleGradient: 'from-rose-300 via-red-400 to-amber-300',
    glowRgba: 'rgba(244, 63, 94, 0.26)',
    badgeClass: 'border-rose-400/70 bg-rose-950/75 text-rose-200',
    borderClass: 'border-rose-700/60',
    tipTint: 'text-rose-300',
  },
  arbol: {
    titleGradient: 'from-amber-300 via-orange-500 to-emerald-400',
    glowRgba: 'rgba(234, 88, 12, 0.28)',
    badgeClass: 'border-orange-500/70 bg-orange-950/80 text-orange-200',
    borderClass: 'border-orange-700/60',
    tipTint: 'text-orange-300',
  },
  champi: {
    titleGradient: 'from-red-400 via-amber-300 to-emerald-400',
    glowRgba: 'rgba(239, 68, 68, 0.26)',
    badgeClass: 'border-red-500/70 bg-red-950/80 text-red-200',
    borderClass: 'border-red-700/60',
    tipTint: 'text-red-300',
  },
  non: {
    titleGradient: 'from-yellow-300 via-lime-400 to-red-400',
    glowRgba: 'rgba(234, 179, 8, 0.25)',
    badgeClass: 'border-yellow-500/70 bg-yellow-950/80 text-yellow-200',
    borderClass: 'border-yellow-700/60',
    tipTint: 'text-yellow-300',
  },
  charro: {
    titleGradient: 'from-zinc-200 via-red-500 to-rose-700',
    glowRgba: 'rgba(220, 38, 38, 0.34)',
    badgeClass: 'border-red-600/80 bg-black/90 text-red-300',
    borderClass: 'border-red-800/80',
    tipTint: 'text-red-400',
  },
  glamrock: {
    titleGradient: 'from-amber-200 via-yellow-400 to-orange-500',
    glowRgba: 'rgba(245, 158, 11, 0.34)',
    badgeClass: 'border-amber-400/80 bg-amber-950/85 text-amber-200',
    borderClass: 'border-amber-600/80',
    tipTint: 'text-amber-300',
  },
  tralalero: {
    titleGradient: 'from-cyan-200 via-sky-400 to-red-500',
    glowRgba: 'rgba(56, 189, 248, 0.32)',
    badgeClass: 'border-red-500/80 bg-slate-950/90 text-sky-200',
    borderClass: 'border-sky-700/80',
    tipTint: 'text-sky-300',
  },
};

function getAvoidanceAdvice(
  killer: TelechobiId,
  killerName: string,
  source: JumpscareSource
): {
  routeLabel: string;
  summary: string;
  howToAvoid: string;
} {
  if (source === 'oxygen') {
    return {
      routeLabel: 'OXÍGENO AL 0% · ASFIXIA',
      summary: 'El nivel de oxígeno llegó a 0% dentro de la oficina y perdiste el conocimiento.',
      howToAvoid:
        'Para evitar la asfixia: no abuses de la Máscara [M] ni gires compulsivamente de lado a lado (cada giro consume aire temporalmente). Cuando un enemigo entre a la ventilación, usa rápido el Timbre de Audio en Cámaras [W] para despejar el ducto.',
    };
  }
  if (killer === 'glamrock') {
    return {
      routeLabel: 'DUELO DE AURA FALLIDO',
      summary: `${killerName} farmeó más Aura que tú al no responder a tiempo en el muro donde apareció.`,
      howToAvoid:
        'Para evitar a Glamrock Aura: cuando grite "ES HORA DE DE DE DE DEL DUELO!", gira rápidamente por los lados de la habitación hasta encontrarlo y presiona "FARMEANDING AURA" antes de que se agote el tiempo.',
    };
  }
  if (killer === 'tralalero') {
    return {
      routeLabel: 'ATAQUE BRAINROT ITALIANO',
      summary: `${killerName} mantuvo sonando "Tralalero Tralala" demasiado tiempo y te atrapó sin haberle mostrado tu Currículum.`,
      howToAvoid:
        'Para evitar a Tralalero Faz-Shark: apenas comience "Tralalero Tralala", gira hacia el lado de la oficina donde se encuentra y presiona "SACAR CURRÍCULUM VITAE" para espantarlo y cortar la canción de inmediato.',
    };
  }
  if (source === 'office' || killer === 'charro') {
    return {
      routeLabel: 'APARICIÓN EN OFICINA CENTRAL',
      summary: `${killerName} se materializó justo frente a ti reclamando las almas del Foro 4.`,
      howToAvoid:
        'Para evitar a El Charro Negro: únicamente ataca frente a ti en la oficina (no entra por puertas ni ventilación). Apenas aparezca, ponte la Máscara [M] o abre las Cámaras [W] para detenerlo.',
    };
  }
  if (killer === 'champi') {
    return {
      routeLabel:
        source === 'left_door'
          ? 'PUERTA IZQUIERDA · CHAMPI'
          : source === 'right_door'
            ? 'PUERTA DERECHA · CHAMPI'
            : 'PASILLO CENTRAL · CHAMPI',
      summary: `${killerName} alcanzó la última cámara sin ser rastreado y atacó al instante al llegar a tu oficina.`,
      howToAvoid:
        'Para evitar a Champi: es el único enemigo al que debes buscar activamente en las Cámaras [W]. Encuéntralo en el monitor antes de que cruce CAM 01 o CAM 02 para activar la interferencia y devolverlo a CAM 09.',
    };
  }
  if (source === 'left_door') {
    return {
      routeLabel: 'PUERTA IZQUIERDA',
      summary: `${killerName} ingresó por la compuerta izquierda del Foro 4.`,
      howToAvoid:
        'Para evitar este ataque: gira a la izquierda [A / ←] al escuchar sus pasos o el estruendo en la puerta, y sella inmediatamente la compuerta con CERRAR [Q] hasta que golpee y se retire.',
    };
  }
  if (source === 'right_door') {
    return {
      routeLabel: 'PUERTA DERECHA',
      summary: `${killerName} ingresó por la compuerta derecha de edición.`,
      howToAvoid:
        'Para evitar este ataque: gira a la derecha [D / →] cuando se acerque al acceso oriente y presiona CERRAR [E] en la caja eléctrica hasta que golpee la lámina y regrese a las cámaras.',
    };
  }
  if (source === 'hallway') {
    return {
      routeLabel: 'PASILLO CENTRAL (CENTRO)',
      summary: `${killerName} se lanzó directo hacia tu escritorio desde el pasillo central.`,
      howToAvoid:
        'Para evitar este ataque: alumbra el pasillo con la Linterna [ESPACIO]; en cuanto lo veas parado al frente, ponte la Máscara [M] al instante y NO te la quites hasta que la luz parpadee y desaparezca.',
    };
  }
  if (killer === 'non') {
    return {
      routeLabel: 'VENTILACIÓN CAM 10 → OFICINA (CAM 11)',
      summary: `${killerName} se arrastró por el ducto que conecta CAM 10 con la oficina y bajó por la ventilación.`,
      howToAvoid:
        'Para evitar a Ñon: ÚNICAMENTE entra por la Ventilación de CAM 10 (CAM 11). Abre las Cámaras [W], entra a CAM 11 cuando oigas la puerta y el arrastre (Crawl) y usa los Gemidos de Homero (Audio) allí para espantarlo. Nota: los demás enemigos son inmunes al Audio, y usar Audio en CAM 09/12 solo acelera a Ñon hacia CAM 07 sin matarte.',
    };
  }
  if (source === 'vent') {
    return {
      routeLabel: 'VENTILACIÓN SUPERIOR',
      summary: `${killerName} descendió por el ducto de ventilación directo sobre tu oficina.`,
      howToAvoid:
        'Para evitar este ataque: presta atención al sonido metálico en los ductos y al crujido de puerta previo al ataque. Abre las Cámaras [W] de inmediato y activa el Audio para despejar la ventilación antes de que se agote el oxígeno.',
    };
  }
  return {
    routeLabel: 'PUERTA LATERAL',
    summary: `${killerName} aprovechó una compuerta desprotegida para entrar a la oficina.`,
    howToAvoid:
      'Para evitar este ataque: alterna tu revisión entre izquierda [A] y derecha [D] con cuidado y cierra la puerta correspondiente [Q] o [E] apenas lo detectes en el umbral.',
  };
}

export function JumpscareOverlay({
  killer,
  source,
  night,
  isCustomNight = false,
  phase,
  onJumpscareDone,
  onRetryNight,
  onBackToMenu,
}: JumpscareOverlayProps) {
  const meta = TELECHOBIS[killer];
  const animClass =
    JUMPSCARE_ANIM_MAP[source][killer] ||
    (killer === 'charro' ? 'animate-jumpscare-office-charro' : 'animate-jumpscare');
  const isOxygenDeath = source === 'oxygen';
  const theme = isOxygenDeath
    ? {
        titleGradient: 'from-cyan-300 via-sky-400 to-red-400',
        glowRgba: 'rgba(14, 165, 233, 0.24)',
        badgeClass: 'border-cyan-500/70 bg-cyan-950/80 text-cyan-200',
        borderClass: 'border-cyan-700/60',
        tipTint: 'text-cyan-300',
      }
    : KILLER_GAMEOVER_THEME[killer];
  const advice = getAvoidanceAdvice(killer, meta.name, source);
  const isDoorSource = source === 'left_door' || source === 'right_door' || source === 'door';

  useEffect(() => {
    if (phase === 'JUMPSCARE') {
      soundEngine.stopNightMusic();
      soundEngine.stopAmbience();
      soundEngine.stopMaskBreathing();
      soundEngine.stopVentSound();
      soundEngine.stopCharroVoice();
      soundEngine.stopNonCrawl();
      soundEngine.stopCamInterference();
      soundEngine.playJumpscare(killer, source);
      const t = window.setTimeout(() => {
        soundEngine.stopJumpscare();
        onJumpscareDone();
      }, 1480);
      return () => {
        window.clearTimeout(t);
        soundEngine.stopJumpscare();
      };
    }

    soundEngine.stopJumpscare();
  }, [phase, killer, source, onJumpscareDone]);

  if (phase === 'JUMPSCARE') {
    if (isOxygenDeath) {
      return (
        <div className="fixed inset-0 h-dvh z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(8,47,73,0.45)_0%,rgba(0,0,0,0.98)_68%)] animate-pulse" />
          <div className="relative z-10 text-center space-y-3 px-6">
            <div className="font-mono-tech text-xs tracking-[0.28em] sm:tracking-[0.35em] text-red-400 uppercase animate-pulse">
              OXÍGENO 0% · FALLA RESPIRATORIA
            </div>
            <div className="font-display text-4xl sm:text-7xl text-cyan-200 tracking-widest">
              SIN AIRE...
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 crt-scanlines opacity-65" />
        </div>
      );
    }

    return (
      <div className="fixed inset-0 h-dvh z-50 bg-black flex items-center justify-center overflow-hidden">
        <div
          className={`pointer-events-none absolute inset-0 ${
            source === 'vent'
              ? 'bg-[radial-gradient(ellipse_85%_65%_at_50%_18%,rgba(110,18,12,0.32),rgba(0,0,0,0.96)_78%)]'
              : isDoorSource
                ? 'bg-[radial-gradient(circle_at_50%_45%,rgba(80,12,12,0.22),rgba(0,0,0,0.96)_76%)]'
                : 'bg-[radial-gradient(circle_at_50%_50%,rgba(120,25,15,0.28),rgba(0,0,0,0.94)_80%)]'
          }`}
        />

        {source === 'vent' && (
          <div className="pointer-events-none fixed top-0 inset-x-0 flex justify-center z-20">
            <div className="relative w-[210px] sm:w-[340px] -mt-10 sm:-mt-16 flex justify-center">
              <div
                className="pointer-events-none absolute inset-4"
                style={{
                  background:
                    'radial-gradient(ellipse 76% 72% at 50% 45%, rgba(0,0,0,0.96) 38%, rgba(12,10,8,0.58) 78%, transparent 100%)',
                }}
              />
              <img
                src={OFFICE_ASSETS.ventGrille}
                alt="Rejilla de ventilación"
                referrerPolicy="no-referrer"
                className="relative z-10 w-full h-auto object-contain brightness-[0.38] contrast-125 sepia-[.24] rotate-[-2deg] drop-shadow-[0_18px_38px_rgba(0,0,0,0.98)]"
              />
            </div>
          </div>
        )}

        <div className={`w-full h-full flex items-center justify-center ${animClass}`}>
          <TelechobiSprite
            id={killer}
            variant="jumpscare"
            jumpscareSource={source}
            className="h-[92dvh] sm:h-[108dvh] w-auto"
          />
        </div>

        <div className="pointer-events-none absolute inset-0 crt-scanlines opacity-55" />
        <div className="pointer-events-none absolute inset-0 bg-red-950/25 mix-blend-screen" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-dvh z-50 bg-[#050404] flex justify-center p-3 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 opacity-60 pointer-events-none">
        <StaticCanvas intensity={0.48} tint={isOxygenDeath ? 'neutral' : 'red'} />
      </div>
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse 65% 65% at 24% 55%, ${theme.glowRgba} 0%, rgba(5,4,4,0.92) 72%)`,
        }}
      />
      <div className="fixed inset-0 crt-scanlines opacity-65 pointer-events-none" />

      <div
        className={`relative z-10 my-auto max-w-4xl w-full rust-panel-90s border-2 ${theme.borderClass} shadow-[0_28px_80px_rgba(0,0,0,0.98)] overflow-hidden`}
      >
        <CobwebCorner position="top-left" className="w-12 h-12 sm:w-16 sm:h-16 opacity-45 z-20" />
        <CobwebCorner position="bottom-right" className="w-12 h-12 sm:w-16 sm:h-16 opacity-45 z-20" />

        <div className="grid grid-cols-1 md:grid-cols-12 items-center">
          {/* Side Portrait: Oxygen Deprivation Gauge OR Cleanly Integrated Killer */}
          {isOxygenDeath ? (
            <div
              className="md:col-span-5 relative h-52 sm:h-64 md:h-[420px] short-landscape:h-56 flex flex-col items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-[#3d3024]/80 px-4 sm:px-6 text-center gap-3 sm:gap-4"
              style={{
                background:
                  'radial-gradient(ellipse 75% 75% at 50% 55%, rgba(14,165,233,0.22) 0%, rgba(4,4,5,0.98) 82%)',
              }}
            >
              <div className="font-mono-tech text-xs tracking-[0.26em] text-red-400 font-bold">
                NIVEL DE OXÍGENO
              </div>
              <div className="font-display text-7xl sm:text-8xl text-cyan-300 tabular-nums leading-none">
                0%
              </div>
              <div className="w-44 h-3 bg-zinc-900 border border-red-500/70 overflow-hidden">
                <div className="h-full w-[2%] bg-red-500 animate-pulse" />
              </div>
              <p className="font-mono-tech text-[11px] text-zinc-400 max-w-xs leading-relaxed">
                Hipoxia severa en cabina cerrada · Sello hermético sin ventilación activa.
              </p>
              <span
                className={`absolute top-3 left-3 px-2.5 py-0.5 border font-mono-tech text-[10px] tracking-widest uppercase ${theme.badgeClass}`}
              >
                ASFIXIA POR OXÍGENO 0%
              </span>
            </div>
          ) : (
            <div
              className="md:col-span-5 relative h-52 sm:h-64 md:h-[420px] short-landscape:h-56 flex items-end justify-center overflow-hidden border-b md:border-b-0 md:border-r border-[#3d3024]/80 px-4 pt-4"
              style={{
                background: `radial-gradient(ellipse 75% 75% at 50% 55%, ${theme.glowRgba} 0%, rgba(4,4,5,0.98) 82%)`,
              }}
            >
              <div
                className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 w-44 sm:w-52 h-6 rounded-full opacity-90"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.96) 0%, transparent 74%)',
                }}
              />
              <TelechobiSprite
                id={killer}
                variant="hallway"
                twitchState={2}
                className="h-[92%] w-auto"
              />
              <span
                className={`absolute top-2.5 left-2.5 sm:top-3 sm:left-3 px-2 sm:px-2.5 py-0.5 border font-mono-tech text-[9px] sm:text-[10px] tracking-widest uppercase ${theme.badgeClass}`}
              >
                ATRAPADO POR {meta.name}
              </span>
            </div>
          )}

          {/* Center-Right: Big Stylized GAME OVER + Avoidance Strategy */}
          <div className="md:col-span-7 p-4 sm:p-8 flex flex-col justify-between gap-4 sm:gap-5 text-center md:text-left">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 font-mono-tech text-[10px] sm:text-[11px] text-[#c7bda4]">
                <span className="px-2 py-0.5 bg-black/75 border border-[#4d3d30]">
                  {isCustomNight ? 'NOCHE PERSONALIZADA' : `NOCHE ${night}`}
                </span>
                <span className={`px-2 py-0.5 border ${theme.badgeClass}`}>
                  {advice.routeLabel}
                </span>
              </div>

              <h2
                className={`font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-[0.14em] leading-none text-center bg-gradient-to-r ${theme.titleGradient} bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] py-1`}
              >
                GAME OVER
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-[#f0e8d3] text-center md:text-left">
                {advice.summary}
              </p>

              <div className="border border-[#463628] bg-black/65 p-3 sm:p-4 text-left space-y-1.5">
                <div
                  className={`flex items-center gap-1.5 font-mono-tech text-[10px] sm:text-[11px] font-bold tracking-wider uppercase ${theme.tipTint}`}
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>CÓMO EVITAR A {meta.name} AQUÍ</span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#d6ccb4] leading-relaxed">
                  {advice.howToAvoid}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(740);
                  onRetryNight();
                }}
                className="min-h-[44px] flex-1 py-3 px-4 font-display text-base sm:text-lg tracking-wider bg-[#c9bfa4] text-black hover:bg-amber-300 border border-[#5e533e] transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isCustomNight ? 'Reintentar Noche' : `Reintentar Noche ${night}`}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(540);
                  onBackToMenu();
                }}
                className="min-h-[44px] flex-1 py-3 px-4 font-display text-base sm:text-lg tracking-wider bg-[#1d1a16] border border-[#5c4838] text-[#e5dcc8] hover:bg-[#2a241d] transition-colors cursor-pointer"
              >
                Menú Principal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
