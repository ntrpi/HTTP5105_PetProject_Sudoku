var globalTileCount = 0;
var totalTiles = 0;

function incGlobalTileCount( i, j )
{
    globalTileCount++;
}

function decGlobalTileCount( i, j )
{
    globalTileCount--;
}


var msgElement = null;
var startMsg = "Select your square size and click Start Game to play."

function setMessage( msg, color )
{
    msgElement.innerHTML = msg;
    if( color ) {
        msgElement.style.color = color;
    }
}

function resetMessage()
{
    setMessage( startMsg, "black" );
}

class TileValidator 
{
    constructor()
    {
        this.dimension = 0;
        this.rowLength = 0;
    }

    setDimension( dimension )
    {
        this.dimension = Number( dimension );
        this.rowLength = this.dimension * this.dimension;
    }

    // Get the next value. Loop around if necessary.
    getNextValue( i )
    {
        i++;
        if( i > this.rowLength ) {
            i = 1;
        }
        return i;
    }

    // Get the next row or column item.
    getNextIndex( i )
    {
        i++;
        if( i >= this.rowLength ) {
            i = 0;
        }
        return i;
    }
    
    isDefined( matrix, i, j )
    {
        var defined = false;
        try {
            defined = matrix[i];
        } catch( e ) {
            return false;
        }
        try {
            defined = matrix[i][j];
        } catch( e ) {
            return false;
        }
        return defined !== undefined;
    }

    // TODO: Improvement: this would be a more valuable function 
    // if it returned more information than just true or false.
    // More information about why the value is not valid could
    // be used to give more feedback to the user.
    isValidValue( matrix, row, column, value )
    {
        // If the new value is invalid, return false.
        if( value < 1 || value > this.rowLength ) {
            return false; 
        }

        // Check the new value against others in the row.
        for( var i = 0; i < this.rowLength; i++ ) {
            // Skip checking itself.
            if( i == column ) {
                continue;
            }
            if( this.isDefined( matrix, row, i ) && matrix[row][i] === value ) {
                return false;
            }
        }

        // Check the new value against others in the column.
        for( var i = 0; i < this.rowLength; i++ ) {
            // Skip checking itself.
            if( i == row ) {
                continue;
            }
            if( this.isDefined( matrix, i, column ) && matrix[i][column] === value ) {
                return false;
            }
        }

        // Check against the others in the square.
        var rowSquare = Math.floor( row / this.dimension );
        var rowStart = rowSquare * this.dimension;
        var rowLimit = rowStart + this.dimension;

        var columnSquare = Math.floor( column / this.dimension );
        var columnStart = columnSquare * this.dimension;
        var columnLimit = columnStart + this.dimension;

        for( var i = rowStart; i < rowLimit; i++ ) {
            for( var j = columnStart; j < columnLimit; j++ ) {
                if( i === row && j === column ) {
                    continue;
                }
                if( this.isDefined( matrix, i, j ) && matrix[i][j] === value ) {
                    return false;
                }
            }
        }
        return true;
    }
}

function showError( valueLimit )
{
    if( valueLimit ) {
        setMessage( "Please enter a number between 1 and " + valueLimit, "red" );

    } else {
        setMessage( "That value conflicts with another value in the row, column, or square.", "red" );
    }
}

class TableInitializer
{
    constructor()
    {
        this.dimension = 0;
        this.rowLength = 0;
    }

    setDimension( dimension )
    {
        this.dimension = Number( dimension );
        this.rowLength = this.dimension * this.dimension;
    }

    toggleReadonly( cellInput )
    {
        if( cellInput.getAttribute( "readonly" ) ) {
            cellInput.removeAttribute( "readonly" );
        } else {
            cellInput.setAttributeNode( document.createAttribute( "readonly" ) );
        }
    }

