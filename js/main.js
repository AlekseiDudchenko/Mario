const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ensureWorldGenerated(canvas);

function update() {
  updateWorld();
  player.update();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawWorld(ctx, canvas);
  player.draw(ctx);

  ctx.fillStyle = "black";
  ctx.font = "18px sans-serif";
  ctx.fillText(`Level ${getCurrentLevel()}`, 16, 28);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();