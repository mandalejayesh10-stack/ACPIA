# ACPIA — Design System

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Stack**: Next.js · CSS Custom Properties · Framer Motion  
> **Fonts**: Space Grotesk (headings) · Inter (body) · JetBrains Mono (code)  
> **Inspiration**: Hac'KP · Palantir · Vercel · Linear · OpenAI

---

## Design Language

ACPIA is a **government-grade cyber intelligence platform**. Its design communicates:

- **Precision** — every pixel intentional, no decorative noise
- **Trust** — dark palette, structured information hierarchy
- **Power** — glowing accents against deep backgrounds
- **Clarity** — complex data made instantly readable

It is **NOT**:
- A consumer app (no bright backgrounds, no rounded bubbles)
- A generic dashboard (no Bootstrap, no default shadows)
- A landing page (no marketing speak in the UI)

---

## 1. Color Tokens

```css
:root {
  /* Backgrounds */
  --color-bg-base:       #050816;  /* page background */
  --color-bg-surface:    #0A1020;  /* panels, sidebars */
  --color-bg-card:       #101828;  /* cards */
  --color-bg-elevated:   #18243A;  /* modals, popovers */
  --color-bg-input:      #0D1929;  /* form inputs */

  /* Glass */
  --color-glass-bg:      rgba(255, 255, 255, 0.04);
  --color-glass-border:  rgba(255, 255, 255, 0.08);
  --color-glass-hover:   rgba(255, 255, 255, 0.07);

  /* Accent — Primary */
  --color-accent-cyan:   #00D9FF;
  --color-accent-cyan-dim: rgba(0, 217, 255, 0.12);
  --color-accent-cyan-glow: rgba(0, 217, 255, 0.25);

  /* Accent — Semantic */
  --color-success:       #00FF9D;
  --color-success-dim:   rgba(0, 255, 157, 0.12);
  --color-warning:       #FFC857;
  --color-warning-dim:   rgba(255, 200, 87, 0.12);
  --color-danger:        #FF4D6D;
  --color-danger-dim:    rgba(255, 77, 109, 0.12);
  --color-purple:        #7C5CFF;
  --color-purple-dim:    rgba(124, 92, 255, 0.12);

  /* Text */
  --color-text-primary:   #FFFFFF;
  --color-text-secondary: #98A2B3;
  --color-text-tertiary:  #4B5563;
  --color-text-disabled:  #374151;
  --color-text-accent:    #00D9FF;

  /* Borders */
  --color-border-default: rgba(255, 255, 255, 0.08);
  --color-border-strong:  rgba(255, 255, 255, 0.16);
  --color-border-accent:  rgba(0, 217, 255, 0.30);
}
```

---

## 2. Typography

```css
/* Font imports in layout.tsx */
@import url('https://fonts.googleapis.com/css2?
  family=Space+Grotesk:wght@400;500;600;700&
  family=Inter:wght@300;400;500;600&
  family=JetBrains+Mono:wght@400;500;600&
  display=swap');

:root {
  --font-heading: 'Space Grotesk', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;
}
```

### Type Scale

| Token | Size | Weight | Font | Usage |
|---|---|---|---|---|
| `--text-xs` | 11px | 500 | Inter | Badges, labels |
| `--text-sm` | 13px | 400/500 | Inter | Secondary text, table cells |
| `--text-base` | 15px | 400 | Inter | Body text |
| `--text-md` | 17px | 500 | Inter | Card titles |
| `--text-lg` | 20px | 600 | Space Grotesk | Section headings |
| `--text-xl` | 24px | 700 | Space Grotesk | Page headings |
| `--text-2xl` | 32px | 700 | Space Grotesk | Hero headings |
| `--text-3xl` | 48px | 700 | Space Grotesk | Landing hero |
| `--text-mono` | 13px | 400 | JetBrains Mono | Code, IDs, hashes |

---

## 3. Spacing

