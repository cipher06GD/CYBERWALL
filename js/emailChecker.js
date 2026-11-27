/* ============================================================
   emailChecker.js
   TOOL 1: Phishing Email Detector
   Rule-based email analysis with a clear FAKE / REAL verdict.
   Paste any email and click ANALYSE to check if it is a
   phishing (fake) email or a legitimate (real) one.
   ============================================================ */

const EmailChecker = {
    // Six demonstration emails (mix of real and fake)
    samples: [
        // Sample 0: Normal school announcement (REAL / LOW RISK)
        {
            from: 'principal@delhipublicschool.edu.in',
            subject: 'Annual Day Function - Schedule',
            body: 'Dear Students and Parents,\n\nThe Annual Day Function will be held on 20th December at 5 PM in the school auditorium. Students participating in the cultural programme should report by 4 PM.\n\nPlease note the date and time. There is no fee for attending.\n\nBest regards,\nPrincipal Sharma\nDelhi Public School'
        },
        // Sample 1: Suspicious bank verification email (FAKE / HIGH RISK)
        // This is Alex's case - used for Mission 1
        {
            from: 'security@sb1-verify-online.net',
            subject: 'URGENT: Your Account Will Be Blocked in 24 Hours!',
            body: 'Dear Customer,\n\nYour bank account has been flagged for security reasons. You must verify your identity immediately or your account will be permanently blocked within 24 hours.\n\nTo prevent suspension, please share your OTP, account password, and debit card details by replying to this email or clicking the link below:\n\nhttp://sb1-secure-verify-online.net/login\n\nDo not ignore this message. Act now!\n\nRegards,\nState Bank Verification Team'
        },
        // Sample 2: Fake lottery winning email (FAKE / HIGH RISK)
        {
            from: 'lottery@microsoft-intl-promo-claim.xyz',
            subject: 'CONGRATULATIONS! You Have Won $1,000,000 USD',
            body: 'Dear Lucky Winner,\n\nCongratulations! Your email address has been selected in the Microsoft International Lottery Promotion 2025. You have won the sum of $1,000,000 USD.\n\nTo claim your prize, please send the following information immediately:\n- Full name and address\n- Phone number\n- Bank account details for transfer\n- A processing fee of $500 (refundable)\n\nReply to this email within 48 hours or your prize will be forfeited.\n\nClaim Agent: Mr. John Doe\nEmail: claims@microsft-lotto-promo.xyz\n\nCongratulations once again!'
        },
        // Sample 3: Fake job offer / work-from-home scam (FAKE / HIGH RISK)
        {
            from: 'hr@amazon-careers-jobs-online.top',
            subject: 'Work From Home Job Offer - Earn Rs. 50,000/week',
            body: 'Dear Applicant,\n\nCongratulations! You have been selected for a Work From Home Data Entry position at Amazon. You can earn Rs. 50,000 per week working just 2 hours a day from home.\n\nTo confirm your offer, please pay a one-time registration fee of Rs. 2,500 via UPI to upi-id@amaz0njobs.\n\nAfter payment, send us your Aadhaar card copy, PAN card copy, and bank account details for salary transfer.\n\nThis is a limited time offer. Confirm immediately!\n\nHR Department\nAmazon Careers'
        },
        // Sample 4: Legitimate Amazon order confirmation (REAL / LOW RISK)
        {
            from: 'auto-confirm@amazon.in',
            subject: 'Your Amazon.in Order #112-5547203-8861942',
            body: 'Dear Customer,\n\nThank you for your order. Your order has been confirmed and is being processed.\n\nOrder Details:\n- JBL Bluetooth Headphones - Rs. 2,499\n- Order Total: Rs. 2,499\n- Payment Method: Credit Card ending in 4521\n- Estimated Delivery: 3-5 business days\n\nYou can track your order at https://www.amazon.in/your-orders\n\nIf you did not place this order, please contact customer service through your Amazon account.\n\nThank you for shopping at Amazon.in'
        },
        // Sample 5: Tech support scam (FAKE / HIGH RISK)
        {
            from: 'support@microsoft-windows-security-alert.click',
            subject: 'CRITICAL ALERT: Virus Detected on Your Computer!',
            body: 'Dear User,\n\nOur security system has detected 3 viruses and 7 malware threats on your computer. Your Windows license has expired and your system is at risk.\n\nImmediate action required! Your computer will be locked permanently if you do not respond within 2 hours.\n\nClick the link below to download the Microsoft Security Tool and remove all threats:\nhttp://bit.ly/windows-security-fix-now\n\nOr call our toll-free number: +1-800-555-0199\n\nDo not restart your computer. Act immediately!\n\nMicrosoft Windows Security Team'
        }
    ],

    // Load a sample email into the text area
    loadSample(index) {
        var s = this.samples[index];
        var text = 'From: ' + s.from + '\n' +
                   'Subject: ' + s.subject + '\n\n' +
                   s.body;
        document.getElementById('email-input').value = text;
        AudioManager.playClick();
    },

    // Analyse the email in the text area
    analyze() {
        var rawText = document.getElementById('email-input').value.trim();
        if (!rawText) {
            this.showResult('Please enter or load an email first.', 'error');
            return;
        }

        AudioManager.playScan();

        var indicators = [];
        var riskScore = 0;

        // ===== EXISTING RULES (kept from original) =====

        // --- Rule 1: Urgent or threatening language ---
        var urgentPatterns = /\b(urgent|immediately|within 24 hours|act now|do not ignore|will be blocked|suspended|permanently|forfeited|deadline|within 2 hours|do not restart)\b/i;
        if (urgentPatterns.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Urgent or threatening language detected. Scammers create a false sense of urgency to make you act without thinking.'
            });
            riskScore += 20;
        }

        // --- Rule 2: Requests for OTP ---
        if (/\bOTP\b/i.test(rawText) || /one.time.password/i.test(rawText) || /one time password/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Request for OTP detected. Legitimate organisations NEVER ask for your OTP through email.'
            });
            riskScore += 25;
        }

        // --- Rule 3: Requests for passwords ---
        if (/password/i.test(rawText) && /(share|send|provide|enter|confirm|verify).{0,30}password/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Request for password detected. No genuine bank or organisation will ever ask for your password by email.'
            });
            riskScore += 25;
        }

        // --- Rule 4: Requests for bank/card details ---
        if (/\b(debit card|credit card|card details|bank account|account number|cvv|pin)\b/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Request for sensitive financial information detected. Legitimate institutions do not ask for card or account details via email.'
            });
            riskScore += 20;
        }

        // --- Rule 5: Suspicious sender address ---
        var fromMatch = rawText.match(/From:\s*(\S+)/i);
        var senderDomain = '';
        if (fromMatch) {
            senderDomain = fromMatch[1].split('@')[1] || '';

            // Suspicious TLDs
            if (/\.(xyz|top|click|loan|work|date|review|country|stream|guru|buzz)$/.test(senderDomain)) {
                indicators.push({
                    type: 'warning',
                    text: 'Suspicious email domain: ' + senderDomain + ' uses a TLD commonly used in spam and scams.'
                });
                riskScore += 15;
            }
            // Misspelled brand names
            if (/sb1|microsft|microsoft-intl|amaz0n|g00gle|paypa1/i.test(senderDomain)) {
                indicators.push({
                    type: 'warning',
                    text: 'Sender domain appears to impersonate a known brand but uses misspellings or extra words: ' + senderDomain
                });
                riskScore += 20;
            }
            // Too many subdomain levels
            var dotCount = (senderDomain.match(/\./g) || []).length;
            if (dotCount > 2) {
                indicators.push({
                    type: 'warning',
                    text: 'Sender domain has an unusual number of sub-levels: ' + senderDomain + '. This is common in phishing emails.'
                });
                riskScore += 10;
            }
            // Free webmail used for "official" communication
            if (/\b(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com)\b/i.test(senderDomain) &&
                /\b(bank|amazon|microsoft|government|official|security|support|hr)\b/i.test(rawText)) {
                indicators.push({
                    type: 'warning',
                    text: 'Email claims to be from an organisation but uses a free webmail address (' + senderDomain + '). Legitimate companies use their own domains.'
                });
                riskScore += 15;
            }
        }

        // --- Rule 6: Suspicious URLs in the body ---
        var urlPattern = /(https?:\/\/[^\s\n]+)/gi;
        var urls = rawText.match(urlPattern) || [];
        urls.forEach(function (url) {
            // IP address URLs
            if (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(url)) {
                indicators.push({
                    type: 'warning',
                    text: 'URL contains an IP address instead of a domain name: ' + url + ' This is a common phishing tactic.'
                });
                riskScore += 15;
            }
            // Misspelled brand names in URL
            if (/sb1-|amaz0n|microsft|g00gle|paypa1/i.test(url)) {
                indicators.push({
                    type: 'warning',
                    text: 'URL contains a misspelled brand name: ' + url + ' Scammers replace letters with numbers (e.g., 0 for o, 1 for l).'
                });
                riskScore += 15;
            }
            // No HTTPS
            if (/^http:\/\//i.test(url) && !/^https:\/\//i.test(url)) {
                indicators.push({
                    type: 'info',
                    text: 'URL uses unencrypted HTTP instead of HTTPS: ' + url
                });
                riskScore += 5;
            }
            // Shortened / redirect URLs
            if (/(bit\.ly|tinyurl|t\.co|goo\.gl|shorte\.st|ow\.ly|is\.gd)/i.test(url)) {
                indicators.push({
                    type: 'warning',
                    text: 'Shortened URL detected: ' + url + ' Shortened links hide the real destination and are commonly used in phishing.'
                });
                riskScore += 10;
            }
        });

        // --- Rule 7: Prize / lottery claims ---
        if (/\b(lottery|won|winner|prize|jackpot|congratulations.{0,20}won|claim your)\b/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Unexpected prize or lottery winning claim. You cannot win a lottery you never entered. This is a classic scam.'
            });
            riskScore += 20;
        }

        // --- Rule 8: Processing / registration fee request ---
        if (/\b(processing fee|claim fee|transfer fee|refundable fee|registration fee|one.time fee)\b/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Request for a processing or registration fee. Real organisations and lotteries never ask for fees to release prizes or confirm job offers.'
            });
            riskScore += 15;
        }

        // --- Rule 9: Generic greeting ---
        if (/\b(dear customer|dear user|dear winner|dear lucky|dear applicant|dear sir)\b/i.test(rawText)) {
            indicators.push({
                type: 'info',
                text: 'Generic greeting used instead of your name. Legitimate organisations usually address you by your registered name.'
            });
            riskScore += 5;
        }

        // ===== NEW RULES (added for enhanced detection) =====

        // --- Rule 10: Request for government ID / PII ---
        if (/\b(aadhaar|aadhar|pan card|pan number|ssn|social security|passport number|voter id)\b/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Request for government ID or personally identifiable information. Never share Aadhaar, PAN, or passport details via email.'
            });
            riskScore += 20;
        }

        // --- Rule 11: Request for mother's maiden name / security answers ---
        if (/\b(mother'?s maiden name|security question|secret answer|first school|first pet)\b/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Request for security question answers. This information can be used to reset your passwords and take over accounts.'
            });
            riskScore += 15;
        }

        // --- Rule 12: Gift card request ---
        if (/\b(gift card|google play card|itunes card|steam card|amazon gift|playstore card)\b/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Request for gift cards as payment. This is a well-known scam tactic. No legitimate organisation asks for gift card payments.'
            });
            riskScore += 20;
        }

        // --- Rule 13: Suspicious file attachments ---
        if (/\b\.(exe|scr|bat|com|js|jar|dll|vbs|msi)\b/i.test(rawText) || /attachment.{0,20}(download|open|open the attached)/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Mention of a suspicious file attachment or download. Opening attachments from unknown senders can install malware on your device.'
            });
            riskScore += 15;
        }

        // --- Rule 14: "Confirm your identity" / "verify your account" ---
        if (/(confirm your identity|verify your account|update your information|re-?verify|validate your account)/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Request to "verify" or "confirm" your identity. Phishing emails use this to trick you into entering credentials on fake pages.'
            });
            riskScore += 10;
        }

        // --- Rule 15: Too good to be true offers ---
        if (/\b(earn (rs\.?|\$|₹)\s*\d[\d,]*\s*(per|\/)\s*(week|day|hour|month)|work from home.{0,30}(earn|income|salary)|guaranteed income|easy money|passive income)\b/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Too-good-to-be-true income offer detected. Scammers lure victims with unrealistic earnings for minimal work.'
            });
            riskScore += 15;
        }

        // --- Rule 16: UPI / payment to personal ID ---
        if (/\b(upi|paytm|google pay|phonepe|bhim)\b/i.test(rawText) && /\b(pay (to|at)|transfer|send).{0,20}(upi|@|id)\b/i.test(rawText)) {
            indicators.push({
                type: 'warning',
                text: 'Request for payment to a UPI / digital wallet ID. Legitimate organisations use official payment gateways, not personal UPI IDs.'
            });
            riskScore += 15;
        }

        // --- Rule 17: Toll-free / suspicious phone numbers ---
        if (/\+1-\d{3}-\d{3}-\d{4}|\b1-800-\d{3}-\d{4}\b/i.test(rawText) || /call (us|our|this|the) (toll.?free|helpline|number)/i.test(rawText)) {
            indicators.push({
                type: 'info',
                text: 'Email includes a phone number to call. Fake tech support scams use this to trick you into paying for unnecessary services.'
            });
            riskScore += 5;
        }

        // --- Determine risk level (kept same thresholds for mission compatibility) ---
        var riskLevel, riskClass, riskDesc, verdict, verdictClass;
        if (riskScore >= 50) {
            riskLevel = 'HIGH RISK';
            riskClass = 'risk-high';
            riskDesc = 'This email shows multiple strong indicators of being a phishing or scam attempt.';
            verdict = 'PHISHING EMAIL DETECTED';
            verdictClass = 'verdict-fake';
        } else if (riskScore >= 25) {
            riskLevel = 'MEDIUM RISK';
            riskClass = 'risk-medium';
            riskDesc = 'This email shows some suspicious indicators. Be cautious and verify the sender through official channels.';
            verdict = 'SUSPICIOUS EMAIL';
            verdictClass = 'verdict-suspicious';
        } else {
            riskLevel = 'LOW RISK';
            riskClass = 'risk-low';
            riskDesc = 'No strong phishing indicators detected. However, this does NOT guarantee the email is genuine.';
            verdict = 'LIKELY LEGITIMATE';
            verdictClass = 'verdict-real';
        }

        // If no warnings at all, add a safe note
        if (indicators.length === 0) {
            indicators.push({
                type: 'safe',
                text: 'No suspicious patterns were detected by the automated rules. This email appears to follow normal communication patterns.'
            });
        }

        this.displayResult(riskLevel, riskClass, riskDesc, verdict, verdictClass, indicators, riskScore, rawText);

        // ===== MISSION 1 INTEGRATION (unchanged) =====
        var isAlexCase = /sb1-verify-online/i.test(rawText) || (/bank account has been flagged/i.test(rawText) && /OTP/i.test(rawText));
        var m1Status = Game.state && Game.state.missions && Game.state.missions[1] ? Game.state.missions[1].status : null;

        if (m1Status && m1Status !== 'accepted' && m1Status !== 'tool_completed' && m1Status !== 'completed') {
            if (typeof Game.showNotification === 'function') {
                Game.showNotification('Talk to the citizen first to accept the case');
            }
        } else if (m1Status === 'accepted') {
            if (isAlexCase && riskLevel === 'HIGH RISK') {
                Missions.markToolUsed(1, Game.state);
            }
        }
    },

    // Display the analysis result with a clear FAKE / REAL verdict
    displayResult(riskLevel, riskClass, riskDesc, verdict, verdictClass, indicators, score, rawText) {
        var html = '<div class="result-card ' + riskClass + '">';

        // ---- Big verdict banner ----
        html += '<div class="email-verdict ' + verdictClass + '">';
        html += '<span class="verdict-icon">' + (verdictClass === 'verdict-fake' ? '\u26D4' : verdictClass === 'verdict-real' ? '\u2705' : '\u26A0') + '</span> ';
        html += '<span class="verdict-text">VERDICT: ' + verdict + '</span>';
        html += '</div>';

        // ---- Risk badge + description ----
        html += '<span class="risk-badge">' + riskLevel + '</span>';
        html += '<p style="color:#aab0cc;font-size:0.85rem;margin:8px 0;">' + riskDesc + '</p>';

        if (verdictClass === 'verdict-fake') {
            html += '<p style="color:#ff8899;font-size:0.9rem;font-weight:bold;">This is a FAKE email. Do not respond, click any links, or share any information.</p>';
        } else if (verdictClass === 'verdict-real') {
            html += '<p style="color:#88ddaa;font-size:0.9rem;font-weight:bold;">This email appears REAL. However, always stay alert and verify if anything seems unusual.</p>';
        } else {
            html += '<p style="color:#ffcc66;font-size:0.9rem;font-weight:bold;">This email is SUSPICIOUS. Verify the sender through official channels before taking any action.</p>';
        }

        // ---- Detected indicators ----
        html += '<h4>Detected Indicators (' + indicators.length + '):</h4>';
        html += '<ul class="warning-list">';
        indicators.forEach(function (ind) {
            var cls = ind.type === 'safe' ? 'safe' : (ind.type === 'info' ? 'info' : '');
            html += '<li class="' + cls + '">' + ind.text + '</li>';
        });
        html += '</ul>';

        // ---- Recommendations ----
        html += '<div class="recommendations">';
        html += '<h5>Safety Recommendations:</h5>';
        html += '<ul>';
        html += '<li>Never share OTPs, passwords, PINs, or card details via email or phone.</li>';
        html += '<li>Do not click links in suspicious emails. Type the official website address directly in your browser.</li>';
        html += '<li>Verify the sender by contacting the organisation through their official phone number or website.</li>';
        html += '<li>Never pay fees, gift cards, or UPI transfers to claim prizes or confirm job offers.</li>';
        html += '<li>Check the sender email address carefully for misspellings or unusual domains.</li>';
        html += '<li>Report phishing emails. In India, call the Cyber Crime Helpline at 1930 or visit cybercrime.gov.in.</li>';
        html += '<li>Remember: this tool uses rule-based checks. It cannot definitively prove an email is genuine or fraudulent.</li>';
        html += '</ul>';
        html += '</div>';

        // ---- Mission 1 case status ----
        var isAlex = rawText && (/sb1-verify-online/i.test(rawText) || (/bank account has been flagged/i.test(rawText) && /OTP/i.test(rawText)));
        var m1 = Game.state && Game.state.missions && Game.state.missions[1] ? Game.state.missions[1].status : null;
        if (m1 && m1 !== 'accepted' && m1 !== 'tool_completed' && m1 !== 'completed') {
            html += '<div style="margin-top:10px;padding:8px;background:rgba(255,170,0,0.1);border:1px solid #ffaa0055;color:#ffcc66;border-radius:4px;font-size:0.82rem;">\u26A0\uFE0F Notice: Talk to the citizen first to accept the case.</div>';
        } else if (m1 === 'accepted' && !isAlex) {
            html += '<div style="margin-top:10px;padding:8px;background:rgba(0,240,255,0.1);border:1px solid #00f0ff55;color:#c0e8ff;border-radius:4px;font-size:0.82rem;">\uD83D\uDCA1 Active Case: Alex needs you to analyse the bank email asking for his OTP (Sample 2). Analyse Alex\'s email to complete the case!</div>';
        } else if (m1 === 'accepted' && isAlex && riskLevel === 'HIGH RISK') {
            html += '<div style="margin-top:10px;padding:8px;background:rgba(68,255,136,0.1);border:1px solid #44ff8855;color:#44ff88;border-radius:4px;font-size:0.82rem;">\u2705 Case 1 Verified: Phishing scam confirmed as FAKE! Return to Alex with your findings.</div>';
        }

        html += '<p style="color:#555577;font-size:0.75rem;margin-top:8px;">Automated risk score: ' + score + ' (higher = more suspicious)</p>';
        html += '</div>';

        document.getElementById('email-results').innerHTML = html;
    },

    // Show an error message
    showResult(msg, type) {
        document.getElementById('email-results').innerHTML =
            '<div class="result-card"><p style="color:#ff4466;">' + msg + '</p></div>';
    },

    // Clear the input and results
    clear() {
        document.getElementById('email-input').value = '';
        document.getElementById('email-results').innerHTML = '';
        AudioManager.playClick();
    }
};
