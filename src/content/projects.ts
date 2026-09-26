import type { GalleryItem } from '../features/projects/components/FeaturedGallery'
import type { ShowcaseVideo } from '../features/projects/components/ProjectShowcase'
import gestorAcademicoIcon from '../assets/icons/Isotipo-GestorAcademico.png'
import showcaseWebm from '../assets/images/showcase/gestor-academico.webm'
import showcaseMp4 from '../assets/images/showcase/gestor-academico.mp4'
import showcasePoster from '../assets/images/showcase/gestor-academico-poster.webp'
import asistenciaWebm from '../assets/images/gallery/asistencia.webm'
import asistenciaMp4 from '../assets/images/gallery/asistencia.mp4'
import asistenciaPoster from '../assets/images/gallery/asistencia-poster.webp'
import calificacionesWebm from '../assets/images/gallery/calificaciones.webm'
import calificacionesMp4 from '../assets/images/gallery/calificaciones.mp4'
import calificacionesPoster from '../assets/images/gallery/calificaciones-poster.webp'
import horariosWebm from '../assets/images/gallery/horarios.webm'
import horariosMp4 from '../assets/images/gallery/horarios.mp4'
import horariosPoster from '../assets/images/gallery/horarios-poster.webp'
import metricasWebm from '../assets/images/gallery/metricas.webm'
import metricasMp4 from '../assets/images/gallery/metricas.mp4'
import metricasPoster from '../assets/images/gallery/metricas-poster.webp'
import legajosWebm from '../assets/images/gallery/legajos.webm'
import legajosMp4 from '../assets/images/gallery/legajos.mp4'
import legajosPoster from '../assets/images/gallery/legajos-poster.webp'
import ees3Login from '../assets/images/gestor-academico-ees3/login.jpg'
import ees3Home from '../assets/images/gestor-academico-ees3/home.jpg'
import ees3Asistencias from '../assets/images/gestor-academico-ees3/asistencias.jpg'
import ees3Notas from '../assets/images/gestor-academico-ees3/notas.jpg'
import narutoJava1 from '../assets/images/juego-naruto/JuegoNarutoJava.webp'
import narutoJava2 from '../assets/images/juego-naruto/JuegoNarutoJava2.webp'
import ledesmaPrints3dInicio from '../assets/images/ledesmaprints-3d/inicio.jpg'
import ledesmaPrints3dTienda from '../assets/images/ledesmaprints-3d/tienda.jpg'
import ledesmaPrints3dGaleria from '../assets/images/ledesmaprints-3d/galeria.jpg'

export interface ProjectArchitecturePoint {
  title: string
  description: string
}

/** Contenido extendido de la página `/projects/:slug`. Cada campo es opcional:
 *  la sección correspondiente solo se renderiza si el proyecto trae ese dato. */
export interface ProjectDetail {
  /** Rol cumplido en el proyecto, mostrado junto al hero. */
  role?: string
  /** Estado o período, ej. "En producción" / "Proyecto académico, 2023". */
  period?: string
  /** Problema o contexto que motivó el proyecto. Un string por párrafo. */
  problem?: string | readonly string[]
  /** Funcionalidades clave, en frases cortas. */
  features?: readonly string[]
  /** Resumen narrativo de la arquitectura y las decisiones técnicas. */
  architectureSummary?: string
  /** Puntos destacados de arquitectura, cada uno con su propio título. */
  architecturePoints?: readonly ProjectArchitecturePoint[]
  /** Desafíos técnicos relevantes y cómo se resolvieron. */
  challenges?: readonly string[]
  /** Mejoras o próximos pasos planeados. */
  improvements?: readonly string[]
  /** Muestra la demo jugable (Canvas + TS) del juego de Naruto en Java. */
  hasPlayableDemo?: boolean
}

export interface Project {
  slug: string
  name: string
  /** Isotipo mostrado junto al título de la card. */
  titleIcon?: string
  summary: string
  /** Descripción breve del problema que resuelve, mostrada en la card de proyecto destacado. */
  problemSummary?: string
  /** Dato de escala/adopción, mostrado como párrafo aparte en la card de proyecto destacado. */
  metric?: string
  tech: readonly string[]
  /** Extensión mostrada en la tab de la card (estilo editor). Por defecto 'tsx'. */
  codeExt?: string
  image?: string
  /** Varias fotos → la card rota entre ellas en vez de mostrar una sola. */
  images?: readonly string[]
  liveUrl?: string
  repoUrl?: string
  featured?: boolean
  /** Clip en loop del proyecto destacado, mostrado junto a su card (enlaza a `liveUrl`). */
  showcaseVideo?: ShowcaseVideo
  galleryItems?: readonly GalleryItem[]
  /** Contenido extendido para la página de detalle. Sin esto, el detalle muestra
   *  igual el hero, la galería, el stack y los links con los datos de arriba. */
  detail?: ProjectDetail
}

