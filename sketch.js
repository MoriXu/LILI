/*
NAME: Zhuangqi Xu
DATE: 7th Jan 2026
*/

let PAGE = { P1: 0, P2: 1, P3: 2, P4: 3 };
let page = PAGE.P1;
let dayT = 0; // 0..1
let dayDurationSec = 75;
let dayJustEnded = false;
let img = {};
let ui = {
  margin: 28,
  clockR: 42,
};

let p1Btn = { x: 0, y: 0, w: 0, h: 0 }; //p1
let p1Ball = {
  x: 0,
  y: 0,
  vx: 0,
  size: 0,
  angle: 0,
  targetX: 0,
  entering: true,
}; //rolling ball p1
let yarnBalls = [];
let yarnCaught = 0;
let YARN_TARGET = 15;
let YARN_COUNT = 3; //p2
let p2PawPressed = false; //paw p2
let scratchLayer;
let scratchProgress = 0;
let scratchCount = 0;
let SCRATCH_TARGET = 50;
let lastX = 0;
let lastY = 0;
let useLeftPaw = true; //p3

let SCRATCH_STEP = 260;
let SCRATCH_STRIPES = 6;
let SCRATCH_GAP = 7;
let SCRATCH_JITTER = 2.2;

let endedByTime = false; //p4
let p4Ball = {
  x: 0,
  y: 0,
  startX: 0,
  targetX: 0,
  size: 0,
  t: 0,
  speed: 0.012,
  angle: 0,
  done: false,
};

let p1IntroText =
  "Lili is a cat who loves chasing yarn and scratching walls.\n\n" +
  "Do you want to try living through a day as Lili?\n" +
  "Maybe it starts with clicking “BECOME LILI.”"; //intro p1

let p4EndText =
  "Lili’s day has passed, and you are human again.\n\n" +
  "A cat’s world is always a little strange—tiny things people ignore can keep them curious all day long.\n\n" +
  "Maybe next time, as a human, spend a little more time with your cat."; //end p4

let p4HintText = "Press any key to return";

function loadImg(path) {
  return loadImage(
    path,
    () => console.log("loaded:", path),
    (err) => console.error("failed:", path, err)
  );
}

