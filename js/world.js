let worldOffset = 0;
let speed = 3;
const groundY = 220;
const tileWidth = 40;
const groundHeight = 80;
const platformHeight = 10;

// Генерация платформ основана на физике прыжка и скорости персонажа.
// Время в воздухе ≈ 2 * jumpVelocity / gravity.
// Горизонтальная дистанция прыжка ≈ speed * время в воздухе.
const playerSpeed = speed;
const playerJumpVelocity = 10;
const playerGravity = 0.5;
const maxJumpFrames = Math.ceil((playerJumpVelocity * 2) / playerGravity);
const maxHorizontalJump = playerSpeed * maxJumpFrames;
const maxJumpHeight = (playerJumpVelocity * playerJumpVelocity) / (2 * playerGravity);
const minHoleWidth = 30;
const maxHoleWidth = Math.min(40, Math.floor(maxHorizontalJump * 0.3));
const minPlatformWidth = 60;
const maxPlatformWidth = 130;
const minPlatformY = groundY - Math.floor(maxJumpHeight * 0.45);
const maxPlatformY = groundY - 30;
const maxPlatformGap = 10;

let generatedUntilX = 0;
const terrain = [];

function updateWorld() {
  if (keys["ArrowRight"]) worldOffset += speed;
  if (keys["ArrowLeft"] && worldOffset > 0) worldOffset -= speed;
}

function drawWorld(ctx, canvas) {
  ensureWorldGenerated(canvas);

  ctx.fillStyle = "green";
  for (let segment of terrain) {
    if (segment.type !== "ground") continue;

    const screenX = segment.x - worldOffset;
    if (screenX + segment.width < 0 || screenX > canvas.width) continue;

    ctx.fillRect(screenX, segment.y, segment.width, segment.height);
  }

  ctx.fillStyle = "darkgreen";
  for (let segment of terrain) {
    if (segment.type !== "platform") continue;

    const screenX = segment.x - worldOffset;
    if (screenX + segment.width < 0 || screenX > canvas.width) continue;

    ctx.fillRect(screenX, segment.y, segment.width, segment.height);
  }
}

function getTerrainSegmentsInRange(leftX, rightX) {
  return terrain.filter(segment => segment.x < rightX && segment.x + segment.width > leftX);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function snapToTile(value) {
  return Math.ceil(value / tileWidth) * tileWidth;
}

function ensureWorldGenerated(canvas) {
  const generateAhead = worldOffset + canvas.width * 2;

  if (terrain.length === 0) {
    const initialGround = {
      type: "ground",
      x: 0,
      y: groundY,
      width: 320,
      height: groundHeight
    };
    terrain.push(initialGround);
    generatedUntilX = initialGround.x + initialGround.width;
  }

  while (generatedUntilX < generateAhead) {
    const holeStart = snapToTile(generatedUntilX + getRandomInt(20, 40));
    let holeWidth = snapToTile(getRandomInt(minHoleWidth, maxHoleWidth));
    holeWidth = Math.max(tileWidth, Math.min(holeWidth, snapToTile(maxHorizontalJump - maxPlatformGap - tileWidth)));

    const platformGap = getRandomInt(0, maxPlatformGap);
    const platformWidth = Math.max(tileWidth, snapToTile(getRandomInt(minPlatformWidth, maxPlatformWidth)));
    const platformX = snapToTile(holeStart + holeWidth + platformGap);

    let lastPlatformY = groundY;
    for (let i = terrain.length - 1; i >= 0; i--) {
      if (terrain[i].type === "platform") {
        lastPlatformY = terrain[i].y;
        break;
      }
    }

    const platformY = clamp(
      lastPlatformY + getRandomInt(-40, 30),
      minPlatformY,
      maxPlatformY
    );

    const groundSegment = {
      type: "ground",
      x: generatedUntilX,
      y: groundY,
      width: holeStart - generatedUntilX,
      height: groundHeight
    };
    const platformSegment = {
      type: "platform",
      x: platformX,
      y: platformY,
      width: platformWidth,
      height: platformHeight
    };

    terrain.push(groundSegment);
    terrain.push(platformSegment);
    generatedUntilX = platformX + platformWidth + tileWidth;
  }
}
