import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import gameRoutes from './routes/gameRoutes.js';

export const app = express();

app.use(cors({ 
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

app.get('/', (req, res) => {
    res.send('ColorGrid API is running...');
});

