import { useState } from 'react';
import { ArrowLeft, Box, FileText, Skull, Play } from 'lucide-react';
import { JumpscareSource, OFFICE_ASSETS, TELECHOBIS, TelechobiId } from '../types/game';
import { Telechobi3DViewer } from './Telechobi3DViewer';
import { CobwebCorner, TelechobiSprite } from './TelechobiArt';
import { soundEngine } from '../audio/soundEngine';

interface ExtrasModalProps {
  onBack: () => void;
}

type ExtrasTab = 'models3d' | 'jumpscares' | 'files';
const ROSTER: TelechobiId[] = ['ton', 'toso', 'nita', 'tis'];

const JUMPSCARE_ANIM_MAP: Record<JumpscareSource, Record<TelechobiId, string>> = {
  door: {
    ton: 'animate-jumpscare-door-ton',
    toso: 'animate-jumpscare-door-toso',
    nita: 'animate-jumpscare-door-nita',
    tis: 'animate-jumpscare-door-tis',
  },
  hallway: {
    ton: 'animate-jumpscare-hall-ton',
    toso: 'animate-jumpscare-hall-toso',
    nita: 'animate-jumpscare-hall-nita',
    tis: 'animate-jumpscare-hall-tis',
  },
};

const LAWSUIT_DOCUMENTS = [
  {
    code: 'EXPEDIENTE BBC-MEX-1999/041',
    title: 'Notificación de Demanda Internacional por Plagio',
    date: '14 de Abril de 1999',
    classification: 'CONFIDENCIAL · DIRECCIÓN JURÍDICA TV AZTECA',
    body: `La British Broadcasting Corporation (BBC) y Ragdoll Productions han interpuesto recurso de embargo inmediato contra la emisión y mercancía del programa infantil "TeLeChOBiS", tras comprobarse similitud sustancial en siluetas, paleta de colores y formato televisivo con la franquicia británica "Teletubbies". Se ordena la cancelación fulminante de las grabaciones en el Foro 4 de Estudios Ajusco y la retención indefinida de las cuatro botargas motorizadas.`,
  },
  {
    code: 'MEMO INTERNO PROD-99/118',
    title: 'Anomalías en Endoesqueletos Neumáticos de las Botargas',
    date: '02 de Agosto de 1999',
    classification: 'USO INTERNO · DEPARTAMENTO DE TALLER Y VESTUARIO',
    body: `Debido al presupuesto de emergencia de 1998, las cabezas de Ton, Toso, Nita y Tis fueron adaptadas sobre armazones metálicos reciclados con servomotores de movimiento facial continuo para tomas en vivo. Desde el corte eléctrico del Foro 4, el personal de limpieza reporta que las botargas abandonan el cuarto de vestuario durante la madrugada y responden agresivamente al timbre de los teléfonos antiguos instalados en las oficinas.`,
  },
  {
    code: 'ACTA DE DEMOLICIÓN AJUSCO-99/309',
    title: 'Orden de Sellado del Pasillo Central y Contratación de Guardia',
    date: '10 de Noviembre de 1999',
    classification: 'ARCHIVO DE SEGURIDAD INDUSTRIAL',
    body: `Se instruye al guardia nocturno contratado mediante clasificado mantener cerradas las compuertas metálicas laterales ante cualquier avistamiento y portar en todo momento la máscara hueca de repuesto sobre el escritorio. Si alguna unidad avanza directamente por el pasillo central hacia la oficina de producción, las puertas laterales no detendrán el ingreso; únicamente el camuflaje facial desactiva temporalmente su reconocimiento óptico.`,
  },
];

