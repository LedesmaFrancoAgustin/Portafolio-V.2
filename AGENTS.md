# Portfolio Ledesma — Guía de proyecto

## Propósito

Portfolio personal construido con React, TypeScript y Vite. La experiencia se apoya en un fondo 3D persistente: un cielo vivo que evoluciona de atardecer a noche mientras el usuario recorre el sitio.

## Principios de implementación

- La legibilidad, accesibilidad y navegación tienen prioridad sobre los efectos visuales.
- El fondo 3D es decorativo: no debe capturar foco ni impedir la interacción con el contenido.
- La interfaz soporta tema claro y oscuro, con preferencia del sistema como valor inicial y elección persistente del usuario.
- Una animación debe tener una única fuente de verdad. GSAP controla secuencias, scroll y transiciones; Three.js/React Three Fiber controla la escena 3D.
- Respetar `prefers-reduced-motion` y proporcionar una alternativa estática si WebGL no está disponible.
- Cargar modelos, texturas, vídeos y galerías bajo demanda. No añadir dependencias sin una necesidad concreta.

## Stack aprobado y criterio de uso

| Herramienta | Uso autorizado |
| --- | --- |
| React Router | Rutas `/`, `/projects/:slug`, layouts anidados y página 404. |
| Three.js + `@react-three/fiber` + `@react-three/drei` | Canvas, cielo 3D, nubes, iluminación, modelos y utilidades 3D. No crear un render loop manual fuera de React Three Fiber. |
| GSAP + ScrollTrigger + `@gsap/react` | Narrativa visual, animaciones ligadas al scroll, transiciones de interfaz y sincronización con el estado de la escena. Usar `useGSAP` en componentes React. |
| Lenis | Scroll suave. Se sincroniza con el ticker de GSAP; no combinar con otro sistema de smooth scrolling. |
| Zustand | Estado global mínimo: menú, audio, preferencias de movimiento y estado atmosférico de la escena. No usarlo como reemplazo del estado local de React. |
| React Hook Form + Zod | Estado, validación y mensajes del formulario de contacto. |
| Lucide React | Iconografía de interfaz. No incorporar una segunda biblioteca de iconos sin justificación. |
| `clsx` | Composición de clases CSS condicionales. |
| Tailwind CSS | Sistema de estilos principal: layout, responsive, espaciado, tipografía, colores, estados y variantes de componentes. |
| `vite-plugin-compression` | Compresión de recursos en la compilación de producción. |

### Dependencia opcional: Anime.js

Anime.js no se instala en la base inicial. Solo se evalúa para una microanimación concreta que GSAP no resuelva de forma clara o liviana. No debe usarse para scroll, transiciones de ruta ni para animar la escena 3D, que son responsabilidad de GSAP y React Three Fiber.

### Estilos

- Tailwind CSS es la opción predeterminada para estilos de componentes y composición responsive.
- Configurar los tokens de diseño (colores, tipografías, espaciado, sombras y breakpoints) como tema de Tailwind; no repetir valores arbitrarios en componentes.
- Usar CSS puro solo cuando sea más expresivo o mantenible: estilos globales y reset, keyframes complejos, pseudo-elementos elaborados, máscaras, estilos del canvas/capas de escena y casos que necesiten selectores que Tailwind no describa con claridad.
- El CSS adicional vive en `styles/`; no crear hojas de estilo por componente para estilos que pueden expresarse de forma clara con utilidades de Tailwind.
- Configurar el modo oscuro de Tailwind mediante la clase `dark` en el elemento raíz. `ThemeProvider` aplica, persiste y restaura el tema; los componentes usan variantes `dark:` y tokens semánticos, nunca colores de tema hardcodeados.
- El cambio de tema debe tener un control accesible, respetar `prefers-color-scheme` al primer acceso y evitar parpadeos durante la carga.

## Arquitectura

- `app/`: punto de entrada, router, providers y layouts.
- `pages/`: composición de cada ruta. No contiene lógica visual reutilizable.
- `features/`: secciones funcionales del portfolio; cada feature es dueña de sus componentes, hooks, animaciones y tipos internos.
- `scene/`: infraestructura 3D compartida y persistente. No debe conocer el contenido de una sección concreta.
- `shared/`: UI, hooks, utilidades y tipos verdaderamente genéricos.
- `content/`: datos editables del portfolio (proyectos, tecnologías, experiencia y enlaces).
- `assets/`: recursos estáticos importados desde la aplicación.

## Contrato de la escena persistente

