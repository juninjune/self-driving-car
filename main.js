const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 400;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9, 3);

const traffic = [
  new Car(road.getLaneCenter(road.getRandomLane()), -150, 30, 50, "DUMMY", 2),
];
const genTrafficTerm = 4;
let genTrafficTime = genTrafficTerm;

const N = 500;
const cars = generateCars(N);

const top5 = new Top5();

let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      if (Math.random() < 0.05) {
        NeuralNetwork.mutate(cars[i].brain, 0.25);
      } else {
        NeuralNetwork.mutate(cars[i].brain, 0.1);
      }
    }
  }
}

const top5Brains = [];

let bestScore =
  localStorage.getItem("bestScore") == null
    ? 0
    : localStorage.getItem("bestScore");
const pastBestScore = bestScore;
const bestScoreText = document.getElementById("best-score");

let currentScore = 0;
const currentScoreText = document.getElementById("current-score");

let isTrainMode = JSON.parse(localStorage.getItem("isTraining"));
const trainingTime = 100;

animate();

function clearBestScore() {
  localStorage.setItem("bestScore", 0);
  localStorage.removeItem("top5Brain");
  bestScore = 0;
}

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function activeTrain() {
  isTrainMode = true;
  localStorage.setItem("isTraining", true);
}

function deactiveTrain() {
  isTrainMode = false;
  localStorage.setItem("isTraining", false);
}

function generateCars(N) {
  const cars = [];
  for (let i = 0; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

function generateDummy() {
  const randomLane = Math.floor(Math.random() * road.laneCount);
  traffic.push(
    new Car(
      road.getLaneCenter(randomLane),
      bestCar.y - 400,
      30,
      50,
      "DUMMY",
      Math.random() + 0.7
    ),
    new Car(
      road.getLaneCenter((randomLane + 1) % road.laneCount),
      bestCar.y - 400,
      30,
      50,
      "DUMMY",
      Math.random() + 0.7
    )
  );
}

function animate(time) {
  let isAnyCarAlive = false;
  for (i = 0; i < cars.length; i++) {
    if (cars[i].damaged == false) {
      isAnyCarAlive = true;
    }
  }
  if (!isAnyCarAlive) {
    if (bestScore > pastBestScore) {
      save();
    }
    location.reload();
  }

  if (time / 1000 > genTrafficTime) {
    generateDummy();
    genTrafficTime += genTrafficTerm;
  }

  //if (time / 1000 > trainingTime && isTrainMode) {
  //  location.reload();
  //}

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
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
    traffic[i].draw(carCtx, "red");
  }
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx, "blue");
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true);

  carCtx.restore();

  if (-bestCar.y > bestScore) {
    bestScore = -bestCar.y;
    localStorage.setItem("bestScore", -bestCar.y);
  }
  bestScoreText.innerText = Math.floor(bestScore);

  currentScoreText.innerText =
    Math.floor(-bestCar.y) > 0 ? Math.floor(-bestCar.y) : 0;

  networkCtx.lineDashOffset = -time / 60;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
