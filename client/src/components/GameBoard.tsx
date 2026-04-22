import React from 'react';
type CellValue = string | null; 
type GridState = CellValue[][];

interface GameBoardProps {
    grid: GridState;
    playerColor: string; 
    myTurn: boolean;
    onCellClick: (row: number, col: number) => void;
    disabled: boolean; 
}

const GameBoard: React.FC<GameBoardProps> = ({ grid, playerColor, myTurn, onCellClick, disabled }) => {

    const handleCellClick = (row: number, col: number) => {
        if (!disabled && myTurn && grid[row][col] === null) {
            onCellClick(row, col);
        }
    };

     const gridStyle: React.CSSProperties = {
         display: 'grid',
         gridTemplateColumns: 'repeat(5, 60px)', 
         gridTemplateRows: 'repeat(5, 60px)', 
         gap: '5px', 
         justifyContent: 'center',
         marginBottom: '1.5rem'
     };

     const cellBaseStyle: React.CSSProperties = {
         width: '60px', 
         height: '60px', 
         background: 'rgba(255,255,255,0.1)', 
         border: '2px solid #fff', 
         borderRadius: '4px', 
         cursor: 'pointer',
         transition: 'background .2s',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         fontSize: '2rem', 
         boxSizing: 'border-box'
     };


    return (
        <div className="grid" style={gridStyle}>
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                     const cellStyle: React.CSSProperties = { ...cellBaseStyle };
                     if (cell) {
                         cellStyle.backgroundColor = cell; 
                         cellStyle.cursor = 'not-allowed';
                     } else if (disabled || !myTurn) {
                          cellStyle.cursor = 'not-allowed';
                           cellStyle.opacity = 0.6;
                     } else {
                     }


                    return (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`cell ${cell ? 'filled' : ''} ${!disabled && myTurn && !cell ? 'playable' : ''}`} // Add classes for CSS hover effects
                            style={cellStyle}
                            onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                        </div>
                    );
                 })
            )}
        </div>
    );
};

export default GameBoard;