/* ============================================================
   story.js
   OPERATION ZERO - Complete story data for CYBERWALL
   All story text in one place for easy editing.
   ============================================================ */

const Story = {
    // ---- Intro Cutscene (shown on NEW GAME only) ----
    intro: [
        {
            text: "Cyber City. 11:00 PM.",
            style: 'normal'
        },
        {
            text: "The city lights flicker. On every screen, one message appears:",
            style: 'normal'
        },
        {
            text: "THE WALL HAS A DOOR. YOUR PEOPLE WILL OPEN IT FOR ME.",
            style: 'glitch-red'
        },
        {
            text: "— ZERO",
            style: 'glitch-red'
        },
        {
            text: "Commander Riley: \"Officer, ZERO has been sending traps to our citizens all day.\"",
            style: 'normal'
        },
        {
            text: "Commander Riley: \"Every trap leaves a clue. Help the people, collect the clues, and we will find ZERO before midnight.\"",
            style: 'normal'
        },
        {
            text: "Commander Riley: \"Start with Alex on Main Street. Move out, Officer.\"",
            style: 'normal'
        }
    ],

    // ---- Clues (awarded after each mission) ----
    clues: {
        1: {
            id: 1,
            title: 'THE FIRST TRAP',
            text: 'The fake bank email was sent from a server named node-7.'
        },
        2: {
            id: 2,
            title: 'THE STOLEN LOGIN',
            text: 'Sarah\'s account was entered from the same server: node-7.'
        },
        3: {
            id: 3,
            title: 'THE FAKE SHOP',
            text: 'The fake shopping website is hosted on node-7 too.'
        },
        4: {
            id: 4,
            title: 'THE BAD PACKETS',
            text: 'Every malicious packet blocked by the firewall came from node-7.'
        },
        5: {
            id: 5,
            title: 'THE MASTER PLAN',
            text: 'ZERO is collecting birth dates, ID numbers, addresses and phone numbers to build a master identity that unlocks the CyberWall core.'
        }
    },

    // ---- ZERO Taunts (shown after each mission badge) ----
    zeroTaunts: {
        1: "One email failed. I have thousands more.",
        2: "Passwords are my favourite doors. So many are unlocked.",
        3: "A shiny discount fools everyone eventually.",
        4: "You blocked packets, Officer. But who blocks the people?",
        5: "You have learned my secret... but it is almost midnight."
    },

    // ---- NPC Story Lines (extra dialogue after mission complete) ----
    npcStoryLines: {
        alex: "ZERO's email nearly fooled me. Look for the sender's server name, Officer. I saw 'node-7' in the header.",
        sarah: "The login alert said the attempt came from 'node-7'. I'm changing every password.",
        david: "The shop's hosting info showed 'node-7.darknet'. That's not a normal server name.",
        riley: "The packets all trace back to one source: node-7. It's an old server we decommissioned years ago. ZERO must have reactivated it.",
        maya: "The phishing form that tried to steal my identity? It sent data to 'node-7'. Officer, someone is collecting everything about us."
    },

    // ---- Mission 6: Operation Zero Finale ----
    finale: {
        missionId: 6,
        title: 'Operation Zero',
        badge: 'ZERO HUNTER',
        icon: '\u{1F50D}',
        points: 200,
        desc: 'Located node-7, stopped the ZERO bot, and saved Cyber City before midnight.',
        
        briefing: [
            "Commander Riley: \"Excellent work, Officer. We now know ZERO's plan.\"",
            "Commander Riley: \"Node-7 is in the old server room beneath the Firewall Control Centre.\"",
            "Commander Riley: \"It's 11:50 PM. You have 10 minutes. Find node-7 and shut it down.\"",
            "Commander Riley: \"But remember: ZERO might be a person... or something else. Be ready for anything.\""
        ],
        
        discovery: [
            "[TERMINAL DISPLAY]",
            "SERVER: node-7",
            "STATUS: ACTIVE",
            "UPTIME: 247 DAYS",
            "PROCESS: zero_bot.exe",
            "",
            "You examine the code. ZERO is not a hacker.",
            "ZERO is an automated attack bot, running for months on this forgotten server.",
            "It scans Cyber City for human mistakes: weak passwords, phishing clicks, unsafe links.",
            "Every mistake is logged. Every mistake weakens the CyberWall.",
            "",
            "The bot has no name, no face, no motive. It simply executes its loop:",
            "SCAN. EXPLOIT. REPEAT.",
            "",
            "The strongest firewall is a careful human.",
            "",
            "You type the shutdown command."
        ],
        
        shutdown: [
            "[SHUTTING DOWN node-7...]",
            "PROCESS TERMINATED: zero_bot.exe",
            "SERVER OFFLINE.",
            "",
            "11:59 PM. The CyberWall stabilizes.",
            "ZERO is silent."
        ]
    },

    // ---- Ending Cutscene (after Mission 6) ----
    ending: [
        {
            text: "12:00 AM. Midnight.",
            style: 'normal'
        },
        {
            text: "Cyber City's lights return to full strength. The CyberWall is secure.",
            style: 'normal'
        },
        {
            text: "Commander Riley: \"Outstanding work, Officer. You stopped ZERO and protected every citizen.\"",
            style: 'normal'
        },
        {
            text: "Commander Riley: \"Remember what you learned tonight:\"",
            style: 'normal'
        },
        {
            text: "\"No firewall can protect a careless user.\"",
            style: 'highlight'
        },
        {
            text: "\"The best security tool is a careful mind.\"",
            style: 'highlight'
        },
        {
            text: "\"Stay vigilant. The next ZERO could already be running.\"",
            style: 'highlight'
        },
        {
            text: "MISSION COMPLETE.",
            style: 'success'
        }
    ],

    // ---- Theme ----
    theme: "The strongest firewall is a careful human."
};
