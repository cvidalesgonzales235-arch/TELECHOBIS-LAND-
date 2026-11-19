import { useState } from 'react';
import {
  ArrowLeft,
  BatteryCharging,
  Check,
  Clock,
  Flame,
  Minus,
  Play,
  Plus,
  Radar,
  Radio,
  Shield,
  Sliders,
  Sparkles,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import {
  ALL_ENEMY_IDS,
  BASE_ENEMY_IDS,
  CUSTOM_NIGHT_CHALLENGES,
  CheatsConfig,
  CustomNightLaunchConfig,
  DEFAULT_AI_LEVELS,
  DEFAULT_CHEATS,
  EASY_CHALLENGE_4_0,
  OfficeId,
  TELECHOBIS,
  TelechobiId,
} from '../types/game';
import { CobwebCorner } from './TelechobiArt';
import { soundEngine } from '../audio/soundEngine';

const AI_INTERVAL_HINT: Record<TelechobiId, string> = {
  ton: 'Intervalo 3.02s · Pausa breve si lo vigilas en cámara',
  toso: 'Intervalo 4.97s · Nivel 20 = 100% por ciclo',
  nita: 'Intervalo 5.01s · Vigilar su cámara frena su avance',
  tis: 'Intervalo 4.97s · Nivel 20 = 100% por ciclo',
  arbol: 'Jefe N7 · Teletransportación directa · Risa grave',
  champi: 'Jefe N7 · Rueda por salas · Espantar por CCTV',
  non: 'Jefe N7 · Se arrastra por el suelo cámara a cámara',
  charro: 'Jefe N7 · Rompe lentes · Aparición directa en oficina',
  glamrock: 'Secreta · Duelo de Aura en muros (Sin cámaras)',
  tralalero: 'Secreta · Tiburón Brainrot · Espantar con CV',
};

const NIGHT_DESCRIPTIONS: Record<number, string> = {
  1: 'Turno introductorio · Llamada de Alejandro y ritmo base.',
  2: 'Aumenta la velocidad en pasillos y la sobrecarga de lentes.',
  3: 'Fallas en el timbre telefónico y amenazas múltiples.',
  4: 'Confesión de Alejandro · Tiempos de reacción exigentes.',
  5: 'El último llamado en vivo · Presión intensa en todas las rutas.',
  6: 'Turno de demolición · Incluye Cuarto Trasero y Generador eléctrico.',
  7: 'Noche Final · Dificultad máxima con turnos estrictos 1 a 1: Árbol, Champi, Ñon y El Charro Negro respetan su orden.',
};

const DURATION_PRESETS = [
  { label: '1 min', minutes: 1 },
  { label: '3 min', minutes: 3 },
  { label: '6 min (Estándar)', minutes: 6 },
  { label: '15 min', minutes: 15 },
  { label: '1 hora (60m)', minutes: 60 },
  { label: '3 horas (180m)', minutes: 180 },
  { label: '6 horas reales (360m)', minutes: 360 },
];

export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0
    ? `${hrs} ${hrs === 1 ? 'hora real' : 'horas reales'} (${minutes} min)`
    : `${hrs}h ${rem}m (${minutes} min)`;
}

interface PersonalizedNightConfiguratorProps {
  embedded?: boolean;
  initialNight?: number;
  secretUnlocked?: boolean;
  onBack?: () => void;
  onLaunch: (config: CustomNightLaunchConfig) => void;
}

