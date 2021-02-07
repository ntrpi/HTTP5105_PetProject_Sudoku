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
var startMsg = "Click Start Game to play."

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
function showError( valueLimit )
{
    if( valueLimit ) {
        setMessage( "Please enter a number between 1 and " + valueLimit, "red" );

    } else {
        setMessage( "That value conflicts with another value in the row, column, or square.", "red" );
    }
}

class GameMaker
{
    constructor( dimension )
    {
        this.tilesStack = [];
        this.dimension = dimension;
        let gameSize = dimension * dimension;
        this.gameSize = gameSize;
        this.numTiles = gameSize * gameSize;
        this.numInitTiles = this.getNumInitTiles( gameSize );
        this.totalSolvedTiles = 0;
        // Init this.solvedTiles.
        this.solvedTiles = new Array( gameSize );
        for( let i = 0; i < gameSize; i++ ) {
            this.solvedTiles[i] = [];
            for( let j = 0; j < gameSize; j++ ) {
                this.solvedTiles[i].push( 0 );
            }
        }
        this.triedValues = new Array( gameSize );
        for( let i = 0; i < gameSize; i++ ) {
            this.triedValues[i] = [];
            for( let j = 0; j < gameSize; j++ ) {
                this.triedValues[i].push( [] );
            }
        }
    }

    trySetTile( tile )
    {
        let value = this.getRandomValue();
        let valueCount = this.getTriedLength( tile );
        let isValid = false;
        while( valueCount < this.gameSize ) {
            if( !this.isTried( tile, value ) ) {
                isValid = this.isValidTile( tile, value );
                this.addTried( tile, value );
                if( isValid ) {
                    return value;
                }
            }
            value = this.getNextValue( value );
            valueCount++;
        }
        return 0;
    }

    setTile( tile )
    {
        if( this.totalSolvedTiles % 10 === 0 ) {
            log( this.totalSolvedTiles );
        }

        if( this.totalSolvedTiles === this.numTiles ) {
            return true;
        }

        if( tile === undefined ) {
            tile = this.getRandomTile();
        
        } else {
            // Find an empty tile.
            if( this.totalSolvedTiles < this.numInitTiles ) {
                tile = this.getRandomTile();
                while( !this.isEmptyTile( tile ) ) {
                    tile = this.getRandomTile();
                }
            } else {
                tile = this.getNextEmptyTile( tile );
            }
        }
        this.tilesStack.push( tile );

        let value = this.trySetTile( tile );
        while( value !== 0 ) {
            this.setSolvedTile( tile, value );
            if( this.setTile( tile ) ) {
                return true;
            } else {
                this.undoNextTile();
            }
            value = this.trySetTile( tile );
        }

        // Unset tile.
        this.unsetSolvedTile( tile );
        return false;
    }

    undoNextTile()
    {
        let nextTile = this.tilesStack.pop();
        let i = nextTile[0];
        let j = nextTile[1];
        this.triedValues[i][j].length = 0;
    }

    addTried( tile, value )
    {
        let i = tile[0];
        let j = tile[1];
        this.triedValues[i][j].push( value );
    }

    isTried( tile, value )
    {
        let i = tile[0];
        let j = tile[1];
        return this.triedValues[i][j].includes( value );
    }

    getTriedLength( tile )
    {
        let i = tile[0];
        let j = tile[1];
        return this.triedValues[i][j].length;
    }

    initGame()
    {
        this.setTile();
    }

    isValidTile( tile, value )  
    {
        return this.isValidValue( this.solvedTiles, tile[0], tile[1], value );
    }

    isValidValue( matrix, row, column, value )
    {
        // If the new value is invalid, return false.
        if( value === NaN || value === undefined || value < 1 || value > this.gameSize ) {
            return false; 
        }

        // Check the new value against others in the row.
        for( var i = 0; i < this.gameSize; i++ ) {
            // Skip checking itself.
            if( i == column ) {
                continue;
            }
            if( matrix[row][i] === value ) {
                return false;
            }
        }

        // Check the new value against others in the column.
        for( var i = 0; i < this.gameSize; i++ ) {
            // Skip checking itself.
            if( i == row ) {
                continue;
            }
            if( matrix[i][column] === value ) {
                return false;
            }
        }

        // Check against the others in the square.
        let dimension = this.dimension;
        let rowSquare = Math.floor( row / dimension );
        let rowStart = rowSquare * dimension;
        let rowLimit = rowStart + dimension;

        let columnSquare = Math.floor( column / dimension );
        let columnStart = columnSquare * dimension;
        let columnLimit = columnStart + dimension;

        for( let i = rowStart; i < rowLimit; i++ ) {
            for( let j = columnStart; j < columnLimit; j++ ) {
                if( i === row && j === column ) {
                    continue;
                }
                if( matrix[i][j] === value ) {
                    return false;
                }
            }
        }

        return true;
    }

    setSolvedTile( tile, value )
    {
        this.solvedTiles[tile[0]][tile[1]] = value;
        this.totalSolvedTiles++;
    }

