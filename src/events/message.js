const { indicoToken, youTubeToken, prefix, me } = require('../config.json');
const indico = require('indico.io');
const path = require('path');
const fs = require('fs');
const url = require('url');
const statsPath = path.join(__dirname, '..', 'data/stats.json');
const yt = require('ytdl-core');
const YouTube = require('youtube-node');
const youTube = new YouTube();
youTube.setKey(youTubeToken);
const DYouTube = require('discord-youtube-api');
const dyouTube = new DYouTube(youTubeToken);
const playlists = ['pop', 'hiphop', 'electro', 'classical', 'rock-n-roll', 'chill', 'jazz', 'metal', 'retro', 'korean', 'toast'];

exports.run = (client, msg) => {
  if (msg.channel.type === 'dm') return;
  if (!msg.guild.member(client.user).hasPermission('SEND_MESSAGES')) return;

  if (msg.content.startsWith(prefix+'cleartoday') && msg.author.id === me) {
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    if (!stats) stats = { guilds: 0 };
    stats.guilds = 0;
    fs.writeFileSync(statsPath, JSON.stringify(stats));
    msg.channel.send(`I've cleared today's servers made.\n${stats.guilds}`);
  }

  if (msg.content.startsWith(prefix+'today') && msg.author.id === me) {
    const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
    msg.channel.send(`I've made **${stats.guilds}** servers today!`);
  }


  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data/servers.json')));
  const settings = data[msg.guild.id] ? data[msg.guild.id] : {nonsfw: 'disabled', noinvite: 'disabled'};

  if (settings.nonsfw === 'enabled' && msg.attachments) {
    const urls = msg.attachments
      .map(a => a.url)
      .concat(msg.content.split(' ')
          .map(x => url.parse(x))
          .filter(x => x.hostname)
          .map(x => url.format(x)));
      for (const URL of urls) {
        indico.contentFiltering(URL, { apiKey: indicoToken })
          .then((res) => {
            if (typeof res !== 'number' || res < (0.93)) return;
            if (!msg.guild.member(client.user).hasPermission('MANAGE_MESSAGES')) return msg.channel.send(':no_entry_sign: **Error:** I could not delete NSFW content because I do not have the **Manage Messages** permission!');
            msg.delete().then(() => msg.reply(':no_entry_sign: There is no NSFW content allowed on this server!'));
          }).catch(() => {});
      }
  }

  const invites = ['https://discord.gg/', 'http://discord.gg/', 'discord.gg/', 'https://discordapp.com/invite/', 'http://discordapp.com/invite/', 'discordapp.com/invite/'];
  if (invites.some(m => msg.content.toLowerCase().includes(m))) {
    if (settings.noinvite === 'enabled') {
      if (!msg.guild.member(client.user).hasPermission('MANAGE_MESSAGES')) return msg.channel.send(':no_entry_sign: **Error:** I could not delete a Discord invite because I do not have the **Manage Messages** permission!');
      msg.delete().then(() => msg.reply(':no_entry_sign: There is no invite link sending allowed on this server!'));
    }
  }

  if (!msg.content.startsWith(prefix)) return;
  if (msg.content.startsWith(prefix+'play') && !msg.guild.member(client.user).hasPermission('CONNECT') || !msg.guild.member(client.user).hasPermission('SPEAK')) return msg.reply(':no_entry_sign: I don\'t have the **Connect** or **Speak** permission!');
  if (musicCommands.hasOwnProperty(msg.content.toLowerCase().slice(1).split(' ')[0])) musicCommands[msg.content.toLowerCase().slice(1).split(' ')[0]](msg);
}

