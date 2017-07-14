var control_panel = document.getElementById('control_panel');

// access token
var toastyAccessToken = getCookie('toastyAccessToken');
  if (toastyAccessToken) {
    var date = new Date();
    var time = date.getTime();
    localStorage.setItem('accessToken', JSON.stringify({ token: toastyAccessToken, date: time }));
  }

  var checkAccessToken = localStorage.getItem('accessToken');
  if (checkAccessToken) {
    var parsed = JSON.parse(checkAccessToken);
    var keyTime = parsed.date;
    var date = new Date();
    var time = date.getTime();
    if (keyTime - time > 518400000) {
      loginRedirect();
    }
  } else {
    loginRedirect();
  }

  if (checkAccessToken) {
    loadUserData()
  }

  function loadUserData() {
      Materialize.toast("Fetching Guilds...", 3000, "rounded blue")
      fetchUserInfo(function(err, data) {
          data = JSON.parse(data)
          if (err || data.error) return Materialize.toast("Request Failed, Try Again Later", 3000, "rounded red")

          if (data.guilds.length === 0) return Materialize.toast("You Do Not Own Any Servers", 3000, "rounded red")

          fillProfile(data.user)
          fillDropdown(data.guilds)

      })
  }

  function fillProfile(user) {
    $('#profile-img').attr('src', user.avatarURL)
    $('#profile-text').attr('class', 'brand-logo')
    if (user.username.length > 10) user.username = user.username.substring(0, 10)
    $('#profile-text').text(user.username)
}

function fillDropdown(guilds) {
    var opt = []
    var choose = `<option value="" disabled selected>Choose an option</option>`
    opt.push(choose)

    guilds.forEach((g, i) => {
        var text = g.name
        if (text.length > 25) text = text.substring(0, 25)
        var a = `<option value="${i}" data-icon="${g.iconURL}" class="circle">${text}</option>`
        opt.push(a)
    })
    ownedGuilds = guilds
    $('#select-guild').html(opt.join(" "))
    $('#select-guild').removeAttr('disabled')
    $('#select-guild').material_select()
}

function loginRedirect() {
    Materialize.toast('Logging In...', 3000, "rounded blue")
    auth(function(err, creds) {
        creds = JSON.parse(creds)
        if (err || creds.error) return Materialize.toast("Login Failed, Try Again Later", 3000, "rounded red")
        var decode = atob(creds.auth)
        var decode_split = decode.split(":")
        var API_TOKEN = decode_split[0]
        var API_SECRET = decode_split[1]
        login(creds, function(err, dataObj) {
            dataObj = JSON.parse(dataObj)
            if (err || dataObj.error) return Materialize.toast("Login Failed, Try Again Later", 3000, "rounded red")
            window.location.href = dataObj.url
        })

    })
}

function fetchUserInfo(cb) {
    var token = getToken()
    $.ajax({
        url: "/api/userinfo",
        method: "GET",
        headers: {
            Authorization: "Basic " + token
        },
        error: function(obj, error) {
            cb(error, false)
        },
        success: function(data) {
            cb(false, data)
        }
    })
}

function login(token, cb) {
    token = token.auth
    $.ajax({
        url: "/api/login",
        method: "GET",
        headers: {
            Authorization: "Basic " + token
        },
        error: function(obj, error) {
            cb(error, false)
        },
        success: function(data) {
            cb(false, data)
        }
    })
}

function getToken() {
    var obj = localStorage.getItem('accessToken')
    if (!obj) return null
    var json = JSON.parse(obj)
    return json.token
}

//Cookie Function
if (typeof String.prototype.trimLeft !== "function") {
    String.prototype.trimLeft = function() {
        return this.replace(/^\s+/, "");
    };
}
if (typeof String.prototype.trimRight !== "function") {
    String.prototype.trimRight = function() {
        return this.replace(/\s+$/, "");
    };
}
if (typeof Array.prototype.map !== "function") {
    Array.prototype.map = function(callback, thisArg) {
        for (var i = 0, n = this.length, a = []; i < n; i++) {
            if (i in this) a[i] = callback.call(thisArg, this[i]);
        }
        return a;
    };
}

function getCookies() {
    var c = document.cookie,
        v = 0,
        cookies = {};
    if (document.cookie.match(/^\s*\$Version=(?:"1"|1);\s*(.*)/)) {
        c = RegExp.$1;
        v = 1;
    }
    if (v === 0) {
        c.split(/[,;]/).map(function(cookie) {
            var parts = cookie.split(/=/, 2),
                name = decodeURIComponent(parts[0].trimLeft()),
                value = parts.length > 1 ? decodeURIComponent(parts[1].trimRight()) : null;
            cookies[name] = value;
        });
    } else {
        c.match(/(?:^|\s+)([!#$%&'*+\-.0-9A-Z^`a-z|~]+)=([!#$%&'*+\-.0-9A-Z^`a-z|~]*|"(?:[\x20-\x7E\x80\xFF]|\\[\x00-\x7F])*")(?=\s*[,;]|$)/g).map(function($0, $1) {
            var name = $0,
                value = $1.charAt(0) === '"' ?
                $1.substr(1, -1).replace(/\\(.)/g, "$1") :
                $1;
            cookies[name] = value;
        });
    }
    return cookies;
}

function getCookie(name) {
    return getCookies()[name];
}
