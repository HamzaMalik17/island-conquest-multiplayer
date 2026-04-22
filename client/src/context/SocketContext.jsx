import React, { createContext, useContext, useEffect, useState } from 'react';
 import { getSocket, disconnectSocket } from '../services/socketService';
 import { useAuth } from './AuthContext'; 

 const SocketContext = createContext(null);

 export const SocketProvider = ({ children }) => {
     const [socket, setSocket] = useState(null);
     const { user } = useAuth(); 

     useEffect(() => {
         if (user && !socket) {
             const newSocket = getSocket(); 
             setSocket(newSocket);
         } else if (!user && socket) {
             disconnectSocket();
             setSocket(null);
         }
     }, [user, socket]); 

     return (
         <SocketContext.Provider value={socket}>
             {children}
         </SocketContext.Provider>
     );
 };

 export const useSocket = () => useContext(SocketContext);