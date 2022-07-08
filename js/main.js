//AI Settings
const carQuantity = 500;
//변종 출현 빈도
const mutateFrequency = 0.075;
//변종의 변화도 (0~1)
const mutateHigh = 0.4;
// 일반 자손의 변화도 (0~1)
const mutateLow = 0.1;

// Car Settings
const maxSpeed = 3;
const rayCount = 5;
const raySpread = Math.PI / 2;

// Road Settings
const laneCount = 3;

//#region SETUP
//이미지 캔버스 준비
//carCanvas : 도로와 차
//networkCanvas : 신경망
const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 20 + laneCount * 60;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 400;

//캔버스에서 사용할 컬러 팔레트
const color = new Color();

//각 캔버스 컨텍스트
const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

// 점수판 초기화
const scoreboard = new Scoreboard();

//도로 초기화 (위치, 너비, 래인수)
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, laneCount);

// ai 자동차 생성
const cars = generateCars(carQuantity);

// ai brain 설정
let bestCar = cars[0];
setBrain(cars);

//초기 traffic 생성
const trafficSpeed = 1.5;
const traffic = [];

for (let i = 0; i < laneCount; i++) {
  traffic.push(new Car(road.getLaneCenter(i), 250, 30, 50, "START", 2.5));
}

// traffic customize
const trafficQuantity = 9;
traffic.push(...makeTraffic(180, 150, 7));
traffic.push(...makeTraffic(180, 450, 2));
//#endregion

//#region Methods

function generateCars(N) {
  const cars = [];
  for (let i = 0; i <= N; i++) {
    cars.push(
      new Car(
        road.getLaneCenter(Math.floor(laneCount / 2)),
        100,
        30,
        50,
        "AI",
        maxSpeed,
        raySpread,
        rayCount
      )
    );
  }
  return cars;
}

function setBrain(cars) {
  if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
      cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
      if (i != 0) {
        if (Math.random() < mutateFrequency) {
          NeuralNetwork.mutate(cars[i].brain, mutateHigh); // 변종 출현
        } else {
          NeuralNetwork.mutate(cars[i].brain, mutateLow); // 약간 변화함
        }
      }
    }
  }
}

function makeTraffic(distance, distanceTerm, count) {
  const newTraffic = [];
  for (let i = 0; i < count; i++) {
    newTraffic.push(
      new Car(
        road.getLaneCenter(road.getRandomLane()),
        bestCar.y - distance - distanceTerm * i,
        30,
        50,
        "DUMMY",
        trafficSpeed
      )
    );
  }
  return newTraffic;
}

function saveBrain() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function resetDatas() {
  scoreboard.reset();
  location.reload();
}

function getAliveCarCount() {
  let aliveCarCount = 0;
  for (i = 0; i < cars.length; i++) {
    if (!cars[i].damaged) aliveCarCount++;
  }
  return aliveCarCount;
}

//#endregion

animate();

function animate(time) {
  const score = -bestCar.y;

  scoreboard.updateScore(score);

  const aliveCarCount = getAliveCarCount();
  scoreboard.updateAliveCars(aliveCarCount);

  if (aliveCarCount == 0) {
    if (score > scoreboard.getLastFiveScoresAverage()) {
      saveBrain();
    }
    scoreboard.updateLastFive(score);
    scoreboard.addTryCount();
    location.reload();
  }

  if (score > scoreboard.bestScore) {
    scoreboard.updateBestScore(score);
  }

  if (traffic.length - laneCount < trafficQuantity) {
    traffic.push(...makeTraffic(750, 0, 1));
  }

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, [], bestCar, traffic);
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic, bestCar);
  }
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

  //#region Draw
  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  road.draw(carCtx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, color.dummyCarColor);
  }
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx, color.aiCarColor);
  }
  carCtx.globalAlpha = 0.5;
  cars[0].draw(carCtx, color.lastBestCarColor, false);
  carCtx.globalAlpha = 0.9;
  bestCar.draw(carCtx, color.aiCarColor, true);

  carCtx.restore();

  networkCtx.lineDashOffset = -time / 60;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  //#endregion

  requestAnimationFrame(animate);
}
