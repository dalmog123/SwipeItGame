class SoundManager {
  constructor() {
    this.sounds = {};
    this.muted = false;
    this.backgroundPosition = 0;
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;

    // Initialize all game sounds
    const soundFiles = {
      background: "/assets/sounds/background.mp3",
      tap: "/assets/sounds/tap.mp3",
      collect: "/assets/sounds/collect.mp3",
      avoidtap: "/assets/sounds/avoidtap.mp3",
      super: "/assets/sounds/super.mp3",
      wow: "/assets/sounds/wow.mp3",
      amazing: "/assets/sounds/amazing.mp3",
      extreme: "/assets/sounds/extreme.mp3",
      fantastic: "/assets/sounds/fantastic.mp3",
    };

    Object.entries(soundFiles).forEach(([name, path]) => {
      const audio = new Audio(process.env.PUBLIC_URL + path);
      if (name === "background") {
        audio.loop = true;
      }
      this.sounds[name] = audio;
    });

    this.initialized = true;
  }

  play(soundName, options = {}) {
    if (!this.initialized) {
      this.initialize();
    }

    if (this.muted) return;

    const sound = this.sounds[soundName];
    if (!sound) {
      console.log("Sound not found:", soundName);
      return;
    }

    try {
      if (soundName === "background") {
        if (options.resumeFrom) {
          // Only set currentTime if we want to resume from saved position
          sound.currentTime = this.backgroundPosition;
        } else {
          // Otherwise start from beginning
          sound.currentTime = 0;
        }
      } else {
        // Non-background sounds always start from beginning
        sound.currentTime = 0;
      }

      sound.volume = options.volume || (soundName === "background" ? 0.3 : 1);
      if (options.muffled) {
        sound.volume = options.volume || 0.1;
      }

      const playPromise = sound.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.log("Sound play failed:", error);
        });
      }
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  }

  async unlockAudio() {
    try {
      // Create and play a silent audio context to unlock audio on iOS
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const buffer = audioContext.createBuffer(1, 1, 22050);
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);

      // Also try to play each sound briefly
      Object.values(this.sounds).forEach((sound) => {
        sound.volume = 0;
        const playPromise = sound.play();
        if (playPromise) {
          playPromise
            .then(() => {
              sound.pause();
              sound.volume = 1;
            })
            .catch(() => {});
        }
      });
    } catch (error) {
      console.log("Audio unlock failed:", error);
    }
  }

  stopAll() {
    Object.values(this.sounds).forEach((sound) => {
      if (sound.src.includes("background")) {
        this.backgroundPosition = sound.currentTime; // Save position before stopping
      }
      sound.pause();
    });
  }

  getMuteState() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopAll();
    } else {
      // When unmuting, resume background music from saved position
      const backgroundSound = this.sounds.background;
      if (backgroundSound) {
        backgroundSound.currentTime = this.backgroundPosition;
        backgroundSound.volume = 0.3;
        backgroundSound.play();
      }
    }
    return this.muted;
  }

  setMuffled(muffled, options = {}) {
    Object.values(this.sounds).forEach((sound) => {
      if (muffled) {
        sound.volume = options.volume || 0.1;
      } else {
        sound.volume = 0.3; // Default volume when unmuffled
      }
    });
  }

  // ... rest of your sound manager code ...
}

export const soundManager = new SoundManager();
