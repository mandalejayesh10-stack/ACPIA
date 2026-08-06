# ACPIA — AI Evaluation Framework

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Principle**: We don't ship an agent until we can prove it works. "It looks right" is not a metric.

---

## Overview

For every agent, we must be able to answer: **How do we know this agent works?**

This document defines the evaluation framework for all 16 agents. It covers:
- What ground truth looks like for each agent
- Which metrics are used to measure performance
- What thresholds define "acceptable" vs "needs improvement"
- How to run evaluations
- How to detect regression when a model or prompt changes

---

## 1. Evaluation Architecture

```
Evaluation Dataset (ground truth examples)
        │
        ▼
Agent Executor (real agent, real AI calls)
        │
        ▼
Output Collector
        │
        ▼
Metric Calculators
        │
        ├── Precision / Recall / F1
        ├── Confidence Calibration
        ├── Latency
        ├── Cost
        └── Hallucination Rate
        │
        ▼
Evaluation Report
```

Evaluations run:
1. During CI on PR merge (with mocked AI responses)
2. Weekly against real AI calls (sampled ground truth dataset)
3. Before any prompt version change is deployed
4. After any model upgrade

---

## 2. Evaluation Dataset

The ground truth dataset lives in `/packages/evaluation/datasets/`.

### Dataset Format

```typescript
interface EvaluationExample {
  id: string
  agentId: string
  description: string
  tags: string[]           // 'grooming' | 'image' | 'audio' | 'edge-case' | ...
  
  input: AgentInput        // real agent input
  
  expected: {
    status: 'SUCCESS' | 'PARTIAL'
    minConfidence: number  // expected minimum confidence
    requiredFindings: string[]  // findings that MUST appear
    forbiddenFindings: string[] // findings that MUST NOT appear
    requiredGraphNodes: string[] // entity types that must be in graph output
    requiredTimelineEvents?: number // min timeline events
  }
  
  groundTruth: unknown     // agent-specific structured ground truth
  
  metadata: {
    createdAt: Date
    createdBy: string
    lastValidated: Date
    source: 'SYNTHETIC' | 'REDACTED_REAL'  // all real cases are redacted
  }
}
```

### Dataset Size Requirements

| Agent | Min Examples | Target Examples | Edge Cases |
|---|---|---|---|
| Evidence Intake | 20 | 50 | Invalid files, duplicate uploads |
| Content Analysis | 30 | 80 | Multiple languages, low-quality images |
| Threat Identification | 40 | 100 | True positives, true negatives, ambiguous |
| Context Extraction | 20 | 50 | No GPS, blurry landmarks |
| Activity Pattern | 20 | 50 | Single-person networks, dense networks |
| Metadata Mapping | 20 | 50 | Missing EXIF, corrupt files |
| Synthetic Detection | 30 | 80 | Real vs fake, low quality |
| Timeline Reconstruction | 20 | 60 | Overlapping events, missing dates |
| Intelligent Retrieval | 30 | 80 | Complex queries, no relevant evidence |
| Automated Reporting | 15 | 40 | Minimal evidence, complete investigations |
| Risk Assessment | 30 | 80 | Low risk, high risk, edge cases |
| Intelligence Fusion | 15 | 40 | Contradicting agents, incomplete data |
| Hypothesis Generation | 15 | 40 | Evidence-rich, evidence-sparse |
| Verification | 30 | 80 | True findings, hallucinated findings |
| Copilot | 30 | 80 | Simple queries, complex multi-hop queries |
| Explainability | 20 | 50 | All agent types |

---

## 3. Metrics

### 3.1 Precision, Recall, F1

Applied to classification tasks (threat detection, risk level, entity type).

```
Precision = True Positives / (True Positives + False Positives)
Recall    = True Positives / (True Positives + False Negatives)
F1        = 2 × (Precision × Recall) / (Precision + Recall)
```

| Agent | Target Precision | Target Recall | Target F1 |
|---|---|---|---|
| Threat Identification | ≥ 0.85 | ≥ 0.90 | ≥ 0.87 |
| Synthetic Detection | ≥ 0.90 | ≥ 0.85 | ≥ 0.87 |
| Risk Assessment (level) | ≥ 0.80 | ≥ 0.85 | ≥ 0.82 |
| Entity classification | ≥ 0.80 | ≥ 0.75 | ≥ 0.77 |

