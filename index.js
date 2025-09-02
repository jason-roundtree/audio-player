const TRACK_DATA = [
  {
    title: "Mind the Slap",
    src: "/audio/Mind-the-Slap_97-07132025-Balanced-Medium.mp3",
  },
  {
    title: "Resplendent",
    src: "/audio/Resplendent_15775-07132025-Open-Medium.mp3",
  },
  {
    title: "Big Britches",
    src: "/audio/Big_Britches_99-071325-Balanced-Medium.mp3",
  },
  {
    title: "Tempestuous",
    src: "/audio/Tempestuous_83.5-render-08302025-Warm-Medium.mp3",
  },
  {
    title: "Among the Beasts",
    src: "/audio/Hombre3000_120-Render-08302025-Balanced-Medium.mp3",
  },
];

const audioPlayer = document.querySelector("custom-audio-player");
let allTracksInOrder = [];
let shuffledPlaylist = [];
let playAllIsActive = false;

// function setupInitialPlaylist() {
//   const trackTitles = Array.from(audioPlayers).map((player) =>
//     player.getAttribute("track-title")
//   );
//   allTracksInOrder = trackTitles;
//   console.log("allTracksInOrder: ", allTracksInOrder);
// }

function shufflePlaylist() {
  // TODO: implement a better shuffle algorithm
  const shuffled = allTracksInOrder.sort(() => Math.random() - 0.5);
  shuffledPlaylist = shuffled;
  console.log("shuffledPlaylist: ", shuffledPlaylist);
}

function init() {
  audioPlayer.setTrackList(TRACK_DATA);

  document
    .getElementById("shuffle-button")
    .addEventListener("click", shufflePlaylist);

  document.getElementById("play-all-button").addEventListener("click", () => {
    playAllIsActive = !playAllIsActive;
  });
}

init();
