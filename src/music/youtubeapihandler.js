const req = require('req-fast');

module.exports = class YTApiHandler {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.options = {
      base: 'https://www.googleapis.com/youtube/v3'
    }

    this.resultPlaylist = new Array();
  }

  getVideo(videoID, callback) {
    let options = {
      url: this.options.base + '/videos?part=snippet,contentDetails&id=' + videoID + '&key=' + this.apiKey,
      method: 'GET',
      dataType: 'json'
    }

    req(options, (err, res) => {
      if (!err && res.statusCode === 200) {
        if (res.body.items.length === 0) return callback(undefined, 'EMPTY_VID');
        return callback(undefined, (res.body));
      } else return callback(err, undefined);
    });
  }

  getPlaylist(playlistID, callback) {
    let options = {
      url: this.options.base + '/playlistItems/?part=snippet&maxResults=50&playlistId=' + playlistID + '&key=' + this.apiKey,
      method: 'GET',
      dataType: 'json'
    }

    req(options, (err, res) => {
      if (!err && res.statusCode === 200) {
        if (res.body.nextPageToken) {
          try {
            this.getCompletePlaylist(playlistID, undefined, (playlist) => {
              callback(undefined, playlist);
            });
          } catch (err) {
            if (err) callback(err, undefined);
          }
        } else callback(undefined, res.body.items);
      } else callback(err, undefined);
    });
  }

  getCompletePlaylist(playlistID, pageToken, callback) {
    let reqUrl;
    if (!pageToken) reqUrl = this.options.base + '/playlistItems/?part=snippet,contentDetails&maxResults=50&playlistId=' + playlistID + '&key=' + this.apiKey;
    else reqUrl = this.options.base + '/playlistItems/?part=snippet,contentDetails&maxResults=50&playlistId=' + playlistID + '&key=' + this.apiKey + '&pageToken=' + pageToken;
    req({
      url: reqUrl,
      method: 'GET',
      dataType: 'json'
    }, (err, res) => {
      if (!err && res.statusCode === 200) {
        if (res.body.items.length !== 0) this.resultPlaylist = this.resultPlaylist.concat(res.body.items);
        if (res.body.nextPageToken) pageToken = res.body.nextPageToken;
        else pageToken = undefined;

        if (pageToken) this.getCompletePlaylist(playlistID, pageToken, callback);
        if (!pageToken && callback) {
          callback(this.resultPlaylist);
          this.resultPlaylist = new Array();
        }
      } else throw (err);
    });
  }
}
