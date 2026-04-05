const mushrooms = [];
const mushroomWidth = 14;
const mushroomHeight = 14;

function createMushroom(x, surfaceY) {
  return {
    x,
    y: surfaceY - mushroomHeight,
    width: mushroomWidth,
    height: mushroomHeight,
    collected: false
  };
}

function trySpawnMushroomOnSurface(surface, spawnChance, leftPadding = 28) {
  if (surface.width < mushroomWidth + leftPadding + 28) return;
  if (Math.random() >= spawnChance) return;

  const minX = surface.x + leftPadding;
  const maxX = surface.x + surface.width - mushroomWidth - 20;

  if (maxX <= minX) return;

  mushrooms.push(createMushroom(getRandomInt(minX, maxX), surface.y));
}

function spawnPowerupsForSection(section) {
  const mushroomChance = Math.min(0.08 + (Math.max(1, Math.floor(section.level)) - 1) * 0.003, 0.14);

  trySpawnMushroomOnSurface(section.ground, mushroomChance, 110);

  for (let platform of section.platforms) {
    trySpawnMushroomOnSurface(platform, mushroomChance * 0.75, 18);
  }
}

function updatePowerups() {
  const playerLeftX = player.x + worldOffset;
  const playerRightX = playerLeftX + player.width;
  const playerTop = player.y;
  const playerBottom = player.y + player.height;

  for (let mushroom of mushrooms) {
    if (mushroom.collected) continue;

    const touchesMushroom =
      playerRightX > mushroom.x &&
      playerLeftX < mushroom.x + mushroom.width &&
      playerBottom > mushroom.y &&
      playerTop < mushroom.y + mushroom.height;

    if (touchesMushroom) {
      mushroom.collected = true;
      if (typeof player.applyMushroomPowerUp === "function") {
        player.applyMushroomPowerUp();
      }
    }
  }
}

function drawPowerups(ctx) {
  for (let mushroom of mushrooms) {
    if (mushroom.collected) continue;

    const screenX = mushroom.x - worldOffset;
    if (screenX + mushroom.width < 0 || screenX > canvas.width) continue;

    ctx.fillStyle = "#d62828";
    ctx.beginPath();
    ctx.arc(screenX + mushroom.width / 2, mushroom.y + 6, 6, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f7f3e9";
    ctx.fillRect(screenX + 4, mushroom.y + 6, 6, 8);

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(screenX + 5, mushroom.y + 5, 1.4, 0, Math.PI * 2);
    ctx.arc(screenX + 9, mushroom.y + 4, 1.2, 0, Math.PI * 2);
    ctx.arc(screenX + 7, mushroom.y + 7, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
}