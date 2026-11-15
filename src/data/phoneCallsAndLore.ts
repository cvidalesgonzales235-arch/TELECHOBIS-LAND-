export interface PhoneCallSegment {
  startSec: number;
  endSec: number;
  speaker: string;
  text: string;
  spokenText?: string;
  voiceDelaySec?: number;
  voicePitch?: number;
  voiceRate?: number;
  cue?: 'ring' | 'voice' | 'ton_footsteps' | 'ton_ambush' | 'line_dead';
}

export interface PhoneCallScript {
  night: number;
  callerLabel: string;
  durationSec: number;
  segments: PhoneCallSegment[];
}

export interface NightBriefing {
  night: number;
  title: string;
  mechanicsSummary: string[];
  eventsSummary: string;
}

export const SERIES_FULL_HISTORY = `Los Telechobis fue una serie infantil producida por TV Azteca entre 1998 y 1999 que surgió como una copia directa del exitoso programa británico Teletubbies. Todo comenzó en 1998, cuando las distribuidoras del formato original de la BBC ofrecieron los derechos de transmisión a las principales cadenas de México. La televisora del Ajusco rechazó el trato porque el contrato exigía transmitir los episodios sin cortes comerciales, por lo que Televisa adquirió la licencia para emitirlos en Canal 5. Para no quedarse atrás y adelantarse al estreno de su competencia, el productor Alejandro Romero desarrolló una versión local que debutó en noviembre de 1998 por Azteca 7, cinco meses antes de que la serie británica llegara oficialmente al país en abril de 1999.

El programa presentaba a cuatro criaturas de colores llamadas Ton, Toso, Nita y Tis, quienes usaban botargas con antenas y vivían en un bosque junto a un árbol y unos champiñones parlantes. A diferencia de los personajes británicos que solo balbuceaban, estos duendes hablaban en español, cantaban y enseñaban lecciones básicas sobre colores, sonidos y convivencia. Debido a que salieron al aire primero en México, muchos niños y padres llegaron a pensar que la producción británica era la imitación. Sin embargo, la apariencia poco agraciada y algo inquietante de los disfraces generó críticas entre la audiencia, y la enorme similitud visual y conceptual pronto llamó la atención de los dueños de la franquicia original. A mediados de 1999, la BBC y la empresa distribuidora emprendieron acciones legales contra TV Azteca por plagio e infracción de derechos de autor. Aunque la producción mexicana intentó defenderse alegando que desconocía la existencia del programa británico, la presión legal obligó a la cadena a cancelar la serie y retirarla del aire de forma definitiva tras pocas emisiones. Con el paso del tiempo, la televisora borró prácticamente todo rastro oficial del proyecto, convirtiendo a Los Telechobis en una curiosa pieza de culto y material perdido de la televisión mexicana.`;

export const NIGHT_BRIEFINGS: Record<number, NightBriefing> = {
  1: {
    night: 1,
    title: 'NOCHE 1 · PRIMER TURNO EN EL FORO 4',
    mechanicsSummary: [
      'Oficina central: Usa Cámaras [W] y Máscara [M] solo aquí. Usa la Linterna [ESPACIO] para alumbrar el pasillo.',
      'Puertas laterales: Gira con [A]/[D] o flechas y sella la compuerta izquierda [Q] o derecha [E] con su caja eléctrica si escuchas o ves un Telechobi.',
      'Pasillo vs Puertas: Nunca atacan una puerta mientras haya alguien en el pasillo central (y viceversa). Si alguien aparece frente a ti en el pasillo, ponte la máscara [M] rápido.',
      'Llamada de Alejandro: El reloj, la batería y las fallas de audio esperan hasta que termine la llamada.',
    ],
    eventsSummary:
      'Alejandro Romero, productor del programa, llama para inducirte en tu primera guardia de 12:00 AM a 6:00 AM antes de la demolición del Foro 4.',
  },
  2: {
    night: 2,
    title: 'NOCHE 2 · PASOS EN EL FORO',
    mechanicsSummary: [
      'Mayor velocidad: Ton, Toso, Nita y Tis se desplazan más rápido por los pasillos y dejan menos segundos para reaccionar.',
      'Rastreo acústico: Cada desplazamiento genera pasos en los corredores de concreto; escucha si se acercan a una puerta o al pasillo central.',
      'Sobrecarga de lente: Si observas demasiado tiempo a un animatrónico en el CCTV, el lente se dañará temporalmente.',
    ],
    eventsSummary:
      'Alejandro relata cómo TV Azteca rechazó el contrato sin comerciales de la BBC y estrenó Los Telechobis en Azteca 7 cinco meses antes que Canal 5.',
  },
  3: {
    night: 3,
    title: 'NOCHE 3 · LA DEMANDA Y FALLAS ELÉCTRICAS',
    mechanicsSummary: [
      'Cortocircuitos de audio: El Timbre DF en el monitor puede caer bajo carga; mantén presionado "REINICIAR AUDIO" para restablecerlo.',
      'Amenazas alternas: Aunque jamás ocuparán pasillo y puertas al mismo tiempo, pueden relevarse en segundos tras retirarse.',
      'Ahorro energético: No mantengas las compuertas cerradas ni la linterna encendida sin necesidad.',
    ],
    eventsSummary:
      'Alejandro explica el rechazo del público hacia las inquietantes botargas y la demanda formal de la BBC y Ragdoll Productions en 1999.',
  },
  4: {
    night: 4,
    title: 'NOCHE 4 · EL ACCIDENTE OCULTO DEL RODAJE',
    mechanicsSummary: [
      'Ritmo implacable: Los cuatro trajes atacan con tiempos de paciencia muy reducidos en puertas y pasillo.',
      'Disciplina de máscara: Si te pones la máscara cuando alguien irrumpe en el pasillo, NO te la quites hasta que parpadee y desaparezca.',
      'Regla de oro: Usa el Timbre DF en salas lejanas como CAM 01, 02 o 03 para romper su avance.',
    ],
    eventsSummary:
      'Alejandro rompe el silencio y confiesa lo ocurrido en el set de grabación antes de la demanda de la BBC: los trajes están poseídos por las almas de los actores fallecidos.',
  },
};