function preload() {
  img.p1ball = loadImg("assets/p1ball.png");
  img.p1button = loadImg("assets/p1button.png");
  img.p1cat = loadImg("assets/p1cat.png");
  img.p1title = loadImg("assets/p1title.png");
  img.p2ball = loadImg("assets/p2ball.png");
  img.p2paw = loadImg("assets/p2cat_hand.png");
  img.p2pawDown = loadImg("assets/p2cat_hand02.png");
  img.p3left = loadImg("assets/p3left.png");
  img.p3right = loadImg("assets/p3right.png");
  img.p4cat = loadImg("assets/p4cat.png");
  img.p4ball = loadImg("assets/p4ball.png");
  img.bg = loadImg("assets/background.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  textFont("Georgia");
  enterPage1();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  if (page === PAGE.P1) initP1Ball();
  if (page === PAGE.P2) initYarnBalls();

  if (page === PAGE.P3) {
    scratchLayer = createGraphics(width, height);
    scratchLayer.clear();
    scratchProgress = 0;
    scratchCount = 0;
  }

  if (page === PAGE.P4) initP4Ball();
}

function draw() {
  if (page === PAGE.P2 || page === PAGE.P3) {
    updateCatDay();
    drawBackgroundImage();
    if (dayJustEnded) enterPage4(true);
  } else {
    background(255);
    dayJustEnded = false;
  }

  if (page === PAGE.P1) drawPage1();
  else if (page === PAGE.P2) drawPage2();
  else if (page === PAGE.P3) drawPage3();
  else if (page === PAGE.P4) drawPage4();

  if (page === PAGE.P2 || page === PAGE.P3) {
    drawClockUI();
  }
}

function updateCatDay() {
  let dt = deltaTime / 1000;
  dayJustEnded = false;
  dayT += dt / dayDurationSec;

  if (dayT >= 1) {
    dayT = dayT % 1;
    dayJustEnded = true;
  }
} //time clock

function drawBackgroundImage() {
  let iw = img.bg.width;
  let ih = img.bg.height;
  let cw = width;
  let ch = height;

  let scale = max(cw / iw, ch / ih);
  let dw = iw * scale;
  let dh = ih * scale;

  imageMode(CENTER);
  image(img.bg, cw / 2, ch / 2, dw, dh);
}

function enterPage1() {
  page = PAGE.P1;
  cursor(ARROW);
  initP1Ball();
}

function initP1Ball() {
  p1Ball.size = min(width, height) * 0.12;
  p1Ball.y = height * 0.88;

  p1Ball.x = -p1Ball.size * 0.6;
  p1Ball.targetX = width * 0.78; //near cat feet area
  p1Ball.vx = max(2.0, width * 0.0028);
  p1Ball.angle = 0;
  p1Ball.entering = true;
}

function drawPage1() {
  let cx = width / 2;

  let titleW = min(width * 0.42, 520);
  let titleH = titleW * (img.p1title.height / img.p1title.width);
  let titleY = height * 0.38;
  let titleLeft = cx - titleW / 2;
  let safeGap = max(28, width * 0.025); //control the title area

  push();
  fill(0);
  textAlign(LEFT, TOP);
  textSize(20);

  let textX = width * 0.08;
  let textY = height * 0.22;

  let maxTextW = max(140, titleLeft - safeGap - textX);
  let textBoxW = min(maxTextW, width * 0.34);

  if (textBoxW < 220) {
    textY = height * 0.18;
    textBoxW = max(220, textBoxW);
    textBoxW = min(textBoxW, maxTextW);
  }

  let textBoxH = height * 0.62;
  text(p1IntroText, textX, textY, textBoxW, textBoxH);
  pop();

  image(img.p1title, cx, titleY, titleW, titleH); //title

  let btnW = min(width * 0.22, 240);
  let btnH = btnW * (img.p1button.height / img.p1button.width);
  p1Btn.x = cx;
  p1Btn.y = height * 0.66;
  p1Btn.w = btnW;
  p1Btn.h = btnH;
  image(img.p1button, p1Btn.x, p1Btn.y, btnW, btnH);

  if (isOverCenterRect(mouseX, mouseY, p1Btn.x, p1Btn.y, btnW, btnH)) {
    cursor("pointer");
  } else {
    cursor(ARROW);
  }

  let catH = min(height * 0.86, 760);
  let catW = catH * (img.p1cat.width / img.p1cat.height);
  image(img.p1cat, width * 0.84, height * 0.56, catW, catH);

  updateAndDrawP1Ball();
}

function updateAndDrawP1Ball() {
  if (p1Ball.entering) {
    let prevX = p1Ball.x;
    p1Ball.x += p1Ball.vx;

    let dx = p1Ball.x - prevX;
    p1Ball.angle += dx * 0.02;

    if (p1Ball.x >= p1Ball.targetX) {
      p1Ball.x = p1Ball.targetX;
      p1Ball.vx = 0;
      p1Ball.entering = false;
    }
  } else {
    let pushRange = 160;
    let d = abs(mouseX - p1Ball.x);

    if (d < pushRange) {
      let dir = mouseX > p1Ball.x ? 1 : -1;
      let force = map(d, 0, pushRange, 0.55, 0);
      let moveBoost = constrain((mouseX - pmouseX) * 0.02, -0.35, 0.35);
      p1Ball.vx += dir * force + moveBoost;
    }

    p1Ball.vx *= 0.94;

    let prevX = p1Ball.x;
    p1Ball.x += p1Ball.vx;

    let dx = p1Ball.x - prevX;
    p1Ball.angle += dx * 0.03;

    p1Ball.x = constrain(
      p1Ball.x,
      p1Ball.size * 0.5,
      width - p1Ball.size * 0.5
    );
  }

  push();
  translate(p1Ball.x, p1Ball.y);
  rotate(p1Ball.angle);
  image(img.p1ball, 0, 0, p1Ball.size, p1Ball.size);
  pop();
}

//p2 yarn
class YarnBall {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.r = 20;
    this.size = 60;
    this.angle = random(TWO_PI);
    this.spin = random(-0.08, 0.08);
    this.respawn(true);
  }


  respawn(wideScatter = false) {
    let size = min(width, height) * 0.085;
    this.size = size;
    this.r = size * 0.35; //based speed

    let margin = wideScatter ? 170 : 110;
    let side = floor(random(4));

    let tx = random(width * 0.22, width * 0.78);
    let ty = random(height * 0.22, height * 0.78);

    if (side === 0) {
      this.x = random(-margin, width + margin);
      this.y = -margin;
    } else if (side === 1) {
      this.x = width + margin;
      this.y = random(-margin, height + margin);
    } else if (side === 2) {
      this.x = random(-margin, width + margin);
      this.y = height + margin;
    } else {
      this.x = -margin;
      this.y = random(-margin, height + margin);
    }

    let dx = tx - this.x;
    let dy = ty - this.y;
    let len = max(1, sqrt(dx * dx + dy * dy));
    let ux = dx / len;
    let uy = dy / len;

    let baseSpeed = random(4.0, 6.0); // here to change speed
    this.vx = ux * baseSpeed + random(-0.5, 0.5);
    this.vy = uy * baseSpeed + random(-0.5, 0.5);

    this.angle = random(TWO_PI);
    this.spin = random(-0.08, 0.08);
  }

  update(speedBoost = 1) {
    let dx = this.vx * speedBoost;
    let dy = this.vy * speedBoost;

    this.x += dx;
    this.y += dy;

    let v = sqrt(dx * dx + dy * dy);
    this.angle += (v / max(10, this.r)) * 0.9 + this.spin;

    let far = 280;
    if (
      this.x < -far ||
      this.x > width + far ||
      this.y < -far ||
      this.y > height + far
    ) {
      this.respawn(false);
    }
  }

  draw() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    image(img.p2ball, 0, 0, this.size, this.size);
    pop();
  }

  isHit(mx, my) {
    return dist(mx, my, this.x, this.y) < this.r;
  }
}

