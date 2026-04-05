# AGENTS.md

## Project Scope

This repository is a small browser game built with plain HTML5 Canvas and vanilla JavaScript.
There is no bundler, no framework, and no module system.
All game state is shared through globals loaded by script tags in `index.html`.

## File Roles

- `index.html`: bootstraps the canvas and loads scripts in order.
- `js/input.js`: keyboard state, one-shot key presses, and typed cheat-code detection.
- `js/world.js`: world generation, terrain, checkpoints, level progression, cheat-mode movement, respawn resets, and world rendering.
- `js/coins.js`: coin state, enemy-drop coin spawning, collection, respawn resets, and drawing.
- `js/enemies.js`: enemy spawning, patrol movement, defeat/reset logic, and drawing.
- `js/powerups.js`: mushroom spawning, collection, respawn resets, and drawing.
- `js/player.js`: player physics, growth state, jump/fall sounds, enemy interactions, checkpoint activation, and respawn.
- `js/main.js`: game loop, HUD, and update/draw coordination for coins, enemies, and power-ups.
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
- `coins`, `enemies`, and `mushrooms` should also stay in world coordinates.
- `currentLevel` and `nextCheckpointLevel` control difficulty progression.
- `player.js` is expected to consume world state defined in `world.js`.
- Cheat-mode state stays global and must not break normal movement or map mode.

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
- Respawn should restore dynamic entities from checkpoint state instead of rebuilding the terrain layout.
- Checkpoints should be placed on safe surfaces after a completed challenge section, not in the middle of a required jump chain.
- Keep checkpoint coordinates in world space so rendering and respawn stay aligned.

## Entity Rules

- Add coins, enemies, and power-ups in their own files, not directly inside `player.js`.
- Generate entities from section data emitted by `world.js`, so terrain and content stay aligned.
- Keep coins/enemies/power-ups separate from `terrain`; they are interactive objects, not collision surfaces.
- If an entity needs to come back after death, store enough spawn state to reset it cleanly.
- Prefer adding simple arrays plus `spawn/update/draw` functions before introducing abstractions.

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
7. Coins, enemies, and mushrooms appear aligned with the generated section that spawned them.
8. After death, enemies, mushrooms, and coins reset correctly from the latest checkpoint state.
9. Cheat mode still doubles movement speed, allows flight, and defeats enemies on contact without breaking normal gameplay.

## Current Status

- `js/coins.js`, `js/enemies.js`, and `js/powerups.js` contain active gameplay logic.
- `world.js` already emits per-section data via `registerSectionContent(section)`.
- `main.js` already calls `update/draw` hooks for coins, enemies, and power-ups.
- Enemies kill on contact, die when stomped, and can drop reward coins.
- Mushrooms grow the player by 30%, improve jump height, and are removed on enemy hit.
- Respawn restores dynamic entities to checkpoint state instead of regenerating the terrain layout.
- Future gameplay work should build on these hooks instead of moving new logic back into `world.js` or `player.js`.

## Preferred Change Strategy

- For gameplay balance changes, modify generation/config helpers first.
- For physics issues, fix the shared source of truth before adding exceptions.
- For rendering mismatches, make render and collision read the same world data.
- If adding a new mechanic, keep it integrated with existing globals unless a larger refactor is explicitly requested.