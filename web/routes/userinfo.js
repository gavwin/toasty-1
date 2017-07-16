const superagent = require('superagent');

module.exports = (req, res) => {
  let auth = req.headers.authorization;
  if (!auth) return E(res);
  let token = auth.split(' ');
  if (token[0] !== 'Basic') return E(res);
  token = (new Buffer(token[1], 'base64')).toString()
  let info = {};
  superagent.get('https://discordapp.com/api/users/@me')
    .set({ Authorization: `Bearer ${token}` }).then(user => {
      user = user.body;
      user.avatarURL = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

      superagent.get('https://discordapp.com/api/users/@me/guilds')
        .set({ Authorization: `Bearer ${token}` }).then(guilds => {
          guilds = guilds.body;
          guilds = guilds.filter(g => g.owner);
          guilds.forEach((g, i) => {
            let iconURL = `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png`;
            guilds[i].iconURL = iconURL;
          });

          let info = {user, guilds};
          let stringify = JSON.stringify(info);
          res.send(stringify);
        }).catch(console.log);
      }).catch(err => E(res));
}

function E(res) {
  let errorObj = JSON.stringify({ error: true, msg: 'Unauthorized' });
  return res.send(errorObj);
}
