const jumpSound = new Audio("sources/jump.mp3");
jumpSound.preload = "auto";
const fallSound = new Audio("sources/wah.mp3");
fallSound.preload = "auto";

function playJumpSound() {
  jumpSound.currentTime = 0;
  jumpSound.play().catch(() => {});
}

function playFallSound() {
  fallSound.currentTime = 0;
  fallSound.play().catch(() => {});
}

const player = {
  x: spawnScreenX,
  y: 200,
  width: 20,
  height: 20,

  vy: 0,
  gravity: 0.5,
  jump: -10,
  onGround: false,
  hasPlayedFallSound: false,

  update() {
    const cheatModeActive = typeof isCheatModeActive === "function" && isCheatModeActive();
    const playerLeftX = this.x + worldOffset;
    const playerRightX = this.x + this.width + worldOffset;
    const playerBottom = this.y + this.height;

    if (cheatModeActive) {
      const flightSpeed = 4;
      this.vy = 0;

      if (keys["ArrowUp"] || keys[" "]) this.y -= flightSpeed;
      if (keys["ArrowDown"]) this.y += flightSpeed;

      this.y = clamp(this.y, 0, canvas.height - this.height);
    } else {
      this.vy += this.gravity;
      this.y += this.vy;
    }

    const nextBottom = playerBottom + this.vy;

    this.onGround = false;

    let landingSegment = null;
    let stompedEnemy = null;

    for (let enemy of enemies) {
      if (!enemy.alive) continue;
      if (enemy.x >= playerRightX || enemy.x + enemy.width <= playerLeftX) continue;

      if (!cheatModeActive && this.vy > 0 && playerBottom <= enemy.y && nextBottom >= enemy.y) {
        if (!stompedEnemy || enemy.y < stompedEnemy.y) {
          stompedEnemy = enemy;
        }
      }
    }

    for (let segment of terrain) {
      if (segment.type !== "ground" && segment.type !== "platform") continue;
      if (segment.x >= playerRightX || segment.x + segment.width <= playerLeftX) continue;

      if (playerBottom <= segment.y && nextBottom >= segment.y) {
        if (!landingSegment || segment.y < landingSegment.y) {
          landingSegment = segment;
        }
      }
    }

    if (stompedEnemy && (!landingSegment || stompedEnemy.y < landingSegment.y)) {
      this.y = stompedEnemy.y - this.height;
      this.vy = this.jump * 0.6;
      defeatEnemy(stompedEnemy);
      this.hasPlayedFallSound = false;
    } else if (!cheatModeActive && landingSegment) {
      this.y = landingSegment.y - this.height;
      this.vy = 0;
      this.onGround = true;
      this.hasPlayedFallSound = false;
    }

    const resolvedPlayerLeftX = this.x + worldOffset;
    const resolvedPlayerRightX = this.x + this.width + worldOffset;
    const resolvedPlayerTop = this.y;
    const resolvedPlayerBottom = this.y + this.height;

    for (let enemy of enemies) {
      if (!enemy.alive) continue;

      const touchesEnemy =
        resolvedPlayerRightX > enemy.x &&
        resolvedPlayerLeftX < enemy.x + enemy.width &&
        resolvedPlayerBottom > enemy.y &&
        resolvedPlayerTop < enemy.y + enemy.height;

      if (touchesEnemy) {
        if (cheatModeActive) {
          defeatEnemy(enemy);
          continue;
        }

        this.respawn();
        return;
      }
    }

    if (this.onGround) {
      const groundedBottom = this.y + this.height;

      for (let checkpoint of checkpoints) {
        const touchesCheckpoint =
          playerRightX >= checkpoint.x &&
          playerLeftX <= checkpoint.x + checkpoint.width &&
          Math.abs(groundedBottom - checkpoint.surfaceY) <= 2;

        if (touchesCheckpoint) {
          activateCheckpoint(checkpoint);
        }
      }
    }

    if (!cheatModeActive && keys[" "] && this.onGround) {
      this.vy = this.jump;
      playJumpSound();
    }

    if (!cheatModeActive && !this.hasPlayedFallSound && this.vy > 0 && playerBottom > groundY) {
      playFallSound();
      this.hasPlayedFallSound = true;
    }

    if (this.y > canvas.height) {
      this.respawn();
    }
  },

  respawn() {
    const checkpoint = getRespawnCheckpoint();

    if (!checkpoint) {
      worldOffset = 0;
      setCurrentLevel(1);
      this.y = groundY - this.height;
      this.vy = 0;
      this.onGround = true;
      this.hasPlayedFallSound = false;
      return;
    }

    setCurrentLevel(checkpoint.level);
    worldOffset = Math.max(0, getCheckpointRespawnWorldX(checkpoint) - this.x);
    ensureWorldGenerated(canvas);

    this.y = checkpoint.surfaceY - this.height;
    this.vy = 0;
    this.onGround = true;
    this.hasPlayedFallSound = false;
  },

  draw(ctx) {
    ctx.fillStyle = typeof isCheatModeActive === "function" && isCheatModeActive() ? "deepskyblue" : "red";

    if (typeof isMapViewActive === "function" && isMapViewActive()) {
      const screenX = getPlayerWorldX() - worldOffset;
      ctx.fillRect(screenX, this.y, this.width, this.height);
      return;
    }

    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};