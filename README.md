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
- `js/world.js` — world rendering, platform and hole definitions, and horizontal scrolling
- `js/player.js` — player physics, jumping, collision handling, and death/reset logic
- `js/main.js` — main game loop and draw/update cycle

## Notes

- The game resets when the player falls below the visible canvas.
- Platform positions and hole sizes are defined in `js/world.js` and can be easily adjusted.
