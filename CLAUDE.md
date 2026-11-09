# Word Cards

A small web app for learning English words with flashcards and spaced repetition.
Built step by step to try out Claude Projects.

## Stack

- Vite + TypeScript, plain DOM (no UI framework).
- Vitest + jsdom for tests.
- No backend: all data lives in the browser (`localStorage`).
- Package manager: pnpm only. Do not use npm or yarn.

## Commands

- `pnpm install` – install dependencies
- `pnpm dev` – run the dev server
- `pnpm test` – run tests once
- `pnpm build` – type-check and build

## Rules

- UI text in English; code, comments and commits in English.
- Keep logic (pure functions) separate from DOM code, and cover logic with tests next to it (`*.test.ts`).
- Reuse the `Word` model from `src/word.ts`; extend it instead of creating a parallel one.
- One feature per PR, small and focused. `pnpm test` and `pnpm build` must pass before opening a PR.
