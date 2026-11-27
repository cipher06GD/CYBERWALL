/* ============================================================
   introCutscene.js
   Handles the OPERATION ZERO intro cutscene
   Shows on NEW GAME only when introSeen is false
   ============================================================ */

const IntroCutscene = {
    currentLine: 0,
    isTyping: false,
    typewriterInterval: null,
    fullText: '',
    
    // Start the intro cutscene
    start() {
        this.currentLine = 0;
        Game.showOverlay('intro-cutscene');
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
        var handler = function(e) {
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
        if (this.currentLine >= Story.intro.length) {
            this.finish();
            return;
        }
        
        var line = Story.intro[this.currentLine];
        this.fullText = line.text;
        
        var textEl = document.getElementById('intro-text');
        textEl.textContent = '';
        textEl.className = 'cutscene-text ' + line.style;
        
        // Typewriter effect
        this.isTyping = true;
        var charIndex = 0;
        var self = this;
        
        this.typewriterInterval = setInterval(function() {
            if (charIndex < self.fullText.length) {
                textEl.textContent += self.fullText[charIndex];
                charIndex++;
                
                // Sound effect every few characters (optional, won't crash if missing)
                if (charIndex % 3 === 0 && typeof AudioManager.playTick === 'function') {
                    AudioManager.playTick();
                }
            } else {
                clearInterval(self.typewriterInterval);
                self.typewriterInterval = null;
                self.isTyping = false;
            }
        }, 30);
    },
    
    // Skip typewriter animation, show full text immediately
    skipTypewriter() {
        if (!this.isTyping) return;
        
        if (this.typewriterInterval) {
            clearInterval(this.typewriterInterval);
            this.typewriterInterval = null;
        }
        
        var textEl = document.getElementById('intro-text');
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
    
    // End cutscene
    finish() {
        this.removeKeyboard();
        
        // Mark intro as seen
        if (Game.state) {
            Game.state.introSeen = true;
            SaveSystem.save(Game.state);
        }
        
        Game.hideOverlay('intro-cutscene');
        Game.paused = false;
        
        // Show notification to start first mission
        setTimeout(function() {
            Game.showNotification('Mission 1 available: Talk to Alex on Main Street');
        }, 500);
    }
};
