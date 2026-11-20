import camerasIconAsset from '../assets/images/camaras_logo_90s_1794686091005.jpg';
import closeCamerasIconAsset from '../assets/images/cerrar_camaras_90s_1794686583985.jpg';
import flashlightIconAsset from '../assets/images/linterna_90s_1794686091738.jpg';
import maskPropIconAsset from '../assets/images/mascara_prop_90s_1794686107552.jpg';
import doorSwitchIconAsset from '../assets/images/puerta_control_90s_1794686092777.jpg';

export type ClassicEnemyId = 'ton' | 'toso' | 'nita' | 'tis';
export type Night7EnemyId = 'arbol' | 'champi' | 'non' | 'charro';
export type SecretBrainrotEnemyId = 'glamrock' | 'tralalero';
export type TelechobiId = ClassicEnemyId | Night7EnemyId | SecretBrainrotEnemyId;
export type OfficeId = 'main' | 'second';

export const CLASSIC_ENEMY_IDS: ClassicEnemyId[] = ['ton', 'toso', 'nita', 'tis'];
export const NIGHT7_ENEMY_IDS: Night7EnemyId[] = ['arbol', 'champi', 'non', 'charro'];
export const SECRET_BRAINROT_ENEMY_IDS: SecretBrainrotEnemyId[] = ['glamrock', 'tralalero'];
export const BASE_ENEMY_IDS: TelechobiId[] = [...CLASSIC_ENEMY_IDS, ...NIGHT7_ENEMY_IDS];
export const ALL_ENEMY_IDS: TelechobiId[] = [
  ...CLASSIC_ENEMY_IDS,
  ...NIGHT7_ENEMY_IDS,
  ...SECRET_BRAINROT_ENEMY_IDS,
];

export type CameraId =
  | 'cam1'
  | 'cam2'
  | 'cam3'
  | 'cam4'
  | 'cam5'
  | 'cam6'
  | 'cam7'
  | 'cam8'
  | 'cam9'
  | 'cam10'
  | 'cam11'
  | 'cam12';

export type OfficeView = 'left' | 'center' | 'right' | 'back';

export type JumpscareSource =
  | 'left_door'
  | 'right_door'
  | 'door'
  | 'hallway'
  | 'vent'
  | 'office'
  | 'oxygen';

export type ScreenState =
  | 'MENU'
  | 'NEWSPAPER'
  | 'NIGHT_INTRO'
  | 'PLAYING'
  | 'JUMPSCARE'
  | 'GAME_OVER'
  | 'NIGHT_WIN'
  | 'EXTRAS';

export interface TelechobiMeta {
  id: TelechobiId;
  name: string;
  role: string;
  spritePath: string;
  suitColor: string;
  hoodColor: string;
  eyeColor: string;
  description: string;
  behaviorNote: string;
  isNight7Boss?: boolean;
  isSecretBrainrot?: boolean;
}

