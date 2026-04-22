import User from '../models/User.js';
import mongoose from 'mongoose'; 

// @desc    Get user profile (Identifies user via query parameter)
// @route   GET /api/users/profile?userId=<userId>
// @access  Public (Not Recommended for Production without Auth)
export const getUserProfile = async (req, res) => {
    const userId = req.query.userId;
    // console.log("[getUserProfile] Received request query:", req.query);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
       console.error("[getUserProfile] FAIL: Invalid or missing User ID in query parameters.");
       return res.status(400).json({ message: 'Valid User ID required as query parameter' });
    }

    try {
        const user = await User.findById(userId); 

        if (user) {
            console.log(`[getUserProfile] Found user: ${user.username}`);
            res.status(200).json(user);
        } else {
            console.warn(`[getUserProfile] WARN: User not found for ID: ${userId}`);
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
         console.error(`[getUserProfile] Server Error for user ${userId}:`, error);
         res.status(500).json({ message: 'Server Error fetching profile', error: error.message });
    }
};


// @desc    Update user profile (Identifies user via request body)
// @route   PUT /api/users/profile
// @access  Public (Not Recommended for Production without Auth)
export const updateUserProfile = async (req, res) => {
    console.log("--- Top of updateUserProfile Controller ---");
    console.log("[updateUserProfile] Received request body:", req.body);
    const { userId, username, password, profile_picture_url } = req.body; 

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error("[updateUserProfile] FAIL: Invalid or missing User ID in request body.");
        return res.status(400).json({ message: 'Valid User ID must be provided in the request body' });
    }


    try {
        const user = password
            ? await User.findById(userId).select('+password')
            : await User.findById(userId);


        if (user) {
            user.username = username !== undefined ? username.trim() : user.username;
            user.profile_picture_url = profile_picture_url !== undefined ? profile_picture_url : user.profile_picture_url;

            if (password) {
                console.log("[updateUserProfile] Updating password (HASHING REQUIRED FOR SECURITY)");
                user.password = password;
            }

            const updatedUser = await user.save();
            // console.log(`[updateUserProfile] User ${userId} updated successfully.`);

            const userResponse = updatedUser.toObject();
            delete userResponse.password;

            res.status(200).json(userResponse); 

        } else {
            console.warn(`[updateUserProfile] WARN: User not found for ID: ${userId}`);
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(`[updateUserProfile] Server Error for user ${userId}:`, error);
        if (error.code === 11000) { 
            return res.status(400).json({ message: 'Username already taken' });
        }
        res.status(500).json({ message: 'Server Error updating profile', error: error.message });
    }
};