const express = require('express');
const app = express();
const router = express.Router();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const callback = require(`${__dirname}/routes/callback`);
const login = require(`${__dirname}/routes/login`);
const userinfo = require(`${__dirname}/routes/userinfo`);

module.exports = {
  token: config.token,
  secret: config.secret
};

http.listen(80, () => {
  console.log('toastythebot.tk is now listening.');
});

app.use(express.static(`${__dirname}/static`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

app.get('/dashboard', (req, res) => {
  res.sendFile(`${__dirname}/views/dashboard.html`);
});

app.get('/login', (req, res) => {
  res.sendFile(`${__dirname}/views/login.html`);
});

app.get('/features', (req, res) => {
  res.sendFile(`${__dirname}/views/features.html`);
});

app.get('/inventory', (req, res) => {
  res.sendFile(`${__dirname}/views/inventory.html`);
});

app.get('/stats', (req, res) => {
  res.sendFile(`${__dirname}/views/stats.html`);
});

app.get('/upvote', (req, res) => {
  res.sendFile(`${__dirname}/views/upvote.html`);
});

app.get('/hq', (req, res) => {
  res.sendFile(`${__dirname}/views/hq.html`);
});

app.get('/invite', (req, res) => {
  res.sendFile(`${__dirname}/views/invite.html`);
});

app.get('/apply', (req, res) => {
  res.sendFile(`${__dirname}/views/apply.html`);
});

app.get('/donate', (req, res) => {
  res.sendFile(`${__dirname}/views/donate.html`);
});

router.use('/callback', (req, res) => {
  callback(req, res);
});

router.use('/login', (req, res) => {
  login(req, res);
});

router.use('/userinfo', (req, res) => {
  userinfo(req, res);
});

app.use('/', router);

io.on('connection', (socket) => {
  socket.on('stats', () => {
    let stats = JSON.parse(fs.readFileSync(`${__dirname}/static/assets/json/stats.json`));
    io.emit('stats', stats);
    let pokemon = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'pokemon.json')));
    io.emit('pokemon', pokemon);
  });
});
