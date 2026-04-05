# AGENTS.md

## Project Scope

This repository is a small browser game built with plain HTML5 Canvas and vanilla JavaScript.
There is no bundler, no framework, and no module system.
All game state is shared through globals loaded by script tags in `index.html`.

## File Roles

- `index.html`: bootstraps the canvas and loads scripts in order.
- `js/input.js`: keyboard state only.
- `js/world.js`: world generation, terrain, checkpoints, level progression, and world rendering.
- `js/player.js`: player physics, landing, jump/fall sounds, checkpoint activation, and respawn.
- `js/main.js`: game loop and HUD.
- `sources/`: sound assets.

## Working Rules

- Preserve the current script load order in `index.html`.
- Keep the project dependency-free unless explicitly asked otherwise.
- Prefer small focused changes over rewrites.
- Do not introduce modules, classes, build tooling, or TypeScript unless explicitly requested.
- Keep code readable and consistent with the current plain-JavaScript style.

## Shared State Expectations

- `worldOffset` is the camera/world scroll source of truth.
- `terrain` is the source of truth for collision surfaces and rendered platforms/ground.
- `checkpoints` stores checkpoint state in world coordinates.
- `currentLevel` and `nextCheckpointLevel` control difficulty progression.
- `player.js` is expected to consume world state defined in `world.js`.

## Generation Constraints

- New terrain must remain reachable with the current jump physics:
  - horizontal reach is derived from `speed`, `jump`, and `gravity`
  - generated gaps should stay below a safe gameplay margin, not only the theoretical maximum
- Higher levels should make the game harder by:
  - shortening safe ground sections
  - shortening platforms
  - increasing jump spacing
  - increasing the frequency of platform chains
- Do not generate geometry that requires perfect frame timing.
- If changing level scaling, update `getLevelConfig(level)` instead of scattering difficulty constants.

## Checkpoint Rules

- A newly activated checkpoint advances progression.
- Respawn must restore both the checkpoint position and the level stored on that checkpoint.
- Checkpoints should be placed on safe surfaces after a completed challenge section, not in the middle of a required jump chain.
- Keep checkpoint coordinates in world space so rendering and respawn stay aligned.

## Collision Rules

- The player should only land on visible terrain.
- When changing terrain generation, keep landing logic compatible with multiple platforms at different heights.
- Avoid introducing separate collision geometry that does not match what is drawn.

## Audio Rules

- Existing sounds are loaded from `sources/` using `Audio`.
- If adding new sounds, preload them the same way and fail safely with `.catch(() => {})`.
- Do not block gameplay on autoplay restrictions.

## Validation Checklist

After changing gameplay code, verify at minimum:

1. No editor errors in modified files.
2. The player spawns correctly and does not die immediately.
3. The player lands only on visible ground/platforms.
4. Checkpoints activate, play their sound, and respawn correctly.
5. The current level shown in the HUD matches progression.
6. Newly generated sections remain beatable after any difficulty changes.

## Preferred Change Strategy

- For gameplay balance changes, modify generation/config helpers first.
- For physics issues, fix the shared source of truth before adding exceptions.
- For rendering mismatches, make render and collision read the same world data.
- If adding a new mechanic, keep it integrated with existing globals unless a larger refactor is explicitly requested.