    unsetSolvedTile( tile )
    {
        this.solvedTiles[tile[0]][tile[1]] = 0;
        this.totalSolvedTiles--;
    }

    getRandomValue()
    {
        var v;
        while( v === NaN || v === undefined ) {
            v = Math.ceil( Math.random() * this.gameSize );
        } 
        return v;
    }

    getNextValue( value )
    {
        let next = value + 1;
        if( next > this.gameSize ) {
            return 1;
        }
        return next;
    }

    getRandomTileNum()
    {
        var v;
        while( v === NaN || v === undefined ) {
            v = Math.floor( Math.random() * this.gameSize );
        } 
        return v;
    }

    getRandomTile()
    {
        var tile = [];
        tile[0] = this.getRandomTileNum();
        tile[1] = this.getRandomTileNum();
        return tile;
    }

    getNextTileNum( i )
    {
        let next = i + 1;
        if( next >= this.gameSize ) {
            return 0;
        }
        return next;
    }

    isEmptyTile( tile )
    {
        return this.solvedTiles[tile[0]][tile[1]] === 0;
    }

    getNextEmptyTile( tile )
    {
        let i = tile[0];
        let j = tile[1];
        let iCount = 0;
        while( this.solvedTiles[i][j] !== 0 && iCount < this.gameSize ) {
            i = this.getNextTileNum( i );
            iCount++;
            let jCount = 0;
            while( this.solvedTiles[i][j] != 0 && jCount < this.gameSize ) {
                j = this.getNextTileNum( j );
                jCount++;
            }
        }
        return [ i, j ];
    }

    getNumInitTiles( gameSize ) 
    {
        // Determine how many tiles to initiate.
        var v;
        while( v === NaN || v === undefined ) {
            v = Math.round( ( gameSize * gameSize ) / 3.33 );
        }
        return v;
    }

    getInitTiles()
    {
        var initTiles = new Array( this.gameSize );
        for( let i = 0; i < this.gameSize; i++ ) {
            initTiles[i] = [];
            for( let j = 0; j < this.gameSize; j++ ) {
                initTiles[i].push( 0 );
            }
        }

        let tile;
        for( let i = 0; i < this.numInitTiles; i++ ) {
            tile = this.tilesStack[i];
            initTiles[tile[0]][tile[1]] = this.solvedTiles[tile[0]][tile[1]];
        }
        return initTiles;
    }
}

class TableInitializer
{
    constructor()
    {
        this.dimension = 0;
        this.rowLength = 0;
        this.gameMaker = {};
        this.initTiles = [];
    }

    setDimension( dimension )
    {
        this.dimension = Number( dimension );
        this.rowLength = this.dimension * this.dimension;
        this.gameMaker = new GameMaker( this.dimension );
        this.gameMaker.initGame();
        this.initTiles = this.gameMaker.getInitTiles();
    }

    toggleReadonly( cellInput )
    {
        if( cellInput.getAttribute( "readonly" ) ) {
            cellInput.removeAttribute( "readonly" );
        } else {
            cellInput.setAttributeNode( document.createAttribute( "readonly" ) );
        }
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

    setCellsInput( cellsArray, tilesArray )
    {
        let initTiles = this.gameMaker.getInitTiles();
        for( var i = 0; i < this.rowLength; i++ ) {
            for( var j = 0; j < this.rowLength; j++ ) {

                let cell = cellsArray[i][j];

                // If it is initialized, set it as fixed content.
                if( initTiles[i][j] !== 0 ) {
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
                        } else if( !this.gameMaker.isValidValue( tilesArray, r, c, value ) ) {
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
                                        if( !this.gameMaker.isValidValue( tilesArray, i, j, tilesArray[i][j] ) ) {
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
    getTilesArray()
    {
        let tilesArray = this.gameMaker.getInitTiles();
        return tilesArray;
    }
};

function initGame( tableInitializer )
{
    restart.style.display = "block";

    gameTable.innerHTML = "";
    globalTileCount = 0;

    cellsArray = tableInitializer.getAndAddCells( gameTable );
    tilesArray = tableInitializer.getTilesArray();
    tableInitializer.setCellsInput( cellsArray, tilesArray );

    setMessage( "You've got this!" );
}

function log( s )
{
    console.log( s );
}

//LISTEN FOR load EVENT
window.onload = function () 
{    
    msgElement = document.getElementById( "messageDiv" );
    resetMessage();

    let gameTable = document.getElementById( "gameTable" );
    gameTable.innerHTML = "";
    let gameForm = document.forms.gameForm;
    // let dimensionSelect = gameForm.dimensionSelect;

    var dimension;
    var tableInitializer = new TableInitializer();
    gameForm.onsubmit = function() {

        // dimension = Number( dimensionSelect.value );
        dimension = 2;
        totalTiles = Math.pow( dimension, 4 );
        tableInitializer.setDimension( dimension, new GameMaker( dimension ) );

        initGame( tableInitializer );

        return false;
    }

    let restart = document.getElementById( "restart" );
    restart.style.display = "none";
    restart.onclick = function() {
        initGame( tableInitializer, validator, initTiles );
    };
}