const queue = new Object();
const musicCommands = {
  'play': (msg) => {
    if (queue[msg.guild.id] === undefined) return msg.channel.send(`:no_entry_sign: There are currently no songs in the server queue.\nAdd some with \`${prefix}add [song name | YouTube video URL]\``);
    if (!msg.guild.voiceConnection) return musicCommands.join(msg).then(() => musicCommands.play(msg));
    if (queue[msg.guild.id].paused) return msg.channel.send(`:no_entry_sign: I\'m currently paused. Type \`${prefix}resume\` to resume playing the current song.`);
    if (queue[msg.guild.id].playing) return msg.channel.send(':no_entry_sign: I\'m already playing music on this server!');
    let dispatcher;
    if (!queue[msg.guild.id]) queue[msg.guild.id] = {playing: true};
    queue[msg.guild.id].playing = true;

    (function play(song) {
      if (song === undefined) return msg.channel.send(':no_entry_sign: The server queue is now empty. Leaving voice channel...').then(() => {
        if (!queue[msg.guild.id]) queue[msg.guild.id] = {playing: false};
        queue[msg.guild.id].playing = false;
        msg.member.voiceChannel.leave();
      });
      msg.channel.send(`:satellite: Loading **${song.title}**...`).then(m => {
        try {
          setTimeout(() => {
            m.edit(`:notes: Now playing **${song.title}** as requested by **${song.requester}**`);
            if (!queue[msg.guild.id]) queue[msg.guild.id] = {
              nowPlaying: {
                title: song.title,
                requester: song.requester,
                url: song.url
              }
            };
            queue[msg.guild.id].nowPlaying = {title: song.title, requester: song.requester, url: song.url};
          }, 1000);
        } catch(e) {
          m.edit(`:notes: Now playing **${song.title}** as requested by **${song.requester}**`);
        }
      });
      try {
        dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes: 1 });
      } catch(e) {
        msg.channel.send('There was an issue playing the next song in the queue.');
      }
      let collector = msg.channel.createCollector(m => m);
      collector.on('collect', m => {
        if (m.content.startsWith(prefix+'pause')) {
          msg.channel.send(':pause_button: Paused.').then(() => {
            dispatcher.pause();
            queue[msg.guild.id].paused = true;
          });
        } else if (m.content.startsWith(prefix+'resume')) {
          msg.channel.send(':play_pause: Resumed.').then(() => {
            dispatcher.resume();
            queue[msg.guild.id].paused = false;
          });
        } else if (m.content.startsWith(prefix+'skip')) {
          msg.channel.send(':arrow_forward: Skipped.').then(() => {
            dispatcher.end();
          });
        } else if (m.content.startsWith(prefix+'volume')) {
          if (m.content === prefix+'volume')  {
            let vol = dispatcher.volume * 100;
            if (vol >= 125) return msg.channel.send(`:loud_sound: The volume is **${vol}**.`);
            if (vol >= 75 && vol <= 124) return msg.channel.send(`:sound: The volume is **${vol}**.`);
            if (vol <= 74) return msg.channel.send(`:speaker: The volume is **${vol}**.`);
          }
          let vol = parseInt(m.content.replace(prefix+'volume ', ''));
          if (vol > 200 || vol < 0) return msg.channel.send(':no_entry_sign: You can only set the volume from `0-200`!');
          if (vol >= 125) msg.channel.send(`:loud_sound: Set the volume to **${vol}**.\n(The higher the volume is, the lower the quality so you might want to consider raising the voice channel volume or your speaker volume)`);
          if (vol >= 75 && vol <= 124) msg.channel.send(`:sound: Set the volume to **${vol}**.`);
          if (vol <= 74) msg.channel.send(`:speaker: Set the volume to **${vol}**.`);
		      dispatcher.setVolume((vol/100));
          queue[msg.guild.id].volume = vol/100;
        } else if (m.content.startsWith(prefix+'time')) {
          msg.channel.send(`:clock1: Time: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000)/1000) <10 ? '0'+Math.floor((dispatcher.time % 60000)/1000) : Math.floor((dispatcher.time % 60000)/1000)}`);
        } else if (m.content.startsWith(prefix+'stop')) {
          const voiceChannel = msg.member.voiceChannel;
          if (!voiceChannel || voiceChannel.type !== 'voice') return m.reply(':no_entry_sign: You\'re not in a voice channel!');
          if (!queue[msg.guild.id]) queue[msg.guild.id] = {playing: false, paused: false};
          queue[msg.guild.id].playing = false;
          if (queue[msg.guild.id].paused) queue[msg.guild.id].paused = false;
          dispatcher.end();
          voiceChannel.leave();
        } else if (m.content.startsWith(prefix+'np') || m.content.startsWith(prefix+'nowplaying')) {
          if (!queue[msg.guild.id]) queue[msg.guild.id] = {
            nowPlaying: {
              song: '*failed to load*',
              requester: '*failed to load*',
              url: '*failed to load*'
            }
          };
          let song = queue[msg.guild.id].nowPlaying;
          msg.channel.send(`:notes: The song that is currently playing is **${song.title}** as requested by **${song.requester}**.\n${song.url}`);
        }
      });
      dispatcher.once('end', () => {
        collector.stop();
        if (!queue[msg.guild.id]) queue[msg.guild.id] = { songs: [] };
        if (queue[msg.guild.id].songs.length === 0) {
          delete queue[msg.guild.id];
          delete dispatcher;
        } else {
          setTimeout(() => {
            delete dispatcher;
            play(queue[msg.guild.id].songs.shift());
          }, 200);
          setTimeout(() => {
            if (!queue[msg.guild.id]) queue[msg.guild.id] = {volume: 1};
            if (queue[msg.guild.id].volume) dispatcher.setVolume(queue[msg.guild.id].volume);
          }, 1000);
        }
      });
      dispatcher.on('error', (err) => {
        return msg.channel.send(':no_entry_sign: **Error:** An unknown error occured:\n'+err).then(() => {
          collector.stop();
          play(queue[msg.guild.id].songs.shift());
          setTimeout(() => {
            if (!queue[msg.guild.id]) queue[msg.guild.id] = {volume: 1};
            if (queue[msg.guild.id].volume) dispatcher.setVolume(queue[msg.guild.id].volume);
          }, 1000);
        });
      });
    })(queue[msg.guild.id].songs.shift());
  },
  'join': (msg) => {
    return new Promise((resolve, reject) => {
      const voiceChannel = msg.member.voiceChannel;
      if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply(':no_entry_sign: I couldn\'t connect to your voice channel.');
      voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
    });
  },
  'leave': (msg) => {
      const voiceChannel = msg.member.voiceChannel;
      if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply(':no_entry_sign: I couldn\'t disconnect from your voice channel.');
      try {
        voiceChannel.leave();
      } catch(err) {
        msg.reply(':no_entry_sign: **Error:** I couldn\'t disconnect from your voice channel.\n' + err);
      }
  },
  'add': (msg) => {
    async function addFromUrl(url) {
      const m = await msg.channel.send('*Adding...*');
      if (url == '' || url === undefined) return m.edit(`:no_entry_sign: You must add a YouTube video url after \`${prefix}add\``);
      yt.getInfo(url, (err, info) => {
        if (err) return m.edit(':no_entry_sign: There was an issue getting that song. Please try a different one.');
        if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
        try {
          queue[msg.guild.id].songs.push({
            url: url,
            title: info.title,
            requester: msg.author.username
          });
          m.edit(`:white_check_mark: Added **${info.title}** to the queue.`);
        } catch (err) {
          m.edit(`:no_entry_sign: Failed to add **${info.title}** to the queue.\n${err}`);
        }
      });
    }

    function addFromQuery(query) {
      youTube.search(query, 2, (err, result) => {
        if (err) return msg.channel.send(':no_entry_sign: **Error:** There was an issue getting that song. Please try a different one.');
        try {
          let url = `https://www.youtube.com/watch?v=${result.items[0]['id'].videoId}`;
          addFromUrl(url);
        } catch(e) {
          msg.channel.send(':no_entry_sign: **Error:** There was an issue getting that song. Please try a different one.');
        }
      });
    }

    async function addFromPlaylist(url) {
      if (url == '' || url === undefined) return m.edit(`:no_entry_sign: You must add a YouTube video url after \`${prefix}add\``);
      const m = await msg.channel.send('*Adding...*');
      const songs = await dyouTube.getPlaylist(url);
      let ltq = 15;
      if (songs.length < 15) ltq = songs.length;
      const arr = new Array();
      for (let i = 0, len = songs.length; i < ltq; i++) {
        let r = Math.floor(Math.random() * (len + 1));
        while (arr.includes(r)) {
          r = Math.floor(Math.random() * (len + 1));
        }
        arr.push(r);
        try {
        if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
        queue[msg.guild.id].songs.push({
          url: songs[r].url,
          title: songs[r].title,
          requester: msg.author.username
        });
      } catch(e) {}
      }
      m.edit(`:white_check_mark: 15 random songs from the playlist have been queued. To queue another 15 run the \`play [playlist URL]\` command again.`);
    }

    if (msg.content === prefix+'add') return;
    let url = msg.content.split(' ')[1];
    const ytUrls = ['https://youtube.com/', 'http://youtube.com/', 'https://youtu.be/', 'http://youtu.be/', 'https://www.youtube.com/', 'http://www.youtube.com/', 'https://www.youtu.be/', 'http://youtu.be/'];
    if (ytUrls.some(r => msg.content.includes(r)) && msg.content.includes('playlist')) {
      addFromPlaylist(url);
    } else
    if (ytUrls.some(r => msg.content.includes(r))) {
      addFromUrl(url);
    } else {
      let query = msg.content.replace(prefix+'add', '');
      addFromQuery(query);
    }
  },
  'queue': (msg) => {
    if (queue[msg.guild.id] === undefined) return msg.channel.send(`:no_entry_sign: There are currently no songs in the server queue.\nAdd some with \`${prefix}add [song name / URL]\``);
    if (!queue[msg.guild.id]) queue[msg.guild.id] = { songs: [] };
    let tosend = new Array();
    queue[msg.guild.id].songs.forEach((song, i) => {
      tosend.push(`${i+1}. ${song.title} - Requested by: ${song.requester}`);
    });
    msg.channel.send(`__**${msg.guild.name}'s Music Queue:**__ Currently **${tosend.length}** songs queued ${(tosend.length > 15 ? '*[Only next 15 shown]*' : '')}\n\`\`\`${tosend.slice(0,15).join('\n')}\`\`\``);
  },
  'clearqueue': (msg) => {
    if (queue[msg.guild.id] === undefined) return msg.channel.send(':no_entry_sign: There are currently no songs in the server queue.');
    queue[msg.guild.id].songs.splice(0, queue[msg.guild.id].songs.length);
    msg.reply(':white_check_mark: I\'ve cleared the server queue.');
  },
  'playlists': (msg) => {
    msg.channel.send('Avaliable playlists include:\n`'+playlists.join(', ')+'`');
  },
  'playlist': (msg) => {
    if (msg.content === prefix+'playlist') return msg.reply(`Please specify a playlist to play!\nPlaylists: \`${playlists.join(', ')}\``);
    let playlist = msg.content.replace(prefix+'playlist ', '').toLowerCase();
    if (!playlists.includes(playlist)) return msg.reply(`That isnt an avaliable playlist.\nPlaylists: \`${playlists.join(', ')}\``);
    function cap(text) { return text.charAt(0).toUpperCase() + text.slice(1) }

    const getInfo = require('util').promisify(yt.getInfo);

    async function doPlaylist(playlist, msg) {
      const m = await msg.channel.send(`Downloading the **${playlist}** playlist...`);
      setTimeout(() => { m.edit(`Downloading the **${playlist}** playlist...\nPlease be patient, this may take up to a minute.\nYou can run the \`play\` command while the playlist is downloading to start listening to music.`); }, 3000);
      const songs = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'data', `playlists/${playlist}.txt`)).toString().split('\n');

      const arr = new Array();
      for (let i = 0, len = songs.length; i < 15; i++) {
        let r = Math.floor(Math.random() * (len + 1));
        while (arr.includes(r)) {
          r = Math.floor(Math.random() * (len + 1));
        }
        arr.push(r);
          try {
            const info = await getInfo(songs[r]);
            if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
            queue[msg.guild.id].songs.push({
              url: songs[r],
              title: info.title,
              requester: `${cap(playlist)} Auto Playlist`
            });
          } catch(e) {}
      }
      m.edit(`:white_check_mark: The **${cap(playlist)}** playlist has been queued!\n15 songs have been queued from the playlist. To queue another 15 run the \`playlist\` command again.`);
    }

    doPlaylist(playlist, msg);
  }
};
