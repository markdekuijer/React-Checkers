import React from 'react';
import { StyledBoard } from './styles/StyledBoard';
import Cell from './Cell';
import GameOverPanel from './GameOverPanel';
import GameOverButton from './GameOverButton';

const CreateBoard = () => {
    let cols = [];
    
    for (let y = 0; y < 10; y++) {
        let row = [];
        for (let x = 0; x < 10; x++) {
            row.push({
                cords: [x, y], 
                color: (x % 2 === 0 && y % 2 === 0) || (x % 2 !== 0 && y % 2 !== 0) ? "BurlyWood" : "white",
                highlighted: false,
                forced: false,
                canHit: false,
                usedBy: (x % 2 !== 0 && y % 2 === 0) || (x % 2 === 0 && y % 2 !== 0) ? "" : y < 4 ? "P1" : y > 5 ? "P2" : ""
            })
        }
        cols.push(row);
    }

    cols.reverse();
    
    return cols;
};

const initialState = {
    board: CreateBoard(),
    turn: "P1",
    finished: false,
    winner: "",
}



var lastSelectedCell;
var highlightedCells = [];
var hittableCells = [];
var cellsTohitFrom = [];
var killedSomeone;
var tempBoard;

class Checkers extends React.Component {    

    BackToMenu = () => { 
        console.log("Return"); 
    }

    RestartGame = () => { 
        console.log("Restart game");
        lastSelectedCell = undefined;
        highlightedCells = [];
        hittableCells = [];
        cellsTohitFrom = [];
        killedSomeone = false;
        tempBoard = undefined;

        this.setState({
            board: CreateBoard(),
            turn: initialState.turn,
            finished: initialState.finished,
            winner: initialState.winner,
        });
    }

    state = initialState;

    CellClick = (cellInfo) => {
        if(this.state.gameFinished) {
            return;
        }

        tempBoard = this.state.board;

        if(cellInfo.usedBy !== ""){
            if(cellInfo.usedBy !== this.state.turn){
                return;
            }

            highlightedCells.forEach(highlightedCell =>  highlightedCell.highlighted = false);
            highlightedCells = [];

            if(cellsTohitFrom.length > 0) {
                if(cellsTohitFrom.includes(cellInfo) === false){
                    return;
                }
            }

            lastSelectedCell = cellInfo;
            this.DoHightlight(cellInfo.cords, cellInfo.usedBy === "P1" ? true : false, true, true, false);
            if(cellInfo.king === true) {
                this.DoHightlight(cellInfo.cords, cellInfo.usedBy === "P1" ? false : true, true, true, false);
            }
        } else if (cellInfo.highlighted) {
            this.DoMove(cellInfo)
            lastSelectedCell = cellInfo;
        }

        if(hittableCells.length > 0){
            hittableCells.forEach(hittableCell => hittableCell.forced = true);

            highlightedCells.forEach(highlightedCell => {
                if(highlightedCell.forced === false) {
                    highlightedCell.highlighted = false;
                }
            });
        }

        this.setState({
            board: tempBoard,
        })
    }

    GetCell = (localCords) => {
        var worldCell = undefined;
        tempBoard.filter(function (col) {
            if(col[1].cords[1] === localCords[1]) {
                col.filter(function (cell) {
                    if(cell.cords[0] === localCords[0]){
                        worldCell = cell;
                    }
                })
            }
        })

        if(worldCell === undefined){
            console.log("Failed convertion from local to global cords")
        }

        console.log("from " + localCords);
        return worldCell;
    }

    DoHightlight = (cords, upwards, checkLeft, checkRight, secondSearch) => {
        //left
        if(cords[0] !== 0 && cords[1] !== (upwards ? 9 : 0) && checkLeft) {
            let cell = this.GetCell([cords[0] - 1, cords[1] + (upwards ? 1 : -1)]);

            if(cell.usedBy === ""){
                cell.highlighted = true;
                highlightedCells.push(cell);
            } else if (lastSelectedCell !== undefined && cell.usedBy !== lastSelectedCell.usedBy && secondSearch === false) {
                this.DoHightlight(cell.cords, upwards, true, false, true);
            }
        }

        //right
        if(cords[0] !== 9 && cords[1] !== (upwards ? 9 : 0) && checkRight) {
            let cell = this.GetCell([cords[0] + 1, cords[1] + (upwards ? 1 : -1)]);

            if(cell.usedBy === ""){
                cell.highlighted = true;
                highlightedCells.push(cell);
            } else if (lastSelectedCell !== undefined && cell.usedBy !== lastSelectedCell.usedBy && secondSearch === false) {
                this.DoHightlight(cell.cords, upwards, false, true, true);
            }
        }
    }

