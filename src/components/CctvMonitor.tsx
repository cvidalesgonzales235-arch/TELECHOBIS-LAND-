import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, PhoneCall, RefreshCw, VideoOff } from 'lucide-react';
import { CAMERA_ROOMS, CameraId, OFFICE_ASSETS, TELECHOBIS, TelechobiId } from '../types/game';
import { StaticCanvas } from './StaticCanvas';
import { CobwebCorner, CrackedGlassCorner, TelechobiSprite } from './TelechobiArt';
import { soundEngine } from '../audio/soundEngine';

interface CctvMonitorProps {
  activeCam: CameraId;
  onSelectCam: (cam: CameraId) => void;
  enemyRooms: Record<
    TelechobiId,
    CameraId | 'left_door' | 'right_door' | 'hall_far' | 'hall_near' | 'office'
  >;
  brokenCams: Partial<Record<CameraId, number>>;
  lensTension: number;
  phoneFailed: boolean;
  phoneCooldown: number;
  lastRungCam: CameraId | null;
  formattedClock: string;
  onRingPhone: (cam: CameraId) => void;
  onPhoneSystemRepaired: () => void;
}

const MAP_COORDS: Record<CameraId, { x: number; y: number }> = {
  cam1: { x: 50, y: 12 },
  cam2: { x: 17, y: 22 },
  cam3: { x: 83, y: 22 },
  cam6: { x: 17, y: 49 },
  cam5: { x: 50, y: 39 },
  cam4: { x: 83, y: 49 },
  cam8: { x: 17, y: 76 },
  cam9: { x: 50, y: 65 },
  cam7: { x: 83, y: 76 },
};

