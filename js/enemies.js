const enemies = [];

function spawnEnemiesForSection(section) {
  // Placeholder for future enemy generation.
}

function updateEnemies() {
  for (let enemy of enemies) {
    if (!enemy.alive) continue;

    enemy.x += enemy.vx;

    if (enemy.x <= enemy.patrolMinX || enemy.x + enemy.width >= enemy.patrolMaxX) {
      enemy.vx *= -1;
    }
  }
}

function drawEnemies(ctx) {
  for (let enemy of enemies) {
    if (!enemy.alive) continue;

    const screenX = enemy.x - worldOffset;
    if (screenX + enemy.width < 0 || screenX > canvas.width) continue;

    ctx.fillStyle = "purple";
    ctx.fillRect(screenX, enemy.y, enemy.width, enemy.height);
  }
}
