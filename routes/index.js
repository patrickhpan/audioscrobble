var express = require('express');
var router = express.Router();

var request = require('request');
var fs = require('fs');
var hash = require('object-hash');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

router.all('/lasttrack', function(req, res) {
  var user = req.query.user;
  if(!user) {
    res.status(400).end();
  } else {
    var hashname = hash(user);
    fs.readFile(path.join(__dirname, "../scrobbles/lastscrobble", hashname), 'utf8', function(err, data) {
      if(err) {
        res.json({
          user: "",
          lasttrack: {},
          time: 0
        }).end()
      } else {
        var hashData = data.split(" ")[0];
        var time = data.split(" ")[1];
        fs.readFile(path.join(__dirname, '../songdata', hashData), 'utf8', function(err, data) {
          if(err) {
            res.json({
              user: user,
              lasttrack: {},
              time: time
            }).end()
          } else {
            res.json({
              user: user,
              lasttrack: JSON.parse(data),
              time: time
            })
          }
        });
      }
    })
  }
})

router.post('/scrobble', function(req, res) {
  console.dir(req.body);
  var user = req.body.user;
  var title = req.body.title;
  if (!user || !title) {
    console.error("User or title undefined")
    res.status(400).end();
  } else {
    var album = req.body.album;
    var artist = req.body.artist;

    var url = "https://itunes.apple.com/search?term=";
    url += [title, album, artist].join(" ");

    request(url, function(error, response, body) {
      if (!error && response.statusCode == 200) {
        if(JSON.parse(body).resultCount != 0) {
          var iTunesData = JSON.parse(body).results[0];
          var songData = {
            title: iTunesData.trackName,
            artist: iTunesData.artistName,
            album: iTunesData.collectionName,
            artUrl: iTunesData.artworkUrl100.replace(/100x100/, "2000x2000")
          }
        } else {
          var songData = {
            title: title,
            artist: artist,
            album: album
          }
        }
      } else {
        var songData = {
          title: title,
          artist: artist,
          album: album
        }
      }

      hashData = hash(songData, {
        algorithm: 'md5'
      });

      fs.open(path.join(__dirname, '../songdata', hashData), 'wx', function(err, fd) {
        if (err || !fd) {
          if(err.code="EEXIST") {
            res.status(304).json(songData).end();
          } else {
            console.error(error);
            res.status(500).end();
          }
        } else {
          var writeData = JSON.stringify(songData);
          fs.write(fd, writeData, function(err) {
            if(err) {
              console.error(err);
              res.status(500).end();
            } else {
              res.json(songData);
            }
          })
        }
      })

      var hashname = hash(user);
      fs.open(path.join(__dirname, "../scrobbles", hashname), "a+", function(err, fd) {
        if(err || !fd) {
          console.error(err);
          res.status(500).end();
        } else {
          fs.readFile(path.join(__dirname, "../scrobbles/lastscrobble", hashname), 'utf8', function(err, data) {
            if(!err && data) {
              if(data.split(" ")[0] == hashData) {
                var time = data.split(" ")[1];
                if(+new Date - Number(time) < 1000 * 60 * 5) {
                  return;
                }
              }
            }
            var date = +new Date();
            fs.writeFile(path.join(__dirname, "../scrobbles/lastscrobble", hashname), hashData + " " + date);
            fs.appendFile(path.join(__dirname, "../scrobbles/", hashname), hashData + " " + date + "\n");
          })
        }
      })
    });


  }



})

module.exports = router;
