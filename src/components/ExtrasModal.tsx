import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Compass,
  FileText,
  Newspaper,
  PhoneCall,
  Play,
  Skull,
  Sliders,
  Sparkles,
  Square,
  Volume2,
  X,
  ZoomIn,
} from 'lucide-react';
import {
  ALL_ENEMY_IDS,
  BASE_ENEMY_IDS,
  CustomNightLaunchConfig,
  JumpscareSource,
  OFFICE_ASSETS,
  TELECHOBIS,
  TelechobiId,
} from '../types/game';
import { PHONE_CALLS, SERIES_FULL_HISTORY } from '../data/phoneCallsAndLore';
import { CobwebCorner, TelechobiSprite } from './TelechobiArt';
import { NightSelectorPanel, PersonalizedNightConfigurator } from './NightSetupModal';
import { soundEngine } from '../audio/soundEngine';

interface ExtrasModalProps {
  onBack: () => void;
  onLaunchConfig: (config: CustomNightLaunchConfig) => void;
  secretUnlocked?: boolean;
}

type ExtrasTab =
  | 'models'
  | 'personalized'
  | 'nights'
  | 'guide'
  | 'calls'
  | 'jumpscares'
  | 'files';

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

const ATTACK_METHODS_GUIDE: Record<
  TelechobiId,
  {
    trait: string;
    leftDoor: string;
    rightDoor: string;
    centerHall: string;
    vent: string;
  }
> = {
  ton: {
    trait: 'Clásico (se vuelve más activo de Noche 1 a Noche 6 · 3.02s en Personalizada · 1.51s en Definitiva 40 · DESACTIVADO en Noche 7). Mirarlo en CCTV retrasa su paso.',
    leftDoor: 'Únicamente llega a la Puerta Izquierda desde CAM 01. Al verlo en el umbral, gira [A] y presiona CERRAR [Q] hasta oír golpes.',
    rightDoor: 'Únicamente llega a la Puerta Derecha desde CAM 02. Gira a la derecha [D] y sella la compuerta [E] de inmediato.',
    centerHall: 'Entra al Pasillo Central desde CAM 02 activando el sonido de pasillo de FNAF 2. Alumbra [ESPACIO] y usa la Máscara [M] hasta que parpadee y se vaya.',
    vent: 'Al bajar al ducto suena Crawl & Rattle + ventilación y aparece en VENT 11 y VENT 12 (también en Radar). Es inmune al Audio en cámaras y en VENT 11; solo es repelido por los Gemidos de Homero al llegar a VENT 12.',
  },
  toso: {
    trait: 'Clásico (escala cada noche de 1 a 6 · 4.97s en Personalizada · 2.48s en Definitiva 40 · DESACTIVADO en Noche 7). Inmune al Audio en cámaras normales.',
    leftDoor: 'Solo avanza desde CAM 01 hacia la Puerta Izquierda. Gira [A] y sella la compuerta [Q] antes de que termine su espera.',
    rightDoor: 'Solo cruza desde CAM 02 hacia la Puerta Derecha. Gira [D] y sella la compuerta [E] hasta escuchar los golpes.',
    centerHall: 'Entra al Pasillo Central desde CAM 02 reproduciendo el sonido de pasillo de FNAF 2. Ponte la Máscara [M] frente a tu escritorio hasta que desaparezca.',
    vent: 'Entra a la Ventilación con Crawl & Rattle + sonido de ducto y se muestra en VENT 11 y VENT 12. En VENT 11 ignora los Gemidos de Homero; usa el Audio cuando alcance VENT 12 antes del crujido de puerta.',
  },
  nita: {
    trait: 'Clásica (más agresiva de Noche 1 a 6 · 5.01s en Personalizada · 2.50s en Definitiva 40 · DESACTIVADA en Noche 7). Vigilar su cámara detiene su conteo; inmune al Audio en cámaras.',
    leftDoor: 'Rodea por CAM 01 hacia la Puerta Izquierda cuando el pasillo está ocupado. Cierra la compuerta [Q] al verla.',
    rightDoor: 'Rodea por CAM 02 hacia la Puerta Derecha. Gira [D] y presiona [E] antes de que se agote tu margen.',
    centerHall: 'Su ruta predilecta directo desde CAM 02: al entrar al Pasillo Central suena el aviso de FNAF 2. Alumbra [ESPACIO] y coloca la Máscara [M].',
    vent: 'Al entrar a los ductos (VENT 11 → VENT 12) suena Crawl & Rattle y ventilación. Es inmune al Audio en VENT 11; activa los Gemidos de Homero cuando llegue a VENT 12 para repelerla.',
  },
  tis: {
    trait: 'Clásica (más rápida de Noche 1 a 6 · 4.97s en Personalizada · 2.48s en Definitiva 40 · DESACTIVADA en Noche 7). Inmune al Audio en cámaras normales.',
    leftDoor: 'Se desliza únicamente desde CAM 01 hacia la Puerta Izquierda. Revisa con [A] y presiona CERRAR [Q].',
    rightDoor: 'Acecha la Puerta Derecha desde CAM 02. Gira [D] con frecuencia y sella [E] en cuanto aparezca.',
    centerHall: 'Entra directamente desde CAM 02 al Pasillo Central con el sonido de pasillo de FNAF 2. Ponte la Máscara [M] sin retirarla antes del parpadeo.',
    vent: 'Se desplaza por VENT 11 y VENT 12 (suena Crawl & Rattle al entrar y aparece en Radar). Solo es vulnerable a los Gemidos de Homero cuando alcanza VENT 12.',
  },
  arbol: {
    trait: 'Jefe Noche 7 y Definitiva (40) · ÚNICO enemigo capaz de teletransportarse entre todas las cámaras (CAM 01–10) y directo desde CAM 09 hacia puertas, pasillo central o ventilación con la risa grave de FNAF 4 (inmune al Audio en cámaras; 5s de reposo al retirarse).',
    leftDoor: 'Se teletransporta desde CAM 09 directo a la Puerta Izquierda tras reír. Mientras ataca nadie más puede atacar; gira [A] y cierra [Q].',
    rightDoor: 'Se teletransporta directo a la Puerta Derecha tras su risa de FNAF 4. Gira [D] y sella [E] hasta escuchar los golpes.',
    centerHall: 'Se teletransporta directo En Frente de tu escritorio reproduciendo su risa de Nightmare (no el sonido de FNAF 2). Alumbra [ESPACIO] y mantén la Máscara [M] hasta que parpadee.',
    vent: 'Se teletransporta desde CAM 09 a la Ventilación (VENT 11 → VENT 12) con su risa de Nightmare + Crawl & Rattle. Ignora el Audio en VENT 11; repélelo con los Gemidos en VENT 12.',
  },
  champi: {
    trait: 'Jefe Noche 7 y Definitiva (40) · ÚNICO al que debes buscar en las cámaras (inmune al Audio). Tiene ICONO propio y patina por CAM 03–10 con Gears 1 hasta CAM 01/02 (5s de reposo). En Noche Definitiva tiene un truco exclusivo que lo evita automáticamente en CAM 01/02 sin abrir el monitor, pero activar trucos fija la noche en 12 min reales.',
    leftDoor: 'SCREAMER #1 (INSTANTÁNEO): Si no lo encuentras y observas (~0.55s) en el CCTV antes de salir de CAM 01, oirás su carrera rápida (Foxy Running) y te matará al instante.',
    rightDoor: 'SCREAMER #2 (INSTANTÁNEO): Si alcanza CAM 02 y agota su espera sin ser detenido en cámaras (o sin el truco exclusivo en Definitiva), correrá y te matará al instante en la Puerta Derecha.',
    centerHall: 'SCREAMER #3 (INSTANTÁNEO): Si cruza CAM 02 sin que lo detengas en el CCTV, correrá al Pasillo Central y te matará al instante. Míralo en el monitor para mandarlo a CAM 09.',
    vent: 'NO ATACA POR VENTILACIÓN · Nunca entra a los ductos ni emite el crujido de puerta. Solo tiene 3 Screamers (Puerta Izq., Puerta Der. y Pasillo Central).',
  },
  non: {
    trait: 'Jefe Noche 7 y Definitiva (40) · ÚNICO enemigo vulnerable a los Gemidos de Homero desde VENT 11 (además de VENT 12). Pausa brevemente en CAM 10 antes de entrar a los ductos con Crawl & Rattle + sonido de puerta; deja 5s de descanso al ser espantado (con Gemidos Infinitos huye al instante).',
    leftDoor: 'NO ATACA POR PUERTA IZQUIERDA · Se eliminó por completo su acceso por puertas laterales.',
    rightDoor: 'NO ATACA POR PUERTA DERECHA · Nunca aparece en la puerta derecha ni en su umbral.',
    centerHall: 'NO ATACA EN EL PASILLO CENTRAL · Tampoco aparece frente al escritorio; su único Screamer está en la Ventilación.',
    vent: 'ÚNICO SCREAMER (VENTILACIÓN VENT 11 → VENT 12): Entra desde CAM 10 con sonido de puerta + Crawl & Rattle y ventilación. Es el único afectado por el Audio tanto en VENT 11 como en VENT 12 (o huye al instante con Gemidos Infinitos).',
  },
  charro: {
    trait: 'Jefe Noche 7 y Definitiva (40) · Rompe lentes de cámaras (vidrio roto, 14s sin señal) y tiene 1 solo Screamer (Oficina). Su voz ("Devolver el alma de Beatriz...") suena al aparecer de frente y se corta al instante al ponerte la Máscara o abrir Cámaras.',
    leftDoor: 'NO ATACA POR PUERTA IZQUIERDA · Únicamente destroza cámaras y se manifiesta de frente en la Oficina Central.',
    rightDoor: 'NO ATACA POR PUERTA DERECHA · Nunca se asoma por las puertas laterales ni tiene jumpscare de puerta.',
    centerHall: 'ÚNICO SCREAMER (OFICINA CENTRAL): Aparece directamente frente al escritorio con su voz ("Devolver el alma de Beatriz..."). Solo puede matarte si NO usas la Máscara [M] ni abres las Cámaras [W] para cortarlo.',
    vent: 'NO ATACA POR VENTILACIÓN · Nunca entra en los ductos ni emite el crujido de advertencia.',
  },
  glamrock: {
    trait: 'Entidad Secreta (Segunda Oficina y Personalizada) · Sin patrón de cámaras: aparece directo en cualquier lado disponible de la habitación y acelera cada segundo.',
    leftDoor: 'Aparece en las paredes de la habitación (Centro, Izquierda, Derecha o Atrás en la Segunda Oficina). En la Oficina Principal NUNCA aparece atrás ni en el Generador.',
    rightDoor: 'Al instante de aparecer grita "ES HORA DE DE DE DE DEL DUELO!". Mientras está activo, Tralalero Faz-Shark queda deshabilitado hasta que se marche.',
    centerHall: 'Gira hacia su lado y presiona "FARMEANDING AURA" para iniciar la Batalla de Aura con la canción oficial y los 8 gestos (Six-Seven 6-7, Mewing, Saludo Fake, Sigma y más).',
    vent: 'NO USA CÁMARAS NI VENTILACIÓN · Cuando termina la batalla se retira y la canción del duelo se corta al instante.',
  },
  tralalero: {
    trait: 'Entidad Secreta (Segunda Oficina y Personalizada) · Sin patrón de cámaras: ataca directo por los muros de la oficina y aumenta su velocidad cada segundo.',
    leftDoor: 'Aparece en cualquiera de los 4 lados de la Segunda Oficina. En la Oficina Principal solo aparece en Izquierda, Centro o Derecha (NUNCA en el cuarto trasero del Generador).',
    rightDoor: 'Durante todo su ataque suena sin parar "Tralalero Tralala". Mientras ataca, Glamrock Aura queda deshabilitado hasta que espantes al tiburón.',
    centerHall: 'Gira hacia su muro y presiona "MOSTRAR CURRÍCULUM VITAE" para mostrarle tu hoja de vida con sonido de papel y ahuyentarlo de inmediato.',
    vent: 'NO USA CÁMARAS NI VENTILACIÓN · Al mostrarle el Currículum Vitae huye al instante y la canción "Tralalero Tralala" se corta de inmediato.',
  },
};