export function PersonalizedNightConfigurator({
  embedded = false,
  initialNight = 6,
  secretUnlocked = false,
  onBack,
  onLaunch,
}: PersonalizedNightConfiguratorProps) {
  const visibleRoster: TelechobiId[] = secretUnlocked ? ALL_ENEMY_IDS : BASE_ENEMY_IDS;
  const [aiLevels, setAiLevels] = useState<Record<TelechobiId, number>>({ ...DEFAULT_AI_LEVELS });
  const [enableGenerator, setEnableGenerator] = useState<boolean>(true);
  const [officeId, setOfficeId] = useState<OfficeId>('main');
  const [durationMinutes, setDurationMinutes] = useState<number>(6);
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);
  const [showCheatsPrompt, setShowCheatsPrompt] = useState(false);
  const [cheats, setCheats] = useState<CheatsConfig>({ ...DEFAULT_CHEATS });

  const is1999Code =
    aiLevels.ton === 1 && aiLevels.toso === 9 && aiLevels.nita === 9 && aiLevels.tis === 9;
  const isBoss1999Code =
    !is1999Code &&
    aiLevels.arbol === 1 &&
    aiLevels.champi === 9 &&
    aiLevels.non === 9 &&
    aiLevels.charro === 9;

  const setCharAi = (id: TelechobiId, val: number) => {
    const clamped = Math.max(0, Math.min(20, Math.round(val)));
    setSelectedPresetId(null);
    setAiLevels((prev) => ({ ...prev, [id]: clamped }));
  };

  const applyPreset = (id: number, levels: Record<TelechobiId, number>) => {
    soundEngine.playClick(680);
    setSelectedPresetId(id);
    setAiLevels({ ...levels });
  };

  const toggleCheat = (key: keyof CheatsConfig) => {
    soundEngine.playClick(640);
    setCheats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfirmLaunch = (overrideCheats?: CheatsConfig) => {
    soundEngine.playClick(840);
    const activePreset =
      selectedPresetId === 0
        ? EASY_CHALLENGE_4_0.name
        : CUSTOM_NIGHT_CHALLENGES.find((c) => c.id === selectedPresetId)?.name;

    const rawCheats = overrideCheats ?? cheats;

    if (isBoss1999Code) {
      onLaunch({
        night: 7,
        isCustomAI: true,
        isSecretBrainrotNight: true,
        officeId: 'second',
        aiLevels: {
          ton: 0,
          toso: 0,
          nita: 0,
          tis: 0,
          arbol: 0,
          champi: 0,
          non: 0,
          charro: 0,
          glamrock: 20,
          tralalero: 20,
        },
        enableGeneratorRecharge: false,
        durationMinutes,
        cheats: { ...rawCheats, autoAvoidChampi: false },
        title: 'NOCHE SECRETA · AURA & BRAINROT',
      });
      return;
    }

    const effectiveCheats: CheatsConfig = {
      ...rawCheats,
      autoAvoidChampi: is1999Code ? Boolean(rawCheats.autoAvoidChampi) : false,
    };
    const anyCheatEnabled = Object.values(effectiveCheats).some(Boolean);
    const effectiveDurationMinutes = is1999Code && anyCheatEnabled ? 12 : durationMinutes;

    const launchLevels: Record<TelechobiId, number> = is1999Code
      ? {
          ton: 40,
          toso: 40,
          nita: 40,
          tis: 40,
          arbol: 40,
          champi: 40,
          non: 40,
          charro: 40,
          glamrock: 0,
          tralalero: 0,
        }
      : aiLevels;

    onLaunch({
      night: is1999Code ? 7 : initialNight,
      isCustomAI: true,
      isDefinitiveNight: is1999Code,
      officeId: is1999Code ? 'main' : officeId,
      aiLevels: launchLevels,
      enableGeneratorRecharge: is1999Code ? true : enableGenerator,
      durationMinutes: effectiveDurationMinutes,
      cheats: effectiveCheats,
      title: is1999Code ? 'NOCHE DEFINITIVA · 8/40' : activePreset || 'Personalized Night',
    });
  };

  if (showCheatsPrompt) {
    const anyDefCheat = is1999Code && Object.values(cheats).some(Boolean);
    return (
      <CheatsPromptStep
        title={is1999Code ? 'NOCHE DEFINITIVA · MODO SECRETO 8/40 (1999)' : 'PERSONALIZED NIGHT · TRUCOS'}
        subtitle={
          is1999Code
            ? `Código 1999 activado · Los 8 enemigos en Dificultad 40 · ${formatDurationLabel(
                anyDefCheat ? 12 : durationMinutes
              )}${anyDefCheat ? ' (12 min reales por usar Trucos)' : ''} · Generador ON`
            : `Clásicos (${aiLevels.ton}/${aiLevels.toso}/${aiLevels.nita}/${aiLevels.tis}) · Jefes N7 (${aiLevels.arbol}/${aiLevels.champi}/${aiLevels.non}/${aiLevels.charro}) · ${formatDurationLabel(
                durationMinutes
              )} · Generador ${enableGenerator ? 'ON' : 'OFF'}`
        }
        cheats={cheats}
        isDefinitiveNight={is1999Code}
        onToggleCheat={toggleCheat}
        onSelectAll={(enable) => {
          soundEngine.playClick(680);
          setCheats({
            noAudioErrorsInstant: enable,
            infinitePower: enable,
            doorsClosedStart: enable,
            infiniteOxygen: enable,
            radar: enable,
            infiniteHomerMoans: enable,
            autoAvoidChampi: is1999Code ? enable : false,
          });
        }}
        onBack={() => {
          soundEngine.playClick(540);
          setShowCheatsPrompt(false);
        }}
        onConfirm={() => handleConfirmLaunch()}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Header Bar */}
      <div
        className={`rust-panel-90s border-2 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 ${
          is1999Code ? 'border-red-500 shadow-[0_0_28px_rgba(220,38,38,0.35)]' : ''
        }`}
      >
        <div>
          <div className="font-mono-tech text-[10px] tracking-[0.25em] text-amber-400 uppercase">
            {is1999Code
              ? 'CÓDIGO SECRETO 1999 ACTIVADO · NOCHE DEFINITIVA (8/40)'
              : `CATEGORÍA ESPECIAL · MOTOR IA ADAPTADO (0–20 · ${visibleRoster.length} ENEMIGOS)`}
          </div>
          <h3 className="font-display text-2xl sm:text-3xl text-[#f3ebd5] tracking-wider mt-0.5">
            {is1999Code
              ? 'NOCHE DEFINITIVA · DIFICULTAD 8 / 40'
              : 'PERSONALIZED NIGHT · CONFIGURACIÓN DE TURNO'}
          </h3>
          <p className="text-xs text-[#c7bda4] mt-1">
            {is1999Code
              ? 'Fecha 1999 ingresada en los 4 Telechobis clásicos (1 / 9 / 9 / 9). Los 8 enemigos completos atacarán en Dificultad 40 con alucinaciones cada 4s.'
              : `Configura de 0 a 20 a los enemigos${
                  secretUnlocked
                    ? ' (incluidos Glamrock Aura y Tralalero Faz-Shark) y elige oficina'
                    : ''
                }. Nivel 0 = Inactivo · Nivel 20 = 100% activo por ciclo.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          {!embedded && onBack && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(540);
                onBack();
              }}
              className="min-h-[44px] px-3.5 py-2.5 bg-[#1c1915] border border-[#5c4838] text-[#e5dcc8] hover:bg-[#2a241d] font-mono-tech text-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          )}
          <button
            type="button"
            onClick={() => handleConfirmLaunch({ ...DEFAULT_CHEATS })}
            className={`min-h-[44px] flex-1 sm:flex-initial justify-center px-4 py-2.5 border font-display text-base sm:text-lg tracking-wider cursor-pointer inline-flex items-center gap-2 shadow-lg ${
              is1999Code
                ? 'bg-red-600 text-white hover:bg-red-500 border-red-300'
                : 'bg-[#c9bfa4] text-black hover:bg-amber-300 border-[#5e533e]'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{is1999Code ? 'JUGAR NORMAL (8/40)' : 'JUGAR NORMAL'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(780);
              setShowCheatsPrompt(true);
            }}
            className="min-h-[44px] flex-1 sm:flex-initial justify-center px-4 py-2.5 bg-emerald-950/85 text-emerald-200 hover:bg-emerald-900 border border-emerald-500/70 font-display text-base sm:text-lg tracking-wider cursor-pointer inline-flex items-center gap-2 shadow-lg"
          >
            <Sparkles className="w-4 h-4" />
            <span>USAR TRUCOS</span>
          </button>
        </div>
      </div>

      {is1999Code && (
        <div className="border-2 border-red-600/80 bg-[#1e0706]/95 p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="font-mono-tech text-[11px] font-bold text-red-300 tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>MODO SECRETO DESBLOQUEADO · TODOS LOS 8 ENEMIGOS EN NIVEL 40</span>
            </div>
            <p className="text-xs text-[#dfd5bd]">
              Ton, Toso, Nita, Tis, Árbol, Champi, Ñon y El Charro Negro se ajustan automáticamente
              a <strong>Dificultad 40 (8/40)</strong>. No altera el progreso de campaña.
            </p>
          </div>
          <div className="px-3.5 py-1.5 bg-black/80 border border-red-500 font-display text-2xl text-red-400 tabular-nums">
            8 / 40
          </div>
        </div>
      )}

      {/* Animatronic AI 0-20 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleRoster.map((id) => {
          const meta = TELECHOBIS[id];
          const level = aiLevels[id];
          return (
            <div
              key={id}
              className="relative rust-panel-90s border-2 p-4 flex flex-col justify-between gap-3 overflow-hidden"
            >
              <CobwebCorner position="top-right" className="w-10 h-10 opacity-35" />

              <div className="flex items-center gap-3">
                <div className="w-16 h-20 shrink-0 bg-black/70 border border-[#4d3d30] flex items-end justify-center overflow-hidden">
                  <img
                    src={meta.spritePath}
                    alt={meta.name}
                    referrerPolicy="no-referrer"
                    className="h-[92%] w-auto object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-display text-2xl text-[#efe7d2] leading-none">
                      {meta.name}
                    </h4>
                  </div>
                  <p className="font-mono-tech text-[10px] text-amber-300/90 mt-1 leading-tight">
                    {AI_INTERVAL_HINT[id]}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(520);
                      setCharAi(id, level - 1);
                    }}
                    className="w-11 h-11 bg-[#1a1612] border border-[#5c4838] hover:border-amber-400 text-[#efe7d2] flex items-center justify-center cursor-pointer"
                    aria-label={`Bajar IA de ${meta.name}`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="text-center">
                    <div
                      className={`font-display text-3xl leading-none tabular-nums ${
                        level === 0
                          ? 'text-zinc-500'
                          : level === 20
                            ? 'text-red-400'
                            : 'text-amber-300'
                      }`}
                    >
                      {level}
                    </div>
                    <div className="font-mono-tech text-[9px] text-[#9c9179]">
                      {level === 0 ? 'INACTIVO' : `PROB ${Math.round((level / 20) * 100)}%`}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(680);
                      setCharAi(id, level + 1);
                    }}
                    className="w-11 h-11 bg-[#1a1612] border border-[#5c4838] hover:border-amber-400 text-[#efe7d2] flex items-center justify-center cursor-pointer"
                    aria-label={`Aumentar IA de ${meta.name}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <input
                  type="range"
                  min={0}
                  max={20}
                  value={level}
                  onChange={(e) => setCharAi(id, Number(e.target.value))}
                  className="w-full h-7 sm:h-6 accent-amber-400 cursor-pointer"
                  aria-label={`Nivel de IA para ${meta.name}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Night Duration + Generator Recharge Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Duration 1 min - 360 min (6 real hours) */}
        <div className="lg:col-span-7 rust-panel-90s border-2 p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono-tech text-xs font-bold text-amber-300">
              <Clock className="w-4 h-4" />
              <span>DURACIÓN DE LA NOCHE (1 MIN HASTA 6 HORAS REALES)</span>
            </div>
            <span className="px-2.5 py-0.5 bg-black/80 border border-amber-500/60 font-mono-tech text-xs text-amber-200 font-bold">
              {formatDurationLabel(durationMinutes)}
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={360}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-full h-7 sm:h-6 accent-amber-400 cursor-pointer"
            aria-label="Duración de la noche en minutos"
          />

          <div className="flex flex-wrap gap-1.5">
            {DURATION_PRESETS.map((preset) => (
              <button
                key={preset.minutes}
                type="button"
                onClick={() => {
                  soundEngine.playClick(620);
                  setDurationMinutes(preset.minutes);
                }}
                className={`min-h-[38px] px-2.5 py-1.5 border font-mono-tech text-[10px] cursor-pointer transition-colors ${
                  durationMinutes === preset.minutes
                    ? 'bg-amber-400 text-black border-amber-200 font-bold'
                    : 'bg-[#1a1612] text-[#d6ccb4] border-[#4d3d30] hover:border-amber-400'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Back Room Energy Generator Toggle */}
        <div className="lg:col-span-5 rust-panel-90s border-2 p-4 sm:p-5 flex flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono-tech text-xs font-bold text-emerald-300">
              <BatteryCharging className="w-4 h-4" />
              <span>RECARGA DE ENERGÍA (GENERADOR TRASERO)</span>
            </div>
            <p className="text-xs text-[#c7bda4] leading-relaxed">
              Activa o desactiva la habitación trasera para recargar la batería al 100% durante tu
              turno personalizado.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(700);
                setEnableGenerator(true);
              }}
              className={`min-h-[44px] py-2.5 px-3 border font-mono-tech text-xs font-bold cursor-pointer transition-colors ${
                enableGenerator
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                  : 'bg-[#1a1612] border-[#4d3d30] text-[#9b9079] hover:text-white'
              }`}
            >
              ACTIVAR GENERADOR
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(540);
                setEnableGenerator(false);
              }}
              className={`min-h-[44px] py-2.5 px-3 border font-mono-tech text-xs font-bold cursor-pointer transition-colors ${
                !enableGenerator
                  ? 'bg-red-950/85 border-red-400 text-red-200'
                  : 'bg-[#1a1612] border-[#4d3d30] text-[#9b9079] hover:text-white'
              }`}
            >
              DESACTIVAR
            </button>
          </div>
        </div>
      </div>

      {/* Office Selection (unlocked after clearing Secret Night) */}
      {secretUnlocked && (
        <div className="rust-panel-90s border-2 border-amber-500/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="font-mono-tech text-xs font-bold text-amber-300">
              SELECCIÓN DE OFICINA (PERSONALIZED NIGHT)
            </div>
            <p className="text-xs text-[#c7bda4]">
              Juega con los 10 animatrónicos en el Foro 4 original o en la Segunda Oficina de 4
              muros.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(640);
                setOfficeId('main');
              }}
              className={`min-h-[44px] px-3.5 py-2 border font-mono-tech text-xs font-bold cursor-pointer ${
                officeId === 'main'
                  ? 'bg-amber-400 text-black border-amber-200'
                  : 'bg-[#1a1612] text-[#d6ccb4] border-[#4d3d30] hover:border-amber-400'
              }`}
            >
              OFICINA PRINCIPAL
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(700);
                setOfficeId('second');
              }}
              className={`min-h-[44px] px-3.5 py-2 border font-mono-tech text-xs font-bold cursor-pointer ${
                officeId === 'second'
                  ? 'bg-amber-400 text-black border-amber-200'
                  : 'bg-[#1a1612] text-[#d6ccb4] border-[#4d3d30] hover:border-amber-400'
              }`}
            >
              SEGUNDA OFICINA
            </button>
          </div>
        </div>
      )}

      {/* Easy 4/0 + 20 Personalized Challenges */}
      <div className="rust-panel-90s border-2 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#3d3024] pb-3">
          <div>
            <div className="font-mono-tech text-[10px] tracking-[0.22em] text-amber-400 uppercase flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" />
              20 RETOS PROGRESIVOS · DESDE FÁCIL 4/0 HASTA EXTREMA 4/20
            </div>
            <h4 className="font-display text-xl text-[#efe7d2] mt-0.5">
              PLANTILLAS Y DESAFÍOS DE PERSONALIZED NIGHT
            </h4>
          </div>

          <button
            type="button"
            onClick={() => applyPreset(EASY_CHALLENGE_4_0.id, EASY_CHALLENGE_4_0.aiLevels)}
            className={`px-3.5 py-2 border font-mono-tech text-xs font-bold cursor-pointer transition-colors ${
              selectedPresetId === 0
                ? 'bg-emerald-400 text-black border-emerald-200'
                : 'bg-[#12261c] border-emerald-600/70 text-emerald-200 hover:bg-emerald-950'
            }`}
          >
            {EASY_CHALLENGE_4_0.name} (0 en los 8)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {CUSTOM_NIGHT_CHALLENGES.map((ch) => {
            const isSelected = selectedPresetId === ch.id;
            const isExtreme = ch.difficulty === 20;
            const hasBosses =
              ch.aiLevels.arbol > 0 ||
              ch.aiLevels.champi > 0 ||
              ch.aiLevels.non > 0 ||
              ch.aiLevels.charro > 0;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => applyPreset(ch.id, ch.aiLevels)}
                className={`text-left p-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400/20 border-amber-400 ring-1 ring-amber-400'
                    : isExtreme
                      ? 'bg-[#2a0c0a]/85 border-red-600/70 hover:border-red-400'
                      : 'bg-black/65 border-[#4d3d30] hover:border-amber-400/70'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono-tech text-[11px] font-bold truncate ${
                      isExtreme ? 'text-red-300' : 'text-amber-200'
                    }`}
                  >
                    {ch.name}
                  </span>
                </div>
                <div className="font-mono-tech text-[10px] text-[#b4aa92] mt-1 truncate">
                  {ch.subtitle}
                </div>
                <div className="font-mono-tech text-[10px] text-[#e5dcc6] mt-1.5">
                  {hasBosses
                    ? `Clásicos: ${ch.aiLevels.ton}/${ch.aiLevels.toso}/${ch.aiLevels.nita}/${ch.aiLevels.tis} · N7: ${ch.aiLevels.arbol}/${ch.aiLevels.champi}/${ch.aiLevels.non}/${ch.aiLevels.charro}`
                    : `IA: ${ch.aiLevels.ton} / ${ch.aiLevels.toso} / ${ch.aiLevels.nita} / ${ch.aiLevels.tis}`}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export interface CheatsPromptStepProps {
  title: string;
  subtitle: string;
  cheats: CheatsConfig;
  isDefinitiveNight?: boolean;
  onToggleCheat: (key: keyof CheatsConfig) => void;
  onSelectAll: (enable: boolean) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function CheatsPromptStep({
  title,
  subtitle,
  cheats,
  isDefinitiveNight = false,
  onToggleCheat,
  onSelectAll,
  onBack,
  onConfirm,
}: CheatsPromptStepProps) {
  const cheatItems: Array<{
    key: keyof CheatsConfig;
    label: string;
    desc: string;
    icon: typeof Volume2;
    exclusiveDefinitive?: boolean;
  }> = [
    {
      key: 'noAudioErrorsInstant',
      label: 'Audio sin Errores y Recarga Instantánea',
      desc: 'El timbre de audio en cámaras nunca cae por cortocircuito y se recarga al instante (0s).',
      icon: Volume2,
    },
    {
      key: 'infinitePower',
      label: 'Energía Infinita (100%)',
      desc: 'La batería se mantiene fija en 100% sin desgaste ni apagón eléctrico.',
      icon: Zap,
    },
    {
      key: 'doorsClosedStart',
      label: 'Puertas Izquierda y Derecha Cerradas al Iniciar',
      desc: 'Comienza la noche con ambas compuertas metálicas ya selladas desde las 12:00 AM.',
      icon: Shield,
    },
    {
      key: 'infiniteOxygen',
      label: 'Oxígeno Infinito + Visión Completa con Máscara',
      desc: 'Oxígeno fijo al 100%; puedes girar a ambas puertas, ver cámaras, audio y generador con la Máscara puesta.',
      icon: Sparkles,
    },
    {
      key: 'radar',
      label: 'Radar (Kit de Supervivencia)',
      desc: 'Al abrir las cámaras, muestra en tiempo real los iconos de todos los animatrónicos y jefes sobre el mapa del Foro 4.',
      icon: Radar,
    },
    {
      key: 'infiniteHomerMoans',
      label: 'Gemidos de Homero Infinitos (Equilibrado)',
      desc: 'Reproduce el audio de Homero en bucle continuo con volumen equilibrado para seguir oyendo pasos, risas y ventilación.',
      icon: Radio,
    },
    ...(isDefinitiveNight
      ? [
          {
            key: 'autoAvoidChampi' as keyof CheatsConfig,
            label: 'Evitar a Champi Automáticamente (Exclusivo Definitiva)',
            desc: 'Aunque no abras las cámaras, cuando Champi llegue a CAM 01 o CAM 02 será evitado y expulsado de forma automática.',
            icon: Flame,
            exclusiveDefinitive: true,
          },
        ]
      : []),
  ];

  const activeCount = cheatItems.filter((item) => Boolean(cheats[item.key])).length;

  return (
    <div className="max-w-3xl mx-auto rust-panel-90s border-2 p-4 sm:p-7 space-y-4 sm:space-y-5 shadow-[0_24px_70px_rgba(0,0,0,0.96)]">
      <div className="border-b border-[#4d3d30] pb-3">
        <div className="font-mono-tech text-[10px] tracking-[0.24em] text-amber-400 uppercase">
          {title}
        </div>
        <h3 className="font-display text-2xl sm:text-3xl text-[#f3ebd5] tracking-wider mt-1">
          SELECCIONA LOS TRUCOS QUE QUIERAS ACTIVAR
        </h3>
        <p className="font-mono-tech text-xs text-[#c7bda4] mt-1">{subtitle}</p>
      </div>

      {isDefinitiveNight && (
        <div className="border-2 border-red-600/80 bg-[#1e0706]/95 p-3.5 space-y-1">
          <div className="font-mono-tech text-[11px] font-bold text-red-300 tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>CONTRAPARTIDA DE TRUCOS EN NOCHE DEFINITIVA: 12 MINUTOS REALES</span>
          </div>
          <p className="text-xs text-[#dfd5bd] leading-relaxed">
            A cambio de activar cualquier truco en la Noche Definitiva (8/40), la duración del turno
            aumentará a <strong>12 minutos reales</strong> y las alucinaciones cada 4s seguirán
            activas.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono-tech text-xs text-amber-300">
          Trucos activos: {activeCount} / {cheatItems.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectAll(true)}
            className="min-h-[40px] px-3 py-1.5 bg-[#1e1a15] border border-amber-500/60 text-amber-200 hover:bg-amber-950 font-mono-tech text-[11px] cursor-pointer"
          >
            Activar los {cheatItems.length}
          </button>
          <button
            type="button"
            onClick={() => onSelectAll(false)}
            className="min-h-[40px] px-3 py-1.5 bg-[#1e1a15] border border-[#5c4838] text-[#c7bda4] hover:text-white font-mono-tech text-[11px] cursor-pointer"
          >
            Sin Trucos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cheatItems.map((item) => {
          const Icon = item.icon;
          const active = Boolean(cheats[item.key]);
          const isExclusive = Boolean(item.exclusiveDefinitive);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggleCheat(item.key)}
              className={`text-left p-4 border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isExclusive ? 'sm:col-span-2 ' : ''
              }${
                active
                  ? isExclusive
                    ? 'bg-red-950/75 border-amber-400 shadow-[0_0_24px_rgba(245,158,11,0.28)]'
                    : 'bg-emerald-950/65 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : isExclusive
                    ? 'bg-[#1a0b09]/85 border-red-700/75 hover:border-amber-400'
                    : 'bg-black/65 border-[#4d3d30] hover:border-amber-400/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active
                        ? isExclusive
                          ? 'text-amber-300'
                          : 'text-emerald-300'
                        : isExclusive
                          ? 'text-red-300'
                          : 'text-amber-300'
                    }`}
                  />
                  <span className="font-display text-lg text-[#f3ebd5] leading-snug">
                    {item.label}
                  </span>
                </div>
                <span
                  className={`w-5 h-5 border shrink-0 flex items-center justify-center ${
                    active
                      ? 'bg-emerald-400 border-emerald-200 text-black'
                      : 'border-[#5c4838] bg-[#161310]'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </span>
              </div>
              <p className="text-xs text-[#cfc5ab] leading-relaxed">{item.desc}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] px-5 py-3 bg-[#1d1a16] border border-[#5c4838] text-[#e5dcc8] hover:bg-[#2a241d] font-display text-lg tracking-wider cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Atrás</span>
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-[44px] flex-1 py-3 px-6 bg-[#c9bfa4] text-black hover:bg-amber-300 border border-[#5e533e] font-display text-xl tracking-wider cursor-pointer inline-flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>COMENZAR TURNO</span>
        </button>
      </div>
    </div>
  );
}

interface NightSelectorPanelProps {
  initialNight?: number;
  allowPickOtherNight?: boolean;
  secretUnlocked?: boolean;
  onLaunch: (config: CustomNightLaunchConfig) => void;
  onClose?: () => void;
}

export function NightSelectorPanel({
  initialNight,
  allowPickOtherNight = true,
  secretUnlocked = false,
  onLaunch,
  onClose,
}: NightSelectorPanelProps) {
  const [selectedNight, setSelectedNight] = useState<number | null>(initialNight ?? null);
  const [step, setStep] = useState<'pick_night' | 'mode_choice' | 'custom_config' | 'cheats'>(
    initialNight ? 'mode_choice' : 'pick_night'
  );
  const [isCustomAI, setIsCustomAI] = useState(false);
  const [aiLevels, setAiLevels] = useState<Record<TelechobiId, number>>({ ...DEFAULT_AI_LEVELS });
  const [enableGenerator, setEnableGenerator] = useState(
    initialNight ? initialNight >= 6 : true
  );
  const [durationMinutes, setDurationMinutes] = useState(6);
  const [cheats, setCheats] = useState<CheatsConfig>({ ...DEFAULT_CHEATS });

  const startNightFlow = (nightNum: number) => {
    soundEngine.playClick(680);
    setSelectedNight(nightNum);
    setEnableGenerator(nightNum >= 6);
    setDurationMinutes(6);
    setCheats({ ...DEFAULT_CHEATS });
    setStep('mode_choice');
  };

  if (step === 'cheats' && selectedNight !== null) {
    return (
      <CheatsPromptStep
        title={`NOCHE ${selectedNight} · SELECCIÓN DE TRUCOS`}
        subtitle={
          isCustomAI
            ? `Dificultad Personalizada (${aiLevels.ton}/${aiLevels.toso}/${aiLevels.nita}/${aiLevels.tis} · N7 ${aiLevels.arbol}/${aiLevels.champi}/${aiLevels.non}/${aiLevels.charro}) · ${formatDurationLabel(
                durationMinutes
              )}`
            : `Modo Normal del Juego · Noche ${selectedNight}`
        }
        cheats={cheats}
        onToggleCheat={(key) => {
          soundEngine.playClick(640);
          setCheats((p) => ({ ...p, [key]: !p[key] }));
        }}
        onSelectAll={(enable) => {
          soundEngine.playClick(680);
          setCheats({
            noAudioErrorsInstant: enable,
            infinitePower: enable,
            doorsClosedStart: enable,
            infiniteOxygen: enable,
            radar: enable,
            infiniteHomerMoans: enable,
            autoAvoidChampi: false,
          });
        }}
        onBack={() => {
          soundEngine.playClick(540);
          setStep(isCustomAI ? 'custom_config' : 'mode_choice');
        }}
        onConfirm={() => {
          soundEngine.playClick(840);
          onLaunch({
            night: selectedNight,
            isCustomAI,
            fromNightSelector: allowPickOtherNight,
            aiLevels,
            enableGeneratorRecharge: enableGenerator,
            durationMinutes,
            cheats: { ...cheats, autoAvoidChampi: false },
            title: isCustomAI ? `Noche ${selectedNight} Personalizada` : `Noche ${selectedNight}`,
          });
        }}
      />
    );
  }

  if (step === 'custom_config' && selectedNight !== null) {
    return (
      <PersonalizedNightConfigurator
        initialNight={selectedNight}
        secretUnlocked={secretUnlocked}
        onBack={() => setStep('mode_choice')}
        onLaunch={(cfg) =>
          onLaunch({
            ...cfg,
            night: cfg.isDefinitiveNight || cfg.isSecretBrainrotNight ? 7 : selectedNight,
            fromNightSelector:
              cfg.isDefinitiveNight || cfg.isSecretBrainrotNight ? false : allowPickOtherNight,
          })
        }
      />
    );
  }

  if (step === 'mode_choice' && selectedNight !== null) {
    return (
      <div className="max-w-3xl mx-auto rust-panel-90s border-2 p-4 sm:p-8 space-y-5 sm:space-y-6 shadow-[0_24px_70px_rgba(0,0,0,0.96)]">
        <div className="flex items-start justify-between gap-3 sm:gap-4 border-b border-[#4d3d30] pb-4">
          <div>
            <div className="font-mono-tech text-[10px] tracking-[0.24em] text-amber-400 uppercase">
              NOCHE {selectedNight} SELECCIONADA
            </div>
            <h3 className="font-display text-2xl sm:text-4xl text-[#f3ebd5] tracking-wider mt-1">
              ¿QUIERES JUGAR LA NOCHE {selectedNight} NORMAL O CON TRUCOS?
            </h3>
            <p className="text-xs text-[#c7bda4] mt-1">{NIGHT_DESCRIPTIONS[selectedNight]}</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center bg-[#1c1915] border border-[#5c4838] text-[#cfc5ab] hover:text-white cursor-pointer"
              aria-label="Cerrar selector"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(820);
              onLaunch({
                night: selectedNight,
                isCustomAI: false,
                fromNightSelector: allowPickOtherNight,
                aiLevels: { ...DEFAULT_AI_LEVELS },
                enableGeneratorRecharge: selectedNight >= 6,
                durationMinutes: 6,
                cheats: { ...DEFAULT_CHEATS },
                title: `Noche ${selectedNight}`,
              });
            }}
            className="text-left p-5 border-2 border-[#5c4838] hover:border-amber-400 bg-black/65 space-y-2 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 font-display text-2xl text-amber-300 tracking-wide">
              <Play className="w-5 h-5 fill-current" />
              <span>JUGAR NORMAL (SIN TRUCOS)</span>
            </div>
            <p className="text-xs text-[#d6ccb4] leading-relaxed">
              {selectedNight === 7
                ? 'Juega la Noche 7 oficial sin ayudas: los 4 Telechobis apagados, llamada de Ricardo Salinas Pliego y los 4 Jefes Finales.'
                : `Juega la Noche ${selectedNight} en su modo oficial original sin trucos, con duración estándar de 6 minutos y guardado en Firebase.`}
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(740);
              setIsCustomAI(false);
              setEnableGenerator(selectedNight >= 6);
              setDurationMinutes(6);
              setCheats({ ...DEFAULT_CHEATS });
              setStep('cheats');
            }}
            className="text-left p-5 border-2 border-[#5c4838] hover:border-emerald-400 bg-black/65 space-y-2 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 font-display text-2xl text-emerald-300 tracking-wide">
              <Sparkles className="w-5 h-5" />
              <span>JUGAR USANDO LOS TRUCOS</span>
            </div>
            <p className="text-xs text-[#d6ccb4] leading-relaxed">
              Elige exactamente qué trucos activar para la Noche {selectedNight}: Radar, Gemidos de
              Homero Infinitos, Energía Infinita, Oxígeno Infinito, Puertas Cerradas o Audio sin
              Errores.
            </p>
          </button>

          {allowPickOtherNight && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick(740);
                setIsCustomAI(true);
                if (selectedNight === 7) {
                  setAiLevels({
                    ton: 0,
                    toso: 0,
                    nita: 0,
                    tis: 0,
                    arbol: 12,
                    champi: 12,
                    non: 12,
                    charro: 12,
                    glamrock: 0,
                    tralalero: 0,
                  });
                } else {
                  setAiLevels({
                    ton: Math.min(20, selectedNight * 3),
                    toso: Math.min(20, selectedNight * 3),
                    nita: Math.min(20, selectedNight * 2 + 1),
                    tis: Math.min(20, selectedNight * 3),
                    arbol: 0,
                    champi: 0,
                    non: 0,
                    charro: 0,
                    glamrock: 0,
                    tralalero: 0,
                  });
                }
                setStep('custom_config');
              }}
              className="sm:col-span-2 text-left p-4 border border-[#4d3d30] hover:border-amber-400/80 bg-[#14110e]/85 flex flex-wrap items-center justify-between gap-3 cursor-pointer transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 font-display text-xl text-[#efe7d2] tracking-wide">
                  <Sliders className="w-4 h-4 text-amber-300" />
                  <span>PERSONALIZAR DIFICULTAD (IA 0–20 · PERSONALIZED NIGHT)</span>
                </div>
                <p className="text-xs text-[#b4aa92] mt-0.5">
                  Ajusta la IA (0–20) de los 8 enemigos, duración de 1 min a 6 horas y luego elige
                  jugar Normal o con Trucos.
                </p>
              </div>
            </button>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(540);
              if (allowPickOtherNight) {
                setStep('pick_night');
              } else if (onClose) {
                onClose();
              }
            }}
            className="min-h-[44px] px-4 py-2 bg-[#1c1915] border border-[#5c4838] text-[#dfd5bd] hover:bg-[#2a241d] font-mono-tech text-xs cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {allowPickOtherNight ? 'Elegir otra Noche' : 'Volver al Menú'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto rust-panel-90s border-2 p-4 sm:p-7 space-y-4 sm:space-y-5 shadow-[0_24px_70px_rgba(0,0,0,0.96)]">
      <div className="flex items-start justify-between gap-3 sm:gap-4 border-b border-[#4d3d30] pb-4">
        <div>
          <div className="font-mono-tech text-[10px] tracking-[0.25em] text-amber-400 uppercase">
            ARCHIVO DE TURNOS · FORO 4 AJUSCO
          </div>
          <h3 className="font-display text-2xl sm:text-4xl text-[#f3ebd5] tracking-wider mt-0.5">
            SELECCIONAR NOCHE (1 – 7)
          </h3>
          <p className="text-xs text-[#c7bda4] mt-1">
            Elige cualquier noche del 1 al 7 para jugarla en Modo Normal, personalizar la dificultad
            de los 8 enemigos y activar trucos opcionales.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(540);
              onClose();
            }}
            className="min-w-[44px] min-h-[44px] shrink-0 flex items-center justify-center bg-[#1c1915] border border-[#5c4838] text-[#cfc5ab] hover:text-white cursor-pointer"
            aria-label="Cerrar selección de noche"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7].map((nightNum) => (
          <button
            key={nightNum}
            type="button"
            onClick={() => startNightFlow(nightNum)}
            className={`group relative text-left p-5 border-2 transition-all cursor-pointer overflow-hidden space-y-2 ${
              nightNum === 7
                ? 'bg-[#200908]/90 border-red-700/80 hover:border-red-400'
                : 'bg-black/70 border-[#4d3d30] hover:border-amber-400'
            }`}
          >
            <CobwebCorner position="top-right" className="w-10 h-10 opacity-35" />
            <div className="flex items-center justify-between">
              <span
                className={`font-display text-3xl transition-colors ${
                  nightNum === 7
                    ? 'text-red-300 group-hover:text-red-200'
                    : 'text-[#f3ebd5] group-hover:text-amber-300'
                }`}
              >
                NOCHE {nightNum}
              </span>
              <span className="px-2 py-0.5 bg-[#1e1a15] border border-[#5c4838] font-mono-tech text-[10px] text-amber-300">
                12AM – 6AM
              </span>
            </div>
            <p className="text-xs text-[#c9bfa4] leading-relaxed">
              {NIGHT_DESCRIPTIONS[nightNum]}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

interface NightSetupModalProps {
  initialNight?: number;
  allowPickOtherNight?: boolean;
  secretUnlocked?: boolean;
  onClose: () => void;
  onLaunch: (config: CustomNightLaunchConfig) => void;
}

export function NightSetupModal({
  initialNight,
  allowPickOtherNight = true,
  secretUnlocked = false,
  onClose,
  onLaunch,
}: NightSetupModalProps) {
  return (
    <div className="fixed inset-0 h-dvh z-50 bg-black/90 backdrop-blur-sm overflow-y-auto p-3 sm:p-8 flex justify-center">
      <div className="w-full my-auto">
        <NightSelectorPanel
          initialNight={initialNight}
          allowPickOtherNight={allowPickOtherNight}
          secretUnlocked={secretUnlocked}
          onLaunch={onLaunch}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
