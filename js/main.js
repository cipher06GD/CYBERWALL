/* ============================================================
   main.js
   The central file that ties everything together.
   Defines the global Game object, Dashboard tab manager,
   BootScene (texture generation), and the Phaser configuration.
   ============================================================ */

// ============================================================
// GLOBAL GAME OBJECT
// Handles overlays, HUD, pause, save state, and all UI logic
// referenced by HTML buttons via onclick attributes.
// ============================================================
const Game = {
    // ---- Properties ----
    state: null,          // Save data loaded from localStorage
    paused: false,        // When true, player can't move
    activeScene: null,     // Current Phaser scene reference
    phaserGame: null,     // Phaser.Game instance
    texturesGenerated: false,

    // Overlays that should pause the game when shown
    gameOverlays: [
        'dialogue-overlay',
        'dashboard-overlay',
        'pause-overlay',
        'mission-complete-overlay',
        'final-overlay',
        'guide-overlay',
        'caseboard-overlay',
        'zero-taunt-overlay'
    ],

    // ---- Show an overlay div ----
    showOverlay(id) {
        var el = document.getElementById(id);
        if (el) el.classList.add('active');

        // Pause game if this is a game overlay
        if (this.gameOverlays.indexOf(id) !== -1) {
            this.paused = true;
        }

        // Update settings UI when settings overlay opens
        if (id === 'settings-overlay') {
            this.updateSettingsUI();
        }

        // Render case board when investigation board opens
        if (id === 'caseboard-overlay') {
            this.renderCaseBoard();
        }

        // Launch celebratory confetti when mission completes
        if (id === 'mission-complete-overlay') {
            this.launchConfetti();
        }
    },

    // ---- Hide an overlay div ----
    hideOverlay(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('active');

        // Check if any game overlay is still open
        if (this.gameOverlays.indexOf(id) !== -1) {
            var anyOpen = false;
            this.gameOverlays.forEach(function (oid) {
                var oel = document.getElementById(oid);
                if (oel && oel.classList.contains('active')) anyOpen = true;
            });
            if (!anyOpen) this.paused = false;
        }
    },

    // ---- Start the game (from main menu) ----
    startGame(isContinue) {
        // Initialise audio (browser requires user interaction first)
        AudioManager.init();

        // Load saved data or start fresh
        if (isContinue) {
            this.state = SaveSystem.load();
            // Show welcome back notification
            var objective = Missions.getHUDText(this.state);
            setTimeout(function() {
                Game.showNotification('Welcome back, Officer! Current objective: ' + objective);
            }, 1500);
        } else {
            // Fresh start - always load whatever is there (for first-time players, it's defaults)
            this.state = SaveSystem.load();
            // Ensure mission 1 is unlocked for new players
            if (this.state.missions[1].status === 'locked') {
                this.state.missions[1].status = 'active';
            }
        }

        // Apply saved settings
        AudioManager.setMusicVolume(this.state.settings.musicVolume / 100);
        AudioManager.setSfxVolume(this.state.settings.sfxVolume / 100);
        AudioManager.setMuted(this.state.settings.muted);

        // Hide menu and any open sub-panels
        this.hideOverlay('menu-overlay');
        this.hideOverlay('howto-overlay');
        this.hideOverlay('guide-overlay');
        this.hideOverlay('settings-overlay');

        // OPERATION ZERO: Show intro cutscene on NEW GAME if not seen before
        if (!isContinue && !this.state.introSeen) {
            // Intro will start the game after it finishes
            this.phaserGame.scene.stop('BootScene');
            this.phaserGame.scene.start('GameScene');
            // Show intro after a brief moment
            setTimeout(function() {
                IntroCutscene.start();
            }, 500);
        } else {
            // Stop BootScene, start at saved location
            this.phaserGame.scene.stop('BootScene');
            var targetScene = this.state.lastLocation || 'GameScene';
            
            // Safety: if saved location was an interior, put player back on street
            // (restoring exact interior state is complex, and street is always safe)
            if (targetScene === 'InteriorScene') {
                targetScene = 'GameScene';
            }
            
            this.phaserGame.scene.start(targetScene);
        }

        AudioManager.playClick();
    },

    // ---- Continue from saved game ----
    continueGame() {
        this.startGame(true);
    },

    // ---- Start new game (with confirmation) ----
    newGame() {
        if (confirm('Start a NEW GAME? This will reset all progress, badges, and scores. Your current save will be deleted.')) {
            SaveSystem.reset();
            this.startGame(false);
        }
    },

    // ---- Return to main menu ----
    returnToMenu() {
        // Hide all game overlays
        this.gameOverlays.forEach(function (id) { Game.hideOverlay(id); });
        this.hideHUD();

        // Stop game music
        AudioManager.stopMusic();

        // Stop GameScene, restart BootScene (shows menu)
        this.phaserGame.scene.stop('GameScene');
        this.phaserGame.scene.start('BootScene');

        AudioManager.playClick();
    },

    // ---- Restart the game from scratch (reset progress) ----
    restartGame() {
        // Reset save data
        SaveSystem.reset();
        this.state = SaveSystem.load();

        // Hide final and mission complete overlays
        this.hideOverlay('final-overlay');
        this.hideOverlay('mission-complete-overlay');

        // Restart the game scene
        this.phaserGame.scene.stop('GameScene');
        this.phaserGame.scene.start('GameScene');

        AudioManager.playClick();
    },

    // ---- Show the CyberWall dashboard (laptop or firewall) ----
    showDashboard(tab) {
        Dashboard.switchTab(tab);
        this.showOverlay('dashboard-overlay');
        AudioManager.playInteract();
    },

    // ---- Close the dashboard ----
    closeDashboard() {
        this.hideOverlay('dashboard-overlay');
        AudioManager.playClick();
    },

    // ---- Pause / Resume ----
    togglePause() {
        this.showOverlay('pause-overlay');
        AudioManager.playClick();
    },

    resumeGame() {
        this.hideOverlay('pause-overlay');
        AudioManager.playClick();
    },

    // ---- Close mission complete overlay ----
    closeMissionComplete() {
        this.hideOverlay('mission-complete-overlay');
        AudioManager.playClick();

        var missionId = Missions.lastCompletedMission;

        // OPERATION ZERO: Show clue notification + ZERO taunt for missions 1-5
        if (missionId && missionId >= 1 && missionId <= 5) {
            Missions.lastCompletedMission = null;

            // Show "CLUE FOUND" notification
            if (this.state.clues && this.state.clues.indexOf(missionId) !== -1) {
                var clue = Story.clues[missionId];
                if (clue) {
                    var self = this;
                    setTimeout(function () {
                        self.showNotification('CLUE ' + missionId + ' OF 5 FOUND: ' + clue.title);
                    }, 500);
                }
            }

            // Show ZERO taunt after a brief delay (auto-dismisses in 4 seconds)
            setTimeout(function () {
                ZeroTaunt.show(missionId);
            }, 1000);

            // If all 5 missions done and all clues collected -> notify about Mission 6
            if (Missions.allFiveDone && this.state.clues && this.state.clues.length >= 5) {
                Missions.allFiveDone = false;
                setTimeout(function () {
                    Game.showNotification('All 5 clues collected! Go to the Firewall Control Centre and find node-7.');
                }, 5500);
            }
        } else if (missionId === 6) {
            // Mission 6 (Operation Zero) complete -> show ending cutscene
            Missions.lastCompletedMission = null;
            Missions.allFiveDone = false;
            setTimeout(function () {
                EndingCutscene.start();
            }, 500);
        } else {
            // Fallback - check if final screen is needed
            if (Missions.allFiveDone) {
                Missions.allFiveDone = false;
                setTimeout(function () {
                    Game.showFinalScreen(Game.state);
                }, 1000);
            }
        }
    },

    // ---- Show final achievement screen ----
    showFinalScreen(state) {
        // Populate badge grid
        var grid = document.getElementById('final-badge-grid');
        grid.innerHTML = '';
        state.badges.forEach(function (badge) {
            var item = document.createElement('div');
            item.className = 'badge-item';
            item.textContent = badge.icon;
            item.title = badge.name;
            grid.appendChild(item);
        });
        document.getElementById('final-score').textContent = state.score;
        this.showOverlay('final-overlay');
        AudioManager.playMissionComplete();
    },

    // ---- HUD management ----
    showHUD() {
        document.getElementById('hud').classList.remove('hidden');
    },

    hideHUD() {
        document.getElementById('hud').classList.add('hidden');
    },

    updateHUD() {
        if (!this.state) return;
        document.getElementById('hud-score').textContent = this.state.score;
        document.getElementById('hud-badge-count').textContent = this.state.badges.length;
        document.getElementById('hud-mission').textContent = Missions.getHUDText(this.state);
    },

    // ---- Exhibition Demo Mode: Unlocks all 5 missions ----
    toggleDemoMode() {
        var confirmed = confirm('DEMO MODE will unlock all missions for exhibition testing.\n\nThis WILL overwrite your current save.\n\nContinue?');
        if (!confirmed) return;
        
        if (!this.state) this.state = SaveSystem.load();
        for (var i = 1; i <= 5; i++) {
            if (this.state.missions[i] && this.state.missions[i].status === 'locked') {
                this.state.missions[i].status = 'active';
            }
        }
        SaveSystem.save(this.state);
        this.updateHUD();
        this.showNotification('Demo Mode: All 5 cases unlocked for exhibition testing!');
        AudioManager.playSuccess();
    },

    // ---- Render Cyber Crime Investigation Case Board ----
    renderCaseBoard() {
        var grid = document.getElementById('caseboard-grid');
        if (!grid) return;
        var s = this.state || SaveSystem.load();

        var cases = [
            { id: 1, title: 'Case 01: The Bank Phishing Scam', victim: 'Alex (Citizen)', desc: 'Attacker sent urgent spoofed email from fake bank domain to steal victim OTP.', tool: 'Phishing Email Detector', badge: '\u2709 EMAIL DETECTIVE' },
            { id: 2, title: 'Case 02: Password Vulnerability Audit', victim: 'Sarah (Student)', desc: 'Subject relied on common dictionary password "password123". Assisted in creating resilient passphrase.', tool: 'Password Strength Checker', badge: '\u{1F511} PASSWORD GUARDIAN' },
            { id: 3, title: 'Case 03: Smartphone Discount Scam URL', victim: 'David (Shopper)', desc: 'Investigated fake domain "amaz0n-mega-sale-deals.net" with digit swaps offering Rs. 999 smartphone.', tool: 'Fake Website & URL Detector', badge: '\u{1F6D2} SCAM INVESTIGATOR' },
            { id: 4, title: 'Case 04: Mainframe Firewall Defence', victim: 'Cyber City Network', desc: 'Hostile external IPs probed restricted ports 31337 and 4444. Filtered safe internal packets.', tool: 'Firewall Simulator', badge: '\u{1F501} FIREWALL DEFENDER' },
            { id: 5, title: 'Case 05: Social Media PII & Identity Theft', victim: 'Maya (Influencer)', desc: 'Fraudulent creator badge application solicited Aadhaar, mother\'s maiden name, and home address.', tool: 'Identity Defender Audit', badge: '\u{1F6E1} IDENTITY GUARDIAN' }
        ];

        var html = '';
        cases.forEach(function (c) {
            var m = s.missions[c.id];
            var status = m ? m.status : 'locked';
            var statusCls = status === 'completed' ? 'solved' : (status === 'locked' ? 'locked-case' : 'active-case');

            html += '<div class="case-card ' + statusCls + '">';
            html += '<div class="case-title">' + c.title + '</div>';
            html += '<div class="case-citizen">Complainant: ' + c.victim + '</div>';
            html += '<div class="case-desc">' + c.desc + '</div>';
            html += '<div style="font-size:0.75rem;color:#00f0ff;">Investigation Tool: ' + c.tool + '</div>';
            html += '<div class="case-badge-preview">' + c.badge + ' ' + (status === 'completed' ? '&#9989;' : '') + '</div>';
            html += '</div>';
        });

        grid.innerHTML = html;
    },

    // ---- Celebratory Particle Confetti on Badge Award ----
    launchConfetti() {
        var canvas = document.getElementById('badge-confetti-canvas');
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var particles = [];
        var colors = ['#00f0ff', '#b066ff', '#44ff88', '#ffd700', '#ff007f'];
        for (var i = 0; i < 75; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.7) * 16,
                size: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                decay: Math.random() * 0.015 + 0.008
            });
        }

        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            var active = false;
            particles.forEach(function (p) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.22;
                p.alpha -= p.decay;
                if (p.alpha > 0) {
                    active = true;
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, p.alpha);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(p.x, p.y, p.size, p.size);
                    ctx.restore();
                }
            });
            if (active) requestAnimationFrame(render);
        }
        render();
    },

    // ---- Main Menu Animated Skyline Background ----
    initMenuSkyline() {
        var canvas = document.getElementById('menu-skyline-canvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        var buildings = [];
        var num = 32;
        var w = canvas.width / num;
        for (var i = 0; i < num + 4; i++) {
            buildings.push({
                x: i * (w * 1.1) - 20,
                w: w * 1.25,
                h: Math.random() * 200 + 110,
                color: Math.random() > 0.5 ? '#0c1228' : '#140c24',
                neon: Math.random() > 0.5 ? '#00f0ff' : '#b066ff',
                winSeed: Math.random()
            });
        }

        var stars = [];
        for (var s = 0; s < 50; s++) {
            stars.push({ x: Math.random(), y: Math.random() * 0.5, size: Math.random() * 2, blink: Math.random() * 0.05 });
        }

        var beamAngle = 0;

        function draw() {
            var overlay = document.getElementById('menu-overlay');
            if (!overlay || !overlay.classList.contains('active')) {
                requestAnimationFrame(draw);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Night sky gradient
            var grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, '#060614');
            grad.addColorStop(0.65, '#120828');
            grad.addColorStop(1, '#080816');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Twinkling stars
            stars.forEach(function (star) {
                var alpha = 0.25 + Math.sin(Date.now() * 0.003 + star.blink * 100) * 0.35;
                ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.max(0, alpha) + ')';
                ctx.fillRect(star.x * canvas.width, star.y * canvas.height, star.size, star.size);
            });

            // Sweeping neon searchlights
            beamAngle += 0.006;
            var bx = canvas.width * 0.3;
            var by = canvas.height * 0.8;
            ctx.save();
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
            ctx.lineWidth = 40;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.sin(beamAngle) * 450, by - 550);
            ctx.stroke();

            var bx2 = canvas.width * 0.7;
            ctx.strokeStyle = 'rgba(176, 102, 255, 0.05)';
            ctx.beginPath();
            ctx.moveTo(bx2, by);
            ctx.lineTo(bx2 + Math.cos(beamAngle * 0.75) * 450, by - 550);
            ctx.stroke();
            ctx.restore();

            // Buildings
            var baseY = canvas.height * 0.84;
            buildings.forEach(function (b) {
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x, baseY - b.h, b.w, b.h + canvas.height * 0.2);

                // Neon roof edge
                ctx.fillStyle = b.neon;
                ctx.fillRect(b.x, baseY - b.h, b.w, 2);

                // Windows
                for (var r = 0; r < Math.floor(b.h / 18); r++) {
                    for (var c = 0; c < Math.floor(b.w / 14); c++) {
                        if (((r * 3 + c * 7 + Math.floor(b.winSeed * 10)) % 5) === 0) {
                            ctx.fillStyle = b.neon;
                            ctx.globalAlpha = 0.4;
                            ctx.fillRect(b.x + 4 + c * 14, baseY - b.h + 8 + r * 18, 5, 8);
                            ctx.globalAlpha = 1;
                        }
                    }
                }
            });

            requestAnimationFrame(draw);
        }
        draw();
    },

    // ---- Minimap / Radar Update ----
    updateMinimap(playerX, playerY, targetPos) {
        var canvas = document.getElementById('hud-minimap');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var mw = canvas.width;
        var mh = canvas.height;
        var scaleX = mw / 2000;
        var scaleY = mh / 1150;

        ctx.clearRect(0, 0, mw, mh);

        // Ground
        ctx.fillStyle = '#0a0d1e';
        ctx.fillRect(0, 0, mw, mh);

        // Roads
        ctx.fillStyle = '#16192e';
        ctx.fillRect(0, 390 * scaleY - 2, mw, 60 * scaleY);
        ctx.fillRect(760 * scaleX - 2, 0, 60 * scaleX, mh);

        // Buildings
        var bColors = [0x00aaff, 0x00f0ff, 0xb066ff, 0xff6644];
        if (typeof BUILDINGS !== 'undefined') {
            BUILDINGS.forEach(function (b, idx) {
                ctx.fillStyle = '#' + (b.neon || bColors[idx % 4]).toString(16).padStart(6, '0');
                ctx.globalAlpha = 0.35;
                ctx.fillRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);
                ctx.strokeStyle = ctx.fillStyle;
                ctx.globalAlpha = 0.8;
                ctx.strokeRect(b.x * scaleX, b.y * scaleY, b.w * scaleX, b.h * scaleY);
            });
            ctx.globalAlpha = 1;
        }

        // Target / Active Objective (pulsing gold beacon)
        if (targetPos) {
            var tx = targetPos.x * scaleX;
            var ty = targetPos.y * scaleY;
            var pulse = Math.sin(Date.now() * 0.008) * 1.5;
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(tx, ty, 3 + pulse, 0, Math.PI * 2);
            ctx.fill();
        }

        // Player (cyan dot)
        if (playerX !== undefined && playerY !== undefined) {
            var px = playerX * scaleX;
            var py = playerY * scaleY;
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    },

    // ---- Notification toast ----
    showNotification(msg) {
        var notif = document.getElementById('notification');
        notif.textContent = msg;
        notif.classList.remove('hidden');
        setTimeout(function () {
            notif.classList.add('hidden');
        }, 4000);
    },

    // ---- Settings ----
    updateSettingsUI() {
        if (!this.state) {
            // Use defaults from save system
            this.state = SaveSystem.load();
        }
        document.getElementById('music-volume').value = this.state.settings.musicVolume;
        document.getElementById('sfx-volume').value = this.state.settings.sfxVolume;
        document.getElementById('music-volume-label').textContent = this.state.settings.musicVolume + '%';
        document.getElementById('sfx-volume-label').textContent = this.state.settings.sfxVolume + '%';
        document.getElementById('mute-toggle').textContent = this.state.settings.muted ? 'ON' : 'OFF';
    },

    updateMusicVolume(val) {
        var v = parseInt(val);
        document.getElementById('music-volume-label').textContent = v + '%';
        AudioManager.setMusicVolume(v / 100);
        if (this.state) {
            this.state.settings.musicVolume = v;
            SaveSystem.save(this.state);
        }
    },

    updateSfxVolume(val) {
        var v = parseInt(val);
        document.getElementById('sfx-volume-label').textContent = v + '%';
        AudioManager.setSfxVolume(v / 100);
        if (this.state) {
            this.state.settings.sfxVolume = v;
            SaveSystem.save(this.state);
        }
    },

    toggleMute() {
        var btn = document.getElementById('mute-toggle');
        var currentlyOff = btn.textContent === 'OFF';
        if (currentlyOff) {
            btn.textContent = 'ON';
            AudioManager.setMuted(true);
            if (this.state) { this.state.settings.muted = true; SaveSystem.save(this.state); }
        } else {
            btn.textContent = 'OFF';
            AudioManager.setMuted(false);
            if (this.state) { this.state.settings.muted = false; SaveSystem.save(this.state); }
        }
        AudioManager.playClick();
    },

    // ---- Reset all progress ----
    resetProgress() {
        if (confirm('Are you sure you want to reset ALL game progress? This will delete all badges and scores. This cannot be undone.')) {
            SaveSystem.reset();
            this.state = SaveSystem.load();
            this.updateHUD();
            this.showNotification('Game progress has been reset.');
            AudioManager.playWarning();
        }
    },

    // ---- Exit game ----
    exitGame() {
        if (confirm('Are you sure you want to exit CYBERWALL?')) {
            document.body.innerHTML =
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                'height:100vh;color:#00f0ff;font-family:Segoe UI,monospace;background:#0a0a1a;">' +
                '<h1 style="font-size:3rem;text-shadow:0 0 20px rgba(0,240,255,0.5);">CYBERWALL</h1>' +
                '<p style="color:#b066ff;font-size:1.2rem;margin-top:10px;">Thank you for playing!</p>' +
                '<p style="color:#555577;margin-top:20px;">Play Smart. Stay Safe. Protect the Digital World.</p>' +
                '<p style="color:#333355;margin-top:30px;">You can safely close this tab.</p></div>';
        }
    },

    // ---- Update menu buttons (CONTINUE / NEW GAME vs PLAY GAME) ----
    updateMenuButtons() {
        var hasSave = SaveSystem.hasSave();
        var menuButtons = document.querySelector('.menu-buttons');
        
        if (!menuButtons) return;

        // Clear existing buttons
        menuButtons.innerHTML = '';

        if (hasSave) {
            // Show CONTINUE and NEW GAME
            var continueBtn = document.createElement('button');
            continueBtn.className = 'menu-btn';
            continueBtn.textContent = 'CONTINUE';
            continueBtn.onmouseenter = function() { AudioManager.playHover(); };
            continueBtn.onclick = function() { Game.continueGame(); };
            menuButtons.appendChild(continueBtn);

            var newGameBtn = document.createElement('button');
            newGameBtn.className = 'menu-btn';
            newGameBtn.textContent = 'NEW GAME';
            newGameBtn.onmouseenter = function() { AudioManager.playHover(); };
            newGameBtn.onclick = function() { Game.newGame(); };
            menuButtons.appendChild(newGameBtn);
        } else {
            // Show PLAY GAME
            var playBtn = document.createElement('button');
            playBtn.className = 'menu-btn';
            playBtn.textContent = 'PLAY GAME';
            playBtn.onmouseenter = function() { AudioManager.playHover(); };
            playBtn.onclick = function() { Game.startGame(false); };
            menuButtons.appendChild(playBtn);
        }

        // Common buttons (always shown)
        var howtoBtn = document.createElement('button');
        howtoBtn.className = 'menu-btn';
        howtoBtn.textContent = 'HOW TO PLAY';
        howtoBtn.onmouseenter = function() { AudioManager.playHover(); };
        howtoBtn.onclick = function() { Game.showOverlay('howto-overlay'); };
        menuButtons.appendChild(howtoBtn);

        var guideBtn = document.createElement('button');
        guideBtn.className = 'menu-btn';
        guideBtn.textContent = 'CYBER SAFETY GUIDE';
        guideBtn.onmouseenter = function() { AudioManager.playHover(); };
        guideBtn.onclick = function() { Game.showOverlay('guide-overlay'); };
        menuButtons.appendChild(guideBtn);

        var settingsBtn = document.createElement('button');
        settingsBtn.className = 'menu-btn';
        settingsBtn.textContent = 'SETTINGS';
        settingsBtn.onmouseenter = function() { AudioManager.playHover(); };
        settingsBtn.onclick = function() { Game.showOverlay('settings-overlay'); };
        menuButtons.appendChild(settingsBtn);

        var exitBtn = document.createElement('button');
        exitBtn.className = 'menu-btn menu-btn-exit';
        exitBtn.textContent = 'EXIT GAME';
        exitBtn.onmouseenter = function() { AudioManager.playHover(); };
        exitBtn.onclick = function() { Game.exitGame(); };
        menuButtons.appendChild(exitBtn);
    }
};

