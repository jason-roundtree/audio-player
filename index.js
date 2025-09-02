const audioPlayers = document.querySelectorAll("custom-audio-player");
let allTracksInOrder = [];
let shuffledPlaylist = [];
let playAllIsActive = false;

function setupInitialPlaylist() {
  const trackTitles = Array.from(audioPlayers).map((player) =>
    player.getAttribute("track-title")
  );
  allTracksInOrder = trackTitles;
  console.log("allTracksInOrder: ", allTracksInOrder);
}

function shufflePlaylist() {
  // TODO: implement a better shuffle algorithm
  const shuffled = allTracksInOrder.sort(() => Math.random() - 0.5);
  shuffledPlaylist = shuffled;
  console.log("shuffledPlaylist: ", shuffledPlaylist);
}

function init() {
  setupInitialPlaylist();
  document
    .getElementById("shuffle-button")
    .addEventListener("click", shufflePlaylist);

  document.getElementById("play-all-button").addEventListener("click", () => {
    playAllIsActive = !playAllIsActive;
  });
}

init();
