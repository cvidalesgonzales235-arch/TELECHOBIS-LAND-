import { JumpscareSource, OFFICE_ASSETS, TELECHOBIS, TelechobiId } from '../types/game';

interface TelechobiSpriteProps {
  id: TelechobiId;
  variant?: 'menu' | 'door' | 'hallway' | 'hall_confront' | 'camera' | 'jumpscare';
  jumpscareSource?: JumpscareSource;
  twitchState?: number; // 0 = normal eerie stare, 1 = head jerk, 2 = endo-invert glitch, 3 = darkened dead sockets
  className?: string;
}

export function TelechobiSprite({
  id,
  variant = 'hallway',
  jumpscareSource = 'door',
  twitchState = 0,
  className = '',
}: TelechobiSpriteProps) {
  const meta = TELECHOBIS[id];
  const isJerk = twitchState === 1;
  const isGlitch = twitchState === 2;
  const isDarkEyes = twitchState === 3;
  const isNon = id === 'non';

  // Per-variant organic lighting & color-preserving shadows (no black/white rectangular backdrops)
  let imgClass = isNon
    ? 'w-full h-full object-contain object-bottom select-none'
    : 'w-full h-full object-contain select-none';
  let filterStyle = 'drop-shadow(0 12px 24px rgba(0,0,0,0.92))';
  let transformStyle = '';
  let extraWrapClass = '';

  if (variant === 'menu') {
    imgClass = isNon
      ? 'w-full h-full object-contain object-bottom select-none'
      : 'w-full h-full object-cover object-top select-none';
    filterStyle = isGlitch
      ? 'contrast(1.85) brightness(0.84) invert(0.85) hue-rotate(180deg) drop-shadow(0 0 34px rgba(0,0,0,0.95))'
      : isDarkEyes
        ? 'contrast(1.48) brightness(0.42) saturate(0.75) drop-shadow(0 0 38px rgba(0,0,0,0.98))'
        : 'contrast(1.22) brightness(0.78) saturate(0.9) drop-shadow(0 0 36px rgba(0,0,0,0.95))';
    transformStyle = isNon
      ? isJerk
        ? 'translateY(14%) rotate(-8deg) scale(0.92)'
        : 'translateY(16%) rotate(-5deg) scale(0.9)'
      : isJerk
        ? 'rotate(-5deg) scale(1.06) translate(10px, -6px)'
        : 'scale(1.02)';
  } else if (variant === 'door') {
    imgClass = isNon
      ? 'w-full h-full object-contain object-bottom select-none'
      : 'w-full h-full object-cover object-top select-none';
    filterStyle =
      'contrast(1.28) brightness(0.58) saturate(0.86) drop-shadow(0 10px 28px rgba(0,0,0,0.95))';
    transformStyle = isNon ? 'translate(-8%, 22%) rotate(10deg) scale(0.88)' : 'scale(1.08)';
  } else if (variant === 'hallway') {
    imgClass = 'w-full h-full object-contain object-bottom select-none';
    filterStyle = isGlitch
      ? 'contrast(1.38) brightness(0.76) saturate(0.88) drop-shadow(0 16px 24px rgba(0,0,0,0.95))'
      : 'contrast(1.22) brightness(0.62) saturate(0.84) drop-shadow(0 16px 20px rgba(0,0,0,0.95))';
    if (isNon) {
      extraWrapClass = 'animate-non-crawl';
      transformStyle = 'scale(0.84)';
    }
  } else if (variant === 'hall_confront') {
    imgClass = isNon
      ? 'w-full h-full object-contain object-bottom select-none'
      : 'w-full h-full object-cover object-top select-none';
    filterStyle =
      'contrast(1.35) brightness(0.78) saturate(0.9) drop-shadow(0 0 38px rgba(0,0,0,0.98))';
    transformStyle = isNon ? 'translateY(24%) rotate(-6deg) scale(0.94)' : 'scale(1.12)';
  } else if (variant === 'camera') {
    imgClass = 'w-full h-full object-contain object-bottom select-none';
    filterStyle = isGlitch
      ? 'contrast(1.58) brightness(0.88) saturate(0.82) drop-shadow(0 10px 22px rgba(0,0,0,0.92))'
      : isDarkEyes
        ? 'contrast(1.35) brightness(0.45) saturate(0.5) drop-shadow(0 10px 18px rgba(0,0,0,0.94))'
        : 'contrast(1.28) brightness(0.76) saturate(0.78) drop-shadow(0 10px 18px rgba(0,0,0,0.9))';
    if (isNon) {
      extraWrapClass = 'animate-non-crawl';
      transformStyle = 'scale(0.82)';
    }
  } else if (variant === 'jumpscare') {
    imgClass = isNon
      ? 'w-full h-full object-contain object-bottom select-none'
      : 'w-full h-full object-cover object-top select-none';
    if (jumpscareSource === 'vent') {
      filterStyle = 'contrast(1.52) brightness(0.92) saturate(1.02) drop-shadow(0 0 40px rgba(0,0,0,1))';
      transformStyle = isNon ? 'translateY(10%) scale(1.18)' : 'scale(1.34)';
    } else if (jumpscareSource === 'hallway') {
      filterStyle = 'contrast(1.64) brightness(0.96) saturate(1.08) drop-shadow(0 0 42px rgba(0,0,0,1))';
      transformStyle = isNon ? 'translateY(16%) rotate(-5deg) scale(1.28)' : 'scale(1.48)';
    } else {
      filterStyle = 'contrast(1.46) brightness(0.88) saturate(0.96) drop-shadow(0 0 38px rgba(0,0,0,1))';
      transformStyle = isNon ? 'translateY(14%) rotate(6deg) scale(1.22)' : 'scale(1.38)';
    }
  }

  return (
    <div
      className={`relative select-none pointer-events-none ${
        variant === 'jumpscare' ? '' : 'overflow-visible'
      } ${extraWrapClass} ${className}`}
      aria-label={`Animatrónico ${meta.name}`}
    >
      {/* Ground contact ellipse strictly beneath feet/torso (no dark rectangle over silhouette) */}
      {(variant === 'hallway' || variant === 'camera' || (isNon && variant === 'door')) && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0 w-[68%] h-4 rounded-full opacity-75"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 74%)',
          }}
        />
      )}

      <img
        src={meta.spritePath}
        alt={`Animatrónico ${meta.name}`}
        referrerPolicy="no-referrer"
        className={`${imgClass} relative z-10 transition-transform duration-75`}
        style={{
          filter: filterStyle,
          transform: transformStyle,
        }}
      />
    </div>
  );
}

