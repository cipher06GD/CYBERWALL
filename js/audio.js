/* ============================================================
   audio.js
   AudioManager - generates all game sounds using the Web Audio API.
   No external audio files needed; everything is synthesised live.
   ============================================================ */

const AudioManager = {
    ctx: null,           // AudioContext
    musicGain: null,     // Volume control for music
    sfxGain: null,       // Volume control for sound effects
    musicTimer: null,    // Interval reference for background music loop
    isMuted: false,
    musicVolume: 0.5,
    sfxVolume: 0.7,

    // Initialise audio system (must be called after user interaction, e.g., a button click)
    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.musicGain = this.ctx.createGain();
            this.sfxGain = this.ctx.createGain();
            this.musicGain.connect(this.ctx.destination);
            this.sfxGain.connect(this.ctx.destination);
            this.musicGain.gain.value = this.musicVolume * 0.3; // Music kept quieter than SFX
            this.sfxGain.gain.value = this.sfxVolume;
        } catch (e) {
            console.warn('AudioManager: Web Audio not available.', e);
        }
    },

    // Set music volume (0-1)
    setMusicVolume(v) {
        this.musicVolume = v;
        if (this.musicGain) this.musicGain.gain.value = this.isMuted ? 0 : v * 0.3;
    },

    // Set SFX volume (0-1)
    setSfxVolume(v) {
        this.sfxVolume = v;
        if (this.sfxGain) this.sfxGain.gain.value = this.isMuted ? 0 : v;
    },

    // Mute/unmute all audio
    setMuted(muted) {
        this.isMuted = muted;
        if (this.musicGain) this.musicGain.gain.value = muted ? 0 : this.musicVolume * 0.3;
        if (this.sfxGain) this.sfxGain.gain.value = muted ? 0 : this.sfxVolume;
    },

    // Play a single tone (used by all SFX below)
    tone(freq, duration, type, gainNode) {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type || 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(gainNode || this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // Sound: button click
    playClick() {
        this.tone(800, 0.08, 'square');
        this.tone(1200, 0.05, 'square');
    },

    // Sound: menu button hover (crisp high-tech cyber blip)
    playHover() {
        if (!this.ctx) this.init();
        this.tone(1150, 0.03, 'sine');
    },

    // Sound: NPC interaction / dialogue open
    playInteract() {
        this.tone(523, 0.12, 'sine');   // C5
        this.tone(659, 0.12, 'sine');    // E5
        this.tone(784, 0.15, 'sine');    // G5
    },

    // Sound: walking footstep (short blip)
    playStep() {
        this.tone(150 + Math.random() * 30, 0.05, 'triangle');
    },

    // Sound: mission complete (rising fanfare)
    playMissionComplete() {
        if (!this.ctx || this.isMuted) return;
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach(function (freq, i) {
            setTimeout(function () { this.tone(freq, 0.2, 'sine'); }.bind(this), i * 120);
        }, this);
    },

    // Sound: warning / error
    playWarning() {
        this.tone(220, 0.15, 'sawtooth');
        this.tone(180, 0.2, 'sawtooth');
    },

    // Sound: success / correct answer
    playSuccess() {
        this.tone(659, 0.1, 'sine');   // E5
        this.tone(880, 0.15, 'sine');   // A5
    },

    // Sound: tool analysis complete
    playScan() {
        for (let i = 0; i < 5; i++) {
            setTimeout(function () { this.tone(600 + i * 100, 0.06, 'square'); }.bind(this), i * 60);
        }
    },

    // Sound: typewriter tick (for cutscenes)
    playTick() {
        this.tone(800 + Math.random() * 100, 0.02, 'square');
    },

    // ---- Background Music ----
    // A simple looping melody using scheduled notes. Not professional music,
    // but provides ambient atmosphere without needing audio files.
    startMusic() {
        if (!this.ctx || this.musicTimer) return;
        const melody = [
            262, 330, 392, 523,  440, 392, 330, 262,   // C4 E4 G4 C5  A4 G4 E4 C4
            294, 349, 440, 587,  523, 440, 349, 294,   // D4 F4 A4 D5  C5 A4 F4 D4
            330, 392, 523, 659,  587, 523, 392, 330,   // E4 G4 C5 E5  D5 C5 G4 E4
            262, 392, 523, 392,  330, 294, 262, 196    // C4 G4 C5 G4  E4 D4 C4 G3
        ];
        const bassline = [
            131, 131, 131, 131,  196, 196, 196, 196,
            147, 147, 147, 147,  175, 175, 175, 175,
            165, 165, 165, 165,  147, 147, 147, 147,
            131, 131, 131, 131,  131, 131, 131, 131
        ];
        let step = 0;
        const stepDuration = 280; // ms per note

        this.musicTimer = setInterval(function () {
            if (this.isMuted || !this.musicGain) return;
            // Play melody note
            this._playMusicNote(melody[step % melody.length], 0.25, 0.008);
            // Play bass note every 2 steps
            if (step % 2 === 0) {
                this._playMusicNote(bassline[(step / 2) % bassline.length] / 2, 0.5, 0.004);
            }
            step++;
        }.bind(this), stepDuration);
    },

    // Internal: play one music note through the music gain node
    _playMusicNote(freq, duration, volume) {
        if (!this.ctx || this.isMuted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // Stop background music
    stopMusic() {
        if (this.musicTimer) {
            clearInterval(this.musicTimer);
            this.musicTimer = null;
        }
    }
};
