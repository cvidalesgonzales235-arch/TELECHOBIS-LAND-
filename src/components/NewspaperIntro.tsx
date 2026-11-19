import { useEffect } from 'react';
import { OFFICE_ASSETS } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface NewspaperIntroProps {
  onContinue: () => void;
}

export function NewspaperIntro({ onContinue }: NewspaperIntroProps) {
  useEffect(() => {
    soundEngine.playPaperRustle();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        soundEngine.playClick(740);
        onContinue();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onContinue]);

  return (
    <div
      onClick={() => {
        soundEngine.playClick(740);
        onContinue();
      }}
      className="relative w-full h-dvh bg-[#050506] flex items-start sm:items-center justify-center p-3 sm:p-8 cursor-pointer overflow-y-auto overflow-x-hidden"
    >
      <div className="pointer-events-none fixed inset-0 crt-vignette opacity-80" />
      {/* Yellowed 1999 Newspaper Clipping */}
      <article className="relative my-auto max-w-3xl w-full bg-[#dfd3b2] text-[#1c1915] shadow-[0_24px_80px_rgba(0,0,0,0.95)] border border-[#a89872] p-4 sm:p-8 md:p-10 sm:rotate-[-0.7deg]">
        {/* Aged paper stains & folds */}
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            background:
              'radial-gradient(circle at 85% 18%, rgba(120,83,35,0.35), transparent 28%), radial-gradient(circle at 12% 88%, rgba(92,64,28,0.4), transparent 32%), linear-gradient(135deg, transparent 48%, rgba(0,0,0,0.08) 50%, transparent 52%)',
          }}
        />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-1 border-b-2 border-[#1c1915] pb-2 mb-3 text-[10px] sm:text-[11px] font-mono-tech tracking-widest uppercase">
            <span>EL HERALDO NOCTURNO · CLASIFICADOS</span>
            <span>CD. DE MÉXICO · NOV. 1999</span>
          </div>

          <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight leading-[1.02] text-center border-b border-[#1c1915]/50 pb-3 sm:pb-4 mb-4 sm:mb-5">
            SE SOLICITA CON URGENCIA GUARDIA DE SEGURIDAD NOCTURNO
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
            <div className="md:col-span-7 space-y-2.5 sm:space-y-3 text-xs sm:text-[15px] leading-relaxed font-serif">
              <p className="font-bold uppercase tracking-wide text-[11px] sm:text-xs font-mono-tech text-[#5c1919]">
                CONTRATACIÓN INMEDIATA · TURNO DE 12:00 AM A 6:00 AM
              </p>
              <p>
                <strong>TV AZTECA S.A. DE C.V.</strong> requiere personal responsable para vigilar
                las instalaciones del antiguo <strong>Foro de Grabación 4</strong> y las oficinas
                administrativas en desuso donde se produjo entre 1998 y 1999 el programa infantil
                cancelado <em>&ldquo;TeLeChOBiS&rdquo;</em> tras la demanda internacional por plagio
                de la BBC.
              </p>
              <p>
                El recinto será demolido la próxima semana. Su labor consiste en monitorear las
                cámaras de circuito cerrado desde la oficina central y resguardar el equipo técnico
                y las cuatro botargas almacenadas antes del derribo.
              </p>
              <p className="text-[11px] sm:text-xs border-t border-[#1c1915]/40 pt-2.5 italic">
                Paga semanal: $450.00 MXN. Incluye linterna reglamentaria y acceso a línea
                telefónica interna. La empresa no se hace responsable por fallas eléctricas, ruidos
                en el pasillo o altercados con el utilería abandonada.
              </p>
            </div>

            <div className="md:col-span-5 flex flex-col">
              <div className="border border-[#1c1915]/60 p-1 bg-[#d4c7a3]">
                <img
                  src={OFFICE_ASSETS.poster}
                  alt="Archivo fotográfico de TeLeChOBiS 1998"
                  referrerPolicy="no-referrer"
                  className="w-full h-40 sm:h-52 object-cover grayscale contrast-135 sepia-[.4] mix-blend-multiply opacity-90"
                />
              </div>
              <p className="mt-2 text-[10px] sm:text-[11px] font-mono-tech leading-snug text-[#2e2922]">
                Fig. 1 — Elenco original (Ton, Toso, Nita y Tis) antes del embargo judicial de 1999.
                Las botargas permanecen dentro del foro clausurado.
              </p>
            </div>
          </div>

          <div className="mt-5 sm:mt-7 pt-3 border-t border-[#1c1915]/40 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs font-mono-tech text-[#2c261f]">
            <span>EXPEDIENTE DEMO-99-AZT</span>
            <span className="font-bold underline">Toca la pantalla o presiona Enter para iniciar</span>
          </div>
        </div>
      </article>
    </div>
  );
}
