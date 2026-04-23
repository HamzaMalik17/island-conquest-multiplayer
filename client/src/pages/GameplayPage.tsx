import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { emitMakeMove, emitForfeitGame, emitFindMatch } from '../services/socketService';
import GameBoard from '../components/GameBoard'; 
import GameStatus from '../components/GameStatus'; 
import "../styles/gameplay.css";

type CellValue = string | null;
type GridState = CellValue[][];

interface PlayerInfo {
    userId: string; 
    _id?: string;    
    username: string;
    profilePic?: string;
    profile_picture_url?: string; 
    color: string;
}

interface AuthenticatedUser {
    _id?: string;
    userId?: string;
    username: string;
    profile_picture_url?: string;
    coins?: number;
}

const GameplayPage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();
    const { user, updateUserCoins } = useAuth() as { user: AuthenticatedUser | null, updateUserCoins: (coins: number) => void };

    const getInitialGameState = () => {
        const initialState = location.state as { initialPlayers?: PlayerInfo[], startingPlayerId?: string } | null;
        if (!initialState || !initialState.initialPlayers || !initialState.startingPlayerId || !user) {
            console.warn("Initial game state not found in location or user missing.");
            return {
                initialGrid: Array(5).fill(null).map(() => Array(5).fill(null)),
                initialPlayers: [],
                initialMyPlayer: null,
                initialOpponent: null,
                initialIsMyTurn: false,
                initialStatus: 'Error: Missing initial data.',
                initialIsLoading: true 
            };
        }

        const currentUserId = user._id || user.userId;
        const me = initialState.initialPlayers.find(p => (p._id || p.userId) === currentUserId);
        const opponent = initialState.initialPlayers.find(p => (p._id || p.userId) !== currentUserId);

        if (!me || !opponent) {
            console.error("Could not identify player/opponent from initial state.");
            return {
                initialGrid: Array(5).fill(null).map(() => Array(5).fill(null)),
                initialPlayers: initialState.initialPlayers,
                initialMyPlayer: null,
                initialOpponent: null,
                initialIsMyTurn: false,
                initialStatus: 'Error: Player identification failed.',
                initialIsLoading: true 
            };
        }

        const isStartingTurn = me.userId === initialState.startingPlayerId || me._id === initialState.startingPlayerId;
        const statusText = isStartingTurn ? 'Your Turn' : "Opponent's Turn";

        console.log("Initializing GameplayPage state from location:", { me, opponent, isStartingTurn });

        return {
            initialGrid: Array(5).fill(null).map(() => Array(5).fill(null)),
            initialPlayers: initialState.initialPlayers,
            initialMyPlayer: me,
            initialOpponent: opponent,
            initialIsMyTurn: isStartingTurn,
            initialStatus: statusText,
            initialIsLoading: false 
        };
    };

    const {
        initialGrid,
        initialPlayers,
        initialMyPlayer,
        initialOpponent,
        initialIsMyTurn,
        initialStatus,
        initialIsLoading
    } = getInitialGameState();

    const [grid, setGrid] = useState<GridState>(initialGrid);
    const [players, setPlayers] = useState<PlayerInfo[]>(initialPlayers); 
    const [myPlayerInfo, setMyPlayerInfo] = useState<PlayerInfo | null>(initialMyPlayer);
    const [opponentInfo, setOpponentInfo] = useState<PlayerInfo | null>(initialOpponent);
    const [isMyTurn, setIsMyTurn] = useState(initialIsMyTurn);
    const [gameStatusText, setGameStatusText] = useState(initialStatus);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winnerId, setWinnerId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(initialIsLoading); 

    const defaultProfilePic = "https://th.bing.com/th/id/OIP.eMLmzmhAqRMxUZad3zXE5QHaHa?rs=1&pid=ImgDetMain";

    const handleMoveMade = useCallback((data: { grid: GridState; nextTurnUserId: string; move: { row: number; col: number; color: string } }) => {
        console.log("Received move_made:", data);
        setGrid(data.grid);
        const myUserId = user?._id || user?.userId;
        const nextTurnIsMine = data.nextTurnUserId === myUserId;
        setIsMyTurn(nextTurnIsMine);
        setGameStatusText(nextTurnIsMine ? 'Your Turn' : "Opponent's Turn");
    }, [user]); // Depend on user

    const handleGameEnd = useCallback((data: { result: string; winnerId: string | null; finalGrid: GridState; playerCoinUpdates?: {userId: string, _id?: string, coins: number}[], reason?: string, forfeiterId?: string}) => {
        console.log("Received game_end:", data);
        setGrid(data.finalGrid);
        setIsGameOver(true);
        setIsMyTurn(false);
        setWinnerId(data.winnerId);

        const myUserId = user?._id || user?.userId;
        const myUpdate = data.playerCoinUpdates?.find(p => (p._id || p.userId) === myUserId);
        if (myUpdate) {
            updateUserCoins(myUpdate.coins);
        }

        let status = "Status: ";
        if (data.reason === 'opponent_disconnected') {
            status += "Opponent Disconnected. You Won!";
        } else if (data.reason === 'forfeit') {
            const forfeiterIsMe = data.forfeiterId === myUserId;
             status += forfeiterIsMe ? "You Forfeited." : "Opponent Forfeited. You Won!";
        } else if (data.result === 'draw') {
            status += "Draw!";
        } else {
             const winnerIsMe = data.winnerId === myUserId;
             if (winnerIsMe) {
                 status += "You Won! (+200 coins)";
             } else {
                 const myCurrentCoins = myUpdate?.coins ?? user?.coins ?? 0;
                 const lostCoins = (user?.coins ?? 0) > myCurrentCoins;
                 if (lostCoins && myCurrentCoins <= 0) {
                     status += "You Lost (0 coins remaining)";
                 } else if (lostCoins) {
                     status += "You Lost (-200 coins)";
                 } else {
                     status += "You Lost";
                 }
             }
        }
        setGameStatusText(status);

    }, [user, updateUserCoins]); 

    const handleGameError = useCallback((data: { message: string }) => {
        console.error("Game Error:", data.message);
        setGameStatusText(`Error: ${data.message}`);
        setIsGameOver(true);
        setIsMyTurn(false);
    }, []);

    const handleInvalidMove = useCallback((data: { message: string }) => {
        console.warn("Invalid Move:", data.message);
        const originalStatus = gameStatusText;
        setGameStatusText(`Invalid Move: ${data.message}`);
        setTimeout(() => {
            setGameStatusText(prevStatus => (prevStatus.startsWith("Invalid Move:") ? originalStatus : prevStatus));
        }, 1500);
    }, [gameStatusText]); 
    useEffect(() => {
        if (!socket) {
            console.error("Socket not available in GameplayPage useEffect.");
            setGameStatusText("Error: Connection lost. Please return home.");
            setIsLoading(false); 
            return;
        }
        if (isLoading) {
             console.log("GameplayPage waiting for initial state...");
            return;
        }

        console.log(`GameplayPage effect running for game ${gameId}. Setting up listeners.`);

        socket.on('move_made', handleMoveMade);
        socket.on('game_end', handleGameEnd);
        socket.on('game_error', handleGameError);
        socket.on('invalid_move', handleInvalidMove);


        return () => {
            console.log(`GameplayPage unmounting for game ${gameId}. Cleaning up listeners.`);
            socket.off('move_made', handleMoveMade);
            socket.off('game_end', handleGameEnd);
            socket.off('game_error', handleGameError);
            socket.off('invalid_move', handleInvalidMove);
        };
    }, [socket, gameId, isLoading, navigate, handleMoveMade, handleGameEnd, handleGameError, handleInvalidMove]);

    // --- Actions ---
    const handleCellClick = (row: number, col: number) => {
        const myUserId = user?._id || user?.userId;
        if (!isGameOver && isMyTurn && socket && gameId && myUserId) {
            console.log(`Player ${user?.username} clicking cell (${row}, ${col})`);
            emitMakeMove({ gameId, userId: myUserId, row, col });
        } else {
             console.log("Cell click ignored:", { isGameOver, isMyTurn, socket, gameId, myUserId });
        }
    };

    const handleForfeit = () => {
        const myUserId = user?._id || user?.userId;
        if (!isGameOver && socket && gameId && myUserId) {
             if (window.confirm("Are you sure you want to forfeit? This will count as a loss.")) {
                 console.log(`Player ${user?.username} forfeiting game ${gameId}`);
                 emitForfeitGame({ gameId, userId: myUserId });
             }
        }
    };

    const handlePlayAgain = () => {
        if (user) {
            emitFindMatch({
                userId: user._id || user.userId,
                username: user.username,
                profile_picture_url: user.profile_picture_url,
            });
        }
        navigate('/newgame/waiting');
    };

    // --- Render Logic ---
    if (isLoading) {
        return <div className="game-container"><h1 style={{fontFamily: '"Press Start 2P", cursive'}}>Loading game details...</h1></div>;
    }

    if (!myPlayerInfo || !opponentInfo) {
        return <div className="game-container"><h1 style={{fontFamily: '"Press Start 2P", cursive'}}>Error loading player information.</h1><button onClick={() => navigate('/home')}>Go Home</button></div>;
    }


    return (
        <main className="game-container">
            <div className="players-header">
                <div className="player">
                    <img
                         src={myPlayerInfo.profilePic || myPlayerInfo.profile_picture_url || defaultProfilePic}
                         alt={myPlayerInfo.username}
                         style={{ width: '80px', height: '80px', borderRadius: '50%', border: `3px solid ${myPlayerInfo.color}` }}
                         onError={(e) => { (e.target as HTMLImageElement).src = defaultProfilePic; }}
                     />
                    <span>{myPlayerInfo.username} (You)</span>
                     <div style={{ width: '20px', height: '20px', backgroundColor: myPlayerInfo.color, borderRadius: '50%', marginTop: '5px', border: '1px solid white' }}></div>
                </div>

                <span className="vs">VS</span>

                <div className="player">
                     <img
                         src={opponentInfo.profilePic || opponentInfo.profile_picture_url || defaultProfilePic}
                         alt={opponentInfo.username}
                         style={{ width: '80px', height: '80px', borderRadius: '50%', border: `3px solid ${opponentInfo.color}` }}
                         onError={(e) => { (e.target as HTMLImageElement).src = defaultProfilePic; }}
                     />
                    <span>{opponentInfo.username}</span>
                     <div style={{ width: '20px', height: '20px', backgroundColor: opponentInfo.color, borderRadius: '50%', marginTop: '5px', border: '1px solid white' }}></div>
                </div>
            </div>

            <GameBoard
                grid={grid}
                playerColor={myPlayerInfo.color}
                myTurn={isMyTurn}
                onCellClick={handleCellClick}
                disabled={isGameOver || !isMyTurn} // Disable clicks if game over or not my turn
            />

            <GameStatus
                statusText={gameStatusText}
                isGameOver={isGameOver}
                showForfeit={!isGameOver}
                onForfeit={handleForfeit}
                onPlayAgain={handlePlayAgain}
                forfeitDisabled={isGameOver} // Can only forfeit if game is running
            />
        </main>
    );
};

export default GameplayPage;