const player = {
  x: 200,
  y: 200,
  width: 20,
  height: 20,

  vy: 0,
  gravity: 0.5,
  jump: -10,
  onGround: false,

  update() {
    this.vy += this.gravity;
    this.y += this.vy;

    this.onGround = false;

    // земля (бесконечная)
    const playerCenterX = this.x + this.width / 2 + worldOffset;

    if (!isHoleAt(playerCenterX)) {
      if (this.y + this.height >= groundY) {
        this.y = groundY - this.height;
        this.vy = 0;
        this.onGround = true;
      }
    }

    // коллизии
    for (let platform of platforms) {
      let platformX = platform.x - worldOffset;

      const isAbovePlatform =
        this.y + this.height <= platform.y + this.vy;

      const isFallingOnPlatform =
        this.y + this.height >= platform.y &&
        this.y + this.height <= platform.y + 10;

      const isWithinX =
        this.x + this.width > platformX &&
        this.x < platformX + platform.width;

      if (isAbovePlatform && isFallingOnPlatform && isWithinX) {
        this.y = platform.y - this.height;
        this.vy = 0;
        this.onGround = true;
      }
    }

    // прыжок
    if (keys[" "] && this.onGround) {
      this.vy = this.jump;
    }

    // смерть (упал вниз)
    if (this.y > canvas.height) {
      //alert("Game Over");
      location.reload();
    }
  },

  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};