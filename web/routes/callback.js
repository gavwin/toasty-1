const superagent = require('superagent');
const { id, secret, redirect_uri } = require('../config.json');

module.exports = (req, res) => {
  if (req.query.error) return res.redirect('https://discordapp.com/oauth2/authorize?response_type=code&redirect_uri=http://toastythebot.tk/callback&scope=identify+guilds&client_id=208946600620326912');
  if (!req.query.code) return res.redirect('https://discordapp.com/oauth2/authorize?response_type=code&redirect_uri=http://toastythebot.tk/callback&scope=identify+guilds&client_id=208946600620326912');

  let TOKEN_URI = tokenURI(req.query.code);
  superagent.post(TOKEN_URI).then((response) => {
    let enToken = (new Buffer(response.body.access_token)).toString('base64');
    res.cookie('toastyAccessToken', enToken, {maxAge: 518400000});
    res.redirect('http://toastythebot.tk/dashboard');
  }).catch();
}

function tokenURI(code) {
  const TOKEN_PARAMS = [
    'grant_type=authorization_code',
    `code=${code}`,
    `client_id=${id}`,
    `client_secret=${secret}`,
    `redirect_uri=${redirect_uri}`,
  ].join('&');

  return `https://discordapp.com/api/oauth2/token?${TOKEN_PARAMS}`
}
