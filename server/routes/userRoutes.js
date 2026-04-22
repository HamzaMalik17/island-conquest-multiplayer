import express from 'express';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';

const router = express.Router();
router.route('/profile').get(getUserProfile).put(updateUserProfile); 

export default router;