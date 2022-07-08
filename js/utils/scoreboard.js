class Scoreboard {
  constructor() {
    this.bestScore =
      localStorage.getItem("bestScore") == null
        ? 0
        : localStorage.getItem("bestScore");

    this.tryCount =
      localStorage.getItem("tryCount") == null
        ? 0
        : localStorage.getItem("tryCount");

    this.lastFiveScores =
      JSON.parse(localStorage.getItem("scores")) == null
        ? []
        : JSON.parse(localStorage.getItem("scores"));

    this.lastFiveScoresAverage = this.getLastFiveScoresAverage();

    this.currentScore = 0;

    this.aliveCars = 0;

    this.bestScoreText = document.getElementById("best-score");
    this.tryCountText = document.getElementById("try-count");
    this.lastFiveScoresAverageText = document.getElementById("last-five-score");
    this.currentScoreText = document.getElementById("current-score");
    this.aliveCarText = document.getElementById("alive-cars");

    this.setScoreboard();
  }

  getLastFiveScoresAverage() {
    if (this.lastFiveScores.length == 0) {
      return 0;
    }

    let sum = 0;
    this.lastFiveScoresAverage = this.lastFiveScores.forEach((e) => (sum += e));
    return Math.floor(sum / this.lastFiveScores.length);
  }

  setScoreboard() {
    this.bestScoreText.innerText = this.bestScore;
    this.tryCountText.innerText = this.tryCount;
    this.lastFiveScoresAverageText.innerText = this.lastFiveScoresAverage;
    this.currentScoreText.innerText = this.currentScore;
    this.aliveCarText.innerText = this.aliveCars;
  }

  updateBestScore(bestScore) {
    let _bestScore = Math.floor(bestScore);
    localStorage.setItem("bestScore", _bestScore);
    this.bestScore = _bestScore;
    this.bestScoreText.innerText = _bestScore;
  }
  addTryCount() {
    localStorage.setItem("tryCount", parseInt(this.tryCount) + 1);
    this.tryCountText.innerText = this.tryCount;
  }
  updateLastFive(score) {
    this.lastFiveScores.push(score);
    if (this.lastFiveScores.length > 5) {
      this.lastFiveScores.shift();
    }
    localStorage.setItem("scores", JSON.stringify(this.lastFiveScores));
  }
  updateScore(score) {
    this.currentScoreText.innerText = score > 0 ? Math.floor(score) : 0;
  }
  updateAliveCars(aliveCars) {
    this.aliveCarText.innerText = aliveCars;
  }

  reset() {
    localStorage.removeItem("bestBrain");
    localStorage.removeItem("bestScore");
    localStorage.removeItem("tryCount");
    localStorage.removeItem("scores");
  }
}
