state=$(osascript -e 'tell application "Radiant Player" to get player state');
if [ "$state" -eq "2" ];
then
  title=$(osascript -e 'tell application "Radiant Player" to get current song name');
  lasttitle=$(cat .lasttitle);
  if [ "$lasttrack" != "$title" ];
  then
    echo $title > .lasttitle
    album=$(osascript -e 'tell application "Radiant Player" to get current song album');
    artist=$(osascript -e 'tell application "Radiant Player" to get current song artist');
    curl -XPOST -s $1"/scrobble" --data "user=$(echo $2)&title=$(echo $title)&album=$(echo $album)&artist=$(echo $artist)" > /dev/null;
    curl -s $1"/lasttrack?user="$2;
  else
    if test "`find .lasttitle -mmin +10`";
      then rm .lasttitle;
    fi;
  fi;
fi;
