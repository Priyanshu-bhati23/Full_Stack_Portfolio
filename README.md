# Portfolio

A personal portfolio site with a 3D hero. Each object in the hero stands for one project: select it to jump to that project.

## Make it yours

Everything personal is in **`data/profile.ts`**: your name, links, about text, skills, experience, education, and each project's live and source links. Values marked `TODO` are placeholders. Empty strings and empty lists hide the part of the page that uses them, so nothing half-filled is shown.

To add your resume, save it as `public/resume.pdf` and set `resume: "/resume.pdf"` in `data/profile.ts`. A Resume button then appears in the navigation.

To replace a project screenshot, overwrite the image in `public/shots/` (2400 by 1500 pixels works best).

## How it is built

| Part | Where |
| --- | --- |
| Page content and sections | `app/page.tsx` |
| 3D hero (orbit model, honeycomb, shader orb) | `components/HeroScene.tsx` |
| Styles, including the stacking project panels | `app/globals.css` |

Stack: Next.js (App Router), TypeScript, React Three Fiber, three.js, GLSL. The site is static: it needs no environment variables.

## Run it locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

Import the repository in Vercel and deploy. No settings are needed.
