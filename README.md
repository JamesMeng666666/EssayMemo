# EssayMemo · 范文记忆

React + Vite frontend deployed to EdgeOne Pages. The `/functions/api/gemini.js`
Pages Function handles Gemini requests so the API key is never bundled into
browser JavaScript.

## EdgeOne deployment

1. Import this GitHub repository into an EdgeOne Pages project. Build command:
   `npm run build`; output directory: `dist`.
2. In the EdgeOne Pages project environment settings, add `GEMINI_API_KEY` as
   a server-side secret. Do not use a `VITE_` prefix.
3. Deploy the project. The `functions/api/gemini.js` file provides
   `/api/gemini` automatically.

The built-in essays, fill-in-the-blank practice, and browser speech fallback
work without Gemini. Adding essays and generating high-quality audio require
the server-side secret and a working Pages Function.

## Local development

Install dependencies with `npm install`. `npm run dev` starts the frontend
only. For the full app, use EdgeOne CLI's `edgeone pages dev` with a linked
Pages project and its environment variables.

AI Studio source: https://ai.studio/apps/9ff87452-3d77-45c1-8130-6088aea85b1f
