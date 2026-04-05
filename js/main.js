const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ensureWorldGenerated(canvas);

function update() {
  updateWorld();

  if (isMapViewActive()) {
    return;
  }

  updateCoins();
  updateEnemies();
  updatePowerups();
  player.update();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawWorld(ctx, canvas);
  drawCoins(ctx);
  drawEnemies(ctx);
  drawPowerups(ctx);
  player.draw(ctx);

  ctx.fillStyle = "black";
  ctx.font = "18px sans-serif";
  ctx.fillText(`Level ${getCurrentLevel()}`, 16, 28);
  ctx.fillText(`Coins ${getCollectedCoinCount()}`, 16, 52);

  if (typeof isCheatModeActive === "function" && isCheatModeActive()) {
    ctx.fillStyle = "#0b3d91";
    ctx.fillText("Cheat IDDQD", 16, 76);
  }

  if (isMapViewActive()) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(12, 90, 250, 54);
    ctx.fillStyle = "white";
    ctx.font = "14px sans-serif";
    ctx.fillText("Map Mode", 24, 111);
    ctx.fillText("M: exit  Arrows: pan camera", 24, 132);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();