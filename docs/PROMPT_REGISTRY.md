# ACPIA — Prompt Registry

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Principle**: No prompt is ever hardcoded in application code. Every prompt is registered, versioned, and tested.

---

## Overview

The Prompt Registry is the single source of truth for every AI prompt in ACPIA. Instead of scattering prompt strings across agent code, every prompt has:

- A unique `PROMPT_ID`
- A semantic version
- An assigned agent and model
- A defined set of input variables
- A structured output schema (Zod)
- A defined temperature and sampling config
- An owner responsible for its quality
- A test suite with ground truth examples

---

## Prompt ID Format

```
{AGENT_ID}.{TASK}.{VARIANT}

Examples:
content-analysis.summarize-image.default
threat-identification.classify-threat.strict
timeline-reconstruction.merge-events.v2
risk-assessment.calculate-score.conservative
```

---

## Prompt Record Schema

```typescript
interface PromptRecord {
  id: string                    // content-analysis.summarize-image.default
  version: string               // '1.2.0' (semver)
  agentId: string               // which agent owns this prompt
  task: string                  // human-readable task name
  
  // Model configuration
  model: ModelConfig
  
  // Content
  systemPrompt: string          // full system prompt text
  userPromptTemplate: string    // handlebars template with {{variables}}
  
  // Variables
  variables: PromptVariable[]
  
  // Output
  outputSchema: ZodSchema       // validates AI response structure
  outputFormat: 'JSON' | 'TEXT' | 'MARKDOWN'
  
  // Quality
  owner: string                 // team member responsible
  description: string
  examples: PromptExample[]     // ground truth test cases
  evaluationMetrics: EvaluationMetric[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  deprecatedAt?: Date
  deprecationReason?: string
  replacedBy?: string           // ID of replacement prompt
  status: 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'RETIRED'
}

interface ModelConfig {
  primary: string               // 'gpt-4o-2024-11-20'
  fallback: string              // 'claude-3-5-sonnet-20241022'
  temperature: number           // 0.0 – 2.0
  maxTokens: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  responseFormat?: 'json_object' | 'text'
  seed?: number                 // for reproducibility in testing
}

interface PromptVariable {
  name: string                  // {{evidence_summary}}
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description: string
  example: unknown
  maxLength?: number            // for string types
}

interface PromptExample {
  id: string
  description: string
  input: Record<string, unknown>   // variable values
  expectedOutput: unknown          // ground truth response
  tags: string[]
  isRegressionTest: boolean
}
```

---

## Prompt Registry — Complete Listing

### Agent 0: Chief Investigation Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `chief.orchestrate-pipeline.default` | 1.0.0 | Select and sequence agents for a case | gpt-4o | 0.2 |
| `chief.generate-investigation-plan.default` | 1.0.0 | Create investigation plan from evidence list | gpt-4o | 0.3 |
| `chief.summarize-progress.default` | 1.0.0 | Summarize current investigation status | gpt-4o | 0.5 |

---

### Agent 1: Evidence Intake Agent

*No AI prompts — all rule-based processing.*

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `evidence-intake.generate-intake-summary.default` | 1.0.0 | Generate natural language summary of uploaded evidence | gpt-4o | 0.3 |

---

### Agent 2: Content Analysis Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `content-analysis.analyze-image.default` | 1.0.0 | Describe objects, faces, text, and scene in image | gpt-4o | 0.1 |
| `content-analysis.analyze-video-frame.default` | 1.0.0 | Analyze a single video frame for investigation | gpt-4o | 0.1 |
| `content-analysis.analyze-document.default` | 1.0.0 | Summarize and extract key information from document | gpt-4o | 0.2 |
| `content-analysis.analyze-chat.default` | 1.0.0 | Analyze conversation for participants, topics, and tone | gpt-4o | 0.2 |
| `content-analysis.transcribe-and-analyze-audio.default` | 1.0.0 | Analyze transcribed audio for investigation relevance | gpt-4o | 0.2 |

---

### Agent 3: Threat Identification Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `threat-id.classify-threat-type.default` | 1.0.0 | Classify threat category from content analysis | gpt-4o | 0.0 |
| `threat-id.detect-grooming-patterns.default` | 1.0.0 | Identify grooming language and behavioural patterns | gpt-4o | 0.0 |
| `threat-id.detect-blackmail-patterns.default` | 1.0.0 | Identify blackmail and coercion patterns | gpt-4o | 0.0 |
| `threat-id.assess-threat-severity.default` | 1.0.0 | Rate threat severity with reasoning | gpt-4o | 0.0 |

---

### Agent 4: Context Extraction Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `context-extraction.extract-locations.default` | 1.0.0 | Identify landmarks, signboards, geographic clues | gpt-4o | 0.1 |
| `context-extraction.extract-objects.default` | 1.0.0 | Identify uniforms, vehicles, objects of interest | gpt-4o | 0.1 |
| `context-extraction.extract-organizations.default` | 1.0.0 | Identify schools, institutions from visual context | gpt-4o | 0.1 |

---

### Agent 5: Activity Pattern Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `activity-pattern.analyze-communication-patterns.default` | 1.0.0 | Analyse message frequency, timing, and escalation | gpt-4o | 0.2 |
| `activity-pattern.identify-network-roles.default` | 1.0.0 | Assign roles (initiator, recruiter, victim) in network | gpt-4o | 0.1 |

---

### Agent 6: Metadata Mapping Agent

