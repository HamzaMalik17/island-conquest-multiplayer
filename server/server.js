import { Server } from "socket.io";
import http from "http";
import { app } from "./app.js";
import { config } from "dotenv";
import connectDB from './config/db.js';
import { registerSocketHandlers } from './socket/socketHandlers.js'; 

config({ path: "./config.env" });
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },

});

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket);
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend expected at: http://localhost:5173`); 
});

process.on('unhandledRejection', (err, promise) => {
  console.error(`Unhandled Rejection: ${err.message}`);

});