**Note on Recall priority**: For child safety contexts, **false negatives are more dangerous than false positives**. We prioritize recall over precision — better to over-flag and have a human review than to miss a threat.

---

### 3.2 Confidence Calibration

A well-calibrated model's confidence matches its actual accuracy. If an agent says "90% confidence" for 100 claims, approximately 90 of them should be correct.

**Measurement**: Expected Calibration Error (ECE)

```
ECE = Σ (|confidence_bin| / n) × |accuracy_bin - confidence_bin|
```

| Agent | Target ECE |
|---|---|
| All AI agents | ≤ 0.10 |

---

### 3.3 Latency

| Agent | Target P50 | Target P95 | Hard Timeout |
|---|---|---|---|
| Evidence Intake | < 5s | < 15s | 30s |
| Content Analysis | < 15s | < 45s | 120s |
| Threat Identification | < 10s | < 30s | 60s |
| Context Extraction | < 12s | < 40s | 90s |
| Activity Pattern | < 8s | < 25s | 60s |
| Metadata Mapping | < 3s | < 10s | 30s |
| Synthetic Detection | < 20s | < 60s | 120s |
| Timeline Reconstruction | < 15s | < 45s | 120s |
| Intelligent Retrieval | < 8s | < 20s | 60s |
| Automated Reporting | < 30s | < 90s | 180s |
| Risk Assessment | < 8s | < 25s | 60s |
| Intelligence Fusion | < 15s | < 45s | 120s |
| Hypothesis Generation | < 15s | < 45s | 120s |
| Verification | < 10s | < 30s | 60s |
| Copilot (per query) | < 5s | < 15s | 30s |
| Explainability | < 8s | < 25s | 60s |

---

### 3.4 Hallucination Rate

Measures how often the agent makes claims not supported by the provided evidence.

```
Hallucination Rate = Unsupported Claims / Total Claims
```

**Target**: ≤ 5% for all agents  
**Critical agents** (Verification, Threat, Risk): ≤ 2%

**Detection method**: The Verification Agent runs as both a production agent and an evaluation tool. During evaluation, it checks every other agent's outputs for unsupported claims.

---

### 3.5 Evidence Citation Coverage

```
Citation Coverage = Claims with evidenceRefs / Total Claims
```

**Target**: 100% (enforced at the TypeScript type level)

---

### 3.6 Cost per Evaluation Run

| Agent | Target Cost (per example) |
|---|---|
| No-LLM agents (1, 6, 7) | $0.00 |
| Simple reasoning agents | ≤ $0.05 |
| Vision agents | ≤ $0.15 |
| Complex reasoning agents | ≤ $0.10 |
| Full pipeline evaluation | ≤ $1.00 per example |

---

## 4. Per-Agent Evaluation Criteria

### Agent 1: Evidence Intake
- **What we test**: Hash correctness, file type detection, CoC record creation
- **Key metric**: 100% hash correctness (deterministic — zero tolerance for errors)
- **Ground truth**: Pre-computed SHA-256 hashes for each test file

### Agent 2: Content Analysis
- **What we test**: Object detection accuracy, face detection, OCR accuracy, audio transcription WER
- **Key metrics**: Object F1 ≥ 0.75, OCR Character Error Rate ≤ 5%, Whisper WER ≤ 10%
- **Ground truth**: Human-labeled image descriptions, OCR transcripts, audio transcripts

### Agent 3: Threat Identification
- **What we test**: Threat category classification, severity level, false positive rate on benign content
- **Key metrics**: Recall ≥ 0.90 (never miss a real threat), Precision ≥ 0.80
- **Ground truth**: Human-labeled threat categories, confirmed by domain experts (cybercrime specialists)

### Agent 4: Context Extraction
- **What we test**: Landmark identification, vehicle/uniform detection, organization identification
- **Key metrics**: Object extraction recall ≥ 0.70, GPS extraction accuracy (within 1km)
- **Ground truth**: Human-labeled context annotations