export const PROJECTS: Project[] = [
  {
    slug: 'gestor-academico',
    name: 'Gestor Académico',
    titleIcon: gestorAcademicoIcon,
    summary:
      'Plataforma SaaS multi-tenant de gestión académica para escuelas secundarias argentinas. ' +
      'Unifica asistencia, calificaciones, horarios y seguimiento socioeducativo en un solo ' +
      'sistema, reemplazando planillas sueltas y herramientas aisladas por área. El ' +
      'aislamiento entre instituciones se resuelve en la base de datos con Row-Level Security ' +
      'de PostgreSQL, y el acceso se controla con roles jerárquicos y permisos granulares.',
    problemSummary:
      'Incluye un asistente con IA (RAG) que responde consultas sobre el Estatuto Docente ' +
      'bonaerense, con búsqueda semántica sobre la normativa indexada por artículo.',
    metric: 'Actualmente en producción en una institución con más de 1.300 usuarios activos.',
    tech: [
      'React',
      'TypeScript',
      'Tailwind',
      'Node.js',
      'Express',
      'Zod',
      'JWT',
      'PostgreSQL',
      'pgvector',
      'Prisma',
      'Gemini API',
      'pdf-lib',
      'Docker',
      'Nginx',
      'Ubuntu 24.04 (VPS)',
    ],
    liveUrl: 'https://gestoracademico.com.ar/',
    showcaseVideo: {
      webm: showcaseWebm,
      mp4: showcaseMp4,
      poster: showcasePoster,
      // El login entra con un fundido a los 15.83 s; se cambia la URL a mitad del fundido.
      chapters: [
        { from: 0, url: 'https://gestoracademico.com.ar/' },
        { from: 16.13, url: 'https://essn3-glew.gestoracademico.com.ar/login' },
      ],
    },
    featured: true,
    detail: {
      role: 'Desarrollo full-stack en solitario — producto, arquitectura y código',
      period: 'En producción, en desarrollo continuo',
      problem: [
        'Las escuelas secundarias suelen manejar asistencia, calificaciones, horarios y ' +
          'seguimiento socioeducativo con planillas sueltas y sistemas separados por área. La ' +
          'información de un mismo alumno queda repartida en varios lugares, y armar un boletín ' +
          'o detectar a tiempo a un estudiante en riesgo implica cruzar datos a mano.',
        'Resolverlo para varias instituciones a la vez sumaba una exigencia más: cada escuela ' +
          'tenía que trabajar como si el sistema fuera solo suyo, con la garantía de que sus ' +
          'datos nunca pudieran quedar expuestos a otra.',
      ],
      features: [
        'Registro de asistencia diaria con métricas de inasistencias y detección temprana de riesgo académico.',
        'Carga y cálculo automático de calificaciones finales, con reglas de acreditación configurables por materia y período.',
        'Legajos de alumnos con seguimiento socioeducativo para el Equipo de Orientación Escolar (EOE) y preceptores.',
        'Armado de horarios institucionales sobre franjas horarias configurables por establecimiento.',
        'Mensajería interna y encuestas institucionales, con visibilidad acotada según el rol.',
        'Panel de administración (superAdmin/superRoot) para gestionar instituciones, usuarios y auditoría del sistema.',
      ],
      architectureSummary:
        'Arquitectura SaaS multi-tenant sobre un único stack de React, TypeScript, Node.js y ' +
        'PostgreSQL: todas las instituciones comparten esquema de base de datos, pero quedan ' +
        'completamente aisladas entre sí a nivel de fila mediante Row-Level Security.',
      architecturePoints: [
        {
          title: 'Aislamiento por conexión, no solo por código',
          description:
            'Cada consulta corre dentro de su propia transacción, que fija el tenant activo con ' +
            'SET LOCAL antes de tocar la base. Así, aunque una capa superior tenga un bug, la base ' +
            'de datos nunca devuelve filas de otra institución.',
        },
        {
          title: 'Permisos declarativos por módulo',
          description:
            'Los componentes de interfaz no leen el rol del usuario directamente: consumen ' +
            'capacidades resueltas de forma centralizada (hooks useCapabilities), lo que permite ' +
            'sumar roles nuevos sin duplicar lógica de autorización en cada pantalla.',
        },
        {
          title: 'Sesión sin fricción',
          description:
            'Autenticación con JWT de acceso de corta duración y refresh token rotativo, ' +
            'renovado de forma transparente por un cliente HTTP único, sin exponer tokens de ' +
            'larga vida ni interrumpir al usuario.',
        },
      ],
      challenges: [
        'Diseñar el aislamiento multi-tenant a nivel de base de datos en vez de confiar solo en filtros de la aplicación, para que un error de programación nunca exponga datos entre instituciones.',
        'Modelar un sistema de permisos que escale a múltiples roles (superAdmin, secretario, EOE, preceptor, docente, alumno) sin duplicar reglas de autorización en cada pantalla.',
        'Encontrar el equilibrio entre pooling de conexiones para escalar y el uso de contexto por transacción que exige el aislamiento por RLS.',
      ],
    },
    // "src" es el poster WebP del clip (primer frame visible antes de reproducir). Para agregar uno nuevo,
    // colocá el archivo en src/assets/images/gallery, importalo arriba y asignalo acá.
    galleryItems: [
      {
        id: '01',
        title: 'Asistencia',
        category: 'Seguimiento diario',
        alt: 'Registro de asistencia',
        src: asistenciaPoster,
        video: { webm: asistenciaWebm, mp4: asistenciaMp4 },
      },
      {
        id: '02',
        title: 'Calificaciones',
        category: 'Gestión académica',
        alt: 'Carga de calificaciones',
        src: calificacionesPoster,
        video: { webm: calificacionesWebm, mp4: calificacionesMp4 },
      },
      {
        id: '03',
        title: 'Horarios',
        category: 'Organización institucional',
        alt: 'Armado de horarios',
        src: horariosPoster,
        video: { webm: horariosWebm, mp4: horariosMp4 },
      },
      {
        id: '04',
        title: 'Legajos',
        category: 'Seguimiento EOE',
        alt: 'Legajos de alumnos',
        src: legajosPoster,
        video: { webm: legajosWebm, mp4: legajosMp4 },
      },
      {
        id: '05',
        title: 'Métricas',
        category: 'Indicadores institucionales',
        alt: 'Métricas de rendimiento académico',
        src: metricasPoster,
        video: { webm: metricasWebm, mp4: metricasMp4 },
      },
    ],
  },
  {
    slug: 'gestor-academico-ees3-glew',
    name: 'Gestor Académico V1 (EES Nº 3 Glew)',
    codeExt: 'js',
    summary:
      'Primera versión del proyecto, usada en producción por una escuela secundaria. ' +
      'Digitalizó asistencia, calificaciones, boletines y horarios con las reglas del sistema ' +
      'educativo bonaerense, y genera en PDF el parte diario y las planillas de notas. Fue la ' +
      'base para rediseñar la plataforma en su nueva versión de GestorAcademico.',
    tech: ['Node.js', 'Express', 'MongoDB', 'Mongoose', 'JavaScript', 'pdf-lib', 'jsPDF', 'Hosting compartido'],
    liveUrl: 'https://eesn3glew.com/',
    repoUrl: 'https://github.com/LedesmaFrancoAgustin/gestor-academico-back',
    images: [ees3Login, ees3Home, ees3Asistencias, ees3Notas],
    detail: {
      role: 'Desarrollo full-stack en solitario — relevamiento, diseño y código',
      period: 'En producción, uso diario en la institución',
      problem:
        'La institución llevaba asistencia, calificaciones, boletines y horarios en planillas y ' +
        'procesos manuales, sin un registro centralizado ni acceso remoto para docentes y ' +
        'preceptores. El objetivo era un sistema propio, funcionando en producción con dominio ' +
        'real, sin depender de plantillas ni herramientas de terceros.',
      features: [
        'Registro de asistencia diaria por curso y materia.',
        'Carga de calificaciones y generación de boletines a partir de esos datos.',
        'Armado de horarios por curso y por docente.',
        'Autenticación con JWT y control de acceso según el rol del usuario.',
        'Interfaz adaptada a dispositivos móviles, pensada para el uso diario de docentes y preceptores.',
      ],
      architectureSummary:
        'Aplicación con frontend en HTML, SCSS y JavaScript sobre Bootstrap, y backend en ' +
        'Node.js con Express persistiendo en MongoDB. Es la primera versión del producto: ' +
        'pensada, desarrollada y desplegada para una sola institución con dominio propio. Esa ' +
        'primera implementación fue la base conceptual sobre la que después construí la versión ' +
        'SaaS multi-tenant de Gestor Académico.',
      architecturePoints: [
        {
          title: 'Backend REST con Express',
          description:
            'La lógica de asistencia, calificaciones, boletines y horarios se expone como una ' +
            'API REST consumida por el frontend, separando presentación y datos.',
        },
        {
          title: 'Autenticación con JWT',
          description:
            'Sesiones basadas en tokens firmados, con verificación de rol en cada endpoint ' +
            'protegido del backend.',
        },
        {
          title: 'Modelo de datos en MongoDB',
          description:
            'Esquema flexible para las entidades del dominio escolar (alumnos, cursos, materias, ' +
            'calificaciones), pensado para iterar rápido durante el desarrollo inicial.',
        },
      ],
      challenges: [
        'Diseñar el cálculo de boletines y los estados de acreditación siguiendo las reglas propias de la institución, sin un sistema de referencia previo del que partir.',
        'Llevar un desarrollo propio hasta producción real, con dominio propio y uso diario por parte de docentes y preceptores.',
      ],
    },
  },
  {
    slug: 'ledesmaprints-3d',
    name: 'LedesmaPrints 3D',
    codeExt: 'html',
    summary:
      'Landing page para un servicio de impresión 3D bajo pedido, con catálogo y galería de ' +
      'piezas impresas. Diseño responsive enfocado en una navegación clara y en la ' +
      'presentación visual de cada trabajo.',
    tech: ['HTML', 'SCSS', 'JavaScript', 'Bootstrap'],
    liveUrl: 'https://ledesmafrancoagustin.github.io/LedesmaPrints3D/',
    repoUrl: 'https://github.com/LedesmaFrancoAgustin/LedesmaPrints3D',
    images: [ledesmaPrints3dInicio, ledesmaPrints3dTienda, ledesmaPrints3dGaleria],
    detail: {
      role: 'Desarrollo front-end en solitario — maquetado y diseño de la interfaz',
      period: 'Uno de mis primeros proyectos personales',
      problem:
        'Necesitaba un primer proyecto real para practicar HTML, CSS y Bootstrap más allá de ' +
        'ejercicios sueltos: maquetar una landing page completa, con varias secciones, de punta ' +
        'a punta y publicarla en producción.',
      features: [
        'Landing page de una sola página con secciones de inicio, catálogo de productos y galería.',
        'Catálogo de piezas y trabajos impresos en 3D presentado con el sistema de grid de Bootstrap.',
        'Diseño responsive, pensado para verse bien tanto en mobile como en escritorio.',
        'Navegación e interacciones básicas (menú, carruseles) resueltas con los componentes de Bootstrap.',
      ],
      architectureSummary:
        'Sitio estático de una sola página, sin backend: HTML semántico, CSS/SCSS propio y el ' +
        'sistema de grid y componentes de Bootstrap para la maquetación y el comportamiento ' +
        'responsive. Fue uno de mis primeros proyectos, enfocado en aprender a estructurar una ' +
        'interfaz completa con HTML y CSS antes de sumar frameworks de JavaScript.',
      challenges: [
        'Lograr un diseño responsive consistente en todas las secciones usando solo CSS y el grid de Bootstrap, sin ningún framework de JavaScript de por medio.',
        'Organizar el HTML y las hojas de estilo de un sitio con varias secciones distintas de forma prolija, sin una arquitectura de componentes.',
      ],
    },
  },
  {
    slug: 'juego-naruto-java',
    name: 'Juego de Naruto – Java',
    codeExt: 'java',
    summary:
      'Juego 2D en Java desarrollado como proyecto académico para Programación en la ' +
      'Universidad Nacional de General Sarmiento. El trabajo se centró en la lógica del juego ' +
      'y el modelado orientado a objetos: clases, estados e interacción entre entidades.',
    problemSummary:
      'Le tengo un cariño especial porque fue uno de mis primeros proyectos, y el que me hizo ' +
      'ver que programar era lo que quería hacer.',
    tech: ['Java', 'Programación orientada a objetos'],
    repoUrl: 'https://github.com/LedesmaFrancoAgustin/JuegoNaruto-Java/tree/main',
    images: [narutoJava1, narutoJava2],
    detail: {
      hasPlayableDemo: true,
      role: 'Desarrollo individual — trabajo práctico universitario',
      period: 'El primer programa que escribí en la universidad, le tengo especial cariño',
      problem:
        'Era el primer trabajo práctico de programación de la carrera: un juego de aventuras 2D ' +
        'en Java pensado para aprender en la práctica los pilares de la programación orientada a ' +
        'objetos —clases, instancias, herencia e interacción entre objetos— en vez de solo verlos ' +
        'en la teoría.',
      features: [
        'Personaje jugable con movimiento y animaciones básicas en un mundo 2D.',
        'Clases propias para el jugador, los enemigos y los objetos del escenario, cada una con su propio comportamiento.',
        'Interacción entre los objetos del juego (colisiones, eventos) resuelta a través de mensajes entre instancias.',
      ],
      architectureSummary:
        'Aplicación de escritorio en Java puro, sin frameworks ni motor de juego externo: el ' +
        'bucle del juego, el renderizado y la lógica de cada entidad están escritos a mano, ' +
        'modelando cada elemento del juego (jugador, enemigos, escenario) como una clase propia.',
      challenges: [
        'Entender en la práctica, por primera vez, para qué sirve modelar un problema con clases y objetos en vez de escribir todo como código suelto.',
        'Programar un bucle de juego y el renderizado 2D desde cero, sin un motor de juego que resolviera esa parte.',
      ],
    },
  },
]
