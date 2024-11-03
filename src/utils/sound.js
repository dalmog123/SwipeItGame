class SoundManager {
  constructor() {
    // Update paths to match your public folder structure
    const basePath = process.env.PUBLIC_URL || "";

    this.sounds = {
      tap: new Audio(`${basePath}/assets/sounds/tap.mp3`),
      swipe: new Audio(`${basePath}/assets/sounds/swipe.mp3`),
    };

    // Flag to track if sounds are ready
    this.isInitialized = false;

    // Initialize on first user interaction
    document.addEventListener("click", () => this.initialize(), { once: true });
    document.addEventListener("touchstart", () => this.initialize(), {
      once: true,
    });
  }

  initialize() {
    if (this.isInitialized) return;

    Object.values(this.sounds).forEach((audio) => {
      audio.load();
      audio.volume = 0.3; // Lower volume a bit
    });

    this.isInitialized = true;
  }

  play(soundName) {
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Sound ${soundName} not found`);
      return;
    }

    // Check if the audio file is actually loaded
    if (sound.error) {
      console.error(`Error loading sound ${soundName}:`, sound.error);
      return;
    }

    // Create a new instance for each play
    const clone = sound.cloneNode();
    clone.play().catch((error) => {
      console.log(`Sound play prevented for ${soundName}:`, error);
    });
  }
}

export const soundManager = new SoundManager();