- `MainLayout` monta una única vez `SceneCanvas` como fondo fijo del sitio.
- El contenido de las rutas se renderiza por encima del canvas mediante capas CSS; no se crean canvas independientes por sección.
- `scene/components/Experience.tsx` compone cielo, nubes, iluminación y postprocesado.
- La primera versión usa una composición 2.5D: fondo, sol y nubes PNG se renderizan como planos a distintas profundidades con React Three Fiber. Conserva el estilo ilustrado, permite parallax y evita el coste innecesario de un cielo volumétrico.
- Las capas de nubes se agrupan por profundidad (lejanas, medias y cercanas). Cada grupo tiene escala, velocidad horizontal, opacidad y respuesta al puntero propias; esta configuración vive dentro de `scene/`, no en los componentes de las secciones.
- Los recursos de la escena se importan desde `src/assets/images/scene/`: `sky/`, `clouds/` y `sun/`. Las composiciones de referencia no se cargan en producción.
- La escena expone un estado semántico y acotado, por ejemplo `dawn | sunset | twilight | night`; las secciones pueden solicitar una transición de estado, pero no modificar shaders ni el render loop directamente.
- El tema se comunica a la escena como `light | dark`. Cada combinación de tema y estado atmosférico ajusta colores, exposición y densidad visual sin crear una escena alternativa.
- El cambio entre estados debe ser gradual, reversible y seguro ante navegación rápida.
- En dispositivos de capacidad reducida se disminuyen partículas, resolución de sombras, postprocesado y frecuencia de render; si corresponde, se usa un fondo CSS estático.

## Rutas iniciales

- `/`: secciones Hero, Acerca de mí, Tecnologías, Proyectos, Contacto y Footer.
- `/projects/:slug`: detalle de un proyecto con bloques opcionales según sus datos.
- `*`: página 404.

## Datos y detalle de proyectos

- Cada proyecto se identifica por un `slug` único en `content/projects.ts`.
- `ProjectDetailPage` reutiliza una única composición; las secciones de problema, vídeo, galería, arquitectura o mejoras se renderizan solo si el proyecto tiene esos datos.
- Los componentes no deben contener textos, URLs ni datos de proyectos hardcodeados.

## Convenciones de código

- TypeScript estricto; evitar `any`.
- Componentes en `PascalCase`, hooks con prefijo `use`, archivos CSS en `kebab-case` o CSS global por tokens.
- Registrar plugins de GSAP una sola vez en `shared/lib/gsap.ts`.
- Toda animación GSAP creada en React debe limpiarse al desmontar el componente.
- No usar selectores globales para animar elementos de una feature.
- Antes de dar una tarea por terminada ejecutar `npm run lint` y `npm run build` cuando el cambio lo permita.

## Recursos, rendimiento y fallback

- Preferir modelos `.glb` y optimizarlos antes de incorporarlos. Evitar texturas, geometrías y vídeos pesados si no aportan valor visible.
- Los recursos de un proyecto se cargan al visitar su detalle; el fondo base debe estar listo sin esperar las galerías ni medios de proyectos.
- Respetar `prefers-reduced-motion`: reducir o detener movimientos no esenciales y evitar transiciones de scroll forzadas.
- Si WebGL, vídeo o audio no están disponibles, el contenido y la navegación deben continuar funcionando con alternativas estáticas.
- Probar cada cambio visual en viewport móvil y escritorio. El canvas no debe introducir scroll horizontal, bloquear gestos táctiles ni degradar la lectura.

## Accesibilidad

- Usar HTML semántico: un único `h1` por página, jerarquía de encabezados coherente, `main`, `nav`, `section` y `footer` cuando correspondan.
- Todo control interactivo debe ser accesible con teclado, tener foco visible y nombre accesible.
- Las imágenes informativas llevan texto alternativo; las decorativas usan `alt=""`. El canvas de fondo se marca como decorativo.
- El contraste y la legibilidad se verifican en ambos temas antes de considerar una sección terminada.

## Criterio de terminado

Un cambio se considera terminado cuando respeta esta guía, no rompe las rutas existentes, se ve correctamente en tema claro y oscuro, responde en móvil y escritorio, contempla reducción de movimiento, y pasa `npm run lint` y `npm run build`.

## Etapas de trabajo

1. Base: estructura de carpetas, rutas, tokens CSS y layouts vacíos.
2. Fundación visual: `SceneCanvas`, cielo CSS/3D mínimo, capas y fallback sin WebGL.
3. Navegación y secciones base con contenido temporal semántico y responsive.
4. Movimiento: scroll, transiciones y estados del cielo conectados a la lectura.
5. Proyectos: datos tipados, cards y ruta de detalle.
6. Optimización final: carga diferida, pruebas en móvil, accesibilidad y métricas.
