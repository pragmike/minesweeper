import React from "react";
import "./App.css";
import logo from "./logo.svg";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.maxFlagNbr = 10;
    this.maxOpenedCells = 62;
    this.openedCells = 0;
    this.bombIsOpened = false;
    this.gameStatus = "ready";

    this.state = {
      gameField: this.createGameField(),
      flagsNbr: 0,
      gameTimer: 0,
    };
    // this.startTimer();

    this.cellOnClick = this.cellOnClick.bind(this);
    this.cellOnRightClick = this.cellOnRightClick.bind(this);
    this.restartGame = this.restartGame.bind(this);
  }

  startTimer() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  tick() {
    this.setState({ gameTimer: this.state.gameTimer + 1 });
  }

  stopTimer() {
    clearInterval(this.timerID);
  }

  checkGameStatus() {
    if ((this.gameStatus = "started")) {
      if (this.bombIsOpened) {
        this.gameStatus = "gameover";
        // alert("You lose!!");
        this.stopTimer();
      } else {
        if (
          this.openedCells == this.maxOpenedCells &&
          this.state.flagsNbr == this.maxFlagNbr
        ) {
          this.gameStatus = "gamewin";
          alert("You win!!");
          this.stopTimer();
        }
      }
    }
  }

  restartGame() {
    this.stopTimer();

    this.openedCells = 0;
    this.bombIsOpened = false;
    this.gameStatus = "ready";

    this.setState({
      gameField: this.createGameField(),
      flagsNbr: 0,
      gameTimer: 0,
    });

    // this.startTimer();
  }

  openCellsAround(cell, gameField) {
    for (
      let row = Math.max(0, cell.row - 1);
      row <= Math.min(cell.row + 1, gameField.length - 1);
      row++
    ) {
      for (
        let col = Math.max(0, cell.col - 1);
        col <= Math.min(cell.col + 1, gameField[row].length - 1);
        col++
      ) {
        let targetCell = gameField[row][col];
        if (!targetCell.isOpened && !targetCell.isFlaged) {
          targetCell.isOpened = true;
          this.openedCells += 1;
          if (targetCell.bmbNeibr == 0) {
            this.openCellsAround(targetCell, gameField);
          }
        }
      }
    }
  }

  cellOnClick(row, col) {
    if (this.gameStatus == "ready") {
      this.startTimer();
      this.gameStatus = "started";
    }

    if (this.gameStatus == "started") {
      let cell = this.state.gameField[row][col];

      if (!cell.isOpened && !cell.isFlaged) {
        //открываем ячейку
        let newGameField = [...this.state.gameField];
        newGameField[row][col].isOpened = true;

        //если бомба
        if (cell.isBomb) {
          this.bombIsOpened = true;
        } else if (cell.bmbNeibr == 0) {
          //если ячейка пустая, надо открыть ячейки вокруг
          this.openCellsAround(cell, newGameField);
        }

        this.setState({
          gameField: newGameField,
        });

        this.openedCells += 1;
        this.checkGameStatus();
      }
    }
  }

  cellOnRightClick(row, col) {
    if (this.gameStatus == "ready") {
      this.startTimer();
      this.gameStatus = "started";
    }

    if (this.gameStatus == "started") {
      let cell = this.state.gameField[row][col];

      if (!cell.isOpened) {
        if (!cell.isFlaged) {
          //если уже установлено максимальное количество флагов, уходим
          if (this.state.flagsNbr == this.maxFlagNbr) return;

          // устанавливаем флаг
          let newGameField = [...this.state.gameField];
          newGameField[row][col].isFlaged = true;
          this.setState((state) => {
            return { gameField: newGameField, flagsNbr: state.flagsNbr + 1 };
          });
        } else {
          // снимаем флаг
          let newGameField = [...this.state.gameField];
          newGameField[row][col].isFlaged = false;
          this.setState((state) => {
            return { gameField: newGameField, flagsNbr: state.flagsNbr - 1 };
          });
        }
        this.checkGameStatus();
      }
    }
  }

  createGameField() {
    let gameField = Array(9);
    for (let i = 0; i < 9; i++) {
      gameField[i] = Array(8);
      for (let j = 0; j < 8; j++) {
        gameField[i][j] = new CellData(i, j);
      }
    }

    for (let n = 0; n < 10; n++) {
      let bRow = Math.floor(Math.random() * 9);
      let bCol = Math.floor(Math.random() * 8);

      if (gameField[bRow][bCol].isBomb) {
        n--;
        continue;
      }

      gameField[bRow][bCol].isBomb = true;

      //пометим ячейки вокруг бомбы
      for (
        let row = Math.max(0, bRow - 1);
        row <= Math.min(bRow + 1, gameField.length - 1);
        row++
      ) {
        for (
          let col = Math.max(0, bCol - 1);
          col <= Math.min(bCol + 1, gameField[row].length - 1);
          col++
        ) {
          if (!gameField[row][col].isBomb) {
            gameField[row][col].bmbNeibr++;
          }
        }
      }
    }

    return gameField;
  }

  render() {
    let classApp = "app-field";
    if (this.gameStatus == "gameover") {
      classApp += " gameover";
    }
    return (
      <div className="App">
        <div className={classApp}>
          <Header />
          <ControlPanel
            flagsNbr={this.maxFlagNbr - this.state.flagsNbr}
            timer={this.state.gameTimer}
            handleRestart={this.restartGame}
          />
          <Field
            gameField={this.state.gameField}
            handleClick={this.cellOnClick}
            handleRightClick={this.cellOnRightClick}
            gameStatus={this.gameStatus}
          />
        </div>
      </div>
    );
  }
}

