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
    checkCollision();
    // 중력은 여기서 mass(질량)에 따라 결정됩니다!
    let gravity = createVector(0, 0.1 * movers[i].mass);
    // 중력 적용하기
    movers[i].applyForce(gravity);

    // 업데이트하고 화면에 보이기(display)
    movers[i].update();
    movers[i].checkEdges();
    movers[i].display();
  }
}

function mousePressed() {
  movers.push(new Mover(3, mouseX, mouseY));
}

function Mover(m, x, y) {
  this.mass = m;
  this.speed = 0.2;
  this.position = createVector(x, y);
  this.velocity = createVector(0, 0);
  this.rotation = 0;
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
    this.velocity.y *= -0.9;
    this.position.y = height - this.mass * 8;
  }
};
Mover.prototype.checkCollision = function (other) {
  const distance = p5.Vector.sub(other.position, this.position);
  const distanceMag = distance.mag();
  const minDistance = this.mass * 4 * this.mass;

  if (distanceMag < minDistance) {
    let dx = other.position.x - this.position.x;
    let dy = other.position.y - this.position.y;
    let distance = sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx);
    let targetX = this.position.x + Math.cos(angle) * minDistance;
    let targetY = this.position.y + Math.sin(angle) * minDistance;
    let ax = targetX - other.position.x;
    let ay = targetY - other.position.y;

    this.theta += Math.atan2(ay, ax) * this.speed;
    other.theta -= Math.atan2(ay, ax) * other.speed;

    this.acceleration = createVector(ax * this.speed, ay * this.speed);
    other.acceleration = createVector(ax * other.speed, ay * other.speed);
  }
};

const d = document.getElementsByClassName("p5Canvas");
