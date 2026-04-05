import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongoose.js';
import auctionRoutes from './routes/auctionRoutes.js';
import { setupSocket } from './config/socket.js';
import { setupBidHandlers } from './sockets/bidHandler.js';

dotenv.config();

// Initialize MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with Redis Adapter
const io = setupSocket(server);

// App Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auctions', auctionRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.send({ status: 'OK' });
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Register handlers
  setupBidHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = +process.env.PORT! || 4000;

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
