class Top5 {
  constructor() {
    this.scoreboard =
      localStorage.getItem("top5Brain") == null
        ? []
        : JSON.parse(localStorage.getItem("top5Brain"));

    console.table(this.scoreboard);
  }

  checkTop5(score, brain) {
    const record = new Record(score, brain);
    if (this.scoreboard.length < 5) {
      this.scoreboard.push(record);
      this.scoreboard = this.sort(this.scoreboard);
      localStorage.setItem("top5Brain", JSON.stringify(this.scoreboard));
    } else if (record.score > this.scoreboard[4].score) {
      this.scoreboard.pop();
      this.scoreboard.push(record);
      this.scoreboard = this.sort(this.scoreboard);
      localStorage.setItem("top5Brain", JSON.stringify(this.scoreboard));
    }
  }

  sort(scoreboard) {
    const length = scoreboard.length;

    if (length == 1) {
      return scoreboard;
    }
    for (i = 1; i < length; i++) {
      if (
        this.scoreboard[length - i].score <=
        this.scoreboard[length - (i + 1)].score
      ) {
        return scoreboard;
      } else {
        const tmpRecord = this.scoreboard[length - (i + 1)];
        this.scoreboard[length - (i + 1)] = this.scoreboard[length - i];
        this.scoreboard[length - i] = tmpRecord;
      }
    }

    return scoreboard;
  }
}

class Record {
  constructor(score, brain) {
    this.score = score;
    this.brain = brain;
  }
}
