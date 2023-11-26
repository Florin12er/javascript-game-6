/** @type {HTMLCanvasElement} */

const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
const easy = document.querySelector(".easy");
const normal = document.querySelector(".normal");
const hard = document.querySelector(".hard");
const baby = document.querySelector(".baby");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const impossible = document.querySelector(".impossible");
const hell = document.querySelector(".hell");

const colisionCanvas = document.getElementById("collisitionCanvas");
const colisionCtx = colisionCanvas.getContext("2d");
colisionCanvas.width = window.innerWidth;
colisionCanvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let explosion = [];
let pattern = [];
let ravens = [];

let timeToNextRaven = 0;
let ravenInterval = 300;
let lastTime = 0;

let directionX = Math.random() * 5 + 1.7;

function handleDifficultyClick(factor) {
  directionX = Math.random() * 5 + factor;
}

easy.addEventListener("click", () => handleDifficultyClick(1));
normal.addEventListener("click", () => handleDifficultyClick(1.7));
hard.addEventListener("click", () => handleDifficultyClick(4));
impossible.addEventListener("click", () => handleDifficultyClick(20));
baby.addEventListener("click", () => handleDifficultyClick(0.1));
hell.addEventListener("click", () => handleDifficultyClick(100));

class Raven {
  constructor() {
    this.spriteWidth = 271;
    this.spriteHeight = 194;
    this.sizeModifier = Math.random() * 0.6 + 0.4;
    this.width = this.spriteWidth * this.sizeModifier;
    this.height = this.spriteHeight * this.sizeModifier;
    this.x = canvas.width;
    this.y = Math.random() * (canvas.height - this.height);
    this.directionX = directionX;
    this.directionY = Math.random() * 5 - 2.5;
    this.markedForDeletion = false;
    this.image = new Image();
    this.image.src =
      "https://github.com/Florin12er/javascript-game-5/blob/main/images/raven.png?raw=true";
    this.frame = 0;
    this.maxFrame = 4;
    this.timeSinceFlap = 0;
    this.flapInterval = Math.random() * 100 + 20;
    this.randomColors = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    ];
    this.color =
      "rgb(" +
      this.randomColors[0] +
      "," +
      this.randomColors[1] +
      "," +
      this.randomColors[2] +
      ")";
  }
  update(delta) {
    if (this.y < 0 || this.y > canvas.height - this.height) {
      this.directionY = this.directionY * -1;
    }
    this.x -= this.directionX;
    this.y += this.directionY;
    if (this.x < 0 - this.width) this.markedForDeletion = true;
    this.timeSinceFlap += delta;
    if (this.timeSinceFlap > this.flapInterval) {
      if (this.frame > this.maxFrame) this.frame = 0;
      else this.frame++;
      this.timeSinceFlap = 0;
    }
  }
  draw() {
    colisionCtx.fillStyle = this.color;
    colisionCtx.fillRect(this.x, this.y, this.width, this.height);
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height,
    );
  }
}

class Explosion {
  constructor(x, y, size) {
    this.image = new Image();
    this.image.src =
      "https://github.com/Florin12er/javascript-game-4/blob/main/images/boom.png?raw=true";
    this.spriteWidth = 100;
    this.spriteHeight = 150;
    this.size = size;
    this.x = x;
    this.y = y;
    this.frame = 0;
    this.sound = new Audio();
    this.sound.src =
      "/home/sebastian/javascript-game-5/images/images_Fire impact 1.wav";
    this.timeSinceLastFrame = 0;
    this.frameInterval = 200;
    this.markedForDeletion = false;
  }
  update(deltaTime) {
    if (this.frame === 0) this.sound.play();
    this.timeSinceLastFrame += deltaTime;
    if (this.timeSinceLastFrame > this.frameInterval) {
      this.frame++;
      this.timeSinceLastFrame = 0;
      if (this.frame > 5) this.markedForDeletion = true;
    }
  }
  draw() {
    ctx.drawImage(
      this.image,
      this.frame * this.spriteWidth,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.size,
      this.size,
    );
  }
}

function drawScore() {
  ctx.fillStyle = "black";
  ctx.font = "50px Impact";
  ctx.fillText("Score: " + score, 50, 75);
}

window.addEventListener("click", (e) => {
  const detectPixelColor = colisionCtx.getImageData(e.x, e.y, 1, 1);
  const pc = detectPixelColor.data;
  ravens.forEach((object) => {
    if (
      object.randomColors[0] === pc[0] &&
      object.randomColors[1] === pc[1] &&
      object.randomColors[2] === pc[2]
    ) {
      object.markedForDeletion = true;
      score++;
      explosion.push(new Explosion(object.x, object.y, object.width));
      console.log(explosion);
    }
  });
});

function animate(timeStamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  colisionCtx.clearRect(0, 0, canvas.width, canvas.height);
  let delta = timeStamp - lastTime;
  lastTime = timeStamp;
  timeToNextRaven += delta;
  if (timeToNextRaven > ravenInterval) {
    ravens.push(new Raven());
    timeToNextRaven = 0;
    ravens.sort((a, b) => {
      return a.width - b.width;
    });
  }
  drawScore();
  [...ravens, ...explosion, ...pattern].forEach((object) =>
    object.update(delta),
  );
  [...ravens, ...explosion, ...pattern].forEach((object) => object.draw());
  ravens = ravens.filter((object) => !object.markedForDeletion);
  explosion = explosion.filter((object) => !object.markedForDeletion);
  requestAnimationFrame(animate);
}
animate(0);


