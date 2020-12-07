"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var gameTable;
var dimension;
var numTiles;

function initVariables() {
  // Get table from DOM.
  gameTable = document.getElementById("gameTable"); // Get or set dimension.

  rowLength = dimension * dimension;
  numTiles = rowLength * rowLength;
}

var TileValidator =
/*#__PURE__*/
function () {
  function TileValidator(initializedTilesArray, tilesArray) {
    _classCallCheck(this, TileValidator);

    this.initializedTilesArray = initializedTilesArray;
    this.rowLength = initializedTilesArray.length;
    this.tilesArray = tilesArray;
  }

  _createClass(TileValidator, [{
    key: "isDefined",
    value: function isDefined(matrix, i, j) {
      var defined = false;

      try {
        defined = matrix[i];
      } catch (e) {
        return false;
      }

      try {
        defined = matrix[i][j];
      } catch (e) {
        return false;
      }

      return defined !== undefined;
    }
  }, {
    key: "isInitialized",
    value: function isInitialized(row, column) {
      return this.isDefined(this.initializedTilesArray, row, column);
    }
  }, {
    key: "isValidValue",
    value: function isValidValue(matrix, row, column, value) {
      // If the new value is invalid, return false.
      if (value < 1 || value > this.rowLength) {
        return false;
      } // Check the new value against others in the row.


      for (var i = 0; i < this.rowLength; i++) {
        // Skip checking itself.
        if (i == column) {
          continue;
        }

        if (this.isDefined(matrix, row, i) && matrix[row][i] === value) {
          return false;
        }
      } // Check the new value against others in the column.


      for (var i = 0; i < this.rowLength; i++) {
        // Skip checking itself.
        if (i == row) {
          continue;
        }

        if (this.isDefined(matrix, i, column) && matrix[i][column] === value) {
          return false;
        }
      }

      return true;
    }
  }, {
    key: "isValidTile",
    value: function isValidTile(row, column, value) {
      return this.isValidValue(this.tilesArray, row, column, value);
    }
  }, {
    key: "isValidInit",
    value: function isValidInit(row, column, value) {
      return this.isValidValue(this.initializedTilesArray, row, column, value);
    }
  }, {
    key: "updateTile",
    value: function updateTile(row, column, newValue) {
      this.tilesArray[row][column] = newValue;
    }
  }, {
    key: "updateInit",
    value: function updateInit(row, column, newValue) {
      this.initializedTilesArray[row][column] = newValue;
    }
  }]);

  return TileValidator;
}();

