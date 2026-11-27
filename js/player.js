/* ============================================================
   player.js
   Player class and texture generation for the main character.
   All character sprites are drawn on a canvas at runtime so we
   don't need external image files.
   ============================================================ */

// ---- Generate all player textures and animations ----
// Called once during BootScene.
function generatePlayerTextures(scene) {
    // Cyber officer color scheme: dark blue uniform with cyan accents
    const colors = {
        skin:  '#d8a878',
        hair:  '#2a1a4a',
        shirt: '#1a3a7a',
        shirtAccent: '#00f0ff',
        pants: '#0a0a2a',
        shoes: '#00a0c0'
    };
    generateCharacterSheet(scene, 'player', colors);
    createCharacterAnimations(scene, 'player');
}

// ---- Generate a complete character spritesheet ----
// Creates 4 frames per direction (down, up, left, right) = 16 textures.
// Each frame is 32 x 48 pixels.
function generateCharacterSheet(scene, prefix, colors) {
    const dirs = ['down', 'up', 'left', 'right'];
    for (var d = 0; d < 4; d++) {
        for (var f = 0; f < 4; f++) {
            var key = prefix + '_' + dirs[d] + '_' + f;
            // Use willReadFrequently to avoid browser performance warning
            var canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 48;
            var ctx = canvas.getContext('2d', { willReadFrequently: true });
            drawCharacter(ctx, f, dirs[d], colors);
            scene.textures.addCanvas(key, canvas);
        }
    }
}

