import { PortfolioItem, Review, Inquiry } from './types';

export const initialPortfolioItems: PortfolioItem[] = [
  {
    id: 'p1',
    titleEn: 'Astral Botanical',
    titleEs: 'Botánico Astral',
    style: 'fineline',
    imageUrl: 'https://images.unsplash.com/photo-1542382156909-9ae3b0245754?auto=format&fit=crop&q=80&w=600',
    size: '12 cm x 4 cm',
    duration: '1.5 hrs',
    recoveryDays: 10,
    placementEn: 'Collarbone / Upper Chest',
    placementEs: 'Clavícula / Pecho Superior',
    storyEn: 'A delicate single-needle composition representing wild lavender and celestial stars. Crafted with ultra-fine lines for a weightless, elegant flow that aligns with the client\'s natural collarbone curve.',
    storyEs: 'Una delicada composición de aguja única que representa lavanda silvestre y estrellas celestiales. Creado con líneas ultra finas para un flujo ingrávido y elegante que se alinea con la curva natural de la clavícula.',
    artistNotesEn: 'Requires extremely light pressure and a specialized 3RL needle configuration. Highly recommend keeping it protected from sun exposure during the first 14 days to preserve the subtle shading.',
    artistNotesEs: 'Requiere una presión extremadamente ligera y una configuración de aguja 3RL especializada. Recomiendo encarecidamente protegerlo de la exposición solar durante los primeros 14 días para preservar el sombreado sutil.'
  },
  {
    id: 'p2',
    titleEn: 'The Chrono Lens',
    titleEs: 'El Lente del Tiempo',
    style: 'microrealism',
    imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=600',
    size: '7 cm x 7 cm',
    duration: '3.5 hrs',
    recoveryDays: 12,
    placementEn: 'Inner Forearm',
    placementEs: 'Antebrazo Interno',
    storyEn: 'An intricate, high-contrast microrealistic study of a vintage clockwork mechanism. Despite its small size, it captures reflecting metallic surfaces and tiny gear teeth using delicate dotwork shading.',
    storyEs: 'Un intrincado estudio microrrealista de alto contraste de un mecanismo de relojería antiguo. A pesar de su tamaño reducido, captura superficies metálicas reflectantes y diminutos dientes de engranaje usando sombreado de puntillismo delicado.',
    artistNotesEn: 'This piece uses a custom dilution matrix of black ink to achieve smooth steel reflections. Proper application of second-skin bandage accelerates the recovery of these dense gradients.',
    artistNotesEs: 'Esta pieza utiliza una matriz de dilución personalizada de tinta negra para lograr reflejos de acero suaves. La aplicación adecuada de la venda de segunda piel acelera la recuperación de estos gradientes densos.'
  },
  {
    id: 'p3',
    titleEn: 'Manga Awakening',
    titleEs: 'Despertar Manga',
    style: 'anime',
    imageUrl: '/imagenes/670269533_18413738419193052_847837387206417634_n.webp',
    size: '15 cm x 8 cm',
    duration: '4.5 hrs',
    recoveryDays: 14,
    placementEn: 'Outer Calf',
    placementEs: 'Pantorrilla Externa',
    storyEn: 'A high-contrast manga panel adaptation featuring intense gaze and energy lines. Utilizes thick outer borders paired with incredibly fine, hand-hatched interior shading to preserve the original comic book printing feel.',
    storyEs: 'Una adaptación de panel de manga de alto contraste con una mirada intensa y líneas de energía. Utiliza bordes exteriores gruesos combinados con sombreado interior tramado a mano muy fino para conservar el aspecto de impresión de cómic original.',
    artistNotesEn: 'Strict adherence to original source-material line weights is vital here. Using high-saturation dynamic black for the solid panels ensures it stays intensely dark and contrasty for years.',
    artistNotesEs: 'La adherencia estricta a los grosores de línea del material original es vital aquí. El uso de negro dinámico de alta saturación para los paneles sólidos garantiza que permanezca intensamente oscuro y contrastado durante años.'
  },
  {
    id: 'p4',
    titleEn: 'Delicate Peony Vine',
    titleEs: 'Enredadera de Peonías',
    style: 'fineline',
    imageUrl: 'https://images.unsplash.com/photo-1512238701577-f182d9ef8afb?auto=format&fit=crop&q=80&w=600',
    size: '16 cm x 6 cm',
    duration: '2.5 hrs',
    recoveryDays: 10,
    placementEn: 'Side Ribs',
    placementEs: 'Costillas Laterales',
    storyEn: 'An organic peony vine that wraps around the ribs. Drawn on the skin prior to tattooing to match the breathing lines perfectly, executed in a soft grey scale that looks airy and feminine.',
    storyEs: 'Una enredadera orgánica de peonías que se envuelve alrededor de las costillas. Dibujada sobre la piel antes de tatuar para coincidir perfectamente con las líneas de respiración, ejecutada en una escala de grises suave que luce ligera y femenina.',
    artistNotesEn: 'Rib tattoos require client breathing synchronization. Done completely freehand to guarantee the flower pedals expand and contract organically with normal posture.',
    artistNotesEs: 'Los tatuajes en las costillas requieren sincronización con la respiración del cliente. Realizado completamente a mano alzada para garantizar que los pétalos se expandan y contraigan de forma orgánica con la postura normal.'
  },
  {
    id: 'p5',
    titleEn: 'Stellar Voyager',
    titleEs: 'Viajero Estelar',
    style: 'microrealism',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=600',
    size: '8 cm x 8 cm',
    duration: '4.0 hrs',
    recoveryDays: 12,
    placementEn: 'Tricep / Upper Arm',
    placementEs: 'Tríceps / Brazo Superior',
    storyEn: 'A deep space scene featuring an astronaut staring into a stellar nebula. Completed with specialized micro-needles to pack smooth black gradients and hyper-realistic stars in a space smaller than a credit card.',
    storyEs: 'Una escena del espacio profundo con un astronauta contemplando una nébula estelar. Completado con microagujas especializadas para aplicar gradientes negros suaves y estrellas hiperrealistas en un espacio más pequeño que una tarjeta de crédito.',
    artistNotesEn: 'Hyper-detailed microrealism demands intense focus. White highlights are packed deeply into the stars at the very end of the session to guarantee a luminous galaxy depth.',
    artistNotesEs: 'El microrrealismo hiperdetallado exige un enfoque intenso. Los reflejos blancos se introducen profundamente en las estrellas al final de la sesión para garantizar una profundidad de galaxia luminosa.'
  },
  {
    id: 'p6',
    titleEn: 'Neon Ninja Panel',
    titleEs: 'Panel Ninja Neón',
    style: 'anime',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600',
    size: '18 cm x 10 cm',
    duration: '5.5 hrs',
    recoveryDays: 14,
    placementEn: 'Upper Thigh',
    placementEs: 'Muslo Superior',
    storyEn: 'A powerful anime battle frame incorporating geometric background layouts and selective bright accents. Features incredibly crisp outlines and screen-tone dot shading patterns.',
    storyEs: 'Un poderoso marco de batalla de anime que incorpora diseños de fondo geométricos y acentos brillantes selectivos. Presenta contornos increíblemente nítidos y patrones de sombreado por puntos de tono de pantalla.',
    artistNotesEn: 'Geometric lines require perfect skin tension. The contrast between solid black fill-ins and micro-hatching yields a beautiful manga engraving aesthetic.',
    artistNotesEs: 'Las líneas geométricas requieren una tensión perfecta de la piel. El contraste entre los rellenos negros sólidos y el microtramado produce una hermosa estética de grabado de manga.'
  }
];