function enterPage2() {
  page = PAGE.P2;
  yarnCaught = 0;
  dayT = 0;
  p2PawPressed = false;
  initYarnBalls();
}

function initYarnBalls() {
  yarnBalls = [];
  for (let i = 0; i < YARN_COUNT; i++) {
    yarnBalls.push(new YarnBall());
  }
}

function drawPage2() {
  push();
  fill(0);
  textAlign(LEFT, TOP);
  textSize(22);
  text(`Caught: ${yarnCaught}/${YARN_TARGET}`, ui.margin, ui.margin);
  pop();

  let speedBoost = 1;

  for (let i = 0; i < yarnBalls.length; i++) {
    yarnBalls[i].update(speedBoost);
    yarnBalls[i].draw();
  }

  let pawImg;
  if (p2PawPressed) {
    pawImg = img.p2pawDown;
  } else {
    pawImg = img.p2paw;
  }

  noCursor();
  image(
    pawImg,
    mouseX,
    mouseY,
    min(width, height) * 0.18,
    min(width, height) * 0.18
  );
}

function handlePage2Press() {
  for (let i = 0; i < yarnBalls.length; i++) {
    let b = yarnBalls[i];
    if (b.isHit(mouseX, mouseY)) {
      yarnCaught++;
      b.respawn(false);
      if (yarnCaught >= YARN_TARGET) enterPage3();
      return;
    }
  }
} 

//p3 scratch
function enterPage3() {
  page = PAGE.P3;
  scratchLayer = createGraphics(width, height);
  scratchLayer.clear();
  scratchProgress = 0;
  scratchCount = 0;
}

function drawPage3() {
  imageMode(CORNER);
  image(scratchLayer, 0, 0);
  imageMode(CENTER);

  push();
  fill(0);
  textAlign(LEFT, TOP);
  textSize(22);
  text(`Scratches: ${scratchCount}/${SCRATCH_TARGET}`, ui.margin, ui.margin);
  pop();

  noCursor();
  let paw = useLeftPaw ? img.p3left : img.p3right;
  image(
    paw,
    mouseX,
    mouseY,
    min(width, height) * 0.16,
    min(width, height) * 0.16
  );
}

function mouseDragged() {
  if (page !== PAGE.P3) return;

  let d = dist(lastX, lastY, mouseX, mouseY);
  scratchProgress += d;

  drawClawStripes(lastX, lastY, mouseX, mouseY);

  while (scratchProgress >= SCRATCH_STEP) {
    scratchProgress -= SCRATCH_STEP;
    scratchCount++;
    useLeftPaw = !useLeftPaw;

    if (scratchCount >= SCRATCH_TARGET) {
      enterPage4(false);
      break;
    }
  }

  lastX = mouseX;
  lastY = mouseY;
}

