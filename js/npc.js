/* ============================================================
   npc.js
   NPC characters, their visual generation, data, and placement.
   Each NPC has a unique colour scheme, name, and mission link.
   ============================================================ */

// ---- NPC visual colour schemes ----
const NPC_COLORS = {
    alex: {
        skin:  '#e0b890',
        hair:  '#8b4513',
        shirt: '#2a7a3a',     // Green hoodie
        shirtAccent: '#44ff88',
        pants: '#3a3a3a',
        shoes: '#553322'
    },
    sarah: {
        skin:  '#f0c8a0',
        hair:  '#d4a017',     // Blonde
        shirt: '#a0206a',     // Pink/purple top
        shirtAccent: '#ff88cc',
        pants: '#1a1a3a',
        shoes: '#553366'
    },
    david: {
        skin:  '#c89878',
        hair:  '#1a1a1a',     // Black hair
        shirt: '#c04020',     // Red jacket
        shirtAccent: '#ff6644',
        pants: '#2a2a2a',
        shoes: '#333333'
    },
    riley: {
        skin:  '#d8a070',
        hair:  '#444444',     // Grey hair (veteran)
        shirt: '#0a0a4a',     // Dark navy uniform
        shirtAccent: '#ffd700', // Gold accents (commander)
        pants: '#0a0a2a',
        shoes: '#1a1a1a'
    },
    maya: {
        skin:  '#d89870',
        hair:  '#6a1b9a',     // Purple dyed hair
        shirt: '#d81b60',     // Magenta jacket
        shirtAccent: '#00f0ff',
        pants: '#1a1a3a',
        shoes: '#ffffff'
    }
};

// ---- NPC data: names, positions, missions, dialogues ----
// Positions are in world coordinates (pixels). They must be inside the
// city boundaries defined in game.js.
const NPC_DATA = [
    {
        id: 'alex',
        name: 'Alex',
        title: 'Citizen',
        x: 450,
        y: 500,
        missionId: 1,
        icon: '\u{1F4E7}',
        intro: [
            "Oh, thank goodness you're here, Officer!",
            "I got an email this morning saying my bank account will be blocked unless I share my OTP.",
            "They said it's urgent and I need to act now. Should I give them the code?"
        ],
        accept: "Please, can you check if this email is safe? Go to CyberWall Headquarters and use the laptop.",
        waiting: "Have you analysed that email yet? Head to CyberWall HQ and use the Phishing Email Detector on the laptop.",
        complete: [
            "You analysed it? It was HIGH RISK? So it was a phishing scam!",
            "I almost gave them my OTP! Thank you so much for saving my account.",
            "I'll never share my OTP with anyone again. You've earned this badge!"
        ],
        final: "Thanks again for your help! Stay safe out there."
    },
    {
        id: 'sarah',
        name: 'Sarah',
        title: 'Student',
        x: 1450,
        y: 500,
        missionId: 2,
        icon: '\u{1F4DD}',
        intro: [
            "Hi Officer! I use the same password for everything. It's 'password123'.",
            "My friend said it's too weak and someone could guess it easily.",
            "Can you help me understand what makes a password strong?"
        ],
        accept: "Please go to CyberWall HQ and use the Password Strength Checker on the laptop. Show me what a strong password looks like!",
        waiting: "Have you checked my password at the CyberWall laptop yet? Use the Password Strength Checker.",
        complete: [
            "So 'password123' is very weak? I had no idea!",
            "I should use longer passwords with numbers, symbols, and mixed case letters.",
            "And I should use different passwords for different accounts. Thank you! Here's your badge."
        ],
        final: "My accounts are much safer now. Thanks for teaching me about strong passwords!"
    },
    {
        id: 'david',
        name: 'David',
        title: 'Shopper',
        x: 300,
        y: 250,
        missionId: 3,
        icon: '\u{1F6D2}',
        intro: [
            "Officer! I found a website selling a brand-new smartphone for only Rs. 999!",
            "The URL looks a bit odd though: www.amaz0n-mega-sale-deals.net",
            "It's such a huge discount... but something feels off. Can you check it?"
        ],
        accept: "Go to CyberWall HQ and use the URL Detector on the laptop. Check that website address for me!",
        waiting: "Did you analyse that shopping website URL at the CyberWall laptop yet? Use the URL Detector tool.",
        complete: [
            "HIGH RISK? So the website is fake! The domain name was misspelled to trick me!",
            "I almost lost my money. That 'amaz0n' with a zero instead of an 'o' is sneaky.",
            "Thank you for protecting me from this scam. You deserve this badge!"
        ],
        final: "I'll always double-check website URLs before shopping now. Thanks for the help!"
    },
    {
        id: 'riley',
        name: 'Commander Riley',
        title: 'CyberWall Commander',
        x: 1100,
        y: 300,
        missionId: 4,
        icon: '\u{1F3E2}',
        intro: [
            "Listen up, Officer. Our Firewall Control Centre is under pressure.",
            "We're getting suspicious network traffic from unknown sources trying to breach our systems.",
            "I need you to go to the Firewall Control Centre and manage the traffic. Block the bad, allow the good."
        ],
        accept: "Head south to the Firewall Control Centre. Interact with the firewall computer and use the Firewall Simulator.",
        waiting: "The firewall needs attention! Go to the Firewall Control Centre and start the simulation.",
        complete: [
            "Excellent work! You blocked the malicious traffic and kept our systems safe.",
            "You followed the security rules perfectly. Cyber City's network is secure.",
            "You've earned the Firewall Defender badge. Well done, Officer!"
        ],
        final: "The network is running smoothly now. Thank you for your service."
    },
    {
        id: 'maya',
        name: 'Maya',
        title: 'Social Influencer',
        x: 680,
        y: 480,
        missionId: 5,
        icon: '\u{1F4F1}',
        intro: [
            "Officer! You have to help me! A talent scout online offered me an official 'Verified Creator' badge!",
            "They sent a registration form asking for my full legal name, date of birth, mother's maiden name, Aadhaar number, and home address.",
            "They say it's required for identity verification, but is it really safe to send all that personal info?"
        ],
        accept: "Can you run an Identity Privacy Audit on the CyberWall laptop? Show me which personal info is safe to share and what must stay private!",
        waiting: "Have you audited the identity data form at the CyberWall laptop? Use the Identity Defender tool to classify sensitive PII.",
        complete: [
            "My Aadhaar, date of birth, mother's maiden name, and address are Personally Identifiable Information (PII)?",
            "Someone could take out loans, hijack accounts, or commit identity theft in my name with that data!",
            "I blocked the scammer and reported their account. Thank you so much! You've earned the Identity Guardian badge!"
        ],
        final: "I'll never share my Aadhaar, birthdate, or security question answers online again. You're a lifesaver!"
    }
];

