# ACPIA — Hackathon Demo Blueprint

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Event**: Hac'KP 2026, Kerala  
> **Target audience**: Technical judges, government officials, cybercrime division representatives  
> **Demo duration**: 8–12 minutes

---

## Demo Philosophy

The demo tells a story **without anyone speaking**. The judges should understand what ACPIA does by watching the screen — not by reading slides or listening to an explanation. Every second is choreographed.

**Story**: "A child safety investigator uploads evidence. ACPIA's AI agents activate. The knowledge graph grows in real time. A risk score emerges. A report is generated. The investigator asks the Copilot a question and gets an answer with evidence citations."

---

## Demo Environment Setup

### Pre-Demo Checklist (Night Before)

```
[ ] Docker Compose running — all 9 services green
[ ] Demo case pre-loaded (DEMO_PRELOADED_CASE: true)
[ ] All 16 agents registered and READY
[ ] Feature flags set: DEMO_MODE + ENABLE_SOUND_EFFECTS
[ ] Browser: Chrome, full screen, 1920×1080
[ ] Browser zoom: 100% (not 90% or 110%)
[ ] Tab open: http://localhost:3000
[ ] Logged in as: demo@acpia.gov.in (INVESTIGATOR role)
[ ] Evidence ZIP pre-prepared and tested
[ ] Second tab open: Grafana Agent Monitoring dashboard
[ ] Internet: OpenAI API reachable (test with simple call)
[ ] Laptop: plugged in, performance mode, notifications off
[ ] Backup: offline mode configured (ENABLE_LOCAL_MODEL: true as fallback)
```

### Demo User Accounts

| Account | Role | Password | Purpose |
|---|---|---|---|
| `demo@acpia.gov.in` | INVESTIGATOR | [secure] | Main demo user |
| `supervisor@acpia.gov.in` | SUPERVISOR | [secure] | Gate approval demo |
| `admin@acpia.gov.in` | ADMIN | [secure] | Flag management demo |

---

## Demo Script — Second by Second

### **[0:00 – 0:30] Landing Page**

> *"This is ACPIA — the AI-powered Criminal and Paedophile Investigation Assistant, built for Kerala Police and Cyberdome."*

- Landing page visible: dark background, animated particle network, ACPIA logo
- Headline: *"Evidence → Intelligence → Justice"*
- Subheadline: *"16 AI agents. One investigation platform."*
- Scroll down slowly to reveal the animated agent pipeline diagram
- Brief hover on each agent card — they light up cyan/green/purple

**Duration**: 30 seconds

---

### **[0:30 – 1:00] Login**

- Click "Open Investigation"
- Login screen appears — glass card, cyber background, animated gradient border
- Type credentials (smooth, unhurried)
- MFA code entry (pre-filled for demo speed)
- Transition to dashboard

**Duration**: 30 seconds

---

### **[1:00 – 1:30] Investigation Dashboard**

> *"Here is the active investigation dashboard. Case 2024-001. Currently no agents have run. No intelligence gathered yet."*

- Dashboard shows empty state: Knowledge Graph (empty), Timeline (empty), Risk Score: UNKNOWN
- Sidebar: Evidence (0 files), Timeline (0 events), Graph (0 nodes)
- Right panel: all 16 agents in READY state (green dots, static)

**Duration**: 30 seconds

---

### **[1:30 – 2:30] Evidence Upload**

> *"The investigator uploads a ZIP file containing screenshots, chat logs, audio files, and images collected from a suspect's device."*

- Drag and drop ZIP file onto the evidence drop zone
- Upload animation: file icon floats up, progress ring fills (cyan)
- Files extracted and listed: 8 files (3 images, 2 chat exports, 1 audio, 1 video, 1 PDF)
- Each file shows: name, type, size, SHA-256 hash (computed client-side display)
- Success sound: subtle chime 🔔
- Evidence count in sidebar: **8 files**

**Duration**: 60 seconds

---

### **[2:30 – 3:00] Pipeline Launch**

> *"With one click, the investigation pipeline begins. All 16 agents activate in sequence."*