export const TELECHOBIS: Record<TelechobiId, TelechobiMeta> = {
  ton: {
    id: 'ton',
    name: 'TON',
    role: 'Botarga Principal · Traje Azul y Cuello Amarillo',
    spritePath: '/assets/telechobis/ton.png',
    suitColor: '#1a365d',
    hoodColor: '#d9a426',
    eyeColor: '#fde047',
    description:
      'El líder azul del elenco de 1998. Sus orejas desgarradas dejan ver cables sueltos, su brazo izquierdo quedó reducido al endoesqueleto oxidado y su rostro de porcelana muestra grietas profundas.',
    behaviorNote:
      'Altamente impredecible: alterna emboscadas rápidas por el pasillo central con acecho silencioso en ambas puertas metálicas.',
  },
  toso: {
    id: 'toso',
    name: 'TOSO',
    role: 'Botarga Secundaria · Traje Verde y Capucha Rosa',
    spritePath: '/assets/telechobis/toso.png',
    suitColor: '#14532d',
    hoodColor: '#be185d',
    eyeColor: '#4ade80',
    description:
      'Botarga verde musgo con costuras burdas en el torso, gorro rosa con flor marchita y mandíbula suspendida sobre varillas metálicas negras.',
    behaviorNote:
      'Suele fijar la mirada en las cámaras de seguridad hasta sobrecargar el lente con estática si lo observas demasiado tiempo.',
  },
  nita: {
    id: 'nita',
    name: 'NITA',
    role: 'Botarga Infantil · Traje Amarillo y Capucha Verde',
    spritePath: '/assets/telechobis/nita.png',
    suitColor: '#ca8a04',
    hoodColor: '#15803d',
    eyeColor: '#fb923c',
    description:
      'La figura mostaza con el pecho abierto mostrando su estructura interna, un pie completamente metálico y un ojo hundido llorando aceite negro.',
    behaviorNote:
      'Responde con rapidez al sonido del teléfono en las oficinas, pero si se acerca al pasillo central exige colocarse la máscara al instante.',
  },
  tis: {
    id: 'tis',
    name: 'TIS',
    role: 'Botarga Menor · Traje Carmesí y Gorro Bicolor',
    spritePath: '/assets/telechobis/tis.png',
    suitColor: '#9d174d',
    hoodColor: '#eab308',
    eyeColor: '#f43f5e',
    description:
      'La botarga magenta cubierta de quemaduras, sonrisa afilada repleta de dientes oscuros y brazo derecho mecánico expuesto.',
    behaviorNote:
      'Silenciosa y oportunista: prefiere flanquear por las puertas laterales mientras los demás distraen tu linterna en el pasillo.',
  },
  arbol: {
    id: 'arbol',
    name: 'ÁRBOL',
    role: 'Jefe Final · Entidad del Bosque (Alonso Córdova)',
    spritePath: '/assets/telechobis/arbol.png',
    suitColor: '#422c17',
    hoodColor: '#2c4724',
    eyeColor: '#f97316',
    description:
      'Coloso de madera muerta, resortes retorcidos y fauces en el vientre. Dentro de esta estructura reside el alma condenada de Alonso Córdova tras sellar su pacto.',
    behaviorNote:
      'Teletransportación instantánea (ÚNICO enemigo capaz de teletransportarse, más rápido que el resto): puede aparecer en cualquier cámara, ventilación, puerta o justo frente a ti tras su risa grave de FNAF 4.',
    isNight7Boss: true,
  },
  non: {
    id: 'non',
    name: 'ÑON',
    role: 'Jefe Final · Champiñón Mutilado (Sin Extremidades Inferiores)',
    spritePath: '/assets/telechobis/non.png',
    suitColor: '#a16207',
    hoodColor: '#15803d',
    eyeColor: '#ef4444',
    description:
      'Animatrónico mutilado de cintura hacia abajo, gafas rotas y chaleco amarillo desgarrado que se arrastra velozmente sobre los cables y ductos de ventilación.',
    behaviorNote:
      'Se arrastra desde CAM 09 hacia las ventilaciones (VENT 12 y VENT 11) con sonido de ventilación y Crawl. Es el ÚNICO enemigo afectado por el Audio en VENT 11; en VENT 12 todos son repelidos por los gemidos de Homero. Único Screamer: Ventilación.',
    isNight7Boss: true,
  },
  champi: {
    id: 'champi',
    name: 'CHAMPI',
    role: 'Jefe Final · Patinador Desfigurado',
    spritePath: '/assets/telechobis/champi.png',
    suitColor: '#166534',
    hoodColor: '#b91c1c',
    eyeColor: '#4ade80',
    description:
      'Mitad chatarra oxidada y mitad champiñón parlante destrozado sobre patines de cuatro ruedas que rechinan violentamente contra los azulejos del estudio.',
    behaviorNote:
      'Rueda cámara por cámara hacia CAM 01/02 con sonido mecánico (Gears 1); es el único al que debes buscar en las cámaras para expulsarlo antes de que llegue a la última cámara y ataque al instante en puerta o pasillo (no usa ventilación).',
    isNight7Boss: true,
  },
  charro: {
    id: 'charro',
    name: 'EL CHARRO NEGRO',
    role: 'Entidad Demoníaca · El Acreedor del Pacto',
    spritePath: '/assets/telechobis/charro_negro.png',
    suitColor: '#09090b',
    hoodColor: '#18181b',
    eyeColor: '#dc2626',
    description:
      'Aparición espectral de sombrero ancho y látigo ensangrentado con ojos incandescentes. Recolectó las almas del Foro 4 y el alma de Beatriz.',
    behaviorNote:
      'Destroza los lentes de las cámaras y aparece directamente frente a ti en la oficina. Solo puede matarte si no usas la Máscara [M] o las Cámaras [W].',
    isNight7Boss: true,
  },
  glamrock: {
    id: 'glamrock',
    name: 'GLAMROCK AURA',
    role: 'Entidad Secreta · El Agricultor de Aura',
    spritePath: '/assets/telechobis/glamrock_aura.png',
    suitColor: '#292524',
    hoodColor: '#ca8a04',
    eyeColor: '#60a5fa',
    description:
      'Zorro animatrónico con sudadera "FAMEAR AURA", sombrero fedora y medidor de Aura +1000. No patrulla pasillos ni cámaras: aparece en cualquiera de los 4 lados de la habitación.',
    behaviorNote:
      'Al aparecer grita "ES HORA DE DE DE DE DEL DUELO". Gira hacia su muro y presiona "FARMEANDING AURA" para batirte en un duelo de gestos Aura (Six-Seven 6-7, Mewing, Saludo Fake, Sigma y más) hasta hacerlo huir. Nunca aparece en el generador trasero de la oficina principal.',
    isSecretBrainrot: true,
  },
  tralalero: {
    id: 'tralalero',
    name: 'TRALALERO FAZ-SHARK',
    role: 'Entidad Secreta · Tiburón Brainrot Italiano',
    spritePath: '/assets/telechobis/tralalero_faz_shark.png',
    suitColor: '#475569',
    hoodColor: '#dc2626',
    eyeColor: '#e2e8f0',
    description:
      'Criatura biomecánica de cabeza de tiburón con tenis rojo, turbina militar, cafetera espresso pectoral y séquito de albóndigas armadas y ralladores gritando "MAMMA MIA! NON CAPISCO NIENTE!".',
    behaviorNote:
      'Mientras ataca reproduce "Tralalero Tralala" sin parar. Gira hacia el lado donde aparece y muéstrale tu Currículum Vitae para espantarlo de inmediato y cortar su canción. Nunca aparece en el generador trasero de la oficina principal.',
    isSecretBrainrot: true,
  },
};

