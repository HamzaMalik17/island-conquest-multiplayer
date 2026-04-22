import axios from 'axios';

const API_URL = 'http://localhost:8000/api/games'; 

/**
 * Fetches the game history for a specific user.
 * @param {string} userId - The ID of the user whose history is requested.
 * @returns {Promise<Array>} - An array of formatted game history entries.
 * @throws {Error} - Throws an error if the API call fails.
 */
const getHistory = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required to fetch history.');
    }
    try {
        const response = await axios.get(`${API_URL}/history`, {
            params: { userId } 
        });
        return response.data; 
    } catch (error) {
        console.error("Error fetching game history:", error.response || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch game history.');
    }
};

/**
 * Fetches the detailed snapshot of a specific game.
 * @param {string} gameId - The ID of the game to fetch.
 * @param {string} userId - The ID of the user requesting the snapshot (for perspective).
 * @returns {Promise<object>} - The game snapshot data.
 * @throws {Error} - Throws an error if the API call fails.
 */
const getGameSnapshot = async (gameId, userId) => {
    if (!gameId) {
        throw new Error('Game ID is required to fetch snapshot.');
    }
     if (!userId) {
        throw new Error('User ID is required to fetch snapshot.');
    }
    try {
        const response = await axios.get(`${API_URL}/history/${gameId}`, {
             params: { userId }
        });
        return response.data;
    } catch (error) {
         console.error("Error fetching game snapshot:", error.response || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch game details.');
    }
};

/**
 * Fetches the leaderboard data, optionally filtering by username.
 * @param {string} [searchTerm=''] - The username search term (optional).
 * @returns {Promise<Array>} - An array of leaderboard entries.
 * @throws {Error} - Throws an error if the API call fails.
 */
const getLeaderboard = async (searchTerm = '') => {
    try {
        const response = await axios.get(`${API_URL}/leaderboard`, {
            params: { search: searchTerm }
        });
        return response.data; 
    } catch (error) {
         console.error("Error fetching leaderboard:", error.response || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch leaderboard.');
    }
};

export default {
    getHistory,
    getGameSnapshot,
    getLeaderboard
};
