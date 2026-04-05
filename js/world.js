let worldOffset = 0;
let speed = 3;
const groundY = 220;
const tileWidth = 40;


function updateWorld() {
  if (keys["ArrowRight"]) worldOffset += speed;
  if (keys["ArrowLeft"]) worldOffset -= speed;
}

function drawWorld(ctx, canvas) {
  // бесконечная земля
    for (let i = -1; i < canvas.width / tileWidth + 2; i++) {
      let baseX = Math.floor(worldOffset / tileWidth) * tileWidth;
      let worldX = baseX + i * tileWidth;

      let screenX = worldX - worldOffset;

      if (!isHoleAt(worldX)) {
        ctx.fillStyle = "green";
        ctx.fillRect(screenX, groundY, tileWidth, 80);
      }
    }

  // платформы сверху (оставляем)
  ctx.fillStyle = "darkgreen";

  for (let platform of platforms) {
    let screenX = platform.x - worldOffset;

    ctx.fillRect(screenX, platform.y, platform.width, platform.height);
  }
}

function isHoleAt(worldX) {
  for (let hole of holes) {
    if (
      worldX >= hole.x &&
      worldX <= hole.x + hole.width
    ) {
      return true;
    }
  }
  return false;
}

function isFullyOverHole(leftX, rightX) {
  for (let hole of holes) {
    if (leftX >= hole.x && rightX <= hole.x + hole.width) {
      return true;
    }
  }
  return false;
}

const platforms = [
 // { x: 200, y: 220, width: 100, height: 80 },  
  { x: 300, y: 170, width: 100, height: 10 },
  { x: 450, y: 100, width: 150, height: 10 },
  { x: 650, y: 180, width: 80, height: 10 }
];

const holes = [
  //{ x: 200, width: 80 },
  { x: 300, width: 420 },
 // { x: 900, width: 60 }
];