function drawClawStripes(x1, y1, x2, y2) {
  let ang = atan2(y2 - y1, x2 - x1);
  let nx = cos(ang + HALF_PI);
  let ny = sin(ang + HALF_PI);

  scratchLayer.push();
  scratchLayer.noFill();
  scratchLayer.stroke(218, 170, 80, 210);
  scratchLayer.strokeWeight(2.4);

  for (let i = 0; i < SCRATCH_STRIPES; i++) {
    let offset = (i - (SCRATCH_STRIPES - 1) / 2) * SCRATCH_GAP;

    let jx1 = random(-SCRATCH_JITTER, SCRATCH_JITTER);
    let jy1 = random(-SCRATCH_JITTER, SCRATCH_JITTER);
    let jx2 = random(-SCRATCH_JITTER, SCRATCH_JITTER);
    let jy2 = random(-SCRATCH_JITTER, SCRATCH_JITTER);

    scratchLayer.line(
      x1 + nx * offset + jx1,
      y1 + ny * offset + jy1,
      x2 + nx * offset + jx2,
      y2 + ny * offset + jy2
    );
  }

  scratchLayer.pop();
}

//p4 end
function enterPage4(byTime) {
  page = PAGE.P4;
  endedByTime = byTime;
  cursor(ARROW);
  initP4Ball();
}

function initP4Ball() {
  p4Ball.size = min(width, height) * 0.14;
  p4Ball.startX = width * 0.38;
  p4Ball.targetX = width * 0.86;
  p4Ball.x = p4Ball.startX;
  p4Ball.y = height * 0.92;
  p4Ball.t = 0;
  p4Ball.angle = 0;
  p4Ball.done = false;
}

function drawPage4() {
  background(255);

  let catH = min(height * 0.92, 820);
  let catW = catH * (img.p4cat.width / img.p4cat.height);
  image(img.p4cat, width * 0.26, height * 0.6, catW, catH);

  updateAndDrawP4Ball();

  let boxW = min(width * 0.42, 620);
  let boxH = min(height * 0.5, 420);
  let boxX = width * 0.73;
  let boxY = height * 0.37;

  push();
  fill(60);
  textAlign(LEFT, TOP);
  textSize(20);
  let pad = 26;
  text(
    p4EndText,
    boxX - boxW / 2 + pad,
    boxY - boxH / 2 + pad,
    boxW - pad * 2,
    boxH - pad * 2
  );
  pop();

  push();
  fill(90);
  textAlign(CENTER, CENTER);
  textSize(18);
  text(p4HintText, width * 0.73, height * 0.74);
  pop();
}

function updateAndDrawP4Ball() {
  if (!p4Ball.done) {
    p4Ball.t = min(1, p4Ball.t + p4Ball.speed);
    let ease = easeOutCubic(p4Ball.t);
    let prevX = p4Ball.x;
    p4Ball.x = lerp(p4Ball.startX, p4Ball.targetX, ease);

    let dx = p4Ball.x - prevX;
    p4Ball.angle += dx * 0.02;

    if (p4Ball.t >= 1) p4Ball.done = true;
  }

  push();
  translate(p4Ball.x, p4Ball.y);
  rotate(p4Ball.angle);
  image(img.p4ball, 0, 0, p4Ball.size, p4Ball.size);
  pop();
}

function easeOutCubic(t) {
  return 1 - pow(1 - t, 3);
}

//input
function mousePressed() {
  if (
    page === PAGE.P1 &&
    isOverCenterRect(mouseX, mouseY, p1Btn.x, p1Btn.y, p1Btn.w, p1Btn.h)
  ) {
    enterPage2();
  } else if (page === PAGE.P2) {
    p2PawPressed = true; //show pressed paw
    handlePage2Press();
  }

  lastX = mouseX;
  lastY = mouseY;
}

function mouseReleased() {
  if (page === PAGE.P2) {
    p2PawPressed = false; //back to normal paw
  }
}

//returns to p1
function keyPressed() {
  if (page === PAGE.P4) {
    enterPage1();
  }
}

//clock
function drawClockUI() {
  let cx = width - ui.margin - ui.clockR;
  let cy = ui.margin + ui.clockR;
  let r = ui.clockR;

  noFill();
  stroke(0, 140);
  ellipse(cx, cy, r * 2);

  let a = TWO_PI * dayT - HALF_PI;
  line(cx, cy, cx + cos(a) * r * 0.75, cy + sin(a) * r * 0.75);
}

function isOverCenterRect(px, py, cx, cy, w, h) {
  return (
    px > cx - w / 2 && px < cx + w / 2 && py > cy - h / 2 && py < cy + h / 2
  );
}