export function CctvMonitor({
  activeCam,
  onSelectCam,
  enemyRooms,
  brokenCams,
  lensTension,
  phoneFailed,
  phoneCooldown,
  lastRungCam,
  formattedClock,
  onRingPhone,
  onPhoneSystemRepaired,
}: CctvMonitorProps) {
  const [rebootProgress, setRebootProgress] = useState(0);
  const [isHoldingReboot, setIsHoldingReboot] = useState(false);
  const [irMode, setIrMode] = useState<'bw' | 'green'>('bw');
  const [zoomFocus, setZoomFocus] = useState(false);
  const holdTimerRef = useRef<number | null>(null);

  const currentRoom = CAMERA_ROOMS.find((c) => c.id === activeCam) || CAMERA_ROOMS[0];
  const isCamBroken = Boolean(brokenCams[activeCam] && brokenCams[activeCam]! > Date.now());

  const enemiesInThisCam = (Object.keys(enemyRooms) as TelechobiId[]).filter(
    (id) => enemyRooms[id] === activeCam
  );

  useEffect(() => {
    if (!isHoldingReboot || !phoneFailed) {
      setRebootProgress(0);
      if (holdTimerRef.current) {
        window.clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      return;
    }

    const startTime = performance.now();
    const durationMs = 2400;

    holdTimerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setRebootProgress(pct);
      if (pct >= 100) {
        if (holdTimerRef.current) window.clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
        setIsHoldingReboot(false);
        setRebootProgress(0);
        soundEngine.playRebootSuccess();
        onPhoneSystemRepaired();
      }
    }, 40);

    return () => {
      if (holdTimerRef.current) {
        window.clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, [isHoldingReboot, phoneFailed, onPhoneSystemRepaired]);

  const staticLevel = isCamBroken
    ? 0.94
    : Math.min(0.86, 0.25 + (lensTension / 100) * 0.55);

  return (
    <div className="fixed inset-0 z-30 bg-[#040303]/92 backdrop-blur-[2px] flex flex-col pt-[102px] pb-[84px] lg:pt-[104px] lg:pb-[88px] px-2.5 sm:px-5 select-none overflow-hidden">
      {/* CONSOLA UNIFICADA DE CIRCUITO CERRADO (1990s MÉXICO · FORO 4 AJUSCO) */}
      <div className="relative flex-1 min-h-0 max-w-6xl w-full mx-auto bg-gradient-to-b from-[#252019] via-[#171410] to-[#0f0d0a] border-[3px] border-[#493b2c] shadow-[0_26px_70px_rgba(0,0,0,0.96),inset_0_1px_0_rgba(255,244,214,0.12)] flex flex-col lg:flex-row overflow-hidden">
        {/* Pátina orgánica de óxido, polvo y telarañas continuas sobre todo el chasis */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50 z-10"
          style={{
            background:
              'radial-gradient(circle at 6% 8%, rgba(110,44,15,0.48), transparent 26%), radial-gradient(circle at 95% 90%, rgba(86,32,12,0.52), transparent 32%)',
          }}
        />
        <CobwebCorner position="top-left" className="w-16 h-16 opacity-45 z-30" />
        <CobwebCorner position="top-right" className="w-16 h-16 opacity-40 z-30" />
        <CobwebCorner position="bottom-right" className="w-16 h-16 opacity-40 z-30" />

        {/* Cableado trenzado desgastado recorriendo el costado del monitor */}
        <svg
          viewBox="0 0 60 240"
          aria-hidden="true"
          className="pointer-events-none hidden lg:block absolute right-[362px] top-6 w-8 h-56 z-20 opacity-80"
        >
          <path d="M 52 8 Q 18 55 46 115 T 38 232" stroke="#7d2518" strokeWidth="2.6" fill="none" />
          <path d="M 55 24 Q 26 80 48 142 T 30 236" stroke="#967f30" strokeWidth="2" fill="none" />
          <path d="M 50 42 Q 12 108 42 172 T 50 238" stroke="#284f38" strokeWidth="2.2" fill="none" />
        </svg>

        {/* ===================== SECCIÓN IZQUIERDA/SUPERIOR: TUBO CRT EMPOTRADO ===================== */}
        <section className="relative flex-1 min-h-[155px] flex flex-col p-2 sm:p-3 overflow-hidden">
          <div className="relative flex-1 min-h-0 rounded-md border-[3px] border-[#090807] bg-black overflow-hidden shadow-[inset_0_0_58px_rgba(0,0,0,1)]">
            {!isCamBroken ? (
              <>
                <img
                  src={currentRoom.image}
                  alt={currentRoom.name}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-200 ${
                    zoomFocus ? 'scale-115' : 'scale-100'
                  } ${
                    irMode === 'bw'
                      ? 'grayscale contrast-135 brightness-[0.68]'
                      : 'grayscale contrast-125 brightness-[0.68] sepia-[.48] hue-rotate-[68deg] saturate-150'
                  }`}
                />

                {/* Reflejo difuso del foco infrarrojo en el cristal */}
                <div
                  className="pointer-events-none absolute -top-12 right-[15%] w-44 h-44 opacity-28"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,248,225,0.6) 0%, rgba(255,248,225,0.1) 40%, transparent 72%)',
                  }}
                />

                {currentRoom.hasPastoOverlay && (
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-20 opacity-65"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(20, 42, 16, 0.95) 0%, rgba(30, 54, 22, 0.55) 60%, transparent 100%)',
                    }}
                  />
                )}

                {enemiesInThisCam.length > 0 && (
                  <div className="pointer-events-none absolute inset-0 flex items-end justify-center gap-4 pb-3">
                    {enemiesInThisCam.map((enemyId, idx) => (
                      <div
                        key={enemyId}
                        className={`relative h-[82%] aspect-[5/6] transition-transform ${
                          lensTension > 50 ? 'scale-108' : 'scale-100'
                        } ${idx === 1 ? '-ml-14 opacity-90' : ''}`}
                        style={{
                          filter:
                            irMode === 'bw'
                              ? 'grayscale(0.86) contrast(1.65) brightness(0.9) drop-shadow(0 0 26px rgba(0,0,0,1))'
                              : 'grayscale(0.55) contrast(1.45) brightness(0.86) drop-shadow(0 0 22px rgba(0,0,0,0.95))',
                        }}
                      >
                        <TelechobiSprite
                          id={enemyId}
                          variant="camera"
                          twitchState={lensTension > 65 ? 2 : 0}
                          className="w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-[#090807] flex flex-col items-center justify-center text-center p-4 z-10 relative">
                <VideoOff className="w-8 h-8 text-red-500 mb-2" />
                <p className="font-mono-tech text-xs sm:text-sm text-red-400 tracking-wider font-bold">
                  SIN SEÑAL · LENTE DAÑADO
                </p>
                <p className="font-mono-tech text-[10px] sm:text-[11px] text-zinc-400 mt-1 max-w-xs">
                  El circuito sufrió una descarga. Selecciona otra cámara en el plano.
                </p>
              </div>
            )}

            {/* Estática fina analógica, líneas CRT, cristal agrietado y telaraña */}
            <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-58">
              <StaticCanvas
                intensity={staticLevel}
                tint={isCamBroken ? 'red' : irMode === 'green' ? 'green' : 'neutral'}
              />
            </div>
            <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-75" />
            <div className="absolute inset-0 pointer-events-none crt-vignette" />
            <CrackedGlassCorner position="top-right" className="w-20 h-20 opacity-45 z-20" />
            <CrackedGlassCorner position="bottom-left" className="w-16 h-16 opacity-35 z-20" />
            <CobwebCorner position="top-left" className="w-12 h-12 opacity-40 z-20" />

            {/* OSD Superior directo sobre señal de video (sin cajas pesadas) */}
            <div className="pointer-events-none absolute top-2 left-2.5 right-2.5 flex items-start justify-between gap-2 z-20">
              <div className="flex flex-col items-start gap-1 max-w-[62%]">
                <div className="inline-flex items-center gap-1.5 bg-black/70 px-2 py-0.5 font-mono-tech text-[11px] sm:text-xs font-bold text-[#efe8d3] tracking-wider truncate max-w-full border-b border-[#8e8268]/60">
                  <span>{currentRoom.code}</span>
                  <span className="text-[#b8ae95]">·</span>
                  <span className="truncate">{currentRoom.shortName}</span>
                  {zoomFocus && <span className="text-[10px] text-amber-300">[1.15x]</span>}
                </div>

                {lastRungCam === activeCam && phoneCooldown > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-950/90 border border-amber-500/75 text-amber-200 text-[9px] font-mono-tech">
                    <PhoneCall className="w-2.5 h-2.5 animate-pulse" />
                    TIMBRE SONANDO AQUÍ
                  </span>
                )}
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="inline-flex items-center gap-1.5 bg-black/70 px-2 py-0.5 font-mono-tech text-[11px] font-bold text-zinc-100 tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span>REC</span>
                </div>

                {enemiesInThisCam.length > 0 && !isCamBroken && (
                  <div className="bg-black/85 border border-red-500/75 px-2 py-1 text-right">
                    <div className="font-mono-tech text-[9px] sm:text-[10px] text-red-400 font-bold">
                      ALERTA: {enemiesInThisCam.map((e) => TELECHOBIS[e].name).join(', ')}
                    </div>
                    <div className="mt-1 w-24 sm:w-32 h-1.5 bg-zinc-900 border border-zinc-700 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-100 ${
                          lensTension > 70 ? 'bg-red-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${Math.min(100, lensTension)}%` }}
                      />
                    </div>
                    <div className="font-mono-tech text-[9px] text-zinc-300 mt-0.5">
                      LENTE: {Math.round(lensTension)}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* OSD Inferior cinta Betacam México 1999 */}
            <div className="pointer-events-none absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between gap-2 z-20">
              <span className="bg-black/65 px-2 py-0.5 font-mono-tech text-[9px] sm:text-[10px] text-[#cfc5ab] tracking-wide truncate">
                TV AZTECA AJUSCO · {currentRoom.name}
              </span>
              <span className="bg-black/75 px-2 py-0.5 font-mono-tech text-[10px] sm:text-[11px] font-bold text-zinc-100 tracking-wider shrink-0">
                1999/11/14 · {formattedClock}
              </span>
            </div>
          </div>

          {/* Moldura inferior integrada al tubo CRT (Logo difuminado + interruptores B/N y Zoom) */}
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={OFFICE_ASSETS.camerasIcon}
                alt="Logo Circuito Cerrado 1990"
                referrerPolicy="no-referrer"
                className="w-6 h-6 sm:w-7 sm:h-7 object-cover shrink-0 opacity-90"
                style={{
                  maskImage: 'radial-gradient(circle, black 46%, transparent 95%)',
                  WebkitMaskImage: 'radial-gradient(circle, black 46%, transparent 95%)',
                }}
              />
              <span className="font-mono-tech text-[10px] font-bold tracking-wider text-[#d9cfb5] truncate">
                AJ-94 CCTV · MÉXICO D.F.
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(520);
                  setIrMode((m) => (m === 'bw' ? 'green' : 'bw'));
                }}
                className="px-2 py-1 bg-[#1e1a15] border border-[#544636] hover:border-amber-400 text-[#e6dec8] font-mono-tech text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
                title="Cambiar filtro CRT"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    irMode === 'green' ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-zinc-200'
                  }`}
                />
                <span>{irMode === 'bw' ? 'B/N-94' : 'IR VERDE'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick(610);
                  setZoomFocus((z) => !z);
                }}
                className={`px-2 py-1 border font-mono-tech text-[10px] font-bold flex items-center gap-1.5 cursor-pointer ${
                  zoomFocus
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                    : 'bg-[#1e1a15] border-[#544636] hover:border-amber-400 text-[#e6dec8]'
                }`}
                title="Alternar aumento de lente"
              >
                <span>ZOOM {zoomFocus ? '1.15x' : '1.0x'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* ===================== PANEL DERECHO/INFERIOR INTEGRADO: TIMBRE Y PLANO DEL FORO 4 ===================== */}
        <aside className="relative lg:w-[372px] shrink-0 border-t-[2px] lg:border-t-0 lg:border-l-[2px] border-[#3d3225] bg-gradient-to-b from-[#171410] to-[#0d0b09] p-2 sm:p-3 flex flex-col gap-2 overflow-hidden">
          {/* Bloque integrado de Señal de Audio DF (sin tarjetas anidadas) */}
          <div className="space-y-1.5 pb-2 border-b border-[#342a20] shrink-0">
            <div className="flex items-center justify-between text-[10px] font-mono-tech">
              <span className="font-bold text-[#e5dcc6] tracking-wide">
                SEÑAL DE AUDIO / TIMBRE DF
              </span>
              <span className={`font-bold ${phoneFailed ? 'text-red-400' : 'text-emerald-400'}`}>
                {phoneFailed ? 'LÍNEA CAÍDA' : 'EN LÍNEA'}
              </span>
            </div>

            {!phoneFailed ? (
              <button
                type="button"
                disabled={phoneCooldown > 0 || isCamBroken}
                onClick={() => {
                  soundEngine.playPhoneRing();
                  onRingPhone(activeCam);
                }}
                className={`tactile-keycap-90s w-full py-2 px-3 font-mono-tech text-[11px] sm:text-xs font-bold flex items-center justify-center gap-2 border transition-colors ${
                  phoneCooldown > 0 || isCamBroken
                    ? 'bg-[#211d18] text-[#7c7361] border-[#383026] cursor-not-allowed'
                    : 'bg-[#c9bfa3] text-[#17130d] border-[#73664e] hover:bg-[#e0d6ba] cursor-pointer'
                }`}
              >
                <PhoneCall className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {phoneCooldown > 0
                    ? `RECARGANDO AUDIO (${Math.ceil(phoneCooldown)}s)...`
                    : `ATRAER CON AUDIO EN ${currentRoom.code}`}
                </span>
              </button>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-mono-tech text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Cortocircuito de audio. Mantén oprimido para reparar:</span>
                </div>
                <button
                  type="button"
                  onMouseDown={() => {
                    soundEngine.playClick(500);
                    setIsHoldingReboot(true);
                  }}
                  onMouseUp={() => setIsHoldingReboot(false)}
                  onMouseLeave={() => setIsHoldingReboot(false)}
                  onTouchStart={() => {
                    soundEngine.playClick(500);
                    setIsHoldingReboot(true);
                  }}
                  onTouchEnd={() => setIsHoldingReboot(false)}
                  className="relative w-full py-2 px-3 font-mono-tech text-xs font-bold bg-[#4e1812] border-2 border-red-500 text-red-100 hover:bg-[#662018] overflow-hidden cursor-pointer flex items-center justify-center gap-2"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-amber-500/45 transition-none"
                    style={{ width: `${rebootProgress}%` }}
                  />
                  <RefreshCw
                    className={`w-4 h-4 relative z-10 ${isHoldingReboot ? 'animate-spin' : ''}`}
                  />
                  <span className="relative z-10">
                    {isHoldingReboot
                      ? `REPARANDO LÍNEA... ${Math.round(rebootProgress)}%`
                      : 'MANTENER PARA REINICIAR AUDIO'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Plano arquitectónico único incrustado directamente en la consola */}
          <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#cbbda0] px-0.5 shrink-0">
            <span className="font-bold tracking-wider">PLANO DEL FORO 4 · TOCA UNA CÁMARA</span>
            <span className="text-[#998d73]">9 CANALES</span>
          </div>

          <div className="relative h-[168px] sm:h-[205px] lg:flex-1 lg:min-h-[260px] bg-[#080c08] border-[2px] border-[#332a20] overflow-hidden shadow-[inset_0_0_32px_rgba(0,0,0,0.96)]">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full opacity-45">
              <g stroke="#cfc090" strokeWidth="0.85" fill="none" strokeDasharray="1.8 1.2">
                <line x1="50" y1="12" x2="17" y2="22" />
                <line x1="50" y1="12" x2="83" y2="22" />
                <line x1="50" y1="12" x2="50" y2="39" />
                <line x1="17" y1="22" x2="17" y2="49" />
                <line x1="83" y1="22" x2="83" y2="49" />
                <line x1="17" y1="49" x2="50" y2="39" />
                <line x1="83" y1="49" x2="50" y2="39" />
                <line x1="17" y1="49" x2="17" y2="76" />
                <line x1="83" y1="49" x2="83" y2="76" />
                <line x1="50" y1="39" x2="50" y2="65" />
                <line x1="17" y1="76" x2="50" y2="89" />
                <line x1="83" y1="76" x2="50" y2="89" />
                <line x1="50" y1="65" x2="50" y2="89" />
              </g>
            </svg>

            <CobwebCorner position="top-left" className="w-10 h-10 opacity-35" />

            {CAMERA_ROOMS.map((room) => {
              const selected = room.id === activeCam;
              const broken = Boolean(brokenCams[room.id] && brokenCams[room.id]! > Date.now());
              const isRingingHere = lastRungCam === room.id && phoneCooldown > 0;
              const coords = MAP_COORDS[room.id];

              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playCameraSwitch();
                    onSelectCam(room.id);
                  }}
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                  }}
                  className={`-translate-x-1/2 -translate-y-1/2 absolute w-[29%] max-w-[106px] px-1.5 py-1 border text-center transition-all cursor-pointer shadow-[0_3px_8px_rgba(0,0,0,0.85)] ${
                    selected
                      ? 'bg-[#e6dcc0] text-[#17130d] border-amber-300 z-20 ring-1 ring-amber-400'
                      : broken
                        ? 'bg-[#3d1512] text-red-200 border-red-500/80 z-10'
                        : 'bg-[#191712]/95 text-[#dcd2b8] border-[#665b45] hover:bg-[#2a251d] hover:border-amber-400/70 z-10'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 font-mono-tech text-[10px] font-bold leading-none">
                    <span>{room.code}</span>
                    {isRingingHere && (
                      <PhoneCall
                        className={`w-2.5 h-2.5 shrink-0 ${
                          selected ? 'text-amber-700' : 'text-amber-300'
                        } animate-pulse`}
                      />
                    )}
                  </div>
                  <div className="font-mono-tech text-[8px] leading-tight truncate mt-0.5 opacity-85">
                    {broken ? 'LENTE ROTO' : room.shortName}
                  </div>
                </button>
              );
            })}

            <div
              style={{ left: '50%', top: '89%' }}
              className="-translate-x-1/2 -translate-y-1/2 absolute px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/85 text-amber-200 text-[9px] font-mono-tech font-bold tracking-wider whitespace-nowrap"
            >
              OFICINA (TÚ)
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
