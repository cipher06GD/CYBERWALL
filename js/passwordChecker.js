/* ============================================================
   passwordChecker.js
   TOOL 2: Password Strength Checker
   Checks password strength using rule-based analysis.
   IMPORTANT: Only for fictional demo passwords. Never enter real
   passwords. All analysis is done locally in the browser.
   ============================================================ */

const PasswordChecker = {
    // Common weak passwords that should never be used
    commonPasswords: [
        'password', '123456', '12345678', 'qwerty', 'abc123',
        'password123', 'iloveyou', 'admin', 'letmein', 'welcome',
        'monkey', 'dragon', 'master', '111111', '000000',
        'passw0rd', 'p@ssword', '12345', 'login', '1234567890'
    ],

    // Common keyboard patterns
    keyboardPatterns: [
        'qwerty', 'asdfgh', 'zxcvbn', 'qwertyuiop',
        '123456', '098765', '1qaz2wsx', 'qazwsx'
    ],

    // Load a sample password into the input
    loadSample(pwd) {
        document.getElementById('password-input').value = pwd;
        this.updateStrength();
        AudioManager.playClick();
    },

    // Toggle show/hide password
    toggleShow() {
        var input = document.getElementById('password-input');
        var btn = document.getElementById('pwd-show-btn');
        if (input.type === 'password') {
            input.type = 'text';
            btn.textContent = 'HIDE';
        } else {
            input.type = 'password';
            btn.textContent = 'SHOW';
        }
        AudioManager.playClick();
    },

    // Main analysis function, called on input change
    updateStrength() {
        var pwd = document.getElementById('password-input').value;
        var bar = document.getElementById('strength-bar');
        var label = document.getElementById('strength-label');
        var resultsDiv = document.getElementById('password-results');

        if (!pwd) {
            bar.style.width = '0%';
            bar.className = 'strength-bar';
            label.textContent = 'Enter a password';
            label.style.color = '#6677aa';
            resultsDiv.innerHTML = '';
            return;
        }

        var analysis = this.analyze(pwd);
        var score = analysis.score; // 0-100
        var level = analysis.level;

        // Update strength bar
        var pct = Math.min(score, 100);
        bar.style.width = pct + '%';

        // Update bar and label color
        var colorClass, labelText, labelColor;
        if (score < 25) {
            colorClass = 'strength-very-weak';
            labelText = 'VERY WEAK';
            labelColor = '#ff4444';
        } else if (score < 45) {
            colorClass = 'strength-weak';
            labelText = 'WEAK';
            labelColor = '#ff6644';
        } else if (score < 65) {
            colorClass = 'strength-medium';
            labelText = 'MEDIUM';
            labelColor = '#ffcc44';
        } else if (score < 85) {
            colorClass = 'strength-strong';
            labelText = 'STRONG';
            labelColor = '#44ff88';
        } else {
            colorClass = 'strength-very-strong';
            labelText = 'VERY STRONG';
            labelColor = '#00f0ff';
        }

        bar.className = 'strength-bar ' + colorClass;
        label.textContent = labelText;
        label.style.color = labelColor;

        // Build recommendations
        var recs = analysis.recommendations;
        var warnings = analysis.warnings;

        var html = '<div class="result-card ' + (score >= 65 ? 'risk-low' : score >= 40 ? 'risk-medium' : 'risk-high') + '">';
        html += '<span class="risk-badge">' + labelText + '</span>';
        html += '<p style="color:#aab0cc;font-size:0.85rem;margin:8px 0;">Strength Score: ' + Math.round(score) + ' / 100</p>';

        if (warnings.length > 0) {
            html += '<h4>Weaknesses Detected:</h4>';
            html += '<ul class="warning-list">';
            warnings.forEach(function (w) {
                html += '<li>' + w + '</li>';
            });
            html += '</ul>';
        } else {
            html += '<ul class="warning-list"><li class="safe"><strong>Good password!</strong> No major weaknesses detected.</li></ul>';
        }

        if (recs.length > 0) {
            html += '<div class="recommendations">';
            html += '<h5>Recommendations for a Stronger Password:</h5>';
            html += '<ul>';
            recs.forEach(function (r) {
                html += '<li>' + r + '</li>';
            });
            html += '</ul>';
            html += '</div>';
        }

        // Case status notice and mission integration
        var m2Status = Game.state && Game.state.missions && Game.state.missions[2] ? Game.state.missions[2].status : null;
        if (m2Status && m2Status !== 'accepted' && m2Status !== 'tool_completed' && m2Status !== 'completed') {
            html += '<div style="margin-top:10px;padding:8px;background:rgba(255,170,0,0.1);border:1px solid #ffaa0055;color:#ffcc66;border-radius:4px;font-size:0.82rem;">⚠️ Notice: Talk to the citizen first to accept the case.</div>';
        } else if (m2Status === 'accepted') {
            if (score >= 65) {
                html += '<div style="margin-top:10px;padding:8px;background:rgba(68,255,136,0.1);border:1px solid #44ff8855;color:#44ff88;border-radius:4px;font-size:0.82rem;">✅ Case 2 Verified: STRONG password achieved (' + Math.round(score) + '/100)! Return to Sarah with your findings.</div>';
            } else {
                html += '<div style="margin-top:10px;padding:8px;background:rgba(0,240,255,0.1);border:1px solid #00f0ff55;color:#c0e8ff;border-radius:4px;font-size:0.82rem;">💡 Active Case: Sarah\'s password needs to reach STRONG (65+). Current score: ' + Math.round(score) + '/100. Add uppercase, numbers, and symbols!</div>';
            }
        }

        html += '<p style="color:#555577;font-size:0.72rem;margin-top:8px;">This tool analyses passwords locally in your browser. No passwords are stored or transmitted. Only use fictional demo passwords.</p>';
        html += '</div>';

        resultsDiv.innerHTML = html;

        // Notify mission system ONLY when password reaches a STRONG score (score >= 65)
        if (score >= 65 && Game.state && Game.state.missions && Game.state.missions[2] && Game.state.missions[2].status === 'accepted') {
            Missions.markToolUsed(2, Game.state);
        }
    },

    // Analyse a password and return score, level, warnings, recommendations
    analyze(pwd) {
        var score = 0;
        var warnings = [];
        var recommendations = [];

        // --- Length scoring ---
        if (pwd.length < 8) {
            warnings.push('Password is too short (only ' + pwd.length + ' characters). Use at least 12 characters.');
            score += pwd.length * 2;
        } else if (pwd.length < 12) {
            warnings.push('Password could be longer. 12+ characters is recommended.');
            score += pwd.length * 4;
        } else if (pwd.length < 16) {
            score += 35;
        } else {
            score += 40;
        }

        // --- Character variety ---
        var hasLower = /[a-z]/.test(pwd);
        var hasUpper = /[A-Z]/.test(pwd);
        var hasNumber = /[0-9]/.test(pwd);
        var hasSymbol = /[^a-zA-Z0-9]/.test(pwd);

        var varietyCount = (hasLower ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSymbol ? 1 : 0);

        if (!hasUpper) { warnings.push('No uppercase letters. Mix UPPER and lower case.'); recommendations.push('Add uppercase letters (A-Z).'); }
        if (!hasLower) { warnings.push('No lowercase letters.'); recommendations.push('Add lowercase letters (a-z).'); }
        if (!hasNumber) { warnings.push('No numbers. Add digits for extra security.'); recommendations.push('Add numbers (0-9).'); }
        if (!hasSymbol) { warnings.push('No special characters. Symbols make passwords much harder to crack.'); recommendations.push('Add symbols (!, @, #, $, %, ^, &, *).'); }

        score += varietyCount * 8;

        // --- Common password check ---
        var lowerPwd = pwd.toLowerCase();
        var isCommon = this.commonPasswords.some(function (cp) {
            return lowerPwd === cp || lowerPwd.indexOf(cp) !== -1;
        });
        if (isCommon) {
            warnings.push('This password contains a commonly used password pattern. These are in every attacker\'s dictionary.');
            score -= 30;
        }

        // --- Keyboard pattern check ---
        var isPattern = this.keyboardPatterns.some(function (kp) {
            return lowerPwd.indexOf(kp) !== -1;
        });
        if (isPattern) {
            warnings.push('Keyboard pattern detected (e.g., qwerty, 123456). These are extremely easy to guess.');
            score -= 20;
        }

        // --- Repeated characters ---
        if (/(.)\1{2,}/.test(pwd)) {
            warnings.push('Repeated characters detected (e.g., aaa, 111). These reduce password strength.');
            score -= 5;
        }

        // --- Sequential characters ---
        var sequential = 0;
        for (var i = 0; i < pwd.length - 2; i++) {
            var c1 = pwd.charCodeAt(i);
            var c2 = pwd.charCodeAt(i + 1);
            var c3 = pwd.charCodeAt(i + 2);
            if ((c2 === c1 + 1 && c3 === c2 + 1) || (c2 === c1 - 1 && c3 === c2 - 1)) {
                sequential++;
            }
        }
        if (sequential > 2) {
            warnings.push('Sequential characters detected (e.g., abc, 123). Avoid sequences.');
            score -= 10;
        }

        // --- Bonus: long and varied ---
        if (pwd.length >= 16 && varietyCount === 4) {
            score += 15;
        }

        // Clamp score
        score = Math.max(0, Math.min(100, score));

        // General recommendations (always show for weaker passwords)
        if (score < 65) {
            if (recommendations.indexOf('Use at least 12 characters.') === -1 && pwd.length < 12) {
                recommendations.push('Use at least 12 characters.');
            }
            recommendations.push('Use a passphrase: combine 4 random words with numbers and symbols (e.g., Blue!Tiger#Rocket49).');
            recommendations.push('Use a different password for each account.');
            recommendations.push('Consider using a password manager to generate and store strong passwords.');
            recommendations.push('Enable Multi-Factor Authentication (MFA) for extra security.');
        }

        return { score: score, warnings: warnings, recommendations: recommendations };
    }
};