- Click "Run Investigation" button (cyan, glowing)
- Pipeline visualization appears: a vertical flow chart
- Agents 1–16 show status chips:
  - Agent 1: **RUNNING** (pulsing green)
  - Agents 2–16: **QUEUED** (grey)
- Sound: low hum / system activation sound 🔈
- Right AI Panel: Chief Investigation Agent shows: *"Analyzing 8 evidence files. Routing to Evidence Intake Agent."*

**Duration**: 30 seconds

---

### **[3:00 – 5:00] Agent Pipeline Running — Live View**

> *Watch the pipeline run. Comment on each agent as it activates.*

- Split attention between:
  - Left: Agent status panel (chips changing from QUEUED → RUNNING → COMPLETED)
  - Center: Knowledge Graph growing in real time
  - Right: Chief Agent narrating progress

**Agent sequence (with live commentary)**:

```
[3:00] Agent 1 COMPLETED ✓  — "Evidence validated. 8 files, all hashes verified."
[3:10] Agent 2 RUNNING  🔵 — "Content Analysis: analyzing images, transcribing audio..."
[3:30] Agent 2 COMPLETED ✓  — "3 faces detected. Chat logs parsed. Audio transcribed."
[3:35] Agent 3 RUNNING  🔴 — "Threat Identification activated..."
[3:50] Agent 3 COMPLETED ✓  — "Grooming pattern detected. Confidence: 94%"
       → Red threat node appears in Knowledge Graph 🔴
[3:55] Agent 6 RUNNING  ⚪ — "Metadata extraction..."
[4:00] Agent 6 COMPLETED ✓  — "GPS extracted: 3 locations. Device: Samsung Galaxy A52"
       → Location nodes appear in graph 🟠
[4:05] Agent 8 RUNNING  🟠 — "Timeline reconstruction..."
[4:25] Agent 8 COMPLETED ✓  — "12 timeline events reconstructed"
       → Timeline panel fills with events
[4:30] Agent 11 RUNNING 🔴 — "Risk Assessment..."
[4:40] Agent 11 COMPLETED ✓ — "Risk Score: 8.7/10 — HIGH"
       → Risk badge turns red, glow effect 🚨
[4:45] Agent 12 RUNNING 🟣 — "Intelligence Fusion..."
[4:55] Agent 12 COMPLETED ✓ — "Intelligence fused. 3 suspects identified."
```

**During this phase, switch briefly to the Grafana tab** to show live metrics (agent execution durations, token usage counter ticking up).

**Duration**: 120 seconds

---

### **[5:00 – 6:00] Knowledge Graph Exploration**

> *"The knowledge graph now shows the complete intelligence picture extracted from the evidence."*

- Switch to Knowledge Graph view (full screen)
- Nodes glowing: 3 Person nodes, 2 Device nodes, 4 Location nodes, 1 Organization node
- Edges animated: cyan particle flow between connected nodes
- Click on a SUSPECT node → entity detail drawer opens:
  - Name (alias): UNKNOWN-001
  - Known accounts: 3 (Instagram, WhatsApp, Telegram)
  - Known devices: Samsung Galaxy A52
  - Threat association: GROOMING
  - Risk score: 8.7
  - Evidence: 5 files
- Show: click "Find Path" between suspect and victim → graph highlights the shortest path

**Duration**: 60 seconds

---

### **[6:00 – 7:00] Timeline View**

> *"ACPIA has reconstructed a chronological timeline from all the evidence."*

- Switch to Timeline view
- 12 events visible, ordered chronologically
- Scroll through events:
  - `Jan 10 — First contact via Instagram`
  - `Jan 12 — Phone number exchanged`
  - `Jan 15 — Conversation moves to WhatsApp`
  - `Jan 18 — Location shared (GPS: Kerala)`
  - `Jan 22 — Threatening message sent`
- Click on "Threatening message" event → inline evidence: shows the actual chat screenshot
- Suspicious gap highlighted in amber: `Jan 19–21 — 2 day gap with no communication`

**Duration**: 60 seconds

---

### **[7:00 – 7:30] Risk Score & Threat Panel**

> *"The Risk Assessment Agent scored this case 8.7 out of 10 — HIGH risk."*