export const initialReviews: Review[] = [
  {
    id: 'r1',
    name: 'Sofia Martinez',
    rating: 5,
    commentEn: 'Hans is an absolute master of fine lines. My botanical piece is so delicate, and people literally stop me on the street to ask about it. The studio was clean and very comfortable!',
    commentEs: 'Hans es un maestro absoluto de las líneas finas. Mi pieza botánica es sumamente delicada y la gente literalmente me detiene en la calle para preguntar por ella. ¡El estudio estaba limpio y muy cómodo!',
    tattooTypeEn: 'Fine Line Lavender',
    tattooTypeEs: 'Lavanda de Línea Fina',
    date: '2026-05-12'
  },
  {
    id: 'r2',
    name: 'Liam Vance',
    rating: 5,
    commentEn: 'Mind-blowing detail! I got a 6cm microrealism compass and it looks identical to a photograph. His hand is incredibly steady, and he explained the aftercare so thoroughly.',
    commentEs: '¡Un detalle alucinante! Me hice una brújula de microrrealismo de 6 cm y parece idéntica a una fotografía. Su mano es increíblemente firme y me explicó el cuidado posterior a fondo.',
    tattooTypeEn: 'Microrealism Compass',
    tattooTypeEs: 'Brújula de Microrrealismo',
    date: '2026-06-02'
  },
  {
    id: 'r3',
    name: 'Hiroshi Sato',
    rating: 5,
    commentEn: 'If you want an anime tattoo, go to Hans. He captures the essence of the characters perfectly. The line weight and manga-style hatching is flawless. Highly recommended!',
    commentEs: 'Si quieres un tatuaje de anime, ve con Hans. Captura la esencia de los personajes a la perfección. El grosor de las líneas y el tramado estilo manga es impecable. ¡Muy recomendado!',
    tattooTypeEn: 'Anime Eyes Panel',
    tattooTypeEs: 'Panel de Ojos Anime',
    date: '2026-06-25'
  }
];