export function ExtrasModal({ onBack }: ExtrasModalProps) {
  const [tab, setTab] = useState<ExtrasTab>('models3d');
  const [selectedChar, setSelectedChar] = useState<TelechobiId>('ton');
  const [wireframeEndo, setWireframeEndo] = useState(false);
  const [spotlightTint, setSpotlightTint] = useState<'amber' | 'cold' | 'blood'>('amber');
  const [previewJumpscare, setPreviewJumpscare] = useState<{
    id: TelechobiId;
    source: JumpscareSource;
  } | null>(null);

  const meta = TELECHOBIS[selectedChar];

  const triggerJumpscarePreview = (id: TelechobiId, source: JumpscareSource) => {
    setPreviewJumpscare({ id, source });
    soundEngine.playJumpscare(id, source);
    window.setTimeout(() => setPreviewJumpscare(null), 1380);
  };

  return (
    <div className="relative w-screen h-screen bg-[#070709] text-zinc-100 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-[#4d3d30] rust-panel-90s shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(560);
              onBack();
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono-tech bg-[#1c1915] border border-[#5c4838] text-[#dfd5bd] hover:bg-[#2a241d] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div>
            <h2 className="font-display text-xl sm:text-2xl tracking-wider text-amber-300 leading-none">
              EXTRAS · ARCHIVO DESCLASIFICADO
            </h2>
            <p className="text-[11px] font-mono-tech text-[#b4aa92] mt-1">
              Desbloqueado por completar la Noche 6 · 8 Jumpscares Registrados
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(640);
              setTab('models3d');
            }}
            className={`px-3.5 py-2 text-xs font-mono-tech inline-flex items-center gap-2 border cursor-pointer ${
              tab === 'models3d'
                ? 'bg-amber-400 text-black border-amber-200 font-bold'
                : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
            }`}
          >
            <Box className="w-4 h-4" />
            Modelos 3D
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(640);
              setTab('jumpscares');
            }}
            className={`px-3.5 py-2 text-xs font-mono-tech inline-flex items-center gap-2 border cursor-pointer ${
              tab === 'jumpscares'
                ? 'bg-amber-400 text-black border-amber-200 font-bold'
                : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
            }`}
          >
            <Skull className="w-4 h-4" />
            Jumpscares (8)
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick(640);
              setTab('files');
            }}
            className={`px-3.5 py-2 text-xs font-mono-tech inline-flex items-center gap-2 border cursor-pointer ${
              tab === 'files'
                ? 'bg-amber-400 text-black border-amber-200 font-bold'
                : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Archivos Confidenciales
          </button>
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1 overflow-y-auto p-6">
        {tab === 'models3d' && (
          <div className="h-full min-h-[540px] flex flex-col relative border border-[#4d3d30] bg-black overflow-hidden">
            <div className="flex-1 relative">
              <Telechobi3DViewer
                characterId={selectedChar}
                wireframeEndo={wireframeEndo}
                spotlightTint={spotlightTint}
              />

              <div className="pointer-events-none absolute top-4 left-4 bg-black/85 border border-[#4d3d30] px-4 py-3 max-w-sm">
                <h3 className="font-display text-2xl text-zinc-100">{meta.name}</h3>
                <p className="font-mono-tech text-[11px] text-amber-400">{meta.role}</p>
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">{meta.description}</p>
              </div>
            </div>

            <div className="rust-panel-90s border-t border-[#4d3d30] px-5 py-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {ROSTER.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(680);
                      setSelectedChar(id);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-mono-tech border cursor-pointer ${
                      selectedChar === id
                        ? 'bg-[#d6ccb4] text-black border-white font-bold'
                        : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
                    }`}
                  >
                    {TELECHOBIS[id].name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playClick(600);
                    setWireframeEndo((w) => !w);
                  }}
                  className={`px-3 py-1.5 text-xs font-mono-tech border cursor-pointer ${
                    wireframeEndo
                      ? 'bg-red-950 text-red-200 border-red-500'
                      : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838]'
                  }`}
                >
                  {wireframeEndo ? 'Modo Endoesqueleto: ON' : 'Modo Endoesqueleto: OFF'}
                </button>

                <div className="flex items-center gap-1 border border-[#5c4838] p-0.5 bg-[#161310]">
                  {(['amber', 'cold', 'blood'] as const).map((tint) => (
                    <button
                      key={tint}
                      type="button"
                      onClick={() => setSpotlightTint(tint)}
                      className={`px-2.5 py-1 text-[11px] font-mono-tech cursor-pointer ${
                        spotlightTint === tint ? 'bg-[#d6ccb4] text-black font-bold' : 'text-[#a39982]'
                      }`}
                    >
                      {tint === 'amber' ? 'Luz Ámbar' : tint === 'cold' ? 'Luz Fría' : 'Luz Roja'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'jumpscares' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ROSTER.map((id) => {
              const char = TELECHOBIS[id];
              return (
                <div
                  key={id}
                  className="relative rust-panel-90s border-2 p-4 flex flex-col justify-between gap-4 overflow-hidden"
                >
                  <CobwebCorner position="top-right" className="w-12 h-12 opacity-35" />
                  <div className="h-52 bg-black border border-[#3d3024] flex items-center justify-center overflow-hidden">
                    <TelechobiSprite id={id} variant="menu" twitchState={2} className="h-full" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl text-[#ebe3ce]">{char.name}</h3>
                    <p className="text-xs text-[#b7ad96] mt-1 leading-relaxed">
                      {char.behaviorNote}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => triggerJumpscarePreview(id, 'door')}
                      className="w-full py-2 px-3 bg-[#4a1812] border border-red-600/70 text-red-100 hover:bg-red-900 font-mono-tech text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Jumpscare Puerta
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerJumpscarePreview(id, 'hallway')}
                      className="w-full py-2 px-3 bg-[#2a190d] border border-amber-600/70 text-amber-100 hover:bg-amber-900 font-mono-tech text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Jumpscare Pasillo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'files' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rust-panel-90s border-2 p-6">
              <div className="lg:col-span-4">
                <img
                  src={OFFICE_ASSETS.poster}
                  alt="Evidencia promocional TeLeChOBiS 1998"
                  referrerPolicy="no-referrer"
                  className="w-full sepia-[.25] contrast-115 brightness-90"
                  style={{
                    maskImage: 'radial-gradient(ellipse 90% 92% at 50% 50%, black 65%, transparent 100%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse 90% 92% at 50% 50%, black 65%, transparent 100%)',
                  }}
                />
                <p className="mt-2 font-mono-tech text-[11px] text-[#a39982]">
                  PRUEBA DOCUMENTAL #A-01 · Material incautado en Estudios Ajusco.
                </p>
              </div>
              <div className="lg:col-span-8 space-y-4">
                {LAWSUIT_DOCUMENTS.map((docItem) => (
                  <article
                    key={docItem.code}
                    className="border border-[#4d3d30] bg-black/75 p-4 space-y-1.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-tech text-amber-400">
                      <span>{docItem.code}</span>
                      <span>{docItem.date}</span>
                    </div>
                    <h4 className="font-display text-xl text-[#ebe3ce]">{docItem.title}</h4>
                    <p className="text-[11px] font-mono-tech text-[#9a907a]">
                      {docItem.classification}
                    </p>
                    <p className="text-sm text-[#d6ccb4] leading-relaxed pt-1">{docItem.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Jumpscare Preview Modal Overlay (Plays exact Door or Hallway animation out of the 8) */}
      {previewJumpscare && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
          <div className={JUMPSCARE_ANIM_MAP[previewJumpscare.source][previewJumpscare.id]}>
            <TelechobiSprite
              id={previewJumpscare.id}
              variant="jumpscare"
              jumpscareSource={previewJumpscare.source}
              className="h-[108vh] w-auto"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 crt-scanlines opacity-50" />
        </div>
      )}
    </div>
  );
}
