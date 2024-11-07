class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.currentBgMusic = null;
    this.audioContext = null;
    this.gainNode = null;
    this.filterNode = null;
    this.initialized = false;
    this.isMuted = localStorage.getItem("isMuted") === "true";
    this.isTransitioning = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext({
        latencyHint: "interactive",
        sampleRate: 44100,
      });

      this.gainNode = this.audioContext.createGain();
      this.filterNode = this.audioContext.createBiquadFilter();
      this.filterNode.type = "lowpass";
      this.filterNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.sounds.forEach((sound) => {
        if (sound && sound.audio) {
          sound.audio.muted = this.isMuted;
          sound.audio.volume = this.isMuted ? 0 : sound.options?.volume || 1;
        }
      });

      this.initialized = true;
    } catch (error) {
      console.error("Audio initialization failed:", error);
    }
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
      await this.initialize();
    }

    const sound = this.sounds.get(name);
    if (!sound) return;

    try {
      if (name === "avoidtap") {
        const audio = sound.audio.cloneNode();
        audio.volume = effects.volume || 1;

        // Play immediately without waiting for transitions
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing avoid sound:", error);
          });
        }
        return audio;
      }

      if (sound.audio.paused) {
        sound.audio.currentTime = 0;
        sound.audio.muted = this.isMuted;
        sound.audio.volume = this.isMuted ? 0 : effects.volume || 1;

        const playPromise = sound.audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      }
    } catch (error) {
      console.error(`Failed to play ${name}:`, error);
    }
  }

  async setMuffled(enabled, options = {}) {
    if (!this.initialized || this.isTransitioning) return;

    try {
      this.isTransitioning = true;
      const currentTime = this.audioContext.currentTime;
      const transitionDuration = enabled ? 1.5 : 2.0; // Longer transition when muffling for game over

      const targetFreq = enabled ? options.frequency || 200 : 1500;
      const targetVol = enabled ? options.volume || 0.2 : 0.7;

      // Cancel any ongoing transitions
      this.filterNode.frequency.cancelScheduledValues(currentTime);
      this.gainNode.gain.cancelScheduledValues(currentTime);

      // Get current values
      const currentFreq = this.filterNode.frequency.value;
      const currentVol = this.gainNode.gain.value;

      // Set starting points
      this.filterNode.frequency.setValueAtTime(currentFreq, currentTime);
      this.gainNode.gain.setValueAtTime(currentVol, currentTime);

      // Create smoother frequency transition with curve
      if (enabled) {
        // Gradual frequency decrease for muffling
        const steps = 30; // More steps for smoother transition
        const stepDuration = transitionDuration / steps;

        for (let i = 0; i <= steps; i++) {
          const time = currentTime + i * stepDuration;
          const progress = i / steps;
          // Use easeInOutQuad for smoother transition
          const easeProgress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          const freqValue =
            currentFreq + (targetFreq - currentFreq) * easeProgress;

          this.filterNode.frequency.setValueAtTime(freqValue, time);
        }
      } else {
        // Quick unmuffling
        this.filterNode.frequency.exponentialRampToValueAtTime(
          targetFreq,
          currentTime + transitionDuration
        );
      }

      // Volume transition
      if (enabled) {
        // Gradual volume decrease for muffling
        const steps = 30;
        const stepDuration = transitionDuration / steps;

        for (let i = 0; i <= steps; i++) {
          const time = currentTime + i * stepDuration;
          const progress = i / steps;
          // Use easeInOutQuad
          const easeProgress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          const volumeValue =
            currentVol + (targetVol - currentVol) * easeProgress;

          this.gainNode.gain.setValueAtTime(volumeValue, time);
        }
      } else {
        // Use linear ramp for unmuffling
        this.gainNode.gain.linearRampToValueAtTime(
          targetVol,
          currentTime + transitionDuration
        );
      }

      // Update all sounds with new volume using the same smooth transition
      this.sounds.forEach((sound) => {
        if (sound && sound.audio) {
          const targetSoundVol = enabled ? 0.2 : sound.options?.volume || 1;
          const initialVolume = sound.audio.volume;
          const volumeDiff = targetSoundVol - initialVolume;
          const steps = 30;
          const stepDuration = transitionDuration / steps;

          for (let i = 0; i <= steps; i++) {
            setTimeout(() => {
              const progress = i / steps;
              const easeProgress =
                progress < 0.5
                  ? 2 * progress * progress
                  : 1 - Math.pow(-2 * progress + 2, 2) / 2;
              sound.audio.volume = initialVolume + volumeDiff * easeProgress;
            }, i * stepDuration * 1000);
          }
        }
      });

      // Release the transition lock after the transition completes
      setTimeout(() => {
        this.isTransitioning = false;
      }, transitionDuration * 1000);
    } catch (error) {
      console.error("Error setting muffled state:", error);
      this.isTransitioning = false;
    }
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

  async toggleMute() {
    if (!this.initialized) {
      await this.initialize();
    }

    this.isMuted = !this.isMuted;

    try {
      this.sounds.forEach((sound) => {
        if (sound && sound.audio) {
          sound.audio.muted = this.isMuted;
          sound.audio.volume = this.isMuted ? 0 : sound.options?.volume || 1;
        }
      });

      if (this.currentBgMusic) {
        this.currentBgMusic.muted = this.isMuted;
        this.currentBgMusic.volume = this.isMuted ? 0 : 0.3; // Background music volume
      }

      if (this.gainNode) {
        this.gainNode.gain.setValueAtTime(
          this.isMuted ? 0 : 1,
          this.audioContext.currentTime
        );
      }

      localStorage.setItem("isMuted", this.isMuted.toString());
    } catch (error) {
      console.error("Error toggling mute:", error);
    }

    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }

  async unlockAudio() {
    if (!this.initialized) {
      await this.initialize();
    }

    const buffer = this.audioContext.createBuffer(1, 1, 22050);
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }
}

export const soundManager = new SoundManager();

soundManager.add("background", "/assets/sounds/background.mp3", { loop: true });
soundManager.add("tap", "/assets/sounds/tap.mp3", { loop: false });
soundManager.add("avoidtap", "/assets/sounds/avoidtap.mp3", { loop: false });
soundManager.add("super", "/assets/sounds/super.mp3");
soundManager.add("wow", "/assets/sounds/wow.mp3");
soundManager.add("amazing", "/assets/sounds/amazing.mp3");
soundManager.add("extreme", "/assets/sounds/extreme.mp3");
soundManager.add("fantastic", "/assets/sounds/fantastic.mp3");
console.log(
  "Audio path:",
  `${process.env.PUBLIC_URL}/assets/sounds/background.mp3`
);
