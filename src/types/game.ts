import camerasIconAsset from '../assets/images/camaras_logo_90s_1794686091005.jpg';
import closeCamerasIconAsset from '../assets/images/cerrar_camaras_90s_1794686583985.jpg';
import flashlightIconAsset from '../assets/images/linterna_90s_1794686091738.jpg';
import maskPropIconAsset from '../assets/images/mascara_prop_90s_1794686107552.jpg';
import doorSwitchIconAsset from '../assets/images/puerta_control_90s_1794686092777.jpg';

export type TelechobiId = 'ton' | 'toso' | 'nita' | 'tis';

export type CameraId =
  | 'cam1'
  | 'cam2'
  | 'cam3'
  | 'cam4'
  | 'cam5'
  | 'cam6'
  | 'cam7'
  | 'cam8'
  | 'cam9';

export type OfficeView = 'left' | 'center' | 'right';

export type JumpscareSource = 'door' | 'hallway';

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
}

export const CAMERA_ROOMS: CameraRoom[] = [
  {
    id: 'cam1',
    code: 'CAM 01',
    name: 'Foro Principal (Pasto Sintético Podrido)',
    shortName: 'Foro 4',
    image: '/assets/aistudio/images__4__0245b14b.jpeg',
    hasPastoOverlay: true,
    mapX: 48,
    mapY: 14,
    adjacent: ['cam2', 'cam3', 'cam5'],
  },
  {
    id: 'cam2',
    code: 'CAM 02',
    name: 'Almacén de Escenografía Infantil',
    shortName: 'Escenografía',
    image: '/assets/aistudio/images__1__eac16ee0.jpeg',
    mapX: 20,
    mapY: 24,
    adjacent: ['cam1', 'cam3', 'cam6'],
  },
  {
    id: 'cam3',
    code: 'CAM 03',
    name: 'Cuarto de Maquillaje y Vestuario',
    shortName: 'Vestuario',
    image: '/assets/aistudio/images__5__05a66934.jpeg',
    mapX: 76,
    mapY: 24,
    adjacent: ['cam1', 'cam4', 'cam7'],
  },
  {
    id: 'cam4',
    code: 'CAM 04',
    name: 'Sala de Edición y Control Betacam',
    shortName: 'Edición',
    image: '/assets/aistudio/images__9__04d08829.jpeg',
    mapX: 78,
    mapY: 48,
    adjacent: ['cam3', 'cam5', 'cam8'],
    canReachRightDoor: true,
  },
  {
    id: 'cam5',
    code: 'CAM 05',
    name: 'Foro Teatro (Telón Rasgado)',
    shortName: 'Foro Teatro',
    image: '/assets/aistudio/images__7__9e11073b.jpeg',
    mapX: 48,
    mapY: 42,
    adjacent: ['cam1', 'cam4', 'cam6', 'cam9'],
    canReachHallway: true,
  },
  {
    id: 'cam6',
    code: 'CAM 06',
    name: 'Pasillos Administrativos',
    shortName: 'Admin.',
    image: '/assets/aistudio/images__3__14ad0c8f.jpeg',
    mapX: 20,
    mapY: 50,
    adjacent: ['cam2', 'cam5', 'cam8'],
    canReachLeftDoor: true,
  },
  {
    id: 'cam7',
    code: 'CAM 07',
    name: 'Patio de Desechos CRT',
    shortName: 'Desechos TV',
    image: '/assets/aistudio/images__8__b3e3fba1.jpeg',
    mapX: 82,
    mapY: 72,
    adjacent: ['cam3', 'cam4', 'cam9'],
    canReachRightDoor: true,
  },
  {
    id: 'cam8',
    code: 'CAM 08',
    name: 'Sótano de Escaleras y Tubos',
    shortName: 'Sótano',
    image: '/assets/aistudio/images__12__6f4cb447.jpeg',
    mapX: 18,
    mapY: 74,
    adjacent: ['cam6', 'cam9'],
    canReachLeftDoor: true,
  },
  {
    id: 'cam9',
    code: 'CAM 09',
    name: 'Acceso Exterior Estudios',
    shortName: 'Acceso Ext.',
    image: '/assets/aistudio/images__10__f376b657.jpeg',
    mapX: 48,
    mapY: 66,
    adjacent: ['cam5', 'cam7', 'cam8'],
    canReachHallway: true,
  },
];

export const OFFICE_ASSETS = {
  officeBg: '/assets/aistudio/images__2__29265b7b.jpeg',
  hallway: '/assets/aistudio/images__15__98bd3676.jpeg',
  leftDoor: '/assets/aistudio/images__14__cf61bf78.jpeg',
  rightDoor: '/assets/aistudio/images__13__f9ef530a.jpeg',
  poster: '/assets/aistudio/images_072aabcd.jpeg',
  brokenTv: '/assets/aistudio/images__11__06de4861.jpeg',
  maskOverlay: '/assets/telechobis/mask.png',
  camerasIcon: camerasIconAsset,
  closeCamerasIcon: closeCamerasIconAsset,
  flashlightIcon: flashlightIconAsset,
  maskPropIcon: maskPropIconAsset,
  doorSwitchIcon: doorSwitchIconAsset,
};

export interface PlayerSave {
  userId: string;
  displayName: string;
  currentNight: number;
  completedNights: number;
  night6Completed: boolean;
  extrasUnlocked: boolean;
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
    allowMultiThreat: true,
  },
};
