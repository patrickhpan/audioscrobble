A simple Last.FM clone. Scrobble tracks with your chosen username, and the track's information will be automatically corrected and album art supplied using the iTunes API.

There are currently two endpoints:

1) POST /scrobble
Takes username (mandatory), track name (mandatory), artist name (optional), and album name (optional) and returns the corrected data.

2) GET /lasttrack
Takes username (mandatory) and supplies the last scrobbled track.

Lots of work to do, but this is intended to be a pretty bare-bones project, mostly for my own utility since Last.FM now sucks :(