const CHARACTER_LORE: Record<
  TelechobiId,
  {
    actor: string;
    originYear: string;
    loreText: string;
  }
> = {
  ton: {
    actor: 'Omar Pacheco',
    originYear: 'Noviembre de 1998 · Botarga Azul',
    loreText:
      'Durante el rodaje nocturno de diciembre de 1998 en el Foro 4, Omar Pacheco quedó atrapado dentro de la botarga sellada tras una falla en los broches internos de fibra y metal. En la Noche 5, Ton emboscó y asesinó al propio productor Alejandro Romero en el pasillo de edición antes de que lograra desconectar la corriente del sótano.',
  },
  toso: {
    actor: 'Rocío Lara',
    originYear: 'Noviembre de 1998 · Botarga Verde / Capucha Rosa',
    loreText:
      'Rocío Lara interpretaba al personaje más inquietante para el público infantil de Azteca 7. Tras la tragedia del set, su traje desarrolla una fijación enfermiza con los lentes de las cámaras de circuito cerrado, sobrecargándolos con estática si el guardia lo observa demasiado tiempo.',
  },
  nita: {
    actor: 'Iris Flores',
    originYear: 'Noviembre de 1998 · Botarga Amarilla / Capucha Verde',
    loreText:
      'Iris Flores pereció dentro de la botarga amarilla cuando los servomotores del pecho colapsaron por asfixia y sobrecalentamiento. Su estructura expuesta reacciona de inmediato al timbre telefónico y al sistema de audio, acechando tanto por los ductos como por el pasillo central.',
  },
  tis: {
    actor: 'Saidda Lara',
    originYear: 'Noviembre de 1998 · Botarga Carmesí / Gorro Bicolor',
    loreText:
      'Saidda Lara daba voz y movimiento a la botarga carmesí en las canciones educativas de convivencia. Tras ser borrada de la historia oficial de TV Azteca, Tis flanquea en silencio por las compuertas metálicas laterales mientras los otros atraen la atención en el pasillo.',
  },
  arbol: {
    actor: 'Alonso Córdova (Creador y Productor)',
    originYear: 'Abril de 1999 · Pacto del Foro 4',
    loreText:
      'Desesperado porque TV Azteca retuvo sus pagos tras el éxito inicial y amenazaba con arruinarlo económicamente, Alonso Córdova invocó a El Charro Negro para asegurar la paga del proyecto. Sin embargo, el trato exigió la vida de sus cuatro actores en 1998; cuando la demanda de la BBC hundió el programa, el propio Alonso terminó atrapado dentro de la colosal estructura de madera viva conocida como Árbol.',
  },
  non: {
    actor: 'Alma No Identificada · Sala Arcade (CAM 09)',
    originYear: '1999 · Unidad Mutilada de Prototipo',
    loreText:
      'Construido en el taller secreto detrás de la Sala Arcade (CAM 09) como parte de una segunda temporada que jamás vio la luz tras la cancelación por plagio. Carece de piernas y se arrastra entre cables y polvo siguiendo las órdenes del Charro Negro.',
  },
  champi: {
    actor: 'Alma No Identificada · Patinador del Estudio',
    originYear: '1999 · Prototipo de Movilidad Rápida',
    loreText:
      'Un prototipo descartado montado sobre patines metálicos para escenas musicales en el foro cerrado. El abandono y la maldición del pacto corrompieron sus sistemas hasta convertir su desplazamiento en un chirrido mecánico incesante capaz de rastrear la señal de video.',
  },
  charro: {
    actor: 'El Charro Negro · Entidad del Pacto',
    originYear: 'Eterno · Acreedor de Alonso y Beatriz',
    loreText:
      'Tras cerrar el trato con Alonso Córdova a cambio de que la televisora le pagara, El Charro Negro reclamó la tragedia del elenco en el Foro 4 y terminó quedándose también con el alma de Beatriz. Destroza las cámaras a su paso y aparece directamente frente al guardia exigiendo cobrar el resto del pacto.',
  },
  glamrock: {
    actor: 'Glamrock Aura · Entidad Viral de Aura +1000',
    originYear: 'Edición Secreta 1999 · Segunda Oficina',
    loreText:
      'Prototipo anómalo obsesionado con mantener el medidor de Aura en +1000 MAXED. Desprecia las cámaras de seguridad y aparece directamente en los cuatro costados de la sala para retar al guardia a un duelo coreografiado de Six-Seven (6-7), Mewing, Saludo Fake y poses Sigma.',
  },
  tralalero: {
    actor: 'Tralalero Faz-Shark · Anomalía Brainrot Italiana',
    originYear: 'Edición Secreta 1999 · Segunda Oficina',
    loreText:
      'Tiburón animatrónico ensamblado con un caza F-16, tenis rojo de colección, cafetera espresso y cañón de pasta. Su única debilidad documentada por el departamento de Recursos Humanos de Ajusco es el terror absoluto al trabajo formal: ver un Currículum Vitae lo hace huir despavorido.',
  },
};