    FindForced = (fromCell, cords, upwards, checkLeft, checkRight, secondSearch) => {

        //left
        if(cords[0] !== 0 && cords[1] !== (upwards ? 9 : 0) && checkLeft) {
            let cell = this.GetCell([cords[0] - 1, cords[1] + (upwards ? 1 : -1)]);

            if(cell.usedBy === "" && secondSearch) {
                hittableCells.push(cell);
                cellsTohitFrom.push(fromCell);
                fromCell.canHit = true;
            } else if (cell.usedBy !== fromCell.usedBy && cell.usedBy !== "" && secondSearch === false) {
                this.FindForced(fromCell, cell.cords, upwards, true, false, true);
            }
        }

        //right
        if(cords[0] !== 9 && cords[1] !== (upwards ? 9 : 0) && checkRight) {
            let cell = this.GetCell([cords[0] + 1, cords[1] + (upwards ? 1 : -1)]);


            if(cell.usedBy === "" && secondSearch) {
                hittableCells.push(cell);
                cellsTohitFrom.push(fromCell);
                fromCell.canHit = true;
            } else if (cell.usedBy !== fromCell.usedBy && cell.usedBy !== "" && secondSearch === false) {
                this.FindForced(fromCell, cell.cords, upwards, false, true, true);
          }
        }
    }

    DoMove = (cellInfo) => {
        if(lastSelectedCell === undefined) {
            return;
        }

        //disable highlights and forced
        highlightedCells.forEach(highlightedCell =>  highlightedCell.highlighted = false);
        highlightedCells = [];

        hittableCells.forEach(hittableCell =>  hittableCell.forced = false);
        hittableCells = [];

        cellsTohitFrom.forEach(fromCell => fromCell.canHit = false);
        cellsTohitFrom = [];
        
        var killedCellCoords = [];
        if(Math.abs(cellInfo.cords[0] - lastSelectedCell.cords[0]) >= 2 || Math.abs(cellInfo.cords[1] - lastSelectedCell.cords[1]) >= 2) {
            killedSomeone = true;
            killedCellCoords.push((cellInfo.cords[0] + lastSelectedCell.cords[0]) * 0.5);
            killedCellCoords.push((cellInfo.cords[1] + lastSelectedCell.cords[1]) * 0.5);
        }

        //remove piece from old and place on new
        cellInfo.usedBy = lastSelectedCell.usedBy;
        cellInfo.king = lastSelectedCell.king;
        if((cellInfo.usedBy === "P1" && cellInfo.cords[1] === 9) || (cellInfo.usedBy === "P2" && cellInfo.cords[1] === 0)){
            cellInfo.king = true;
        }

        lastSelectedCell.usedBy = "";
        lastSelectedCell.king = false;
        lastSelectedCell = cellInfo;

        //find forced next moves
        if(killedSomeone){
            killedSomeone = false;
            this.GetCell(killedCellCoords).usedBy = "";
            this.FindForced(cellInfo, cellInfo.cords, cellInfo.usedBy === "P1" ? true : false, true, true, false);
            if(cellInfo.king) {
                this.FindForced(cellInfo, cellInfo.cords, cellInfo.usedBy === "P1" ? false : true, true, true, false);
            }
        }

        if(hittableCells.length > 0){
            hittableCells.forEach(hittableCell =>  hittableCell.forced = true);
            this.DoHightlight(cellInfo.cords, cellInfo.usedBy === "P1" ? true : false, true, true, false);
            if(cellInfo.king) {
                this.DoHightlight(cellInfo.cords, cellInfo.usedBy === "P1" ? false : true, true, true, false);
            }
        } else{
            this.SwitchTurn();    
        }
    }

    SwitchTurn() {
        killedSomeone = false;
        var previousTurn = this.state.turn;
        var currrentTurn;
        if(hittableCells.length === 0) {
            if(previousTurn === "P1") {
                currrentTurn = "P2";
            } else {
                currrentTurn = "P1";
            }
        }

        var tilesToCheck = [];
        this.state.board.filter(function (col) {
            col.filter(function (cell) {
                if(cell.usedBy === currrentTurn){
                    tilesToCheck.push(cell);
                }
            })
        })

        if(tilesToCheck.length === 0) {
            this.setState({
                winner: previousTurn,
                finished: true,
            });

            console.log(previousTurn + "Won the game");
        }

        tilesToCheck.forEach(cell => {
            this.FindForced(cell, cell.cords, currrentTurn === "P1" ? true : false, true, true, false);
            if(cell.king) {
                this.FindForced(cell, cell.cords, currrentTurn === "P1" ? false : true, true, true, false);
            }
        })

        hittableCells.forEach(hittableCell =>  hittableCell.forced = true);

        this.setState({
            turn: currrentTurn,
        })
    }


    render() {

        var gameOverUI = "";
        if(this.state.finished) {
            gameOverUI = [
                <GameOverPanel winner={this.state.winner}/>,
                <GameOverButton callback={this.BackToMenu} text="Return" left="15"/>,
                <GameOverButton callback={this.RestartGame} text="Rematch" left="55"/>
            ]
        }

        return (
            <div className="checkerContainer">
                <StyledBoard>
                    {this.state.board.map(row => row.map((cell, x) => <Cell key={x} onCellClick={this.CellClick} cellInfo={cell}/>))}
                </StyledBoard> 
                {gameOverUI}   

            </div>

        );
    }
};

export default Checkers;