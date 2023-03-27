import express from 'express';
import path from 'path';
import userRouter from './routes/users';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
export const prisma = new PrismaClient();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/users', userRouter);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('new-value', (symbol: { symbol: string; value: number }) => {
    io.emit('new-value', symbol);
  });
});

server.listen(3000, async () => {
  console.log('Server is running');

  await mongoose.connect('mongodb://127.0.0.1:27017/mymongo');
  console.log('connected to mongoose');
});
