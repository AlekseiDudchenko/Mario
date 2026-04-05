const enemies = [];
const enemyWidth = 22;
const enemyHeight = 18;

function createEnemy(x, surfaceY, patrolMinX, patrolMaxX, speed) {
  const initialVelocity = Math.random() < 0.5 ? -speed : speed;

  return {
    x,
    y: surfaceY - enemyHeight,
    width: enemyWidth,
    height: enemyHeight,
    vx: initialVelocity,
    patrolMinX,
    patrolMaxX,
    alive: true,
    startX: x,
    startVx: initialVelocity
  };
}

function trySpawnEnemyOnSurface(surface, spawnChance, level, leftPadding = 28) {
  if (surface.width < enemyWidth + leftPadding + 28) return;
  if (Math.random() >= spawnChance) return;

  const patrolMinX = surface.x + leftPadding;
  const patrolMaxX = surface.x + surface.width - 20;
  const spawnMinX = patrolMinX;
  const spawnMaxX = patrolMaxX - enemyWidth;

  if (spawnMaxX <= spawnMinX) return;

  const x = getRandomInt(spawnMinX, spawnMaxX);
  const speed = 0.7 + Math.min(0.75, (sectionLevelToNumber(level) - 1) * 0.03);
  enemies.push(createEnemy(x, surface.y, patrolMinX, patrolMaxX, speed));
}

function sectionLevelToNumber(level) {
  return Math.max(1, Math.floor(level));
}

function spawnEnemiesForSection(section) {
  const level = sectionLevelToNumber(section.level);
  const groundSpawnChance = Math.min(0.16 + (level - 1) * 0.012, 0.34);
  const platformSpawnChance = Math.min(0.08 + (level - 1) * 0.008, 0.24);

  trySpawnEnemyOnSurface(section.ground, groundSpawnChance, level, 96);

  for (let platform of section.platforms) {
    trySpawnEnemyOnSurface(platform, platformSpawnChance, level, 18);
  }
}

function defeatEnemy(enemy) {
  if (!enemy || !enemy.alive) return;

  enemy.alive = false;

  if (typeof spawnRewardCoin === "function") {
    spawnRewardCoin(enemy.x + enemy.width / 2, enemy.y);
  }
}

function resetEnemiesForRespawn() {
  for (let enemy of enemies) {
    enemy.alive = true;
    enemy.x = enemy.startX;
    enemy.vx = enemy.startVx;
  }
}

function updateEnemies() {
  for (let enemy of enemies) {
    if (!enemy.alive) continue;

    enemy.x += enemy.vx;

    if (enemy.x <= enemy.patrolMinX) {
      enemy.x = enemy.patrolMinX;
      enemy.vx = Math.abs(enemy.vx);
    } else if (enemy.x + enemy.width >= enemy.patrolMaxX) {
      enemy.x = enemy.patrolMaxX - enemy.width;
      enemy.vx = -Math.abs(enemy.vx);
    }
  }
}

function drawEnemies(ctx) {
  for (let enemy of enemies) {
    if (!enemy.alive) continue;

    const screenX = enemy.x - worldOffset;
    if (screenX + enemy.width < 0 || screenX > canvas.width) continue;

    ctx.fillStyle = "black";
    ctx.fillRect(screenX, enemy.y, enemy.width, enemy.height);
  }
}