// ---- Ambient Citizens: walk back and forth along sidewalks ----
const AMBIENT_CITIZENS = [
    {
        id: 'dev',
        name: 'Dev',
        title: 'Citizen',
        x: 420,
        y: 410,
        colors: { skin: '#d0a070', hair: '#1a1a1a', shirt: '#e67e22', shirtAccent: '#f39c12', pants: '#2c3e50', shoes: '#34495e' },
        axis: 'x',
        min: 380,
        max: 620,
        speed: 40,
        tip: "Did you know? Always check if website addresses start with https:// before entering passwords!"
    },
    {
        id: 'neha',
        name: 'Neha',
        title: 'Citizen',
        x: 980,
        y: 350,
        colors: { skin: '#e8be92', hair: '#2c3e50', shirt: '#16a085', shirtAccent: '#1abc9c', pants: '#34495e', shoes: '#2c3e50' },
        axis: 'y',
        min: 340,
        max: 520,
        speed: 40,
        tip: "Remember: Never share bank OTPs with anyone calling you, even if they claim to be from the bank!"
    },
    {
        id: 'kabir',
        name: 'Kabir',
        title: 'Citizen',
        x: 1250,
        y: 410,
        colors: { skin: '#cf9868', hair: '#5d4037', shirt: '#3f51b5', shirtAccent: '#5c6bc0', pants: '#212121', shoes: '#424242' },
        axis: 'x',
        min: 1180,
        max: 1420,
        speed: 40,
        tip: "Cyber Safety Tip: If you suspect cyber fraud, call 1930 immediately to block fraudulent transactions!"
    }
];

