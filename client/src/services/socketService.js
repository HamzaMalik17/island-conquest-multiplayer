import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8000';

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log('Socket connected successfully:', socket.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }
    return socket;
};

export const emitFindMatch = (userData) => {
    console.log("emitFindMatch called with:", userData);
    const socketInstance = getSocket();
    
    const onWaitingResponse = () => {
        console.log("Received waiting_for_opponent confirmation from server");
    };
    
    socketInstance.once('waiting_for_opponent', onWaitingResponse);
    
    console.log("Emitting find_match event with socket ID:", socketInstance.id);
    socketInstance.emit('find_match', userData);
    console.log("find_match event emitted");
};

export const emitMakeMove = (moveData) => {
    console.log("Emitting make_move with data:", moveData);
    getSocket().emit('make_move', moveData);
};

export const emitForfeitGame = (forfeitData) => {
    console.log("Emitting forfeit_game with data:", forfeitData);
    getSocket().emit('forfeit_game', forfeitData);
};

export const emitCancelMatchmaking = (userId) => {
    console.log("Emitting cancel_matchmaking for user:", userId);
    getSocket().emit('cancel_matchmaking', userId);
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket disconnected manually.');
    }
};