export function FirstPersonHandOverlay({
  action,
}: {
  action: 'mask_on' | 'mask_off' | 'cam_up' | 'cam_down' | null;
}) {
  if (!action) return null;

  const isMask = action === 'mask_on' || action === 'mask_off';
  const animClass =
    action === 'mask_on'
      ? 'animate-hands-mask-on'
      : action === 'mask_off'
        ? 'animate-hands-mask-off'
        : action === 'cam_up'
          ? 'animate-hands-cam-up'
          : 'animate-hands-cam-down';

  return (
    <div className="pointer-events-none fixed inset-0 z-[47] overflow-hidden flex items-end justify-center">
      <div className={`relative w-full max-w-4xl h-[75vh] ${animClass}`}>
        <svg
          viewBox="0 0 800 500"
          aria-hidden="true"
          className="w-full h-full drop-shadow-[0_18px_36px_rgba(0,0,0,0.96)]"
        >
          <defs>
            <linearGradient id="guardSleeve" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#262830" />
              <stop offset="100%" stopColor="#0f1117" />
            </linearGradient>
            <linearGradient id="guardSkin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c79776" />
              <stop offset="100%" stopColor="#855a40" />
            </linearGradient>
          </defs>

          {isMask ? (
            <g>
              {/* Mask brim silhouette being pulled down/up by both hands */}
              <path
                d="M170 40 C260 5, 540 5, 630 40 L655 180 C550 130, 250 130, 145 180 Z"
                fill="#1d3557"
                stroke="#0a121f"
                strokeWidth="5"
                opacity="0.92"
              />
              <ellipse cx="290" cy="115" rx="46" ry="34" fill="#040507" />
              <ellipse cx="510" cy="115" rx="46" ry="34" fill="#040507" />
            </g>
          ) : (
            <g>
              {/* CRT Portable Monitor bezel being lifted/lowered */}
              <rect
                x="150"
                y="55"
                width="500"
                height="290"
                rx="14"
                fill="#1b1813"
                stroke="#4a3d2e"
                strokeWidth="6"
              />
              <rect x="172" y="78" width="456" height="226" rx="6" fill="#090c0a" />
            </g>
          )}

          {/* Left Guard Arm & Hand */}
          <g>
            <path d="M55 500 L145 215 L235 235 L180 500 Z" fill="url(#guardSleeve)" />
            <path
              d="M142 218 C134 162, 168 124, 212 132 C242 138, 256 178, 240 226 Z"
              fill="url(#guardSkin)"
              stroke="#4d3221"
              strokeWidth="3"
            />
            <rect x="155" y="132" width="16" height="44" rx="8" fill="#b48566" />
            <rect x="176" y="124" width="16" height="48" rx="8" fill="#b48566" />
            <rect x="197" y="128" width="16" height="46" rx="8" fill="#b48566" />
            <rect x="218" y="142" width="15" height="40" rx="7" fill="#a27558" />
          </g>

          {/* Right Guard Arm & Hand */}
          <g transform="translate(800, 0) scale(-1, 1)">
            <path d="M55 500 L145 215 L235 235 L180 500 Z" fill="url(#guardSleeve)" />
            <path
              d="M142 218 C134 162, 168 124, 212 132 C242 138, 256 178, 240 226 Z"
              fill="url(#guardSkin)"
              stroke="#4d3221"
              strokeWidth="3"
            />
            <rect x="155" y="132" width="16" height="44" rx="8" fill="#b48566" />
            <rect x="176" y="124" width="16" height="48" rx="8" fill="#b48566" />
            <rect x="197" y="128" width="16" height="46" rx="8" fill="#b48566" />
            <rect x="218" y="142" width="15" height="40" rx="7" fill="#a27558" />
          </g>
        </svg>
      </div>
    </div>
  );
}

