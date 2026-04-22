import { v4 as uuidv4 } from 'uuid';
import Game from '../models/Game.js'; 
import User from '../models/User.js'; 
import { maxAreaOfIsland } from '../utils/maxAreaOfIsland.js'; 

let waitingQueue = []; 
const activeGames = new Map(); 
const userSockets = new Map(); 
const userActiveGame = new Map(); 



const findUserInQueue = (userId) => waitingQueue.find(user => user.userId === userId);
const isUserInActiveGame = (userId) => userActiveGame.has(userId);
const removeUserFromQueue = (userId) => {
    const index = waitingQueue.findIndex(user => user.userId === userId);
    if (index !== -1) {
        waitingQueue.splice(index, 1);
        console.log(`[Queue] User ${userId} removed.`);
        return true;
    }
    return false;
};

const assignColors = () => {
    const colors = ['#FF453A', '#0A84FF']; 
    return Math.random() < 0.5 ? [colors[0], colors[1]] : [colors[1], colors[0]];
};

const calculateWinner = (grid, player1, player2) => {    const rows = 5;
    const cols = 5;
    let area1 = 0;
    let area2 = 0;

    try {
        const grid1 = Array(rows).fill(null).map(() => Array(cols).fill(0));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === player1.color) grid1[r][c] = 1;
            }
        }
        area1 = maxAreaOfIsland(grid1);

        const grid2 = Array(rows).fill(null).map(() => Array(cols).fill(0));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === player2.color) grid2[r][c] = 1;
            }
        }
        area2 = maxAreaOfIsland(grid2);
    } catch(error){
        console.error("Error calculating maxAreaOfIsland:", error);
        return { result: 'draw', winnerId: null, p1Area: 0, p2Area: 0 };
    }

    console.log(`[GameEnd] ${player1.username} (Color: ${player1.color}) Max Area: ${area1}`);
    console.log(`[GameEnd] ${player2.username} (Color: ${player2.color}) Max Area: ${area2}`);

    if (area1 > area2) return { result: 'player1_won', winnerId: player1.userId, p1Area: area1, p2Area: area2 };
    if (area2 > area1) return { result: 'player2_won', winnerId: player2.userId, p1Area: area1, p2Area: area2 };
    return { result: 'draw', winnerId: null, p1Area: area1, p2Area: area2 };
};

const COIN_CHANGE_WIN = 200;
const COIN_CHANGE_LOSS = -200;
const COIN_CHANGE_DRAW = 0;

