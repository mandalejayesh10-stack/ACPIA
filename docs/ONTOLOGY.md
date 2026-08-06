# ACPIA — Investigation Ontology

> **Status**: LOCKED — Version 1.0  
> **Authority**: Chief Software Architect  
> **Scope**: Knowledge Graph (Neo4j), PostgreSQL schema, AI agent inputs/outputs, UI  
> **Principle**: Everything is a node. Everything has relationships. Everything is queryable.

---

## Preamble

The ACPIA ontology is the shared language of the entire platform. Every database table, knowledge graph node, agent output, and UI element speaks this language. When an agent extracts a "face from a video", it creates a `Person` node. When it finds a "threatening message", it creates a `Threat` node linked to a `Conversation` node linked to a `Person` node.

This ontology is **not just a data model** — it is the investigation's world model.

---

## Node Taxonomy

```
ACPIA Ontology
├── Actor Nodes
│   ├── Person
│   │   ├── Victim
│   │   ├── Suspect
│   │   └── Witness
│   └── Organization
│
├── Digital Asset Nodes
│   ├── Device
│   ├── Account (social media, messaging, email)
│   ├── Wallet (crypto)
│   └── Evidence
│       ├── ImageEvidence
│       ├── VideoEvidence
│       ├── AudioEvidence
│       ├── DocumentEvidence
│       └── ChatEvidence
│
├── Physical Asset Nodes
│   ├── Location
│   └── Vehicle
│
├── Event Nodes
│   ├── TimelineEvent
│   ├── Communication
│   │   └── Conversation (thread of Communications)
│   └── Transaction
│
├── Intelligence Nodes
│   ├── Threat
│   ├── Risk
│   ├── Hypothesis
│   └── Finding
│
└── Case Nodes
    └── Investigation
```

---

## 1. Person

The most fundamental node. Any human referenced in the investigation.

```typescript
interface PersonNode {
  id: string                    // UUID
  label: 'Person'
  subtype: 'VICTIM' | 'SUSPECT' | 'WITNESS' | 'UNKNOWN'
  aliases: string[]             // known aliases / usernames
  age?: number
  ageRange?: [number, number]   // when exact age unknown
  gender?: string
  nationality?: string
  physicalDescription?: string  // extracted by Content Analysis Agent
  faceClusterId?: string        // face recognition cluster ID
  confidence: number            // extraction confidence
  sourceEvidenceIds: string[]   // evidence that introduced this node
  createdAt: Date
  updatedAt: Date
}
```

### Person Subtypes

| Subtype | Description | Created By |
|---|---|---|
| `VICTIM` | Identified victim (child or adult) | Investigator or Agent 3 |
| `SUSPECT` | Person of interest or confirmed perpetrator | Agent 3, Agent 11 |
| `WITNESS` | Third party referenced in evidence | Agent 4, Agent 8 |
| `UNKNOWN` | Detected but not yet identified | Agent 2 (face detection) |

---

## 2. Organization

Any group, institution, or network.

```typescript
interface OrganizationNode {
  id: string
  label: 'Organization'
  type: 'CRIMINAL_NETWORK' | 'SCHOOL' | 'INSTITUTION' | 'ONLINE_GROUP' | 'UNKNOWN'
  name?: string
  platform?: string             // e.g., Telegram, Discord (for online groups)
  memberIds: string[]           // Person node IDs
  confidence: number
  sourceEvidenceIds: string[]
}
```

---

## 3. Device

Any physical or virtual device referenced in evidence.

```typescript
interface DeviceNode {
  id: string
  label: 'Device'
  type: 'MOBILE' | 'COMPUTER' | 'TABLET' | 'CAMERA' | 'UNKNOWN'
  make?: string
  model?: string
  imei?: string
  macAddress?: string
  serialNumber?: string
  operatingSystem?: string
  osVersion?: string
  lastKnownIp?: string
  confidence: number
  sourceEvidenceIds: string[]
}
```

---

## 4. Account

Any online account, profile, or identity.

```typescript
interface AccountNode {
  id: string
  label: 'Account'
  platform: string              // 'WhatsApp' | 'Instagram' | 'Telegram' | 'Email' | ...
  username?: string
  email?: string
  phoneNumber?: string
  profileUrl?: string
  verified: boolean             // platform-verified
  createdAt?: Date              // account creation date if known
  confidence: number
  sourceEvidenceIds: string[]
}
```

---

