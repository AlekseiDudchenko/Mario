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
    const playerLeftX = this.x + worldOffset;
    const playerRightX = this.x + this.width + worldOffset;
    const playerBottom = this.y + this.height;

    this.vy += this.gravity;
    const nextBottom = playerBottom + this.vy;
    this.y += this.vy;

    this.onGround = false;

    let landingSegment = null;

    for (let segment of terrain) {
      if (segment.type !== "ground" && segment.type !== "platform") continue;
      if (segment.x >= playerRightX || segment.x + segment.width <= playerLeftX) continue;

      if (playerBottom <= segment.y && nextBottom >= segment.y) {
        if (!landingSegment || segment.y < landingSegment.y) {
          landingSegment = segment;
        }
      }
    }

    if (landingSegment) {
      this.y = landingSegment.y - this.height;
      this.vy = 0;
      this.onGround = true;
    }

    if (keys[" "] && this.onGround) {
      this.vy = this.jump;
    }

    if (this.y > canvas.height) {
      location.reload();
    }
  },

  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
};