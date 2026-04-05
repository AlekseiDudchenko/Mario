let worldOffset = 0;
let speed = 3;
const spawnScreenX = 200;
const groundY = 220;
const tileWidth = 40;
const groundHeight = 80;
const platformHeight = 10;
const checkpointWidth = 14;
const checkpointHeight = 50;
const maxDifficultyLevel = 15;
const baseCheckpointInterval = 2;
const checkpointIntervalGrowth = 5;
const cheatCode = "iddqd";

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

let challengeCountSinceCheckpoint = 0;
let pendingCheckpoint = false;
let checkpointIdCounter = 0;
let lastCheckpoint = null;
let currentLevel = 1;
let nextCheckpointLevel = 2;
let chainIdCounter = 0;
let mapViewMode = false;
let gameplayWorldOffset = 0;
let cheatModeEnabled = false;
const mapViewPanSpeed = 14;
const checkpointSound = new Audio("sources/check-point.mp3");
checkpointSound.preload = "auto";

function playCheckpointSound() {
  checkpointSound.currentTime = 0;
  checkpointSound.play().catch(() => {});
}

function toggleMapViewMode() {
  if (mapViewMode) {
    mapViewMode = false;
    worldOffset = gameplayWorldOffset;
    return;
  }

  gameplayWorldOffset = worldOffset;
  mapViewMode = true;
}

function isMapViewActive() {
  return mapViewMode;
}

function syncGameplayWorldOffset() {
  gameplayWorldOffset = worldOffset;
}

function getPlayerWorldX() {
  return spawnScreenX + gameplayWorldOffset;
}

function toggleCheatMode() {
  cheatModeEnabled = !cheatModeEnabled;
}

function isCheatModeActive() {
  return cheatModeEnabled;
}

function getMovementSpeed() {
  return cheatModeEnabled ? speed * 2 : speed;
}

