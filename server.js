import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser"
import authRoutes from "./routes/Auth.js"
import cors from 'cors';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});
app.use(cors());

app.use(express.static('public'));


app.use(bodyParser.json());
// Use the authentication routes
app.use('/auth', cors(), authRoutes);
const whiteboardStates = {};


io.on('connection', (socket) => {
  
    socket.on('joinRoom', (room) => {
      console.log(`Socket ${socket.id} joining room ${room}`);
      socket.join(room);

    const existingWhiteboardState = whiteboardStates[room] || [];
    socket.emit('initialState', existingWhiteboardState);
  });

    socket.on('draw', (data) => {
      console.log(`Broadcasting draw event to room ${data.room}`);
        socket.to(data.room).emit('draw', data);
        if (!whiteboardStates[data.room]) {
          whiteboardStates[data.room] = [];
        }
        whiteboardStates[data.room].push(data);
    });

    socket.on('disconnect', () => {
        // console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
