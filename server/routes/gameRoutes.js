import express from 'express';
import { getGameHistory, getGameSnapshot, getLeaderboard } from '../controllers/gameController.js';

const router = express.Router();
router.get('/history', getGameHistory); 
router.get('/history/:game_id', getGameSnapshot); 


router.get('/leaderboard', getLeaderboard); 

export default router;