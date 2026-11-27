# CYBERWALL - The Digital World Rescue

**PLAY SMART. STAY SAFE. PROTECT THE DIGITAL WORLD.**

A 2D top-down cyberpunk adventure game that teaches cybersecurity through interactive gameplay.
Built for a Class 11 Computer Science exhibition project.

---

## Quick Start on Windows (1-Click Run)

Simply double-click **`start.bat`** in the project folder!
It will:
1. Automatically detect Python, py launcher, or Node.js / npx
2. Launch a local web server at `http://localhost:8080`
3. Automatically open the game in your default web browser

### Alternative Manual Options

#### Option 1: Python (Recommended)
```powershell
cd d:\CYBERWALL
python -m http.server 8080
```
*(If `python` doesn't work, try `py -m http.server 8080`)*
Open `http://localhost:8080` in your browser.

#### Option 2: Node.js / npx
```powershell
cd d:\CYBERWALL
npx http-server -p 8080
```
Open `http://localhost:8080` in your browser.

#### Option 3: Direct File Open (Offline Standalone)
Double-click `index.html` to open it directly in Chrome, Edge, or Firefox.
*Everything runs 100% offline — there are zero external CDNs, fonts, or network requests.*

---

## Game Controls

| Key | Action |
|-----|--------|
| **W / A / S / D** | Move character (Up / Left / Down / Right) |
| **Arrow Keys** | Alternative movement keys |
| **E** | Interact (Talk to citizens, Enter buildings, Use laptop, Inspect Case Board, Advance dialogue) |
| **Spacebar** | Skip dialogue typewriter / Advance dialogue lines |
| **ESC** | Pause game / Close overlays |

---

## Game Story & World

You are a young Cyber Security Officer protecting Cyber City. Citizens are facing urgent cyber threats: phishing scams, weak passwords, counterfeit shopping websites, network intrusions, and identity theft.

Explore Main Street, meet citizens with real-world cybersecurity problems, enter buildings to investigate with specialized security tools, and defend the digital world!

---

## Missions & Badges

| # | Mission | Complainant | Location | Security Tool Used | Badge Awarded | Points |
|---|---------|-------------|----------|--------------------|---------------|--------|
| **1** | The Suspicious Email | Alex | Main Street | Phishing Email Detector | ✉️ **EMAIL DETECTIVE** | 100 |
| **2** | The Weak Password | Sarah | Cyber Promenade | Password Strength Checker | 🔑 **PASSWORD GUARDIAN** | 100 |
| **3** | The Fake Shopping Website | David | Mall Entrance | Fake Website & URL Detector | 🛒 **SCAM INVESTIGATOR** | 100 |
| **4** | Firewall Defence | Commander Riley | Firewall Control Centre | Firewall Simulator | 🔁 **FIREWALL DEFENDER** | 100 |
| **5** | Identity Theft Prevention | Maya | Cyber Plaza | Identity Defender (PII Audit) | 🛡️ **IDENTITY GUARDIAN** | 100 |

**Maximum Exhibition Score:** 500 Points & 5 Badges

---

## Interactive Building Interiors

Step up to any building entrance on Main Street and press **E** to enter:
- **CyberWall Headquarters:** The central command center containing the CyberWall Security Laptop.
- **Cyber Shopping Mall:** Authentic retail tech shop with Store Manager Vikram explaining online payment scams.
- **Cyber Investigation Office:** Forensics laboratory featuring an interactive **Case Board** displaying real-time case files and forensic dossiers.
- **Firewall Control Centre:** High-security server facility housing the main network Firewall Terminal.

---

## CyberWall Security Tools

### 1. Phishing Email Detector
Rule-based heuristic analysis scanning for urgent/threatening language, OTP/password solicitation, spoofed sender domains, and unencrypted hyperlinks.

### 2. Password Strength Checker
Locally evaluates password strength based on entropy: length scoring (12+ characters), 4-character diversity (uppercase, lowercase, numbers, symbols), dictionary attack checks, and keyboard pattern penalties. Requires reaching a **STRONG (65+)** rating to solve Sarah's case.

### 3. Fake Website & URL Detector
Analyzes URLs for lookalike domains (e.g., `amaz0n`), hyphenated brand impersonation (`amaz0n-mega-sale-deals.net`), suspicious TLDs, bare IP addresses, and URL shorteners. Teaches that HTTPS alone does *not* guarantee trustworthiness.

### 4. Firewall Simulator
Packet-filtering simulation where the player evaluates source IP, destination IP, port number, and protocol to decide whether to **ALLOW** or **BLOCK** incoming traffic against network security rules. Includes screen-shake feedback on mistakes.

### 5. Identity Defender (PII Privacy Audit)
Interactive privacy audit reviewing social media creator registration forms. Teaches citizens how to differentiate between harmless public information and sensitive Personally Identifiable Information (PII) like Aadhaar, date of birth, home address, and mother's maiden name.

---

## Technology Stack

- **HTML5 & CSS3:** Semantic markup, responsive flexbox/grid layout, custom cyberpunk UI with scanlines and animated city skyline.
- **JavaScript (ES6+):** Modular rule-based security engines, state management, and event handling.
- **Phaser 3 (v3.55.2):** 2D top-down game engine managing scene transitions, Arcade Physics, tile collisions, camera follow/shake, and sprite animations.
- **Web Audio API:** 100% synthesized procedural sound effects and ambient 8-bit cyberpunk music generated directly in code (no external MP3/WAV files required).
- **Web Storage API (`localStorage`):** Persistent, client-side progress saving and badge tracking.
- **Zero External Dependencies:** Completely self-contained and offline-ready for exhibition halls without internet.

---

## Project Structure

```
CYBERWALL/
  index.html              Main HTML document and UI overlay templates
  start.bat               1-click launcher for Windows (Python / Node.js)
  test.html               Automated unit test suite (162 tests)
  README.md               Project documentation and Viva preparation guide

  assets/
    phaser.min.js         Local Phaser 3 game framework library
    characters/           Directory for exported textures
    buildings/            Directory for building assets
    icons/                Directory for badge icons
    audio/                Directory for audio assets

  css/
    style.css             Main cyberpunk game stylesheet & menu animations
    dashboard.css         CyberWall security dashboard and tool styling

  js/
    main.js               BootScene, Game controller, menu skyline, minimap, demo mode
    game.js               GameScene: Main Street city, buildings, ambient NPCs, drones
    interiors.js          InteriorScene: HQ, Mall, Investigation Office, Firewall Centre
    player.js             Player character class, walking animations, interaction effects
    npc.js                NPC character data, dialogues, and patrolling ambient citizens
    dialogue.js           Typewriter dialogue overlay with E / Spacebar advance
    missions.js           Mission progress tracker, objective HUD, unlock logic
    emailChecker.js       Tool 1: Phishing Email Detector
    passwordChecker.js    Tool 2: Password Strength Checker
    urlChecker.js         Tool 3: Fake Website & URL Detector
    firewallSimulator.js  Tool 4: Network Packet Firewall Simulator
    identityChecker.js    Tool 5: Identity Defender & PII Privacy Audit
    saveSystem.js         LocalStorage save/load and mission completion validation
    audio.js              Web Audio API live procedural synthesizer
```

---

## Exhibition Features: How to Present This Project

### 30-Second Elevator Pitch
> *"Good morning, respected judges and teachers! Our project is **CYBERWALL – THE DIGITAL WORLD RESCUE**. It is an interactive 2D cybersecurity adventure game built using HTML5, CSS3, JavaScript, and Phaser 3. Instead of teaching cybersecurity through dry lectures, players step into the shoes of a Cyber Security Officer in Cyber City. By investigating real complaints from citizens, players learn to catch phishing emails, build strong passwords, spot lookalike shopping scams, manage firewall packets, and protect personal identity data. Everything runs 100% offline, procedural sound is synthesized live in code, and progress is saved locally."*

### 2-Minute Exhibition Demonstration Flow
1. **Show the Main Menu:** Point out the animated city skyline, procedural sound synthesis, and explain that no external assets or internet are needed.
2. **Move on Main Street:** Walk the player using **WASD**, point out the ambient citizens, flying drones, and glowing neon billboards displaying the Indian Cybercrime Helpline **1930**.
3. **Show Mission 1 (Alex):** Talk to Alex (**E**), accept the case, walk into CyberWall HQ, use the Security Laptop, run the Phishing Email Detector, and explain the urgency and OTP red flags.
4. **Demonstrate Mission 3 (David):** Show how the URL Detector flags `amaz0n-mega-sale-deals.net` as HIGH RISK due to letter-for-digit swaps (`0` for `o`), hyphenated brand spoofing, and promotional buzzwords.
5. **Demonstrate Mission 5 (Maya):** Show the Identity Defender tool and explain Personally Identifiable Information (PII) like Aadhaar and mother's maiden name.
6. **Open Settings & Demo Mode:** Open Settings and click **"UNLOCK ALL MISSIONS"** to demonstrate instant access for judges.
7. **Inspect the Investigation Case Board:** Enter the Cyber Investigation Office and inspect the live digital Case Board.

---

## Viva Questions & Answers (Class 11 Computer Science)

### Q1: How does your Phishing Email Detector identify fraudulent emails without using artificial intelligence or external APIs?
**Answer:**
> *"The Phishing Email Detector uses a deterministic, rule-based heuristic scoring engine implemented in JavaScript. It parses the raw email text using Regular Expressions (RegEx) to test for five primary indicators:
> 1. **Urgency & Coercive Phrasing:** Pattern matching for words like `immediately`, `within 24 hours`, `account will be blocked`.
> 2. **Credential & Sensitive Data Harvesting:** Searching for solicitations of `OTP`, `passwords`, `PIN`, or `card numbers`.
> 3. **Sender Domain Spoofing:** Extracting the domain after the `@` symbol and testing for lookalike strings (e.g., `sb1` instead of `sbi`) or disposable Top-Level Domains (`.xyz`, `.top`).
> 4. **Embedded URL Inspection:** Checking if hyperlinks contain bare IP addresses or unencrypted `http://` protocols.
> 5. **Generic Salutations:** Checking for generic greetings like `Dear Customer`.
> Each detected indicator adds weighted points to a cumulative `riskScore`. If the score reaches 50 or above, the email is classified as HIGH RISK. This ensures fast, safe, local execution without sending data over the network."*

### Q2: How is the password strength score calculated in the Password Strength Checker?
**Answer:**
> *"The password scoring algorithm evaluates password entropy through an additive and subtractive rule system:
> 1. **Length Factor (Baseline):** Passwords under 8 characters receive a heavy penalty; 8–11 characters receive baseline points (`length * 4`); passwords with 12–15 characters receive 35 points, and 16+ characters receive 40 points.
> 2. **Character Diversity:** Regular expressions test for 4 distinct character sets: lowercase (`[a-z]`), uppercase (`[A-Z]`), numeric digits (`[0-9]`), and special symbols (`[^a-zA-Z0-9]`). Each present set contributes +8 points (up to +32).
> 3. **Dictionary & Pattern Penalties:** The password is converted to lowercase and cross-referenced against a precompiled array of the top 20 common passwords (`password123`, `admin`, `letmein`) deducting 30 points, and keyboard sequences (`qwerty`, `123456`) deducting 20 points.
> 4. **Sequential Character Check:** ASCII code differentials check for consecutive sequences (`abc`, `123`), deducting 10 points.
> The final score is clamped between 0 and 100. A score of 65 or higher is required to qualify as STRONG, which encourages the student to adopt passphrase techniques."*

### Q3: What is a Firewall, and how does your Firewall Simulator model its functionality?
**Answer:**
> *"A firewall is a network security device or software filter that monitors and controls incoming and outgoing network traffic based on predetermined security rules. It acts as a barrier between a trusted internal network and untrusted external networks.
> In our simulation, network packets are represented as JavaScript objects containing `sourceIP`, `destIP`, `destPort`, and `trafficType`. The simulator models **Stateless Packet Filtering**:
> - **Rule 1:** Packets originating from trusted private subnets (`192.168.x.x`) destined for legitimate services (HTTP port 80, HTTPS port 443, IMAPS port 993) are **ALLOWED**.
> - **Rule 2:** Packets targeting known malware command-and-control ports or backdoor trojan ports (e.g., port 31337 or 4444) are **BLOCKED**.
> - **Rule 3:** Traffic from unknown or untrusted external IP addresses attempting to access internal admin consoles (SSH port 22) is **BLOCKED**.
> The simulation requires the player to maintain a 70% or higher accuracy rate to successfully defend the network."*

### Q4: Why did you use the `localStorage` API instead of a backend database like MySQL or MongoDB?
**Answer:**
> *"We chose the browser's `localStorage` API for three practical software engineering reasons:
> 1. **Client-Side Persistence:** `localStorage` allows key-value data to persist indefinitely on the client machine even when the browser tab is closed or refreshed, without requiring an active database connection.
> 2. **Zero-Configuration Offline Portability:** In an exhibition setting, external database servers (like MySQL) require background daemon processes, authentication credentials, and network configuration. With `localStorage`, the game runs instantly on any Windows PC via double-click without database setup.
> 3. **JSON Serialization:** In `saveSystem.js`, our game state (scores, badge arrays, mission completion booleans) is structured as a native JavaScript object. We serialize it to a string using `JSON.stringify()` when saving, and parse it back into an active object using `JSON.parse()` on startup. We also include schema merging with `defaultState` to prevent missing-key exceptions after updates."*

### Q5: How do Phaser 3 Scenes work, and how does your project handle transitions between the city and building interiors?
**Answer:**
> *"Phaser 3 uses a **State Management / Scene Architecture** where each distinct game environment is encapsulated in a class extending `Phaser.Scene`. Every Scene manages its own display list, camera system, physics world, and update loop:
> - **`BootScene`:** Runs once on startup to programmatically draw character textures onto offscreen HTML5 canvases (`generateCharacterSheet`) and register animations (`scene.anims.create`).
> - **`GameScene`:** The exterior city map (`WORLD_W = 2000`, `WORLD_H = 1150`) managing Main Street roads, colliders, ambient NPCs, and building entrance triggers.
> - **`InteriorScene`:** A reusable interior room (`1024x576`) parameterized by a `buildingKey` (`hq`, `mall`, `investigation`, `firewall`).
> When the player interacts with a building door:
> 1. `GameScene` triggers a camera fade-out (`cameras.main.fade(250)`).
> 2. On completion, `scene.stop('GameScene')` halts exterior processing, and `scene.start('InteriorScene', { buildingKey, returnPos })` passes initialization parameters to `InteriorScene.init()`.
> 3. When exiting, the reverse occurs: `InteriorScene` fades out and restarts `GameScene`, passing `{ startPos: returnPos }` so the player spawns exactly outside the door they entered."*

---

## Educational Standards & Cyber Safety Helpline

This exhibition project actively promotes awareness of the **National Cyber Crime Reporting Portal** developed by the Ministry of Home Affairs (MHA), Government of India:
- **Toll-Free National Cybercrime Helpline:** **1930** (Available 24x7)
- **Official Citizen Reporting Portal:** [https://cybercrime.gov.in](https://cybercrime.gov.in)
- **Emergency Banking Fraud Protocol:** Immediately report unauthorized financial transactions within the **Golden Hour** (first 1–2 hours) so authorities can freeze fraudulent recipient accounts.

---

## Verification & Testing

CYBERWALL includes an integrated automated test suite in **`test.html`** containing **162 unit tests** covering:
- LocalStorage save and load round-trips
- Mission unlock progression and active objective tracking
- Phishing detection regex rules and email risk classifications
- Password entropy scoring and strong password requirements
- URL homograph detection, hyphenated brand spoofing, and David's scam URL scoring
- Firewall simulator decision mechanics and screen shake triggers
- Identity theft PII privacy audit logic
- Full end-to-end 5-mission completion simulation

To run the automated tests, simply open `test.html` in any browser or run:
```powershell
node C:\Users\SABARI\.gemini\antigravity\brain\e6c17ab2-af74-41bc-9528-6e55fa268352\scratch\runner.js
```
All 162 tests pass with 0 failures.

---

## Credits

- **Project:** CYBERWALL – The Digital World Rescue
- **Target Audience:** School Computer Science Exhibition (Class 11 / 12)
- **Framework:** Phaser 3 (MIT License, local bundle)
- **Assets:** 100% original, code-drawn canvas graphics and procedural Web Audio API synthesis
- **Theme:** Play Smart · Stay Safe · Protect the Digital World