const NEWSPAPER_CLIPPINGS = [
  {
    id: 'grafico',
    paper: 'EL GRÁFICO',
    date: 'Diciembre de 1998',
    tag: 'RECORTE #01 · DESAPARICIÓN',
    headline: '¿DÓNDE ESTÁN? ¡BUSCAN A LOS ACTORES DE ‘LOS TELECHOBIS’!',
    subheadline:
      'Familiares reportan desaparición de Omar Pacheco, Rocío Lara, Iris Flores y Saidda Lara tras grabaciones en TV Azteca.',
    image: OFFICE_ASSETS.newspaperGrafico,
    accentClass: 'border-red-500/65 text-red-300',
    transcript:
      'Cuatro intérpretes juveniles contratados para dar vida a Ton, Toso, Nita y Tis no regresaron a sus hogares luego de una jornada de grabación a puerta cerrada en los estudios del Ajusco. La producción negó el acceso a los familiares alegando confidencialidad del proyecto.',
  },
  {
    id: 'prensa',
    paper: 'LA PRENSA',
    date: 'Enero de 1999',
    tag: 'RECORTE #02 · TRAGEDIA EN EL SET',
    headline:
      '¡TRAGEDIA EN EL FORO 4! HALLAN MUERTOS A ACTORES DENTRO DE LAS BOTARGAS DE ‘LOS TELECHOBIS’',
    subheadline:
      'Asfixia y fallas mecánicas en los trajes blindados de Ton, Toso, Nita y Tis; TV Azteca bajo investigación penal.',
    image: OFFICE_ASSETS.newspaperPrensa,
    accentClass: 'border-amber-500/65 text-amber-300',
    transcript:
      'Peritos forenses acordonaron el Foro 4 tras localizar los cuerpos de los cuatro actores atrapados dentro de las pesadas botargas adaptadas con armazones metálicos improvisados. El incidente fue encapsulado bajo reserva judicial mientras las botargas permanecían retenidas.',
  },
  {
    id: 'universal',
    paper: 'EL UNIVERSAL',
    date: 'Abril de 1999',
    tag: 'RECORTE #03 · DEMANDA Y CANCELACIÓN',
    headline:
      '¡FIN DE LOS TELECHOBIS! BBC DEMANDA POR PLAGIO Y TV AZTECA CANCELA EL PROGRAMA TRAS TRAGEDIA',
    subheadline:
      'Tras la muerte de los cuatro actores y la presión legal de la cadena británica por el plagio de Teletubbies, la televisora del Ajusco retira del aire la emisión y sella los foros de grabación.',
    image: OFFICE_ASSETS.newspaperUniversal,
    accentClass: 'border-sky-500/65 text-sky-300',
    transcript:
      'Con la llegada oficial de Teletubbies a Canal 5 en abril de 1999, BBC News y Ragdoll emprendieron acciones legales inmediatas contra TV Azteca. La cadena borró casi todo registro de archivo, convirtiendo al programa en material perdido antes de ordenar la demolición del Foro 4.',
  },
];

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
  {
    code: 'MEMO DIRECTIVO AZTECA-99/777',
    title: 'Cinta Confidencial de Ricardo Salinas Pliego · Caso Alonso Córdova (Noche 7)',
    date: '18 de Noviembre de 1999',
    classification: 'ULTRA SECRETO · PRESIDENCIA ESTUDIOS AJUSCO',
    body: `Registro de la última advertencia al guardia nocturno: el creador original de "Los Telechobis", Alonso Córdova, no recibió los pagos prometidos por la cadena y terminó realizando un pacto desesperado con la entidad conocida como El Charro Negro. Dicho pacto desató la muerte de los cuatro actores en 1998, precipitó la demanda de la BBC en 1999 y dejó al propio Alonso condenado dentro de Árbol junto a Ñon, Champi y El Charro Negro (quien reclama también el alma de Beatriz).`,
  },
];