## 5. Evidence

The root of all investigation data. Every file uploaded becomes an Evidence node.

```typescript
interface EvidenceNode {
  id: string                    // EV-YYYY-NNNN format
  label: 'Evidence'
  subtype: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'CHAT' | 'METADATA' | 'OTHER'
  filename: string
  mimeType: string
  sizeBytes: number
  hash: string                  // SHA-256
  minioKey: string              // MinIO object key
  uploadedBy: string            // user ID
  uploadedAt: Date
  collectedAt?: Date            // when evidence was physically collected
  collectedFrom?: string        // source description
  chainOfCustody: CoCRecord[]
  status: 'UPLOADED' | 'VALIDATED' | 'ANALYZING' | 'ANALYZED' | 'TAMPERED'
  agentOutputIds: string[]      // IDs of all agent outputs from this evidence
}
```

---

## 6. Location

Any physical or logical location.

```typescript
interface LocationNode {
  id: string
  label: 'Location'
  type: 'GPS_COORDINATE' | 'ADDRESS' | 'LANDMARK' | 'REGION' | 'ONLINE'
  name?: string
  address?: string
  latitude?: number
  longitude?: number
  accuracy?: number             // GPS accuracy in metres
  country?: string
  state?: string
  city?: string
  extractionMethod: 'EXIF' | 'OCR' | 'AI_VISION' | 'MANUAL'
  confidence: number
  sourceEvidenceIds: string[]
}
```

---

## 7. Conversation

A thread of communications between two or more parties.

```typescript
interface ConversationNode {
  id: string
  label: 'Conversation'
  platform: string
  participantIds: string[]      // Account node IDs
  messageCount: number
  startedAt?: Date
  endedAt?: Date
  language?: string
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'SUSPICIOUS' | 'THREATENING'
  threatLevel?: number          // 0–10
  sourceEvidenceIds: string[]
}
```

---

## 8. Threat

A detected threat pattern or behaviour.

```typescript
interface ThreatNode {
  id: string
  label: 'Threat'
  type: 'GROOMING' | 'BLACKMAIL' | 'SEXTORTION' | 'TRAFFICKING' | 'CSAM' | 'VIOLENCE' | 'OTHER'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  confidence: number
  evidenceRefs: string[]
  actorIds: string[]            // Person/Account node IDs implicated
  victimIds: string[]           // Person node IDs at risk
  detectedAt: Date
  verifiedAt?: Date
  verifiedBy?: string           // User ID or Verification Agent
}
```

---

## 9. Risk

An assessment of danger level attached to a person, case, or situation.

```typescript
interface RiskNode {
  id: string
  label: 'Risk'
  targetId: string              // Person, Case, or Investigation node ID
  targetType: 'PERSON' | 'CASE' | 'INVESTIGATION'
  score: number                 // 0.0 – 10.0
  category: 'VICTIM_SAFETY' | 'EVIDENCE_STRENGTH' | 'RECIDIVISM' | 'FLIGHT_RISK'
  factors: RiskFactor[]
  confidence: number
  calculatedAt: Date
  calculatedBy: string          // Agent ID
  requiresHumanReview: boolean  // true if score >= 8.0
}

interface RiskFactor {
  factor: string
  weight: number
  evidenceRefs: string[]
}
```

---

## 10. Wallet

Cryptocurrency or financial account.

```typescript
interface WalletNode {
  id: string
  label: 'Wallet'
  type: 'CRYPTO' | 'BANK_ACCOUNT' | 'PAYMENT_APP'
  currency?: string
  address?: string              // crypto wallet address
  accountNumber?: string
  transactions: TransactionRef[]
  confidence: number
  sourceEvidenceIds: string[]
}
```

---

## 11. Vehicle

Any identified vehicle.

```typescript
interface VehicleNode {
  id: string
  label: 'Vehicle'
  type: 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'UNKNOWN'
  make?: string
  model?: string
  color?: string
  licensePlate?: string
  licensePlateRegion?: string
  confidence: number
  extractionMethod: 'AI_VISION' | 'OCR' | 'MANUAL'
  sourceEvidenceIds: string[]
}
```

---

## 12. TimelineEvent

A single point in time within the investigation narrative.

