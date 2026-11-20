import { useEffect, useState } from 'react';
import { TELECHOBIS, OFFICE_ASSETS } from '../types/game';

export const AURA_BATTLE_POSES = [
  {
    id: 'six_seven',
    label: 'SIX-SEVEN (6-7)',
    sublabel: 'Palmas alternadas al pecho',
  },
  {
    id: 'mewing',
    label: 'MEWING',
    sublabel: 'Índice a los labios · Mandíbula marcada',
  },
  {
    id: 'fake_greet',
    label: 'SALUDO FAKE',
    sublabel: 'Amague de mano y peinado',
  },
  {
    id: 'sigma_cross',
    label: 'CRUCE SIGMA',
    sublabel: 'Brazos cruzados de acero',
  },
  {
    id: 'palm_reject',
    label: 'RECHAZO DE PALMA',
    sublabel: 'Palma abierta al frente',
  },
  {
    id: 'crowd_call',
    label: 'LLAMADO AL PÚBLICO',
    sublabel: 'Ambas manos arriba',
  },
  {
    id: 'pockets',
    label: 'MANOS AL BOLSILLO',
    sublabel: 'Aura pasiva imparable',
  },
  {
    id: 'anime_sign',
    label: 'SEÑAS ANIME · CELEBRACIÓN',
    sublabel: '¡GOLPE FINAL DE AURA!',
  },
] as const;