const finalizeGame = async (io, gameId, reason, extraData = {}) => {  

    if (!['completed', 'forfeit', 'disconnect'].includes(reason)) {
        throw new Error('Invalid reason');
      }
    const game = activeGames.get(gameId);
    if (!game) {
        console.error(`[FinalizeGame] Game ${gameId} not found in activeGames.`);
        return;
    }

    console.log(`[FinalizeGame] Finalizing game ${gameId}. Reason: ${reason}`);

    let gameResultString = 'draw'; 
    let winnerId = null;
    let p1CoinChange = COIN_CHANGE_DRAW;
    let p2CoinChange = COIN_CHANGE_DRAW;
    let clientResultReason = reason; 

    if (reason === 'completed') {
        const { result, winnerId: determinedWinnerId } = calculateWinner(game.grid, game.players[0], game.players[1]);
        gameResultString = result; 
        winnerId = determinedWinnerId;
        if (result === 'player1_won') {
            p1CoinChange = COIN_CHANGE_WIN; p2CoinChange = COIN_CHANGE_LOSS;
        } else if (result === 'player2_won') {
            p1CoinChange = COIN_CHANGE_LOSS; p2CoinChange = COIN_CHANGE_WIN;
        }
    } else if (reason === 'forfeit') {
        const { forfeiterId } = extraData;
        const forfeiterIndex = game.players.findIndex(p => p.userId === forfeiterId);
        if (forfeiterIndex !== -1) {
            winnerId = game.players[1 - forfeiterIndex].userId;
            gameResultString = forfeiterIndex === 0 ? 'player1_forfeit' : 'player2_forfeit';
            p1CoinChange = forfeiterIndex === 0 ? COIN_CHANGE_LOSS : COIN_CHANGE_WIN;
            p2CoinChange = forfeiterIndex === 1 ? COIN_CHANGE_LOSS : COIN_CHANGE_WIN;
        } else {
             console.error(`[FinalizeGame: Forfeit] Forfeiter ${forfeiterId} not found.`);
             clientResultReason = 'error';
        }
    } else if (reason === 'disconnect') {
        const { disconnectedUserId } = extraData;
         const disconnectedIndex = game.players.findIndex(p => p.userId === disconnectedUserId);
         if (disconnectedIndex !== -1) {
             winnerId = game.players[1 - disconnectedIndex].userId;
             gameResultString = disconnectedIndex === 0 ? 'player1_disconnect' : 'player2_disconnect'; // Custom result
             p1CoinChange = disconnectedIndex === 0 ? COIN_CHANGE_LOSS : COIN_CHANGE_WIN;
             p2CoinChange = disconnectedIndex === 1 ? COIN_CHANGE_LOSS : COIN_CHANGE_WIN;
         } else {
             console.error(`[FinalizeGame: Disconnect] Disconnected user ${disconnectedUserId} not found.`);
             clientResultReason = 'error';
         }
    }


    let updatedUser1Data = null;
    let updatedUser2Data = null;
    try {
        const user1 = await User.findById(game.players[0].userId);
        const user2 = await User.findById(game.players[1].userId);

        if (!user1 || !user2) {
            throw new Error("One or both users not found in DB for final update.");
        }

        const user1Coins = Math.max(0, user1.coins + p1CoinChange);
        const user2Coins = Math.max(0, user2.coins + p2CoinChange);

        const user1UpdatePromise = User.findByIdAndUpdate(user1._id, { coins: user1Coins }, { new: true });
        const user2UpdatePromise = User.findByIdAndUpdate(user2._id, { coins: user2Coins }, { new: true });

        const gameCreatePromise = Game.create({
            roomId: game.gameId, 
            player1_id: game.players[0].userId,
            player2_id: game.players[1].userId,
            player1_color: game.players[0].color,
            player2_color: game.players[1].color,
            final_grid: game.grid,
            result: gameResultString, 
            winner_id: winnerId,
            game_ended_at: new Date()
        });

        const [updatedUser1, updatedUser2, savedGame] = await Promise.all([user1UpdatePromise, user2UpdatePromise, gameCreatePromise]);

        console.log(`[DB Update] Game ${savedGame._id} (roomId: ${game.gameId}) saved. Result: ${gameResultString}`);
        console.log(`[DB Update] User ${user1.username} coins updated to ${updatedUser1?.coins}`);
        console.log(`[DB Update] User ${user2.username} coins updated to ${updatedUser2?.coins}`);

        updatedUser1Data = updatedUser1;
        updatedUser2Data = updatedUser2;

    } catch (dbError) {
        console.error(`[DB Error] Failed to update DB for game ${game.gameId}:`, dbError);
        io.to(gameId).emit('game_error', { message: 'Failed to save game results.' });
    }

    const finalPayload = {
        result: gameResultString, 
        reason: clientResultReason, 
        winnerId: winnerId,
        finalGrid: game.grid,
        forfeiterId: reason === 'forfeit' ? extraData.forfeiterId : null,
        disconnectedUserId: reason === 'disconnect' ? extraData.disconnectedUserId : null,
        playerCoinUpdates: [ 
            { userId: game.players[0].userId, coins: updatedUser1Data?.coins ?? game.players[0].coins },
            { userId: game.players[1].userId, coins: updatedUser2Data?.coins ?? game.players[1].coins }
        ]
    };
    console.log(`>>> Emitting game_end to ${gameId}:`, finalPayload);
    io.to(gameId).emit('game_end', finalPayload);

    try {
         const socket1 = io.sockets.sockets.get(game.players[0].socketId);
         const socket2 = io.sockets.sockets.get(game.players[1].socketId);
         if (socket1) socket1.leave(gameId); else console.warn(`[Cleanup] Socket ${game.players[0].socketId} not found.`);
         if (socket2) socket2.leave(gameId); else console.warn(`[Cleanup] Socket ${game.players[1].socketId} not found.`);
    } catch(leaveError){
        console.error(`[Cleanup Error] Error making sockets leave room ${gameId}:`, leaveError);
    } finally {
         activeGames.delete(gameId);
         userActiveGame.delete(game.players[0].userId);
         userActiveGame.delete(game.players[1].userId);
         console.log(`[Cleanup] Game ${gameId} removed from active games. Active games count: ${activeGames.size}`);
    }
};


