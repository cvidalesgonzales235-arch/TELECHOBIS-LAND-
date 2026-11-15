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

  // Per-variant photographic framing & organic horror lighting
  let imgClass = 'w-full h-full object-contain select-none';
  let filterStyle = 'drop-shadow(0 0 28px rgba(0,0,0,0.95))';
  let transformStyle = '';

  if (variant === 'menu') {
    imgClass = 'w-full h-full object-cover object-top select-none';
    filterStyle = isGlitch
      ? 'contrast(2.05) brightness(0.82) invert(0.9) hue-rotate(180deg) drop-shadow(0 0 36px rgba(0,0,0,1))'
      : isDarkEyes
        ? 'contrast(1.65) brightness(0.4) grayscale(0.45) drop-shadow(0 0 40px rgba(0,0,0,1))'
        : 'contrast(1.3) brightness(0.74) saturate(0.82) sepia(0.12) drop-shadow(0 0 40px rgba(0,0,0,1))';
    transformStyle = isJerk ? 'rotate(-5deg) scale(1.06) translate(10px, -6px)' : 'scale(1.02)';
  } else if (variant === 'door') {
    imgClass = 'w-full h-full object-cover object-top select-none';
    filterStyle = 'contrast(1.42) brightness(0.48) saturate(0.7) sepia(0.15) drop-shadow(0 0 32px rgba(0,0,0,1))';
    transformStyle = 'scale(1.1)';
  } else if (variant === 'hallway') {
    imgClass = 'w-full h-full object-contain object-bottom select-none';
    filterStyle = isGlitch
      ? 'contrast(1.48) brightness(0.72) saturate(0.78) drop-shadow(0 16px 26px rgba(0,0,0,1))'
      : 'contrast(1.28) brightness(0.56) saturate(0.72) sepia(0.12) drop-shadow(0 16px 22px rgba(0,0,0,1))';
  } else if (variant === 'hall_confront') {
    imgClass = 'w-full h-full object-cover object-top select-none';
    filterStyle = 'contrast(1.48) brightness(0.74) saturate(0.78) sepia(0.1) drop-shadow(0 0 42px rgba(0,0,0,1))';
    transformStyle = 'scale(1.14)';
  } else if (variant === 'camera') {
    imgClass = 'w-full h-full object-contain object-bottom select-none';
    filterStyle = isGlitch
      ? 'grayscale(0.85) contrast(1.85) brightness(0.88) drop-shadow(0 10px 20px rgba(0,0,0,1))'
      : 'grayscale(0.8) contrast(1.42) brightness(0.68) drop-shadow(0 10px 18px rgba(0,0,0,1))';
  } else if (variant === 'jumpscare') {
    imgClass = 'w-full h-full object-cover object-top select-none';
    filterStyle =
      jumpscareSource === 'hallway'
        ? 'contrast(1.72) brightness(0.98) saturate(1.1) drop-shadow(0 0 46px rgba(0,0,0,1))'
        : 'contrast(1.52) brightness(0.88) saturate(0.92) drop-shadow(0 0 42px rgba(0,0,0,1))';
    transformStyle = jumpscareSource === 'hallway' ? 'scale(1.52)' : 'scale(1.42)';
  }

  return (
    <div
      className={`relative overflow-hidden select-none pointer-events-none ${className}`}
      aria-label={`Animatrónico ${meta.name}`}
    >
      <img
        src={meta.spritePath}
        alt={`Animatrónico ${meta.name}`}
        referrerPolicy="no-referrer"
        className={`${imgClass} transition-transform duration-75`}
        style={{
          filter: filterStyle,
          transform: transformStyle,
        }}
      />

      {/* Ground contact shadow & organic scene lighting falloff */}
      {(variant === 'hallway' || variant === 'camera') && (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
            style={{
              background:
                'radial-gradient(ellipse 65% 80% at 50% 95%, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 48%, transparent 80%)',
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.52) 0%, transparent 26%, transparent 72%, rgba(0,0,0,0.68) 100%)',
            }}
          />
        </>
      )}

      {(variant === 'menu' || variant === 'door' || variant === 'hall_confront') && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              variant === 'menu'
                ? 'radial-gradient(circle at 52% 28%, transparent 20%, rgba(4,4,5,0.72) 64%, rgba(4,4,5,0.99) 96%)'
                : variant === 'hall_confront'
                  ? 'radial-gradient(circle at 50% 34%, transparent 26%, rgba(0,0,0,0.74) 72%, rgba(0,0,0,0.97) 100%)'
                  : 'radial-gradient(ellipse 80% 78% at 50% 42%, transparent 32%, rgba(0,0,0,0.82) 76%, rgba(0,0,0,0.98) 100%)',
          }}
        />
      )}
    </div>
  );
}

export function TelechobiMaskOverlay({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden bg-black/35">
      <div className="relative w-full h-full animate-mask-breath">
        {/* Dark upper plush hood cavity shadow so only the eye holes look out into the room */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(4,5,8,0.97) 0%, rgba(4,5,8,0.92) 22%, rgba(4,5,8,0.28) 38%, rgba(4,5,8,0.12) 65%, rgba(4,5,8,0.94) 94%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 68% 46% at 50% 49%, transparent 50%, rgba(0,0,0,0.9) 82%, rgba(0,0,0,0.98) 100%)',
          }}
        />

        <img
          src={OFFICE_ASSETS.maskOverlay}
          alt="Interior de la máscara de Telechobi"
          referrerPolicy="no-referrer"
          className="relative z-10 w-full h-full object-cover object-center scale-[1.06] sm:scale-[1.04] brightness-[0.84] contrast-125 drop-shadow-[0_0_40px_rgba(0,0,0,1)]"
        />

        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(8,10,14,0.06) 0%, rgba(0,0,0,0.52) 78%, rgba(0,0,0,0.94) 100%)',
          }}
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
