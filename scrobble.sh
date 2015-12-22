while true;
do
	state=$(osascript -e 'tell application "Radiant Player" to get player state');
	if [ "$state" -eq "2" ];
	then
		title=$(osascript -e 'tell application "Radiant Player" to get current song name');
		album=$(osascript -e 'tell application "Radiant Player" to get current song album');
		artist=$(osascript -e 'tell application "Radiant Player" to get current song artist');
		curl -XPOST $1 --data "user=$(echo $2)&title=$(echo $title)&album=$(echo $album)&artist=$(echo $artist)";
	fi;
	sleep $3;
done