// ============================================================
// DASHBOARD OBJECT
// Handles tab switching in the CyberWall Security System.
// ============================================================
const Dashboard = {
    switchTab(tab) {
        // Update tab buttons
        document.querySelectorAll('.dash-tab').forEach(function (btn) {
            btn.classList.toggle('active', btn.dataset.tool === tab);
        });
        // Update tool panels
        document.querySelectorAll('.tool-panel').forEach(function (panel) {
            panel.classList.toggle('active', panel.id === 'tool-' + tab);
        });
        AudioManager.playClick();

        // Auto-load matching case files when a mission is accepted
        this.autoLoadCase(tab);
    },

    // Auto-load case files for accepted missions
    autoLoadCase(tab) {
        if (!Game.state || !Game.state.missions) return;

        if (tab === 'email') {
            var m1 = Game.state.missions[1];
            if (m1 && m1.status === 'accepted') {
                var emailInput = document.getElementById('email-input');
                // Auto-load Alex's suspicious bank email if empty or currently school sample
                if (emailInput && (!emailInput.value.trim() || !/sb1/i.test(emailInput.value))) {
                    EmailChecker.loadSample(1);
                }
            }
        } else if (tab === 'password') {
            var m2 = Game.state.missions[2];
            if (m2 && m2.status === 'accepted') {
                var pwdInput = document.getElementById('password-input');
                // Auto-load Sarah's weak demo password
                if (pwdInput && !pwdInput.value) {
                    PasswordChecker.loadSample('password123');
                }
            }
        } else if (tab === 'url') {
            var m3 = Game.state.missions[3];
            if (m3 && m3.status === 'accepted') {
                var urlInput = document.getElementById('url-input');
                // Auto-load David's discount URL if empty or legitimate sample
                if (urlInput && (!urlInput.value.trim() || /amazon\.in/i.test(urlInput.value))) {
                    UrlChecker.loadSample(1);
                }
            }
        } else if (tab === 'identity') {
            if (typeof IdentityChecker !== 'undefined') {
                IdentityChecker.render();
            }
        }
    }
};

