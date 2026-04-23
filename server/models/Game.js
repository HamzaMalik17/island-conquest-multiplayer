import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true, 
    index: true,  
  },
  player1_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player2_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  player1_color: {
    type: String,
    required: true,
  },
  player2_color: {
    type: String, 
    required: true,
  },
  final_grid: { 
    type: [[String]], 
  },
  result: { 
    type: String,
    enum: ['player1_won', 'player2_won', 'draw', 'player1_forfeit', 'player2_forfeit', 'opponent_disconnected', 'player1_disconnect', 'player2_disconnect'],
    required: true,
  },
  winner_id: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  game_started_at: {
    type: Date,
    default: Date.now,
  },
   game_ended_at: {
     type: Date,
   },
});

gameSchema.index({ player1_id: 1 });
gameSchema.index({ player2_id: 1 });

const Game = mongoose.model('Game', gameSchema);

export default Game;