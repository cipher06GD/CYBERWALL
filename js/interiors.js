/* ============================================================
   interiors.js
   InteriorScene: Manages building interiors for CYBERWALL.
   - CyberWall HQ (contains the security laptop)
   - Cyber Shopping Mall (shop NPC with shopping scam mission/tips)
   - Cyber Investigation Office (interactive case board)
   - Firewall Control Centre (contains the firewall terminal)
   ============================================================ */

const INTERIOR_W = 1024;
const INTERIOR_H = 576;

class InteriorScene extends Phaser.Scene {
    constructor() {
        super({ key: 'InteriorScene' });
    }

    init(data) {
        this.buildingKey = (data && data.buildingKey) || 'hq';
        this.returnPos = (data && data.returnPos) || { x: 1200, y: 320 };
        this.interactables = [];
        this.currentInteractable = null;
        
        // Check if this is a CONTINUE to an interior
        if (Game.state && Game.state.lastLocation === 'InteriorScene') {
            // Player was inside when they saved - keep them on the street instead
            // (safer than trying to restore exact interior state)
            // This is handled in main.js startGame - it will start GameScene
        }
    }

    create() {
        Game.activeScene = this;

        // Fade in from black
        this.cameras.main.fadeIn(250, 0, 0, 0);

        // 1. Build room architecture based on building key
        this.createRoom();

        // 2. Add player near exit door facing up
        this.createPlayer();

        // 3. Add room-specific objects and NPCs
        this.setupRoomContent();

        // 4. Setup exit door
        this.setupExitDoor();

        // 5. Input setup
        this.setupInput();

        // Update HUD
        Game.showHUD();
        Game.updateHUD();
    }

