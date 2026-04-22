import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gameService from '../services/gameService'; 
import "../styles/history.css"; 

interface HistoryEntry {
    game_id: string;
    opponentUsername: string;
    result: string; 
}

const HistoryListPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true); 
            setError(null);
            console.log('[HistoryListPage] useEffect triggered. Auth loading:', authLoading, 'User:', user);

            if (authLoading) {
                console.log('[HistoryListPage] Waiting for authentication check...');
                return;
            }

            if (!user) {
                console.error('[HistoryListPage] Error: User not logged in.');
                setError("Please log in to view your game history.");
                setLoading(false); 
                return;
            }

            const userIdToFetch = user._id || user.userId; 

            if (!userIdToFetch) {
                console.error('[HistoryListPage] Error: User object exists, but ID property (_id or userId) is missing.', user);
                setError("Could not retrieve your user ID. Please try logging in again.");
                setLoading(false); 
                return;
            }

            console.log(`[HistoryListPage] Auth checked. Fetching history for userId: ${userIdToFetch}`);

            try {
                const historyData = await gameService.getHistory(userIdToFetch);
                setHistory(historyData);
                console.log("[HistoryListPage] History data received:", historyData);
            } catch (err: any) {
                console.error("[HistoryListPage] Failed to fetch history:", err);
                setError(err.message || 'Could not load game history.');
            } finally {
                setLoading(false); 
            }
        };

        fetchHistory();

    }, [user, authLoading]); 
    if (authLoading) {
         return <div className="history-container"><p>Loading user data...</p></div>;
    }

    return (
        <main className="history-container">
            <h1 className="history-title">Your Game History</h1>

            {loading && <p>Loading history...</p>}

            {error && <p style={{ color: '#ff416c' }}>Error: {error}</p>}

            {!loading && !error && history.length === 0 && (
                <p>No games played yet!</p>
            )}

            {!loading && !error && history.length > 0 && (
                <ul className="history-list">
                    {history.map((game) => (
                        <li key={game.game_id}>
                            <Link to={`/history/${game.game_id}`}>
                                Game #{game.game_id} — {game.opponentUsername} — {game.result}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
};

export default HistoryListPage;