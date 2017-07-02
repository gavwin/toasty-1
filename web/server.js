const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');

http.listen(80, () => {
  console.log('toastythebot.tk is now listening.');
});

app.use(express.static(`${__dirname}/static`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/routes/index.html`);
});

app.get('/features', (req, res) => {
  res.sendFile(`${__dirname}/routes/features.html`);
});

app.get('/upvote', (req, res) => {
  res.sendFile(`${__dirname}/routes/upvote.html`);
});

app.get('/hq', (req, res) => {
  res.sendFile(`${__dirname}/routes/hq.html`);
});

app.get('/invite', (req, res) => {
  res.sendFile(`${__dirname}/routes/invite.html`);
});

app.get('/apply', (req, res) => {
  res.sendFile(`${__dirname}/routes/apply.html`);
});

app.get('/donate', (req, res) => {
  res.sendFile(`${__dirname}/routes/donate.html`);
});

io.on('connection', (socket) => {
  socket.on('stats', () => {
    let stats = JSON.parse(fs.readFileSync(`${__dirname}/static/assets/json/stats.json`));
    io.emit('stats', stats);
  });
});
