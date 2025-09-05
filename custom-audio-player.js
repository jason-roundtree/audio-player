class CustomAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.trackList = [];
    this.currentTrack = null;
    this.playerIsPlaying = false;
    this.nextTrack = null;
    this.playAllIsActive = false;
    this.rewindIcon = "<<";
    this.fastForwardIcon = ">>";
    this.skipAmount = 15;
    this.rewindAriaLabel = `Rewind ${this.skipAmount} seconds`;
    this.fastForwardAriaLabel = `Fast-forward ${this.skipAmount} seconds`;
    this.muteButtonIsUnmuted = "Mute";
    this.muteButtonIsMuted = "Unmute";
    this.playButtonIsPlaying = "Pause";
    this.playButtonIsPaused = "Play";
    this.attachShadow({ mode: "open" });
    this.addStyles();
    this.buildPrimaryPlayerControls();
    this.buildSecondaryControls();
    this.setupEventListeners();
  }

  addStyles() {
    const globalStylesLink = document.createElement("link");
    globalStylesLink.setAttribute("rel", "stylesheet");
    globalStylesLink.setAttribute("href", "index.css");
    this.shadowRoot.appendChild(globalStylesLink);

    const customPlayerStylesLink = document.createElement("link");
    customPlayerStylesLink.setAttribute("rel", "stylesheet");
    customPlayerStylesLink.setAttribute("href", "custom-audio-player.css");
    this.shadowRoot.appendChild(customPlayerStylesLink);
  }

  buildPrimaryPlayerControls() {
    this.playerContainer = document.createElement("div");
    this.playerContainer.className = "audio-player";

    // Info element
    this.audioInfo = document.createElement("div");
    this.audioInfo.className = "audio-info";
    this.audioTitle = document.createElement("p");
    this.audioTitle.className = "audio-title";
    this.audioTitle.textContent = "Unknown Title";
    this.audioInfo.appendChild(this.audioTitle);
    this.playerContainer.appendChild(this.audioInfo);

    this.playerControlsContainer = document.createElement("div");
    this.playerControlsContainer.className = "player-controls-container";

    this.mainPlayButton = document.createElement("button");
    this.mainPlayButton.className = "main-play-btn";
    this.mainPlayButton.textContent = "Play";

    this.audio = document.createElement("audio");
    this.audio.className = "audio";
    this.audio.setAttribute("preload", "auto");
    this.audio.src = "";

    this.buildTimeAndSeekControls();
    this.buildVolume();

    this.playerControlsContainer.appendChild(this.mainPlayButton);
    this.playerControlsContainer.appendChild(this.audio);
    // TODO: move these appendings to corresponding functions called above?
    this.playerControlsContainer.appendChild(this.timeAndSeekContainer);
    this.playerControlsContainer.appendChild(this.volumeContainer);

    this.playerContainer.appendChild(this.playerControlsContainer);
    this.shadowRoot.appendChild(this.playerContainer);
  }

  buildTimeAndSeekControls() {
    // Time display
    // TODO: move to method?
    this.timeDisplayContainer = document.createElement("div");
    this.timeDisplayContainer.className = "time-display-container";

    this.currentTimeDisplay = document.createElement("span");
    this.currentTimeDisplay.className = "current-time";
    this.currentTimeDisplay.textContent = "0:00";

    this.durationDisplay = document.createElement("span");
    this.durationDisplay.className = "duration";
    this.durationDisplay.textContent = "0:00";

    this.timeDisplayContainer.appendChild(this.currentTimeDisplay);
    this.timeDisplayContainer.appendChild(document.createTextNode(" / "));
    this.timeDisplayContainer.appendChild(this.durationDisplay);

    // Skip time buttons
    // TODO: move to method?
    this.rewindButton = document.createElement("button");
    this.rewindButton.className = "rewind";
    this.rewindButton.textContent = this.rewindIcon;
    this.rewindButton.setAttribute("aria-label", this.rewindAriaLabel);
    this.fastForwardButton = document.createElement("button");
    this.fastForwardButton.className = "fast-forward";
    this.fastForwardButton.textContent = this.fastForwardIcon;
    this.fastForwardButton.setAttribute(
      "aria-label",
      this.fastForwardAriaLabel
    );
    this.skipTimeButtonContainer = document.createElement("div");
    this.skipTimeButtonContainer.className = "skip-time-button-container";
    this.skipTimeButtonContainer.appendChild(this.rewindButton);
    this.skipTimeButtonContainer.appendChild(this.fastForwardButton);

    // Time display + skip time buttons container
    this.timeAndSkipContainer = document.createElement("div");
    this.timeAndSkipContainer.className = "time-and-skip-container";
    this.timeAndSkipContainer.appendChild(this.timeDisplayContainer);
    this.timeAndSkipContainer.appendChild(this.skipTimeButtonContainer);

    // Seek bar
    this.seekBar = document.createElement("input");
    this.seekBar.className = "seek-bar";
    this.seekBar.type = "range";
    this.seekBar.min = "0";
    this.seekBar.max = "1";
    this.seekBar.step = "0.01";
    this.seekBar.value = "0";

    // Time + Skip + Seek container
    this.timeAndSeekContainer = document.createElement("div");
    this.timeAndSeekContainer.className = "time-and-seek-container";
    this.timeAndSeekContainer.appendChild(this.timeAndSkipContainer);
    this.timeAndSeekContainer.appendChild(this.seekBar);
  }

  buildVolume() {
    this.muteToggle = document.createElement("button");
    this.muteToggle.className = "mute-toggle";
    this.muteToggle.textContent = this.muteButtonIsUnmuted;

    this.volumeSlider = document.createElement("input");
    this.volumeSlider.className = "volume-slider";
    this.volumeSlider.type = "range";
    this.volumeSlider.min = "0";
    this.volumeSlider.max = "1";
    this.volumeSlider.step = "0.01";
    this.volumeSlider.value = "1";

    this.volumeContainer = document.createElement("div");
    this.volumeContainer.className = "volume-container";
    this.volumeContainer.appendChild(this.muteToggle);
    this.volumeContainer.appendChild(this.volumeSlider);
  }

  buildSecondaryControls() {
    this.secondaryControlsContainer = document.createElement("div");
    this.secondaryControlsContainer.className = "secondary-controls-container";

    this.playAllButton = document.createElement("button");
    this.playAllButton.className = "play-all-btn";
    this.playAllButton.textContent = "Play All";

    this.shuffleButton = document.createElement("button");
    this.shuffleButton.className = "shuffle-btn";
    this.shuffleButton.textContent = "Shuffle";

    this.secondaryControlsContainer.appendChild(this.playAllButton);
    this.secondaryControlsContainer.appendChild(this.shuffleButton);

    this.playerContainer.appendChild(this.secondaryControlsContainer);
  }

  updateMuteButton() {
    this.muteToggle.textContent = this.audio.muted
      ? this.muteButtonIsMuted
      : this.muteButtonIsUnmuted;
  }

  cueUpNextTrack() {}

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + String(s).padStart(2, "0");
  }

  togglePlay() {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  getNextTrack() {
    const currentIndex = this.trackList.findIndex(
      (track) => track.title === this.currentTrack.title
    );
    const nextIndex = (currentIndex + 1) % this.trackList.length;
    return this.trackList[nextIndex];
  }

  playTrack(track) {
    this.audio.src = track.src;
    this.audioTitle.textContent = track.title;
    this.audio.currentTime = 0;
    this.audio.play();
    this.currentTrack = track;
    this.nextTrack = this.getNextTrack();
  }

  updateMainPlayButton() {
    this.mainPlayButton.textContent = this.audio.paused
      ? this.playButtonIsPaused
      : this.playButtonIsPlaying;
  }

  updateTrackPlayButtons() {
    Array.from(
      this.trackListContainer.querySelectorAll(".track-play-btn")
    ).forEach((btn) => (btn.textContent = this.playButtonIsPaused));
    if (this.playerIsPlaying && this.currentTrack) {
      const buttonForPlayingTrack = this.trackListContainer.querySelector(
        `.track-play-btn[data-track-title="${this.currentTrack.title}"]`
      );
      if (buttonForPlayingTrack) {
        buttonForPlayingTrack.textContent = this.playButtonIsPlaying;
      }
    }
  }

  setTrackList(trackList) {
    this.trackList = trackList;
    if (this.trackListContainer) {
      this.trackListContainer.remove();
    }
    this.trackListContainer = document.createElement("div");
    this.trackListContainer.className = "track-list";

    if (trackList.length > 0) {
      this.audio.src = trackList[0].src;
      this.audioTitle.textContent = trackList[0].title;
      this.currentTrack = trackList[0];
      this.nextTrack = trackList[1] && trackList[1];
    }

    trackList.forEach((track, idx) => {
      const item = document.createElement("div");
      item.className = "track-list-item";

      const title = document.createElement("span");
      title.className = "track-title";
      title.textContent = track.title;

      const durationSpan = document.createElement("span");
      durationSpan.className = "track-duration";
      durationSpan.textContent = "...";
      const tempAudio = new Audio(track.src);
      tempAudio.addEventListener("loadedmetadata", () => {
        durationSpan.textContent = this.formatTime(tempAudio.duration);
      });

      const trackPlayButton = document.createElement("button");
      trackPlayButton.className = "track-play-btn";
      trackPlayButton.dataset.trackTitle = track.title;
      trackPlayButton.textContent =
        this.audio.src.endsWith(track.src) && !this.audio.paused
          ? this.playButtonIsPlaying
          : this.playButtonIsPaused;
      trackPlayButton.addEventListener("click", () => {
        if (this.audio.src.endsWith(track.src)) {
          // this track is already set to player
          if (!this.audio.paused) {
            this.audio.pause();
            this.updateTrackPlayButtons();
          } else {
            this.audio.play();
            this.updateTrackPlayButtons();
          }
        } else {
          this.playTrack(track);
          this.updateTrackPlayButtons();
        }
      });

      item.appendChild(trackPlayButton);
      item.appendChild(title);
      item.appendChild(durationSpan);
      this.trackListContainer.appendChild(item);
    });

    this.playerContainer.appendChild(this.trackListContainer);
  }

  setupEventListeners() {
    this.mainPlayButton.addEventListener("click", () => {
      this.togglePlay();
    });
    this.audio.addEventListener("play", () => {
      this.playerIsPlaying = true;
      this.updateMainPlayButton();
      this.updateTrackPlayButtons();
    });
    this.audio.addEventListener("pause", () => {
      this.playerIsPlaying = false;
      this.updateMainPlayButton();
      this.updateTrackPlayButtons();
    });
    this.volumeSlider.addEventListener("input", () => {
      this.audio.volume = parseFloat(this.volumeSlider.value);
      this.audio.muted = this.audio.volume === 0;
      this.updateMuteButton();
    });
    this.seekBar.addEventListener("input", () => {
      this.audio.currentTime = parseFloat(this.seekBar.value);
    });
    this.audio.addEventListener("loadedmetadata", () => {
      this.durationDisplay.textContent = this.formatTime(this.audio.duration);
      this.seekBar.max = this.audio.duration;
      this.seekBar.step = "0.01";
      this.seekBar.value = 0;
    });
    this.audio.addEventListener("timeupdate", () => {
      this.seekBar.value = this.audio.currentTime;
      this.currentTimeDisplay.textContent = this.formatTime(
        this.audio.currentTime
      );
    });
    this.muteToggle.addEventListener("click", () => {
      this.audio.muted = !this.audio.muted;
      this.updateMuteButton();
      this.volumeSlider.value = this.audio.muted ? "0" : "1";
    });
    this.fastForwardButton.addEventListener(
      "click",
      () => (this.audio.currentTime += this.skipAmount)
    );
    this.rewindButton.addEventListener(
      "click",
      () => (this.audio.currentTime -= this.skipAmount)
    );
    this.playAllButton.addEventListener("click", () => {
      this.playAllIsActive = !this.playAllIsActive;
      this.playAllButton.classList.toggle(
        "btn-is-active",
        this.playAllIsActive
      );
      if (this.playAllIsActive && this.audio.paused) {
        this.audio.play();
        this.updateTrackPlayButtons();
      }
    });
    this.audio.addEventListener("ended", () => {
      this.updateTrackPlayButtons();
      if (this.playAllIsActive) {
        this.playTrack(this.nextTrack);
      }
    });
  }

  static get observedAttributes() {
    return ["src", "track-title"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "src":
        this.audio.src = newValue;
        break;
      case "track-title":
        this.audioTitle.textContent = newValue;
        break;
    }
  }
}

customElements.define("custom-audio-player", CustomAudioPlayer);
