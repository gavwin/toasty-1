const { indicoToken, youTubeToken, prefix } = require('../config.json');
const indico = require('indico.io');
const path = require('path');
const fs = require('fs');
const url = require('url');
const yt = require('ytdl-core');
const YouTube = require('youtube-node');
const youTube = new YouTube();
youTube.setKey(youTubeToken);

exports.run = (client, msg) => {
  if (msg.channel.type === 'dm') return;

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
    queue[msg.guild.id].playing = true;

    (function play(song) {
      if (song === undefined) return msg.channel.send(':no_entry_sign: The server queue is now empty. Leaving voice channel...').then(() => {
        queue[msg.guild.id].playing = false;
        msg.member.voiceChannel.leave();
      });
      msg.channel.send(`:notes: Now playing **${song.title}** as requested by **${song.requester}**`);
      setTimeout(() => { dispatcher = msg.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes: 1 }); }, 300);
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
        } else if (m.content.startsWith(prefix+'leave')) {
          const voiceChannel = msg.member.voiceChannel;
          if (!voiceChannel || voiceChannel.type !== 'voice') return m.reply(':no_entry_sign: You\'re not in a voice channel!');
          queue[msg.guild.id].playing = false;
          if (queue[msg.guild.id].paused) queue[msg.guild.id].paused = false;
          dispatcher.end();
          voiceChannel.leave();
        }
      });
      dispatcher.once('end', () => {
        collector.stop();
        if (queue[msg.guild.id].songs.length === 0) {
          delete queue[msg.guild.id];
          delete dispatcher;
        } else {
          setTimeout(() => {
            delete dispatcher;
            if (queue[msg.guild.id].volume > 50) dispatcher.setVolume(queue[msg.guild.id].volume);
            play(queue[msg.guild.id].songs.shift());
          }, 200);
        }
      });
      dispatcher.on('error', (err) => {
        return msg.channel.send(':no_entry_sign: **Error:** An unknown error occured:\n'+err).then(() => {
          collector.stop();
          play(queue[msg.guild.id].songs.shift());
          if (queue[msg.guild.id].volume) dispatcher.setVolume(queue[msg.guild.id].volume);
        });
      });
    })(queue[msg.guild.id].songs.shift());
  },
  'join': (msg) => {
    return new Promise((resolve, reject) => {
      const voiceChannel = msg.member.voiceChannel;
      if (!voiceChannel || voiceChannel.type !== 'voice') return msg.reply(':no_entry_sign: I couldn\'t connect to your voice channel. Please make sure you are in one and I have permissions to connect to it.');
      voiceChannel.join().then(connection => resolve(connection)).catch(err => reject(err));
    });
  },
  'add': (msg) => {
    async function addFromUrl(url) {
      const m = await msg.channel.send('*Adding...*');
      if (url == '' || url === undefined) return msg.channel.send(`:no_entry_sign: You must add a YouTube video url after \`${prefix}add\``);
      yt.getInfo(url, (err, info) => {
        if (err) return m.edit(':no_entry_sign: There was an issue getting that song. Please try a different one.');
        if (!queue.hasOwnProperty(msg.guild.id)) queue[msg.guild.id] = {}, queue[msg.guild.id].playing = false, queue[msg.guild.id].songs = [];
        queue[msg.guild.id].songs.push({
          url: url,
          title: info.title,
          requester: msg.author.username
        });
        m.edit(`:white_check_mark: Added **${info.title}** to the queue.`);
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

    if (msg.content === prefix+'add') return;
    let url = msg.content.split(' ')[1];
    const youtubeUrls = ['https://discord.gg/', 'http://discord.gg/', 'discord.gg/', 'https://discordapp.com/invite/', 'http://discordapp.com/invite/', 'discordapp.com/invite/'];
    if (youtubeUrls.some(r => msg.content.includes(r))) {
      addFromUrl(url);
    } else {
      let query = msg.content.replace(prefix+'add', '');
      addFromQuery(query);
    }
  },
  'queue': (msg) => {
    if (queue[msg.guild.id] === undefined) return msg.channel.send(`:no_entry_sign: There are currently no songs in the server queue.\nAdd some with \`${prefix}add [song name / URL]\``);
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
  'playlist': (msg) => {
    const playlists = ['pop', 'hiphop', 'electro', 'classical', 'rock-n-roll', 'chill', 'jazz', 'metal', 'retro', 'korean', 'toast'];
    if (msg.content === prefix+'playlist') return msg.reply(`Please specify a playlist to play!\nPlaylists: \`${playlists.join(', ')}\``);
    let playlist = msg.content.replace(prefix+'playlist ', '').toLowerCase();
    if (!playlists.includes(playlist)) return msg.reply(`That isnt an avaliable playlist.\nPlaylists: \`${playlists.join(', ')}\``);
    function cap(text) { return text.charAt(0).toUpperCase() + text.slice(1) }

    const getInfo = require('util').promisify(yt.getInfo);

    async function doPlaylist(playlist, msg) {
      const m = await msg.channel.send(`Downloading the **${playlist}** playlist...`);
      setTimeout(() => { m.edit(`Downloading the **${playlist}** playlist...\nPlease be patient, this may take up to two minutes.\nYou can run the \`play\` command while the playlist is downloading.`); }, 3000);
      const songs = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'data', `playlists/${playlist}.txt`)).toString().split('\n');

      for (let i = 0, len = songs.length; i < 15; i++) {
        if (i === 15) break;
        const r = Math.floor(Math.random() * (len - 0 + 1)) + 0;
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
      m.edit(`:white_check_mark: The **${playlist}** playlist has been queued!\n15 songs have been queued from the playlist. To queue another 15 run the \`playlist\` command again.`);
    }

    doPlaylist(playlist, msg);
  }
};
