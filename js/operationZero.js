/* ============================================================
   operationZero.js
   Mission 6 Finale: OPERATION ZERO
   Handles the node-7 terminal interaction, briefing, discovery,
   shutdown sequence, and mission 6 completion.
   Triggered when the player interacts with the node-7 server
   inside the Firewall Control Centre.
   ============================================================ */

const OperationZero = {
    // Called when player interacts with the node-7 terminal
    interact(state) {
        var m6 = state.missions[6];
        if (!m6) return;

        if (m6.status === 'locked') {
            // Player hasn't collected all 5 clues yet
            Dialogue.start(
                { name: 'node-7 SERVER', title: 'Decommissioned', icon: '\u{1F50D}' },
                [
                    "This old server terminal is dark and offline.",
                    "A faded label reads: 'node-7 - DECOMMISSIONED'.",
                    "You need all 5 clues before you can investigate this server."
                ],
                null, false
            );
        } else if (m6.status === 'active') {
            // All clues collected - start the finale!
            this.startBriefing();
        } else if (m6.status === 'accepted') {
            // Player left mid-sequence, continue from discovery
            this.showDiscovery();
        } else if (m6.status === 'completed') {
            // Already done
            Dialogue.start(
                { name: 'node-7 SERVER', title: 'Offline', icon: '\u{1F50D}' },
                [
                    "node-7 is offline. The ZERO bot has been stopped.",
                    "Cyber City is safe. The CyberWall holds."
                ],
                null, false
            );
        }
    },

    // Phase 1: Commander Riley's briefing
    startBriefing() {
        // Change mission 6 status to accepted
        Game.state.missions[6].status = 'accepted';
        SaveSystem.save(Game.state);
        Game.updateHUD();

        Dialogue.start(
            { name: 'Commander Riley', title: 'CyberWall Commander', icon: '\u{1F3E2}' },
            Story.finale.briefing,
            function () {
                // Briefing done -> move to discovery phase
                setTimeout(function () { OperationZero.showDiscovery(); }, 400);
            },
            false
        );
    },

    // Phase 2: Examine node-7 and discover the truth about ZERO
    showDiscovery() {
        Dialogue.start(
            { name: 'node-7 TERMINAL', title: 'Server Room', icon: '\u{1F4BB}' },
            Story.finale.discovery,
            function () {
                // Discovery done -> move to shutdown phase
                setTimeout(function () { OperationZero.showShutdown(); }, 400);
            },
            false
        );
    },

    // Phase 3: Shut down node-7 and stop ZERO
    showShutdown() {
        Dialogue.start(
            { name: 'node-7 TERMINAL', title: 'Shutting Down', icon: '\u{1F6D1}' },
            Story.finale.shutdown,
            function () {
                // Shutdown done -> complete the mission
                OperationZero.complete();
            },
            false
        );
    },

    // Phase 4: Complete mission 6, award badge, trigger ending cutscene
    complete() {
        // Mark mission 6 as completed
        Game.state.missions[6].status = 'completed';
        var badge = Missions.badges[6];
        Game.state.badges.push({ id: 6, name: badge.name, icon: badge.icon });
        Game.state.score += badge.points;
        SaveSystem.save(Game.state);
        Game.updateHUD();

        // Track which mission was just completed (for closeMissionComplete)
        Missions.lastCompletedMission = 6;

        // Show the mission complete badge overlay
        Missions.showMissionComplete(6, Game.state);
    }
};
