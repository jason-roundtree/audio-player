class CustomAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.trackList = [];
    // TODO: replace with function that checks current player state instead of using flag
    this.playerIsPlaying = false;
    this.currentTrack = null;
    this.autoplayIsActive = false;
    /** not used when shuffle is active */
    this.nextTrack = null;
    this.lastPlayedTracks = [];
    this.shuffleIsActive = false;
    this.skipAmount = 15;
    this.rewindIcon = "<<";
    this.fastForwardIcon = ">>";
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

    this.audio = document.createElement("audio");
    this.audio.className = "audio";
    this.audio.setAttribute("preload", "auto");
    this.audio.src = "";

    this.buildTimeAndSeekControls();
    this.buildVolume();

    this.playerControlsContainer.appendChild(this.audio);
    this.playerControlsContainer.appendChild(this.timeAndSeekContainer);
    this.playerControlsContainer.appendChild(this.volumeContainer);

    this.playerContainer.appendChild(this.playerControlsContainer);

    // New container for play and skip buttons
    this.playAndSkipContainer = document.createElement("div");
    this.playAndSkipContainer.className = "play-and-skip-container";
    this.mainPlayButton = document.createElement("button");
    this.mainPlayButton.className = "main-play-btn";
    this.mainPlayButton.textContent = "Play";
    this.playAndSkipContainer.appendChild(this.mainPlayButton);
    this.playAndSkipContainer.appendChild(this.skipTimeButtonContainer);
    this.playerContainer.appendChild(this.playAndSkipContainer);

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
    this.rewindButton.setAttribute("title", this.rewindAriaLabel);
    this.fastForwardButton = document.createElement("button");
    this.fastForwardButton.className = "fast-forward";
    this.fastForwardButton.textContent = this.fastForwardIcon;
    this.fastForwardButton.setAttribute(
      "aria-label",
      this.fastForwardAriaLabel
    );
    this.fastForwardButton.setAttribute("title", this.fastForwardAriaLabel);
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
    this.muteToggle.setAttribute("aria-label", this.muteButtonIsUnmuted);
    // single SVG with two grouped states: .icon-on (speaker + wave arcs) and .icon-off (speaker + X)
    this.muteToggle.innerHTML = `
      <svg class="mute-icon" width="25" height="25" viewBox="0 0 25 25" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
        <g class="icon-on">
          <path d="M2 7v8h5l6 5V2L7 7H2z" fill="currentColor" />
          <path d="M18 7 C20 9,20 13,18 15" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
          <path d="M20 5 C23 9,23 13,20 17" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
        </g>
        <g class="icon-off" style="display:none;">
          <path d="M2 7v8h5l6 5V2L7 7H2z" fill="currentColor" />
          <path d="M18 6 L24 16 M24 6 L18 16" transform="translate(-1,0)" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />
        </g>
      </svg>
    `;

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

    this.autoplayTracksButton = document.createElement("button");
    this.autoplayTracksButton.className = "autoplay-btn";
    this.autoplayTracksButton.textContent = "Autoplay";

    this.shuffleButton = document.createElement("button");
    this.shuffleButton.className = "shuffle-btn";
    this.shuffleButton.textContent = "Shuffle";

    this.secondaryControlsContainer.appendChild(this.autoplayTracksButton);
    this.secondaryControlsContainer.appendChild(this.shuffleButton);

    this.playerContainer.appendChild(this.secondaryControlsContainer);
  }

  updateMuteButton() {
    // update aria-label and visually-hidden text
    const label = this.audio.muted
      ? this.muteButtonIsMuted
      : this.muteButtonIsUnmuted;
    this.muteToggle.setAttribute("aria-label", label);
    // toggle which SVG is visible and dim the speaker when muted
    const iconOn = this.muteToggle.querySelector(".icon-on");
    const iconOff = this.muteToggle.querySelector(".icon-off");
    if (this.audio.muted) {
      this.muteToggle.classList.add("is-muted");
      if (iconOn) iconOn.style.display = "none";
      if (iconOff) iconOff.style.display = "";
      // dim via class (CSS handles color)
    } else {
      this.muteToggle.classList.remove("is-muted");
      if (iconOn) iconOn.style.display = "";
      if (iconOff) iconOff.style.display = "none";
    }
  }

  formatTime(seconds) {
    // optional second argument 'precision' can show fractional seconds (e.g. 1 = tenths)
    // const precision = arguments.length > 1 ? arguments[1] : 0;
    if (isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const secInt = Math.floor(seconds % 60);
    let secStr = String(secInt).padStart(2, "0");
    // if (precision > 0) {
    //   const factor = Math.pow(10, precision);
    //   const frac = Math.floor((seconds - Math.floor(seconds)) * factor);
    //   secStr = `${secStr}.${String(frac).padStart(precision, "0")}`;
    // }
    return m + ":" + secStr;
  }

  // Smooth time updates using requestAnimationFrame while audio is playing
  startTimeUpdater() {
    if (this._timeRafId) return; // already running
    const tick = () => {
      // update seek bar and current time display (integer seconds)
      if (this.seekBar) {
        this.seekBar.value = this.audio.currentTime;
      }
      if (this.currentTimeDisplay) {
        this.currentTimeDisplay.textContent = this.formatTime(
          this.audio.currentTime
        );
      }
      this._timeRafId = requestAnimationFrame(tick);
    };
    this._timeRafId = requestAnimationFrame(tick);
  }

  stopTimeUpdater() {
    if (this._timeRafId) {
      cancelAnimationFrame(this._timeRafId);
      this._timeRafId = null;
    }
    // final sync
    if (this.seekBar) this.seekBar.value = this.audio.currentTime;
    if (this.currentTimeDisplay)
      this.currentTimeDisplay.textContent = this.formatTime(
        this.audio.currentTime
      );
  }

  togglePlay() {
    if (this.audio.paused) {
      this.audio.play();
    } else {
      this.audio.pause();
    }
  }

  loadTrack(track) {
    this.audio.src = track.src;
    this.audioTitle.textContent = track.title;
    this.audio.currentTime = 0;
    this.currentTrack = track;
    this.nextTrack = this.getNextTrack();
  }

  playCurrentTrack() {
    this.audio.play();
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

  getNextTrack() {
    if (this.shuffleIsActive) {
      return this.getShuffledNextTrack();
    } else {
      const currentIndex = this.trackList.findIndex(
        (track) => track.title === this.currentTrack.title
      );
      const nextIndex = (currentIndex + 1) % this.trackList.length;
      return this.trackList[nextIndex];
    }
  }

  getShuffledNextTrack() {
    const trackListWithoutLastPlayedTracks = this.trackList.filter(
      (track) => !this.lastPlayedTracks.find((t) => t.title === track.title)
    );
    if (trackListWithoutLastPlayedTracks.length === 0) {
      // If all tracks have been played, reset lastPlayedTracks and use full list
      this.lastPlayedTracks = [];
      return this.trackList[Math.floor(Math.random() * this.trackList.length)];
    }
    const randomIndex = Math.floor(
      Math.random() * trackListWithoutLastPlayedTracks.length
    );
    return trackListWithoutLastPlayedTracks[randomIndex];
  }

  //   TODO: check this is working properly
  updateLastPlayedTracks(track) {
    const TRACK_MEMORY_LIMIT = 3;
    this.lastPlayedTracks.push(track);
    if (this.lastPlayedTracks.length > TRACK_MEMORY_LIMIT) {
      this.lastPlayedTracks.shift();
    }
    console.log("this.lastPlayedTracks", this.lastPlayedTracks);
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
          this.loadTrack(track);
          this.playCurrentTrack();
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

  isAudioPlaying() {
    return (
      !this.audio.paused && !this.audio.ended && this.audio.currentTime > 0
    );
  }

  setupEventListeners() {
    this.mainPlayButton.addEventListener("click", () => {
      this.togglePlay();
    });

    this.audio.addEventListener("play", () => {
      this.playerIsPlaying = true;
      this.updateLastPlayedTracks(this.currentTrack);
      this.updateMainPlayButton();
      this.updateTrackPlayButtons();
      // start smooth UI updates while playing
      if (typeof this.startTimeUpdater === "function") this.startTimeUpdater();
    });

    this.audio.addEventListener("pause", () => {
      this.playerIsPlaying = false;
      this.updateMainPlayButton();
      this.updateTrackPlayButtons();
      // stop smooth updates on pause
      if (typeof this.stopTimeUpdater === "function") this.stopTimeUpdater();
    });

    this.volumeSlider.addEventListener("input", () => {
      this.audio.volume = parseFloat(this.volumeSlider.value);
      this.audio.muted = this.audio.volume === 0;
      this.updateMuteButton();
    });

    this.seekBar.addEventListener("input", () => {
      this.audio.currentTime = parseFloat(this.seekBar.value);
      // immediate visual feedback while dragging (integer seconds)
      if (this.currentTimeDisplay)
        this.currentTimeDisplay.textContent = this.formatTime(
          this.audio.currentTime
        );
    });

    this.audio.addEventListener("loadedmetadata", () => {
      this.durationDisplay.textContent = this.formatTime(this.audio.duration);
      this.seekBar.max = this.audio.duration;
      this.seekBar.step = "0.01";
      this.seekBar.value = 0;
    });

    this.audio.addEventListener("timeupdate", () => {
      // RAF updater handles smooth display when playing; keep this as a fallback
      if (!this._timeRafId) {
        this.seekBar.value = this.audio.currentTime;
        if (this.currentTimeDisplay)
          this.currentTimeDisplay.textContent = this.formatTime(
            this.audio.currentTime
          );
      } else {
        // ensure seek value stays in sync
        this.seekBar.value = this.audio.currentTime;
      }
    });

    this.muteToggle.addEventListener("click", () => {
      this.audio.muted = !this.audio.muted;
      this.updateMuteButton();
      this.volumeSlider.value = this.audio.muted ? "0" : "1";
    });

    this.fastForwardButton.addEventListener("click", () => {
      const newTime = this.audio.currentTime + this.skipAmount;
      if (newTime >= this.audio.duration) {
        this.audio.currentTime = this.audio.duration;
        this.loadTrack(this.getNextTrack());
        if (this.autoplayIsActive && this.playerIsPlaying) {
          this.playCurrentTrack();
        } else if (this.playerIsPlaying) {
          this.playerIsPlaying = false;
          this.updateMainPlayButton();
          this.updateTrackPlayButtons();
        }
      } else {
        this.audio.currentTime = newTime;
      }
    });

    this.rewindButton.addEventListener(
      "click",
      () => (this.audio.currentTime -= this.skipAmount)
    );

    this.shuffleButton.addEventListener("click", () => {
      this.shuffleIsActive = !this.shuffleIsActive;
      this.shuffleButton.classList.toggle(
        "btn-is-active",
        this.shuffleIsActive
      );

      if (!this.shuffleIsActive) {
        this.nextTrack = this.getNextTrack();
      } else {
        this.nextTrack = this.getShuffledNextTrack();
      }
    });

    this.autoplayTracksButton.addEventListener("click", () => {
      this.autoplayIsActive = !this.autoplayIsActive;
      this.autoplayTracksButton.classList.toggle(
        "btn-is-active",
        this.autoplayIsActive
      );
      if (this.autoplayIsActive) {
        if (this.audio.ended) {
          this.loadTrack(this.nextTrack);
          this.playCurrentTrack();
        } else if (!this.playerIsPlaying) {
          this.playCurrentTrack();
        }
      }
    });

    this.audio.addEventListener("ended", () => {
      this.updateTrackPlayButtons();
      if (this.shuffleIsActive) {
        this.loadTrack(this.getShuffledNextTrack());
        this.playCurrentTrack();
      } else if (this.autoplayIsActive) {
        this.loadTrack(this.nextTrack);
        this.playCurrentTrack();
      }
    });
  }

  //   static get observedAttributes() {
  //     return [""];
  //   }

  //   attributeChangedCallback(name, oldValue, newValue) {
  //     switch (name) {
  //       case "":
  //         this.audio.src = newValue;
  //         break;
  //     }
  //   }
}

customElements.define("custom-audio-player", CustomAudioPlayer);
