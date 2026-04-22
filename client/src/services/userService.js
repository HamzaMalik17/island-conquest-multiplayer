import axios from 'axios';

const API_URL = 'http://localhost:8000/api/users'; 

/**
 * Updates the user's profile information.
 * @param {string} userId - The ID of the user to update.
 * @param {object} updateData - An object containing the fields to update (e.g., { username, password, profile_picture_url }).
 * @returns {Promise<object>} - The updated user data from the server.
 * @throws {Error} - Throws an error if the API call fails.
 */
const updateProfile = async (userId, updateData) => {
    if (!userId) {
        throw new Error('User ID is required to update profile.');
    }
    if (!updateData || typeof updateData !== 'object') {
        throw new Error('Update data object is required.');
    }

    try {
        const response = await axios.put(`${API_URL}/profile`, { userId, ...updateData });
        return response.data; 
    } catch (error) {
        console.error("Error updating profile:", error.response || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Profile update failed. Please try again.');
    }
};

export default {
     updateProfile
};