*Primarily rule-based. One AI prompt for synthesis.*

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `metadata-mapping.synthesize-metadata-intelligence.default` | 1.0.0 | Convert raw metadata into investigation intelligence | gpt-4o | 0.2 |

---

### Agent 7: Synthetic Detection Agent

*No AI prompts — specialized detection models only. GPT explains findings.*

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `synthetic-detection.explain-detection-result.default` | 1.0.0 | Explain deepfake/synthetic detection result in plain English | gpt-4o | 0.3 |

---

### Agent 8: Timeline Reconstruction Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `timeline.merge-events.default` | 1.0.0 | Merge disparate timeline events into coherent narrative | gpt-4o | 0.2 |
| `timeline.identify-gaps.default` | 1.0.0 | Identify suspicious gaps or inconsistencies in timeline | gpt-4o | 0.1 |
| `timeline.generate-narrative.default` | 1.0.0 | Generate chronological investigation narrative | gpt-4o | 0.5 |

---

### Agent 9: Intelligent Retrieval Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `retrieval.answer-investigator-query.default` | 1.0.0 | Answer investigator question using retrieved evidence | gpt-4o | 0.3 |
| `retrieval.decompose-query.default` | 1.0.0 | Break complex query into sub-queries for retrieval | gpt-4o | 0.1 |

---

### Agent 10: Automated Reporting Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `reporting.generate-executive-summary.default` | 1.0.0 | Generate executive summary of investigation | gpt-4o | 0.4 |
| `reporting.generate-evidence-section.default` | 1.0.0 | Generate evidence analysis section of report | gpt-4o | 0.3 |
| `reporting.generate-timeline-section.default` | 1.0.0 | Generate timeline section of report | gpt-4o | 0.3 |
| `reporting.generate-recommendations.default` | 1.0.0 | Generate next investigative steps | gpt-4o | 0.4 |
| `reporting.generate-legal-summary.default` | 1.0.0 | Generate legally reviewable summary | gpt-4o | 0.1 |

---

### Agent 11: Risk Assessment Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `risk.explain-risk-factors.default` | 1.0.0 | Explain calculated risk score in plain language | gpt-4o | 0.3 |
| `risk.identify-escalation-indicators.default` | 1.0.0 | Identify signs that risk may escalate | gpt-4o | 0.1 |

---

### Agent 12: Intelligence Fusion Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `fusion.merge-agent-outputs.default` | 1.0.0 | Synthesize all agent findings into unified intelligence | gpt-4o | 0.2 |
| `fusion.identify-contradictions.default` | 1.0.0 | Identify conflicting findings across agents | gpt-4o | 0.1 |
| `fusion.generate-intelligence-summary.default` | 1.0.0 | Generate comprehensive intelligence picture | gpt-4o | 0.3 |

---

### Agent 13: Hypothesis Generation Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `hypothesis.generate-hypotheses.default` | 1.0.0 | Generate 3–5 evidence-backed investigation hypotheses | gpt-4o | 0.6 |
| `hypothesis.rank-hypotheses.default` | 1.0.0 | Rank hypotheses by evidence strength | gpt-4o | 0.2 |

---

### Agent 14: Verification Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `verification.verify-finding.default` | 1.0.0 | Cross-check a finding against evidence and KB | gpt-4o | 0.0 |
| `verification.detect-hallucination.default` | 1.0.0 | Identify claims not supported by evidence | gpt-4o | 0.0 |

---

### Agent 15: Copilot Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `copilot.answer-question.default` | 1.0.0 | Answer investigator question with evidence citations | gpt-4o | 0.4 |
| `copilot.suggest-next-actions.default` | 1.0.0 | Recommend next investigative actions | gpt-4o | 0.4 |
| `copilot.explain-finding.default` | 1.0.0 | Explain an agent finding in plain language | gpt-4o | 0.5 |

---

### Agent 16: Explainability Agent

| Prompt ID | Version | Task | Model | Temp |
|---|---|---|---|---|
| `explainability.explain-conclusion.default` | 1.0.0 | Explain why the platform reached a conclusion | gpt-4o | 0.3 |
| `explainability.generate-confidence-justification.default` | 1.0.0 | Justify confidence score with evidence references | gpt-4o | 0.2 |
| `explainability.generate-legal-citation.default` | 1.0.0 | Format findings for legal citation | gpt-4o | 0.1 |

---

## Prompt Versioning Rules

1. **Patch** (`1.0.x`): Fix typos, improve clarity — no behaviour change
2. **Minor** (`1.x.0`): Add variables, improve examples — backwards compatible
3. **Major** (`x.0.0`): Change output schema, remove variables — breaking change, requires migration sprint

When a major version is released:
- Old version remains `ACTIVE` for 1 sprint
- New version starts as `DRAFT`, promoted to `ACTIVE` after test suite passes
- Old version moves to `DEPRECATED` and then `RETIRED` after 2 sprints

---

## Prompt Storage

Prompts are stored in the PostgreSQL `prompts` table and seeded from `/packages/prompt-registry/seeds/`.

```
packages/
└── prompt-registry/
    ├── seeds/
    │   ├── content-analysis.ts
    │   ├── threat-identification.ts
    │   ├── timeline.ts
    │   └── ...
    ├── src/
    │   ├── registry.service.ts   // getPrompt(id, version?)
    │   ├── renderer.ts           // renderPrompt(prompt, variables)
    │   └── validator.ts          // validateOutput(output, schema)
    └── tests/
        └── *.test.ts             // one test file per prompt file
```

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*
