import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import gameService from '../services/gameService'; 
import "../styles/history-detail.css"; 

interface PlayerDetail {
    _id: string;
    username: string;
    profile_picture_url?: string;
}
interface GameSnapshot {
    game_id: string;
    player1: PlayerDetail;
    player2: PlayerDetail;
    player1_color: string;
    player2_color: string;
    final_grid: (string | null)[][];
    result_perspective: string; 
    result_class: 'won' | 'lost' | 'draw'; 
}

interface AuthenticatedUser {
    _id?: string;
    userId?: string;
    username: string;
}

const HistoryDetailPage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    // Get user and loading state from AuthContext
    const { user, loading: authLoading } = useAuth() as { user: AuthenticatedUser | null, loading: boolean };
    const [snapshot, setSnapshot] = useState<GameSnapshot | null>(null);
    const [loading, setLoading] = useState<boolean>(true); 
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        const fetchSnapshot = async () => {
            setLoading(true); 
            setError(null);
             console.log('[HistoryDetailPage] useEffect triggered. Auth loading:', authLoading, 'User:', user, 'Game ID:', gameId);

             if (authLoading) {
                 console.log('[HistoryDetailPage] Waiting for authentication check...');
                 return; 
             }

             if (!user) {
                  console.error('[HistoryDetailPage] Error: User not logged in.');
                  setError("Please log in to view game details.");
                  setLoading(false);
                  return;
             }
             if (!gameId) {
                  console.error('[HistoryDetailPage] Error: Game ID missing from route parameters.');
                  setError("Game ID not specified.");
                  setLoading(false);
                  return;
             }

            const userIdToFetch = user._id || user.userId; 

            if (!userIdToFetch) {
                 console.error('[HistoryDetailPage] Error: User object exists, but ID property (_id or userId) is missing.', user);
                 setError("Could not retrieve your user ID. Please try logging in again.");
                 setLoading(false);
                 return;
            }

             console.log(`[HistoryDetailPage] Auth checked. Fetching snapshot for gameId: ${gameId}, userId: ${userIdToFetch}`);

            try {
                const data = await gameService.getGameSnapshot(gameId, userIdToFetch);
                setSnapshot(data);
                 console.log("[HistoryDetailPage] Snapshot data received:", data);
            } catch (err: any) {
                 setError(err.message || 'Failed to load game details.');
                 console.error("[HistoryDetailPage] Snapshot fetch error:", err);
            } finally {
                setLoading(false); 
            }
        };

        fetchSnapshot();
    }, [gameId, user, authLoading]);


     const renderGrid = (gridData: (string | null)[][]) => {
         const gridStyle: React.CSSProperties = {
             display: 'grid',
             gridTemplateColumns: 'repeat(5, 50px)',
             gridTemplateRows: 'repeat(5, 50px)',
             gap: '4px',
             justifyContent: 'center',
             marginBottom: '2rem'
         };
         const cellBaseStyle: React.CSSProperties = {
             width: '50px', height: '50px',
             background: 'rgba(255,255,255,0.1)', border: '2px solid #fff',
             borderRadius: '4px', boxSizing: 'border-box'
         };
         return (
             <div className="grid" style={gridStyle}>
                 {gridData.flat().map((cellColor, index) => { 
                    const cellStyle = { ...cellBaseStyle };
                    if (cellColor) { cellStyle.backgroundColor = cellColor; }
                    return <div key={index} className="cell" style={cellStyle}></div>;
                 })}
             </div>
         );
     };


    if (authLoading) {
         return <div className="snapshot-container"><p>Loading user data...</p></div>;
    }

    if (loading) {
         return <div className="snapshot-container"><p>Loading game details...</p></div>;
    }

    if (error) {
         return <div className="snapshot-container"><p style={{ color: '#ff416c' }}>Error: {error}</p><Link to="/history" className="btn btn-secondary">Back to History</Link></div>;
    }

    if (!snapshot) {
         return <div className="snapshot-container"><p>Game data not found.</p><Link to="/history" className="btn btn-secondary">Back to History</Link></div>;
    }

    return (
        <main className="snapshot-container">
            <h1 className="snapshot-title">
                Game #{snapshot.game_id} Result: {} 
                <span className={`result ${snapshot.result_class}`}>
                     {snapshot.result_perspective}
                 </span>
            </h1>
             <p style={{ marginBottom: '1.5rem', wordBreak: 'break-all' }}> 
                 {snapshot.player1.username} (<span style={{ color: snapshot.player1_color, fontWeight: 'bold' }}>{snapshot.player1_color}</span>)
                 vs
                 {snapshot.player2.username} (<span style={{ color: snapshot.player2_color, fontWeight: 'bold' }}>{snapshot.player2_color}</span>)
             </p>

            {renderGrid(snapshot.final_grid)}

            <Link to="/history" className="btn btn-secondary">Back to History</Link>
        </main>
    );
};

export default HistoryDetailPage;