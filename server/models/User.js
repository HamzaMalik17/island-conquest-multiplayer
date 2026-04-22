import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6, 
    select: false, 
  },
  profile_picture_url: {
    type: String,
    default: '', 
  },
  coins: {
    type: Number,
    default: 1000,
  },

  createdAt: { 
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

export default User;