const trafficSpeed = 1.5;
const trafficQuantity = 4;

const carQuantity = 500;
const mutateFrequency = 0.05;
const mutateHigh = 0.5;
const mutateLow = 0.1;

//이미지 그릴 캔버스 준비
//carCanvas : 도로와 차
//networkCanvas : 신경망 시각화
const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
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
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3);

// ai 자동차 생성
const cars = generateCars(carQuantity);

// ai brain 설정
let bestCar = cars[0];
//로컬저장소에 bestBrain이 저장되어있으면 모든 차에 부여. 아니면 랜덤으로 설정되어있음.
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

// car 객체의 update 가 정리가 좀 필요합니다.

//초기 traffic 생성
const traffic = [
  new Car(road.getLaneCenter(0), 250, 30, 50, "START", 2),
  new Car(road.getLaneCenter(1), 250, 30, 50, "START", 2),
  new Car(road.getLaneCenter(2), 250, 30, 50, "START", 2),
];
traffic.push(...MakeTraffic(100, 150, 3));

function MakeTraffic(distance, distanceTerm, count) {
  const newTraffic = [];
  for (let i = 0; i < count; i++) {
    newTraffic.push(
      new Car(
        road.getLaneCenter(road.getRandomLane()),
        bestCar.y - distance - distanceTerm * i,
        30,
        50,
        "DUMMY",
        gaussianRand() - 0.5 + trafficSpeed
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

function generateCars(N) {
  const cars = [];
  for (let i = 0; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

function getAliveCarCount() {
  let aliveCarCount = 0;
  for (i = 0; i < cars.length; i++) {
    if (!cars[i].damaged) aliveCarCount++;
  }
  return aliveCarCount;
}

animate();

function animate(time) {
  const score = -bestCar.y;

  scoreboard.updateScore(score);

  const aliveCarCount = getAliveCarCount();
  scoreboard.updateAliveCars(aliveCarCount);

  //모든 ai차가 죽었을 경우,
  if (aliveCarCount == 0) {
    if (score > scoreboard.getLastFiveScoresAverage()) {
      saveBrain();
    }
    scoreboard.updateLastFive(score);
    scoreboard.addTryCount();
    location.reload();
  }

  if (traffic.length - 3 < trafficQuantity) {
    // ㅇㅣㄱㅓ ㄲㅗㄱ ㄱㅗㅊㅕㅇㅑㅎㅐㅇㅛ. out START value
    traffic.push(...MakeTraffic(750, 0, 1));
  }

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, [], bestCar, traffic);
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic, bestCar);
  }
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

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
  cars[0].draw(carCtx, "red", false);
  carCtx.globalAlpha = 0.9;
  bestCar.draw(carCtx, color.aiCarColor, true);

  carCtx.restore();

  if (score > scoreboard.bestScore) {
    scoreboard.updateBestScore(score);
  }

  networkCtx.lineDashOffset = -time / 60;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
