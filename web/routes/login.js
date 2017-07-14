const { token, secret } = require('../app');

module.exports = (req, res) => {
  let auth = req.headers.authorization;
  if (!auth) return E(res);
  let token = auth.split(' ');
  if (token[0] !== 'Basic') return E(res);
  token = token[1];
  let decode = (new Buffer(token, 'base64')).toString().split(':');
  if (decode[0] !== token) return E(res);
  if (decode[1] !== secret) return E(res);
  let AUTH_URI = 'https://discordapp.com/oauth2/authorize?response_type=code&redirect_uri=http://toastythebot.tk/callback&scope=identify+guilds&client_id=208946600620326912';
  let obj = JSON.stringify({ url: AUTH_URI });
  res.send(obj);
}

function E(res) {
  let errorObj = JSON.stringify({
    error: true,
    msg: 'Unauthorized'
  });

  return res.send(errorObj);
}
