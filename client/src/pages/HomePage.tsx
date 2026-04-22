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
 <><div className="background-crowns">
      <span className="crown crown1">👑</span>
      <span className="crown crown2">👑</span>
      <span className="crown crown3">👑</span>
      <span className="crown crown4">👑</span>
      <span className="crown crown5">👑</span>
      <span className="crown crown6">👑</span>
      <span className="crown crown7">👑</span>
      <span className="crown crown8">👑</span>
      <span className="crown crown9">👑</span>
      <span className="crown crown10">👑</span>
    </div><div className="container">
        <h1 className="title">DARBAAR</h1>
        <div className="stats">Games Played: 0</div>
        <div className="button-group">
          <button className="btn btn-primary" onClick={handlePlayClick}>
            PLAY ANYONE
          </button>
          <button className="btn btn-primary" onClick={handlePlayClick}>
            PLAY FRIENDS
          </button>
          <button className="btn btn-secondary" onClick={handlePlayClick}>
            MY FRIENDS
          </button>
          <button className="btn btn-secondary" onClick={handleUpdateProfie}>
            UPDATE PROFILE
          </button>
        </div>
      </div></>
  );
};

export default HomePage;

