var globalTileCount = 0;
var totalTiles = 0;

function incGlobalTileCount( i, j )
{
    globalTileCount++;
    console.log( `count: ${globalTileCount}  i: ${i}  j: ${j}` );
}

function decGlobalTileCount( i, j )
{
    globalTileCount--;
    console.log( `count: ${globalTileCount}  i: ${i}  j: ${j}` );
}

class TileValidator 
{
    constructor( dimension )
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
        alert( "Please enter a number between 1 and " + valueLimit );

    } else {
        alert( "That value conflicts with another value in the row, column, or square." );
    }
}

class TableInitializer
{
    constructor( dimension )
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

    // Array[ bottom/right, top/left ]
    isBigBorder( num )
    {
        num++;
        var borderArray = [ false, false ];
        if( num !== this.rowLength && num !== 1 ) {
            var remainder = num % this.dimension;
            switch( remainder ) {
                case 0: 
                case 1: {
                    borderArray[ remainder ] = true;
                }
            }
        }
        return borderArray;
    }


    getInitTiles( validator )
    {
        // Set up an array to hold the initialized values.
        let initTilesArray = new Array( this.rowLength );
        for( var i = 0; i < this.rowLength; i++ ) {
            initTilesArray[i] = new Array( this.rowLength );
        }

        // Determine how many tiles to initiate.
        var numStartTiles = this.rowLength + Math.round( this.rowLength / 2 );

        // Determine which tiles to initiate and what to initiate them with.
        for( var i = 0; i < numStartTiles; i++ ) {;
            // Map the random value onto a tile number;
            var tile = Math.round( Math.random() * numStartTiles );

            // Divide the tile number by number of rows to get the row number.
            var row = Math.round( tile / this.rowLength );

            // Get the modulus to determine the column number. 
            var column = Math.round( tile % this.rowLength );

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
            }
        }

        return initTilesArray;
    }

    getAndAddCells( parent )
    {
        // Set up an array to hold the cells.
        let cellsArray = new Array( this.rowLength );
        for( var i = 0; i < this.rowLength; i++ ) {
            cellsArray[i] = new Array( this.rowLength );
        }

        // Initialize the table
        var columnBorderArrays = new Array( this.rowLength );
        for( var i = 0; i < this.rowLength; i++ ) {

            // Create a new row.
            let row = parent.insertRow( i );

            // See if this row needs the big border.
            console.log( "row i: " + i );
            var rowBorderArray = this.isBigBorder( i );

            for( var j = 0; j < this.rowLength; j++ ) {

                // Create a new cell.
                let cell = row.insertCell( j );
                cellsArray[i][j] = cell;

                // Add some cell styling.
                var cellStyle = document.createAttribute( "class" );
                cellStyle.value = "cellStyle ";
                if( columnBorderArrays[j] === undefined ) {
                    console.log( "column j: " + j );
                    columnBorderArrays[j] = this.isBigBorder( j, this.rowLength );
                }
                var columnBorderArray = columnBorderArrays[j];
                if( columnBorderArray[0] && j < this.rowLength - 1 ) {
                    cellStyle.value += "borderRight ";
                } else if( columnBorderArray[1] && j !== 0 ) {
                    cellStyle.value += "borderLeft ";
                }
                if( rowBorderArray[0] && i < this.rowLength - 1 ) {
                    cellStyle.value += "borderBottom ";
                } else if( rowBorderArray[1] && i > 0 ) {
                    cellStyle.value += "borderTop ";
                }
                
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
                    if( value === "" ) {
                        tilesArray[r][c] = Number( 0 );
                        decGlobalTileCount( r, c );
                        return;                    
                    } 
                    if( isNaN( value ) ) {
                        showError();
                        return;
                    }

                    value = Number( value );
                    if( value < 1 || value > valueLimit ) {
                        showError( valueLimit );
                    
                    } else if( !validator.isValidValue( tilesArray, r, c, value ) ) {
                        showError();

                    } else {
                        tilesArray[r][c] = value;
                        incGlobalTileCount( r, c );
                    }                       
                };
                cellInput.onblur = function() {
                    if( globalTileCount === totalTiles ) {
                        for( var i = 0; i < valueLimit; i++ ) {
                            for( var j = 0; j < valueLimit; j++ ) {
                                if( !validator.isValidValue( tilesArray, i, j, tilesArray[i][j] ) ) {
                                    alert( "One or more of your values is incorrect. You lose." );
                                    return;
                                }
                            }
                        }
                        alert( "You win! Well done!" );
                    }
                }

                cell.appendChild( cellInput );
                cell.onclick = this.toggleReadonly( cell );

            }
        }
    }

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


//LISTEN FOR load EVENT
window.onload = function () 
{    
    let gameTable = document.getElementById( "gameTable" );
    gameTable.innerHTML = "";
    let gameForm = document.forms.gameForm;
    let dimensionSelect = gameForm.dimensionSelect;

    var dimension;
    var validator;
    var tableInitializer;
    var cellsArray;
    var initTiles;
    var tilesArray;
    gameForm.onsubmit = function() {

        gameTable.innerHTML = "";
        globalTileCount = 0;
        
        dimension = dimensionSelect.value;
        totalTiles = Math.pow( dimension, 4 );

        validator = new TileValidator( dimension );
        tableInitializer = new TableInitializer( Number( dimension ) );
        cellsArray = tableInitializer.getAndAddCells( gameTable );

        initTiles = tableInitializer.getInitTiles( validator );
        tilesArray = tableInitializer.getTilesArray( validator, initTiles );
        tableInitializer.setCellsInput( cellsArray, initTiles, tilesArray, validator );

        return false;
    }
}