- Switch to Risk panel
- Risk gauge: 8.7 / 10, red glow, pulsing
- Factors listed:
  - Victim age indicator: HIGH
  - Grooming pattern confirmed: HIGH
  - Location sharing detected: HIGH
  - Multiple communication platforms: MEDIUM
- Human gate badge: *"Requires SUPERVISOR approval before report generation"*
- Briefly switch to supervisor account (new tab) → approve the gate in 10 seconds
- Return to main account → gate cleared

**Duration**: 30 seconds

---

### **[7:30 – 8:30] Investigation Copilot**

> *"The investigator has a question. Instead of searching through files manually, they ask the Copilot."*

- Open right AI panel → Copilot interface
- Type: *"What device did the suspect use and where were they located?"*
- Copilot responds (streaming text):
  - *"The suspect used a Samsung Galaxy A52 (IMEI: [redacted]). Three GPS coordinates were extracted from image EXIF data:*
  - *1. [Location 1] — Jan 12, 2:15 PM*
  - *2. [Location 2] — Jan 15, 4:30 PM*
  - *3. [Location 3] — Jan 18, 11:00 AM*
  - *Evidence references: [EV-2024-003] [EV-2024-006] [EV-2024-007]"*
- Click on `[EV-2024-003]` → evidence viewer opens inline (image with GPS marker)

**Duration**: 60 seconds

---

### **[8:30 – 9:30] Report Generation**

> *"Finally, ACPIA generates a comprehensive, legally reviewable investigation report."*

- Click "Generate Report"
- Agent 10 activates: *"Generating investigation report..."*
- Progress: Executive Summary → Evidence Analysis → Timeline → Threat Assessment → Risk Score → Next Steps
- Report ready in ~15 seconds
- Report view: dark, professional, intelligence-document aesthetic
  - Investigation ID
  - Executive Summary (3 paragraphs)
  - Evidence table (8 files, with analysis)
  - Timeline (condensed)
  - Threat: GROOMING — CONFIRMED — 94% confidence
  - Risk Score: 8.7/10 HIGH
  - Next Steps: 4 recommended actions
- Export as PDF button → briefly download animation

**Duration**: 60 seconds

---

### **[9:30 – 10:00] Closing**

> *"ACPIA turned raw evidence into actionable intelligence in under 10 minutes. This is what AI-powered criminal investigation looks like."*

- Return to dashboard: Knowledge Graph, Timeline, Risk Score all populated
- Summarize: 8 files → 12 timeline events → 3 entities → 1 confirmed threat → risk 8.7 → full report
- Hold on the landing page tag line: *"Evidence → Intelligence → Justice"*

---

## Backup Plans

| Scenario | Response |
|---|---|
| OpenAI API fails | Toggle `ENABLE_LOCAL_MODEL: true` before demo — Ollama runs offline |
| Agent crashes | Use pre-recorded demo video of pipeline (always have this ready) |
| DB connection lost | Restart Docker Compose — takes 45 seconds |
| Browser crashes | Second browser tab always pre-loaded at same page |
| Network drops | All docker services are local — only AI calls need internet |
| Demo machine fails | USB drive with Docker Compose + pre-loaded DB snapshot |

---

## Pre-Built Demo Evidence Package

The demo ZIP file (`demo-evidence-001.zip`) contains:

```
demo-evidence-001.zip
├── screenshot_001.jpg     # Redacted screenshot showing grooming chat
├── screenshot_002.jpg     # Image with GPS EXIF data
├── screenshot_003.jpg     # Image showing device in frame
├── chat_export.txt        # WhatsApp chat export (redacted, fictional)
├── chat_export_2.txt      # Telegram chat export (redacted, fictional)
├── audio_message.mp3      # Fictional audio message (Whisper transcription demo)
├── document.pdf           # Fictional document with OCR demo
└── video_clip.mp4         # 10-second clip (sampled frames demo)
```

**All evidence is fictional and purpose-built for demonstration. No real criminal evidence is used.**

---

## Presentation Mode

When `DEMO_PRESENTATION_MODE: true`:
- Navigation hidden
- Only center workspace + right AI panel visible
- Font size: +10% (for projector readability)
- Cursor: large, high-contrast
- Background: subtle animated aurora (Framer Motion)

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*
