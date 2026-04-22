import axios from 'axios';
const API_URL = 'http://localhost:8000/api/auth'; 

/**
 * Registers a new user.
 * @param {string} username - The desired username.
 * @param {string} password - The user's password.
 * @param {string} [profile_picture_url=''] - Optional URL for the profile picture.
 * @returns {Promise<object>} - The user data returned upon successful signup.
 * @throws {Error} - Throws an error if the API call fails or signup is unsuccessful.
 */
const signup = async (username, password, profile_picture_url = '') => {
    if (!username || !password) {
        throw new Error('Username and password are required for signup.');
    }
    try {
        const response = await axios.post(`${API_URL}/signup`, {
            username,
            password,
            profile_picture_url, 
        });

        return response.data;
    } catch (error) {
        console.error("Signup error:", error.response || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Signup failed. Please try again.');
    }
};

/**
 * Logs in an existing user.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise<object>} - The user data returned upon successful login.
 * @throws {Error} - Throws an error if the API call fails or login is unsuccessful.
 */
const login = async (username, password) => {
    if (!username || !password) {
        throw new Error('Username and password are required for login.');
    }
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username,
            password,
        });
        return response.data;
    } catch (error) {
        console.error("Login error:", error.response || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Login failed. Please check username/password.');
    }
};

/**
 * Logs the user out (client-side).
 * In this setup without tokens, it primarily signals the AuthContext to clear the user state.
 * Socket disconnection should be handled separately, likely triggered by the context change.
 */
const logout = () => {
    // No API call needed for logout in this setup
    // The AuthContext's logout function handles clearing client-side state.
    // Socket disconnection is handled in AuthContext/SocketContext useEffect hooks.
    console.log("Logout function called (client-side state clear handled by AuthContext)");
};

export default {
    signup,
    login,
    logout,
};