export interface CameraRoom {
  id: CameraId;
  code: string;
  name: string;
  shortName: string;
  image: string;
  hasPastoOverlay?: boolean;
  mapX: number;
  mapY: number;
  adjacent: CameraId[];
  canReachLeftDoor?: boolean;
  canReachRightDoor?: boolean;
  canReachHallway?: boolean;
  hasAudio?: boolean;
  isVentCam?: boolean;
}

// 12-camera schematic synchronized to reference blueprint + 2 Ventilation cameras:
// ONLY CAM 01 & CAM 02 reach Office Doors; ONLY CAM 02 reaches the Central Hallway directly.
// CAM 11 connects CAM 10 -> Office (Ventilation), CAM 12 connects CAM 09 -> CAM 07 (Ventilation).
// Audio lure is available ONLY on certain cameras (cam3, cam5, cam6, cam8, cam9, cam11, cam12).
export const CAMERA_ROOMS: CameraRoom[] = [
  {
    id: 'cam1',
    code: 'CAM 01',
    name: 'Pasillo Poniente (Acceso Izquierdo)',
    shortName: 'Pasillo Izq.',
    image: '/assets/aistudio/images__4__0245b14b.jpeg',
    hasPastoOverlay: true,
    mapX: 33,
    mapY: 74,
    adjacent: ['cam2', 'cam5', 'cam6'],
    canReachLeftDoor: true,
  },
  {
    id: 'cam2',
    code: 'CAM 02',
    name: 'Pasillo Central y Acceso Oriente',
    shortName: 'Cruce Oficina',
    image: '/assets/aistudio/images__1__eac16ee0.jpeg',
    mapX: 61,
    mapY: 51,
    adjacent: ['cam1', 'cam3', 'cam4', 'cam5'],
    canReachRightDoor: true,
    canReachHallway: true,
  },
  {
    id: 'cam3',
    code: 'CAM 03',
    name: 'Cuarto de Maquillaje y Vestuario',
    shortName: 'Vestuario',
    image: '/assets/aistudio/images__5__05a66934.jpeg',
    mapX: 71,
    mapY: 60,
    adjacent: ['cam2', 'cam4'],
    hasAudio: true,
  },
  {
    id: 'cam4',
    code: 'CAM 04',
    name: 'Sala de Edición y Control Betacam',
    shortName: 'Edición',
    image: '/assets/aistudio/images__9__04d08829.jpeg',
    mapX: 71,
    mapY: 42,
    adjacent: ['cam2', 'cam3', 'cam10'],
  },
  {
    id: 'cam5',
    code: 'CAM 05',
    name: 'Foro Teatro (Telón Rasgado)',
    shortName: 'Foro Teatro',
    image: '/assets/aistudio/images__7__9e11073b.jpeg',
    mapX: 46,
    mapY: 48,
    adjacent: ['cam1', 'cam2', 'cam6', 'cam8'],
    hasAudio: true,
  },
  {
    id: 'cam6',
    code: 'CAM 06',
    name: 'Pasillos Administrativos',
    shortName: 'Admin.',
    image: '/assets/aistudio/images__3__14ad0c8f.jpeg',
    mapX: 30,
    mapY: 48,
    adjacent: ['cam1', 'cam5', 'cam7'],
    hasAudio: true,
  },
  {
    id: 'cam7',
    code: 'CAM 07',
    name: 'Patio de Desechos CRT',
    shortName: 'Desechos TV',
    image: '/assets/aistudio/images__8__b3e3fba1.jpeg',
    mapX: 30,
    mapY: 31,
    adjacent: ['cam6', 'cam8', 'cam9', 'cam12'],
  },
  {
    id: 'cam8',
    code: 'CAM 08',
    name: 'Sótano de Escaleras y Tubos',
    shortName: 'Sótano',
    image: '/assets/aistudio/images__12__6f4cb447.jpeg',
    mapX: 46,
    mapY: 36,
    adjacent: ['cam5', 'cam7', 'cam9'],
    hasAudio: true,
  },
  {
    id: 'cam9',
    code: 'CAM 09',
    name: 'Sala Arcade y Servidores Sellados',
    shortName: 'Arcade / Boss',
    image: '/assets/aistudio/images__2__66f1f9a9.jpeg',
    mapX: 59,
    mapY: 22,
    adjacent: ['cam7', 'cam8', 'cam10', 'cam12'],
    hasAudio: true,
  },
  {
    id: 'cam10',
    code: 'CAM 10',
    name: 'Acceso Exterior Estudios',
    shortName: 'Acceso Ext.',
    image: '/assets/aistudio/images__10__f376b657.jpeg',
    mapX: 68,
    mapY: 22,
    adjacent: ['cam4', 'cam9', 'cam11'],
  },
  {
    id: 'cam11',
    code: 'CAM 11',
    name: 'Ventilación Oriente (CAM 10 → Oficina)',
    shortName: 'Vent. 10→Ofi',
    image: '/assets/aistudio/images__1__18266e1f.jpeg',
    mapX: 81.5,
    mapY: 82.0,
    adjacent: ['cam10'],
    hasAudio: true,
    isVentCam: true,
  },
  {
    id: 'cam12',
    code: 'CAM 12',
    name: 'Ventilación Norte (CAM 09 → CAM 07)',
    shortName: 'Vent. 09→07',
    image: '/assets/aistudio/images_24e0a55c.jpeg',
    mapX: 25.0,
    mapY: 11.5,
    adjacent: ['cam7', 'cam9'],
    hasAudio: true,
    isVentCam: true,
  },
];

