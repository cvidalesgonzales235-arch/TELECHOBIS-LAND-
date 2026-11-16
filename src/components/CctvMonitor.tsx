import { useEffect, useRef, useState } from 'react';
import { PhoneCall, RefreshCw, VideoOff } from 'lucide-react';
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
  deactivatedEnemies?: TelechobiId[];
  champiInterferenceCam?: CameraId | null;
  radarActive?: boolean;
  lensTension: number;
  phoneFailed: boolean;
  phoneCooldown: number;
  lastRungCam: CameraId | null;
  formattedClock: string;
  onRingPhone: (cam: CameraId) => void;
  onPhoneSystemRepaired: () => void;
}

interface BlueprintCamSpec {
  id: CameraId;
  leftPct: number;
  topPct: number;
  pointer: 'right' | 'left' | 'down' | 'up';
}

// Exact layout matching reference architectural schematic (images_11c434e0.png)
const BLUEPRINT_CAMS: BlueprintCamSpec[] = [
  { id: 'cam9', leftPct: 54.5, topPct: 11.5, pointer: 'down' },
  { id: 'cam10', leftPct: 79.5, topPct: 21.5, pointer: 'left' },
  { id: 'cam7', leftPct: 16.5, topPct: 29.0, pointer: 'right' },
  { id: 'cam8', leftPct: 39.5, topPct: 22.5, pointer: 'down' },
  { id: 'cam6', leftPct: 16.5, topPct: 48.0, pointer: 'right' },
  { id: 'cam5', leftPct: 49.0, topPct: 45.5, pointer: 'left' },
  { id: 'cam4', leftPct: 81.5, topPct: 42.5, pointer: 'left' },
  { id: 'cam3', leftPct: 81.5, topPct: 60.5, pointer: 'left' },
  { id: 'cam2', leftPct: 64.0, topPct: 74.5, pointer: 'up' },
  { id: 'cam1', leftPct: 18.0, topPct: 83.5, pointer: 'right' },
];

