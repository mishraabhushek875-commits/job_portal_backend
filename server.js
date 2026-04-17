import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import {Server}from 'socket.io';
import {createServer} from 'http';
import applicationRoutes from './src/routes/applicationRoutes.js'
import authRoutes from './src/routes/authRoutes.js'
import jobRoutes from './src/routes/jobRoutes.js'
import {initSocket} from './src/socket/socketHandler.js'
import aiRoutes from './src/routes/aiRoutes.js';


//databse and env connect
connectDB(); 

const app = express();

// ─── HTTP Server banao ───
const httpServer=createServer(app);

// ─── Socket.io attach karo ───
const io = new Server(httpServer, {      
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});


// ─── Socket initialize karo ───
initSocket(io);


//middlewares
app.use(cors());
app.use(express.json());

//routes
app.use('/api/auth',authRoutes);
app.use('/api/applications',applicationRoutes);
app.use('/api/jobs',jobRoutes);
app.use('/api/ai', aiRoutes);



app.get('/',(req,res)=>{
  res.json({message:"server chal rha hai"});
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});


const PORT=process.env.PORT||5000;
httpServer.listen(PORT,()=>{
  console.log(`Server running on http://localhost:${PORT}`)
});