export const STUDIO_DECOR_PROPS = {
  posterGroup: '/assets/props/poster_group.png',
  posterYellow: '/assets/props/poster_yellow.png',
  posterPink: '/assets/props/poster_pink.png',
  bannerBalloons: '/assets/props/banner_balloons.png',
  serverRackLeft: '/assets/props/server_rack_left.png',
  serverRackRight: '/assets/props/server_rack_right.png',
  plushDuo: '/assets/props/plush_duo.png',
  plushGreen: '/assets/props/plush_green.png',
  plushTopDuo: '/assets/props/plush_top_duo.png',
  pcDeskFg: '/assets/props/pc_desk_fg.png',
  pcDeskRight: '/assets/props/pc_desk_right.png',
  boxBalls: '/assets/props/box_balls.png',
  clothesChair: '/assets/props/clothes_chair.png',
  shoesCables: '/assets/props/shoes_cables.png',
  vintagePhoto: '/assets/aistudio/FB_IMG_1794976009835_6a6c4464.jpg',
} as const;

export const OFFICE_ASSETS = {
  officeBg: '/assets/aistudio/images__2__29265b7b.jpeg',
  hallway: '/assets/aistudio/images__15__98bd3676.jpeg',
  leftDoor: '/assets/aistudio/images__14__cf61bf78.jpeg',
  rightDoor: '/assets/aistudio/images__13__f9ef530a.jpeg',
  backRoom: '/assets/aistudio/1794801632129_1986f928.jpg',
  generator: '/assets/office/generator_clean.png',
  newspapersSpread: '/assets/aistudio/1794803520431_84eb7787.jpg',
  newspaperGrafico: '/assets/office/newspaper_grafico.jpg',
  newspaperPrensa: '/assets/office/newspaper_prensa.jpg',
  newspaperUniversal: '/assets/office/newspaper_universal.jpg',
  poster: '/assets/aistudio/images_072aabcd.jpeg',
  brokenTv: '/assets/aistudio/images__11__06de4861.jpeg',
  maskOverlay: '/assets/telechobis/mask.png',
  ventGrille: '/assets/office/vent_grille_clean.png',
  champiInterferenceVideo: '/assets/aistudio/images_2e510aef.mp4',
  camerasIcon: camerasIconAsset,
  closeCamerasIcon: closeCamerasIconAsset,
  flashlightIcon: flashlightIconAsset,
  maskPropIcon: maskPropIconAsset,
  doorSwitchIcon: doorSwitchIconAsset,
  curriculumVitae: '/assets/office/curriculum_vitae.png',
};

