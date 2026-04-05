# Mini Mario

A small browser-based platformer built with HTML5 Canvas and vanilla JavaScript.

## Overview

This project implements a simple Mario-style game where the player controls a red square that can move through an infinite scrolling world, jump on platforms, and avoid falling through holes.

## Features

- HTML5 Canvas rendering
- Keyboard input handling
- Infinite ground scrolling
- Jumping and gravity physics
- Platform collision detection
- Simple game over behavior when the player falls off-screen

## Controls

- `ArrowRight` — move world to the left (simulate moving right)
- `ArrowLeft` — move world to the right (simulate moving left)
- `Space` — jump

## How to Run

1. Open `index.html` in a modern web browser.
2. The game starts automatically.

## Project Structure

- `index.html` — main HTML file containing the canvas and script imports
- `js/input.js` — keyboard input tracking
- `js/world.js` — world generation, terrain, checkpoints, level progression, and section hooks for content spawning
- `js/coins.js` — coin state, spawning hooks, updates, and drawing
- `js/enemies.js` — enemy state, spawning hooks, updates, and drawing
- `js/player.js` — player physics, jumping, collision handling, checkpoints, and respawn logic
- `js/main.js` — main game loop, draw/update coordination, and HUD

## Notes

- The game respawns from the latest checkpoint instead of fully resetting the page.
- Terrain generation and difficulty scaling are centralized in `js/world.js`.
- Coins and enemies are split into their own files so future mechanics do not accumulate inside one script.
