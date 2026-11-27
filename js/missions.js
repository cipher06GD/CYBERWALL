/* ============================================================
   missions.js
   Mission system: tracks progress, objectives, badges, and points.
   Each mission has states: locked -> active -> tool_completed -> completed.
   ============================================================ */

const Missions = {
    // Badge data for each mission
    badges: {
        1: { name: 'EMAIL DETECTIVE',    icon: '\u2709',  points: 100, desc: 'Identified a phishing email and protected Alex from sharing his OTP.' },
        2: { name: 'PASSWORD GUARDIAN',  icon: '\u{1F511}', points: 100, desc: 'Demonstrated strong password practices for Sarah.' },
        3: { name: 'SCAM INVESTIGATOR',  icon: '\u{1F6D2}', points: 100, desc: 'Detected a fake shopping website and saved David from a scam.' },
        4: { name: 'FIREWALL DEFENDER',  icon: '\u{1F501}', points: 100, desc: 'Defended Cyber City network by managing the firewall correctly.' },
        5: { name: 'IDENTITY GUARDIAN',  icon: '\u{1F6E1}', points: 100, desc: 'Protected Maya from sharing sensitive personal information and prevented identity theft.' },
        6: { name: 'ZERO HUNTER',       icon: '\u{1F50D}', points: 200, desc: 'Located node-7, stopped the ZERO bot, and saved Cyber City before midnight.' }
    },

    // Get current objective text for the HUD based on mission status
    getObjectiveText(missionId, status) {
        var objectives = {
            1: {
                locked: '',
                active: 'Mission 1: Talk to Alex on Main Street',
                accepted: 'Mission 1: Go to CyberWall HQ and analyse Alex\'s email',
                tool_completed: 'Mission 1: Return to Alex with your findings',
                completed: 'Mission 1 Complete - Email Detective!'
            },
            2: {
                locked: '',
                active: 'Mission 2: Talk to Sarah on Main Street',
                accepted: 'Mission 2: Go to CyberWall HQ and create a strong password for Sarah',
                tool_completed: 'Mission 2: Return to Sarah with your findings',
                completed: 'Mission 2 Complete - Password Guardian!'
            },
            3: {
                locked: '',
                active: 'Mission 3: Talk to David near Cyber Shopping Mall',
                accepted: 'Mission 3: Go to CyberWall HQ and analyse David\'s URL',
                tool_completed: 'Mission 3: Return to David with your findings',
                completed: 'Mission 3 Complete - Scam Investigator!'
            },
            4: {
                locked: '',
                active: 'Mission 4: Talk to Commander Riley at CyberWall HQ',
                accepted: 'Mission 4: Go to the Firewall Control Centre and start the simulation',
                tool_completed: 'Mission 4: Return to Commander Riley with your report',
                completed: 'Mission 4 Complete - Firewall Defender!'
            },
            5: {
                locked: '',
                active: 'Mission 5: Talk to Maya in Cyber City',
                accepted: 'Mission 5: Go to CyberWall HQ and use the Identity Defender tool',
                tool_completed: 'Mission 5: Return to Maya with your findings',
                completed: 'Mission 5 Complete - Identity Guardian!'
            },
            6: {
                locked: '',
                active: 'Mission 6: Go to the Firewall Control Centre and find node-7',
                accepted: 'Mission 6: Investigate node-7 in the Firewall Control Centre',
                tool_completed: '',
                completed: 'Mission 6 Complete - Zero Hunter!'
            }
        };
        return objectives[missionId] ? objectives[missionId][status] || '' : '';
    },

    // Check which missions are unlocked.
    // Mission 1 starts unlocked. Others unlock after the previous is completed.
    // Mission 6 (Operation Zero) unlocks when all 5 clues are collected.
    updateUnlocks(state) {
        var total = state.missions ? Object.keys(state.missions).length : 5;
        for (var i = 2; i <= 5; i++) {
            if (state.missions[i] && state.missions[i].status === 'locked' &&
                state.missions[i - 1] && state.missions[i - 1].status === 'completed') {
                state.missions[i].status = 'active';
            }
        }

        // Unlock Mission 6 (Operation Zero) when all 5 clues are collected
        if (state.clues && state.clues.length >= 5 &&
            state.missions[6] && state.missions[6].status === 'locked' &&
            state.missions[5] && state.missions[5].status === 'completed') {
            state.missions[6].status = 'active';
        }
    },

    // Get the first mission that is currently in progress or active
    // Prioritises accepted/tool_completed cases so the HUD guides the player
    getActiveMission(state) {
        var total = state.missions ? Object.keys(state.missions).length : 4;
        // Priority 1: In-progress cases (accepted or tool_completed)
        for (var i = 1; i <= total; i++) {
            if (state.missions[i] &&
                (state.missions[i].status === 'accepted' || state.missions[i].status === 'tool_completed')) {
                return i;
            }
        }
        // Priority 2: Unlocked cases waiting to be accepted
        for (var j = 1; j <= total; j++) {
            if (state.missions[j] && state.missions[j].status === 'active') {
                return j;
            }
        }
        return null;
    },

    // Called when a player interacts with an NPC.
    // Returns the dialogue lines and buttons to show based on mission state.
    handleNPCInteraction(npc, state) {
        var missionId = npc.missionId;
        var mission = state.missions[missionId];

        if (mission.status === 'locked') {
            // Mission not unlocked yet - show a hint
            return {
                lines: ["I don't have any work for you right now. Maybe check back later."],
                showAccept: false
            };
        }

        if (mission.status === 'active') {
            // First interaction: show intro and offer to accept
            return {
                lines: npc.intro.concat([npc.accept]),
                showAccept: true,
                onAccept: function () {
                    Missions.acceptMission(missionId, state);
                }
            };
        }

        if (mission.status === 'tool_completed') {
            // Player has used the tool and returned - complete the mission!
            return {
                lines: npc.complete,
                showAccept: false,
                onComplete: function () {
                    Missions.completeMission(missionId, state);
                }
            };
        }

        if (mission.status === 'accepted') {
            // Mission accepted but tool not used yet
            return {
                lines: [npc.waiting],
                showAccept: false
            };
        }

        if (mission.status === 'completed') {
            // Already done - show final dialogue + OPERATION ZERO story line
            var storyLine = '';
            if (Story.npcStoryLines && Story.npcStoryLines[npc.id]) {
                storyLine = Story.npcStoryLines[npc.id];
            }
            return {
                lines: [npc.final, storyLine].filter(function (l) { return l; }),
                showAccept: false
            };
        }

        // Fallback
        return { lines: ["..."], showAccept: false };
    },

    // Accept a mission (changes status from active to accepted)
    acceptMission(missionId, state) {
        state.missions[missionId].status = 'accepted';
        SaveSystem.save(state);
        Game.updateHUD();
        Game.showNotification('New Mission: ' + state.missions[missionId].title);
        AudioManager.playInteract();
    },

    // Mark that the tool has been used for a mission (tool_completed state)
    markToolUsed(missionId, state) {
        if (state.missions[missionId] && state.missions[missionId].status === 'accepted') {
            state.missions[missionId].status = 'tool_completed';
            if (!state.toolUsed) state.toolUsed = {};
            state.toolUsed[missionId] = true;
            SaveSystem.save(state);
            Game.updateHUD();
            Game.showNotification('Analysis complete! Return to the citizen.');
            AudioManager.playSuccess();
        }
    },

    // Complete a mission and award the badge
    completeMission(missionId, state) {
        if (state.missions[missionId].status !== 'tool_completed' &&
            state.missions[missionId].status !== 'accepted') return;

        state.missions[missionId].status = 'completed';
        var badge = this.badges[missionId];
        state.badges.push({ id: missionId, name: badge.name, icon: badge.icon });
        state.score += badge.points;

        // OPERATION ZERO: Award a clue for missions 1-5
        if (missionId >= 1 && missionId <= 5 && state.clues) {
            if (state.clues.indexOf(missionId) === -1) {
                state.clues.push(missionId);
            }
        }

        SaveSystem.save(state);

        // Track which mission was just completed (used by closeMissionComplete to show ZERO taunt)
        this.lastCompletedMission = missionId;

        // Show mission complete overlay
        this.showMissionComplete(missionId, state);

        // Unlock next missions
        this.updateUnlocks(state);
        SaveSystem.save(state);
        Game.updateHUD();

        // Check if all 5 missions are done.
        // Final screen is shown after the ZERO taunt in closeMissionComplete.
        this.allFiveDone = SaveSystem.allMissionsComplete(state);
    },

    // Show the mission complete overlay with badge
    showMissionComplete(missionId, state) {
        var badge = this.badges[missionId];
        document.getElementById('mission-badge-display').textContent = badge.icon;
        document.getElementById('mission-complete-title').textContent = badge.name + ' BADGE';
        document.getElementById('mission-complete-desc').textContent = badge.desc;
        document.getElementById('mission-score-earned').textContent = badge.points;
        Game.showOverlay('mission-complete-overlay');
        AudioManager.playMissionComplete();
    },

    // Get active mission text for the HUD
    getHUDText(state) {
        var activeId = this.getActiveMission(state);
        if (!activeId) {
            // Check if all complete
            if (SaveSystem.allMissionsComplete(state)) {
                return 'All missions complete!';
            }
            return 'No active mission. Find citizens to help!';
        }
        var mission = state.missions[activeId];
        return this.getObjectiveText(activeId, mission.status);
    }
};
