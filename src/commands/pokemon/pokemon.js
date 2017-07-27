const { Command } = require('discord.js-commando');
const randomPokemon = require('pokemon-random');
const fs = require('fs');
const path = require('path');
const jsonPath = path.join(__dirname, '..', '..', 'data', 'pokemon.json');
const { discordbotsToken } = require(path.join(__dirname, '..', '..', 'config.json'));
const snekfetch = require('snekfetch');
const moment = require('moment');
require('moment-duration-format');
const cooldown = new Object();

module.exports = class PokemonCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pokemon',
      group: 'pokemon',
      memberName: 'pokemon',
      description: 'Lets you catch a Pokemon every 3 hours.',
      details: 'Lets you catch a random Pokemon every 3 hours and stores it in your virtual inventory.\nYou can trade pokemon with other players.',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 10
      }
    });
  }
  run(msg) {
    msg.reply('Sorry, the Pokemon commands are temporarily disabled. We are looking into the issue that is breaking them.');
  }
  /*async run(msg) {
    const user = msg.author;
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    snekfetch.get(`https://discordbots.org/api/bots/${this.client.user.id}/votes?onlyids=1`)
      .set('Authorization', discordbotsToken)
      .then(r => {
        if (!r.body.includes(user.id)) return msg.reply(`:no_entry_sign: You can\'t use the Pokemon commands because you haven\'t upvoted me.\nType, \`${this.client.commandPrefix}upvote\` for the steps on how to upvote me.`);
        if (cooldown[user.id] && cooldown[user.id].time > 0) return msg.say(`:no_entry_sign: **${user.username}**, you need to wait another **${moment.duration(cooldown[user.id].time).format(' H [hours], m [minutes] & s [seconds]')}** before catching another pokemon.`);
        if (!cooldown[user.id]) cooldown[user.id] = {time: 10800000}; //3 hours
        try {
          cooldown[user.id].time = 10800000; //3 hours
          setInterval(() => {
            if (!cooldown[user.id]) cooldown[user.id] = {time: 0};
            cooldown[user.id].time -= 10000; //remove 10 seconds
          }, 10000); //every 10 seconds
          setTimeout(() => {
            delete cooldown[user.id];
          }, 10800000); //3 hours
        } catch(e) {}

      const newPokemon = randomPokemon();
      function addPokemon(newPokemon, user) {
        if (!data[user.id]) data[user.id] = {pokemon: {}};

        const arr = new Array();
        Object.keys(data[user.id].pokemon).forEach(key => {
          arr.push(data[user.id].pokemon[key].name);
        });
        if (arr.length === 802) return msg.reply(':tada: **You\'ve caught all 802 pokemon!** :tada:');
        if (data[user.id].pokemon[newPokemon]) {
          data[user.id].pokemon[newPokemon].count++;
          fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        } else {
          if (newPokemon === 'Mime Jr.') {
            data[user.id].pokemon[newPokemon] = {
              name: newPokemon,
              gif: `http://www.pokestadium.com/sprites/xy/mime-jr.gif`,
              count: 1
            }
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
          } else if (newPokemon === 'Mr. Mime') {
            data[user.id].pokemon[newPokemon] = {
              name: newPokemon,
              gif: `http://www.pokestadium.com/sprites/xy/mr-mime.gif`,
              count: 1
            }
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
          } else {
            data[user.id].pokemon[newPokemon] = {
              name: newPokemon,
              gif: `http://www.pokestadium.com/sprites/xy/${newPokemon.toLowerCase()}.gif`,
              count: 1
            }
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
          }
        }
      }

      const pe = this.client.emojis.get('328574358710910978');
      if (!pe) {
        msg.say(`**${user.username}**, you've caught a **${newPokemon}**!\nhttp://www.pokestadium.com/sprites/xy/${newPokemon.toLowerCase()}.gif`);
        addPokemon(newPokemon, user);
      } else {
        msg.say(`**${user.username}**, ${pe} you've caught a **${newPokemon}**!\nhttp://www.pokestadium.com/sprites/xy/${newPokemon.toLowerCase()}.gif`);
        addPokemon(newPokemon, user);
      }
    });
  }*/
};
