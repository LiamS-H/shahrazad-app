# Shahrazad

A table top simulator named after the card and character [Shahrazad](https://en.wikipedia.org/wiki/Scheherazade), from _"One Thousand and One Nights."_

## Goals

- Be FAST!
- Be extremely fast to create and join games (auth should not be necessary)
- Be memory efficient on backend and frontend
- Be opinionated in UX design, design to play one game and one game well.

## Stack

frontend: Next.js + Rust wasm

backend: Rust

### State

The state machine to handle the game logic is written in a shared rust lib.
It is compiled natively on the server and runs as a wasm pkg on client.
In this way server updates and optimistic client updates are running the same code.

State transformations are handled in wasm and rendered in react on the frontend.
State is updated within a game lobby using websockets.
For non-colliding moves, the server only sends the action over the socket not the full game state.
This keeps socket packets small, though a global state is always managed on the server and is retrieved when reconnecting or resolving race conditions.

### Rendering

Everything is HTML, not a canvas.
Card data is rendered and cached using [react-scrycards](https://github.com/LiamS-H/react-scrycards), which fetches the data from the [Scryfall api](https://scryfall.com/docs/api).
Card data is not stored on the server or in the game state. Instead only card identifiers are stored in the state which are then used to retrieve cards on client.

### DND

Drag and drop is powered by [dnd-kit](https://dndkit.com/).

### UI

Base UI components come from [shadcn](https://ui.shadcn.com/).

# Contributing

- Use Dockerfile.dev for dev environment
- Make a branch with your feature and create a PR to dev
