import React from 'react';

interface GameStatusProps {
    statusText: string;
    isGameOver: boolean;
    showForfeit: boolean; 
    onForfeit: () => void;
    onPlayAgain: () => void;
    forfeitDisabled?: boolean; 
}

const GameStatus: React.FC<GameStatusProps> = ({
    statusText,
    isGameOver,
    showForfeit,
    onForfeit,
    onPlayAgain,
    forfeitDisabled = false
}) => {

    const statusAreaStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1.5rem',
        minHeight: '40px' 
    };

    const statusTextStyle: React.CSSProperties = {
        fontSize: '1rem',
        margin: 0,
        fontWeight: 'bold'
    };

    const btnStyle: React.CSSProperties = {
         padding: '.6rem 1.2rem',
         border: 'none',
         borderRadius: '8px',
         fontWeight: 'bold',
         cursor: 'pointer',
         transition: 'transform .2s, box-shadow .2s'
    };

     const btnPrimaryStyle: React.CSSProperties = {
        ...btnStyle,
        background: 'linear-gradient(45deg, #ff416c, #ff4b2b)', // Match gameplay.css
        color: '#fff'
     };
      const btnSecondaryStyle: React.CSSProperties = {
        ...btnStyle,
        background: 'linear-gradient(45deg, #00c6ff, #0072ff)', // Match gameplay.css
        color: '#fff'
     };


    return (
        <div className="status-area" style={statusAreaStyle}>
            <p id="status" style={statusTextStyle}>
                 Status: <span>{statusText}</span>
            </p>

            {!isGameOver && showForfeit && (
                <button
                    id="forfeitBtn"
                    className="btn btn-secondary"
                    style={btnSecondaryStyle}
                    onClick={onForfeit}
                    disabled={forfeitDisabled}
                >
                    Forfeit
                </button>
            )}

            {isGameOver && (
                <button
                    id="playAgainBtn"
                    className="btn btn-primary"
                    style={btnPrimaryStyle}
                    onClick={onPlayAgain}
                >
                    Play Again
                </button>
            )}
        </div>
    );
};

export default GameStatus;