4px base unit. All spacing is a multiple of 4.

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}
```

---

## 4. Border Radius

```css
:root {
  --radius-sm:   4px;   /* badges, chips */
  --radius-md:   8px;   /* inputs, small cards */
  --radius-lg:   12px;  /* cards */
  --radius-xl:   16px;  /* modals, large panels */
  --radius-2xl:  24px;  /* glass panels */
  --radius-full: 9999px; /* pills, avatars */
}
```

---

## 5. Glassmorphism

All floating cards use this glass pattern:

```css
.glass-card {
  background: var(--color-glass-bg);
  border: 1px solid var(--color-glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
}

.glass-card:hover {
  background: var(--color-glass-hover);
  border-color: rgba(0, 217, 255, 0.15);
  transition: all 0.2s ease;
}
```

---

## 6. Shadows & Glows

```css
:root {
  --shadow-card:    0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-modal:   0 8px 48px rgba(0, 0, 0, 0.6);
  --shadow-cyan:    0 0 20px rgba(0, 217, 255, 0.25);
  --shadow-green:   0 0 20px rgba(0, 255, 157, 0.25);
  --shadow-red:     0 0 20px rgba(255, 77, 109, 0.25);
  --shadow-purple:  0 0 20px rgba(124, 92, 255, 0.25);
  --shadow-amber:   0 0 20px rgba(255, 200, 87, 0.25);
}
```

---

## 7. Animation Tokens

```css
:root {
  --duration-fast:    120ms;
  --duration-normal:  200ms;
  --duration-slow:    350ms;
  --duration-xslow:   600ms;

  --ease-default:     cubic-bezier(0.16, 1, 0.3, 1);   /* spring */
  --ease-in:          cubic-bezier(0.4, 0, 1, 1);
  --ease-out:         cubic-bezier(0, 0, 0.2, 1);
  --ease-linear:      linear;
}
```

### Animation Principles

- **Hover effects**: 200ms, ease-default
- **Page transitions**: 350ms, ease-default
- **Skeleton loaders**: 1.5s loop, ease-linear
- **Pulse/glow effects**: 2s loop, ease-in-out
- **Graph node transitions**: 600ms, ease-default
- **NO** bounce, spring overshoot, or flashy particle effects on data views

---

## 8. Components

### Button

```tsx
// Variants: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
// Sizes: 'sm' | 'md' | 'lg'

<Button variant="primary" size="md">
  Run Investigation
</Button>
```

```css
.btn-primary {
  background: linear-gradient(135deg, #00D9FF 0%, #0099BB 100%);
  color: #050816;
  font-weight: 600;
  border: none;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  transition: all var(--duration-normal) var(--ease-default);
}
.btn-primary:hover {
  box-shadow: var(--shadow-cyan);
  transform: translateY(-1px);
}
```

---

### Card

```css
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: border-color var(--duration-normal) var(--ease-default);
}
.card:hover {
  border-color: var(--color-border-strong);
}
.card.interactive:hover {
  border-color: var(--color-border-accent);
  box-shadow: var(--shadow-cyan);
}
```

---

### StatusChip (Agent Status)

```tsx
// status: 'running' | 'completed' | 'waiting' | 'queued' | 'failed' | 'paused'
<StatusChip status="running" label="Content Analysis" />
```

| Status | Color | Animation |
|---|---|---|
| `running` | `--color-success` | Pulsing dot |
| `completed` | `--color-success` | Static checkmark |
| `waiting` | `--color-warning` | Static dot |
| `queued` | `--color-text-tertiary` | Static dot |
| `failed` | `--color-danger` | Static X |
| `paused` | `--color-purple` | Static pause icon |

---

### RiskBadge

```tsx
// score: 0–10
<RiskBadge score={8.4} />
```

| Score | Color | Label |
|---|---|---|
| 0–3 | `--color-success` | LOW |
| 4–6 | `--color-warning` | MEDIUM |
| 7–8 | `--color-danger` | HIGH |
| 9–10 | `--color-danger` + glow | CRITICAL |

---

### AgentCard

```
┌─────────────────────────────────────────┐
│  🔵  Content Analysis Agent             │
│      v1.0.0  ·  Agent #2               │
│                                         │
│  Status: ████████████░░░  Running       │
│  Duration: 3.2s / ~12s                  │
│                                         │
│  Last run: 2 mins ago                   │
│  Confidence: 94%                        │
└─────────────────────────────────────────┘
```

---

### EvidenceCard

```
┌─────────────────────────────────────────┐
│  [IMAGE THUMBNAIL / FILE ICON]          │
│                                         │
│  screenshot_001.jpg                     │
│  EV-2024-001  ·  2.4 MB  ·  Image     │
│                                         │
│  SHA256: abc123...                      │
│  Uploaded: Jan 15, 10:30 AM            │
│                                         │
│  [Analyzed] [3 Findings]               │
└─────────────────────────────────────────┘
```

---

### Timeline Component

- Vertical timeline, scrollable
- Events grouped by date
- Each event: icon (by type), title, time, evidence ref, expandable details
- Click event → expand inline details
- Hover → glow border on event card
- Critical events: red left border accent
- Animations: stagger fade-in on load, slide-in on new event

---

### Knowledge Graph

- WebGL canvas (react-force-graph or Sigma.js)
- Black background (`#050816`)
- Nodes: colored by entity type (see Ontology), size by connection count
- Edges: thin cyan lines, animated particle flow for active relationships
- Hover node → show entity summary card
- Click node → open entity detail drawer
- Double-click node → center graph on node
- Controls: zoom, pan, filter by node type, search

---

### Skeleton Loader

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-card) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-card) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-wave {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 9. UI Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  TOP NAV: Logo | Case # | Status | [User] [Notifications]        │
├──────────┬───────────────────────────────────────┬───────────────┤
│  LEFT    │                                       │  RIGHT AI     │
│  COMMAND │         CENTER WORKSPACE              │  PANEL        │
│  PANEL   │                                       │               │
│          │  Knowledge Graph / Timeline /         │  Chief Agent  │
│  Evidence│  Map / Evidence Viewer /              │  Active Agent │
│  Timeline│  Investigation Dashboard              │  Risk Score   │
│  Graph   │                                       │  Next Steps   │
│  Agents  │                                       │  Copilot      │
│  Reports │                                       │               │
│  Settings│                                       │               │
├──────────┴───────────────────────────────────────┴───────────────┤
│  STATUS BAR: Pipeline status | Token usage | Connection status   │
└──────────────────────────────────────────────────────────────────┘
```

Panel widths:
- Left: 240px (collapsible to 64px)
- Center: flex-grow
- Right: 320px (collapsible)

---

## 10. Dark Mode

ACPIA is dark mode only. There is no light mode. Light mode is a feature flag that defaults to `disabled` and will never be enabled before the hackathon demo.

---

## 11. Responsive Behaviour

| Breakpoint | Layout |
|---|---|
| < 768px (mobile) | Single column, right panel hidden |
| 768–1024px (tablet) | Left panel icon-only, right panel drawer |
| > 1024px (desktop) | Full three-panel layout |
| > 1440px (large) | Wider center workspace |

Primary target: **1440px laptop** (judges will use laptops).

---

## 12. Icon System

**Library**: Lucide React (primary) + Phosphor Icons (extended)

Never use: Material Icons, Font Awesome, Heroicons.

### Agent Icons

| Agent | Icon (Lucide) |
|---|---|
| Evidence Intake | `Package` |
| Content Analysis | `ScanSearch` |
| Threat Identification | `AlertTriangle` |
| Context Extraction | `Crosshair` |
| Activity Pattern | `Activity` |
| Metadata Mapping | `Database` |
| Synthetic Detection | `Fingerprint` |
| Timeline Reconstruction | `Clock` |
| Intelligent Retrieval | `Search` |
| Automated Reporting | `FileText` |
| Risk Assessment | `ShieldAlert` |
| Intelligence Fusion | `GitMerge` |
| Hypothesis Generation | `Lightbulb` |
| Verification | `CheckSquare` |
| Copilot | `MessageSquare` |
| Explainability | `BookOpen` |

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*