export const PHONE_CALLS: Record<number, PhoneCallScript> = {
  1: {
    night: 1,
    callerLabel: 'ALEJANDRO ROMERO · PRODUCTOR (LÍNEA INTERNA)',
    durationSec: 27,
    segments: [
      {
        startSec: 0,
        endSec: 6.5,
        speaker: 'Alejandro Romero',
        cue: 'ring',
        voiceDelaySec: 0.9,
        voicePitch: 0.88,
        voiceRate: 1.02,
        text: '¿Bueno? ¿Me escuchas? Habla Alejandro Romero... yo fui el productor de "Los Telechobis" aquí en TV Azteca en el 98.',
      },
      {
        startSec: 6.5,
        endSec: 13.5,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.88,
        voiceRate: 1.03,
        text: 'Gracias por tomar el turno nocturno antes de la demolición del Foro 4. Por órdenes legales nadie puede sacar todavía las cuatro botargas: Ton, Toso, Nita y Tis.',
      },
      {
        startSec: 13.5,
        endSec: 20.5,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.89,
        voiceRate: 1.05,
        text: 'Escúchame bien: desde la oficina central revisas las cámaras [W] y usas el timbre telefónico para alejarlos. Si alguno corre por el pasillo central, ponte la máscara [M] rápido.',
        spokenText:
          'Escúchame bien: desde la oficina central revisas las cámaras con la tecla doble u, y usas el timbre telefónico para alejarlos. Si alguno corre por el pasillo central, ponte la máscara con la tecla eme rápido.',
      },
      {
        startSec: 20.5,
        endSec: 27,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.9,
        voiceRate: 1.04,
        text: 'A los costados tienes compuertas de acero [Q] y [E]. Mientras alguien vigile el pasillo no cruzarán las puertas, y viceversa. En cuanto cuelgue arranca tu reloj. ¡Suerte!',
        spokenText:
          'A los costados tienes compuertas de acero, con las teclas cu y e. Mientras alguien vigile el pasillo no cruzarán las puertas, y viceversa. En cuanto cuelgue arranca tu reloj. ¡Suerte!',
      },
    ],
  },
  2: {
    night: 2,
    callerLabel: 'ALEJANDRO ROMERO · GRABACIÓN TURNO 2',
    durationSec: 26,
    segments: [
      {
        startSec: 0,
        endSec: 6.5,
        speaker: 'Alejandro Romero',
        cue: 'ring',
        voiceDelaySec: 0.9,
        voicePitch: 0.88,
        voiceRate: 1.03,
        text: '¿Otra vez en tu puesto? Qué alivio. La segunda noche suele ponerse más tensa en el Foro 4.',
      },
      {
        startSec: 6.5,
        endSec: 13.5,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.87,
        voiceRate: 1.04,
        text: '¿Sabes por qué existen? En 1998 la BBC nos ofreció Teletubbies, pero pedían transmitir sin comerciales. Rechazamos el trato, Televisa los compró para Canal 5 y yo improvisé esto para Azteca 7.',
      },
      {
        startSec: 13.5,
        endSec: 20,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.86,
        voiceRate: 1.03,
        text: 'Salimos al aire cinco meses antes que los ingleses... mucha gente creyó que los británicos nos copiaron. Pero los trajes quedaron extraños, pesados, casi enfermos.',
      },
      {
        startSec: 20,
        endSec: 26,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.9,
        voiceRate: 1.06,
        text: 'Esta noche caminan más rápido. Pon atención a sus pasos en el concreto y no mires fijo una sola cámara demasiado tiempo o reventarán el lente.',
      },
    ],
  },
  3: {
    night: 3,
    callerLabel: 'ALEJANDRO ROMERO · LÍNEA DE EMERGENCIA',
    durationSec: 26,
    segments: [
      {
        startSec: 0,
        endSec: 6.5,
        speaker: 'Alejandro Romero',
        cue: 'ring',
        voiceDelaySec: 0.9,
        voicePitch: 0.89,
        voiceRate: 1.04,
        text: 'Buenas noches... si notas chispazos en el tablero del monitor, es normal. El cableado viejo del Ajusco está podrido desde el año pasado.',
      },
      {
        startSec: 6.5,
        endSec: 13.5,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.88,
        voiceRate: 1.05,
        text: 'A mediados del 99 la BBC y la distribuidora nos demandaron por plagio. Nos obligaron a cancelar todo tras pocas emisiones y borrar cada cinta de archivo posible.',
      },
      {
        startSec: 13.5,
        endSec: 20,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.88,
        voiceRate: 1.05,
        text: 'Los Telechobis pasaron a ser material perdido... pero aquí abajo nada se borró. Si el timbre DF se cae por cortocircuito, mantén oprimido reiniciar audio en tu panel.',
        spokenText:
          'Los Telechobis pasaron a ser material perdido, pero aquí abajo nada se borró. Si el timbre D F se cae por cortocircuito, mantén oprimido reiniciar audio en tu panel.',
      },
      {
        startSec: 20,
        endSec: 26,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.91,
        voiceRate: 1.04,
        text: 'Tendrás menos segundos para cerrar las puertas o ponerte la máscara. Respira hondo... mañana tengo que confesarte algo que ocultamos en el acta.',
      },
    ],
  },
  4: {
    night: 4,
    callerLabel: 'ALEJANDRO ROMERO · LLAMADA CONFIDENCIAL',
    durationSec: 32,
    segments: [
      {
        startSec: 0,
        endSec: 7.5,
        speaker: 'Alejandro Romero',
        cue: 'ring',
        voiceDelaySec: 0.9,
        voicePitch: 0.92,
        voiceRate: 1.06,
        text: 'Escúchame, ya no puedo seguir mintiéndote sobre fallas hidráulicas ni servomotores... mereces saber la verdad antes de que llegue la madrugada.',
      },
      {
        startSec: 7.5,
        endSec: 15.5,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.91,
        voiceRate: 1.05,
        text: 'Antes de que explotara la demanda de la BBC hubo un accidente fatal durante una grabación nocturna en este mismo set. La televisora lo silenció por completo.',
      },
      {
        startSec: 15.5,
        endSec: 24.5,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.9,
        voiceRate: 1.04,
        text: 'Los trajes de los Telechobis quedaron poseídos por las almas de los actores que murieron en ese accidente: Omar Pacheco en Ton el Azul, Rocío Lara en Toso La Amarilla, Iris Flores en Nita La Verde y Saidda Lara en Tis la Rosa.',
      },
      {
        startSec: 24.5,
        endSec: 32,
        speaker: 'Alejandro Romero',
        cue: 'voice',
        voicePitch: 0.93,
        voiceRate: 1.06,
        text: 'Siguen atrapados en el foro, furiosos porque borraron sus nombres de la televisión. Aguanta esta noche... mañana entraré yo mismo al sótano para cortarles la corriente.',
      },
    ],
  },
  5: {
    night: 5,
    callerLabel: 'ALEJANDRO ROMERO · EXTENSIÓN FORO 4 (EN VIVO)',
    durationSec: 23,
    segments: [
      {
        startSec: 0,
        endSec: 5.5,
        speaker: 'Alejandro Romero',
        cue: 'ring',
        voiceDelaySec: 0.9,
        voicePitch: 0.98,
        voiceRate: 1.12,
        text: '¡Guardia! Logré colarme al pasillo de edición del Foro 4... estoy buscando la caja maestra del sótano para desconectar los trajes antes de las seis.',
      },
      {
        startSec: 5.5,
        endSec: 10.5,
        speaker: 'Alejandro Romero',
        cue: 'ton_footsteps',
        voicePitch: 1.03,
        voiceRate: 1.15,
        text: 'Espera... algo pesado viene saliendo del escenario de pasto sintético... ¿Omar? No... la compuerta de edición no cierra... ¡Ton, atrás!',
      },
      {
        startSec: 10.5,
        endSec: 16.5,
        speaker: 'Alejandro Romero',
        cue: 'ton_ambush',
        voicePitch: 1.1,
        voiceRate: 1.18,
        text: '¡NO! ¡SUÉLTAME EL BRAZO, NO QUIERO— AAAAAAGH! [GOLPE METÁLICO Y ESTATICA DE TON]',
        spokenText: '¡No! ¡Suéltame el brazo, no quiero, aaaaagh!',
      },
      {
        startSec: 16.5,
        endSec: 23,
        speaker: 'SISTEMA TELEFÓNICO AJUSCO',
        cue: 'line_dead',
        voiceDelaySec: 0.85,
        voicePitch: 0.78,
        voiceRate: 0.96,
        text: '[SEÑAL INTERRUMPIDA — TON HA ASESINADO A ALEJANDRO ROMERO. EL TURNO HA COMENZADO.]',
        spokenText: 'Señal interrumpida. Ton ha asesinado a Alejandro Romero. El turno ha comenzado.',
      },
    ],
  },
};