export const initialDemoLeads: Inquiry[] = [
  {
    id: 'lead-1',
    fullName: 'Clara Ross',
    email: 'clara.ross@example.com',
    phone: '+34600123456',
    instagram: '@claratattooed',
    style: 'fineline',
    placement: 'Clavicle',
    placementPhoto: 'https://images.unsplash.com/photo-1598104358204-87cefc7c5986?auto=format&fit=crop&q=80&w=300',
    sizeCm: 10,
    description: 'A single-needle branch of olive leaves wrapping around my left collarbone. I prefer it to look very airy and minimal, with delicate details.',
    referenceImage: 'https://images.unsplash.com/photo-1542382156909-9ae3b0245754?auto=format&fit=crop&q=80&w=300',
    referenceImages: ['https://images.unsplash.com/photo-1542382156909-9ae3b0245754?auto=format&fit=crop&q=80&w=300'],
    status: 'pending',
    createdAt: '2026-06-29T10:30:00Z',
    artistNotes: 'Prefers ultra-thin line weight. Need to draw outline live on her collarbone to match flow.'
  },
  {
    id: 'lead-2',
    fullName: 'Marc Evans',
    email: 'marc.evans@example.com',
    phone: '+34611223344',
    instagram: '@marcevans_art',
    style: 'microrealism',
    placement: 'Outer Shoulder',
    placementPhoto: 'https://images.unsplash.com/photo-1512238701577-f182d9ef8afb?auto=format&fit=crop&q=80&w=300',
    sizeCm: 8,
    description: 'A miniature portrait of my dog, a golden retriever. I have three high-quality close-up photos. Needs to be black and grey microrealism.',
    referenceImage: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=300',
    referenceImages: ['https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=300'],
    status: 'booked',
    createdAt: '2026-06-28T14:15:00Z',
    artistNotes: 'Session scheduled for July 12th. Dog name is Buster. Already received reference photos via DM.'
  },
  {
    id: 'lead-3',
    fullName: 'Yuki Tanaka',
    email: 'yuki.t@example.com',
    phone: '+34622334455',
    instagram: '@yuki_otaku',
    style: 'anime',
    placement: 'Forearm',
    placementPhoto: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=300',
    sizeCm: 14,
    description: 'An iconic scene from Spirited Away, showing Chihiro and Haku in his dragon form. Pure black and grey manga lines with some dot shading.',
    referenceImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300',
    referenceImages: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=300'],
    status: 'contacted',
    createdAt: '2026-06-27T09:00:00Z',
    artistNotes: 'Sent email with general estimate ($450-$500). Waiting for her response to book dates.'
  }
];