export function TelechobiMaskOverlay({
  active,
  oxygenPct = 100,
}: {
  active: boolean;
  oxygenPct?: number;
}) {
  if (!active) return null;

  const hypoxia = Math.max(0, Math.min(1, (85 - oxygenPct) / 85));
  const innerClear = Math.max(22, 54 - hypoxia * 24);
  const midStop = Math.max(50, 86 - hypoxia * 26);

  return (
    <div className="pointer-events-none fixed inset-0 z-[44] overflow-hidden bg-black/20">
      <div className="relative w-full h-full animate-mask-breath">
        {/* Dark upper plush hood cavity shadow so only the eye holes look out into the room/cameras */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(4,5,8,0.88) 0%, rgba(4,5,8,0.72) 18%, rgba(4,5,8,0.12) 34%, rgba(4,5,8,0.06) 68%, rgba(4,5,8,0.78) 96%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-150"
          style={{
            background: `radial-gradient(ellipse ${72 - hypoxia * 20}% ${50 - hypoxia * 14}% at 50% 49%, transparent ${innerClear}%, rgba(0,0,0,0.82) ${midStop}%, rgba(0,0,0,0.95) 100%)`,
          }}
        />

        <img
          src={OFFICE_ASSETS.maskOverlay}
          alt="Interior de la máscara de Telechobi"
          referrerPolicy="no-referrer"
          className="relative z-10 w-full h-full object-cover object-center scale-[1.06] sm:scale-[1.04] brightness-[0.82] contrast-120 opacity-90 drop-shadow-[0_0_40px_rgba(0,0,0,1)]"
        />
      </div>
    </div>
  );
}

export function CobwebCorner({
  position = 'top-left',
  className = '',
}: {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}) {
  const posClass =
    position === 'top-right'
      ? 'top-0 right-0 scale-x-[-1]'
      : position === 'bottom-left'
        ? 'bottom-0 left-0 scale-y-[-1]'
        : position === 'bottom-right'
          ? 'bottom-0 right-0 scale-[-1]'
          : 'top-0 left-0';

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={`pointer-events-none absolute w-16 h-16 opacity-45 ${posClass} ${className}`}
    >
      <g stroke="#d6d0c2" strokeWidth="0.85" fill="none" strokeLinecap="round">
        <line x1="0" y1="0" x2="115" y2="12" />
        <line x1="0" y1="0" x2="98" y2="54" />
        <line x1="0" y1="0" x2="62" y2="94" />
        <line x1="0" y1="0" x2="16" y2="116" />
        <path d="M 28 3 Q 24 18 14 26 Q 6 30 3 28" />
        <path d="M 56 6 Q 48 32 30 48 Q 16 58 6 58" />
        <path d="M 86 9 Q 74 48 48 74 Q 26 88 10 88" />
        <path d="M 108 11 Q 92 60 60 92 Q 34 108 14 110" />
      </g>
    </svg>
  );
}

export function CrackedGlassCorner({
  position = 'top-right',
  className = '',
}: {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}) {
  const posClass =
    position === 'top-right'
      ? 'top-0 right-0 scale-x-[-1]'
      : position === 'bottom-left'
        ? 'bottom-0 left-0 scale-y-[-1]'
        : position === 'bottom-right'
          ? 'bottom-0 right-0 scale-[-1]'
          : 'top-0 left-0';

  return (
    <svg
      viewBox="0 0 140 140"
      aria-hidden="true"
      className={`pointer-events-none absolute w-24 h-24 opacity-50 ${posClass} ${className}`}
    >
      <g stroke="#e7e2d5" strokeWidth="0.9" fill="none" strokeLinecap="round">
        <polyline points="0,0 26,18 42,14 68,36 96,34" />
        <polyline points="26,18 22,48 46,66 44,96" />
        <polyline points="42,14 58,2 82,12" />
        <polyline points="68,36 86,58 118,64" />
        <polyline points="22,48 4,62" />
      </g>
    </svg>
  );
}
