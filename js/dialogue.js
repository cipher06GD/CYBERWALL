/* ============================================================
   dialogue.js
   Dialogue system that shows NPC conversations as an HTML overlay.
   Handles multi-line dialogue, accept/decline, and completion.
   ============================================================ */

const Dialogue = {
    currentNPC: null,   // The NPC data object currently being talked to
    lines: [],          // Array of dialogue lines to show
    lineIndex: 0,       // Current line being shown
    typewriterTimer: null,
    isTyping: false,
    fullText: '',       // Full text of the current line (for typewriter effect)

    // Start a conversation with an NPC
    // npc: the NPC data object
    // lines: array of strings to display one by one
    // onComplete: optional callback when all lines are shown
    start(npc, lines, onComplete, showAcceptButton, onAccept) {
        this.currentNPC = npc;
        this.lines = lines;
        this.lineIndex = 0;
        this.onComplete = onComplete || null;
        this.onAccept = onAccept || null;
        this.showAcceptButton = showAcceptButton || false;

        Game.showOverlay('dialogue-overlay');
        AudioManager.playInteract();

        // Set portrait (emoji icon for simplicity)
        document.getElementById('dialogue-portrait').textContent = npc.icon || '\u{1F464}';
        document.getElementById('dialogue-name').textContent = npc.name + ' - ' + npc.title;

        // Show first line
        this.showLine();
    },

    // Display the current line with a typewriter effect
    showLine() {
        if (this.lineIndex >= this.lines.length) {
            this.finish();
            return;
        }

        this.fullText = this.lines[this.lineIndex];
        var textEl = document.getElementById('dialogue-text');
        textEl.textContent = '';
        this.isTyping = true;
        var charIndex = 0;

        // Clear any existing timer
        if (this.typewriterTimer) clearInterval(this.typewriterTimer);

        // Typewriter: reveal one character at a time
        var self = this;
        this.typewriterTimer = setInterval(function () {
            textEl.textContent += self.fullText[charIndex];
            charIndex++;
            if (charIndex >= self.fullText.length) {
                clearInterval(self.typewriterTimer);
                self.typewriterTimer = null;
                self.isTyping = false;
                self.showButtons();
            }
        }, 25);
    },

    // Show the action buttons (Continue, Accept, etc.)
    showButtons() {
        var btnContainer = document.getElementById('dialogue-buttons');
        btnContainer.innerHTML = '';

        // If this is the last line and we need to show an accept button
        if (this.lineIndex === this.lines.length - 1 && this.showAcceptButton) {
            // Accept button
            var acceptBtn = document.createElement('button');
            acceptBtn.className = 'dialogue-btn accept-btn';
            acceptBtn.textContent = 'ACCEPT MISSION';
            acceptBtn.onclick = function () {
                AudioManager.playClick();
                Dialogue.close();
                if (Dialogue.onAccept) Dialogue.onAccept();
            };
            btnContainer.appendChild(acceptBtn);

            // Decline button
            var declineBtn = document.createElement('button');
            declineBtn.className = 'dialogue-btn';
            declineBtn.textContent = 'NOT NOW';
            declineBtn.onclick = function () {
                AudioManager.playClick();
                Dialogue.close();
                if (Dialogue.onComplete) Dialogue.onComplete();
            };
            btnContainer.appendChild(declineBtn);
        } else if (this.lineIndex < this.lines.length - 1) {
            // Continue button for non-final lines
            var contBtn = document.createElement('button');
            contBtn.className = 'dialogue-btn';
            contBtn.textContent = 'CONTINUE \u2192';
            contBtn.onclick = function () {
                AudioManager.playClick();
                Dialogue.lineIndex++;
                Dialogue.showLine();
            };
            btnContainer.appendChild(contBtn);
        } else {
            // Last line, no accept button -> show Close
            var closeBtn = document.createElement('button');
            closeBtn.className = 'dialogue-btn';
            closeBtn.textContent = 'CLOSE';
            closeBtn.onclick = function () {
                AudioManager.playClick();
                Dialogue.close();
                if (Dialogue.onComplete) Dialogue.onComplete();
            };
            btnContainer.appendChild(closeBtn);
        }
    },

    // Close the dialogue and clean up
    close() {
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        this.isTyping = false;
        Game.hideOverlay('dialogue-overlay');
        this.currentNPC = null;
        this.lines = [];
        this.lineIndex = 0;
    },

    // Skip the typewriter effect (show full text immediately)
    skipTypewriter() {
        if (!this.isTyping) return;
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        document.getElementById('dialogue-text').textContent = this.fullText;
        this.isTyping = false;
        this.showButtons();
    },

    // Advance dialogue or skip typewriter on E / Space / Click
    advance() {
        var overlay = document.getElementById('dialogue-overlay');
        if (!overlay || !overlay.classList.contains('active')) return;

        if (this.isTyping) {
            // First press skips typewriter effect
            this.skipTypewriter();
            return;
        }

        // If typing is already complete:
        if (this.lineIndex < this.lines.length - 1) {
            // Continue to next dialogue line
            AudioManager.playClick();
            this.lineIndex++;
            this.showLine();
        } else if (this.showAcceptButton) {
            // Final line with accept button: accept the mission
            AudioManager.playClick();
            this.close();
            if (this.onAccept) this.onAccept();
        } else {
            // Final line with close button: complete dialogue
            AudioManager.playClick();
            this.finish();
        }
    },

    // Global keyboard listener for dialogue progression
    handleKey(e) {
        var overlay = document.getElementById('dialogue-overlay');
        if (!overlay || !overlay.classList.contains('active')) return;

        if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
            e.preventDefault();
            this.advance();
        }
    },

    // Called when all lines have been shown and no accept button was needed
    finish() {
        this.close();
        if (this.onComplete) this.onComplete();
    }
};

// Listen for E and Space to advance dialogue
window.addEventListener('keydown', function (e) {
    Dialogue.handleKey(e);
});