function PlayerAuraHands({ poseIndex }: { poseIndex: number }) {
  // 0: 6-7, 1: mewing, 2: fake_greet, 3: sigma_cross, 4: palm_reject, 5: crowd_call, 6: pockets, 7: anime_sign
  return (
    <svg
      viewBox="0 0 800 440"
      aria-hidden="true"
      className="w-full h-full drop-shadow-[0_14px_30px_rgba(0,0,0,0.95)]"
    >
      <defs>
        <linearGradient id="auraSleeve" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e2230" />
          <stop offset="100%" stopColor="#090b10" />
        </linearGradient>
        <linearGradient id="auraSkin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9a582" />
          <stop offset="100%" stopColor="#8d5e41" />
        </linearGradient>
      </defs>

      {poseIndex === 0 && (
        <g>
          {/* Six-Seven: Left palm up/down, Right palm alternating */}
          <g className="animate-pose-67-left" style={{ transformOrigin: '230px 300px' }}>
            <path d="M90 440 L175 260 L255 280 L210 440 Z" fill="url(#auraSleeve)" />
            <ellipse cx="220" cy="230" rx="52" ry="26" fill="url(#auraSkin)" stroke="#5c3b28" strokeWidth="3" />
            <rect x="176" y="192" width="16" height="36" rx="8" fill="#c7926f" />
            <rect x="196" y="185" width="16" height="40" rx="8" fill="#c7926f" />
            <rect x="216" y="187" width="16" height="39" rx="8" fill="#c7926f" />
            <rect x="236" y="196" width="15" height="34" rx="7" fill="#b47e5c" />
          </g>
          <g className="animate-pose-67-right" style={{ transformOrigin: '570px 300px' }}>
            <path d="M710 440 L625 260 L545 280 L590 440 Z" fill="url(#auraSleeve)" />
            <ellipse cx="580" cy="230" rx="52" ry="26" fill="url(#auraSkin)" stroke="#5c3b28" strokeWidth="3" />
            <rect x="548" y="196" width="15" height="34" rx="7" fill="#b47e5c" />
            <rect x="568" y="187" width="16" height="39" rx="8" fill="#c7926f" />
            <rect x="588" y="185" width="16" height="40" rx="8" fill="#c7926f" />
            <rect x="608" y="192" width="16" height="36" rx="8" fill="#c7926f" />
          </g>
        </g>
      )}

      {poseIndex === 1 && (
        <g>
          {/* Mewing: Ghost jawline contour + sweeping index finger shh/jaw */}
          <path
            d="M320 120 Q400 225 480 120"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3"
            strokeDasharray="8 6"
            opacity="0.7"
          />
          <g className="animate-pose-mewing" style={{ transformOrigin: '420px 260px' }}>
            <path d="M475 440 L435 230 L515 245 L580 440 Z" fill="url(#auraSleeve)" />
            <path
              d="M420 190 C412 158, 468 158, 480 212 L435 235 Z"
              fill="url(#auraSkin)"
              stroke="#5c3b28"
              strokeWidth="3"
            />
            {/* Extended index finger */}
            <rect x="414" y="102" width="18" height="86" rx="9" fill="#d9a582" stroke="#5c3b28" strokeWidth="2.5" />
          </g>
        </g>
      )}

      {poseIndex === 2 && (
        <g>
          {/* Saludo Fake: reaches out then snaps back across hair */}
          <g className="animate-pose-fake" style={{ transformOrigin: '520px 300px' }}>
            <path d="M610 440 L470 215 L555 240 L690 440 Z" fill="url(#auraSleeve)" />
            <ellipse cx="475" cy="182" rx="44" ry="38" fill="url(#auraSkin)" stroke="#5c3b28" strokeWidth="3" />
            <rect x="434" y="122" width="15" height="48" rx="7" fill="#c7926f" />
            <rect x="453" y="114" width="15" height="54" rx="7" fill="#c7926f" />
            <rect x="472" y="118" width="15" height="50" rx="7" fill="#c7926f" />
            <rect x="492" y="130" width="14" height="42" rx="7" fill="#b47e5c" />
          </g>
        </g>
      )}

      {poseIndex === 3 && (
        <g className="animate-pose-sigma" style={{ transformOrigin: '400px 310px' }}>
          {/* Crossed Arms Sigma */}
          <path d="M120 440 L215 255 L580 230 L600 305 L240 345 L185 440 Z" fill="#181c28" stroke="#fbbf24" strokeWidth="2.5" />
          <path d="M680 440 L585 255 L220 230 L200 305 L560 345 L615 440 Z" fill="#232838" stroke="#fbbf24" strokeWidth="2.5" />
          <circle cx="215" cy="272" r="28" fill="url(#auraSkin)" stroke="#5c3b28" strokeWidth="3" />
          <circle cx="585" cy="272" r="28" fill="url(#auraSkin)" stroke="#5c3b28" strokeWidth="3" />
        </g>
      )}

      {poseIndex === 4 && (
        <g className="animate-pose-reject" style={{ transformOrigin: '400px 260px' }}>
          {/* Open Palm Rejection */}
          <path d="M335 440 L355 245 L445 245 L465 440 Z" fill="url(#auraSleeve)" />
          <ellipse cx="400" cy="212" rx="58" ry="54" fill="url(#auraSkin)" stroke="#5c3b28" strokeWidth="3" />
          <rect x="342" y="112" width="19" height="82" rx="9" fill="#d9a582" stroke="#5c3b28" strokeWidth="2" />
          <rect x="366" y="96" width="19" height="92" rx="9" fill="#d9a582" stroke="#5c3b28" strokeWidth="2" />
          <rect x="392" y="90" width="20" height="96" rx="10" fill="#d9a582" stroke="#5c3b28" strokeWidth="2" />
          <rect x="418" y="102" width="19" height="86" rx="9" fill="#d9a582" stroke="#5c3b28" strokeWidth="2" />
          <rect x="446" y="176" width="44" height="22" rx="11" fill="#c7926f" stroke="#5c3b28" strokeWidth="2" />
        </g>
      )}

      {poseIndex === 5 && (
        <g>
          {/* Crowd Call: both arms sweeping upward */}
          <g className="animate-pose-crowd" style={{ transformOrigin: '210px 320px' }}>
            <path d="M80 440 L145 190 L225 215 L175 440 Z" fill="url(#auraSleeve)" />
            <ellipse cx="182" cy="166" rx="44" ry="30" fill="url(#auraSkin)" stroke="#5c3b28" strokeWidth="3" />
            <rect x="148" y="108" width="14" height="44" rx="7" fill="#d9a582" />
            <rect x="166" y="100" width="14" height="50" rx="7" fill="#d9a582" />
            <rect x="184" y="102" width="14" height="48" rx="7" fill="#d9a582" />
            <rect x="202" y="112" width="13" height="40" rx="6" fill="#c7926f" />
          </g>
          <g className="animate-pose-crowd" style={{ transformOrigin: '590px 320px' }}>
            <path d="M720 440 L655 190 L575 215 L625 440 Z" fill="url(#auraSleeve)" />
            <ellipse cx="618" cy="166" rx="44" ry="30" fill="url(#auraSkin)" stroke="#5c3b28" strokeWidth="3" />
            <rect x="584" y="112" width="13" height="40" rx="6" fill="#c7926f" />
            <rect x="602" y="102" width="14" height="48" rx="7" fill="#d9a582" />
            <rect x="620" y="100" width="14" height="50" rx="7" fill="#d9a582" />
            <rect x="638" y="108" width="14" height="44" rx="7" fill="#d9a582" />
          </g>
        </g>
      )}

      {poseIndex === 6 && (
        <g className="animate-pose-pockets" style={{ transformOrigin: '400px 380px' }}>
          {/* Hands sliding into jacket pockets */}
          <path d="M120 440 L180 275 L265 290 L235 440 Z" fill="url(#auraSleeve)" />
          <path d="M680 440 L620 275 L535 290 L565 440 Z" fill="url(#auraSleeve)" />
          <rect x="155" y="340" width="130" height="22" rx="6" fill="#090b10" stroke="#fbbf24" strokeWidth="2.5" />
          <rect x="515" y="340" width="130" height="22" rx="6" fill="#090b10" stroke="#fbbf24" strokeWidth="2.5" />
        </g>
      )}

      {poseIndex === 7 && (
        <g>
          {/* Anime / Sports celebration signs (two-finger jutsu / crown V-sign) */}
          <g className="animate-pose-anime" style={{ transformOrigin: '240px 290px' }}>
            <path d="M105 440 L185 250 L265 270 L215 440 Z" fill="url(#auraSleeve)" />
            <circle cx="225" cy="222" r="36" fill="url(#auraSkin)" stroke="#5c3b28" strokeWidth="3" />
            <rect x="200" y="132" width="17" height="72" rx="8" fill="#d9a582" stroke="#5c3b28" strokeWidth="2" />
            <rect x="225" y="128" width="17" height="76" rx="8" fill="#d9a582" stroke="#5c3b28" strokeWidth="2" />
          </g>
          <g className="animate-pose-anime" style={{ transformOrigin: '560px 290px' }}>
            <path d="M695 440 L615 250 L535 270 L585 440 Z" fill="url(#auraSleeve)" />
            <circle cx="575" cy="222" r="36" fill="url(#auraSkin)" stroke="#5c3b28" strokeWidth="3" />
            <rect x="548" y="132" width="17" height="72" rx="8" fill="#d9a582" stroke="#5c3b28" strokeWidth="2" />
            <rect x="573" y="128" width="17" height="76" rx="8" fill="#d9a582" stroke="#5c3b28" strokeWidth="2" />
          </g>
        </g>
      )}
    </svg>
  );
}

