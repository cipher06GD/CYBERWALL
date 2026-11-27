/* ============================================================
   endingCutscene.js
   Ending cutscene for OPERATION ZERO - shown after Mission 6.
   Uses the same cutscene overlay style as the intro but with
   the ending story lines. After it finishes, shows the final
   achievement screen with all badges and score.
   ============================================================ */

const EndingCutscene = {
    currentLine: 0,
    isTyping: false,
    typewriterInterval: null,
    fullText: '',

    // Start the ending cutscene
    start() {
        this.currentLine = 0;
        Game.showOverlay('ending-cutscene');
        Game.paused = true;

        // Set up keyboard listeners
        this.setupKeyboard();

        // Show first line
        this.showLine();

        AudioManager.playSuccess();
    },

    // Set up Space/Enter to advance
    setupKeyboard() {
        var self = this;
        var handler = function (e) {
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'Spacebar') {
                e.preventDefault();
                if (self.isTyping) {
                    self.skipTypewriter();
                } else {
                    self.nextLine();
                }
            }
        };
        document.addEventListener('keydown', handler);
        this.keyHandler = handler;
    },

    // Remove keyboard listener
    removeKeyboard() {
        if (this.keyHandler) {
            document.removeEventListener('keydown', this.keyHandler);
            this.keyHandler = null;
        }
    },

    // Show current line with typewriter effect
    showLine() {
        if (this.currentLine >= Story.ending.length) {
            this.finish();
            return;
        }

        var line = Story.ending[this.currentLine];
        this.fullText = line.text;

        var textEl = document.getElementById('ending-text');
        textEl.textContent = '';
        textEl.className = 'cutscene-text ' + line.style;

        // Typewriter effect
        this.isTyping = true;
        var charIndex = 0;
        var self = this;

        this.typewriterInterval = setInterval(function () {
            if (charIndex < self.fullText.length) {
                textEl.textContent += self.fullText[charIndex];
                charIndex++;

                // Tick sound every few characters (safe check)
                if (charIndex % 3 === 0 && typeof AudioManager.playTick === 'function') {
                    AudioManager.playTick();
                }
            } else {
                clearInterval(self.typewriterInterval);
                self.typewriterInterval = null;
                self.isTyping = false;
            }
        }, 35); // Slightly slower than intro for dramatic ending
    },

    // Skip typewriter animation, show full text immediately
    skipTypewriter() {
        if (!this.isTyping) return;

        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }

        var textEl = document.getElementById('ending-text');
        textEl.textContent = this.fullText;
        this.isTyping = false;
    },

    // Advance to next line
    nextLine() {
        this.currentLine++;
        this.showLine();
        AudioManager.playClick();
    },

    // Skip entire cutscene
    skip() {
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        this.finish();
        AudioManager.playClick();
    },

    // End cutscene and show final achievement screen
    finish() {
        this.removeKeyboard();

        // Mark ending as seen
        if (Game.state) {
            Game.state.endingSeen = true;
            SaveSystem.save(Game.state);
        }

        Game.hideOverlay('ending-cutscene');
        Game.paused = false;

        // Show the final achievement screen with all badges
        setTimeout(function () {
            Game.showFinalScreen(Game.state);
        }, 500);
    }
};