```typescript
interface TimelineEventNode {
  id: string
  label: 'TimelineEvent'
  type: 'COMMUNICATION' | 'LOCATION' | 'EVIDENCE_CREATED' | 'MEETING' | 'TRANSACTION' | 'THREAT_DETECTED' | 'OTHER'
  title: string
  description: string
  timestamp: Date
  timestampConfidence: 'EXACT' | 'APPROXIMATE' | 'ESTIMATED'
  participantIds: string[]
  locationId?: string
  evidenceRefs: string[]
  significance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}
```

---

## 13. Hypothesis

An AI-generated investigative hypothesis backed by evidence.

```typescript
interface HypothesisNode {
  id: string
  label: 'Hypothesis'
  title: string
  description: string
  supportingEvidenceIds: string[]
  contradictingEvidenceIds: string[]
  confidence: number
  status: 'PROPOSED' | 'SUPPORTED' | 'CONTRADICTED' | 'VERIFIED' | 'REJECTED'
  generatedBy: string           // Agent ID
  verifiedBy?: string           // Verification Agent or Investigator
  verifiedAt?: Date
}
```

---

## 14. Finding

A verified conclusion from the investigation pipeline.

```typescript
interface FindingNode {
  id: string
  label: 'Finding'
  title: string
  description: string
  category: 'THREAT' | 'IDENTITY' | 'LOCATION' | 'TIMELINE' | 'BEHAVIOUR' | 'SYNTHETIC'
  confidence: number
  evidenceRefs: string[]
  agentId: string
  verifiedAt: Date
  verifiedBy: string
  legallyReviewable: boolean
}
```

---

## 15. Investigation

The top-level case container node.

```typescript
interface InvestigationNode {
  id: string                    // CASE-YYYY-NNNN format
  label: 'Investigation'
  title: string
  status: 'OPEN' | 'ACTIVE' | 'PAUSED' | 'CLOSED' | 'ARCHIVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  leadInvestigatorId: string
  teamIds: string[]
  createdAt: Date
  closedAt?: Date
  evidenceCount: number
  agentRunCount: number
  riskScore?: number
}
```

---

## Relationship Types

```cypher
// Actor relationships
(:Person)-[:KNOWS]->(:Person)
(:Person)-[:COMMUNICATED_WITH]->(:Person)
(:Person)-[:VICTIMIZED_BY]->(:Person)
(:Person)-[:OWNS]->(:Device)
(:Person)-[:CONTROLS]->(:Account)
(:Person)-[:MEMBER_OF]->(:Organization)

// Evidence relationships
(:Evidence)-[:CONTAINS]->(:Person)
(:Evidence)-[:CONTAINS]->(:Location)
(:Evidence)-[:CONTAINS]->(:Vehicle)
(:Evidence)-[:PART_OF]->(:Conversation)
(:Evidence)-[:DEPICTS]->(:Threat)

// Communication relationships
(:Account)-[:SENT_MESSAGE_IN]->(:Conversation)
(:Conversation)-[:CONTAINS_THREAT]->(:Threat)
(:Conversation)-[:OCCURRED_ON]->(:Device)

// Temporal relationships
(:TimelineEvent)-[:PRECEDED_BY]->(:TimelineEvent)
(:TimelineEvent)-[:INVOLVED]->(:Person)
(:TimelineEvent)-[:OCCURRED_AT]->(:Location)
(:TimelineEvent)-[:DOCUMENTED_BY]->(:Evidence)

// Intelligence relationships
(:Threat)-[:POSES_RISK_TO]->(:Person)
(:Risk)-[:ASSESSED_FOR]->(:Investigation)
(:Hypothesis)-[:SUPPORTED_BY]->(:Evidence)
(:Finding)-[:DERIVED_FROM]->(:Evidence)
(:Finding)-[:IMPLICATES]->(:Person)

// Case relationships
(:Investigation)-[:INVOLVES]->(:Person)
(:Investigation)-[:CONTAINS]->(:Evidence)
(:Investigation)-[:HAS_FINDING]->(:Finding)
(:Investigation)-[:HAS_HYPOTHESIS]->(:Hypothesis)
```

---

## Ontology Evolution Rules

1. New node types may only be added with Chief Software Architect approval
2. Relationship types may be added in any sprint, but never removed
3. Required fields in node interfaces may never be removed (only deprecated then removed across 2 sprints)
4. Node IDs always follow the format `{TYPE_PREFIX}-{YYYY}-{NNNN}` for user-facing nodes
5. All changes to this document trigger a graph migration task in the next sprint

---

*Last updated: Sprint -1 | Authority: Chief Software Architect*