export function AuraBattleOverlay({
  poseIndex,
  retreating,
  progressPct,
}: {
  poseIndex: number;
  retreating: boolean;
  progressPct: number;
}) {
  const safePoseIndex = Number.isFinite(poseIndex)
    ? ((Math.floor(poseIndex) % AURA_BATTLE_POSES.length) + AURA_BATTLE_POSES.length) %
      AURA_BATTLE_POSES.length
    : 0;
  const safePose = AURA_BATTLE_POSES[safePoseIndex] ?? AURA_BATTLE_POSES[0];

  return (
    <div className="fixed inset-0 z-[54] flex flex-col items-center justify-between overflow-hidden bg-radial from-amber-500/20 via-black/78 to-black/92 backdrop-blur-[2px] px-3 py-4 sm:py-6 select-none pointer-events-auto">
      {/* Radial anime battle aura flare */}
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(251,191,36,0.38) 0%, rgba(217,119,6,0.14) 38%, transparent 72%)',
        }}
      />

      {/* Top Battle Header */}
      <div className="relative z-20 w-full max-w-xl text-center space-y-1.5 pt-2 sm:pt-4">
        <p className="font-mono-tech text-[10px] sm:text-xs tracking-[0.28em] text-amber-300 uppercase">
          BATALLA DE AURA ACTIVA
        </p>
        <h3 className="font-display text-2xl sm:text-4xl font-bold tracking-wider text-amber-100 drop-shadow-[0_0_18px_rgba(251,191,36,0.8)]">
          {retreating ? '¡AURA SUPERADA!' : safePose.label}
        </h3>
        <p className="font-mono-tech text-[11px] sm:text-xs text-amber-200/85">
          {retreating
            ? 'Glamrock Aura reconoce tu nivel y se retira de la oficina...'
            : safePose.sublabel}
        </p>
        <div className="mx-auto w-full max-w-xs h-2 bg-black/75 border border-amber-500/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-200 transition-all duration-100"
            style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
          />
        </div>
      </div>

      {/* Center Glamrock Aura dancing/battling + retreating */}
      <div className="relative z-10 flex-1 w-full max-w-md flex items-center justify-center min-h-0 my-1">
        <div
          className={`relative w-[62vw] max-w-[300px] sm:max-w-[340px] aspect-[3/4] ${
            retreating ? 'animate-aura-retreat' : 'animate-aura-duel-bounce'
          }`}
        >
          <img
            src={TELECHOBIS.glamrock.spritePath}
            alt="Glamrock Aura en batalla de aura"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain drop-shadow-[0_0_32px_rgba(251,191,36,0.72)]"
          />
        </div>
      </div>

      {/* Bottom First-Person Player Aura Farming Hands */}
      {!retreating && (
        <div className="relative z-20 w-full max-w-2xl h-[28vh] min-h-[150px] max-h-[260px] pointer-events-none flex items-end justify-center">
          <PlayerAuraHands poseIndex={safePoseIndex} />
        </div>
      )}
    </div>
  );
}

