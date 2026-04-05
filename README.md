# Mini Mario

A small browser-based platformer built with HTML5 Canvas and vanilla JavaScript.

## Overview

This project implements a simple Mario-style game where the player controls a red square that can move through an endless generated world, jump on platforms, and avoid falling through holes.

## Features

- HTML5 Canvas rendering
- Keyboard input handling
- Endless level progression with gently increasing level length
- Jumping and gravity physics
- Platform collision detection
- Black enemies that kill on contact and die when jumped on
- Coins that drop from defeated enemies and increase a HUD counter when collected
- Mushrooms that make the player 30% bigger and improve jump height until an enemy hit removes the effect
- Simple game over behavior when the player falls off-screen
- Dying restores enemies, mushrooms, and coins from the latest checkpoint state

## Controls

- `ArrowRight` — move world to the left (simulate moving right)
- `ArrowLeft` — move world to the right (simulate moving left)
- `Space` — jump
- `M` — toggle map view mode
- `IDDQD` — toggle cheat mode
- `ArrowUp` / `ArrowDown` in cheat mode — fly up or down

## How to Run

1. Open `index.html` in a modern web browser.
2. The game starts automatically.

## Project Structure

- `index.html` — main HTML file containing the canvas and script imports
- `js/input.js` — keyboard input tracking
- `js/world.js` — world generation, terrain, checkpoints, level progression, and section hooks for content spawning
- `js/coins.js` — coin state, spawning hooks, updates, and drawing
- `js/enemies.js` — enemy state, spawning hooks, updates, and drawing
- `js/powerups.js` — mushroom power-up spawning, collection, updates, and drawing
- `js/player.js` — player physics, jumping, collision handling, checkpoints, and respawn logic
- `js/main.js` — main game loop, draw/update coordination, and HUD

## Notes

- The game respawns from the latest checkpoint instead of fully resetting the page.
- Terrain generation and difficulty scaling are centralized in `js/world.js`.
- Coins and enemies are split into their own files so future mechanics do not accumulate inside one script.
- In map view mode, gameplay is paused and the camera can be moved with the arrow keys to inspect the generated level.
- Cheat mode doubles movement speed, allows flying, and defeats enemies on contact.