    // ---- Draw room floor, walls, and lighting ----
    createRoom() {
        var g = this.add.graphics();
        var floorColor, wallColor, neonColor, roomTitle;

        if (this.buildingKey === 'hq') {
            floorColor = 0x0e1328;
            wallColor = 0x141b38;
            neonColor = 0x00f0ff;
            roomTitle = 'CYBERWALL HEADQUARTERS - OPERATIONS ROOM';
        } else if (this.buildingKey === 'mall') {
            floorColor = 0x181028;
            wallColor = 0x24163c;
            neonColor = 0x00aaff;
            roomTitle = 'CYBER SHOPPING MALL - TECH STORE';
        } else if (this.buildingKey === 'investigation') {
            floorColor = 0x160f24;
            wallColor = 0x221334;
            neonColor = 0xb066ff;
            roomTitle = 'CYBER INVESTIGATION OFFICE - FORENSICS LAB';
        } else {
            // Firewall Control Centre
            floorColor = 0x1c0f0f;
            wallColor = 0x2c1414;
            neonColor = 0xff6644;
            roomTitle = 'FIREWALL CONTROL CENTRE - NETWORK MAINFRAME';
        }

        // Room bounds (walls)
        this.physics.world.setBounds(60, 80, INTERIOR_W - 120, INTERIOR_H - 140);
        this.cameras.main.setBounds(0, 0, INTERIOR_W, INTERIOR_H);

        // Background / floor
        g.fillStyle(0x060610, 1);
        g.fillRect(0, 0, INTERIOR_W, INTERIOR_H);

        g.fillStyle(floorColor, 1);
        g.fillRect(60, 80, INTERIOR_W - 120, INTERIOR_H - 140);

        // Grid floor lines
        g.lineStyle(1, neonColor, 0.08);
        for (var x = 60; x <= INTERIOR_W - 60; x += 40) {
            g.lineBetween(x, 80, x, INTERIOR_H - 60);
        }
        for (var y = 80; y <= INTERIOR_H - 60; y += 40) {
            g.lineBetween(60, y, INTERIOR_W - 60, y);
        }

        // Walls (north, west, east borders)
        g.fillStyle(wallColor, 1);
        g.fillRect(50, 40, INTERIOR_W - 100, 45); // North wall
        g.fillRect(40, 40, 20, INTERIOR_H - 80);  // West wall
        g.fillRect(INTERIOR_W - 60, 40, 20, INTERIOR_H - 80); // East wall

        // Neon trim
        g.lineStyle(3, neonColor, 0.8);
        g.strokeRect(60, 80, INTERIOR_W - 120, INTERIOR_H - 140);

        // Room Title Banner on top wall
        this.add.text(INTERIOR_W / 2, 60, roomTitle, {
            fontFamily: 'Consolas, monospace',
            fontSize: '14px',
            color: '#' + neonColor.toString(16).padStart(6, '0'),
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2);
    }

    // ---- Create Player in room ----
    createPlayer() {
        this.player = new Player(this, INTERIOR_W / 2, INTERIOR_H - 110);
        this.player.facing = 'up';
        this.player.play('player_idle_up');
        this.player.setCollideWorldBounds(true);
    }

    // ---- Setup room specific content ----
    setupRoomContent() {
        var self = this;

        if (this.buildingKey === 'hq') {
            // CyberWall HQ: Central Security Laptop Desk
            var lx = INTERIOR_W / 2;
            var ly = 240;

            // Desk
            var g = this.add.graphics().setDepth(2);
            g.fillStyle(0x111c38, 1);
            g.fillRect(lx - 60, ly - 20, 120, 40);
            g.lineStyle(2, 0x00f0ff, 0.7);
            g.strokeRect(lx - 60, ly - 20, 120, 40);

            // Laptop base and screen
            g.fillStyle(0x222a4a, 1);
            g.fillRect(lx - 20, ly - 10, 40, 12);
            g.fillStyle(0x001020, 1);
            g.fillRect(lx - 18, ly - 26, 36, 16);
            g.lineStyle(1, 0x00f0ff, 0.8);
            g.strokeRect(lx - 18, ly - 26, 36, 16);

            // Laptop glowing screen lines
            g.fillStyle(0x00f0ff, 0.6);
            g.fillRect(lx - 14, ly - 22, 28, 2);
            g.fillRect(lx - 14, ly - 18, 20, 2);
            g.fillRect(lx - 14, ly - 14, 24, 2);

            this.add.text(lx, ly - 42, '\u{1F4BB}', { fontSize: '18px' }).setOrigin(0.5).setDepth(4);
            this.add.text(lx, ly + 32, 'CYBERWALL SECURITY SYSTEM', {
                fontFamily: 'Consolas, monospace',
                fontSize: '11px',
                color: '#00f0ff',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(4);

            // Interactable
            this.interactables.push({
                type: 'laptop',
                x: lx,
                y: ly + 15,
                range: 75,
                prompt: 'Use CyberWall Security System'
            });

        } else if (this.buildingKey === 'mall') {
            // Mall Tech Shop: Shelves, display, Mall Vendor NPC
            var g2 = this.add.graphics().setDepth(2);
            // Shop counter
            g2.fillStyle(0x2a1a44, 1);
            g2.fillRect(INTERIOR_W / 2 - 80, 210, 160, 35);
            g2.lineStyle(2, 0x00aaff, 0.7);
            g2.strokeRect(INTERIOR_W / 2 - 80, 210, 160, 35);

            // Display signs
            this.add.text(INTERIOR_W / 2, 175, 'OFFICIAL ELECTRONICS RETAILER', {
                fontFamily: 'Consolas, monospace',
                fontSize: '11px',
                color: '#00aaff',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(3);

            // Shop NPC: Vikram
            var shopNPC = this.add.sprite(INTERIOR_W / 2, 185, 'david_down_0').setDepth(3);
            this.add.text(INTERIOR_W / 2, 145, 'Vikram - Mall Retailer', {
                fontFamily: 'Segoe UI, monospace',
                fontSize: '12px',
                color: '#00f0ff',
                stroke: '#000',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(4);

            this.interactables.push({
                type: 'shop_npc',
                x: INTERIOR_W / 2,
                y: 245,
                range: 80,
                prompt: 'Talk to Vikram (Store Manager)',
                action: function () {
                    Dialogue.start(
                        { name: 'Vikram', title: 'Store Manager', icon: '\u{1F6CD}' },
                        [
                            "Welcome to Cyber City Electronics, Officer! We sell verified, genuine tech.",
                            "Recently, scammers have been copying our store brand and creating lookalike URLs like 'amaz0n-mega-sale-deals.net'.",
                            "They promise Rs. 999 smartphones, take victims' money via UPI or card, and deliver nothing!",
                            "Always check the domain name, avoid unbelievable deals, and only pay through secured official payment gateways."
                        ],
                        null,
                        false
                    );
                }
            });

        } else if (this.buildingKey === 'investigation') {
            // Cyber Investigation Office: Interactive Case Board on wall
            var cbX = INTERIOR_W / 2;
            var cbY = 170;

            var g3 = this.add.graphics().setDepth(2);
            // Board frame
            g3.fillStyle(0x1a122e, 1);
            g3.fillRect(cbX - 180, cbY - 60, 360, 120);
            g3.lineStyle(3, 0xb066ff, 0.8);
            g3.strokeRect(cbX - 180, cbY - 60, 360, 120);

            // Pinned case files graphics
            g3.fillStyle(0x2a1a44, 0.8);
            g3.fillRect(cbX - 160, cbY - 45, 60, 40);
            g3.fillRect(cbX - 80, cbY - 45, 60, 40);
            g3.fillRect(cbX, cbY - 45, 60, 40);
            g3.fillRect(cbX + 80, cbY - 45, 60, 40);

            this.add.text(cbX, cbY - 45, '\u{1F4CB}', { fontSize: '24px' }).setOrigin(0.5).setDepth(3);
            this.add.text(cbX, cbY + 15, 'ACTIVE CYBER CRIME INVESTIGATION BOARD', {
                fontFamily: 'Consolas, monospace',
                fontSize: '11px',
                color: '#b066ff',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(3);

            this.interactables.push({
                type: 'caseboard',
                x: cbX,
                y: cbY + 40,
                range: 90,
                prompt: 'Inspect Case Board [E]',
                action: function () {
                    Game.showOverlay('caseboard-overlay');
                }
            });

        } else if (this.buildingKey === 'firewall') {
            // Firewall Control Centre: Terminal and Mainframe
            var fwX = INTERIOR_W / 2;
            var fwY = 230;

            var g4 = this.add.graphics().setDepth(2);
            // Mainframe rack
            g4.fillStyle(0x220e0e, 1);
            g4.fillRect(fwX - 70, fwY - 40, 140, 70);
            g4.lineStyle(2, 0xff6644, 0.8);
            g4.strokeRect(fwX - 70, fwY - 40, 140, 70);

            // Server blinking rows
            for (var r = 0; r < 4; r++) {
                g4.fillStyle(0x100505, 1);
                g4.fillRect(fwX - 60, fwY - 35 + r * 15, 120, 10);
                for (var c = 0; c < 6; c++) {
                    g4.fillStyle(c % 2 === 0 ? 0xff4444 : 0x44ff88, 0.8);
                    g4.fillRect(fwX - 50 + c * 18, fwY - 32 + r * 15, 6, 4);
                }
            }

            this.add.text(fwX, fwY - 55, '\u{1F501}', { fontSize: '22px' }).setOrigin(0.5).setDepth(4);
            this.add.text(fwX, fwY + 45, 'FIREWALL DEFENCE CONSOLE', {
                fontFamily: 'Consolas, monospace',
                fontSize: '11px',
                color: '#ff6644',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(4);

            this.interactables.push({
                type: 'firewall',
                x: fwX,
                y: fwY + 30,
                range: 80,
                prompt: 'Use Firewall Terminal'
            });

            // ---- node-7 Server (OPERATION ZERO finale, left side of room) ----
            var n7X = 180;
            var n7Y = 230;
            var g5 = this.add.graphics().setDepth(2);

            // Old server rack (dark, dusty)
            g5.fillStyle(0x1a0808, 1);
            g5.fillRect(n7X - 45, n7Y - 35, 90, 70);
            g5.lineStyle(2, 0x660022, 0.5);
            g5.strokeRect(n7X - 45, n7Y - 35, 90, 70);

            // Faded server rows
            for (var r2 = 0; r2 < 3; r2++) {
                g5.fillStyle(0x0a0202, 1);
                g5.fillRect(n7X - 35, n7Y - 28 + r2 * 20, 70, 12);
            }

            // Blinking red warning light (only visible when mission 6 is unlocked)
            var m6Status = Game.state && Game.state.missions && Game.state.missions[6] ? Game.state.missions[6].status : 'locked';
            if (m6Status !== 'locked') {
                g5.fillStyle(0xff0044, 0.9);
                g5.fillRect(n7X - 38, n7Y - 32, 6, 4);
            }

            this.add.text(n7X, n7Y - 52, '\u{1F50D}', { fontSize: '20px' }).setOrigin(0.5).setDepth(4);
            this.add.text(n7X, n7Y + 45, 'node-7 SERVER', {
                fontFamily: 'Consolas, monospace',
                fontSize: '10px',
                color: m6Status !== 'locked' ? '#ff4466' : '#664444',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(4);

            this.interactables.push({
                type: 'node7',
                x: n7X,
                y: n7Y + 25,
                range: 80,
                prompt: 'Examine node-7 Server'
            });
        }
    }

    // ---- Setup Exit Door ----
    setupExitDoor() {
        var exitX = INTERIOR_W / 2;
        var exitY = INTERIOR_H - 70;

        // Draw exit door frame and glowing mat
        var g = this.add.graphics().setDepth(1);
        g.fillStyle(0x00f0ff, 0.2);
        g.fillRect(exitX - 35, exitY - 5, 70, 20);
        g.lineStyle(2, 0x00f0ff, 0.8);
        g.strokeRect(exitX - 35, exitY - 5, 70, 20);

        this.add.text(exitX, exitY + 5, 'EXIT TO MAIN STREET', {
            fontFamily: 'Consolas, monospace',
            fontSize: '9px',
            color: '#00f0ff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2);

        this.interactables.push({
            type: 'exit',
            x: exitX,
            y: exitY,
            range: 65,
            prompt: 'Exit to Main Street'
        });
    }

    // ---- Setup keyboard inputs ----
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.interactKey = this.input.keyboard.addKey('E');

        // CRITICAL: Assign input references to player so they can move!
        if (this.player) {
            this.player.cursors = this.cursors;
            this.player.wasd = this.wasd;
            this.player.interactKey = this.interactKey;
        }

        // ESC handler
        this.input.keyboard.on('keydown-ESC', function () {
            if (Game.paused) {
                if (document.getElementById('caseboard-overlay') && document.getElementById('caseboard-overlay').classList.contains('active')) {
                    Game.hideOverlay('caseboard-overlay');
                } else if (document.getElementById('dashboard-overlay').classList.contains('active')) {
                    Game.closeDashboard();
                } else if (document.getElementById('dialogue-overlay').classList.contains('active')) {
                    Dialogue.close();
                } else if (document.getElementById('pause-overlay').classList.contains('active')) {
                    Game.resumeGame();
                }
            } else {
                Game.togglePause();
            }
        });
    }

    // ---- Update loop ----
    update() {
        if (Game.paused) return;

        this.player.update();
        this.checkInteractions();

        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.doInteraction();
        }
    }

    // ---- Check nearest interactable ----
    checkInteractions() {
        var nearest = null;
        var nearestDist = Infinity;

        this.interactables.forEach(function (item) {
            var dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, item.x, item.y);
            if (dist < item.range && dist < nearestDist) {
                nearest = item;
                nearestDist = dist;
            }
        }, this);

        if (nearest) {
            this.currentInteractable = nearest;
            document.getElementById('interact-text').textContent = nearest.prompt;
            document.getElementById('interact-prompt').classList.remove('hidden');
        } else {
            this.currentInteractable = null;
            document.getElementById('interact-prompt').classList.add('hidden');
        }
    }

    // ---- Execute interaction ----
    doInteraction() {
        if (!this.currentInteractable) return;
        var item = this.currentInteractable;

        this.player.triggerInteract();
        AudioManager.playInteract();

        if (item.type === 'exit') {
            this.exitToMainStreet();
        } else if (item.type === 'laptop') {
            Game.showDashboard('email');
        } else if (item.type === 'firewall') {
            Game.showDashboard('firewall');
        } else if (item.type === 'node7') {
            // OPERATION ZERO: node-7 server terminal
            OperationZero.interact(Game.state);
        } else if (typeof item.action === 'function') {
            item.action();
        }
    }

    // ---- Fade out and return to Main Street ----
    exitToMainStreet() {
        var self = this;
        document.getElementById('interact-prompt').classList.add('hidden');
        this.cameras.main.fade(250, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', function () {
            self.scene.stop('InteriorScene');
            self.scene.start('GameScene', { startPos: self.returnPos });
        });
    }
}
