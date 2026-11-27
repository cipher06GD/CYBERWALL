/* ============================================================
   game.js
   GameScene - the main city environment where the player walks
   around, interacts with NPCs, ambient citizens, and enters buildings.
   Features code-drawn cyberpunk graphics, drones, minimap, and navigation.
   ============================================================ */

// ---- World dimensions ----
const WORLD_W = 2000;
const WORLD_H = 1150;

// ---- Building layout ----
const BUILDINGS = [
    { name: 'CYBER SHOPPING MALL',       x: 80,   y: 80,  w: 360, h: 170, color: 0x1a2a5a, neon: 0x00aaff },
    { name: 'CYBERWALL HEADQUARTERS',     x: 1050, y: 80,  w: 380, h: 200, color: 0x1a1a4a, neon: 0x00f0ff },
    { name: 'CYBER INVESTIGATION OFFICE', x: 1280, y: 340, w: 340, h: 130, color: 0x2a1a3a, neon: 0xb066ff },
    { name: 'FIREWALL CONTROL CENTRE',   x: 550,  y: 760, w: 500, h: 180, color: 0x3a1a1a, neon: 0xff6644 }
];

// ---- Building Doors & Return spots on Main Street ----
const BUILDING_DOORS = [
    { key: 'mall',          name: 'Cyber Shopping Mall',        doorX: 260,  doorY: 250, returnX: 260,  returnY: 285, neon: 0x00aaff },
    { key: 'hq',            name: 'CyberWall Headquarters',      doorX: 1240, doorY: 280, returnX: 1240, returnY: 315, neon: 0x00f0ff },
    { key: 'investigation', name: 'Cyber Investigation Office',  doorX: 1450, doorY: 470, returnX: 1450, returnY: 505, neon: 0xb066ff },
    { key: 'firewall',      name: 'Firewall Control Centre',    doorX: 800,  doorY: 760, returnX: 800,  returnY: 730, neon: 0xff6644 }
];