    // A sudoku game starts with some of the numbers initialized.
    // This algorithm is questionable in that the initialized tiles
    // may not allow the game to have a successful solution. I decided
    // for now that this is okay, because I have played many, many games
    // of sudoku and not all of them were solvable.
    // TODO: Improvement: To initialize tiles for a game that is 
    // guarranteed to be solvable I would have to basically construct
    // the solved matrix first, and then show only some of those tiles.
    // To do this I would have to implement a sudoku solving algorithm, 
    // which would use a stack to keep track of each randomly added value
    // to enable backtracking. This is totally doable, and I may do it
    // later, but I don't have time right now.
    getInitTiles( validator )
    {
        // Set up an array to hold the initialized values.
        let initTilesArray = new Array( this.rowLength );
        for( var i = 0; i < this.rowLength; i++ ) {
            initTilesArray[i] = new Array( this.rowLength );
        }

        // Determine how many tiles to initiate.
        var numStartTiles = Math.round( totalTiles / 3.33 );

        // Determine which tiles to initiate and what to initiate them with.
        for( var i = 0; i < numStartTiles; i++ ) {;
            // Get a random row value.
            var row = Math.floor( Math.random() * this.rowLength );

            // Get a random column value. 
            var column = Math.floor( Math.random() * this.rowLength );

            // Check that this tile isn't already initialized.
            var isInit = validator.isDefined( initTilesArray, row, column );
            while( isInit ) {

                // Try incrementing the row.
                row = validator.getNextIndex( row );

                // Check again.
                isInit = validator.isDefined( initTilesArray, row, column );
                if( isInit ) {
                    // Increment the column and let the while loop do the checking.
                    column = validator.getNextIndex( column );
                    isInit = validator.isDefined( initTilesArray, row, column );
                }
            }

            // Get the random value.
            var value = Math.round( Math.random() * this.rowLength );
            if( value === 0 ) {
                value++;
            }

            // Validate and adjust the value if required.
            var isValidValue = validator.isValidValue( initTilesArray, row, column, value );
            while( !isValidValue ) {
                value = validator.getNextValue( value );
                isValidValue = validator.isValidValue( initTilesArray, row, column, value );
            }

            // Store the random value.
            try {
                initTilesArray[row][column] = value;
            } catch( e ) {
                console.log( e );
                console.log( `row: ${column}  column: ${column}` );
                console.log( initTilesArray );
            }
        }

        return initTilesArray;
    }

    // Use this function to set a heavier border for cells that
    // are on the edges of the table or any of the sub-squares.
    // Array[ bottom/right, top/left ]
    isBigBorder( num )
    {
        num++;
        var borderArray = [ false, false ];
        var remainder = num % this.dimension;
        if( remainder <= 1 ) {
            borderArray[ remainder ] = true;
        }
        return borderArray;
    }

    getAndAddCells( parent )
    {
        // Set up an array to hold the cells.
        let cellsArray = new Array( this.rowLength );
        for( var i = 0; i < this.rowLength; i++ ) {
            cellsArray[i] = new Array( this.rowLength );
        }

        // Initialize the table
        for( var i = 0; i < this.rowLength; i++ ) {

            // Create a new row.
            let row = parent.insertRow( i );

            // See if this row needs the big border.
            var rowBorderArray = this.isBigBorder( i );

            for( var j = 0; j < this.rowLength; j++ ) {

                // Create a new cell.
                let cell = row.insertCell( j );
                cellsArray[i][j] = cell;

                // Add some cell styling.
                var cellStyle = document.createAttribute( "class" );
                cellStyle.value = "cellStyle ";

                var columnBorderArray = this.isBigBorder( j );
                cellStyle.value += columnBorderArray[0] ? "borderRight " : "";
                cellStyle.value += columnBorderArray[1] ? "borderLeft " : "";

                cellStyle.value += rowBorderArray[0] ? "borderBottom " : "";
                cellStyle.value += rowBorderArray[1] ? "borderTop " : "";
                
                cell.setAttributeNode( cellStyle );
            }
        }
        return cellsArray;
    }

