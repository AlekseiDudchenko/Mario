const coins = [];

function spawnCoinsForSection(section) {
  // Placeholder for future coin generation.
}

function updateCoins() {
  // Placeholder for future coin collection logic.
}

function drawCoins(ctx) {
  for (let coin of coins) {
    if (coin.collected) continue;

    const screenX = coin.x - worldOffset;
    if (screenX + coin.width < 0 || screenX > canvas.width) continue;

    ctx.fillStyle = "gold";
    ctx.beginPath();
    ctx.arc(screenX + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