export const SECOND_OFFICE_ASSETS: Record<OfficeView, string> = {
  center: '/assets/aistudio/image_55ab2fc8.png',
  left: '/assets/aistudio/image_89982f51.png',
  right: '/assets/aistudio/image_5af4b199.png',
  back: '/assets/aistudio/image_1b9c1d9e.png',
};

export interface PlayerSave {
  userId: string;
  displayName: string;
  currentNight: number;
  completedNights: number;
  night6Completed: boolean;
  night7Completed?: boolean;
  extrasUnlocked: boolean;
  secretNight2Completed?: boolean;
  totalDeaths: number;
  totalHoursSurvived: number;
  bestNightPowerRemaining: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NightDifficultyConfig {
  night: number;
  baseDrainPerSecond: number;
  aiAggression: number;
  moveIntervalSeconds: number;
  initialGraceSeconds: number;
  phoneFailureRate: number;
  attackPatienceSeconds: number;
  hallPatienceSeconds: number;
  ventPatienceSeconds: number;
  allowMultiThreat: boolean;
}

// Exact 6 minutes per night = 360 seconds
export const NIGHT_DURATION_SECONDS = 360;
export const SECONDS_PER_HOUR = 60;

export const NIGHT_CONFIGS: Record<number, NightDifficultyConfig> = {
  1: {
    night: 1,
    baseDrainPerSecond: 0.068,
    aiAggression: 0.44,
    moveIntervalSeconds: 7.2,
    initialGraceSeconds: 7.5,
    phoneFailureRate: 0.004,
    attackPatienceSeconds: 9.0,
    hallPatienceSeconds: 7.2,
    ventPatienceSeconds: 22.0,
    allowMultiThreat: false,
  },
  2: {
    night: 2,
    baseDrainPerSecond: 0.09,
    aiAggression: 0.6,
    moveIntervalSeconds: 5.4,
    initialGraceSeconds: 5.2,
    phoneFailureRate: 0.01,
    attackPatienceSeconds: 7.2,
    hallPatienceSeconds: 5.8,
    ventPatienceSeconds: 19.5,
    allowMultiThreat: false,
  },
  3: {
    night: 3,
    baseDrainPerSecond: 0.115,
    aiAggression: 0.74,
    moveIntervalSeconds: 4.0,
    initialGraceSeconds: 3.6,
    phoneFailureRate: 0.016,
    attackPatienceSeconds: 5.8,
    hallPatienceSeconds: 4.6,
    ventPatienceSeconds: 17.0,
    allowMultiThreat: true,
  },
  4: {
    night: 4,
    baseDrainPerSecond: 0.14,
    aiAggression: 0.86,
    moveIntervalSeconds: 2.9,
    initialGraceSeconds: 2.4,
    phoneFailureRate: 0.023,
    attackPatienceSeconds: 4.6,
    hallPatienceSeconds: 3.6,
    ventPatienceSeconds: 15.0,
    allowMultiThreat: true,
  },
  5: {
    night: 5,
    baseDrainPerSecond: 0.165,
    aiAggression: 0.94,
    moveIntervalSeconds: 2.0,
    initialGraceSeconds: 1.4,
    phoneFailureRate: 0.032,
    attackPatienceSeconds: 3.7,
    hallPatienceSeconds: 2.8,
    ventPatienceSeconds: 13.5,
    allowMultiThreat: true,
  },
  6: {
    night: 6,
    baseDrainPerSecond: 0.19,
    aiAggression: 1.0,
    moveIntervalSeconds: 1.25,
    initialGraceSeconds: 0.6,
    phoneFailureRate: 0.042,
    attackPatienceSeconds: 2.85,
    hallPatienceSeconds: 2.1,
    ventPatienceSeconds: 11.5,
    allowMultiThreat: true,
  },
  7: {
    night: 7,
    baseDrainPerSecond: 0.21,
    aiAggression: 1.0,
    moveIntervalSeconds: 1.12,
    initialGraceSeconds: 0.5,
    phoneFailureRate: 0.046,
    attackPatienceSeconds: 2.75,
    hallPatienceSeconds: 2.05,
    ventPatienceSeconds: 11.0,
    allowMultiThreat: true,
  },
};

export interface CheatsConfig {
  noAudioErrorsInstant: boolean;
  infinitePower: boolean;
  doorsClosedStart: boolean;
  infiniteOxygen: boolean;
  radar: boolean;
  infiniteHomerMoans: boolean;
  autoAvoidChampi?: boolean;
  alwaysFarmAura?: boolean;
  alwaysHoldCv?: boolean;
}

export const DEFAULT_CHEATS: CheatsConfig = {
  noAudioErrorsInstant: false,
  infinitePower: false,
  doorsClosedStart: false,
  infiniteOxygen: false,
  radar: false,
  infiniteHomerMoans: false,
  autoAvoidChampi: false,
  alwaysFarmAura: false,
  alwaysHoldCv: false,
};

export const DEFAULT_AI_LEVELS: Record<TelechobiId, number> = {
  ton: 5,
  toso: 5,
  nita: 5,
  tis: 5,
  arbol: 0,
  champi: 0,
  non: 0,
  charro: 0,
  glamrock: 0,
  tralalero: 0,
};

export const NIGHT_CLASSIC_BASE_AI: Record<
  number,
  Record<'ton' | 'toso' | 'nita' | 'tis', number>
> = {
  1: { ton: 2, toso: 2, nita: 1, tis: 1 },
  2: { ton: 5, toso: 4, nita: 3, tis: 3 },
  3: { ton: 8, toso: 7, nita: 6, tis: 6 },
  4: { ton: 11, toso: 10, nita: 9, tis: 10 },
  5: { ton: 14, toso: 14, nita: 13, tis: 14 },
  6: { ton: 18, toso: 18, nita: 17, tis: 18 },
};

export interface CustomNightLaunchConfig {
  night: number;
  isCustomAI: boolean;
  isDefinitiveNight?: boolean;
  isSecretBrainrotNight?: boolean;
  officeId?: OfficeId;
  fromNightSelector?: boolean;
  aiLevels: Record<TelechobiId, number>;
  enableGeneratorRecharge: boolean;
  durationMinutes: number; // 1..360 (1 min to 6 real hours)
  cheats: CheatsConfig;
  title?: string;
}

export interface CustomChallengePreset {
  id: number;
  difficulty: number; // 0..20
  name: string;
  subtitle: string;
  aiLevels: Record<TelechobiId, number>;
}

const zeroBosses = { arbol: 0, champi: 0, non: 0, charro: 0, glamrock: 0, tralalero: 0 };
const zeroSecret = { glamrock: 0, tralalero: 0 };

export const EASY_CHALLENGE_4_0: CustomChallengePreset = {
  id: 0,
  difficulty: 0,
  name: 'Fácil · Modo 8/0',
  subtitle: 'Todos inactivos (0 en los enemigos)',
  aiLevels: { ton: 0, toso: 0, nita: 0, tis: 0, ...zeroBosses },
};

// 20 Progressive Personalized Challenges + Final Night 7 Boss Presets
export const CUSTOM_NIGHT_CHALLENGES: CustomChallengePreset[] = [
  { id: 1, difficulty: 1, name: 'Reto 01 · Primer Pulso (1/20)', subtitle: 'Inicio suave en el Foro 4', aiLevels: { ton: 1, toso: 1, nita: 0, tis: 0, ...zeroBosses } },
  { id: 2, difficulty: 2, name: 'Reto 02 · Pasos Lentos (2/20)', subtitle: 'Movimientos esporádicos', aiLevels: { ton: 1, toso: 2, nita: 1, tis: 1, ...zeroBosses } },
  { id: 3, difficulty: 3, name: 'Reto 03 · Dúo de Vestuario (3/20)', subtitle: 'Flancos laterales activos', aiLevels: { ton: 1, toso: 3, nita: 1, tis: 3, ...zeroBosses } },
  { id: 4, difficulty: 4, name: 'Reto 04 · Alerta de Pasillo (4/20)', subtitle: 'Nita lidera el pasillo', aiLevels: { ton: 2, toso: 2, nita: 4, tis: 2, ...zeroBosses } },
  { id: 5, difficulty: 5, name: 'Reto 05 · Vigilancia Eléctrica (5/20)', subtitle: 'Ton acelera cada 3.02s', aiLevels: { ton: 5, toso: 3, nita: 2, tis: 3, ...zeroBosses } },
  { id: 6, difficulty: 6, name: 'Reto 06 · Sombras del Set (6/20)', subtitle: 'Presión equilibrada', aiLevels: { ton: 4, toso: 6, nita: 5, tis: 6, ...zeroBosses } },
  { id: 7, difficulty: 7, name: 'Reto 07 · Señal de Azteca 7 (7/20)', subtitle: 'Ritmo constante en cámaras', aiLevels: { ton: 7, toso: 5, nita: 5, tis: 5, ...zeroBosses } },
  { id: 8, difficulty: 8, name: 'Reto 08 · Compuertas Pesadas (8/20)', subtitle: 'Toso y Tis presionan puertas', aiLevels: { ton: 5, toso: 8, nita: 4, tis: 8, ...zeroBosses } },
  { id: 9, difficulty: 9, name: 'Reto 09 · Cortocircuito (9/20)', subtitle: 'Asaltos rápidos por pasillo', aiLevels: { ton: 6, toso: 7, nita: 9, tis: 6, ...zeroBosses } },
  { id: 10, difficulty: 10, name: 'Reto 10 · Escala 4/10 (10/20)', subtitle: 'Clásicos en nivel 10', aiLevels: { ton: 10, toso: 10, nita: 10, tis: 10, ...zeroBosses } },
  { id: 11, difficulty: 11, name: 'Reto 11 · Trío del Foro (11/20)', subtitle: 'Ataque coordinado en 3 rutas', aiLevels: { ton: 11, toso: 11, nita: 6, tis: 11, ...zeroBosses } },
  { id: 12, difficulty: 12, name: 'Reto 12 · Fiebre en el Pasillo (12/20)', subtitle: 'Vigila el CCTV contra Nita', aiLevels: { ton: 10, toso: 9, nita: 12, tis: 9, ...zeroBosses } },
  { id: 13, difficulty: 13, name: 'Reto 13 · Demanda de la BBC (13/20)', subtitle: 'Presión alta sin tregua', aiLevels: { ton: 13, toso: 12, nita: 10, tis: 12, ...zeroBosses } },
  { id: 14, difficulty: 14, name: 'Reto 14 · Doble Flanco (14/20)', subtitle: 'Puertas bajo asedio continuo', aiLevels: { ton: 11, toso: 14, nita: 11, tis: 14, ...zeroBosses } },
  { id: 15, difficulty: 15, name: 'Reto 15 · Pacto del Bosque (15/20)', subtitle: 'Árbol, Champi, Ñon y Charro en 15', aiLevels: { ton: 0, toso: 0, nita: 0, tis: 0, arbol: 15, champi: 15, non: 15, charro: 15, ...zeroSecret } },
  { id: 16, difficulty: 16, name: 'Reto 16 · Cinta Perdida 1998 (16/20)', subtitle: 'Ton casi imparable + Árbol', aiLevels: { ton: 16, toso: 15, nita: 14, tis: 15, arbol: 8, champi: 0, non: 0, charro: 6, ...zeroSecret } },
  { id: 17, difficulty: 17, name: 'Reto 17 · Madrugada Sin Luz (17/20)', subtitle: 'Supervivencia crítica', aiLevels: { ton: 17, toso: 16, nita: 16, tis: 16, ...zeroBosses } },
  { id: 18, difficulty: 18, name: 'Reto 18 · Demolición Inminente (18/20)', subtitle: 'Reflejos al límite', aiLevels: { ton: 18, toso: 17, nita: 18, tis: 17, ...zeroBosses } },
  { id: 19, difficulty: 19, name: 'Reto 19 · Último Aviso 8/19 (19/20)', subtitle: 'Todos los 8 enemigos base en 19', aiLevels: { ton: 19, toso: 19, nita: 19, tis: 19, arbol: 19, champi: 19, non: 19, charro: 19, ...zeroSecret } },
  { id: 20, difficulty: 20, name: 'Reto 20 · Infierno 8/20 (20/20)', subtitle: 'Los 8 enemigos base al máximo (20)', aiLevels: { ton: 20, toso: 20, nita: 20, tis: 20, arbol: 20, champi: 20, non: 20, charro: 20, ...zeroSecret } },
];