    setCellsInput( cellsArray, initTiles, tilesArray, validator )
    {
        for( var i = 0; i < this.rowLength; i++ ) {
            for( var j = 0; j < this.rowLength; j++ ) {

                let cell = cellsArray[i][j];

                // If it is initialized, set it as fixed content.
                if( validator.isDefined( initTiles, i, j ) ) {
                    let cellContent = document.createElement( "div" );
                    cellContent.innerHTML = initTiles[i][j];
                    cellContent.setAttribute( "class", "initializedTile" );
                    cell.appendChild( cellContent );
                    continue;
                }

                // Set up the input.
                let cellInput = document.createElement( "input" );
                cellInput.setAttribute( "type", "text" );
                cellInput.setAttribute( "class", "inputStyle" );
                var valueLimit = this.rowLength;
                let r = Number(i);
                let c = Number(j);
                cellInput.onchange = function() {
                    let value = cellInput.value;

                    // Allow blank tiles.
                    if( value === "" ) {
                        tilesArray[r][c] = Number( 0 );
                        decGlobalTileCount( r, c );

                    // Show error if something other than a number is entered.
                    } else if( isNaN( value ) ) {
                        showError( valueLimit );
                        cellInput.focus();
                    } else {

                        // Convert it to a number, just in case it's a number string.
                        value = Number( value );

                        // Check the range.
                        if( value < 1 || value > valueLimit ) {
                            showError( valueLimit );
                            cellInput.focus();
                        
                        // Run it through the validator.
                        } else if( !validator.isValidValue( tilesArray, r, c, value ) ) {
                            showError();
                            cellInput.focus();

                        // We're good, put it in the array.
                        } else {
                            tilesArray[r][c] = value;
                            incGlobalTileCount( r, c );
                            setMessage( "Good! Keep going!", "black");

                            if( globalTileCount === totalTiles ) {

                                // Check all the completed tiles.
                                for( var i = 0; i < valueLimit; i++ ) {
                                    for( var j = 0; j < valueLimit; j++ ) {

                                        // Let the user know that a tile is out of place.
                                        // TODO: Improvement: highlight the offending tile.
                                        if( !validator.isValidValue( tilesArray, i, j, tilesArray[i][j] ) ) {
                                            setMessage( "One or more of your values is incorrect. You lose.", "black" );
                                            return;
                                        }
                                    }
                                }

                                // Let the user know that they finished successfully.
                                setMessage( "You win! Well done!", "blue" );
                            }
                        }                       
                    }
                };

                cell.appendChild( cellInput );
                cell.onclick = this.toggleReadonly( cell );
            }
        }
    }

    // Create a matrix to hold the values in the table cells.
    // Initialize the matrix with the values from the 
    // initialized tiles.
    getTilesArray( validator, initTilesArray )
    {
        let tilesArray = new Array( this.rowLength );
        for( var i = 0; i < this.rowLength; i++ ) {
            tilesArray[i] = new Array( this.rowLength );
            for( var j = 0; j < this.rowLength; j++ ) {
                if( validator.isDefined( initTilesArray, i, j ) ) {
                    tilesArray[i][j] = initTilesArray[i][j];
                    incGlobalTileCount( i, j );
                } else {
                    tilesArray[i][j] = 0;
                }
            }
        }
        return tilesArray;
    }
};

function initGame( tableInitializer, validator, initTiles )
{
    restart.style.display = "block";

    gameTable.innerHTML = "";
    globalTileCount = 0;

    cellsArray = tableInitializer.getAndAddCells( gameTable );
    tilesArray = tableInitializer.getTilesArray( validator, initTiles );
    tableInitializer.setCellsInput( cellsArray, initTiles, tilesArray, validator );

    setMessage( "You've got this!" );
}

//LISTEN FOR load EVENT
window.onload = function () 
{    
    msgElement = document.getElementById( "messageDiv" );
    resetMessage();

    let gameTable = document.getElementById( "gameTable" );
    gameTable.innerHTML = "";
    let gameForm = document.forms.gameForm;
    let dimensionSelect = gameForm.dimensionSelect;

    var dimension;
    var validator = new TileValidator();
    var tableInitializer = new TableInitializer();
    var cellsArray;
    var initTiles;
    var tilesArray;
    gameForm.onsubmit = function() {

        dimension = Number( dimensionSelect.value );
        totalTiles = Math.pow( dimension, 4 );

        validator.setDimension( dimension );
        tableInitializer.setDimension( dimension );
        initTiles = tableInitializer.getInitTiles( validator );

        initGame( tableInitializer, validator, initTiles );

        return false;
    }

    let restart = document.getElementById( "restart" );
    restart.style.display = "none";
    restart.onclick = function() {
        initGame( tableInitializer, validator, initTiles );
    };
}

