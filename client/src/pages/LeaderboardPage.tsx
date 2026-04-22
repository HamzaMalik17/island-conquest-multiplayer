import React, { useState, useEffect } from 'react';
import gameService from '../services/gameService'; 
import "../styles/leaderboard.css";

interface LeaderboardEntry {
    username: string;
    wins: number;
    losses: number;
    draws: number;
    coin_balance: number;
}

const LeaderboardPage: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLeaderboard = async (search: string) => {
        try {
            setLoading(true);
            setError(null);
            const data = await gameService.getLeaderboard(search);
            setLeaderboard(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load leaderboard.');
            console.error("Leaderboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard('');
    }, []);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchLeaderboard(searchTerm);
        }, 300); 

        return () => clearTimeout(debounceTimer);
    }, [searchTerm]);

    return (
        <main className="board-container">
            <h1 className="board-title">Leaderboard</h1>
            <input
                id="searchInput"
                type="text"
                placeholder="Search by username…"
                className="search-box"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {loading && <p>Loading leaderboard...</p>}
            {error && <p style={{ color: '#ff416c' }}>Error: {error}</p>}

            {!loading && !error && (
                <table className="board-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Wins</th>
                            <th>Losses</th>
                            <th>Draws</th>
                            <th>Coins</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.length > 0 ? (
                             leaderboard.map((player, index) => (
                                <tr key={player.username + index}>
                                    <td>{player.username}</td>
                                    <td>{player.wins}</td>
                                    <td>{player.losses}</td>
                                    <td>{player.draws}</td>
                                    <td>{player.coin_balance}</td>
                                </tr>
                             ))
                         ) : (
                             <tr>
                                 <td colSpan={5}>No players found.</td>
                             </tr>
                         )}
                    </tbody>
                </table>
            )}
        </main>
    );
};

export default LeaderboardPage;