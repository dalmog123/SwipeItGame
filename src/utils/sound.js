class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.currentBgMusic = null;
    this.audioContext = null;
    this.gainNode = null;
    this.filterNode = null;
    this.initialized = false;
    this.isMuted = localStorage.getItem("isMuted") === "true";
  }

  initialize() {
    if (this.initialized) return;

    // Create audio context
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Create audio effects
    this.gainNode = this.audioContext.createGain();
    this.filterNode = this.audioContext.createBiquadFilter();

    // Configure filter for muffled effect
    this.filterNode.type = "lowpass";
    this.filterNode.frequency.value = 200; // Your desired initial frequency

    // Connect nodes
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Apply stored mute state to all sounds
    if (this.isMuted) {
      this.sounds.forEach((sound) => {
        if (sound && sound.audio) {
          sound.audio.muted = true;
        }
      });
    }

    this.initialized = true;

    // Reconnect any existing sounds
    this.sounds.forEach((sound) => {
      if (!sound.source) {
        sound.source = this.audioContext.createMediaElementSource(sound.audio);
      }
    });
  }

  add(name, path, options = {}) {
    const fullPath = `${process.env.PUBLIC_URL}${path}`;
    const audio = new Audio(fullPath);
    audio.loop = options.loop || false;

    this.sounds.set(name, {
      audio,
      source: null, // Will be initialized when needed
      options,
    });
  }

  async play(name, effects = { muffled: false, volume: 1 }) {
    if (!this.initialized) {
      this.initialize();
    }

    const sound = this.sounds.get(name);
    if (!sound) return;

    try {
      // Initialize source if not already done
      if (!sound.source) {
        sound.source = this.audioContext.createMediaElementSource(sound.audio);
      }

      if (sound.options.loop) {
        if (this.currentBgMusic && this.currentBgMusic !== sound) {
          await this.currentBgMusic.audio.pause();
          this.currentBgMusic.audio.currentTime = 0;
        }
        this.currentBgMusic = sound;
      }

      // Resume AudioContext if it's suspended
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Connect source to effects chain
      sound.source.disconnect();
      if (effects.muffled) {
        sound.source.connect(this.filterNode);
        this.filterNode.frequency.value = 1500;
        this.gainNode.gain.value = effects.volume;
      } else {
        sound.source.connect(this.gainNode);
        this.gainNode.gain.value = effects.volume;
      }

      if (sound.audio.paused) {
        sound.audio.currentTime = 0;
        await sound.audio.play();
      }
    } catch (error) {
      console.log("Audio play failed:", error);
    }
  }

  setMuffled(enabled) {
    if (!this.initialized || !this.currentBgMusic) return;

    const currentTime = this.audioContext.currentTime;

    // Longer, smoother transition time
    const transitionDuration = 1.0; // 1 second transition

    // Target values
    const targetFreq = enabled ? 200 : 1500;
    const targetVol = enabled ? 0.2 : 0.7;

    // Get current values
    const currentFreq = this.filterNode.frequency.value;
    const currentVol = this.gainNode.gain.value;

    // Cancel any scheduled values
    this.filterNode.frequency.cancelScheduledValues(currentTime);
    this.gainNode.gain.cancelScheduledValues(currentTime);

    // Set starting points
    this.filterNode.frequency.setValueAtTime(currentFreq, currentTime);
    this.gainNode.gain.setValueAtTime(currentVol, currentTime);

    // Smooth exponential transition for frequency
    this.filterNode.frequency.exponentialRampToValueAtTime(
      targetFreq,
      currentTime + transitionDuration
    );

    // Smooth linear transition for volume
    this.gainNode.gain.linearRampToValueAtTime(
      targetVol,
      currentTime + transitionDuration
    );
  }

  stop(name) {
    const sound = this.sounds.get(name);
    if (!sound) return;

    sound.audio.pause();
    sound.audio.currentTime = 0;
  }

  stopAll() {
    this.sounds.forEach((sound) => {
      sound.audio.pause();
      sound.audio.currentTime = 0;
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;

    // Initialize if not already initialized
    if (!this.initialized) {
      this.initialize();
    }

    // Only try to resume audioContext if it exists and is suspended
    if (this.audioContext && this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    // Handle background music if it exists
    if (this.currentBgMusic) {
      this.currentBgMusic.audio.muted = this.isMuted;
    }

    // Mute/unmute all current sounds
    this.sounds.forEach((sound) => {
      if (sound && sound.audio) {
        sound.audio.muted = this.isMuted;
      }
    });

    // Store mute state in localStorage for persistence
    localStorage.setItem("isMuted", this.isMuted.toString());

    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();

// Add your sounds
soundManager.add("background", "/assets/sounds/background.mp3", { loop: true });
soundManager.add("tap", "/assets/sounds/tap.mp3", { loop: false });
soundManager.add("avoidtap", "/assets/sounds/avoidtap.mp3", { loop: false });
soundManager.add("super", "/assets/sounds/super.mp3");
soundManager.add("wow", "/assets/sounds/wow.mp3");
soundManager.add("amazing", "/assets/sounds/amazing.mp3");
soundManager.add("extreme", "/assets/sounds/extreme.mp3");
soundManager.add("fantastic", "/assets/sounds/fantastic.mp3");
// Debug log to check the path
console.log(
  "Audio path:",
  `${process.env.PUBLIC_URL}/assets/sounds/background.mp3`
);
