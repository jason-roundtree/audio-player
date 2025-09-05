import TRACK_DATA from "./audio/track-data.js";

function init() {
  const audioPlayer = document.querySelector("custom-audio-player");
  audioPlayer.setTrackList(TRACK_DATA);
}

init();
