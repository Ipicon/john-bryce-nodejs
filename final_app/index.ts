import express from 'express';
import path from 'path';
import userRouter from './routes/users';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import http from 'http';
import passport from './middlewares/githubStrategy';
import session from 'express-session';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
export const prisma = new PrismaClient();

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj: { id: string }, done) {
  done(null, obj);
});

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({ secret: 'keyboard cat', resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/users', userRouter);
app.get('/auth/github', passport.authenticate('github'));
app.get(
  '/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/users/welcome' }),
  function (req, res) {
    res.redirect('/users/dashboard');
  }
);

app.get('/logout', function (req, res) {
  req.logout((err: string) => console.log(err));
  res.redirect('/users/welcome');
});

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