// ============================================================
// BOOT SCENE
// Generates all character textures at startup, then shows menu.
// ============================================================
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    create() {
        // Generate character textures (only once)
        if (!Game.texturesGenerated) {
            generatePlayerTextures(this);
            generateNPCTextures(this);
            Game.texturesGenerated = true;
        }

        // Brief delay so the loading screen is visible
        var self = this;
        this.time.delayedCall(300, function () {
            Game.hideOverlay('loading-screen');
            Game.showOverlay('menu-overlay');
            // Update menu buttons based on save file existence
            Game.updateMenuButtons();
        });
        
        // Fallback: if delay fails, use setTimeout
        setTimeout(function() {
            if (!document.getElementById('menu-overlay').classList.contains('active')) {
                Game.hideOverlay('loading-screen');
                Game.showOverlay('menu-overlay');
                Game.updateMenuButtons();
            }
        }, 1000);
    }
}

// ============================================================
// PHASER GAME CONFIGURATION
// ============================================================
var phaserConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1024,
    height: 576,           // 16:9 aspect ratio fits standard laptops
    backgroundColor: '#0a0a1a',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    // Scene order matters: BootScene runs first, then GameScene, InteriorScene
    scene: [BootScene, GameScene, InteriorScene]
};

// Create the Phaser game instance
window.onload = function () {
    // Initialise animated menu skyline
    Game.initMenuSkyline();

    // Safety check: make sure Phaser loaded correctly
    if (typeof Phaser === 'undefined') {
        var ls = document.getElementById('loading-screen');
        if (ls) {
            ls.innerHTML = '<div style="text-align:center;color:#ff4466;">' +
                '<h2 style="font-size:2rem;margin-bottom:10px;">ERROR: Phaser library failed to load</h2>' +
                '<p>Please make sure assets/phaser.min.js exists in the project folder.</p>' +
                '<p>If the file is missing, download it from https://phaser.io</p></div>';
        }
        return;
    }
    Game.phaserGame = new Phaser.Game(phaserConfig);
};
