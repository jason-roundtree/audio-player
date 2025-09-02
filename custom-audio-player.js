class CustomAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.isPlaying = false;
    this.rewindIcon = "<<";
    this.fastForwardIcon = ">>";
    this.skipAmount = 15;
    this.rewindAriaLabel = `Rewind ${this.skipAmount} seconds`;
    this.fastForwardAriaLabel = `Fast-forward ${this.skipAmount} seconds`;
    this.muteButtonTextUnmuted = "Mute";
    this.muteButtonTextMuted = "Unmute";
    this.attachShadow({ mode: "open" });
    this.addStyles();
    this.buildPlayer();
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

  buildPlayer() {
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

    this.controlsContainer = document.createElement("div");
    this.controlsContainer.className = "controls-container";

    this.playPauseBtn = document.createElement("button");
    this.playPauseBtn.className = "play-pause";
    this.playPauseBtn.textContent = "Play";

    this.audio = document.createElement("audio");
    this.audio.className = "audio";
    this.audio.setAttribute("preload", "auto");
    this.audio.src = "";

    this.buildTimeAndSeekControls();
    this.buildVolume();

    this.controlsContainer.appendChild(this.playPauseBtn);
    this.controlsContainer.appendChild(this.audio);
    this.controlsContainer.appendChild(this.timeAndSeekContainer);
    this.controlsContainer.appendChild(this.volumeContainer);

    this.playerContainer.appendChild(this.controlsContainer);
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
    this.seekBar.max = "1"; // will be updated on loadedmetadata
    this.seekBar.step = "0.01"; // will be updated on loadedmetadata
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
    this.muteToggle.textContent = this.muteButtonTextUnmuted;

    this.volumeAndMuteContainer = document.createElement("div");
    this.volumeAndMuteContainer.className = "volume-and-mute-container";

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

  updateMuteButton() {
    this.muteToggle.textContent = this.audio.muted
      ? this.muteButtonTextMuted
      : this.muteButtonTextUnmuted;
  }

  setupEventListeners() {
    this.playPauseBtn.addEventListener("click", () => this.togglePlay());
    this.audio.addEventListener("play", () => {
      this.pauseLastPlayedTrack();
      this.isPlaying = true;
      this.setAttribute("is-playing", "");
      this.updatePlayPauseButton();
    });
    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
      this.removeAttribute("is-playing");
      this.updatePlayPauseButton();
    });
    this.volumeSlider.addEventListener("input", () => {
      this.audio.volume = parseFloat(this.volumeSlider.value);
      if (this.audio.volume === 0) {
        this.audio.muted = true;
      } else {
        this.audio.muted = false;
      }
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
      if (this.audio.muted) {
        this.volumeSlider.value = "0";
      } else {
        this.volumeSlider.value = "10";
      }
    });
    this.fastForwardButton.addEventListener(
      "click",
      () => (this.audio.currentTime += this.skipAmount)
    );
    this.rewindButton.addEventListener(
      "click",
      () => (this.audio.currentTime -= this.skipAmount)
    );
    // this.audio.addEventListener("ended", () => {
    //   console.log("allTracksInOrder: ", allTracksInOrder);
    //   const currentIndex = allTracksInOrder.indexOf(
    //     this.getAttribute("track-title")
    //   );
    //   let nextTrackIndex = currentIndex + 1;
    //   if (nextTrackIndex > allTracksInOrder.length - 1) {
    //     nextTrackIndex = 0;
    //   }
    //   this.audio.src = allTracksInOrder[nextTrackIndex];
    // });
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + String(s).padStart(2, "0");
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

  togglePlay() {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  updatePlayPauseButton() {
    this.playPauseBtn.textContent = this.audio.paused ? "Play" : "Pause";
  }

  pauseLastPlayedTrack() {
    // const players = document.querySelectorAll("custom-audio-player");
    // players.forEach((player) => {
    //   if (player !== this) {
    //     player.audio.pause();
    //   }
    // });
    const lastPlayedTrack = document.querySelector("[is-playing]");
    if (lastPlayedTrack) {
      lastPlayedTrack.audio.pause();
    }
  }
}

customElements.define("custom-audio-player", CustomAudioPlayer);