export function CurriculumVitaeOverlay({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[53] flex items-end justify-center overflow-hidden">
      <div className="w-[82vw] max-w-[440px] h-[66vh] max-h-[540px] flex items-end justify-center animate-cv-slam">
        <img
          src={OFFICE_ASSETS.curriculumVitae}
          alt="Currículum Vitae mostrado en primera persona"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain object-bottom drop-shadow-[0_18px_36px_rgba(0,0,0,0.96)]"
        />
      </div>
    </div>
  );
}

export function AuraCheatHandsOverlay({
  active,
  transparentForCameras = false,
  withCv = false,
}: {
  active: boolean;
  transparentForCameras?: boolean;
  withCv?: boolean;
}) {
  const [poseIndex, setPoseIndex] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setPoseIndex((prev) => (prev + 1) % AURA_BATTLE_POSES.length);
    }, 640);
    return () => window.clearInterval(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex items-end justify-center overflow-hidden transition-opacity duration-200 ${
        transparentForCameras ? 'opacity-25' : 'opacity-95'
      }`}
    >
      <div
        className={`w-[92vw] max-w-[540px] sm:max-w-[640px] h-[30dvh] min-h-[145px] max-h-[270px] short-landscape:h-[40dvh] flex items-end justify-center transition-transform duration-200 ${
          withCv ? '-translate-x-[12%] sm:-translate-x-[14%]' : ''
        }`}
      >
        <PlayerAuraHands poseIndex={poseIndex} />
      </div>
    </div>
  );
}

export function CvCheatOverlay({
  active,
  transparentForCameras = false,
  withAuraHands = false,
}: {
  active: boolean;
  transparentForCameras?: boolean;
  withAuraHands?: boolean;
}) {
  if (!active) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[46] flex items-end overflow-hidden transition-opacity duration-200 ${
        withAuraHands ? 'justify-end pr-2 sm:pr-10 md:pr-16' : 'justify-center'
      } ${transparentForCameras ? 'opacity-25' : 'opacity-95'}`}
    >
      <div className="w-[46vw] max-w-[270px] sm:max-w-[320px] h-[34dvh] sm:h-[44dvh] max-h-[380px] short-landscape:h-[52dvh] flex items-end justify-center animate-aura-duel-bounce">
        <img
          src={OFFICE_ASSETS.curriculumVitae}
          alt="Currículum Vitae sostenido en mano"
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain object-bottom drop-shadow-[0_14px_28px_rgba(0,0,0,0.95)]"
        />
      </div>
    </div>
  );
}
