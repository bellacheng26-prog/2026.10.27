let walkImg, jumpImg;
let walkFrames = [];
let jumpFrames = [];

let x, y;          // 角色的座標
let groundY = 380; // 地面高度
let vy = 0;        // 垂直速度（重力用）
let gravity = 0.6; // 重力加速度
let jumpForce = -11; // 跳躍初始速度
let speed = 4;     // 移動速度

let currentFrame = 0;
let animSpeed = 0.2; // 動畫播放速度
let frameCounter = 0;
let jumpFrameCounter = 0;
let fallFrameCounter = 0;

let facing = 1;    // 原始圖片朝左，-1 表示水平翻轉朝右
let state = 'idle'; // 當前狀態：'idle'（靜止）, 'walk'（走路）, 'jump'（跳躍）

function preload() {
  walkImg = loadImage('角色資料/走.png', undefined, (error) => {
    console.error('走路角色圖片載入失敗，將使用內建角色圖形。', error);
  });
  jumpImg = loadImage('角色資料/跳.png', undefined, (error) => {
    console.error('跳躍角色圖片載入失敗，將使用內建角色圖形。', error);
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  groundY = height * 0.76;
  x = width / 2;
  y = groundY;

  if (walkImg) {
    let wWidth = 217 / 6;
    let wHeight = 51;
    for (let i = 0; i < 6; i++) {
      let img = walkImg.get(i * wWidth, 0, wWidth, wHeight);
      walkFrames.push(img);
    }
  }

  if (jumpImg) {
    let jWidth = 324 / 7;
    let jHeight = 50;
    for (let i = 0; i < 7; i++) {
      let img = jumpImg.get(i * jWidth, 0, jWidth, jHeight);
      jumpFrames.push(img);
    }
  }
}

function draw() {
  drawScene();

  // 倒地動畫播放時不移動，倒地後按左右鍵可起身
  if (state === 'fallen' && (keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW))) {
    state = 'idle';
  }

  // 處理鍵盤左右移動輸入
  let isMoving = false;
  if (state !== 'fall') {
    if (keyIsDown(LEFT_ARROW)) {
      x -= speed;
      facing = 1;
      isMoving = true;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      x += speed;
      facing = -1;
      isMoving = true;
    }
  }

  // 處理跳躍與重力物理運算
  if (state === 'jump' || y < groundY) {
    vy += gravity;
    y += vy;
    if (y < groundY) {
      state = 'jump';
    } else {
      y = groundY;
      vy = 0;
      state = isMoving ? 'walk' : 'idle';
    }
  } else if (state !== 'fall' && state !== 'fallen') {
    if (isMoving) {
      state = 'walk';
    } else {
      state = 'idle';
    }
  }

  // 處理動畫幀切換
  if (state === 'walk' && walkFrames.length > 0) {
    frameCounter += animSpeed;
    currentFrame = Math.floor(frameCounter) % walkFrames.length;
  } else if (state === 'jump' && jumpFrames.length > 0) {
    currentFrame = min(Math.floor(jumpFrameCounter), jumpFrames.length - 1);
    jumpFrameCounter += animSpeed;
  } else if (state === 'fall' || state === 'fallen') {
    if (state === 'fall') {
      fallFrameCounter += animSpeed;
      if (fallFrameCounter >= 7) {
        state = 'fallen';
      }
    }
  } else if (state === 'idle') {
    currentFrame = 0;
    frameCounter = 0;
  }

  if (state === 'fall' || state === 'fallen' ||
      (state === 'jump' && jumpFrames.length === 0) ||
      (state !== 'jump' && walkFrames.length === 0)) {
    drawFallbackCharacter();
  } else {
    // 繪製角色
    push();
    translate(x, y);
    scale(facing, 1); // 透過 scale 實現水平鏡射翻轉
    imageMode(CENTER);

    if (state === 'jump') {
      image(jumpFrames[currentFrame], 0, 0);
    } else {
      image(walkFrames[currentFrame], 0, 0);
    }
    pop();
  }
}

function drawFallbackCharacter() {
  push();
  translate(x, y);
  scale(facing, 1);
  noStroke();

  if (state === 'fall' || state === 'fallen') {
    fill(247, 190, 83);
    ellipse(0, 8, 54, 28);
    fill(255, 231, 190);
    ellipse(-13, 1, 25, 24);
    fill(57, 64, 77);
    ellipse(-19, -2, 3, 4);
    fill(84, 146, 205);
    rect(-4, 12, 21, 8, 5);
  } else {
    const hop = state === 'jump' ? -8 : 0;
    fill(84, 146, 205);
    rect(-12, -34 + hop, 24, 30, 9);
    fill(255, 231, 190);
    ellipse(0, -43 + hop, 30, 30);
    fill(57, 64, 77);
    ellipse(6, -45 + hop, 3, 4);
    fill(247, 190, 83);
    arc(0, -49 + hop, 31, 23, PI, TWO_PI);
    fill(57, 64, 77);
    rect(-12, -5 + hop, 9, 17, 4);
    rect(3, -5 + hop, 9, 17, 4);
    fill(255, 231, 190);
    ellipse(-7, 12 + hop, 14, 6);
    ellipse(8, 12 + hop, 14, 6);
  }
  pop();
}

function drawScene() {
  const sky = drawingContext.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#78c9ec');
  sky.addColorStop(0.64, '#d7f2e7');
  drawingContext.fillStyle = sky;
  drawingContext.fillRect(0, 0, width, height);

  noStroke();
  fill(255, 224, 120);
  ellipse(width * 0.84, height * 0.17, 74, 74);

  const cloudOffset = (frameCount * 0.25) % (width + 180);
  drawCloud(cloudOffset - 90, height * 0.19, 1);
  drawCloud((cloudOffset + width * 0.48) % (width + 180) - 90, height * 0.31, 0.72);

  fill(133, 201, 164);
  beginShape();
  vertex(0, height * 0.69);
  bezierVertex(width * 0.18, height * 0.48, width * 0.29, height * 0.7, width * 0.48, height * 0.63);
  bezierVertex(width * 0.69, height * 0.52, width * 0.82, height * 0.7, width, height * 0.58);
  vertex(width, groundY + 25);
  vertex(0, groundY + 25);
  endShape(CLOSE);

  fill(94, 177, 127);
  beginShape();
  vertex(0, height * 0.77);
  bezierVertex(width * 0.2, height * 0.63, width * 0.3, height * 0.77, width * 0.53, height * 0.7);
  bezierVertex(width * 0.75, height * 0.63, width * 0.87, height * 0.77, width, height * 0.68);
  vertex(width, groundY + 25);
  vertex(0, groundY + 25);
  endShape(CLOSE);

  fill(103, 190, 99);
  rect(0, groundY + 25, width, height - groundY - 25);
  stroke(65, 145, 78);
  strokeWeight(3);
  line(0, groundY + 25, width, groundY + 25);

  noStroke();
  for (let flowerX = 36; flowerX < width; flowerX += 96) {
    const flowerY = groundY + 58 + (flowerX % 3) * 12;
    fill(255, 239, 177);
    ellipse(flowerX, flowerY, 8, 8);
    fill(55, 133, 70);
    rect(flowerX - 1, flowerY + 4, 2, 12);
  }
}

function drawCloud(cloudX, cloudY, cloudScale) {
  push();
  translate(cloudX, cloudY);
  scale(cloudScale);
  noStroke();
  fill(255, 255, 255, 220);
  ellipse(0, 12, 72, 30);
  ellipse(-22, 4, 38, 34);
  ellipse(4, -5, 48, 46);
  ellipse(29, 6, 36, 30);
  pop();
}

function windowResized() {
  const groundOffset = y - groundY;
  resizeCanvas(windowWidth, windowHeight);
  groundY = height * 0.76;
  y = groundY + groundOffset;
  x = constrain(x, 24, width - 24);
}

function keyPressed() {
  // 當按下鍵盤上鍵，且角色在地面上時觸發跳躍
  if (keyCode === UP_ARROW && y === groundY && state !== 'fall') {
    vy = jumpForce;
    state = 'jump';
    jumpFrameCounter = 0;
  }
  if (keyCode === DOWN_ARROW && y === groundY && state !== 'jump' && state !== 'fall' && state !== 'fallen') {
    state = 'fall';
    fallFrameCounter = 0;
  }
}