/* ============================================================
   firewallSimulator.js
   TOOL 4: Firewall Simulator
   Educational network traffic simulation. Players review packets
   and decide to ALLOW or BLOCK based on security rules.
   This is a simulation only - it does not affect real networks.
   ============================================================ */

const FirewallSimulator = {
    packets: [],         // Generated list of network packets
    currentIndex: 0,     // Which packet the player is looking at
    allowedCount: 0,
    blockedCount: 0,
    correctCount: 0,
    isRunning: false,
    totalPackets: 10,    // Total packets in the simulation

    // Start a new simulation
    start() {
        // Check if matching mission is accepted
        if (Game.state && Game.state.missions && Game.state.missions[4]) {
            var m4Status = Game.state.missions[4].status;
            if (m4Status !== 'accepted' && m4Status !== 'tool_completed' && m4Status !== 'completed') {
                if (typeof Game.showNotification === 'function') {
                    Game.showNotification('Talk to the citizen first to accept the case');
                }
            }
        }

        this.packets = this.generatePackets(this.totalPackets);
        this.currentIndex = 0;
        this.allowedCount = 0;
        this.blockedCount = 0;
        this.correctCount = 0;
        this.isRunning = true;

        // Hide start button
        document.getElementById('fw-start-btn').style.display = 'none';
        document.getElementById('fw-packet-buttons').style.display = 'flex';

        this.updateStats();
        this.showPacket();
        AudioManager.playClick();
    },

    // Generate a set of fictional network packets
    // Each packet has a source, destination, type, port, and whether
    // it SHOULD be allowed or blocked based on the rules.
    generatePackets(count) {
        var sources = [
            { ip: '192.168.1.15',  label: 'Internal PC (Lobby)', trusted: true },
            { ip: '192.168.1.22',  label: 'Internal Server', trusted: true },
            { ip: '192.168.1.50',  label: 'Office Workstation', trusted: true },
            { ip: '203.45.67.12',  label: 'Unknown External', trusted: false },
            { ip: '91.213.50.7',   label: 'Suspicious Source', trusted: false },
            { ip: '45.128.90.33',  label: 'Unknown External', trusted: false },
            { ip: '192.168.1.8',   label: 'Internal Desktop', trusted: true }
        ];

        var destinations = [
            { ip: '192.168.1.1',  label: 'Company Web Server', port: 443, type: 'HTTPS', safe: true },
            { ip: '192.168.1.2',  label: 'Company Mail Server', port: 993, type: 'IMAPS (Email)', safe: true },
            { ip: '192.168.1.3',  label: 'Internal File Server', port: 445, type: 'File Sharing', safe: true },
            { ip: '192.168.1.1',  label: 'Company Web Server', port: 80, type: 'HTTP (Web)', safe: true },
            { ip: '192.168.1.10', label: 'Admin Console', port: 22, type: 'SSH (Remote Access)', safe: true },
            { ip: '192.168.1.5',  label: 'Restricted Server', port: 31337, type: 'Backdoor Port', safe: false },
            { ip: '192.168.1.5',  label: 'Restricted Server', port: 4444, type: 'Malware C&C Port', safe: false }
        ];

        var packets = [];
        for (var i = 0; i < count; i++) {
            // Randomly pick sources and destinations
            var src = sources[Math.floor(Math.random() * sources.length)];
            var dst;

            if (!src.trusted) {
                // External sources more likely to target restricted ports
                if (Math.random() < 0.5) {
                    dst = destinations.filter(function (d) { return !d.safe; })[Math.floor(Math.random() * 2)];
                } else {
                    dst = destinations[Math.floor(Math.random() * destinations.length)];
                }
            } else {
                dst = destinations[Math.floor(Math.random() * destinations.length)];
            }

            // Determine correct decision based on rules
            // ALLOW if: source is trusted AND destination is safe
            // BLOCK if: source is not trusted OR destination is not safe
            var shouldAllow = src.trusted && dst.safe;

            packets.push({
                id: i,
                sourceIP: src.ip,
                sourceLabel: src.label,
                sourceTrusted: src.trusted,
                destIP: dst.ip,
                destLabel: dst.label,
                destPort: dst.port,
                trafficType: dst.type,
                safe: dst.safe,
                shouldAllow: shouldAllow
            });
        }

        return packets;
    },

    // Show the current packet to the player
    showPacket() {
        if (this.currentIndex >= this.packets.length) {
            this.finish();
            return;
        }

        var p = this.packets[this.currentIndex];
        var html = '<p><strong>Packet #' + (this.currentIndex + 1) + '</strong> of ' + this.packets.length + '</p>';
        html += '<p style="margin-top:10px;">';
        html += '<span class="packet-detail">Source: ' + p.sourceLabel + ' (' + p.sourceIP + ')</span>';
        html += '<br>';
        html += '<span class="packet-detail">Destination: ' + p.destLabel + ' (' + p.destIP + ':' + p.destPort + ')</span>';
        html += '<br>';
        html += '<span class="packet-detail">Type: ' + p.trafficType + '</span>';
        html += '<br>';
        html += '<span class="packet-detail">Port: ' + p.destPort + '</span>';
        html += '</p>';

        var info = document.getElementById('fw-packet-info');
        info.innerHTML = html;
    },

    // Player makes a decision (allow or block)
    // Both decide() and decision() are supported so index.html and scripts match
    decide(action) {
        return this.decision(action);
    },

    decision(action) {
        if (!this.isRunning || this.currentIndex >= this.packets.length) return;

        var p = this.packets[this.currentIndex];
        var isCorrect = (action === 'allow' && p.shouldAllow) || (action === 'block' && !p.shouldAllow);

        // Update counters
        if (action === 'allow') this.allowedCount++;
        else this.blockedCount++;

        if (isCorrect) {
            this.correctCount++;
            AudioManager.playSuccess();
        } else {
            AudioManager.playWarning();
            // Screen shake on incorrect firewall decision
            if (Game.activeScene && Game.activeScene.cameras && Game.activeScene.cameras.main) {
                Game.activeScene.cameras.main.shake(250, 0.015);
            }
        }

        // Show feedback
        var info = document.getElementById('fw-packet-info');
        var feedback = document.createElement('div');
        feedback.className = 'packet-feedback ' + (isCorrect ? 'feedback-correct' : 'feedback-wrong');

        if (isCorrect) {
            feedback.innerHTML = '\u2713 CORRECT! ';
            if (action === 'allow') {
                feedback.innerHTML += 'This traffic is from a trusted source to a known service and should be allowed.';
            } else {
                feedback.innerHTML += p.sourceTrusted ?
                    'This traffic targets a restricted/malware port and should be blocked.' :
                    'This traffic is from an untrusted external source and should be blocked.';
            }
        } else {
            feedback.innerHTML = '\u2717 INCORRECT! ';
            if (action === 'allow' && !p.shouldAllow) {
                feedback.innerHTML += p.sourceTrusted ?
                    'This traffic targets port ' + p.destPort + ' which is a restricted port (' + p.trafficType + '). It should have been BLOCKED.' :
                    'This traffic is from an untrusted external source (' + p.sourceLabel + '). It should have been BLOCKED.';
            } else {
                feedback.innerHTML += 'This traffic is from a trusted internal source to a known service. It should have been ALLOWED.';
            }
        }

        info.appendChild(feedback);

        // Move to next packet after a short delay
        var self = this;
        setTimeout(function () {
            self.currentIndex++;
            self.updateStats();
            self.showPacket();
        }, 1500);

        // Hide buttons temporarily
        document.getElementById('fw-packet-buttons').style.display = 'none';
        setTimeout(function () {
            if (self.currentIndex < self.packets.length) {
                document.getElementById('fw-packet-buttons').style.display = 'flex';
            }
        }, 1500);
    },

    // Update the stats display
    updateStats() {
        document.getElementById('fw-allowed').textContent = this.allowedCount;
        document.getElementById('fw-blocked').textContent = this.blockedCount;
        document.getElementById('fw-correct').textContent = this.correctCount;
        document.getElementById('fw-remaining').textContent = this.packets.length - this.currentIndex;
    },

    // Simulation is complete
    finish() {
        this.isRunning = false;

        // Show completion message
        var passThreshold = Math.floor(this.totalPackets * 0.7); // 70% correct to pass
        var passed = this.correctCount >= passThreshold;

        var html = '<div class="result-card ' + (passed ? 'risk-low' : 'risk-high') + '">';
        html += '<span class="risk-badge">' + (passed ? 'SIMULATION PASSED' : 'SIMULATION FAILED') + '</span>';
        html += '<p style="color:#aab0cc;font-size:0.9rem;margin:10px 0;">You correctly handled ' + this.correctCount + ' out of ' + this.totalPackets + ' packets.</p>';

        if (passed) {
            html += '<p style="color:#44ff88;">Excellent! You followed the firewall security rules well. The network is protected.</p>';
        } else {
            html += '<p style="color:#ff8899;">You need at least ' + passThreshold + ' correct decisions to pass. Review the security rules and try again.</p>';
        }

        html += '<h4>Summary:</h4>';
        html += '<ul class="warning-list">';
        html += '<li class="safe">Allowed: ' + this.allowedCount + ' packets</li>';
        html += '<li>Blocked: ' + this.blockedCount + ' packets</li>';
        html += '<li class="info">Correct decisions: ' + this.correctCount + ' / ' + this.totalPackets + '</li>';
        html += '</ul>';

        html += '<div class="recommendations">';
        html += '<h5>Firewall Best Practices:</h5>';
        html += '<ul>';
        html += '<li>Allow traffic from trusted internal sources to known services.</li>';
        html += '<li>Block traffic from unknown or suspicious external sources.</li>';
        html += '<li>Block traffic to restricted ports commonly used by malware.</li>';
        html += '<li>Always verify both source and destination before allowing traffic.</li>';
        html += '<li>Review firewall logs regularly for unusual activity.</li>';
        html += '</ul>';
        html += '</div>';
        html += '</div>';

        document.getElementById('firewall-results').innerHTML = html;
        document.getElementById('fw-packet-buttons').style.display = 'none';
        document.getElementById('fw-start-btn').style.display = 'inline-block';
        document.getElementById('fw-start-btn').textContent = 'RESTART SIMULATION';

        // Reset packet info area
        document.getElementById('fw-packet-info').innerHTML = '<p>Simulation complete. Click RESTART to try again.</p>';

        // If passed and mission 4 was accepted, notify mission system
        if (passed && Game.state && Game.state.missions && Game.state.missions[4]) {
            if (Game.state.missions[4].status === 'accepted') {
                Missions.markToolUsed(4, Game.state);
            }
        }

        AudioManager.playMissionComplete();
    }
};