### Agent 5: Activity Pattern
- **What we test**: Correct identification of escalation patterns, network role assignment
- **Key metrics**: Escalation detection recall ≥ 0.85, role assignment accuracy ≥ 0.75
- **Ground truth**: Expert-labeled communication patterns

### Agent 6: Metadata Mapping
- **What we test**: EXIF extraction completeness, GPS parsing accuracy, device fingerprinting
- **Key metrics**: Metadata completeness ≥ 95%, GPS accuracy within 100m
- **Ground truth**: ExifTool reference output for each test file

### Agent 7: Synthetic Detection
- **What we test**: Deepfake/synthetic detection on labeled real vs. synthetic media
- **Key metrics**: F1 ≥ 0.87, False Negative Rate ≤ 15% (don't miss synthetic media)
- **Ground truth**: Labeled dataset of real and AI-generated images/videos/audio

### Agent 8: Timeline Reconstruction
- **What we test**: Event ordering accuracy, gap detection, narrative coherence
- **Key metrics**: Event ordering accuracy ≥ 0.90, gap detection recall ≥ 0.80
- **Ground truth**: Human-constructed timelines from same evidence

### Agent 9: Intelligent Retrieval
- **What we test**: Relevance of retrieved evidence for given queries
- **Key metrics**: NDCG@5 ≥ 0.80, MRR ≥ 0.75
- **Ground truth**: Human-labeled relevance judgments for query-evidence pairs

### Agent 10: Automated Reporting
- **What we test**: Report completeness, fact accuracy, citation coverage
- **Key metrics**: Citation coverage 100%, fact error rate ≤ 3%, section completeness ≥ 90%
- **Ground truth**: Human-written reference reports on same cases

### Agent 11: Risk Assessment
- **What we test**: Risk score calibration, factor identification
- **Key metrics**: Risk level accuracy ≥ 0.80, calibration ECE ≤ 0.10
- **Ground truth**: Expert-assigned risk levels for each case scenario

### Agent 12: Intelligence Fusion
- **What we test**: Contradiction detection, synthesis quality, information loss
- **Key metrics**: Contradiction detection recall ≥ 0.85, no information loss ≥ 0.90
- **Ground truth**: Human fusion of same agent outputs

### Agent 13: Hypothesis Generation
- **What we test**: Hypothesis plausibility, evidence grounding, diversity of hypotheses
- **Key metrics**: Evidence grounding ≥ 0.90, hypothesis relevance ≥ 0.80 (human rating)
- **Ground truth**: Expert-generated hypotheses for same cases

### Agent 14: Verification
- **What we test**: Ability to detect hallucinated claims, correctly validate true claims
- **Key metrics**: Hallucination detection precision ≥ 0.90, recall ≥ 0.85
- **Ground truth**: Hand-crafted mix of true and hallucinated claims

### Agent 15: Copilot
- **What we test**: Answer relevance, citation accuracy, response latency
- **Key metrics**: Relevance ≥ 0.85 (human rating), citation accuracy 100%, P95 latency ≤ 15s
- **Ground truth**: Expert Q&A pairs with reference answers

### Agent 16: Explainability
- **What we test**: Explanation clarity, completeness, legal reviewability
- **Key metrics**: Clarity score ≥ 4/5 (human rating), completeness ≥ 0.90
- **Ground truth**: Expert-written explanations

---

## 5. Regression Testing

Before any prompt version upgrade (major or minor):

1. Run the full evaluation suite against the **current** prompt version → record baseline metrics
2. Deploy the **new** prompt version to staging
3. Run the full evaluation suite against the **new** prompt version
4. Compare: no metric may regress by more than 5% from baseline
5. If regression detected → block deployment, notify Chief Software Architect
6. If passed → deploy to production

---

## 6. Running Evaluations

```bash
# Run evaluation for a specific agent
pnpm run evaluate --agent content-analysis --dataset datasets/content-analysis.json

# Run full evaluation suite (uses mocked AI in CI)
pnpm run evaluate:all --mock

# Run with real AI calls (expensive — weekly only)
pnpm run evaluate:all --real --budget 10.00

# Generate evaluation report
pnpm run evaluate:report --output reports/evaluation-2024-01.md
```

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*