// ---- Generate all NPC textures and animations ----
function generateNPCTextures(scene) {
    NPC_DATA.forEach(function (npc) {
        var colors = NPC_COLORS[npc.id];
        generateCharacterSheet(scene, npc.id, colors);
        createCharacterAnimations(scene, npc.id);
    });
    AMBIENT_CITIZENS.forEach(function (amb) {
        generateCharacterSheet(scene, amb.id, amb.colors);
        createCharacterAnimations(scene, amb.id);
    });
}

// ---- Ambient NPC class (patrolling citizens) ----
class AmbientNPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, data) {
        super(scene, data.x, data.y, data.id + '_down_0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.npcData = data;
        this.setDepth(4);
        this.setSize(20, 14);
        this.setOffset(6, 34);

        this.direction = 1;
        this.moveSpeed = data.speed || 40;
        this.waitTimer = 0;
        this.isWaiting = false;

        this.label = scene.add.text(data.x, data.y - 38, data.name, {
            fontFamily: 'Segoe UI, monospace',
            fontSize: '11px',
            color: '#aab0cc',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(6);
    }

    update() {
        if (this.isWaiting) {
            this.waitTimer--;
            if (this.waitTimer <= 0) {
                this.isWaiting = false;
                this.direction *= -1;
            }
            this.setVelocity(0, 0);
            this.label.setPosition(this.x, this.y - 38);
            return;
        }

        if (this.npcData.axis === 'x') {
            this.setVelocityX(this.direction * this.moveSpeed);
            this.setVelocityY(0);
            var dirName = this.direction > 0 ? 'right' : 'left';
            this.play(this.npcData.id + '_walk_' + dirName, true);

            if ((this.direction > 0 && this.x >= this.npcData.max) || (this.direction < 0 && this.x <= this.npcData.min)) {
                this.isWaiting = true;
                this.waitTimer = 90;
                this.play(this.npcData.id + '_idle_' + dirName, true);
            }
        } else {
            this.setVelocityY(this.direction * this.moveSpeed);
            this.setVelocityX(0);
            var vdirName = this.direction > 0 ? 'down' : 'up';
            this.play(this.npcData.id + '_walk_' + vdirName, true);

            if ((this.direction > 0 && this.y >= this.npcData.max) || (this.direction < 0 && this.y <= this.npcData.min)) {
                this.isWaiting = true;
                this.waitTimer = 90;
                this.play(this.npcData.id + '_idle_' + vdirName, true);
            }
        }

        this.label.setPosition(this.x, this.y - 38);
    }
}

// ---- NPC class ----
// A simple sprite with idle animations that faces different directions
class NPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, data) {
        // Start facing down
        super(scene, data.x, data.y, data.id + '_down_0');
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.npcData = data;
        this.setDepth(4);
        this.body.setImmovable(true);
        this.setSize(20, 14);
        this.setOffset(6, 34);

        // Name label floating above the NPC
        this.label = scene.add.text(data.x, data.y - 40, data.name, {
            fontFamily: 'Segoe UI, monospace',
            fontSize: '13px',
            color: '#00f0ff',
            stroke: '#000',
            strokeThickness: 3,
            padding: { x: 4, y: 2 }
        }).setOrigin(0.5).setDepth(6);

        // Interaction indicator (glowing circle shown when player is near)
        this.indicator = scene.add.text(data.x, data.y - 50, '\u25CF', {
            fontSize: '16px',
            color: '#00f0ff'
        }).setOrigin(0.5).setDepth(6).setAlpha(0);

        // Idle animation: gently cycle facing directions
        this.idleTimer = 0;
        this.idleDir = 'down';
        this.play(data.id + '_idle_down');
    }

    // Called every frame by GameScene
    update() {
        // Slowly bob between facing directions for a "looking around" effect
        this.idleTimer++;
        if (this.idleTimer === 120) {
            this.idleDir = 'left';
            this.play(this.npcData.id + '_idle_left');
        } else if (this.idleTimer === 240) {
            this.idleDir = 'right';
            this.play(this.npcData.id + '_idle_right');
        } else if (this.idleTimer === 360) {
            this.idleDir = 'down';
            this.play(this.npcData.id + '_idle_down');
            this.idleTimer = 0;
        }

        // Pulse the interaction indicator
        if (this.indicator.alpha > 0) {
            this.indicator.setScale(1 + Math.sin(this.idleTimer * 0.1) * 0.2);
        }
    }

    // Show/hide interaction indicator
    showIndicator(show) {
        this.indicator.setAlpha(show ? 1 : 0);
    }
}
