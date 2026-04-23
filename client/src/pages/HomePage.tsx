import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';       
import { useSocket } from '../context/SocketContext';   
import { emitFindMatch } from '../services/socketService'; 
import "../styles/home.css";                           

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;
    
    // Listen for waiting_for_opponent event


    const handleWaitingForOpponent = () => {
      console.log("Received waiting_for_opponent event from server");
      navigate('/newgame/waiting');
    };
    
    // Listen for already_waiting event
    const handleAlreadyWaiting = () => {
      console.log("Received already_waiting event from server");
      navigate('/newgame/waiting');
    };
    
    // Listen for already_in_game event
    const handleAlreadyInGame = () => {
      console.log("User is already in a game");
      alert('You are already in an active game. Please finish it first.');
    };
    
    // Register event listeners
    socket.on('waiting_for_opponent', handleWaitingForOpponent);
    socket.on('already_waiting', handleAlreadyWaiting);
    socket.on('already_in_game', handleAlreadyInGame);
    
    // Cleanup on unmount
    return () => {
      socket.off('waiting_for_opponent', handleWaitingForOpponent);
      socket.off('already_waiting', handleAlreadyWaiting);
      socket.off('already_in_game', handleAlreadyInGame);
    };
  }, [socket, navigate]);

  const handlePlayClick = () => {
    console.log("Play button clicked");
    
    if (!socket || !socket.connected) {
        console.error('Socket not connected.');
        alert('Connection error. Please ensure you are connected and try again.');
        return;
    }
    
    if (!user) {
        console.error('User not logged in for handlePlayClick.');
        alert('You must be logged in to play.');
        navigate('/login');
        return;
    }
  
    const userId = user._id || user.userId;
    console.log(`Starting matchmaking for: ${user.username} (${userId})`);
    
    emitFindMatch({
        userId: userId,
        username: user.username,
        profilePic: user.profile_picture_url || '',
    });
    
    setTimeout(() => {
        navigate('/newgame/waiting');
    }, 100);
};

  if (!user) return null;

  const handleUpdateProfie = () => {
    console.log("atking to update profile");
    navigate('/update-profile');
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Island Conquest</h1>
      <div className="home-buttons">
        <button className="btn btn-primary" onClick={handlePlayClick}>
          Play Anyone
        </button>
        <button className="btn btn-primary" onClick={handlePlayClick}>
          Play Friends
        </button>
        <button className="btn btn-secondary" onClick={handlePlayClick}>
          My Friends
        </button>
        <button className="btn btn-secondary" onClick={handleUpdateProfie}>
          Update Profile
        </button>
      </div>
    </div>
  );
};

export default HomePage;

