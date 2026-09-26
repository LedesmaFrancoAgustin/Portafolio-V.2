# Portafolio — Franco Ledesma

Portafolio personal desarrollado con React, TypeScript y Vite. Cuenta con una escena 3D interactiva de fondo (Three.js), showcase de proyectos con video/demo, un mini-juego jugable y formulario de contacto vía EmailJS.

## Stack

- React 18 + TypeScript
- Vite
- Three.js
- React Hook Form + Zod
- EmailJS
- React Router

## Requisitos

- Node.js 18+

## Instalación

```bash
npm install
```

## Variables de entorno

Copiá `.env.example` a `.env.local` y completá las credenciales de [EmailJS](https://www.emailjs.com/) usadas por el formulario de contacto:

```
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # build de producción
npm run preview   # sirve el build localmente
npm run lint      # lint del proyecto
```

## Estructura

```
src/
  app/        # entry point, router, providers y layouts
  pages/      # composición de cada ruta
  features/   # secciones funcionales (hero, about, projects, contact, skills...)
  scene/      # escena 3D compartida y persistente
  shared/     # UI, hooks y utilidades genéricas
  content/    # datos editables (proyectos, tecnologías, contacto)
  assets/     # recursos estáticos
```