function updateWorld() {
  if (typeof consumeTypedCode === "function" && consumeTypedCode(cheatCode)) {
    toggleCheatMode();
  }

  if (consumeKeyPress("m")) {
    toggleMapViewMode();
  }

  if (mapViewMode) {
    if (keys["ArrowRight"]) worldOffset += mapViewPanSpeed;
    if (keys["ArrowLeft"]) worldOffset = Math.max(0, worldOffset - mapViewPanSpeed);
    return;
  }

  const movementSpeed = getMovementSpeed();
  if (keys["ArrowRight"]) worldOffset += movementSpeed;
  if (keys["ArrowLeft"]) worldOffset = Math.max(0, worldOffset - movementSpeed);

  syncGameplayWorldOffset();
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

function normalizeLevel(level) {
  return Math.max(1, Math.floor(level));
}

function clampDifficultyLevel(level) {
  return clamp(normalizeLevel(level), 1, maxDifficultyLevel);
}

function getCheckpointIntervalForLevel(level) {
  return baseCheckpointInterval + Math.floor((normalizeLevel(level) - 1) / checkpointIntervalGrowth);
}

function getLevelConfig(level) {
  const clampedLevel = clampDifficultyLevel(level);
  const difficulty = 1 - Math.exp(-(clampedLevel - 1) / 8);
  const safeJumpDistance = Math.max(70, Math.floor(maxHorizontalJump * (0.72 + difficulty * 0.1)));

  const minGroundRun = Math.round(112 - difficulty * 62);
  const maxGroundRun = Math.round(160 - difficulty * 100);
  const minHoleWidth = Math.round(30 + difficulty * 22);
  const maxHoleWidth = Math.round(42 + difficulty * 30);
  const minPlatformWidth = Math.round(120 - difficulty * 50);
  const maxPlatformWidth = Math.round(158 - difficulty * 62);
  const maxPlatformGap = Math.round(12 + difficulty * 24);
  const minPlatformY = groundY - Math.round(maxJumpHeight * (0.32 + difficulty * 0.22));
  const maxPlatformY = groundY - Math.round(20 + difficulty * 22);
  const verticalRise = Math.round(22 + difficulty * 18);
  const verticalDrop = Math.round(16 + difficulty * 16);
  const chainChance = Math.max(0, difficulty - 0.08);
  const maxChainLength = 2 + Math.min(2, Math.floor(difficulty * 3));
  const minChainGap = Math.round(10 + difficulty * 10);
  const maxChainGap = Math.round(18 + difficulty * 16);

  return {
    level: clampedLevel,
    minGroundRun,
    maxGroundRun: Math.max(minGroundRun, maxGroundRun),
    minHoleWidth,
    maxHoleWidth: Math.min(safeJumpDistance - 24, Math.max(minHoleWidth, maxHoleWidth)),
    minPlatformWidth,
    maxPlatformWidth: Math.max(minPlatformWidth, maxPlatformWidth),
    maxPlatformGap,
    safeJumpDistance,
    minPlatformY,
    maxPlatformY: Math.max(minPlatformY, maxPlatformY),
    verticalRise,
    verticalDrop,
    chainChance,
    maxChainLength,
    minChainGap,
    maxChainGap
  };
}

function createPlatformSegment(x, y, width, chainId = null, chainIndex = 0, chainLength = 1) {
  return {
    type: "platform",
    x,
    y,
    width,
    height: platformHeight,
    chainId,
    chainIndex,
    chainLength
  };
}

function buildChallengePlatforms(levelConfig, holeStart, holeWidth, lastPlatformY) {
  const firstGapLimit = Math.max(0, levelConfig.safeJumpDistance - holeWidth - 10);
  const firstGap = getRandomInt(0, Math.min(levelConfig.maxPlatformGap, firstGapLimit));
  const shouldUseChain = Math.random() < levelConfig.chainChance;
  const chainLength = shouldUseChain ? getRandomInt(2, levelConfig.maxChainLength) : 1;
  const chainId = chainLength > 1 ? chainIdCounter++ : null;
  const platforms = [];

  let previousPlatformEnd = holeStart + holeWidth;
  let previousPlatformY = lastPlatformY;

  for (let index = 0; index < chainLength; index++) {
    const width = getRandomInt(levelConfig.minPlatformWidth, levelConfig.maxPlatformWidth);
    const gap = index === 0
      ? firstGap
      : getRandomInt(levelConfig.minChainGap, Math.min(levelConfig.maxChainGap, levelConfig.safeJumpDistance - 18));
    const x = previousPlatformEnd + gap;
    const y = clamp(
      previousPlatformY + getRandomInt(-Math.max(10, Math.floor(levelConfig.verticalRise * 0.75)), Math.max(8, Math.floor(levelConfig.verticalDrop * 0.65))),
      levelConfig.minPlatformY,
      levelConfig.maxPlatformY
    );

    platforms.push(createPlatformSegment(x, y, width, chainId, index, chainLength));

    previousPlatformEnd = x + width;
    previousPlatformY = y;
  }

  return platforms;
}

function addCheckpoint(x, surfaceY, level, isActive = false) {
  const checkpoint = {
    id: checkpointIdCounter++,
    x,
    y: surfaceY - checkpointHeight,
    width: checkpointWidth,
    height: checkpointHeight,
    surfaceY,
    level: normalizeLevel(level),
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
  playCheckpointSound();
}

function getRespawnCheckpoint() {
  return lastCheckpoint;
}

function getCurrentLevel() {
  return currentLevel;
}

function setCurrentLevel(level) {
  currentLevel = normalizeLevel(level);
}

function getCheckpointRespawnWorldX(checkpoint) {
  return Math.max(spawnScreenX, checkpoint.x - 40);
}

function registerSectionContent(section) {
  if (typeof spawnCoinsForSection === "function") {
    spawnCoinsForSection(section);
  }

  if (typeof spawnEnemiesForSection === "function") {
    spawnEnemiesForSection(section);
  }
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
    const holeWidth = getRandomInt(levelConfig.minHoleWidth, levelConfig.maxHoleWidth);

    let lastPlatformY = groundY;
    for (let i = terrain.length - 1; i >= 0; i--) {
      if (terrain[i].type === "platform") {
        lastPlatformY = terrain[i].y;
        break;
      }
    }

    const challengePlatforms = buildChallengePlatforms(levelConfig, holeStart, holeWidth, lastPlatformY);
    const lastChallengePlatform = challengePlatforms[challengePlatforms.length - 1];

    const groundSegment = {
      type: "ground",
      x: generatedUntilX,
      y: groundY,
      width: holeStart - generatedUntilX,
      height: groundHeight
    };

    terrain.push(groundSegment);

    if (pendingCheckpoint && groundSegment.width >= 80) {
      addCheckpoint(groundSegment.x + 40, groundSegment.y, nextCheckpointLevel);
      challengeCountSinceCheckpoint = 0;
      nextCheckpointLevel += 1;
      pendingCheckpoint = false;
    }

    for (let platform of challengePlatforms) {
      terrain.push(platform);
    }

    registerSectionContent({
      level: currentLevel,
      ground: groundSegment,
      platforms: challengePlatforms,
      checkpointPlanned: pendingCheckpoint,
      checkpointLevel: nextCheckpointLevel
    });

    challengeCountSinceCheckpoint += 1;
    if (challengeCountSinceCheckpoint >= getCheckpointIntervalForLevel(currentLevel)) {
      pendingCheckpoint = true;
    }

    generatedUntilX = lastChallengePlatform.x + lastChallengePlatform.width;
  }
}
