"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var globalTileCount = 0;
var totalTiles = 0;

function incGlobalTileCount(i, j) {
  globalTileCount++;
}

function decGlobalTileCount(i, j) {
  globalTileCount--;
}

var msgElement = null;
var startMsg = "Click Start Game to play.";

function setMessage(msg, color) {
  msgElement.innerHTML = msg;

  if (color) {
    msgElement.style.color = color;
  }
}

function resetMessage() {
  setMessage(startMsg, "black");
}

function showError(valueLimit) {
  if (valueLimit) {
    setMessage("Please enter a number between 1 and " + valueLimit, "red");
  } else {
    setMessage("That value conflicts with another value in the row, column, or square.", "red");
  }
}

var GameMaker =
/*#__PURE__*/
function () {
  function GameMaker(dimension) {
    _classCallCheck(this, GameMaker);

    this.tilesStack = [];
    this.dimension = dimension;
    var gameSize = dimension * dimension;
    this.gameSize = gameSize;
    this.numTiles = gameSize * gameSize;
    this.numInitTiles = this.getNumInitTiles(gameSize);
    this.totalSolvedTiles = 0; // Init this.solvedTiles.

    this.solvedTiles = new Array(gameSize);

    for (var i = 0; i < gameSize; i++) {
      this.solvedTiles[i] = [];

      for (var j = 0; j < gameSize; j++) {
        this.solvedTiles[i].push(0);
      }
    }

    this.triedValues = new Array(gameSize);

    for (var _i = 0; _i < gameSize; _i++) {
      this.triedValues[_i] = [];

      for (var _j = 0; _j < gameSize; _j++) {
        this.triedValues[_i].push([]);
      }
    }
  }

  _createClass(GameMaker, [{
    key: "trySetTile",
    value: function trySetTile(tile) {
      var value = this.getRandomValue();
      var valueCount = this.getTriedLength(tile);
      var isValid = false;

      while (valueCount < this.gameSize) {
        if (!this.isTried(tile, value)) {
          isValid = this.isValidTile(tile, value);
          this.addTried(tile, value);

          if (isValid) {
            return value;
          }
        }

        value = this.getNextValue(value);
        valueCount++;
      }

      return 0;
    }
  }, {
    key: "setTile",
    value: function setTile(tile) {
      if (this.totalSolvedTiles % 10 === 0) {
        log(this.totalSolvedTiles);
      }

      if (this.totalSolvedTiles === this.numTiles) {
        return true;
      }

      if (tile === undefined) {
        tile = this.getRandomTile();
      } else {
        // Find an empty tile.
        if (this.totalSolvedTiles < this.numInitTiles) {
          tile = this.getRandomTile();

          while (!this.isEmptyTile(tile)) {
            tile = this.getRandomTile();
          }
        } else {
          tile = this.getNextEmptyTile(tile);
        }
      }

      this.tilesStack.push(tile);
      var value = this.trySetTile(tile);

      while (value !== 0) {
        this.setSolvedTile(tile, value);

        if (this.setTile(tile)) {
          return true;
        } else {
          this.undoNextTile();
        }

        value = this.trySetTile(tile);
      } // Unset tile.


      this.unsetSolvedTile(tile);
      return false;
    }
  }, {
    key: "undoNextTile",
    value: function undoNextTile() {
      var nextTile = this.tilesStack.pop();
      var i = nextTile[0];
      var j = nextTile[1];
      this.triedValues[i][j].length = 0;
    }
  }, {
    key: "addTried",
    value: function addTried(tile, value) {
      var i = tile[0];
      var j = tile[1];
      this.triedValues[i][j].push(value);
    }
  }, {
    key: "isTried",
    value: function isTried(tile, value) {
      var i = tile[0];
      var j = tile[1];
      return this.triedValues[i][j].includes(value);
    }
  }, {
    key: "getTriedLength",
    value: function getTriedLength(tile) {
      var i = tile[0];
      var j = tile[1];
      return this.triedValues[i][j].length;
    }
  }, {
    key: "initGame",
    value: function initGame() {
      this.setTile();
    }
  }, {
    key: "isValidTile",
    value: function isValidTile(tile, value) {
      return this.isValidValue(this.solvedTiles, tile[0], tile[1], value);
    }
  }, {
    key: "isValidValue",
    value: function isValidValue(matrix, row, column, value) {
      // If the new value is invalid, return false.
      if (value === NaN || value === undefined || value < 1 || value > this.gameSize) {
        return false;
      } // Check the new value against others in the row.


      for (var i = 0; i < this.gameSize; i++) {
        // Skip checking itself.
        if (i == column) {
          continue;
        }

        if (matrix[row][i] === value) {
          return false;
        }
      } // Check the new value against others in the column.


      for (var i = 0; i < this.gameSize; i++) {
        // Skip checking itself.
        if (i == row) {
          continue;
        }

        if (matrix[i][column] === value) {
          return false;
        }
      } // Check against the others in the square.


      var dimension = this.dimension;
      var rowSquare = Math.floor(row / dimension);
      var rowStart = rowSquare * dimension;
      var rowLimit = rowStart + dimension;
      var columnSquare = Math.floor(column / dimension);
      var columnStart = columnSquare * dimension;
      var columnLimit = columnStart + dimension;

      for (var _i2 = rowStart; _i2 < rowLimit; _i2++) {
        for (var j = columnStart; j < columnLimit; j++) {
          if (_i2 === row && j === column) {
            continue;
          }

          if (matrix[_i2][j] === value) {
            return false;
          }
        }
      }

      return true;
    }
  }, {
    key: "setSolvedTile",
    value: function setSolvedTile(tile, value) {
      this.solvedTiles[tile[0]][tile[1]] = value;
      this.totalSolvedTiles++;
    }
  }, {
    key: "unsetSolvedTile",
    value: function unsetSolvedTile(tile) {
      this.solvedTiles[tile[0]][tile[1]] = 0;
      this.totalSolvedTiles--;
    }
  }, {
    key: "getRandomValue",
    value: function getRandomValue() {
      var v;

      while (v === NaN || v === undefined) {
        v = Math.ceil(Math.random() * this.gameSize);
      }

      return v;
    }
  }, {
    key: "getNextValue",
    value: function getNextValue(value) {
      var next = value + 1;

      if (next > this.gameSize) {
        return 1;
      }

      return next;
    }
  }, {
    key: "getRandomTileNum",
    value: function getRandomTileNum() {
      var v;

      while (v === NaN || v === undefined) {
        v = Math.floor(Math.random() * this.gameSize);
      }

      return v;
    }
  }, {
    key: "getRandomTile",
    value: function getRandomTile() {
      var tile = [];
      tile[0] = this.getRandomTileNum();
      tile[1] = this.getRandomTileNum();
      return tile;
    }
  }, {
    key: "getNextTileNum",
    value: function getNextTileNum(i) {
      var next = i + 1;

      if (next >= this.gameSize) {
        return 0;
      }

      return next;
    }
  }, {
    key: "isEmptyTile",
    value: function isEmptyTile(tile) {
      return this.solvedTiles[tile[0]][tile[1]] === 0;
    }
  }, {
    key: "getNextEmptyTile",
    value: function getNextEmptyTile(tile) {
      var i = tile[0];
      var j = tile[1];
      var iCount = 0;

      while (this.solvedTiles[i][j] !== 0 && iCount < this.gameSize) {
        i = this.getNextTileNum(i);
        iCount++;
        var jCount = 0;

        while (this.solvedTiles[i][j] != 0 && jCount < this.gameSize) {
          j = this.getNextTileNum(j);
          jCount++;
        }
      }

      return [i, j];
    }
  }, {
    key: "getNumInitTiles",
    value: function getNumInitTiles(gameSize) {
      // Determine how many tiles to initiate.
      var v;

      while (v === NaN || v === undefined) {
        v = Math.round(gameSize * gameSize / 3.33);
      }

      return v;
    }
  }, {
    key: "getInitTiles",
    value: function getInitTiles() {
      var initTiles = new Array(this.gameSize);

      for (var i = 0; i < this.gameSize; i++) {
        initTiles[i] = [];

        for (var j = 0; j < this.gameSize; j++) {
          initTiles[i].push(0);
        }
      }

      var tile;

      for (var _i3 = 0; _i3 < this.numInitTiles; _i3++) {
        tile = this.tilesStack[_i3];
        initTiles[tile[0]][tile[1]] = this.solvedTiles[tile[0]][tile[1]];
      }

      return initTiles;
    }
  }]);

  return GameMaker;
}();