export function ExtrasModal({ onBack, onLaunchConfig, secretUnlocked = false }: ExtrasModalProps) {
  const visibleRoster: TelechobiId[] = secretUnlocked ? ALL_ENEMY_IDS : BASE_ENEMY_IDS;
  const [tab, setTab] = useState<ExtrasTab>('models');
  const [selectedChar, setSelectedChar] = useState<TelechobiId>('ton');
  const [xrayEndo, setXrayEndo] = useState(false);
  const [spotlightTint, setSpotlightTint] = useState<'amber' | 'cold' | 'blood'>('amber');
  const [zoomedImage, setZoomedImage] = useState<{ src: string; caption: string } | null>(null);
  const [previewJumpscare, setPreviewJumpscare] = useState<{
    id: TelechobiId;
    source: JumpscareSource;
  } | null>(null);
  const previewTimerRef = useRef<number | null>(null);

  // Night 1-5 Calls Library playback state
  const [selectedCallNight, setSelectedCallNight] = useState<number>(1);
  const [playingCallNight, setPlayingCallNight] = useState<number | null>(null);
  const [playingSegIdx, setPlayingSegIdx] = useState<number | null>(null);
  const callPlaybackTokenRef = useRef(0);

  const safeSelectedChar = visibleRoster.includes(selectedChar) ? selectedChar : 'ton';
  const meta = TELECHOBIS[safeSelectedChar];
  const charLore = CHARACTER_LORE[safeSelectedChar];

  const stopCallPlayback = () => {
    callPlaybackTokenRef.current += 1;
    soundEngine.stopPhoneVoice();
    setPlayingCallNight(null);
    setPlayingSegIdx(null);
  };

  useEffect(() => {
    soundEngine.unlock();
    soundEngine.startMenuMusic();
    return () => {
      if (previewTimerRef.current) {
        window.clearTimeout(previewTimerRef.current);
      }
      callPlaybackTokenRef.current += 1;
      soundEngine.stopPhoneVoice();
      soundEngine.stopJumpscare();
    };
  }, []);

  const handlePlayCallAudio = (nightNum: number, startSegment = 0) => {
    const script = PHONE_CALLS[nightNum];
    if (!script) return;
    stopCallPlayback();

    const token = ++callPlaybackTokenRef.current;
    setPlayingCallNight(nightNum);

    const playNextSegment = (idx: number) => {
      if (token !== callPlaybackTokenRef.current) return;
      const seg = script.segments[idx];
      if (!seg) {
        soundEngine.playCallEndCue();
        setPlayingCallNight(null);
        setPlayingSegIdx(null);
        return;
      }

      setPlayingSegIdx(idx);
      const cue = seg.cue || 'voice';
      soundEngine.playPhoneCallCue(cue);

      const started = soundEngine.speakPhoneSegment(seg.spokenText || seg.text, {
        delayMs: (seg.voiceDelaySec ?? 0) * 1000,
        pitch: seg.voicePitch,
        rate: seg.voiceRate,
        onEnd: () => {
          if (token !== callPlaybackTokenRef.current) return;
          window.setTimeout(() => {
            if (token === callPlaybackTokenRef.current) {
              playNextSegment(idx + 1);
            }
          }, 260);
        },
      });

      if (!started) {
        window.setTimeout(() => {
          if (token === callPlaybackTokenRef.current) {
            playNextSegment(idx + 1);
          }
        }, Math.max(1800, (seg.endSec - seg.startSec) * 1000));
      }
    };

    playNextSegment(startSegment);
  };

  const triggerJumpscarePreview = (id: TelechobiId, source: JumpscareSource) => {
    stopCallPlayback();
    if (previewTimerRef.current) {
      window.clearTimeout(previewTimerRef.current);
    }
    setPreviewJumpscare({ id, source });
    soundEngine.playJumpscare(id, source);
    previewTimerRef.current = window.setTimeout(() => {
      soundEngine.stopJumpscare();
      setPreviewJumpscare(null);
      previewTimerRef.current = null;
    }, 1380);
  };

  const spotlightBg =
    spotlightTint === 'amber'
      ? 'radial-gradient(ellipse 68% 72% at 50% 48%, rgba(251,191,36,0.22) 0%, rgba(120,53,15,0.12) 45%, rgba(4,4,5,0.96) 82%)'
      : spotlightTint === 'cold'
        ? 'radial-gradient(ellipse 68% 72% at 50% 48%, rgba(147,197,253,0.22) 0%, rgba(30,58,138,0.12) 45%, rgba(4,4,5,0.96) 82%)'
        : 'radial-gradient(ellipse 68% 72% at 50% 48%, rgba(239,68,68,0.26) 0%, rgba(127,29,29,0.14) 45%, rgba(4,4,5,0.96) 82%)';

  const switchTab = (next: ExtrasTab) => {
    soundEngine.playClick(640);
    if (next !== 'calls') stopCallPlayback();
    setTab(next);
  };

  return (
    <div className="relative w-full h-dvh bg-[#070709] text-zinc-100 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3 px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-[#4d3d30] rust-panel-90s shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <button
            type="button"
            onClick={() => {
              stopCallPlayback();
              soundEngine.stopJumpscare();
              soundEngine.playClick(560);
              onBack();
            }}
            className="min-h-[40px] sm:min-h-[44px] shrink-0 inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 text-xs font-mono-tech bg-[#1c1915] border border-[#5c4838] text-[#dfd5bd] hover:bg-[#2a241d] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-2xl tracking-wider text-amber-300 leading-none truncate">
              EXTRAS · ARCHIVO DESCLASIFICADO
            </h2>
            <p className="text-[10px] sm:text-[11px] font-mono-tech text-[#b4aa92] mt-1 truncate">
              Personalized Night · Noches 1–7 · Guía · Llamadas · Hemeroteca
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar md:flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto pb-0.5">
          <button
            type="button"
            onClick={() => switchTab('models')}
            className={`min-h-[38px] whitespace-nowrap shrink-0 px-3 py-1.5 text-[11px] font-mono-tech inline-flex items-center gap-1.5 border cursor-pointer ${
              tab === 'models'
                ? 'bg-amber-400 text-black border-amber-200 font-bold'
                : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Modelos y Lore
          </button>
          <button
            type="button"
            onClick={() => switchTab('personalized')}
            className={`min-h-[38px] whitespace-nowrap shrink-0 px-3 py-1.5 text-[11px] font-mono-tech inline-flex items-center gap-1.5 border cursor-pointer ${
              tab === 'personalized'
                ? 'bg-amber-400 text-black border-amber-200 font-bold'
                : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Personalized Night
          </button>
          <button
            type="button"
            onClick={() => switchTab('nights')}
            className={`min-h-[38px] whitespace-nowrap shrink-0 px-3 py-1.5 text-[11px] font-mono-tech inline-flex items-center gap-1.5 border cursor-pointer ${
              tab === 'nights'
                ? 'bg-amber-400 text-black border-amber-200 font-bold'
                : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Noches (1–7)
          </button>
          <button
            type="button"
            onClick={() => switchTab('guide')}
            className={`min-h-[38px] whitespace-nowrap shrink-0 px-3 py-1.5 text-[11px] font-mono-tech inline-flex items-center gap-1.5 border cursor-pointer ${
              tab === 'guide'
                ? 'bg-amber-400 text-black border-amber-200 font-bold'
                : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Guía de Ataques
          </button>
          <button
            type="button"
            onClick={() => switchTab('calls')}
            className={`min-h-[38px] whitespace-nowrap shrink-0 px-3 py-1.5 text-[11px] font-mono-tech inline-flex items-center gap-1.5 border cursor-pointer ${
              tab === 'calls'
                ? 'bg-amber-400 text-black border-amber-200 font-bold'
                : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            Llamadas (1–5 y 7)
          </button>
          <button
            type="button"
            onClick={() => switchTab('jumpscares')}
            className={`min-h-[38px] whitespace-nowrap shrink-0 px-3 py-1.5 text-[11px] font-mono-tech inline-flex items-center gap-1.5 border cursor-pointer ${
              tab === 'jumpscares'
                ? 'bg-amber-400 text-black border-amber-200 font-bold'
                : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            Jumpscares ({secretUnlocked ? 27 : 25})
          </button>
          <button
            type="button"
            onClick={() => switchTab('files')}
            className={`min-h-[38px] whitespace-nowrap shrink-0 px-3 py-1.5 text-[11px] font-mono-tech inline-flex items-center gap-1.5 border cursor-pointer ${
              tab === 'files'
                ? 'bg-amber-400 text-black border-amber-200 font-bold'
                : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Archivos Confidenciales
          </button>
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6">
        {tab === 'models' && (
          <div className="max-w-6xl mx-auto space-y-5 sm:space-y-6">
            {/* Character Image Showcase + Dossier (Replaces procedural 3D viewer with real character artwork) */}
            <div className="border-2 border-[#4d3d30] bg-[#080706] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)]">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left/Top Stage: Clean Real Character Image with Studio Spotlight */}
                <div
                  className="lg:col-span-6 relative min-h-[240px] sm:min-h-[360px] lg:min-h-[430px] flex items-end justify-center overflow-hidden p-4 border-b lg:border-b-0 lg:border-r border-[#3d3024]"
                  style={{ background: spotlightBg }}
                >
                  <CobwebCorner position="top-left" className="w-12 h-12 sm:w-16 sm:h-16 opacity-35 z-10" />
                  <CobwebCorner position="top-right" className="w-12 h-12 sm:w-16 sm:h-16 opacity-35 z-10" />
                  <div className="pointer-events-none absolute inset-0 crt-scanlines opacity-35 z-10" />

                  {/* Floor Pedestal Shadow */}
                  <div
                    className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-8 rounded-full opacity-85"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, transparent 72%)',
                    }}
                  />

                  <img
                    src={meta.spritePath}
                    alt={`Botarga real de ${meta.name}`}
                    referrerPolicy="no-referrer"
                    className="relative z-20 max-h-[220px] sm:max-h-[360px] lg:max-h-[400px] w-auto object-contain transition-all duration-200 select-none"
                    style={{
                      filter: xrayEndo
                        ? 'contrast(1.9) brightness(0.88) invert(0.92) hue-rotate(180deg) drop-shadow(0 0 28px rgba(220,38,38,0.65))'
                        : spotlightTint === 'blood'
                          ? 'contrast(1.32) brightness(0.76) sepia(0.35) hue-rotate(-22deg) drop-shadow(0 16px 32px rgba(0,0,0,0.98))'
                          : spotlightTint === 'cold'
                            ? 'contrast(1.26) brightness(0.84) saturate(0.82) hue-rotate(14deg) drop-shadow(0 16px 32px rgba(0,0,0,0.98))'
                            : 'contrast(1.22) brightness(0.88) saturate(0.96) drop-shadow(0 16px 32px rgba(0,0,0,0.98))',
                    }}
                  />

                  <span className="pointer-events-none absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 px-2 sm:px-2.5 py-1 bg-black/75 border border-[#4d3d30] font-mono-tech text-[9px] sm:text-[10px] text-[#c9bfa4] tracking-wider">
                    MODELO OFICIAL · ARCHIVO FORO 4
                  </span>
                </div>

                {/* Right/Bottom Character Info & Individual Soul Lore */}
                <div className="lg:col-span-6 p-4 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5 bg-[#0e0c0a]">
                  <div className="space-y-4">
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display text-3xl sm:text-4xl text-[#f3ebd5] tracking-wider leading-none">
                          {meta.name}
                        </h3>
                        <span className="px-2.5 py-1 bg-[#221410] border border-red-700/60 font-mono-tech text-[10px] text-red-300 tracking-wider">
                          ALMA ATRAPADA: {charLore.actor.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-mono-tech text-xs text-amber-400 mt-1.5">{meta.role}</p>
                      <p className="font-mono-tech text-[11px] text-[#9b9079] mt-0.5">
                        {charLore.originYear}
                      </p>
                    </div>

                    <div className="border-t border-[#32271e] pt-3 space-y-2">
                      <div className="font-mono-tech text-[10px] text-amber-300/90 tracking-widest uppercase">
                        ESTADO DE LA BOTARGA
                      </div>
                      <p className="text-sm text-[#ddd4bc] leading-relaxed">{meta.description}</p>
                    </div>

                    <div className="border border-[#463628] bg-black/55 p-3.5 space-y-1.5">
                      <div className="font-mono-tech text-[10px] text-red-400 tracking-widest uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        LORE DEL PERSONAJE · INCIDENTE 1998
                      </div>
                      <p className="text-xs sm:text-[13px] text-[#cfc5ab] leading-relaxed">
                        {charLore.loreText}
                      </p>
                    </div>

                    <div className="border-t border-[#32271e] pt-3">
                      <div className="font-mono-tech text-[10px] text-[#a99e85] tracking-widest uppercase">
                        PATRÓN DE CONDUCTA NOCTURNO
                      </div>
                      <p className="text-xs text-[#bdb39a] mt-1 leading-relaxed">
                        {meta.behaviorNote}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Footer: Character Selector + Lighting / X-Ray */}
              <div className="rust-panel-90s border-t border-[#4d3d30] px-3 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {visibleRoster.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick(680);
                        setSelectedChar(id);
                      }}
                      className={`min-h-[38px] sm:min-h-[40px] px-3 sm:px-3.5 py-1.5 text-xs font-mono-tech border cursor-pointer ${
                        safeSelectedChar === id
                          ? 'bg-[#d6ccb4] text-black border-white font-bold'
                          : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838] hover:bg-[#2a241d]'
                      }`}
                    >
                      {TELECHOBIS[id].name}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(600);
                      setXrayEndo((w) => !w);
                    }}
                    className={`min-h-[38px] sm:min-h-[40px] px-3 py-1.5 text-xs font-mono-tech border cursor-pointer ${
                      xrayEndo
                        ? 'bg-red-950 text-red-200 border-red-500'
                        : 'bg-[#1c1915] text-[#d6ccb4] border-[#5c4838]'
                    }`}
                  >
                    {xrayEndo ? 'Vista Rayos X: ON' : 'Vista Rayos X: OFF'}
                  </button>

                  <div className="flex items-center gap-1 border border-[#5c4838] p-0.5 bg-[#161310]">
                    {(['amber', 'cold', 'blood'] as const).map((tint) => (
                      <button
                        key={tint}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick(620);
                          setSpotlightTint(tint);
                        }}
                        className={`min-h-[34px] px-2.5 py-1 text-[11px] font-mono-tech cursor-pointer ${
                          spotlightTint === tint
                            ? 'bg-[#d6ccb4] text-black font-bold'
                            : 'text-[#a39982]'
                        }`}
                      >
                        {tint === 'amber' ? 'Luz Ámbar' : tint === 'cold' ? 'Luz Fría' : 'Luz Roja'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Lore Section right inside Modelos y Lore */}
            <section className="relative rust-panel-90s border-2 p-5 sm:p-6 space-y-4 overflow-hidden">
              <CobwebCorner position="bottom-right" className="w-16 h-16 opacity-40" />
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#4d3d30] pb-3">
                <div>
                  <span className="font-mono-tech text-[10px] tracking-[0.25em] text-amber-400 uppercase">
                    ARCHIVO HISTÓRICO · LORE OFICIAL DEL JUEGO
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl text-[#efe7d2] mt-0.5">
                    LA HISTORIA OCULTA DE LOS TELECHOBIS (1998–1999)
                  </h3>
                </div>
                <span className="px-2.5 py-1 bg-black/75 border border-[#5c4838] font-mono-tech text-[10px] text-[#c9bfa4]">
                  ESTUDIOS AJUSCO · FORO 4
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-3 text-xs sm:text-sm text-[#dfd5bd] leading-relaxed whitespace-pre-line">
                  {SERIES_FULL_HISTORY}
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <div className="border border-red-800/60 bg-[#1a0b09]/90 p-4 space-y-2">
                    <div className="font-mono-tech text-[11px] font-bold text-red-300 tracking-wider">
                      LO QUE TV AZTECA OCULTÓ ANTES DE LA DEMANDA
                    </div>
                    <p className="text-xs text-[#dcd2b8] leading-relaxed">
                      Antes de que estallara la demanda de la BBC en abril de 1999, un accidente fatal
                      durante una grabación nocturna en diciembre de 1998 cobró la vida de los cuatro
                      actores dentro de las botargas selladas:{' '}
                      <strong className="text-amber-200">Omar Pacheco (Ton)</strong>,{' '}
                      <strong className="text-amber-200">Rocío Lara (Toso)</strong>,{' '}
                      <strong className="text-amber-200">Iris Flores (Nita)</strong> y{' '}
                      <strong className="text-amber-200">Saidda Lara (Tis)</strong>.
                    </p>
                    <p className="text-xs text-[#c7bda4] leading-relaxed">
                      La televisora encubrió las muertes para evitar frenar la emisión, pero en 1999 la
                      presión legal británica sepultó el programa para siempre. Atrapadas en los trajes,
                      sus almas deambulan por el Foro 4 abandonado mientras el guardia nocturno intenta
                      sobrevivir hasta el amanecer del sexto turno.
                    </p>
                  </div>

                  <div className="border border-[#4d3d30] bg-black/65 p-4 space-y-1.5">
                    <div className="font-mono-tech text-[11px] font-bold text-amber-300 tracking-wider">
                      EL DESTINO DE ALEJANDRO ROMERO (NOCHE 5)
                    </div>
                    <p className="text-xs text-[#c9bfa4] leading-relaxed">
                      Consumido por la culpa, el productor Alejandro Romero ingresó al pasillo de edición
                      durante la quinta madrugada para desconectar la caja maestra del sótano. Ton cerró
                      su paso en la oscuridad y puso fin a la transmisión telefónica en vivo.
                    </p>
                  </div>

                  <div className="border border-red-900/70 bg-[#140706]/90 p-4 space-y-1.5">
                    <div className="font-mono-tech text-[11px] font-bold text-red-300 tracking-wider">
                      EL PACTO DE ALONSO CÓRDOVA Y EL CHARRO NEGRO (NOCHE 7)
                    </div>
                    <p className="text-xs text-[#d6ccb4] leading-relaxed">
                      Como revela <strong className="text-amber-200">Ricardo Salinas Pliego</strong>{' '}
                      en la séptima llamada, el creador original{' '}
                      <strong className="text-amber-200">Alonso Córdova</strong> pactó con{' '}
                      <strong className="text-red-300">El Charro Negro</strong> tras sufrir falta de
                      pagos en TV Azteca. La maldición desencadenó las muertes del elenco, la
                      cancelación tras la demanda de la BBC y atrapó a Alonso dentro de{' '}
                      <strong className="text-orange-300">Árbol</strong> junto a Ñon, Champi y El
                      Charro Negro, quien también se llevó el alma de Beatriz.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {tab === 'personalized' && (
          <PersonalizedNightConfigurator
            embedded
            secretUnlocked={secretUnlocked}
            onLaunch={(cfg) => {
              stopCallPlayback();
              soundEngine.stopJumpscare();
              onLaunchConfig(cfg);
            }}
          />
        )}

        {tab === 'nights' && (
          <NightSelectorPanel
            secretUnlocked={secretUnlocked}
            onLaunch={(cfg) => {
              stopCallPlayback();
              soundEngine.stopJumpscare();
              onLaunchConfig(cfg);
            }}
          />
        )}

        {tab === 'guide' && (
          <div className="max-w-6xl mx-auto space-y-5">
            <div className="rust-panel-90s border-2 p-4 sm:p-5 space-y-4">
              <div>
                <div className="font-mono-tech text-[10px] tracking-[0.24em] text-amber-400 uppercase">
                  MANUAL TÁCTICO ACTUALIZADO · REGLAS DEL FORO 4 Y NOCHE 7
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-[#f3ebd5] mt-0.5">
                  GUÍA COMPLETA DE ATAQUES (IZQUIERDA · DERECHA · CENTRO · VENTILACIÓN)
                </h3>
                <p className="text-xs text-[#c7bda4] mt-1">
                  Reglas actualizadas de rutas de cámaras (12 cámaras con CAM 11/12 de ventilación),
                  inmunidad al Audio, turnos 1 a 1 en Noche 7 y acceso secreto 1999 (8/40).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="border border-[#4d3d30] bg-black/65 p-3 space-y-1">
                  <div className="font-mono-tech text-[10px] font-bold text-amber-300 tracking-wider">
                    VENTILACIÓN 11 Y 12 (2 FASES)
                  </div>
                  <p className="text-[11px] text-[#d6ccb4] leading-relaxed">
                    Todos los enemigos que usan ductos aparecen en <strong>VENT 11</strong> y{' '}
                    <strong>VENT 12</strong> (y en el <strong>Radar</strong>) con sonido de
                    ventilación y Crawl &amp; Rattle al entrar.
                  </p>
                </div>

                <div className="border border-[#4d3d30] bg-black/65 p-3 space-y-1">
                  <div className="font-mono-tech text-[10px] font-bold text-sky-300 tracking-wider">
                    GEMIDOS DE HOMERO (11 VS 12)
                  </div>
                  <p className="text-[11px] text-[#d6ccb4] leading-relaxed">
                    Solo <strong>Ñon</strong> responde a los Gemidos en <strong>VENT 11</strong>;
                    los demás enemigos son inmunes allí, pero al avanzar a{' '}
                    <strong>VENT 12</strong> todos son repelidos por el Audio.
                  </p>
                </div>

                <div className="border border-[#4d3d30] bg-black/65 p-3 space-y-1">
                  <div className="font-mono-tech text-[10px] font-bold text-emerald-300 tracking-wider">
                    PASILLO Y TELETRANSPORTACIÓN
                  </div>
                  <p className="text-[11px] text-[#d6ccb4] leading-relaxed">
                    Al aparecer enemigos en el Pasillo suena <strong>FNAF 2 Hallway</strong>,
                    excepto <strong>Árbol</strong> (único que se teletransporta y emite su{' '}
                    <strong>risa de Nightmare</strong>).
                  </p>
                </div>

                <div className="border border-red-800/60 bg-[#1a0b09]/85 p-3 space-y-1">
                  <div className="font-mono-tech text-[10px] font-bold text-red-300 tracking-wider">
                    CÓDIGO 1999 (8/40) Y TRUCO EXCLUSIVO
                  </div>
                  <p className="text-[11px] text-[#dfd5bd] leading-relaxed">
                    Pon <strong>1/9/9/9</strong> en los 4 clásicos de Personalized Night. Su truco
                    exclusivo evita a <strong>Champi</strong> en CAM 01/02; usar trucos fija la
                    noche en <strong>12 min reales</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-5">
              {visibleRoster.map((id) => {
                const char = TELECHOBIS[id];
                const guide = ATTACK_METHODS_GUIDE[id];
                const isBrainrot = Boolean(char.isSecretBrainrot);
                const noVent = id === 'champi' || id === 'charro' || isBrainrot;
                const noDoors = id === 'charro' || id === 'non' || isBrainrot;
                const noCenter = id === 'non';
                return (
                  <article
                    key={id}
                    className={`relative rust-panel-90s border-2 overflow-hidden grid grid-cols-1 lg:grid-cols-12 ${
                      char.isSecretBrainrot
                        ? 'border-amber-600/75'
                        : char.isNight7Boss
                          ? 'border-red-900/75'
                          : ''
                    }`}
                  >
                    <CobwebCorner position="top-right" className="w-12 h-12 opacity-30" />
                    {/* Left Portrait Stage */}
                    <div
                      className="lg:col-span-4 relative min-h-[200px] sm:min-h-[260px] flex flex-col items-center justify-end p-4 border-b lg:border-b-0 lg:border-r border-[#3d3024]"
                      style={{
                        background: char.isSecretBrainrot
                          ? 'radial-gradient(ellipse 75% 75% at 50% 55%, rgba(251,191,36,0.18) 0%, rgba(4,4,5,0.98) 82%)'
                          : char.isNight7Boss
                            ? 'radial-gradient(ellipse 75% 75% at 50% 55%, rgba(220,38,38,0.16) 0%, rgba(4,4,5,0.98) 82%)'
                            : 'radial-gradient(ellipse 75% 75% at 50% 55%, rgba(251,191,36,0.12) 0%, rgba(4,4,5,0.98) 82%)',
                      }}
                    >
                      <img
                        src={char.spritePath}
                        alt={char.name}
                        referrerPolicy="no-referrer"
                        className="max-h-[180px] sm:max-h-[225px] w-auto object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.98)]"
                      />
                      <div className="mt-2 text-center">
                        <div className="inline-flex items-center gap-2">
                          <h4 className="font-display text-2xl text-[#f3ebd5] leading-none">
                            {char.name}
                          </h4>
                          {char.isNight7Boss && (
                            <span className="px-1.5 py-0.5 bg-red-950/90 border border-red-600/70 font-mono-tech text-[9px] text-red-200">
                              NOCHE 7
                            </span>
                          )}
                          {char.isSecretBrainrot && (
                            <span className="px-1.5 py-0.5 bg-amber-950/90 border border-amber-500/70 font-mono-tech text-[9px] text-amber-200">
                              SECRETA
                            </span>
                          )}
                        </div>
                        <p className="font-mono-tech text-[10px] text-amber-300 mt-1">{char.role}</p>
                      </div>
                    </div>

                    {/* Right 4 Attack Modes Explanation */}
                    <div className="lg:col-span-8 p-4 sm:p-5 space-y-3 bg-[#0d0b09]">
                      <p className="text-xs font-mono-tech text-[#d8ceb5] border-b border-[#32271e] pb-2">
                        {guide.trait}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div
                          className={`border p-3 space-y-1 ${
                            noDoors && !isBrainrot
                              ? 'border-zinc-800 bg-black/35 opacity-75'
                              : 'border-[#4d3d30] bg-black/65'
                          }`}
                        >
                          <div className="font-mono-tech text-[10px] font-bold text-sky-300 tracking-wider">
                            {isBrainrot ? '1. UBICACIÓN EN LA HABITACIÓN' : '1. PUERTA IZQUIERDA [A + Q]'}
                          </div>
                          <p className="text-xs text-[#cfc5ab] leading-relaxed">{guide.leftDoor}</p>
                        </div>

                        <div
                          className={`border p-3 space-y-1 ${
                            noDoors && !isBrainrot
                              ? 'border-zinc-800 bg-black/35 opacity-75'
                              : 'border-[#4d3d30] bg-black/65'
                          }`}
                        >
                          <div className="font-mono-tech text-[10px] font-bold text-emerald-300 tracking-wider">
                            {isBrainrot ? '2. AUDIO Y TURNO EXCLUSIVO' : '2. PUERTA DERECHA [D + E]'}
                          </div>
                          <p className="text-xs text-[#cfc5ab] leading-relaxed">{guide.rightDoor}</p>
                        </div>

                        <div
                          className={`border p-3 space-y-1 ${
                            noCenter
                              ? 'border-zinc-800 bg-black/35 opacity-75'
                              : 'border-[#4d3d30] bg-black/65'
                          }`}
                        >
                          <div className="font-mono-tech text-[10px] font-bold text-amber-300 tracking-wider">
                            {id === 'glamrock'
                              ? '3. DEFENSA: FARMEANDING AURA'
                              : id === 'tralalero'
                                ? '3. DEFENSA: CURRÍCULUM VITAE'
                                : id === 'charro'
                                  ? '3. OFICINA CENTRAL [MÁSCARA M / CÁMARAS W]'
                                  : id === 'champi'
                                    ? '3. PASILLO CENTRAL · BÚSQUEDA EN CCTV [W]'
                                    : id === 'non'
                                      ? '3. PASILLO CENTRAL (INACTIVO)'
                                      : id === 'arbol'
                                        ? '3. EN FRENTE / PASILLO [ESPACIO + M]'
                                        : '3. CENTRO / PASILLO [ESPACIO + M]'}
                          </div>
                          <p className="text-xs text-[#cfc5ab] leading-relaxed">{guide.centerHall}</p>
                        </div>

                        <div
                          className={`border p-3 space-y-1 ${
                            noVent
                              ? 'border-zinc-800 bg-black/35 opacity-75'
                              : 'border-[#4d3d30] bg-black/65'
                          }`}
                        >
                          <div className="font-mono-tech text-[10px] font-bold text-rose-300 tracking-wider">
                            {isBrainrot ? '4. CÁMARAS / VENTILACIÓN' : '4. VENTILACIÓN [W + AUDIO CCTV]'}
                          </div>
                          <p className="text-xs text-[#cfc5ab] leading-relaxed">{guide.vent}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'calls' && (
          <div className="max-w-5xl mx-auto space-y-5">
            <div className="rust-panel-90s border-2 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono-tech text-[10px] tracking-[0.24em] text-amber-400 uppercase">
                  CINTAS DE AUDIO TELEFÓNICO · NOCHES 1 A 5 Y NOCHE 7
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-[#f3ebd5] mt-0.5">
                  ARCHIVO DE LLAMADAS (ALEJANDRO ROMERO Y RICARDO SALINAS PLIEGO)
                </h3>
                <p className="text-xs text-[#c7bda4] mt-1">
                  Lee la transcripción completa o reproduce la grabación con voz de cada noche.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick(640);
                      stopCallPlayback();
                      setSelectedCallNight(n);
                    }}
                    className={`min-h-[40px] px-3.5 py-2 border font-mono-tech text-xs font-bold cursor-pointer ${
                      selectedCallNight === n
                        ? 'bg-amber-400 text-black border-amber-200'
                        : n === 7
                          ? 'bg-[#260b09] text-red-200 border-red-700/70 hover:border-red-400'
                          : 'bg-[#1c1915] text-[#dfd5bd] border-[#5c4838] hover:border-amber-400'
                    }`}
                  >
                    Noche {n}
                  </button>
                ))}
              </div>
            </div>

            {PHONE_CALLS[selectedCallNight] && (
              <div className="rust-panel-90s border-2 p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#4d3d30] pb-3">
                  <div>
                    <div className="font-mono-tech text-xs font-bold text-amber-300">
                      {PHONE_CALLS[selectedCallNight].callerLabel}
                    </div>
                    <div className="font-mono-tech text-[11px] text-[#9b9079] mt-0.5">
                      Duración aproximada: {PHONE_CALLS[selectedCallNight].durationSec}s ·{' '}
                      {PHONE_CALLS[selectedCallNight].segments.length} fragmentos de cinta
                    </div>
                  </div>

                  {playingCallNight === selectedCallNight ? (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick(540);
                        stopCallPlayback();
                      }}
                      className="min-h-[44px] w-full sm:w-auto justify-center px-4 py-2 bg-red-950 border border-red-400 text-red-100 hover:bg-red-900 font-mono-tech text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Detener Llamada</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick(720);
                        handlePlayCallAudio(selectedCallNight, 0);
                      }}
                      className="min-h-[44px] w-full sm:w-auto justify-center px-4 py-2 bg-[#c9bfa4] text-black hover:bg-amber-300 border border-[#5e533e] font-mono-tech text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Reproducir Llamada Noche {selectedCallNight}</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {PHONE_CALLS[selectedCallNight].segments.map((seg, idx) => {
                    const isPlayingThis =
                      playingCallNight === selectedCallNight && playingSegIdx === idx;
                    return (
                      <div
                        key={idx}
                        className={`p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isPlayingThis
                            ? 'bg-amber-950/50 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.18)]'
                            : seg.cue === 'ton_ambush' || seg.cue === 'line_dead'
                              ? 'bg-[#210b09]/80 border-red-700/60'
                              : 'bg-black/65 border-[#4d3d30]'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-mono-tech text-[10px]">
                            <span className="text-amber-300 font-bold">{seg.speaker}</span>
                            <span className="text-[#8d826b]">
                              ({seg.startSec}s – {seg.endSec}s)
                            </span>
                            {isPlayingThis && (
                              <span className="text-emerald-300 font-bold animate-pulse">
                                · REPRODUCIENDO
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#efe7d2] leading-relaxed">{seg.text}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            soundEngine.playClick(660);
                            handlePlayCallAudio(selectedCallNight, idx);
                          }}
                          className="shrink-0 self-start sm:self-center px-3 py-1.5 bg-[#1c1915] border border-[#5c4838] hover:border-amber-400 text-[#dfd5bd] font-mono-tech text-[11px] inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3 h-3" />
                          <span>Oír fragmento</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'jumpscares' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleRoster.map((id) => {
              const char = TELECHOBIS[id];
              return (
                <div
                  key={id}
                  className={`relative rust-panel-90s border-2 p-4 flex flex-col justify-between gap-4 overflow-hidden ${
                    char.isSecretBrainrot
                      ? 'border-amber-600/70'
                      : char.isNight7Boss
                        ? 'border-red-900/70'
                        : ''
                  }`}
                >
                  <CobwebCorner position="top-right" className="w-12 h-12 opacity-35" />
                  <div className="relative h-52 flex items-center justify-center overflow-hidden">
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background: char.isNight7Boss
                          ? 'radial-gradient(ellipse 68% 72% at 50% 58%, rgba(220,38,38,0.16) 0%, transparent 72%)'
                          : 'radial-gradient(ellipse 68% 72% at 50% 58%, rgba(255,214,150,0.08) 0%, transparent 72%)',
                      }}
                    />
                    <TelechobiSprite id={id} variant="menu" twitchState={2} className="h-full" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-2xl text-[#ebe3ce]">{char.name}</h3>
                      {char.isNight7Boss && (
                        <span className="px-1.5 py-0.5 bg-red-950/90 border border-red-600/70 font-mono-tech text-[9px] text-red-200">
                          NOCHE 7
                        </span>
                      )}
                      {char.isSecretBrainrot && (
                        <span className="px-1.5 py-0.5 bg-amber-950/90 border border-amber-500/70 font-mono-tech text-[9px] text-amber-200">
                          SECRETA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#b7ad96] mt-1 leading-relaxed">
                      {char.behaviorNote}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {id === 'charro' || id === 'glamrock' || id === 'tralalero' ? (
                      <button
                        type="button"
                        onClick={() => triggerJumpscarePreview(id, 'office')}
                        className="w-full py-2 px-3 bg-black border border-red-500 text-red-200 hover:bg-red-950 font-mono-tech text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Jumpscare Oficina (Único)
                      </button>
                    ) : id === 'non' ? (
                      <button
                        type="button"
                        onClick={() => triggerJumpscarePreview(id, 'vent')}
                        className="w-full py-2 px-3 bg-[#19221d] border border-emerald-500/80 text-emerald-100 hover:bg-emerald-950 font-mono-tech text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Jumpscare Ventilación (Único)
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => triggerJumpscarePreview(id, 'left_door')}
                          className="w-full py-2 px-3 bg-[#4a1812] border border-red-600/70 text-red-100 hover:bg-red-900 font-mono-tech text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Jumpscare Puerta Izq.
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerJumpscarePreview(id, 'right_door')}
                          className="w-full py-2 px-3 bg-[#3f141c] border border-rose-600/70 text-rose-100 hover:bg-rose-900 font-mono-tech text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Jumpscare Puerta Der.
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerJumpscarePreview(id, 'hallway')}
                          className="w-full py-2 px-3 bg-[#2a190d] border border-amber-600/70 text-amber-100 hover:bg-amber-900 font-mono-tech text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          {id === 'arbol'
                            ? 'Jumpscare En Frente'
                            : 'Jumpscare Pasillo Central'}
                        </button>
                        {id !== 'champi' && (
                          <button
                            type="button"
                            onClick={() => triggerJumpscarePreview(id, 'vent')}
                            className="w-full py-2 px-3 bg-[#19221d] border border-emerald-600/70 text-emerald-100 hover:bg-emerald-950 font-mono-tech text-[11px] font-bold flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Jumpscare Ventilación
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'files' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Hemeroteca Oficial: Periódicos de 1794803520431.jpg */}
            <section className="rust-panel-90s border-2 p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#4d3d30] pb-3">
                <div className="flex items-center gap-2.5">
                  <Newspaper className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <h3 className="font-display text-2xl text-[#efe7d2] leading-none">
                      HEMEROTECA CONFIDENCIAL · PERIÓDICOS (1998–1999)
                    </h3>
                    <p className="font-mono-tech text-[11px] text-[#b4aa92] mt-1">
                      Ejemplares rescatados del suelo del Foro 4 tras el cierre judicial de TV Azteca
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playPaperRustle();
                    setZoomedImage({
                      src: OFFICE_ASSETS.newspapersSpread,
                      caption:
                        'Archivo fotográfico completo: El Gráfico (Dic 1998), La Prensa (Ene 1999) y El Universal (Abr 1999)',
                    });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1c1915] border border-amber-500/60 hover:border-amber-300 font-mono-tech text-[11px] text-amber-200 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  Ver Fotografía Completa
                </button>
              </div>

              {/* Full Archival Photo Banner (Clickable to zoom) */}
              <button
                type="button"
                onClick={() => {
                  soundEngine.playPaperRustle();
                  setZoomedImage({
                    src: OFFICE_ASSETS.newspapersSpread,
                    caption:
                      'Hemeroteca Completa · El Gráfico, La Prensa y El Universal sobre el caso Los Telechobis',
                  });
                }}
                className="group relative block w-full max-h-[340px] overflow-hidden border border-[#4d3d30] bg-black cursor-zoom-in text-left"
              >
                <img
                  src={OFFICE_ASSETS.newspapersSpread}
                  alt="Periódicos reales sobre la tragedia y demanda de Los Telechobis"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[340px] object-cover sepia-[.12] contrast-110 brightness-95 group-hover:scale-[1.015] transition-transform duration-300"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 py-2.5 flex items-center justify-between">
                  <span className="font-mono-tech text-[10px] sm:text-xs text-[#e5dcc4]">
                    PRUEBA HEMEROGRÁFICA #H-98/99 · Toca para ampliar los 3 periódicos originales
                  </span>
                  <ZoomIn className="w-4 h-4 text-amber-300 shrink-0" />
                </div>
              </button>

              {/* Individual Newspaper Clippings Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {NEWSPAPER_CLIPPINGS.map((clip) => (
                  <article
                    key={clip.id}
                    className="border border-[#4d3d30] bg-black/80 flex flex-col overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playPaperRustle();
                        setZoomedImage({
                          src: clip.image,
                          caption: `${clip.paper} (${clip.date}) — ${clip.headline}`,
                        });
                      }}
                      className="group relative h-64 w-full overflow-hidden border-b border-[#3a2e23] bg-[#0b0a08] cursor-zoom-in"
                    >
                      <img
                        src={clip.image}
                        alt={`Portada de ${clip.paper} (${clip.date})`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="pointer-events-none absolute top-2 right-2 p-1.5 bg-black/80 border border-[#5c4838] text-amber-300">
                        <ZoomIn className="w-3.5 h-3.5" />
                      </span>
                    </button>

                    <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 font-mono-tech text-[10px]">
                          <span className={`px-2 py-0.5 border bg-black/70 ${clip.accentClass}`}>
                            {clip.paper}
                          </span>
                          <span className="text-[#b8ae95]">{clip.date}</span>
                        </div>
                        <div className="font-mono-tech text-[10px] text-[#8f856f]">{clip.tag}</div>
                        <h4 className="font-display text-lg leading-snug text-[#f2ead4]">
                          {clip.headline}
                        </h4>
                        <p className="text-xs font-semibold text-amber-200/90 leading-snug">
                          {clip.subheadline}
                        </p>
                      </div>
                      <p className="text-xs text-[#cfc5ab] leading-relaxed border-t border-[#32271e] pt-2">
                        {clip.transcript}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Legal & Security Documents + Promo Poster */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 rust-panel-90s border-2 p-6">
              <div className="lg:col-span-4">
                <img
                  src={OFFICE_ASSETS.poster}
                  alt="Evidencia promocional TeLeChOBiS 1998"
                  referrerPolicy="no-referrer"
                  className="w-full sepia-[.25] contrast-115 brightness-90"
                  style={{
                    maskImage:
                      'radial-gradient(ellipse 90% 92% at 50% 50%, black 65%, transparent 100%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse 90% 92% at 50% 50%, black 65%, transparent 100%)',
                  }}
                />
                <p className="mt-2 font-mono-tech text-[11px] text-[#a39982]">
                  PRUEBA DOCUMENTAL #A-01 · Material promocional incautado en Estudios Ajusco.
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

      {/* Newspaper / Photo Lightbox Modal */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 h-dvh z-50 bg-black/92 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-8 cursor-pointer"
        >
          <button
            type="button"
            onClick={() => setZoomedImage(null)}
            aria-label="Cerrar vista ampliada"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-[#1c1915] border border-[#5c4838] text-[#dfd5bd] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={zoomedImage.src}
            alt={zoomedImage.caption}
            referrerPolicy="no-referrer"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[78dvh] max-w-[94vw] object-contain border border-[#5c4838] shadow-[0_24px_80px_rgba(0,0,0,0.98)] cursor-default"
          />
          <p className="mt-3 text-center font-mono-tech text-[11px] sm:text-xs text-amber-200 max-w-2xl px-2">
            {zoomedImage.caption}
          </p>
        </div>
      )}

      {/* Jumpscare Preview Modal Overlay (Plays exact Door, Hallway or Vent animation out of the 12) */}
      {previewJumpscare && (
        <div
          onClick={() => {
            if (previewTimerRef.current) {
              window.clearTimeout(previewTimerRef.current);
              previewTimerRef.current = null;
            }
            soundEngine.stopJumpscare();
            setPreviewJumpscare(null);
          }}
          className="fixed inset-0 h-dvh z-50 bg-black flex items-center justify-center overflow-hidden cursor-pointer"
        >
          {previewJumpscare.source === 'vent' && (
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
          <div
            className={
              JUMPSCARE_ANIM_MAP[previewJumpscare.source][previewJumpscare.id] ||
              'animate-jumpscare-office-charro'
            }
          >
            <TelechobiSprite
              id={previewJumpscare.id}
              variant="jumpscare"
              jumpscareSource={previewJumpscare.source}
              className="h-[92dvh] sm:h-[108dvh] w-auto"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 crt-scanlines opacity-50" />
        </div>
      )}
    </div>
  );
}
