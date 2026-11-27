/* ============================================================
   urlChecker.js
   TOOL 3: Fake Website & Phishing Link Detector
   Paste any real-life URL/link and click ANALYSE to check if
   it is a phishing (fake) link or a legitimate (real) one.
   Does NOT open submitted URLs. Pure rule-based analysis.
   ============================================================ */

const UrlChecker = {
    // Sample URLs for demonstration (mix of real and fake)
    samples: [
        // Sample 0: Legitimate Amazon India (REAL / LOW RISK)
        'https://www.amazon.in/shopping',
        // Sample 1: Fake Amazon with misspelling - David's case (FAKE / HIGH RISK)
        'http://www.amaz0n-mega-sale-deals.net/buy?phone=999',
        // Sample 2: IP-address URL (FAKE / HIGH RISK)
        'http://192.168.43.15/login.php',
        // Sample 3: Shortened URL (SUSPICIOUS / MEDIUM RISK)
        'https://bit.ly/3xK9mP',
        // Sample 4: @ trick phishing - real domain hidden (FAKE / HIGH RISK)
        'https://www.google.com@secure-verify-account.tk/login',
        // Sample 5: Legitimate bank website (REAL / LOW RISK)
        'https://www.onlinesbi.sbi/',
        // Sample 6: Fake bank with subdomain trick (FAKE / HIGH RISK)
        'https://sbi-online-secure-verify.xyz/netbanking/login',
        // Sample 7: Free hosting phishing page (FAKE / HIGH RISK)
        'https://my-free-gift-card-claim.blogspot.com/'
    ],

    // Known legitimate domains for comparison
    legitDomains: [
        'amazon.in', 'amazon.com', 'flipkart.com', 'google.com',
        'microsoft.com', 'apple.com', 'github.com', 'wikipedia.org',
        'instagram.com', 'facebook.com', 'youtube.com', 'onlinesbi.sbi',
        'hdfcbank.com', 'icicibank.com', 'axisbank.com', 'irctc.co.in'
    ],

    // Known URL shortener services
    shorteners: ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly', 'shorte.st', 'cutt.ly'],

    // Free hosting domains often abused for phishing
    freeHosts: ['blogspot.com', 'weebly.com', 'wixsite.com', 'wordpress.com', 'github.io', 'surge.sh', 'netlify.app', 'repl.co'],

    // Load a sample URL
    loadSample(index) {
        document.getElementById('url-input').value = this.samples[index];
        AudioManager.playClick();
    },

    // Main analysis - paste any URL and check if it's phishing or real
    analyze() {
        var url = document.getElementById('url-input').value.trim();
        if (!url) {
            this.showResult('Please enter a URL to analyse.');
            return;
        }

        AudioManager.playScan();

        var indicators = [];
        var riskScore = 0;

        // --- Parse the URL ---
        var domain = '';
        var protocol = '';
        var protocolMatch = url.match(/^(https?):\/\//i);
        if (protocolMatch) {
            protocol = protocolMatch[1].toLowerCase();
            domain = url.substring(protocol.length + 3); // skip "https://"
        } else {
            domain = url;
        }

        // Check for @ symbol trick before extracting domain
        var hasAtTrick = domain.indexOf('@') !== -1;

        // Strip path, query, fragment
        var slashIdx = domain.indexOf('/');
        if (slashIdx !== -1) domain = domain.substring(0, slashIdx);
        domain = domain.toLowerCase();

        // Strip port
        var portMatch = domain.match(/:(\d+)$/);
        var port = portMatch ? portMatch[1] : '';
        var colonIdx = domain.indexOf(':');
        if (colonIdx !== -1) domain = domain.substring(0, colonIdx);

        // If @ trick present, the real domain is AFTER the @
        if (hasAtTrick) {
            var atIdx = domain.indexOf('@');
            var fakePart = domain.substring(0, atIdx);
            domain = domain.substring(atIdx + 1);
        }

        // --- Rule 1: IP address as domain ---
        var ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipPattern.test(domain)) {
            indicators.push({
                type: 'warning',
                text: 'This URL uses an IP address (' + domain + ') instead of a domain name. Legitimate websites almost always use domain names (e.g., amazon.com). This is a common phishing technique.'
            });
            riskScore += 35;
        }

        // --- Rule 2: No HTTPS ---
        if (protocol !== 'https') {
            indicators.push({
                type: 'warning',
                text: 'This URL does NOT use HTTPS. The connection is not encrypted, meaning data sent to this site could be intercepted. Legitimate shopping and banking sites always use HTTPS.'
            });
            riskScore += 15;
        } else {
            indicators.push({
                type: 'info',
                text: 'This URL uses HTTPS. However, remember: HTTPS only means the connection is encrypted. It does NOT guarantee the website is trustworthy. Scammers can also get HTTPS certificates.'
            });
        }

        // --- Rule 3: @ symbol trick (hides real domain) ---
        if (hasAtTrick) {
            indicators.push({
                type: 'warning',
                text: 'This URL contains an "@" symbol. Everything before "@" is ignored by the browser. The real domain is "' + domain + '", not "' + fakePart + '". Scammers use this to make you think you are visiting a trusted site.'
            });
            riskScore += 30;
        }

        // --- Rule 4: Embedded credentials (user:pass@domain) ---
        if (/[^\s]+:[^\s]+@/.test(url)) {
            indicators.push({
                type: 'warning',
                text: 'This URL contains embedded login credentials (user:password@). This technique is used to confuse users and hide the real destination.'
            });
            riskScore += 20;
        }

        // --- Rule 5: Non-standard port ---
        if (port && port !== '80' && port !== '443') {
            indicators.push({
                type: 'warning',
                text: 'This URL uses a non-standard port (:' + port + '). Legitimate websites typically use standard ports (80 for HTTP, 443 for HTTPS). Non-standard ports may indicate a malicious server.'
            });
            riskScore += 15;
        }

        // --- Rule 6: Punycode / IDN homograph attack ---
        if (domain.indexOf('xn--') !== -1) {
            indicators.push({
                type: 'warning',
                text: 'This domain uses Punycode (xn-- prefix), which encodes non-ASCII characters. Scammers use look-alike characters from other languages to create fake domains that appear identical to real ones (e.g., using Cyrillic "a" instead of Latin "a").'
            });
            riskScore += 30;
        }

        // --- Rule 7: Misspelled domain names and digit-for-letter swaps ---
        var misspelledPatterns = [
            { pattern: /amaz0n/, real: 'amazon', text: 'Domain contains "amaz0n" - digit "0" swapped for letter "o". This is a classic look-alike domain used to trick shoppers.' },
            { pattern: /g00gle/, real: 'google', text: 'Domain contains "g00gle" - letters "oo" replaced with zeros "00". Used to impersonate Google.' },
            { pattern: /microsft/, real: 'microsoft', text: 'Domain contains "microsft" - missing the second "o" in Microsoft. Used to impersonate Microsoft.' },
            { pattern: /paypa1/, real: 'paypal', text: 'Domain contains "paypa1" - digit "1" swapped for letter "l". Used to impersonate PayPal.' },
            { pattern: /faceb00k/, real: 'facebook', text: 'Domain contains "faceb00k" - letters "oo" replaced with zeros. Used to impersonate Facebook.' },
            { pattern: /flipkrt/, real: 'flipkart', text: 'Domain contains "flipkrt" - missing the "a" in Flipkart. Used to impersonate Flipkart.' },
            { pattern: /instagra[mn]/, real: 'instagram', text: 'Domain contains a misspelling of "instagram". Used to impersonate Instagram.' },
            { pattern: /netfl[1i]x/, real: 'netflix', text: 'Domain contains a misspelling of "netflix". Used to impersonate Netflix.' }
        ];
        var foundMisspelling = false;
        misspelledPatterns.forEach(function (m) {
            if (m.pattern.test(domain)) {
                indicators.push({ type: 'warning', text: m.text });
                riskScore += 30;
                foundMisspelling = true;
            }
        });

        // --- Rule 8: Hyphenated brand names ---
        var hyphenBrandPattern = /(amaz[0o]n|google|g[0o]{2}gle|paypal|paypa[l1]|flipkart|apple|microsoft|sbi|bank|netflix|instagram)-[a-z0-9-]+/i;
        if (hyphenBrandPattern.test(domain)) {
            indicators.push({
                type: 'warning',
                text: 'Hyphenated brand name detected in domain. Scammers attach words like "-deals", "-verify", or "-login" to a brand name to mislead users.'
            });
            riskScore += 25;
        }

        // --- Rule 9: Promotional / shopping scam keywords in domain ---
        var promoKeywordPattern = /(mega-sale|deals?|discounts?|cheap|offers?|flash-sale|sale-deals|super-sale|buy999|phone999|free-gift|gift-card|claim)/i;
        if (promoKeywordPattern.test(domain)) {
            indicators.push({
                type: 'warning',
                text: 'Promotional buzzwords ("mega-sale", "deals", "free-gift") detected in domain. Fake websites frequently use exaggerated keywords in the URL.'
            });
            riskScore += 20;
        }

        // --- Rule 10: Suspicious TLDs ---
        var scamTLDs = /\.(xyz|top|click|loan|work|date|review|country|stream|gq|tk|ml|cf|ga|buzz|icu|rest|live)$/;
        var retailMismatchTLDs = /\.(net|info|biz|site|online)$/;
        if (scamTLDs.test(domain)) {
            indicators.push({
                type: 'warning',
                text: 'Domain uses a TLD (.' + domain.split('.').pop() + ') commonly associated with disposable scam websites. Major brands do not use these extensions.'
            });
            riskScore += 20;
        } else if (retailMismatchTLDs.test(domain) && (foundMisspelling || hyphenBrandPattern.test(domain) || promoKeywordPattern.test(domain))) {
            indicators.push({
                type: 'warning',
                text: 'Unusual TLD (.' + domain.split('.').pop() + ') for a known brand. Major retailers operate on official domains like .in or .com, not .net or .online.'
            });
            riskScore += 15;
        }

        // --- Rule 11: Excessive subdomains ---
        var dotCount = (domain.match(/\./g) || []).length;
        if (dotCount > 2 && !ipPattern.test(domain)) {
            indicators.push({
                type: 'warning',
                text: 'This domain has ' + dotCount + ' levels (e.g., ' + domain + '). Legitimate sites rarely use this many subdomains. Scammers add keywords like "secure", "login", "verify" to fake legitimacy.'
            });
            riskScore += 15;
        }

        // --- Rule 12: Brand name in wrong position (subdomain, not main domain) ---
        var brandWords = ['amazon', 'flipkart', 'google', 'microsoft', 'apple', 'paypal', 'facebook', 'instagram', 'sbi', 'bank', 'netflix', 'irctc'];
        brandWords.forEach(function (brand) {
            if (domain.indexOf(brand) !== -1) {
                var parts = domain.split('.');
                var mainDomain = parts.length >= 2 ? parts[parts.length - 2] + '.' + parts[parts.length - 1] : domain;
                if (mainDomain.indexOf(brand) === -1) {
                    indicators.push({
                        type: 'warning',
                        text: 'The brand name "' + brand + '" appears in a subdomain, not the main domain. The real domain is "' + domain.split('.').slice(-2).join('.') + '". This is a technique to impersonate trusted brands.'
                    });
                    riskScore += 20;
                }
            }
        });

        // --- Rule 13: URL shorteners ---
        var isShortened = this.shorteners.some(function (s) {
            return domain === s || domain.indexOf(s) !== -1;
        });
        if (isShortened) {
            indicators.push({
                type: 'warning',
                text: 'This URL uses a URL shortener (' + domain + '). Shorteners hide the real destination. While they have legitimate uses, scammers use them to hide malicious URLs. Always preview shortened links before clicking.'
            });
            riskScore += 25;
        }

        // --- Rule 14: Free hosting domains ---
        var isFreeHost = this.freeHosts.some(function (fh) {
            return domain.indexOf(fh) !== -1;
        });
        if (isFreeHost) {
            indicators.push({
                type: 'warning',
                text: 'This URL is hosted on a free website platform (' + domain + '). Scammers create phishing pages on free hosting services because they are easy to set up and hard to trace. Legitimate banks and companies do not use free hosting.'
            });
            riskScore += 25;
        }

        // --- Rule 15: Suspicious query parameters ---
        if (/[?&](redirect|url|goto|next|return|callback|token|session|sid)=/i.test(url)) {
            indicators.push({
                type: 'warning',
                text: 'URL contains redirect or session parameters. These can be used to redirect you to a malicious site after you land on a legitimate-looking page.'
            });
            riskScore += 10;
        }

        // --- Rule 16: Excessive URL length ---
        if (url.length > 150) {
            indicators.push({
                type: 'info',
                text: 'This URL is unusually long (' + url.length + ' characters). Scammers sometimes use very long URLs with random strings to hide the real destination or evade filters.'
            });
            riskScore += 5;
        }

        // --- Rule 17: Suspicious keywords in path ---
        var suspiciousPathKeywords = /(login|verify|secure|account|update|confirm|unlock|activate|claim|free|win|prize|gift|netbanking|authenticate)/i;
        var pathMatch = url.match(/\/(.+)$/);
        if (pathMatch && suspiciousPathKeywords.test(pathMatch[1]) && riskScore > 0) {
            var matchedKeyword = pathMatch[1].match(suspiciousPathKeywords)[0];
            indicators.push({
                type: 'info',
                text: 'The URL path contains keywords ("' + matchedKeyword + '") often used in phishing URLs to create urgency or false trust.'
            });
            riskScore += 5;
        }

        // --- Rule 18: Excessive numbers in domain ---
        var digitCount = (domain.match(/\d/g) || []).length;
        if (digitCount > 3 && !ipPattern.test(domain)) {
            indicators.push({
                type: 'warning',
                text: 'The domain contains ' + digitCount + ' digits. Legitimate domains rarely contain many numbers. Scammers replace letters with numbers (0 for o, 1 for l, 3 for e) to create look-alike domains.'
            });
            riskScore += 15;
        }

        // --- Determine risk level + clear verdict ---
        var riskLevel, riskClass, riskDesc, verdict, verdictClass;
        if (riskScore >= 50) {
            riskLevel = 'HIGH RISK';
            riskClass = 'risk-high';
            riskDesc = 'This URL shows multiple strong indicators of being a phishing or malicious link.';
            verdict = 'PHISHING LINK DETECTED';
            verdictClass = 'verdict-fake';
        } else if (riskScore >= 25) {
            riskLevel = 'MEDIUM RISK';
            riskClass = 'risk-medium';
            riskDesc = 'This URL shows some suspicious indicators. Be cautious and verify through official channels.';
            verdict = 'SUSPICIOUS LINK';
            verdictClass = 'verdict-suspicious';
        } else {
            riskLevel = 'LOW RISK';
            riskClass = 'risk-low';
            riskDesc = 'No strong suspicious indicators detected. However, this does NOT guarantee the website is safe.';
            verdict = 'LIKELY LEGITIMATE';
            verdictClass = 'verdict-real';
        }

        if (indicators.length === 0) {
            indicators.push({
                type: 'safe',
                text: 'No suspicious patterns were detected by the automated rules. The domain appears to follow standard conventions.'
            });
        }

        this.displayResult(riskLevel, riskClass, riskDesc, verdict, verdictClass, indicators, riskScore, domain, url);

        // ===== MISSION 3 INTEGRATION (unchanged) =====
        var isDavidCase = /amaz0n-mega-sale-deals\.net/i.test(url) || /amaz0n/i.test(url);
        var m3Status = Game.state && Game.state.missions && Game.state.missions[3] ? Game.state.missions[3].status : null;

        if (m3Status && m3Status !== 'accepted' && m3Status !== 'tool_completed' && m3Status !== 'completed') {
            if (typeof Game.showNotification === 'function') {
                Game.showNotification('Talk to the citizen first to accept the case');
            }
        } else if (m3Status === 'accepted') {
            if (isDavidCase && riskLevel === 'HIGH RISK') {
                Missions.markToolUsed(3, Game.state);
            }
        }
    },

    // Display results with a clear FAKE / REAL verdict
    displayResult(riskLevel, riskClass, riskDesc, verdict, verdictClass, indicators, score, domain, url) {
        var html = '<div class="result-card ' + riskClass + '">';

        // ---- Big verdict banner ----
        html += '<div class="email-verdict ' + verdictClass + '">';
        html += '<span class="verdict-icon">' + (verdictClass === 'verdict-fake' ? '\u26D4' : verdictClass === 'verdict-real' ? '\u2705' : '\u26A0') + '</span> ';
        html += '<span class="verdict-text">VERDICT: ' + verdict + '</span>';
        html += '</div>';

        // ---- Domain being analysed ----
        html += '<p style="color:#6677aa;font-size:0.8rem;margin-bottom:4px;">Analysing domain: <strong style="color:#00f0ff;">' + domain + '</strong></p>';
        html += '<span class="risk-badge">' + riskLevel + '</span>';
        html += '<p style="color:#aab0cc;font-size:0.85rem;margin:8px 0;">' + riskDesc + '</p>';

        if (verdictClass === 'verdict-fake') {
            html += '<p style="color:#ff8899;font-size:0.9rem;font-weight:bold;">This is a FAKE / phishing link. Do not visit this website or enter any personal information.</p>';
        } else if (verdictClass === 'verdict-real') {
            html += '<p style="color:#88ddaa;font-size:0.9rem;font-weight:bold;">This link appears REAL and legitimate. However, always verify if anything seems unusual.</p>';
        } else {
            html += '<p style="color:#ffcc66;font-size:0.9rem;font-weight:bold;">This link is SUSPICIOUS. Verify the website through official channels before visiting or entering information.</p>';
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
        html += '<li>Type website addresses directly in the browser instead of clicking links in emails or messages.</li>';
        html += '<li>Check the domain name carefully for misspellings (0 vs o, 1 vs l, extra words).</li>';
        html += '<li>Look for "@" in URLs - everything before it is ignored by the browser.</li>';
        html += '<li>Remember: HTTPS (the padlock icon) only means the connection is encrypted. It does NOT mean the site is legitimate.</li>';
        html += '<li>Preview shortened URLs using online tools (like unshorten.it) before visiting them.</li>';
        html += '<li>Be wary of free hosting sites (blogspot, weebly, etc.) pretending to be banks or shops.</li>';
        html += '<li>If a deal seems too good to be true, verify on the official website first.</li>';
        html += '<li>Report suspicious websites. In India, call 1930 or visit cybercrime.gov.in.</li>';
        html += '</ul>';
        html += '</div>';

        // ---- Mission 3 case status ----
        var isDavid = url && (/amaz0n-mega-sale-deals\.net/i.test(url) || /amaz0n/i.test(url));
        var m3 = Game.state && Game.state.missions && Game.state.missions[3] ? Game.state.missions[3].status : null;
        if (m3 && m3 !== 'accepted' && m3 !== 'tool_completed' && m3 !== 'completed') {
            html += '<div style="margin-top:10px;padding:8px;background:rgba(255,170,0,0.1);border:1px solid #ffaa0055;color:#ffcc66;border-radius:4px;font-size:0.82rem;">\u26A0\uFE0F Notice: Talk to the citizen first to accept the case.</div>';
        } else if (m3 === 'accepted' && !isDavid) {
            html += '<div style="margin-top:10px;padding:8px;background:rgba(0,240,255,0.1);border:1px solid #00f0ff55;color:#c0e8ff;border-radius:4px;font-size:0.82rem;">\uD83D\uDCA1 Active Case: David is worried about his smartphone deal URL (www.amaz0n-mega-sale-deals.net). Analyse that URL to advance the mission.</div>';
        } else if (m3 === 'accepted' && isDavid && riskLevel === 'HIGH RISK') {
            html += '<div style="margin-top:10px;padding:8px;background:rgba(68,255,136,0.1);border:1px solid #44ff8855;color:#44ff88;border-radius:4px;font-size:0.82rem;">\u2705 Case 3 Verified: Fake shopping URL confirmed as PHISHING! Return to David with your findings.</div>';
        }

        html += '<p style="color:#555577;font-size:0.72rem;margin-top:8px;">Automated risk score: ' + score + ' (higher = more suspicious). This tool uses rule-based checks and cannot definitively determine if a website is safe.</p>';
        html += '</div>';

        document.getElementById('url-results').innerHTML = html;
    },

    showResult(msg) {
        document.getElementById('url-results').innerHTML =
            '<div class="result-card"><p style="color:#ff4466;">' + msg + '</p></div>';
    },

    clear() {
        document.getElementById('url-input').value = '';
        document.getElementById('url-results').innerHTML = '';
        AudioManager.playClick();
    }
};