// ---- Default Player starting position ----
const PLAYER_START = { x: 900, y: 400 };

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init(data) {
        // Check if this is a CONTINUE (Game.state has saved location)
        if (Game.state && Game.state.lastLocation === 'GameScene' && Game.state.lastX && Game.state.lastY) {
            this.startPos = { x: Game.state.lastX, y: Game.state.lastY };
        } else if (data && data.startPos) {
            this.startPos = data.startPos;
        } else {
            this.startPos = PLAYER_START;
        }
    }

    create() {
        // Store reference for global access
        Game.activeScene = this;

        // Camera fade in transition
        this.cameras.main.fadeIn(250, 0, 0, 0);

        // Arrays to track game objects
        this.npcs = [];
        this.ambientCitizens = [];
        this.buildingColliders = [];
        this.currentInteractable = null;
        this.minimapTimer = 0;

        // 1. Background and ground
        this.createBackground();

        // 2. Roads
        this.createRoads();

        // 3. Buildings
        this.createBuildings();

        // 4. Decorations (street lights, trees, particles, drones, billboards)
        this.createDecorations();

        // 5. Interactive building doors
        this.createInteractiveObjects();

        // 6. Mission NPCs
        this.createNPCs();

        // 7. Ambient patrolling citizens
        this.createAmbientCitizens();

        // 8. Player
        this.createPlayer();

        // 9. Collisions
        this.setupCollisions();

        // 10. Camera
        this.setupCamera();

        // 11. Input
        this.setupInput();

        // 12. Objective pointer arrow
        this.createObjectiveArrow();

        // 13. Interactables list
        this.setupInteractables();

        // 14. Unlock first mission if needed
        if (Game.state.missions[1].status === 'locked') {
            Game.state.missions[1].status = 'active';
            SaveSystem.save(Game.state);
        }

        // 15. Show HUD and start music
        Game.showHUD();
        Game.updateHUD();
        Game.paused = false;
        AudioManager.startMusic();

        // 16. Welcome notification
        if (!Game.state.badges || Game.state.badges.length === 0) {
            Game.showNotification('Welcome to Cyber City! Help citizens on Main Street and enter buildings to investigate.');
        }
    }

    // ---- Background ----
    createBackground() {
        // Dark ground
        this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x0a0a1a);

        // Neon grid lines
        var grid = this.add.graphics();
        grid.lineStyle(1, 0x00f0ff, 0.04);
        for (var x = 0; x <= WORLD_W; x += 50) {
            grid.lineBetween(x, 0, x, WORLD_H);
        }
        for (var y = 0; y <= WORLD_H; y += 50) {
            grid.lineBetween(0, y, WORLD_W, y);
        }
        grid.setDepth(0);
    }

    // ---- Roads ----
    createRoads() {
        var roadColor = 0x12122a;
        var lineColor = 0x444466;

        // Main horizontal road
        this.add.rectangle(WORLD_W / 2, 390, WORLD_W, 60, roadColor).setDepth(0);
        // Main vertical road
        this.add.rectangle(760, WORLD_H / 2, 60, WORLD_H, roadColor).setDepth(0);

        // Secondary roads
        this.add.rectangle(470, 560, 400, 40, roadColor).setDepth(0);   // Left road to Alex
        this.add.rectangle(1300, 560, 400, 40, roadColor).setDepth(0);  // Right road to Sarah
        this.add.rectangle(800, 700, 200, 40, roadColor).setDepth(0);   // Road to Firewall CC

        // Road markings (dashed lines)
        var marks = this.add.graphics();
        marks.lineStyle(2, lineColor, 0.6);

        // Horizontal road dashed line
        for (var mx = 0; mx < WORLD_W; mx += 40) {
            marks.lineBetween(mx, 390, mx + 20, 390);
        }
        // Vertical road dashed line
        for (var my = 0; my < WORLD_H; my += 40) {
            marks.lineBetween(760, my, 760, my + 20);
        }
        marks.setDepth(1);

        // Area labels on the ground
        this.add.text(400, 580, 'MAIN STREET', {
            fontFamily: 'Consolas, monospace',
            fontSize: '14px',
            color: '#334466',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1).setRotation(-0.02);

        this.add.text(1200, 580, 'CYBER PROMENADE', {
            fontFamily: 'Consolas, monospace',
            fontSize: '14px',
            color: '#334466',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(1);
    }

    // ---- Buildings ----
    createBuildings() {
        var self = this;
        BUILDINGS.forEach(function (b) {
            self.drawBuilding(b);

            // Static collision body so player can't walk through walls
            var collider = self.add.rectangle(b.x + b.w / 2, b.y + b.h / 2, b.w, b.h);
            collider.setVisible(false);
            self.physics.add.existing(collider, true);
            self.buildingColliders.push(collider);
        });
    }

    // Draw single building with detailed architecture, signs, glowing windows
    drawBuilding(b) {
        var g = this.add.graphics();
        g.setDepth(2);

        // Drop Shadow
        g.fillStyle(0x000000, 0.45);
        g.fillRect(b.x + 8, b.y + 8, b.w, b.h);

        // Main facade
        g.fillStyle(b.color, 0.96);
        g.fillRect(b.x, b.y, b.w, b.h);

        // Neon outline
        g.lineStyle(4, b.neon, 0.2);
        g.strokeRect(b.x - 2, b.y - 2, b.w + 4, b.h + 4);
        g.lineStyle(2, b.neon, 0.85);
        g.strokeRect(b.x, b.y, b.w, b.h);

        // Roof cornice accent bar
        g.fillStyle(b.neon, 0.4);
        g.fillRect(b.x, b.y, b.w, 8);

        // Rooftop antenna with red hazard beacon
        var antX = b.x + 30;
        var antY = b.y - 25;
        g.lineStyle(2, 0x556677, 1);
        g.lineBetween(antX, b.y, antX, antY);
        var beacon = this.add.circle(antX, antY, 3, 0xff3344, 0.9).setDepth(4);
        this.tweens.add({
            targets: beacon,
            alpha: { from: 1, to: 0.2 },
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Architectural Windows with illuminated panes
        var winW = 14;
        var winH = 16;
        var gapX = 8;
        var gapY = 10;
        var startY = b.y + 20;
        var startX = b.x + 14;
        var usableW = b.w - 28;
        var usableH = b.h - 35;

        for (var row = 0; row < Math.floor(usableH / (winH + gapY)); row++) {
            for (var col = 0; col < Math.floor(usableW / (winW + gapX)); col++) {
                var wx = startX + col * (winW + gapX);
                var wy = startY + row * (winH + gapY);

                var seed = (row * 7 + col * 13 + b.x) % 10;
                if (seed > 3) {
                    g.fillStyle(b.neon, 0.38);
                    g.fillRect(wx, wy, winW, winH);
                    g.fillStyle(b.neon, 0.7);
                    g.fillRect(wx, wy, winW, 2);
                } else {
                    g.fillStyle(0x000000, 0.5);
                    g.fillRect(wx, wy, winW, winH);
                }
                g.lineStyle(1, b.neon, 0.25);
                g.strokeRect(wx, wy, winW, winH);
            }
        }

        // Entrance portal doorway
        var doorW = 44;
        var doorH = 32;
        g.fillStyle(0x000000, 0.85);
        g.fillRect(b.x + b.w / 2 - doorW / 2, b.y + b.h - doorH, doorW, doorH);
        g.lineStyle(2, b.neon, 0.8);
        g.strokeRect(b.x + b.w / 2 - doorW / 2, b.y + b.h - doorH, doorW, doorH);

        // Building Neon Header Sign
        this.add.text(b.x + b.w / 2, b.y - 18, b.name, {
            fontFamily: 'Consolas, monospace',
            fontSize: '13px',
            color: '#' + b.neon.toString(16).padStart(6, '0'),
            stroke: '#000000',
            strokeThickness: 4,
            fontStyle: 'bold',
            padding: { x: 8, y: 3 }
        }).setOrigin(0.5).setDepth(3);
    }

    // ---- Decorations ----
    createDecorations() {
        var self = this;

        // Street lights at key intersections
        var lightPositions = [
            { x: 760, y: 390 }, { x: 470, y: 390 }, { x: 1300, y: 390 },
            { x: 760, y: 560 }, { x: 760, y: 700 }, { x: 760, y: 860 }
        ];
        lightPositions.forEach(function (p) {
            self.add.rectangle(p.x, p.y, 4, 20, 0x333344).setDepth(1);
            var glow = self.add.circle(p.x, p.y - 5, 6, 0x00f0ff, 0.8).setDepth(2);
            self.add.circle(p.x, p.y - 5, 12, 0x00f0ff, 0.15).setDepth(1);
            self.tweens.add({
                targets: glow,
                alpha: { from: 0.8, to: 0.4 },
                duration: 2000,
                yoyo: true,
                repeat: -1
            });
        });

        // Park benches along sidewalks
        var benchPositions = [
            { x: 530, y: 430 }, { x: 670, y: 430 }, { x: 1210, y: 430 }, { x: 1370, y: 430 }
        ];
        benchPositions.forEach(function (bp) {
            var bg = self.add.graphics().setDepth(2);
            bg.fillStyle(0x5c4033, 1);
            bg.fillRect(bp.x - 14, bp.y - 6, 28, 4);
            bg.fillRect(bp.x - 14, bp.y - 1, 28, 6);
            bg.fillStyle(0x1a2233, 1);
            bg.fillRect(bp.x - 12, bp.y + 5, 3, 5);
            bg.fillRect(bp.x + 9, bp.y + 5, 3, 5);
        });

        // Neon cyber billboards with educational safety tips
        var billboards = [
            { x: 380, y: 330, text: 'REPORT CYBER FRAUD \u2022 CALL 1930', neon: 0x00f0ff },
            { x: 920, y: 330, text: 'NEVER SHARE OTPS OR PASSWORDS', neon: 0xffaa00 },
            { x: 1480, y: 330, text: 'CYBERCRIME.GOV.IN \u2022 STAY SAFE', neon: 0x44ff88 }
        ];
        billboards.forEach(function (bb) {
            var bbg = self.add.graphics().setDepth(2);
            bbg.fillStyle(0x0c1022, 0.95);
            bbg.fillRect(bb.x - 100, bb.y - 12, 200, 24);
            bbg.lineStyle(2, bb.neon, 0.8);
            bbg.strokeRect(bb.x - 100, bb.y - 12, 200, 24);
            self.add.text(bb.x, bb.y, bb.text, {
                fontFamily: 'Consolas, monospace',
                fontSize: '8px',
                color: '#' + bb.neon.toString(16).padStart(6, '0'),
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(3);
        });

        // Autonomous Cyber Drones gliding along the road
        for (var d = 0; d < 2; d++) {
            var dx = d === 0 ? 300 : 1300;
            var dy = d === 0 ? 360 : 420;
            var drone = this.add.container(dx, dy).setDepth(8);
            var dg = this.add.graphics();
            dg.fillStyle(0x111c38, 1);
            dg.fillCircle(0, 0, 7);
            dg.lineStyle(1, 0x00f0ff, 0.9);
            dg.strokeCircle(0, 0, 7);
            dg.fillStyle(0x00f0ff, 0.9);
            dg.fillRect(-10, -2, 4, 4);
            dg.fillRect(6, -2, 4, 4);
            drone.add(dg);

            var destX = d === 0 ? 1700 : 200;
            this.tweens.add({
                targets: drone,
                x: destX,
                duration: Phaser.Math.Between(14000, 18000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            this.tweens.add({
                targets: drone,
                y: dy + 8,
                duration: 1200,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // Trees in open parks
        var treePositions = [
            { x: 600, y: 550 }, { x: 650, y: 580 }, { x: 550, y: 530 },
            { x: 1700, y: 600 }, { x: 1750, y: 630 },
            { x: 200, y: 700 }, { x: 250, y: 750 },
            { x: 1500, y: 200 }, { x: 1550, y: 230 }
        ];
        treePositions.forEach(function (p) {
            self.add.rectangle(p.x, p.y + 8, 6, 10, 0x4a3a2a).setDepth(1);
            self.add.circle(p.x, p.y, 12, 0x1a4a1a, 0.8).setDepth(2);
            self.add.circle(p.x - 4, p.y - 2, 8, 0x2a5a2a, 0.6).setDepth(2);
        });

        // Floating neon particles
        for (var i = 0; i < 25; i++) {
            var px = Phaser.Math.Between(0, WORLD_W);
            var py = Phaser.Math.Between(0, WORLD_H);
            var particle = this.add.circle(px, py, Phaser.Math.Between(1, 2),
                Math.random() > 0.5 ? 0x00f0ff : 0xb066ff, 0.4).setDepth(1);

            this.tweens.add({
                targets: particle,
                y: py - 120,
                alpha: 0,
                duration: Phaser.Math.Between(4000, 10000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 6000),
                onRepeat: function () {
                    particle.x = Phaser.Math.Between(0, WORLD_W);
                    particle.y = Phaser.Math.Between(0, WORLD_H);
                    particle.alpha = 0.4;
                }
            });
        }
    }

    // ---- Interactive Building Doors on Main Street ----
    createInteractiveObjects() {
        var self = this;
        BUILDING_DOORS.forEach(function (door) {
            // Glowing entrance mat on ground
            var g = self.add.graphics().setDepth(2);
            g.fillStyle(door.neon, 0.25);
            g.fillRect(door.doorX - 22, door.doorY - 5, 44, 20);
            g.lineStyle(2, door.neon, 0.85);
            g.strokeRect(door.doorX - 22, door.doorY - 5, 44, 20);

            // Door icon and prompt
            self.add.text(door.doorX, door.doorY - 26, '\u{1F6AA}', { fontSize: '15px' }).setOrigin(0.5).setDepth(4);
            self.add.text(door.doorX, door.doorY + 22, 'ENTER [E]', {
                fontFamily: 'Consolas, monospace',
                fontSize: '9px',
                color: '#' + door.neon.toString(16).padStart(6, '0'),
                fontStyle: 'bold',
                stroke: '#000',
                strokeThickness: 3
            }).setOrigin(0.5).setDepth(4);

            // Pulsing door beacon
            var beacon = self.add.circle(door.doorX, door.doorY + 5, 6, door.neon, 0.4).setDepth(2);
            self.tweens.add({
                targets: beacon,
                scale: { from: 1, to: 1.6 },
                alpha: { from: 0.4, to: 0.1 },
                duration: 1500,
                yoyo: true,
                repeat: -1
            });
        });
    }

    // ---- Mission NPCs ----
    createNPCs() {
        var self = this;
        NPC_DATA.forEach(function (data) {
            var npc = new NPC(self, data);
            self.npcs.push(npc);
        });
    }

    // ---- Ambient Patrolling Citizens ----
    createAmbientCitizens() {
        var self = this;
        if (typeof AMBIENT_CITIZENS !== 'undefined') {
            AMBIENT_CITIZENS.forEach(function (data) {
                var amb = new AmbientNPC(self, data);
                self.ambientCitizens.push(amb);
            });
        }
    }

    // ---- Player ----
    createPlayer() {
        var sx = this.startPos ? this.startPos.x : PLAYER_START.x;
        var sy = this.startPos ? this.startPos.y : PLAYER_START.y;
        this.player = new Player(this, sx, sy);
    }

    // ---- Collisions ----
    setupCollisions() {
        var self = this;
        this.buildingColliders.forEach(function (c) {
            self.physics.add.collider(self.player, c);
        });
        this.npcs.forEach(function (npc) {
            self.physics.add.collider(self.player, npc);
        });
        this.ambientCitizens.forEach(function (amb) {
            self.physics.add.collider(self.player, amb);
        });
    }

    // ---- Camera ----
    setupCamera() {
        this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
        this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
        this.cameras.main.setZoom(1);
    }

    // ---- Objective Direction Arrow ----
    createObjectiveArrow() {
        this.objectiveArrow = this.add.container(0, 0).setDepth(9);
        var ag = this.add.graphics();
        ag.fillStyle(0xffd700, 0.95);
        ag.beginPath();
        ag.moveTo(12, 0);
        ag.lineTo(-6, -7);
        ag.lineTo(-2, 0);
        ag.lineTo(-6, 7);
        ag.closePath();
        ag.fill();
        ag.lineStyle(1, 0xffffff, 0.85);
        ag.stroke();
        this.objectiveArrow.add(ag);
        this.objectiveArrow.setVisible(false);
    }

    // Update arrow direction to point at active objective target
    updateObjectiveArrow() {
        if (!this.objectiveArrow || !this.player) return;
        var target = this.getObjectiveTarget();
        if (!target) {
            this.objectiveArrow.setVisible(false);
            return;
        }

        var dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, target.x, target.y);
        if (dist < 85) {
            this.objectiveArrow.setVisible(false);
            return;
        }

        this.objectiveArrow.setVisible(true);
        var angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
        this.objectiveArrow.setPosition(
            this.player.x + Math.cos(angle) * 38,
            this.player.y + Math.sin(angle) * 38
        );
        this.objectiveArrow.setRotation(angle);
    }

    // Get current objective coordinates in the world
    getObjectiveTarget() {
        if (!Game.state) return null;
        var activeId = Missions.getActiveMission(Game.state);
        if (!activeId) return null;
        var mission = Game.state.missions[activeId];
        var status = mission ? mission.status : 'locked';

        if (activeId === 1) {
            if (status === 'active' || status === 'tool_completed') return { x: 450, y: 500 };
            if (status === 'accepted') return { x: 1240, y: 280 }; // CyberWall HQ door
        } else if (activeId === 2) {
            if (status === 'active' || status === 'tool_completed') return { x: 1450, y: 500 };
            if (status === 'accepted') return { x: 1240, y: 280 };
        } else if (activeId === 3) {
            if (status === 'active' || status === 'tool_completed') return { x: 300, y: 250 };
            if (status === 'accepted') return { x: 1240, y: 280 };
        } else if (activeId === 4) {
            if (status === 'active' || status === 'tool_completed') return { x: 1100, y: 300 };
            if (status === 'accepted') return { x: 800, y: 760 }; // Firewall CC door
        } else if (activeId === 5) {
            if (status === 'active' || status === 'tool_completed') return { x: 680, y: 480 };
            if (status === 'accepted') return { x: 1240, y: 280 };
        } else if (activeId === 6) {
            // Operation Zero: point to Firewall Control Centre door
            if (status === 'active' || status === 'accepted') return { x: 800, y: 760 };
        }
        return null;
    }

    // ---- Input ----
    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.interactKey = this.input.keyboard.addKey('E');
        this.pauseKey = this.input.keyboard.addKey('ESC');

        // CRITICAL: Assign input references to player so they can move!
        if (this.player) {
            this.player.cursors = this.cursors;
            this.player.wasd = this.wasd;
            this.player.interactKey = this.interactKey;
            this.player.pauseKey = this.pauseKey;
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

    // ---- Setup Interactables ----
    setupInteractables() {
        var self = this;
        this.interactables = [];

        // Mission NPCs
        this.npcs.forEach(function (npc) {
            self.interactables.push({ type: 'npc', npc: npc, range: 70 });
        });

        // Building Doors
        BUILDING_DOORS.forEach(function (door) {
            self.interactables.push({
                type: 'door',
                door: door,
                x: door.doorX,
                y: door.doorY,
                range: 75,
                prompt: 'Enter ' + door.name + ' [E]'
            });
        });

        // Ambient citizens
        this.ambientCitizens.forEach(function (amb) {
            self.interactables.push({
                type: 'ambient_npc',
                npc: amb,
                range: 65,
                prompt: 'Talk to ' + amb.npcData.name + ' [E]',
                tip: amb.npcData.tip
            });
        });
    }

    // ---- Update loop ----
    update() {
        if (Game.paused) return;

        // Player movement
        this.player.update();

        // NPC idle bobbing
        this.npcs.forEach(function (npc) { npc.update(); });

        // Ambient citizen patrol
        this.ambientCitizens.forEach(function (amb) { amb.update(); });

        // Check nearby interactables
        this.checkInteractions();

        // Update direction arrow
        this.updateObjectiveArrow();

        // Update minimap in HUD at throttled interval
        this.minimapTimer++;
        if (this.minimapTimer >= 6) {
            this.minimapTimer = 0;
            Game.updateMinimap(this.player.x, this.player.y, this.getObjectiveTarget());
        }

        // E key: interact
        if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
            this.doInteraction();
        }
    }

    // ---- Check nearest interactable ----
    checkInteractions() {
        var nearest = null;
        var nearestDist = Infinity;

        this.interactables.forEach(function (item) {
            var ix, iy;
            if (item.type === 'npc' || item.type === 'ambient_npc') {
                ix = item.npc.x;
                iy = item.npc.y;
            } else {
                ix = item.x;
                iy = item.y;
            }
            var dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, ix, iy);
            if (dist < item.range && dist < nearestDist) {
                nearest = item;
                nearestDist = dist;
            }
        }, this);

        // Hide NPC indicators
        this.npcs.forEach(function (npc) { npc.showIndicator(false); });

        if (nearest) {
            this.currentInteractable = nearest;
            var promptText = '';
            if (nearest.type === 'npc') {
                promptText = 'Talk to ' + nearest.npc.npcData.name;
                nearest.npc.showIndicator(true);
            } else if (nearest.type === 'door') {
                promptText = 'Enter ' + nearest.door.name;
            } else if (nearest.type === 'ambient_npc') {
                promptText = 'Talk to ' + nearest.npc.npcData.name;
            }
            document.getElementById('interact-text').textContent = promptText;
            document.getElementById('interact-prompt').classList.remove('hidden');
        } else {
            this.currentInteractable = null;
            document.getElementById('interact-prompt').classList.add('hidden');
        }
    }

    // ---- Perform interaction ----
    doInteraction() {
        if (!this.currentInteractable) return;
        var item = this.currentInteractable;

        this.player.triggerInteract();
        AudioManager.playInteract();

        if (item.type === 'npc') {
            this.interactWithNPC(item.npc);
        } else if (item.type === 'door') {
            this.enterBuilding(item.door);
        } else if (item.type === 'ambient_npc') {
            Game.showNotification(item.tip);
        }
    }

    // ---- Enter Building Interior ----
    enterBuilding(door) {
        var self = this;
        document.getElementById('interact-prompt').classList.add('hidden');
        this.cameras.main.fade(250, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', function () {
            self.scene.stop('GameScene');
            self.scene.start('InteriorScene', {
                buildingKey: door.key,
                returnPos: { x: door.returnX, y: door.returnY }
            });
        });
    }

    // ---- Interact with NPC ----
    interactWithNPC(npc) {
        var data = npc.npcData;
        var result = Missions.handleNPCInteraction(data, Game.state);
        Dialogue.start(data, result.lines, result.onComplete, result.showAccept, result.onAccept);
    }
}