// ---- Draw a single character frame on a canvas context ----
// frame: 0-3 (0 and 2 = standing, 1 = left foot forward, 3 = right foot forward)
// dir: 'down', 'up', 'left', 'right'
function drawCharacter(ctx, frame, dir, c) {
    ctx.clearRect(0, 0, 32, 48);

    // Walking offsets for legs (creates the walk cycle)
    var walkOffset = 0;
    if (frame === 1) walkOffset = -2;
    else if (frame === 3) walkOffset = 2;

    // Slight vertical bob while walking
    var bob = (frame === 0 || frame === 2) ? 0 : -1;

    var cx = 16; // centre X of the frame

    // ---- Legs ----
    ctx.fillStyle = c.pants;
    if (dir === 'left' || dir === 'right') {
        // Side view: legs are offset front/back
        ctx.fillRect(cx - 4, 34 + bob, 4, 11);
        ctx.fillRect(cx + (walkOffset > 0 ? 1 : 0), 34 + bob, 4, 11);
    } else {
        ctx.fillRect(cx - 6 + walkOffset, 34 + bob, 4, 11);
        ctx.fillRect(cx + 2 - walkOffset, 34 + bob, 4, 11);
    }

    // Shoes
    ctx.fillStyle = c.shoes;
    if (dir === 'left' || dir === 'right') {
        ctx.fillRect(cx - 5, 44 + bob, 5, 2);
        ctx.fillRect(cx, 44 + bob, 5, 2);
    } else {
        ctx.fillRect(cx - 6 + walkOffset, 44 + bob, 4, 2);
        ctx.fillRect(cx + 2 - walkOffset, 44 + bob, 4, 2);
    }

    // ---- Body / torso ----
    ctx.fillStyle = c.shirt;
    if (dir === 'left' || dir === 'right') {
        ctx.fillRect(cx - 6, 19 + bob, 12, 16);
        // Accent stripe
        ctx.fillStyle = c.shirtAccent;
        ctx.fillRect(cx - 1, 19 + bob, 2, 16);
    } else {
        ctx.fillRect(cx - 8, 19 + bob, 16, 16);
        // Belt
        ctx.fillStyle = '#222';
        ctx.fillRect(cx - 8, 33 + bob, 16, 2);
        // Accent stripe (centre line)
        ctx.fillStyle = c.shirtAccent;
        ctx.fillRect(cx - 1, 19 + bob, 2, 14);
    }

    // ---- Arms ----
    ctx.fillStyle = c.shirt;
    var armBob = (frame === 1 || frame === 3) ? 1 : 0;
    if (dir === 'left') {
        ctx.fillRect(cx - 8, 20 + bob, 3, 12);
    } else if (dir === 'right') {
        ctx.fillRect(cx + 5, 20 + bob, 3, 12);
    } else {
        ctx.fillRect(cx - 10, 20 + bob - armBob, 3, 12);
        ctx.fillRect(cx + 7, 20 + bob + armBob, 3, 12);
    }
    // Hands (skin)
    ctx.fillStyle = c.skin;
    if (dir === 'left') {
        ctx.fillRect(cx - 8, 31 + bob, 3, 2);
    } else if (dir === 'right') {
        ctx.fillRect(cx + 5, 31 + bob, 3, 2);
    } else {
        ctx.fillRect(cx - 10, 31 + bob - armBob, 3, 2);
        ctx.fillRect(cx + 7, 31 + bob + armBob, 3, 2);
    }

    // ---- Head ----
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(cx, 11 + bob, 8, 0, Math.PI * 2);
    ctx.fill();

    // Hair (style differs by direction)
    ctx.fillStyle = c.hair;
    if (dir === 'up') {
        // Back of head: full hair
        ctx.beginPath();
        ctx.arc(cx, 11 + bob, 8, 0, Math.PI * 2);
        ctx.fill();
    } else if (dir === 'down') {
        // Front view: hair on top and sides
        ctx.beginPath();
        ctx.arc(cx, 9 + bob, 8, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(cx - 8, 9 + bob, 2, 4);
        ctx.fillRect(cx + 6, 9 + bob, 2, 4);
    } else if (dir === 'left') {
        ctx.beginPath();
        ctx.arc(cx, 9 + bob, 8, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(cx + 4, 9 + bob, 4, 6);
    } else if (dir === 'right') {
        ctx.beginPath();
        ctx.arc(cx, 9 + bob, 8, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(cx - 8, 9 + bob, 4, 6);
    }

    // Face details (only for down view)
    if (dir === 'down') {
        // Eyes
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(cx - 4, 11 + bob, 2, 2);
        ctx.fillRect(cx + 2, 11 + bob, 2, 2);
        // Mouth
        ctx.fillStyle = '#aa6666';
        ctx.fillRect(cx - 2, 15 + bob, 4, 1);
    } else if (dir === 'left') {
        // One eye for side view
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(cx - 4, 11 + bob, 2, 2);
    } else if (dir === 'right') {
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(cx + 2, 11 + bob, 2, 2);
    }
}

// ---- Create Phaser animation objects from the generated textures ----
function createCharacterAnimations(scene, prefix) {
    var dirs = ['down', 'up', 'left', 'right'];
    dirs.forEach(function (dir) {
        // Walking animation (4 frames, looping)
        scene.anims.create({
            key: prefix + '_walk_' + dir,
            frames: [
                { key: prefix + '_' + dir + '_0' },
                { key: prefix + '_' + dir + '_1' },
                { key: prefix + '_' + dir + '_2' },
                { key: prefix + '_' + dir + '_3' }
            ],
            frameRate: 8,
            repeat: -1
        });
        // Idle animation (single frame, no movement)
        scene.anims.create({
            key: prefix + '_idle_' + dir,
            frames: [{ key: prefix + '_' + dir + '_0' }],
            frameRate: 1
        });
    });
}

// ---- Player class ----
// Extends Phaser's Arcade Physics Sprite
class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // Start facing down, idle
        super(scene, x, y, 'player_down_0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // Physics setup
        this.setCollideWorldBounds(true);
        this.setSize(20, 14);       // Hitbox smaller than sprite for better feel
        this.setOffset(6, 34);
        this.body.bodyType = 1;     // Dynamic body
        this.setDepth(5);

        // State
        this.speed = 160;
        this.facing = 'down';
        this.isMoving = false;
        this.stepTimer = 0;

        // Reference to input keys (set by GameScene)
        this.cursors = null;
        this.wasd = null;
        this.interactKey = null;
        this.pauseKey = null;
    }

    // Called every frame by the GameScene update loop
    update() {
        // Safety check: ensure cursors are set up
        if (!this.cursors || !this.cursors.left) return;

        var vx = 0;
        var vy = 0;

        // Read input: WASD and arrow keys
        if (this.cursors.left.isDown || (this.wasd && this.wasd.A && this.wasd.A.isDown))  vx = -this.speed;
        if (this.cursors.right.isDown || (this.wasd && this.wasd.D && this.wasd.D.isDown)) vx = this.speed;
        if (this.cursors.up.isDown || (this.wasd && this.wasd.W && this.wasd.W.isDown))      vy = -this.speed;
        if (this.cursors.down.isDown || (this.wasd && this.wasd.S && this.wasd.S.isDown))  vy = this.speed;

        // Diagonal movement: normalise so speed isn't faster diagonally
        if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
        }

        this.setVelocity(vx, vy);
        this.isMoving = (vx !== 0 || vy !== 0);

        // Determine facing direction and play the right animation
        var newFacing = this.facing;
        if (vy < 0) newFacing = 'up';
        else if (vy > 0) newFacing = 'down';
        else if (vx < 0) newFacing = 'left';
        else if (vx > 0) newFacing = 'right';

        if (this.isMoving) {
            this.facing = newFacing;
            this.play('player_walk_' + this.facing, true);

            // Footstep sound at regular intervals while walking
            this.stepTimer++;
            if (this.stepTimer >= 18) {
                AudioManager.playStep();
                this.stepTimer = 0;
            }
        } else {
            this.play('player_idle_' + this.facing, true);
            this.stepTimer = 0;
        }
    }

    // Trigger action / interaction pose effect when pressing E
    triggerInteract() {
        if (!this.scene) return;
        // Visual interaction cyber pulse effect
        var fx = this.scene.add.circle(this.x, this.y + 10, 8, 0x00f0ff, 0.8).setDepth(10);
        this.scene.tweens.add({
            targets: fx,
            scale: 2.4,
            alpha: 0,
            duration: 350,
            onComplete: function () { fx.destroy(); }
        });

        // Quick character action bob animation
        this.scene.tweens.add({
            targets: this,
            y: this.y - 4,
            duration: 100,
            yoyo: true,
            repeat: 1
        });
    }
}
