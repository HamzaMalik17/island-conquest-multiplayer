import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext'; 
import { useAuth } from '../context/AuthContext'; 
import { emitCancelMatchmaking } from '../services/socketService';
import "../styles/waiting.css"; 
import "../styles/matchfound.css"; 

interface PlayerInfo {
    _id?: string;
    userId?: string;
    username: string;
    profilePic?: string;
    profile_picture_url?: string;
}

interface OpponentInfo {
    userId: string;
    _id?: string;
    username: string;
    profilePic?: string;
    profile_picture_url?: string; 
}

interface AuthenticatedUser {
    _id?: string; 
    userId?: string; 
    username: string;
    profile_picture_url?: string;
}

const WaitingPage: React.FC = () => {
    console.log("WaitingPage component rendering");
    const socket = useSocket();
    const { user } = useAuth() as { user: AuthenticatedUser | null }; 
    const navigate = useNavigate();

    const [status, setStatus] = useState<'loading' | 'waiting' | 'found' | 'starting' | 'error'>('loading');
    const [opponent, setOpponent] = useState<OpponentInfo | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const isSetupComplete = useRef(false);
    const currentStatusRef = useRef(status); 

    useEffect(() => {
        currentStatusRef.current = status;
    }, [status]);

    const defaultProfilePic = "https://th.bing.com/th/id/OIP.eMLmzmhAqRMxUZad3zXE5QHaHa?rs=1&pid=ImgDetMain";

    const handleStartGame = useCallback((data: { gameId: string; players: PlayerInfo[]; startingPlayerId: string }) => {
        if (!user) return;
        console.log('Game starting:', data);
        const currentUserId = user._id || user.userId;
        const opponentData = data.players.find(p => (p._id || p.userId) !== currentUserId);
        setOpponent(opponentData || null);
        setStatus('found');
    
        setTimeout(() => {
            setStatus('starting');
            console.log(`Navigating to /newgame/${data.gameId} with state`);
            navigate(`/newgame/${data.gameId}`, {
                replace: true, 
                state: {
                    initialPlayers: data.players, 
                    startingPlayerId: data.startingPlayerId 
                }
            });
        }, 2500);
    }, [navigate, user]); 

    const handleWaiting = useCallback(() => {
        console.log("Server confirmed: Waiting for opponent.");
        setStatus(prevStatus => (prevStatus === 'loading' || prevStatus === 'error' ? 'waiting' : prevStatus));
        setErrorMessage(null);
    }, []);

    const handleAlreadyWaiting = useCallback(() => {
        console.warn("Server indicated: Already in the matchmaking queue.");
         setStatus(prevStatus => (prevStatus === 'loading' ? 'waiting' : prevStatus));
         setErrorMessage(null); 
    }, []);

    const handleAlreadyInGame = useCallback(() => {
        console.error("Server indicated: User is already in an active game.");
        setErrorMessage("You appear to be in an active game already. Please resolve or finish it.");
        setStatus('error');
        setTimeout(() => navigate('/home'), 4000);
    }, [navigate]);

    const handleMatchmakingError = useCallback((data: { message: string }) => {
        console.error("Received matchmaking_error:", data.message);
        setErrorMessage(data.message || "An unexpected matchmaking error occurred.");
        setStatus('error');
    }, []);

     const handleMatchmakingCancelled = useCallback(() => {
         console.log("Matchmaking was successfully cancelled (confirmed by server or initiated locally).");
         isSetupComplete.current = false; 
         if (currentStatusRef.current !== 'error') {
            navigate('/home');
         }
     }, [navigate]);

    useEffect(() => {
        console.log("WaitingPage main effect running. Status:", status);

        if (!socket || !user) {
            console.log("Waiting for socket or user...");
            setStatus('loading'); 
            const timer = setTimeout(() => {
                if (!isSetupComplete.current && currentStatusRef.current === 'loading') {
                    console.error("Socket or User context did not become available in time.");
                    setErrorMessage("Failed to initialize connection. Please try again.");
                    setStatus('error');
                }
            }, 5000); 

            return () => clearTimeout(timer); 
        }

        const userId = user._id || user.userId;
        if (!userId || !user.username) {
             console.error("User object is missing required fields (userId/username).", user);
             setErrorMessage("User data incomplete. Please re-login.");
             setStatus('error');
              setTimeout(() => navigate('/login'), 3000); 
             return;
        }

        console.log("Socket and user available. Setting up listeners.");
        setStatus(prevStatus => (prevStatus === 'loading' ? 'waiting' : prevStatus)); 

        socket.on('start_game', handleStartGame);
        socket.on('waiting_for_opponent', handleWaiting);
        socket.on('already_waiting', handleAlreadyWaiting);
        socket.on('already_in_game', handleAlreadyInGame);
        socket.on('matchmaking_error', handleMatchmakingError);
         socket.on('matchmaking_cancelled', handleMatchmakingCancelled); 

        isSetupComplete.current = true; 

        return () => {
            console.log("Cleaning up WaitingPage listeners for user:", userId);
            socket.off('start_game', handleStartGame);
            socket.off('waiting_for_opponent', handleWaiting);
            socket.off('already_waiting', handleAlreadyWaiting);
            socket.off('already_in_game', handleAlreadyInGame);
            socket.off('matchmaking_error', handleMatchmakingError);
             socket.off('matchmaking_cancelled', handleMatchmakingCancelled);
            if (currentStatusRef.current === 'waiting' && isSetupComplete.current) {

                 console.log("WaitingPage unmounting while 'waiting', attempting to cancel matchmaking.");
                 emitCancelMatchmaking(userId);
            }
            isSetupComplete.current = false; 
        };
    }, [socket, user, navigate, handleStartGame, handleWaiting, handleAlreadyWaiting, handleAlreadyInGame, handleMatchmakingError, handleMatchmakingCancelled]);


    const handleCancel = () => {
        const userId = user?._id || user?.userId;
        if (socket && userId && status === 'waiting') {
             console.log("User clicked Cancel button for:", userId);
             emitCancelMatchmaking(userId);
             navigate('/home');
        }
    };

    const handleRetry = () => {
        console.log("User clicked Retry button.");
        setStatus('loading'); 
        setErrorMessage(null);
        isSetupComplete.current = false; 
    };

    if (status === 'loading') {
        return (
            <main className="waiting-container">
                <h1 className="waiting-title">Initializing...</h1>
                <div className="spinner"></div> 
                <p className="waiting-subtitle">Connecting to matchmaking...</p>
            </main>
        );
    }

    if (status === 'found' || status === 'starting') {
        return (
            <main className="found-container">
                <h1 className="found-title">Match Found!</h1>
                {opponent ? (
                     <div className="opponent-info">
                        <img
                            src={opponent.profilePic || opponent.profile_picture_url || defaultProfilePic}
                            alt={opponent.username}
                            className="opponent-pic" 
                            onError={(e) => { (e.target as HTMLImageElement).src = defaultProfilePic; }}
                        />
                        <p className="opponent-name">{opponent.username}</p>
                    </div>
                 ) : (
                    <p>Loading opponent details...</p>
                 )}
                <p className="found-subtitle">
                    {status === 'starting' ? 'Starting game...' : 'Prepare yourself!'}
                </p>
                 {status === 'starting' && <div className="spinner"></div>}
            </main>
        );
    }

    return (
        <main className="waiting-container">
            <h1 className="waiting-title">
                {status === 'error' ? 'Matchmaking Error' : 'Finding Opponent...'}
            </h1>

            {errorMessage ? (
                 <p className="waiting-subtitle error-message">{errorMessage}</p> 
             ) : (
                 <p className="waiting-subtitle">Searching for a worthy adversary...</p>
             )}

             {status === 'waiting' && <div className="spinner"></div>} 

            <div className="button-group" style={{ marginTop: '1.5rem' }}>
                {status === 'waiting' && (
                    <button onClick={handleCancel} id="cancelBtn" className="btn btn-secondary">
                        Cancel Search
                    </button>
                )}
                {status === 'error' && (
                    <>
                        <button onClick={handleRetry} className="btn btn-primary" style={{ marginRight: '1rem' }}>
                            Try Again
                        </button>
                        <button onClick={() => navigate('/home')} className="btn btn-secondary">
                            Back to Home
                        </button>
                    </>
                )}
            </div>
        </main>
    );
};

export default WaitingPage;