var TableInitializer =
/*#__PURE__*/
function () {
  function TableInitializer() {
    _classCallCheck(this, TableInitializer);

    this.dimension = 0;
    this.rowLength = 0;
    this.gameMaker = {};
    this.initTiles = [];
  }

  _createClass(TableInitializer, [{
    key: "setDimension",
    value: function setDimension(dimension) {
      this.dimension = Number(dimension);
      this.rowLength = this.dimension * this.dimension;
      this.gameMaker = new GameMaker(this.dimension);
      this.gameMaker.initGame();
      this.initTiles = this.gameMaker.getInitTiles();
    }
  }, {
    key: "toggleReadonly",
    value: function toggleReadonly(cellInput) {
      if (cellInput.getAttribute("readonly")) {
        cellInput.removeAttribute("readonly");
      } else {
        cellInput.setAttributeNode(document.createAttribute("readonly"));
      }
    } // Use this function to set a heavier border for cells that
    // are on the edges of the table or any of the sub-squares.
    // Array[ bottom/right, top/left ]

  }, {
    key: "isBigBorder",
    value: function isBigBorder(num) {
      num++;
      var borderArray = [false, false];
      var remainder = num % this.dimension;

      if (remainder <= 1) {
        borderArray[remainder] = true;
      }

      return borderArray;
    }
  }, {
    key: "getAndAddCells",
    value: function getAndAddCells(parent) {
      // Set up an array to hold the cells.
      var cellsArray = new Array(this.rowLength);

      for (var i = 0; i < this.rowLength; i++) {
        cellsArray[i] = new Array(this.rowLength);
      } // Initialize the table


      for (var i = 0; i < this.rowLength; i++) {
        // Create a new row.
        var row = parent.insertRow(i); // See if this row needs the big border.

        var rowBorderArray = this.isBigBorder(i);

        for (var j = 0; j < this.rowLength; j++) {
          // Create a new cell.
          var cell = row.insertCell(j);
          cellsArray[i][j] = cell; // Add some cell styling.

          var cellStyle = document.createAttribute("class");
          cellStyle.value = "cellStyle ";
          var columnBorderArray = this.isBigBorder(j);
          cellStyle.value += columnBorderArray[0] ? "borderRight " : "";
          cellStyle.value += columnBorderArray[1] ? "borderLeft " : "";
          cellStyle.value += rowBorderArray[0] ? "borderBottom " : "";
          cellStyle.value += rowBorderArray[1] ? "borderTop " : "";
          cell.setAttributeNode(cellStyle);
        }
      }

      return cellsArray;
    }
  }, {
    key: "setCellsInput",
    value: function setCellsInput(cellsArray, tilesArray) {
      var _this = this;

      var initTiles = this.gameMaker.getInitTiles();

      for (var i = 0; i < this.rowLength; i++) {
        var _loop = function _loop() {
          var cell = cellsArray[i][j]; // If it is initialized, set it as fixed content.

          if (initTiles[i][j] !== 0) {
            var cellContent = document.createElement("div");
            cellContent.innerHTML = initTiles[i][j];
            cellContent.setAttribute("class", "initializedTile");
            cell.appendChild(cellContent);
            return "continue";
          } // Set up the input.


          var cellInput = document.createElement("input");
          cellInput.setAttribute("type", "text");
          cellInput.setAttribute("class", "inputStyle");
          valueLimit = _this.rowLength;
          var r = Number(i);
          var c = Number(j);

          cellInput.onchange = function () {
            var value = cellInput.value; // Allow blank tiles.

            if (value === "") {
              tilesArray[r][c] = Number(0);
              decGlobalTileCount(r, c); // Show error if something other than a number is entered.
            } else if (isNaN(value)) {
              showError(valueLimit);
              cellInput.focus();
            } else {
              // Convert it to a number, just in case it's a number string.
              value = Number(value); // Check the range.

              if (value < 1 || value > valueLimit) {
                showError(valueLimit);
                cellInput.focus(); // Run it through the validator.
              } else if (!this.gameMaker.isValidValue(tilesArray, r, c, value)) {
                showError();
                cellInput.focus(); // We're good, put it in the array.
              } else {
                tilesArray[r][c] = value;
                incGlobalTileCount(r, c);
                setMessage("Good! Keep going!", "black");

                if (globalTileCount === totalTiles) {
                  // Check all the completed tiles.
                  for (var i = 0; i < valueLimit; i++) {
                    for (var j = 0; j < valueLimit; j++) {
                      // Let the user know that a tile is out of place.
                      // TODO: Improvement: highlight the offending tile.
                      if (!this.gameMaker.isValidValue(tilesArray, i, j, tilesArray[i][j])) {
                        setMessage("One or more of your values is incorrect. You lose.", "black");
                        return;
                      }
                    }
                  } // Let the user know that they finished successfully.


                  setMessage("You win! Well done!", "blue");
                }
              }
            }
          };

          cell.appendChild(cellInput);
          cell.onclick = _this.toggleReadonly(cell);
        };

        for (var j = 0; j < this.rowLength; j++) {
          var valueLimit;

          var _ret = _loop();

          if (_ret === "continue") continue;
        }
      }
    } // Create a matrix to hold the values in the table cells.
    // Initialize the matrix with the values from the 
    // initialized tiles.

  }, {
    key: "getTilesArray",
    value: function getTilesArray() {
      var tilesArray = this.gameMaker.getInitTiles();
      return tilesArray;
    }
  }]);

  return TableInitializer;
}();

;

function initGame(tableInitializer) {
  restart.style.display = "block";
  gameTable.innerHTML = "";
  globalTileCount = 0;
  cellsArray = tableInitializer.getAndAddCells(gameTable);
  tilesArray = tableInitializer.getTilesArray();
  tableInitializer.setCellsInput(cellsArray, tilesArray);
  setMessage("You've got this!");
}

function log(s) {
  console.log(s);
} //LISTEN FOR load EVENT


window.onload = function () {
  msgElement = document.getElementById("messageDiv");
  resetMessage();
  var gameTable = document.getElementById("gameTable");
  gameTable.innerHTML = "";
  var gameForm = document.forms.gameForm; // let dimensionSelect = gameForm.dimensionSelect;

  var dimension;
  var tableInitializer = new TableInitializer();

  gameForm.onsubmit = function () {
    // dimension = Number( dimensionSelect.value );
    dimension = 2;
    totalTiles = Math.pow(dimension, 4);
    tableInitializer.setDimension(dimension, new GameMaker(dimension));
    initGame(tableInitializer);
    return false;
  };

  var restart = document.getElementById("restart");
  restart.style.display = "none";

  restart.onclick = function () {
    initGame(tableInitializer, validator, initTiles);
  };
};