export function CctvMonitor({
  activeCam,
  onSelectCam,
  enemyRooms,
  brokenCams,
  deactivatedEnemies = [],
  champiInterferenceCam = null,
  radarActive = false,
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
  const showingChampiBanish = champiInterferenceCam === activeCam && !isCamBroken;

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
    : showingChampiBanish
      ? 0.85
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
          className="pointer-events-none hidden lg:block absolute right-[380px] top-6 w-8 h-56 z-20 opacity-80"
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
                  <div className="pointer-events-none absolute inset-0 flex items-end justify-center gap-3 pb-3">
                    {enemiesInThisCam.map((enemyId, idx) => {
                      const isDeactivated = deactivatedEnemies.includes(enemyId);
                      return (
                        <div
                          key={enemyId}
                          className={`relative transition-transform ${
                            isDeactivated
                              ? 'h-[64%] aspect-[5/6] opacity-55 brightness-50 saturate-0'
                              : `h-[82%] aspect-[5/6] ${lensTension > 50 ? 'scale-108' : 'scale-100'}`
                          } ${idx > 0 ? '-ml-14 opacity-90' : ''}`}
                          style={{
                            filter: isDeactivated
                              ? 'grayscale(1) contrast(1.25) brightness(0.42) drop-shadow(0 0 18px rgba(0,0,0,0.95))'
                              : irMode === 'bw'
                                ? 'contrast(1.38) brightness(0.92) drop-shadow(0 0 24px rgba(0,0,0,0.95))'
                                : 'contrast(1.32) brightness(0.9) saturate(1.1) drop-shadow(0 0 22px rgba(0,0,0,0.92))',
                          }}
                        >
                          <TelechobiSprite
                            id={enemyId}
                            variant="camera"
                            twitchState={isDeactivated ? 3 : lensTension > 65 ? 2 : 0}
                            className="w-full h-full"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Video de interferencia al neutralizar a Champi en las cámaras */}
                {showingChampiBanish && (
                  <video
                    src={OFFICE_ASSETS.champiInterferenceVideo}
                    autoPlay
                    muted
                    playsInline
                    loop
                    className="pointer-events-none absolute inset-0 w-full h-full object-cover z-20 mix-blend-screen opacity-90"
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full bg-[#090807] flex flex-col items-center justify-center text-center p-4 z-10 relative">
                <VideoOff className="w-8 h-8 text-red-500 mb-2" />
                <p className="font-mono-tech text-xs sm:text-sm text-red-400 tracking-wider font-bold">
                  SIN SEÑAL · LENTE DESTROZADO
                </p>
                <p className="font-mono-tech text-[10px] sm:text-[11px] text-zinc-400 mt-1 max-w-xs">
                  El cristal de esta cámara estalló. Cambia a otra cámara en el plano mientras se
                  reinicia el enlace.
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

            {/* OSD Superior directo sobre señal de video */}
            <div className="pointer-events-none absolute top-2 left-2.5 right-2.5 flex items-start justify-between gap-2 z-20">
              <div className="flex flex-col items-start gap-1 max-w-[62%]">
                <div className="inline-flex items-center gap-1.5 bg-black/70 px-2 py-0.5 font-mono-tech text-[11px] sm:text-xs font-bold text-[#efe8d3] tracking-wider truncate max-w-full border-b border-[#8e8268]/60">
                  <span>{currentRoom.code}</span>
                  <span className="text-[#b8ae95]">·</span>
                  <span className="truncate">{currentRoom.shortName}</span>
                  {zoomFocus && <span className="text-[10px] text-amber-300">[1.15x]</span>}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <div className="inline-flex items-center gap-1.5 bg-black/70 px-2 py-0.5 font-mono-tech text-[11px] font-bold text-zinc-100 tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                  <span>REC</span>
                </div>

                {enemiesInThisCam.length > 0 && !isCamBroken && lensTension > 5 && (
                  <div className="bg-black/75 border border-[#4d3d30] px-2 py-1 text-right">
                    <div className="w-20 sm:w-28 h-1.5 bg-zinc-900 border border-zinc-700 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-100 ${
                          lensTension > 70 ? 'bg-red-500' : 'bg-amber-400'
                        }`}
                        style={{ width: `${Math.min(100, lensTension)}%` }}
                      />
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

          {/* Moldura inferior integrada al tubo CRT */}
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

        {/* ===================== PANEL DERECHO/INFERIOR: AUDIO Y PLANO FNaF 3 REDISEÑADO ===================== */}
        <aside className="relative lg:w-[390px] shrink-0 border-t-[2px] lg:border-t-0 lg:border-l-[2px] border-[#3d3225] bg-gradient-to-b from-[#171410] to-[#0d0b09] p-2 sm:p-3 flex flex-col gap-2 overflow-hidden">
          {/* Audio disponible únicamente en ciertas cámaras (sin textos en cámaras no disponibles) */}
          <div className="min-h-[42px] pb-2 border-b border-[#342a20] shrink-0 flex items-center">
            {phoneFailed ? (
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
                  {isHoldingReboot ? `${Math.round(rebootProgress)}%` : 'REINICIAR AUDIO'}
                </span>
              </button>
            ) : currentRoom.hasAudio ? (
              <button
                type="button"
                disabled={phoneCooldown > 0 || isCamBroken}
                onClick={() => {
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
                  {phoneCooldown > 0 ? `${Math.ceil(phoneCooldown)}s` : `AUDIO · ${currentRoom.code}`}
                </span>
              </button>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono-tech text-[#cbbda0] px-0.5 shrink-0">
            <span className="font-bold tracking-wider">PLANO DEL FORO 4 · 10 CÁMARAS</span>
            {radarActive ? (
              <span className="px-1.5 py-0.5 bg-emerald-950/90 border border-emerald-500/70 text-emerald-300 font-bold tracking-wider">
                RADAR ACTIVO
              </span>
            ) : (
              <span className="text-[#998d73]">CAM 01/02 → PUERTAS</span>
            )}
          </div>

          {/* Plano fiel al esquema de referencia (images_11c434e0.png): Fondo negro, ductos grises, salas negras borde blanco, YOU verde */}
          <div className="relative h-[196px] sm:h-[235px] lg:flex-1 lg:min-h-[290px] bg-black border-[2px] border-[#3d3225] overflow-hidden shadow-[inset_0_0_24px_rgba(0,0,0,0.96)]">
            <svg
              viewBox="0 0 260 220"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              {/* Ductos de ventilación gris oscuro (#23272e) */}
              <g fill="#252930">
                {/* Ducto superior izquierdo desde CAM 07 hacia CAM 09 */}
                <rect x="34" y="20" width="94" height="10" />
                <rect x="34" y="20" width="10" height="44" />
                {/* Ducto lateral izquierdo bajando junto a CAM 06 -> CAM 01 */}
                <rect x="46" y="124" width="22" height="24" />
                {/* Salida superior hacia techo */}
                <rect x="164" y="24" width="10" height="14" />
                {/* Ducto derecho bajando desde CAM 10 -> costado -> oficina YOU */}
                <rect x="200" y="54" width="10" height="140" />
                <rect x="148" y="186" width="62" height="10" />
                {/* Conexión de ventilación central bajo CAM 05 */}
                <rect x="98" y="114" width="10" height="20" />
              </g>

              {/* Estructuras de habitaciones y pasillos en negro con contorno blanco nítido */}
              <g fill="#050506" stroke="#f4f4f5" strokeWidth="1.6">
                {/* Sala CAM 09 / 10 (Arriba centro-derecha) */}
                <rect x="128" y="36" width="54" height="22" />
                {/* Entrada superior hacia CAM 09 */}
                <rect x="164" y="28" width="10" height="8" />

                {/* Corredor horizontal superior CAM 08 */}
                <rect x="90" y="68" width="58" height="22" />
                {/* Puente vertical CAM 09 -> CAM 08 */}
                <rect x="134" y="58" width="10" height="10" />

                {/* Corredor vertical izquierdo CAM 07 (arriba) y CAM 06 (abajo) */}
                <rect x="66" y="50" width="18" height="72" />
                {/* Puentes hacia CAM 08 y CAM 05 */}
                <rect x="84" y="74" width="6" height="10" />
                <rect x="84" y="102" width="6" height="10" />

                {/* Corredor horizontal medio CAM 05 */}
                <rect x="90" y="96" width="58" height="20" />
                {/* Puente vertical CAM 08 <-> CAM 05 */}
                <rect x="100" y="90" width="10" height="6" />

                {/* Corredor horizontal inferior bajo CAM 05 conectando CAM 01 y CAM 02 */}
                <rect x="90" y="132" width="58" height="20" />
                <rect x="148" y="136" width="8" height="10" />

                {/* Corredor vertical centro-derecha CAM 02 */}
                <rect x="156" y="82" width="16" height="72" />
                <rect x="148" y="100" width="8" height="10" />

                {/* Corredor vertical extremo derecho CAM 04 (arriba) y CAM 03 (abajo) */}
                <rect x="180" y="82" width="16" height="72" />
                {/* Puentes entre CAM 02 y CAM 04/03 */}
                <rect x="172" y="92" width="8" height="9" />
                <rect x="172" y="136" width="8" height="9" />

                {/* Corredor vertical izquierdo acceso oficina CAM 01 */}
                <rect x="74" y="132" width="16" height="72" />
                {/* Pequeño cubículo al fondo de CAM 01 */}
                <rect x="78" y="204" width="9" height="7" />

                {/* Puente izquierdo directo CAM 01 -> YOU (Oficina) */}
                <rect x="90" y="176" width="8" height="11" />
              </g>

              {/* Triángulo blanco indicador arriba a la derecha (entrada ducto techo) */}
              <polygon points="169,20 165,12 173,12" fill="#f4f4f5" />

              {/* Sala del Jugador (YOU) en verde olivo como images_11c434e0.png */}
              <g>
                <rect
                  x="98"
                  y="162"
                  width="50"
                  height="38"
                  fill="#7f9b11"
                  stroke="#eef5c8"
                  strokeWidth="1.4"
                />
                <text
                  x="123"
                  y="181"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                  letterSpacing="1.5"
                >
                  YOU
                </text>
                <rect x="120.5" y="187" width="5" height="5" fill="#ffffff" />
              </g>
            </svg>

            {/* Botones de las 10 Cámaras estilo cajas grises con contorno blanco + flecha puntero */}
            {BLUEPRINT_CAMS.map((spec) => {
              const room = CAMERA_ROOMS.find((c) => c.id === spec.id);
              if (!room) return null;
              const selected = room.id === activeCam;
              const broken = Boolean(brokenCams[room.id] && brokenCams[room.id]! > Date.now());
              const isRingingHere = lastRungCam === room.id && phoneCooldown > 0;
              const isChampiBanishHere = champiInterferenceCam === room.id;
              const isChampiHere =
                enemyRooms.champi === room.id && !deactivatedEnemies.includes('champi');
              const isChampiDanger =
                isChampiHere && (room.id === 'cam1' || room.id === 'cam2');
              const radarEnemiesHere = radarActive
                ? (Object.keys(enemyRooms) as TelechobiId[]).filter(
                    (id) =>
                      enemyRooms[id] === room.id &&
                      !deactivatedEnemies.includes(id) &&
                      !(id === 'champi' && isChampiHere)
                  )
                : [];

              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playCameraSwitch();
                    onSelectCam(room.id);
                  }}
                  style={{
                    left: `${spec.leftPct}%`,
                    top: `${spec.topPct}%`,
                  }}
                  title={`${room.code} · ${room.name}${
                    radarActive && (isChampiHere || radarEnemiesHere.length > 0)
                      ? ` (${[
                          ...(isChampiHere ? ['CHAMPI'] : []),
                          ...radarEnemiesHere.map((id) => TELECHOBIS[id].name),
                        ].join(', ')})`
                      : isChampiHere
                        ? ' (Champi aquí)'
                        : ''
                  }`}
                  className={`-translate-x-1/2 -translate-y-1/2 absolute min-w-[44px] sm:min-w-[50px] px-1.5 py-1 border-[1.5px] text-left transition-colors cursor-pointer z-10 ${
                    selected
                      ? 'bg-[#7f9b11] text-white border-[#f7fee7] z-20 shadow-[0_0_12px_rgba(163,230,53,0.45)]'
                      : broken
                        ? 'bg-[#5c1616] text-red-100 border-red-400 z-10'
                        : isChampiBanishHere
                          ? 'bg-amber-600 text-black border-amber-200 z-20 animate-pulse'
                          : isChampiHere
                            ? 'bg-[#3e221d] text-amber-100 border-amber-400 z-20 shadow-[0_0_12px_rgba(251,191,36,0.45)]'
                            : 'bg-[#45484d] text-white border-white/95 hover:bg-[#5e6369] z-10'
                  }`}
                >
                  {/* Icono de ubicación de Champi sobre la cámara en el plano */}
                  {isChampiHere && (
                    <span
                      aria-label="Champi en esta cámara"
                      className={`pointer-events-none absolute -top-2 -right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 bg-black/95 overflow-hidden flex items-center justify-center z-30 ${
                        isChampiDanger
                          ? 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.95)] animate-pulse'
                          : 'border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                      }`}
                    >
                      <img
                        src={TELECHOBIS.champi.spritePath}
                        alt="Icono Champi"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain scale-110"
                      />
                    </span>
                  )}

                  {/* Iconos del Radar (Kit de Supervivencia) sobre la cámara */}
                  {radarActive && radarEnemiesHere.length > 0 && (
                    <span className="pointer-events-none absolute -top-2.5 -left-2 flex -space-x-1.5 z-30">
                      {radarEnemiesHere.map((eid) => {
                        const emeta = TELECHOBIS[eid];
                        return (
                          <span
                            key={eid}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[1.5px] bg-black/95 overflow-hidden flex items-center justify-center shadow-[0_0_8px_rgba(0,0,0,0.95)]"
                            style={{ borderColor: emeta.eyeColor }}
                          >
                            <img
                              src={emeta.spritePath}
                              alt={emeta.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain scale-110"
                            />
                          </span>
                        );
                      })}
                    </span>
                  )}

                  {/* Puntero triangular blanco estilo plano técnico */}
                  {spec.pointer === 'right' && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-[7px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent border-l-[7px] border-l-white"
                    />
                  )}
                  {spec.pointer === 'left' && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -left-[7px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[4px] border-y-transparent border-r-[7px] border-r-white"
                    />
                  )}
                  {spec.pointer === 'down' && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -bottom-[7px] left-3 w-0 h-0 border-x-[4px] border-x-transparent border-t-[7px] border-t-white"
                    />
                  )}
                  {spec.pointer === 'up' && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-[7px] left-3 w-0 h-0 border-x-[4px] border-x-transparent border-b-[7px] border-b-white"
                    />
                  )}

                  <div className="flex items-center justify-between gap-1 font-mono-tech text-[8px] sm:text-[9px] font-bold leading-none tracking-tight">
                    <span>CAM</span>
                    {isRingingHere && (
                      <PhoneCall className="w-2.5 h-2.5 text-amber-300 animate-pulse shrink-0" />
                    )}
                  </div>
                  <div className="font-mono-tech text-[9px] sm:text-[10px] font-bold leading-none mt-0.5 tabular-nums">
                    {broken ? 'ERR' : room.code.replace('CAM ', '')}
                  </div>
                </button>
              );
            })}

            {/* Radar en puertas, pasillo y oficina (alrededor de YOU) */}
            {radarActive &&
              (
                [
                  {
                    slot: 'left_door',
                    leftPct: 37,
                    topPct: 82,
                    ids: (Object.keys(enemyRooms) as TelechobiId[]).filter(
                      (id) => enemyRooms[id] === 'left_door' && !deactivatedEnemies.includes(id)
                    ),
                  },
                  {
                    slot: 'hall',
                    leftPct: 47,
                    topPct: 68,
                    ids: (Object.keys(enemyRooms) as TelechobiId[]).filter(
                      (id) =>
                        (enemyRooms[id] === 'hall_far' || enemyRooms[id] === 'hall_near') &&
                        !deactivatedEnemies.includes(id)
                    ),
                  },
                  {
                    slot: 'right_door',
                    leftPct: 58,
                    topPct: 82,
                    ids: (Object.keys(enemyRooms) as TelechobiId[]).filter(
                      (id) => enemyRooms[id] === 'right_door' && !deactivatedEnemies.includes(id)
                    ),
                  },
                  {
                    slot: 'office',
                    leftPct: 47,
                    topPct: 82,
                    ids: (Object.keys(enemyRooms) as TelechobiId[]).filter(
                      (id) => enemyRooms[id] === 'office' && !deactivatedEnemies.includes(id)
                    ),
                  },
                ] as const
              ).map(
                (group) =>
                  group.ids.length > 0 && (
                    <div
                      key={group.slot}
                      style={{ left: `${group.leftPct}%`, top: `${group.topPct}%` }}
                      className="pointer-events-none -translate-x-1/2 -translate-y-1/2 absolute flex -space-x-1.5 z-30"
                    >
                      {group.ids.map((eid) => {
                        const emeta = TELECHOBIS[eid];
                        return (
                          <span
                            key={eid}
                            title={`${emeta.name} cerca de la oficina`}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 bg-black/95 overflow-hidden flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.85)]"
                            style={{ borderColor: emeta.eyeColor }}
                          >
                            <img
                              src={emeta.spritePath}
                              alt={emeta.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain scale-110"
                            />
                          </span>
                        );
                      })}
                    </div>
                  )
              )}
          </div>
        </aside>
      </div>
    </div>
  );
}
