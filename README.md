# Portfolio

A personal portfolio site with an interactive 3D hero: an animated character that follows the pointer, blinks and waves, with three floating objects around it, one per project. Select an object to jump to that project.

## Make it yours

Everything personal is in **`data/profile.ts`**: name, links, about text, skills, leadership, education, earlier projects, and each project's live and source links. Empty strings and empty lists hide the part of the page that uses them.

- **Live links**: paste each app's Vercel address into its `live` field and an "Open the live app" button appears.
- **Character**: the animated character in the hero is built from shapes in `components/HeroScene.tsx` (colours at the top of the `Character` section), so there is no model file to replace.
- **Resume**: the Resume button downloads `public/resume.pdf`. Its source is `resume/resume.html`. To rebuild the PDF after an edit, run `node resume/build.mjs public/resume.pdf "<path to Chrome>"` (needs `npm i -D puppeteer-core` once).
- **Screenshots**: overwrite the images in `public/shots/` (2400 by 1500 pixels works best).

## How it is built

| Part | Where |
| --- | --- |
| Page content and sections | `app/page.tsx` |
| 3D hero (animated character, orbit model, honeycomb, shader orb) | `components/HeroScene.tsx` |
| Pointer tilt on the project screenshots | `components/Tilt.tsx` |
| Styles, including the stacking project panels | `app/globals.css` |

Stack: Next.js (App Router), TypeScript, React Three Fiber, three.js, GLSL. The site is static: it needs no environment variables.

## Run it locally

```bash
npm install
npm run dev
```

## Deploy to Vercel

Import the repository in Vercel and deploy. No settings are needed.