export const registerSocketHandlers = (io, socket) => {
    console.log(`[Connection] Socket connected: ${socket.id}`);

    socket.on('find_match', (userData) => {
        const { userId, username, profilePic } = userData;

        if (!userId || !username) { return; }
        console.log(`[find_match] User ${userId} (${username}) [${socket.id}] looking for match.`);
        userSockets.set(userId, socket.id);

        if (isUserInActiveGame(userId)) { return; }
        if (findUserInQueue(userId)) {  return; }

        waitingQueue.push({ userId, username, profilePic: profilePic || null, socketId: socket.id });
        console.log(`[find_match] User ${userId} added to queue. Queue size: ${waitingQueue.length}`);
        socket.emit('waiting_for_opponent');

        if (waitingQueue.length >= 2) {
            console.log("[find_match] Attempting to create match...");
            const player1Data = waitingQueue.shift();
            const player2Data = waitingQueue.shift();

            const [p1Color, p2Color] = assignColors();
            const gameId = uuidv4(); 
            const startingPlayerId = Math.random() < 0.5 ? player1Data.userId : player2Data.userId;

            const gameData = {
                gameId: gameId,
                players: [
                    { ...player1Data, color: p1Color },
                    { ...player2Data, color: p2Color }
                ],
                grid: Array(5).fill(null).map(() => Array(5).fill(null)),
                currentTurnUserId: startingPlayerId, 
                moves: 0,
                createdAt: new Date()
            };

            activeGames.set(gameId, gameData);
            userActiveGame.set(player1Data.userId, gameId);
            userActiveGame.set(player2Data.userId, gameId);

            console.log(`[find_match] Game ${gameId} created for ${player1Data.username} (${p1Color}) and ${player2Data.username} (${p2Color}). Starting: ${startingPlayerId}`);

            const socket1 = io.sockets.sockets.get(player1Data.socketId);
            const socket2 = io.sockets.sockets.get(player2Data.socketId);

            if (socket1) {
                 socket1.join(gameId);
                 console.log(`[Socket Room] Socket ${player1Data.socketId} joined room ${gameId}`);
            } else {
                 console.error(`[Socket Room Error] Socket ${player1Data.socketId} not found!`);
            }
            if (socket2) {
                 socket2.join(gameId);
                 console.log(`[Socket Room] Socket ${player2Data.socketId} joined room ${gameId}`);
            } else {
                console.error(`[Socket Room Error] Socket ${player2Data.socketId} not found!`);
            }


            const startPayload = {
                gameId: gameData.gameId,
                players: gameData.players.map(p => ({ 
                     userId: p.userId,
                     username: p.username,
                     profilePic: p.profilePic,
                     color: p.color
                })),
                startingPlayerId: gameData.currentTurnUserId
            };
            console.log(`>>> Emitting start_game to ${gameId}`);
            io.to(gameId).emit('start_game', startPayload);

        } else {
            console.log("[find_match] Not enough players in queue.");
        }
    });

    socket.on('cancel_matchmaking', (userId) => {
         if (!userId) {  return; }
         console.log(`[cancel_matchmaking] User ${userId} requested cancellation.`);
         if (removeUserFromQueue(userId)) {
             console.log(`[cancel_matchmaking] User ${userId} successfully cancelled.`);
             socket.emit('matchmaking_cancelled'); 
         } else {
             console.log(`[cancel_matchmaking] User ${userId} not in queue.`);
         }
    });


    socket.on('make_move', (data) => {
        console.log(`<<< Received make_move from socket ${socket.id}:`, data);
        const { gameId, userId, row, col } = data;

        if (gameId === undefined || userId === undefined || row === undefined || col === undefined) {
             console.error("  [make_move Validation FAIL] Invalid data received:", data);
              socket.emit('game_error', { message: 'Invalid move data sent.' });
             return;
        }

        const game = activeGames.get(gameId);
        if (!game) {
            console.error(`  [make_move Validation FAIL] Game ${gameId} not found.`);
            socket.emit('game_error', { message: "Game not found. It might have ended or there was an error." });
            return;
        }

        const playerIndex = game.players.findIndex(p => p.userId === userId);
        if (playerIndex === -1) {
            console.error(`  [make_move Validation FAIL] Player ${userId} not found in game ${gameId}`);
            socket.emit('game_error', { message: "You are not part of this game." });
            return;
        }
        const player = game.players[playerIndex];
        const opponent = game.players[1 - playerIndex];

        const isPlayerTurn = game.currentTurnUserId === player.userId;
        console.log(`  [make_move Validation] Is it player ${userId}'s turn? Server says: ${isPlayerTurn} (Expected: ${game.currentTurnUserId})`);
        if (!isPlayerTurn) {
            console.warn(`  [make_move Validation FAIL] Not player ${userId}'s turn.`);
            socket.emit('invalid_move', { message: "Wait for your turn!" });
            return;
        }

        if (row < 0 || row >= 5 || col < 0 || col >= 5 || game.grid[row]?.[col] !== null) {
            console.warn(`  [make_move Validation FAIL] Invalid cell (${row}, ${col}) or cell not empty: ${game.grid[row]?.[col]}`);
            socket.emit('invalid_move', { message: "Cell already taken or invalid." });
            return;
        }

        console.log(`  [make_move Validation PASS] Move by ${userId} on (${row},${col}) is valid.`);

        console.log(`  [make_move] Updating grid[${row}][${col}] from ${game.grid[row][col]} to ${player.color}`);
        game.grid[row][col] = player.color;
        game.moves++;
        game.currentTurnUserId = opponent.userId; 
        console.log(`  [make_move] State updated. Moves: ${game.moves}, Turn switched to: ${game.currentTurnUserId}`);

        activeGames.set(gameId, game);

        const payload = {
            grid: game.grid,
            nextTurnUserId: game.currentTurnUserId,
            move: { row, col, color: player.color }
        };
        console.log(`>>> Emitting move_made to game room ${gameId}`);
        io.to(gameId).emit('move_made', payload);

        if (game.moves === 25) {
            console.log(`[GameEnd Check] Game ${gameId} reached 25 moves. Finalizing.`);
            finalizeGame(io, gameId, 'completed');
        }
    });


    socket.on('forfeit_game', (data) => {
         console.log(`<<< Received forfeit_game from socket ${socket.id}:`, data);
         const { gameId, userId } = data;
         if (!gameId || !userId) { return; }

         const game = activeGames.get(gameId);
         if (!game) {  return; }

         const forfeiterIndex = game.players.findIndex(p => p.userId === userId);
         if (forfeiterIndex === -1) {  return; }

         console.log(`[Forfeit] Player ${userId} is forfeiting game ${gameId}.`);
         finalizeGame(io, gameId, 'forfeit', { forfeiterId: userId });
    });


    socket.on('disconnect', (reason) => {
        console.log(`[Disconnect] Socket disconnected: ${socket.id}. Reason: ${reason}`);
        let disconnectedUserId = null;
        for (const [userId, sockId] of userSockets.entries()) {
            if (sockId === socket.id) {
                disconnectedUserId = userId;
                break;
            }
        }

        if (disconnectedUserId) {
            console.log(`[Disconnect] User ${disconnectedUserId} disconnected.`);
            const gameId = userActiveGame.get(disconnectedUserId);

            if (gameId && activeGames.has(gameId)) {
                 console.log(`[Disconnect] User ${disconnectedUserId} was in active game ${gameId}. Handling disconnect.`);
                 finalizeGame(io, gameId, 'disconnect', { disconnectedUserId });
                  userSockets.delete(disconnectedUserId);
            } else {
                 removeUserFromQueue(disconnectedUserId);
                 if (userSockets.get(disconnectedUserId) === socket.id) {
                      userSockets.delete(disconnectedUserId);
                 }
            }
        } else {
            console.log(`[Disconnect] Disconnected socket ${socket.id} had no associated user.`);
        }
    });

}; 