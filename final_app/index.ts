import express from 'express';
import path from 'path';
import userRouter from './routes/users';
import authRouter from './routes/auth';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';
import passport from './middlewares/githubStrategy';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
export const prisma = new PrismaClient();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({ secret: 'keyboard cat', resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/auth', authRouter);
app.use('/users', userRouter);

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('new-value', (symbol: { symbol: string; value: number }) => {
    io.emit('new-value', symbol);
  });
});

server.listen(3000, async () => {
  console.log('Server is running');

  await mongoose.connect(
    process.env.MONGO_URL ?? 'mongodb://127.0.0.1:27017/mymongo'
  );
  console.log('connected to mongoose');
});
