/* ============================================================
   identityChecker.js
   TOOL 5: Identity Defender (Personal Data Privacy Audit)
   Educational tool for Mission 5 (Identity Theft Prevention).
   Players audit a social media verification form to identify
   which personal information is SAFE to share and which is
   Personally Identifiable Information (PII) that must stay PRIVATE.
   ============================================================ */

const IdentityChecker = {
    // Audit items in Maya's creator badge registration form
    items: [
        {
            id: 1,
            label: "Public Content Category",
            value: "Tech Reviews, Coding Tutorials & Gaming",
            isSafe: true,
            reason: "Public content topics and general hobbies are safe to share. They do not reveal sensitive identity details."
        },
        {
            id: 2,
            label: "Date of Birth",
            value: "14 August 2005",
            isSafe: false,
            reason: "Date of birth is sensitive Personally Identifiable Information (PII). Attackers use DOB to bypass security questions and impersonate you."
        },
        {
            id: 3,
            label: "Aadhaar / National ID Number",
            value: "XXXX-XXXX-9842 (Full 12-digit number requested)",
            isSafe: false,
            reason: "Aadhaar and national IDs should NEVER be shared on social media or unverified forms. It enables fraudulent bank accounts and SIM card issuance."
        },
        {
            id: 4,
            label: "Favorite Coding Language",
            value: "JavaScript & Python",
            isSafe: true,
            reason: "General preferences and tech interests are completely safe to share on public profiles."
        },
        {
            id: 5,
            label: "Mother's Maiden Name",
            value: "Kapoor",
            isSafe: false,
            reason: "Mother's maiden name is one of the most common security questions used for password and bank account recovery."
        },
        {
            id: 6,
            label: "Home Residential Address",
            value: "Flat 402, Cyber Heights, Sector 5",
            isSafe: false,
            reason: "Residential addresses expose citizens to physical stalking, spear phishing, and forged address proof scams."
        },
        {
            id: 7,
            label: "Phone Number Linked to Banking/2FA",
            value: "+91 98765 43210",
            isSafe: false,
            reason: "Sharing your primary banking/2FA phone number exposes you to SIM-swap attacks and fraudulent SMS phishing (smishing)."
        },
        {
            id: 8,
            label: "Public Social Media Handle",
            value: "@TechMayaOfficial",
            isSafe: true,
            reason: "Public usernames and social media handles are meant to be visible to followers."
        }
    ],

    // Player's current classifications: { itemId: 'safe' | 'private' }
    userChoices: {},

    // Initialize or render the form
    render() {
        var container = document.getElementById('identity-form-list');
        if (!container) return;

        var html = '';
        this.items.forEach(function (item) {
            var choice = IdentityChecker.userChoices[item.id] || '';
            html += '<div class="identity-item" id="id-item-' + item.id + '">';
            html += '<div class="identity-item-header">';
            html += '<span class="identity-item-label">' + item.label + '</span>';
            html += '<span class="identity-item-val">' + item.value + '</span>';
            html += '</div>';
            html += '<div class="identity-item-choices">';
            html += '<button type="button" class="choice-btn ' + (choice === 'safe' ? 'selected safe-selected' : '') + '" onclick="IdentityChecker.selectChoice(' + item.id + ', \'safe\')">&#10003; SAFE TO SHARE</button>';
            html += '<button type="button" class="choice-btn ' + (choice === 'private' ? 'selected private-selected' : '') + '" onclick="IdentityChecker.selectChoice(' + item.id + ', \'private\')">&#128274; KEEP PRIVATE (PII)</button>';
            html += '</div>';
            html += '<div class="identity-feedback" id="id-feedback-' + item.id + '" style="display:none;"></div>';
            html += '</div>';
        });

        container.innerHTML = html;
    },

    // Record user choice
    selectChoice(itemId, choice) {
        this.userChoices[itemId] = choice;
        this.render();
        AudioManager.playClick();
    },

    // Evaluate the player's classification
    audit() {
        // Check if all items classified
        var answeredCount = Object.keys(this.userChoices).length;
        if (answeredCount < this.items.length) {
            document.getElementById('identity-results').innerHTML =
                '<div class="result-card"><p style="color:#ffcc44;">Please classify all ' + this.items.length + ' information fields before submitting the audit.</p></div>';
            return;
        }

        AudioManager.playScan();

        var correctCount = 0;
        var total = this.items.length;
        var breakdown = [];

        this.items.forEach(function (item) {
            var userChoice = IdentityChecker.userChoices[item.id];
            var isCorrect = (item.isSafe && userChoice === 'safe') || (!item.isSafe && userChoice === 'private');
            if (isCorrect) correctCount++;

            breakdown.push({
                label: item.label,
                isCorrect: isCorrect,
                correctType: item.isSafe ? 'SAFE TO SHARE' : 'KEEP PRIVATE (PII)',
                reason: item.reason
            });

            // Update item styling in the form
            var fbEl = document.getElementById('id-feedback-' + item.id);
            if (fbEl) {
                fbEl.style.display = 'block';
                fbEl.className = 'identity-feedback ' + (isCorrect ? 'fb-correct' : 'fb-wrong');
                fbEl.innerHTML = (isCorrect ? '&#10003; Correct! ' : '&#10007; Incorrect! Must be ' + (item.isSafe ? 'SAFE' : 'PRIVATE') + '. ') + item.reason;
            }
        });

        var percentage = Math.round((correctCount / total) * 100);
        var passed = percentage >= 75; // 6 out of 8 required to pass

        var resultsDiv = document.getElementById('identity-results');
        var html = '<div class="result-card ' + (passed ? 'risk-low' : 'risk-high') + '">';
        html += '<span class="risk-badge">' + (passed ? 'AUDIT PASSED (' + percentage + '%)' : 'AUDIT FAILED (' + percentage + '%)') + '</span>';
        html += '<p style="color:#aab0cc;font-size:0.88rem;margin:10px 0;">You correctly classified ' + correctCount + ' out of ' + total + ' personal data fields.</p>';

        if (passed) {
            html += '<p style="color:#44ff88;">Outstanding work! You successfully identified sensitive PII that could lead to identity theft and account takeovers.</p>';
        } else {
            html += '<p style="color:#ff8899;">You need at least 75% accuracy (6/8) to pass. Review which fields contain sensitive PII and try again.</p>';
        }

        // Recommendations
        html += '<div class="recommendations">';
        html += '<h5>Identity Protection Best Practices:</h5>';
        html += '<ul>';
        html += '<li><strong>Never share Government IDs:</strong> Aadhaar, PAN, and passport numbers should only be entered on official, verified government portals.</li>';
        html += '<li><strong>Protect Security Question Answers:</strong> Mother\'s maiden name, childhood pets, and birth city are commonly used to reset passwords.</li>';
        html += '<li><strong>Masked Aadhaar:</strong> In India, you can download a "Masked Aadhaar" from uidai.gov.in which conceals the first 8 digits.</li>';
        html += '<li><strong>Report Identity Theft:</strong> If someone steals your identity or opens fraudulent accounts, immediately call <strong>1930</strong> or register a complaint at <strong>cybercrime.gov.in</strong>.</li>';
        html += '</ul>';
        html += '</div>';

        // Check Mission 5 status
        var m5Status = Game.state && Game.state.missions && Game.state.missions[5] ? Game.state.missions[5].status : null;
        if (m5Status && m5Status !== 'accepted' && m5Status !== 'tool_completed' && m5Status !== 'completed') {
            html += '<div style="margin-top:10px;padding:8px;background:rgba(255,170,0,0.1);border:1px solid #ffaa0055;color:#ffcc66;border-radius:4px;font-size:0.82rem;">⚠️ Notice: Talk to the citizen first to accept the case.</div>';
            if (typeof Game.showNotification === 'function') {
                Game.showNotification('Talk to the citizen first to accept the case');
            }
        } else if (m5Status === 'accepted') {
            if (passed) {
                html += '<div style="margin-top:10px;padding:8px;background:rgba(68,255,136,0.1);border:1px solid #44ff8855;color:#44ff88;border-radius:4px;font-size:0.82rem;">✅ Case 5 Verified: Identity audit complete! Return to Maya to report your findings.</div>';
                Missions.markToolUsed(5, Game.state);
            } else {
                html += '<div style="margin-top:10px;padding:8px;background:rgba(0,240,255,0.1);border:1px solid #00f0ff55;color:#c0e8ff;border-radius:4px;font-size:0.82rem;">💡 Active Case: Fix incorrect classifications to reach 75%+ and protect Maya from identity theft!</div>';
            }
        }

        html += '</div>';
        resultsDiv.innerHTML = html;

        if (passed) {
            AudioManager.playSuccess();
        } else {
            AudioManager.playWarning();
        }
    },

    // Reset choices
    reset() {
        this.userChoices = {};
        this.render();
        document.getElementById('identity-results').innerHTML = '';
        AudioManager.playClick();
    }
};
