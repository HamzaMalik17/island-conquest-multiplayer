import Game from '../models/Game.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Get game history for a user
// @route   GET /api/games/history?userId=<userId>
// @access  Public (as per user request to skip middleware)
export const getGameHistory = async (req, res) => {
    const userId = req.query.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Valid User ID required as query parameter' });
    }

    try {
        const games = await Game.find({
            $or: [{ player1_id: userId }, { player2_id: userId }],
        })
        .populate('player1_id', 'username') 
        .populate('player2_id', 'username')
        .sort({ game_started_at: -1 }); 

        if (!games) {
            return res.json([]); 
        }

        const formattedHistory = games.map(game => {
            const isPlayer1 = game.player1_id._id.toString() === userId;
            const opponent = isPlayer1 ? game.player2_id : game.player1_id;
            let resultText = 'Draw';

            if (game.result.includes('forfeit')) {
                 if ((game.result === 'player1_forfeit' && isPlayer1) || (game.result === 'player2_forfeit' && !isPlayer1)) {
                     resultText = 'Lost (Forfeit)';
                 } else {
                      resultText = 'Won (Forfeit)';
                 }
            } else if (game.result === 'draw') {
                resultText = 'Draw';
            } else if ((game.result === 'player1_won' && isPlayer1) || (game.result === 'player2_won' && !isPlayer1)) {
                resultText = 'Won';
            } else {
                resultText = 'Lost';
            }

            return {
                game_id: game._id, 
                opponentUsername: opponent ? opponent.username : 'Unknown',
                result: resultText,
            };
        });

        res.json(formattedHistory);
    } catch (error) {
        console.error("Error fetching game history:", error);
        res.status(500).json({ message: 'Server Error fetching history', error: error.message });
    }
};

// @desc    Get snapshot of a specific game
// @route   GET /api/games/history/:game_id?userId=<userId>
// @access  Public
export const getGameSnapshot = async (req, res) => {
    const userId = req.query.userId;
    const gameId = req.params.game_id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
         return res.status(400).json({ message: 'Valid User ID required as query parameter' });
    }
    if (!gameId) {
         return res.status(400).json({ message: 'Game ID required in path' });
    }
    try {
        const game = await Game.findById(gameId)
            .populate('player1_id', 'username profile_picture_url')
            .populate('player2_id', 'username profile_picture_url');

        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        const isPlayer1 = game.player1_id._id.toString() === userId;
        const isPlayer2 = game.player2_id._id.toString() === userId;

        if (!isPlayer1 && !isPlayer2) {
             return res.status(403).json({ message: 'You did not participate in this game.' });
        }

         let resultText = 'Draw';
         let resultClass = 'draw'; 
         if (game.result.includes('forfeit')) {
             if ((game.result === 'player1_forfeit' && isPlayer1) || (game.result === 'player2_forfeit' && isPlayer2)) {
                 resultText = 'You Lost (Forfeit)';
                 resultClass = 'lost';
             } else {
                 resultText = 'You Won (Forfeit)';
                  resultClass = 'won';
             }
         } else if (game.result === 'draw') {
             resultText = 'Draw';
             resultClass = 'draw';
         } else if ((game.result === 'player1_won' && isPlayer1) || (game.result === 'player2_won' && isPlayer2)) {
             resultText = 'You Won!';
              resultClass = 'won';
         } else {
             resultText = 'You Lost';
              resultClass = 'lost';
         }


        res.json({
            game_id: game._id,
            player1: game.player1_id,
            player2: game.player2_id,
            player1_color: game.player1_color,
            player2_color: game.player2_color,
            final_grid: game.final_grid,
            result_perspective: resultText, 
            result_class: resultClass, 
            db_result: game.result, 
            winner_id: game.winner_id,
        });

    } catch (error) {
         console.error("Error fetching game snapshot:", error);
        res.status(500).json({ message: 'Server Error fetching snapshot', error: error.message });
    }
};

// @desc    Get leaderboard data
// @route   GET /api/games/leaderboard?search=<username>
// @access  Public
export const getLeaderboard = async (req, res) => {
    const searchQuery = req.query.search || '';
    const limit = parseInt(req.query.limit) || 50; 

    try {
        const query = searchQuery
            ? { username: { $regex: searchQuery, $options: 'i' } } 
            : {};

        const users = await User.find(query)
            .sort({ coins: -1 }) 
            .limit(limit)
            .select('username coins'); 

        const leaderboardData = await Promise.all(users.map(async (user) => {
            const userId = user._id;
            const wins = await Game.countDocuments({ winner_id: userId });
            const losses = await Game.countDocuments({
                 $or: [
                    { player1_id: userId, result: { $in: ['player2_won', 'player1_forfeit']} },
                    { player2_id: userId, result: { $in: ['player1_won', 'player2_forfeit']} }
                 ]
             });
             const draws = await Game.countDocuments({
                  $or: [{ player1_id: userId }, { player2_id: userId }],
                  result: 'draw'
              });

            return {
                username: user.username,
                wins: wins,
                losses: losses,
                draws: draws,
                coin_balance: user.coins,
            };
        }));

        res.json(leaderboardData);

    } catch (error) {
         console.error("Error fetching leaderboard:", error);
        res.status(500).json({ message: 'Server Error fetching leaderboard', error: error.message });
    }
};