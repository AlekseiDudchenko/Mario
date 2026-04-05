let worldOffset = 0;
let speed = 3;
const spawnScreenX = 200;
const groundY = 220;
const tileWidth = 40;
const groundHeight = 80;
const platformHeight = 10;
const checkpointWidth = 14;
const checkpointHeight = 50;
const maxLevel = 10;

// Генерация платформ основана на физике прыжка и скорости персонажа.
// Время в воздухе ≈ 2 * jumpVelocity / gravity.
// Горизонтальная дистанция прыжка ≈ speed * время в воздухе.
const playerSpeed = speed;
const playerJumpVelocity = 10;
const playerGravity = 0.5;
const maxJumpFrames = Math.ceil((playerJumpVelocity * 2) / playerGravity);
const maxHorizontalJump = playerSpeed * maxJumpFrames;
const maxJumpHeight = (playerJumpVelocity * playerJumpVelocity) / (2 * playerGravity);

let generatedUntilX = 0;
const terrain = [];
const checkpoints = [];
const checkpointInterval = 2;

let challengeCount = 0;
let pendingCheckpoint = false;
let checkpointIdCounter = 0;
let lastCheckpoint = null;
let currentLevel = 1;
let nextCheckpointLevel = 2;

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

  for (let checkpoint of checkpoints) {
    const screenX = checkpoint.x - worldOffset;
    if (screenX + checkpoint.width < 0 || screenX > canvas.width) continue;

    ctx.fillStyle = checkpoint.active ? "gold" : "white";
    ctx.fillRect(screenX + 5, checkpoint.y, 4, checkpoint.height);

    ctx.fillStyle = checkpoint.active ? "crimson" : "orange";
    ctx.beginPath();
    ctx.moveTo(screenX + 9, checkpoint.y + 2);
    ctx.lineTo(screenX + 26, checkpoint.y + 10);
    ctx.lineTo(screenX + 9, checkpoint.y + 18);
    ctx.closePath();
    ctx.fill();
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

function clampLevel(level) {
  return clamp(level, 1, maxLevel);
}

function getLevelConfig(level) {
  const clampedLevel = clampLevel(level);
  const difficulty = (clampedLevel - 1) / (maxLevel - 1);
  const maxSupportedGap = Math.max(55, Math.floor(maxHorizontalJump - 28));

  const minGroundRun = Math.round(90 - difficulty * 45);
  const maxGroundRun = Math.round(140 - difficulty * 70);
  const minHoleWidth = Math.round(30 + difficulty * 10);
  const maxHoleWidth = Math.round(40 + difficulty * 20);
  const minPlatformWidth = Math.round(110 - difficulty * 30);
  const maxPlatformWidth = Math.round(150 - difficulty * 45);
  const maxPlatformGap = Math.round(8 + difficulty * 20);
  const minPlatformY = groundY - Math.round(maxJumpHeight * (0.35 + difficulty * 0.15));
  const maxPlatformY = groundY - Math.round(25 + difficulty * 10);
  const verticalRise = Math.round(25 + difficulty * 15);
  const verticalDrop = Math.round(20 + difficulty * 10);

  return {
    level: clampedLevel,
    minGroundRun,
    maxGroundRun: Math.max(minGroundRun, maxGroundRun),
    minHoleWidth,
    maxHoleWidth: Math.min(maxSupportedGap, Math.max(minHoleWidth, maxHoleWidth)),
    minPlatformWidth,
    maxPlatformWidth: Math.max(minPlatformWidth, maxPlatformWidth),
    maxPlatformGap,
    maxSupportedGap,
    minPlatformY,
    maxPlatformY: Math.max(minPlatformY, maxPlatformY),
    verticalRise,
    verticalDrop
  };
}

function addCheckpoint(x, surfaceY, level, isActive = false) {
  const checkpoint = {
    id: checkpointIdCounter++,
    x,
    y: surfaceY - checkpointHeight,
    width: checkpointWidth,
    height: checkpointHeight,
    surfaceY,
    level: clampLevel(level),
    active: isActive
  };

  checkpoints.push(checkpoint);

  if (isActive || !lastCheckpoint) {
    lastCheckpoint = checkpoint;
  }

  return checkpoint;
}

function activateCheckpoint(checkpoint) {
  if (lastCheckpoint && lastCheckpoint.id === checkpoint.id) {
    return;
  }

  if (lastCheckpoint) {
    lastCheckpoint.active = false;
  }

  checkpoint.active = true;
  lastCheckpoint = checkpoint;
  currentLevel = checkpoint.level;
}

function getRespawnCheckpoint() {
  return lastCheckpoint;
}

function getCurrentLevel() {
  return currentLevel;
}

function setCurrentLevel(level) {
  currentLevel = clampLevel(level);
}

function getCheckpointRespawnWorldX(checkpoint) {
  return Math.max(spawnScreenX, checkpoint.x - 40);
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
    addCheckpoint(240, groundY, 1, true);
    generatedUntilX = initialGround.x + initialGround.width;
  }

  while (generatedUntilX < generateAhead) {
    const levelConfig = getLevelConfig(currentLevel);
    const groundRun = getRandomInt(levelConfig.minGroundRun, levelConfig.maxGroundRun);
    const holeStart = generatedUntilX + groundRun;
    let holeWidth = getRandomInt(levelConfig.minHoleWidth, levelConfig.maxHoleWidth);
    const platformGapLimit = Math.max(0, levelConfig.maxSupportedGap - holeWidth);
    const platformGap = getRandomInt(0, Math.min(levelConfig.maxPlatformGap, platformGapLimit));
    const platformWidth = getRandomInt(levelConfig.minPlatformWidth, levelConfig.maxPlatformWidth);
    const platformX = holeStart + holeWidth + platformGap;

    let lastPlatformY = groundY;
    for (let i = terrain.length - 1; i >= 0; i--) {
      if (terrain[i].type === "platform") {
        lastPlatformY = terrain[i].y;
        break;
      }
    }

    const platformY = clamp(
      lastPlatformY + getRandomInt(-levelConfig.verticalRise, levelConfig.verticalDrop),
      levelConfig.minPlatformY,
      levelConfig.maxPlatformY
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

    if (pendingCheckpoint && groundSegment.width >= 80) {
      addCheckpoint(groundSegment.x + 40, groundSegment.y, nextCheckpointLevel);
      nextCheckpointLevel = clampLevel(nextCheckpointLevel + 1);
      pendingCheckpoint = false;
    }

    terrain.push(platformSegment);

    challengeCount += 1;
    if (challengeCount % checkpointInterval === 0) {
      pendingCheckpoint = true;
    }

    generatedUntilX = platformX + platformWidth;
  }
}
