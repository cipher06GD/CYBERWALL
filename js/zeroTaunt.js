/* ============================================================
   zeroTaunt.js
   ZERO Taunt overlay - shown after each mission badge (missions 1-5).
   Displays glitchy red taunt text from ZERO for 4 seconds,
   then auto-dismisses.
   ============================================================ */

const ZeroTaunt = {
    dismissTimer: null,

    // Show the ZERO taunt for a given mission ID (1-5)
    show(missionId) {
        // Only missions 1-5 have taunts
        if (!Story.zeroTaunts || !Story.zeroTaunts[missionId]) return;

        var tauntText = Story.zeroTaunts[missionId];
        var textEl = document.getElementById('zero-taunt-text');
        if (!textEl) return;

        // Set the taunt text
        textEl.textContent = tauntText;

        // Show the overlay (Game.showOverlay adds 'active' class and pauses the game)
        if (typeof Game !== 'undefined' && Game.showOverlay) {
            Game.showOverlay('zero-taunt-overlay');
        } else {
            document.getElementById('zero-taunt-overlay').classList.add('active');
        }

        // Play a warning / glitch sound (safe check for cached old audio.js)
        if (typeof AudioManager.playWarning === 'function') {
            AudioManager.playWarning();
        }

        // Auto-dismiss after 4 seconds
        var self = this;
        if (this.dismissTimer) clearTimeout(this.dismissTimer);
        this.dismissTimer = setTimeout(function () {
            self.hide();
        }, 4000);
    },

    // Hide the taunt overlay (also called when player clicks to skip)
    hide() {
        // Use Game.hideOverlay so the pause state is managed correctly
        if (typeof Game !== 'undefined' && Game.hideOverlay) {
            Game.hideOverlay('zero-taunt-overlay');
        } else {
            var el = document.getElementById('zero-taunt-overlay');
            if (el) el.classList.remove('active');
        }
        if (this.dismissTimer) {
            clearTimeout(this.dismissTimer);
            this.dismissTimer = null;
        }
    }
};
