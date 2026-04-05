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
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();