//event
let spritesheet;
function setup() {
  createCanvas(windowWidth, windowHeight);
  spritesheet = loadImage("image.png");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
let movers = [];

function draw() {
  background(127);

  for (let i = 0; i < movers.length; i++) {
    // 중력은 여기서 mass(질량)에 따라 결정됩니다!
    let gravity = createVector(0, 0.1 * movers[i].mass);
    // 중력 적용하기
    movers[i].applyForce(gravity);

    // 업데이트하고 화면에 보이기(display)
    movers[i].update();
    movers[i].checkEdges();
    checkCollision();
    movers[i].display();
  }
}

function mousePressed() {
  movers.push(new Mover(3, mouseX, mouseY));
}

function Mover(m, x, y) {
  this.mass = m;
  this.position = createVector(x, y);
  this.velocity = createVector(0, 0);
  this.rotation = 0;
  this.theta = 0;
  this.acceleration = createVector(0, 0);
}
//충돌처리
function checkCollision() {
  for (let i = 0; i < movers.length; i++) {
    for (let j = 0; j < movers.length; j++) {
      if (i == j) {
        continue;
      }
      movers[i].checkCollision(movers[j]);
    }
  }
}

// 뉴턴(Newton)의 두번째 법칙: F = M * A
// 또는 A = F / M
Mover.prototype.applyForce = function (force) {
  let f = p5.Vector.div(force, this.mass);
  this.acceleration.add(f);
};

Mover.prototype.update = function () {
  // 가속도에 따라 변하는 속도
  this.velocity.add(this.acceleration);
  // 속도에 따라 변하는 위치
  this.position.add(this.velocity);
  this.rotation += this.theta;
  // 매 프레임마다 가속도 초기화
  this.acceleration.mult(0);
};

Mover.prototype.display = function () {
  push();
  imageMode(CENTER);
  translate(this.position.x, this.position.y);
  rotate(this.rotation);
  image(spritesheet, 0, 0, this.mass * 16, this.mass * 16);
  pop();
};

// 바닥면에서 튀어오르기
Mover.prototype.checkEdges = function () {
  if (this.position.y > height - this.mass * 8) {
    // 바닥면에 닿을 때 약간의 완충 현상 발생
    this.velocity.y *= -0.5;
    this.position.y = height - this.mass * 8;
  }
};
Mover.prototype.checkCollision = function (other) {
  const distance = p5.Vector.sub(other.position, this.position);
  const distanceMag = distance.mag();
  const minDistance = this.mass * 4 * this.mass;

  if (distanceMag < minDistance) {
    const distanceCorrection = (minDistance - distanceMag) / 2.0;
    const d = distance.copy();
    const correctionVector = d.normalize().mult(distanceCorrection);
    other.position.add(correctionVector);
    this.position.sub(correctionVector);

    const theta = distance.heading();
    const sine = sin(theta);
    const cosine = cos(theta);
    this.theta = theta * 0.01;
    other.theta = -theta * 0.01;

    let bTemp = [new p5.Vector(), new p5.Vector()];
    bTemp[1].x = cosine * distance.x + sine * distance.y;
    bTemp[1].y = cosine * distance.y - sine * distance.x;

    let vTemp = [new p5.Vector(), new p5.Vector()];

    vTemp[0].x = cosine * this.velocity.x + sine * this.velocity.y;
    vTemp[0].y = cosine * this.velocity.y - sine * this.velocity.x;
    vTemp[1].x = cosine * other.velocity.x + sine * other.velocity.y;
    vTemp[1].y = cosine * other.velocity.y - sine * other.velocity.x;

    let vFinal = [new p5.Vector(), new p5.Vector()];

    vFinal[0].x =
      ((this.mass - other.mass) * vTemp[0].x + 2 * other.mass * vTemp[1].x) /
      (this.mass + other.mass);
    vFinal[0].y = vTemp[0].y;
    vFinal[1].x =
      ((this.mass - other.mass) * vTemp[1].x + 2 * other.mass * vTemp[0].x) /
      (this.mass + other.mass);
    vFinal[1].y = vTemp[1].y;

    bTemp[0].x += vFinal[0].x;
    bTemp[1].x += vFinal[1].x;

    let bFinal = [new p5.Vector(), new p5.Vector()];

    bFinal[0].x = cosine * bTemp[0].x - sine * bTemp[0].y;
    bFinal[0].y = cosine * bTemp[0].y + sine * bTemp[0].x;
    bFinal[1].x = cosine * bTemp[1].x - sine * bTemp[1].y;
    bFinal[1].y = cosine * bTemp[1].y + sine * bTemp[1].x;
    // update balls to screen this.position
    other.position.x = this.position.x + bFinal[1].x;
    other.position.y = this.position.y + bFinal[1].y;

    this.position.add(bFinal[0]);

    // update velocities
    this.velocity.x = cosine * vFinal[0].x - sine * vFinal[0].y;
    this.velocity.y = cosine * vFinal[0].y + sine * vFinal[0].x;
    other.velocity.x = cosine * vFinal[1].x - sine * vFinal[1].y;
    other.velocity.y = cosine * vFinal[1].y + sine * vFinal[1].x;
  }
};

const d = document.getElementsByClassName("p5Canvas");
