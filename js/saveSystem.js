/* ============================================================
   saveSystem.js
   Handles saving and loading game progress using localStorage.
   Beginner-friendly: all data stored as a single JSON object.
   ============================================================ */

const SaveSystem = {
    // The key under which data is saved in localStorage
    SAVE_KEY: 'cyberwall_save_v1',

    // Default game state when starting fresh
    defaultState: {
        missions: {
            1: { status: 'locked',   title: 'The Suspicious Email',       badge: 'EMAIL DETECTIVE',    icon: '\u2709' },
            2: { status: 'locked',   title: 'The Weak Password',          badge: 'PASSWORD GUARDIAN',  icon: '\u{1F511}' },
            3: { status: 'locked',   title: 'The Fake Shopping Website',  badge: 'SCAM INVESTIGATOR',  icon: '\u{1F6D2}' },
            4: { status: 'locked',   title: 'Firewall Defence',            badge: 'FIREWALL DEFENDER',  icon: '\u{1F501}' },
            5: { status: 'locked',   title: 'Identity Theft Prevention',   badge: 'IDENTITY GUARDIAN',  icon: '\u{1F6E1}' },
            6: { status: 'locked',   title: 'Operation Zero',              badge: 'ZERO HUNTER',        icon: '\u{1F50D}' }
        },
        score: 0,
        badges: [],
        // Track which tool was used for each mission (so we know analysis happened)
        toolUsed: { 1: false, 2: false, 3: false, 4: false, 5: false },
        // Player location (scene name) for CONTINUE feature
        lastLocation: 'GameScene',  // Default: start on the street
        lastX: 900,  // Default spawn coordinates
        lastY: 400,
        // Story progress (OPERATION ZERO)
        clues: [],              // Array of collected clue IDs [1, 2, 3, 4, 5]
        introSeen: false,       // Has the player seen the intro cutscene?
        node7Revealed: false,   // Has node-7 location been revealed after clue 5?
        endingSeen: false,      // Has the player seen the ending cutscene?
        // Settings
        settings: {
            musicVolume: 50,
            sfxVolume: 70,
            muted: false
        }
    },

    // Load saved state from localStorage, or return defaults
    load() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                // Merge with defaults to handle missing keys after updates (backward compatibility)
                return Object.assign({}, this.defaultState, data, {
                    missions: Object.assign({}, this.defaultState.missions, data.missions || {}),
                    settings: Object.assign({}, this.defaultState.settings, data.settings || {}),
                    toolUsed: Object.assign({}, this.defaultState.toolUsed, data.toolUsed || {}),
                    lastLocation: data.lastLocation || this.defaultState.lastLocation,
                    lastX: data.lastX || this.defaultState.lastX,
                    lastY: data.lastY || this.defaultState.lastY,
                    // Story fields (safe merge for old saves without these fields)
                    clues: data.clues || [],
                    introSeen: data.introSeen || false,
                    node7Revealed: data.node7Revealed || false,
                    endingSeen: data.endingSeen || false
                });
            }
        } catch (e) {
            console.warn('SaveSystem: Could not load save data.', e);
        }
        // Return a deep copy of defaults
        return JSON.parse(JSON.stringify(this.defaultState));
    },

    // Save current state to localStorage
    save(state) {
        try {
            // Auto-update location if Game.activeScene exists
            if (typeof Game !== 'undefined' && Game.activeScene) {
                var scene = Game.activeScene;
                state.lastLocation = scene.scene.key || 'GameScene';
                
                // Save player position if available
                if (scene.player) {
                    state.lastX = Math.round(scene.player.x);
                    state.lastY = Math.round(scene.player.y);
                }
            }
            
            localStorage.setItem(this.SAVE_KEY, JSON.stringify(state));
            return true;
        } catch (e) {
            console.warn('SaveSystem: Could not save data.', e);
            return false;
        }
    },

    // Delete all saved data
    reset() {
        localStorage.removeItem(this.SAVE_KEY);
    },

    // Check if a save file exists
    hasSave() {
        try {
            const raw = localStorage.getItem(this.SAVE_KEY);
            return raw !== null && raw !== undefined;
        } catch (e) {
            return false;
        }
    },

    // Check if all 5 missions are completed
    allMissionsComplete(state) {
        return [1, 2, 3, 4, 5].every(function (id) {
            return state.missions && state.missions[id] && state.missions[id].status === 'completed';
        });
    },

    // Check if all 6 missions (including Operation Zero) are completed
    allMissionsCompleteWithFinale(state) {
        return [1, 2, 3, 4, 5, 6].every(function (id) {
            return state.missions && state.missions[id] && state.missions[id].status === 'completed';
        });
    }
};
