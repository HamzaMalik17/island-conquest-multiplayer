import User from '../models/User.js';
export const signup = async (req, res) => {
    const { username, password, profile_picture_url } = req.body;
    console.log("Signup attempt for username:", username);
    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const user = await User.create({
            username,
            password, 
            profile_picture_url,
        });

        if (user) {
            const userResponse = user.toObject();
            delete userResponse.password;

            res.status(201).json({
                 _id: user._id,
                 username: user.username,
                 profile_picture_url: user.profile_picture_url,
                 coins: user.coins,
                             });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error("!!!! SIGNUP ERROR !!!!:", error); 
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Authenticate user & get token (or set session)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username }).select('+password');
        const isMatch = user && user.password === password;

        if (isMatch) {
             const userResponse = user.toObject();
             delete userResponse.password;



            res.status(200).json({
                _id: user._id,
                 username: user.username,
                 profile_picture_url: user.profile_picture_url,
                 coins: user.coins,
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};