class Header extends React.Component {
  render() {
    return (
      <header className="App-header">
        <h2>
          Minesweeper <img src={logo} className="App-logo" alt="logo" />
        </h2>
      </header>
    );
  }
}

class ControlPanel extends React.Component {
  render() {
    return (
      <div className="control-panel">
        <FlagCounter flagsNbr={this.props.flagsNbr} />
        <ButtonReset handleRestart={this.props.handleRestart} />
        <Timer timer={this.props.timer} />
      </div>
    );
  }
}

class FlagCounter extends React.Component {
  render() {
    return <div className="FlagCounter">{this.props.flagsNbr}</div>;
  }
}

class ButtonReset extends React.Component {
  render() {
    return (
      <a className="ButtonReset" onClick={this.props.handleRestart} href="#">
        Reset
      </a>
    );
  }
}

class Timer extends React.Component {
  render() {
    let min = Math.floor(this.props.timer / 60);
    let sec = String(this.props.timer % 60).padStart(2, "0");
    return <div className="Timer">{`${min}:${sec}`}</div>;
  }
}

class Field extends React.Component {
  render() {
    let rows = this.props.gameField.map((currentRow, indRow) => {
      let cells = currentRow.map((currentCell, indCol) => {
        return (
          <Cell
            key={indCol}
            row={currentCell.row}
            col={currentCell.col}
            isBomb={currentCell.isBomb}
            isOpened={currentCell.isOpened}
            isFlaged={currentCell.isFlaged}
            bmbNeibr={currentCell.bmbNeibr}
            handleClick={this.props.handleClick}
            handleRightClick={this.props.handleRightClick}
            gameStatus={this.props.gameStatus}
          />
        );
      });
      return (
        <div className="row" key={indRow}>
          {cells}
        </div>
      );
    });
    return <div className="field">{rows}</div>;
  }
}

class Cell extends React.Component {
  constructor(props) {
    super(props);

    this.cellOnClick = this.cellOnClick.bind(this);
    this.cellOnRightClick = this.cellOnRightClick.bind(this);
  }
  cellOnClick(e) {
    this.props.handleClick(this.props.row, this.props.col);
  }

  cellOnRightClick(e) {
    e.preventDefault();
    this.props.handleRightClick(this.props.row, this.props.col);
  }

  render() {
    // const style = {};
    // if (this.props.isOpened) {
    //   style.backgroundColor = "#3d414c";
    // }
    // if (this.props.isBomb) {
    //   style.backgroundImage = 'url("./bmb2.png")';
    // }
    let cellClass = "cell";
    let buttonText = "";

    if (this.props.isOpened) {
      cellClass += " cellOpened";
      if (this.props.gameStatus == "gameover") {
        cellClass += " cell-gameover";
      }
      if (this.props.isBomb) {
        cellClass += " cellIsBomb";
      } else {
        if (this.props.bmbNeibr > 0) {
          buttonText = this.props.bmbNeibr;
        }
      }
    }
    if (this.props.isFlaged) {
      cellClass += " cellFlaged";
    }

    return (
      <button
        className={cellClass}
        onClick={this.cellOnClick}
        onContextMenu={this.cellOnRightClick}
      >
        {buttonText}
      </button>
    );
  }
}

class CellData {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.isBomb = false;
    this.bmbNeibr = 0;
    this.isOpened = false;
    this.isFlaged = false;
  }
}

export default App;