var TableInitializer =
/*#__PURE__*/
function () {
  function TableInitializer(gameTable, dimension) {
    _classCallCheck(this, TableInitializer);

    this.gameTable = gameTable;
    this.dimension = dimension;
    this.rowLength = dimension * dimension;
  }

  _createClass(TableInitializer, [{
    key: "toggleReadonly",
    value: function toggleReadonly(cellInput) {
      if (cellInput.getAttribute("readonly")) {
        cellInput.removeAttribute("readonly");
      } else {
        cellInput.setAttributeNode(document.createAttribute("readonly"));
      }
    } // Array[ bottom/right, top/left ]

  }, {
    key: "isBigBorder",
    value: function isBigBorder(num, rowLength) {
      num++;
      var borderArray = [false, false];

      if (num !== rowLength && num !== 1) {
        var remainder = num % dimension;

        switch (remainder) {
          case 0:
          case 1:
            {
              borderArray[remainder] = true;
            }
        }
      }

      return borderArray;
    } // Get the valid. Loop around if necessary.

  }, {
    key: "getNextValue",
    value: function getNextValue(i) {
      i++;

      if (i > this.rowLength) {
        i = 1;
      }

      return i;
    } // Get the next row or column item.

  }, {
    key: "getNextIndex",
    value: function getNextIndex(i) {
      i++;

      if (i >= this.rowLength) {
        i = 0;
      }

      return i;
    }
  }, {
    key: "initTable",
    value: function initTable() {
      // Set up an array to hold the tile values.
      var tilesArray = new Array(this.rowLength);

      for (var i = 0; i < this.rowLength; i++) {
        tilesArray[i] = new Array(this.rowLength);
      } // Set up an array to hold the initialized values.
      // TODO: could we use an object for this?


      var initializedTilesArray = new Array(this.rowLength);

      for (var i = 0; i < this.rowLength; i++) {
        initializedTilesArray[i] = new Array(this.rowLength);
      } // We're gonna need a validator.


      var tileValidator = new TileValidator(initializedTilesArray, tilesArray); // Determine how many tiles to initiate.

      var numStartTiles = this.rowLength + Math.round(rowLength / 2); // Determine which tiles to initiate and what to initiate them with.

      for (var i = 0; i < numStartTiles; i++) {
        ; // Map the random value onto a tile number;

        var tile = Math.round(Math.random() * numTiles); // Divide the tile number by number of rows to get the row number.

        var row = Math.round(tile / this.rowLength); // Get the modulus to determine the column number. 

        var column = Math.round(tile % this.rowLength); // Check that this tile isn't already initialized.

        var isInit = tileValidator.isInitialized(row, column);

        while (isInit) {
          // Try incrementing the row.
          row = this.getNextIndex(row); // Check again.

          isInit = tileValidator.isInitialized(row, column);

          if (isInit) {
            break;
          } // Increment the column and let the while loop do the checking.


          column = this.getNextIndex(column);
          isInit = tileValidator.isInitialized(row, column);
        } // Get the random value.


        var value = Math.round(Math.random() * this.rowLength);

        if (value === 0) {
          value++;
        } // Validate and adjust the value if required.


        var isValidValue = tileValidator.isValidInit(row, column, value);

        while (!isValidValue) {
          value = this.getNextValue(value);
          isValidValue = tileValidator.isValidInit(row, column, value);
        } // Store the random value.


        try {
          tileValidator.updateInit(row, column, value);
        } catch (e) {
          console.log(e);
        }
      } // Initialize the table


      var columnBorderArrays = new Array(this.rowLength);

      for (var i = 0; i < rowLength; i++) {
        // Create a new row.
        var row = gameTable.insertRow(i); // See if this row needs the big border.

        console.log("row i: " + i);
        var rowBorderArray = this.isBigBorder(i, this.rowLength);

        for (var j = 0; j < this.rowLength; j++) {
          // Create a new cell.
          var cell = row.insertCell(j); // Add some cell styling.
          // TODO: this can be more efficient.

          var cellStyle = document.createAttribute("class");
          cellStyle.value = "cellStyle ";

          if (columnBorderArrays[j] === undefined) {
            console.log("column j: " + j);
            columnBorderArrays[j] = this.isBigBorder(j, this.rowLength);
          }

          var columnBorderArray = columnBorderArrays[j];

          if (columnBorderArray[0] && j < this.rowLength - 1) {
            cellStyle.value += "borderRight ";
          } else if (columnBorderArray[1] && j !== 0) {
            cellStyle.value += "borderLeft ";
          }

          if (rowBorderArray[0] && i < this.rowLength - 1) {
            cellStyle.value += "borderBottom ";
          } else if (rowBorderArray[1] && i > 0) {
            cellStyle.value += "borderTop ";
          }

          cell.setAttributeNode(cellStyle); // Set up the input.

          var cellInput = document.createElement("input");
          cell.appendChild(cellInput);
          var inputType = document.createAttribute("type");
          inputType.value = "text";
          cellInput.setAttributeNode(inputType);
          var inputClass = document.createAttribute("class");
          inputClass.value = "inputStyle ";

          if (tileValidator.isInitialized(i, j)) {
            inputClass.value += "initializedTile ";
            cellInput.placeholder = initializedTilesArray[i][j].toString();
          }

          cellInput.setAttributeNode(inputClass);
          cell.onclick = this.toggleReadonly(cell);
        }
      }
    }
  }]);

  return TableInitializer;
}();

; //LISTEN FOR load EVENT

window.onload = pageLoaded; //'WRAPPER' FUNCTION FOR DOM LOGIC

function pageLoaded() {
  var dimensionSelect = document.getElementById("dimensionSelect");
  var openDropdown = true;

  dimensionSelect.onclick = function () {
    // TODO: make this have better options.
    if (!openDropdown) {
      openDropdown = true;

      if (gameTable === undefined) {
        // Initialize variables.
        dimension = dimensionSelect.value;
        initVariables();
        var tableInitializer = new TableInitializer(gameTable, dimension);
        tableInitializer.initTable();
      }
    } else {
      openDropdown = false;
    }
  };
}