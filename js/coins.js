const coins = [];
const coinSize = 8;
let collectedCoins = 0;

function createCoin(x, y) {
  return {
    x,
    y,
    width: coinSize,
    height: coinSize,
    collected: false
  };
}

function spawnCoinsForSection(section) {
  // Placeholder for future world coin generation.
}

function spawnRewardCoin(x, y) {
  coins.push(createCoin(x - coinSize / 2, y - coinSize - 6));
}

function collectCoin(coin) {
  if (coin.collected) return;

  coin.collected = true;
  collectedCoins += 1;
}

function getCollectedCoinCount() {
  return collectedCoins;
}

function updateCoins() {
  const playerLeftX = player.x + worldOffset;
  const playerRightX = playerLeftX + player.width;
  const playerTop = player.y;
  const playerBottom = player.y + player.height;

  for (let coin of coins) {
    if (coin.collected) continue;

    const touchesCoin =
      playerRightX > coin.x &&
      playerLeftX < coin.x + coin.width &&
      playerBottom > coin.y &&
      playerTop < coin.y + coin.height;

    if (touchesCoin) {
      collectCoin(coin);
    }
  }
}

function drawCoins(ctx) {
  for (let coin of coins) {
    if (coin.collected) continue;

    const screenX = coin.x - worldOffset;
    if (screenX + coin.width < 0 || screenX > canvas.width) continue;

    ctx.fillStyle = "#f2c94c";
    ctx.beginPath();
    ctx.arc(screenX + coin.width / 2, coin.y + coin.height / 2, coin.width / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
