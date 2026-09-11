# Phase 7A moderated comprehension protocol

**Status:** HISTORICAL PROTOCOL — Phase 7A is closed by project-owner user-confirmed external validation; no moderated participant dataset was run or supplied in this handoff.  
**Date prepared:** 2026-09-10  
**Owner:** Testing  
**Gate:** Phase 7A — comprehension validation after Phase 7 transfer approval

## Purpose

Evaluate whether the current Explore visual language helps people correctly understand physical organization, containment, relationship type, scale/representation, Scenario context, and the approved Ironwood/Cerebras transfer concepts without introducing the critical misconceptions defined by the visual-design plan.

This protocol is a **human-comprehension gate**. Renderer validation, screenshots, automated geometry checks, or an assistant/expert review are not substitutes for participant evidence.

## Preconditions

- Phase 6 software/accessibility gate is closed by the project owner's user-confirmed validation after the Implementation Continued fixes. That validation was not executed by this handoff.
- Phase 7 transfer validation passes for Ironwood root/cube and Cerebras root/Representative CS-3/Representative WSE-3.
- Use the validated application build for moderated sessions where practical. Static images may be used for fixed visual questions, but interactive questions should use the application.
- If the authoritative pinned visual baseline differs materially from the study images listed below, use the validated application/baseline rather than the older image.

## Study scenes

### Primary pilot scenes

- H100 — Representative compute node, checkpoint/storage Scenario.
- GB300 — NVL72 rack, North/South/storage-pressure Scenario.
- Meta — root/system view, checkpoint/storage burst.

Existing orientation images:

- `reports/implementation/phase6-study-images/h100-checkpoint.png`
- `reports/implementation/phase6-study-images/gb300-storage-pressure.png`
- `reports/implementation/phase6-study-images/meta-checkpoint.png`

### Transfer scenes

- Ironwood root — topology domain, Optical Circuit Switch network, data-center network, cooling.
- Ironwood cube — flattened schematic of the documented 3D torus.
- Cerebras root — CS-3 ×64, MemoryX, SwarmX, preprocessing, management.
- Representative CS-3 — WSE-3 plus integrated support Anatomy and external relationships.
- Representative WSE-3 — AI compute cores ×900,000, SRAM, wafer mesh.

Current transfer images:

- `reports/implementation/phase7-transfer-images/ironwood-root-transfer.png`
- `reports/implementation/phase7-transfer-images/ironwood-cube-flattened-torus.png`
- `reports/implementation/phase7-transfer-images/cerebras-root-transfer.png`
- `reports/implementation/phase7-transfer-images/cerebras-representative-cs3-transfer.png`
- `reports/implementation/phase7-transfer-images/cerebras-representative-wse3-transfer.png`

## Moderator procedure

1. Begin without explaining the visual grammar. The visible key may remain available because relationship-family recognition is designed to use it.
2. Ask the participant to answer from Explore before opening Detail unless a prompt explicitly permits Detail.
3. Do not correct an answer until that task has been scored. Avoid leading wording.
4. Record the cue(s) the participant used: enclosure, label, role/icon, count, edge syntax/key, Scenario strip, state overlay, boundary stub, topology guide, Detail, or guess.
5. Record whether the participant treats a visual position, repetition motif, topology segment, or connection route as literal physical fact.
6. For a critical misconception, record the participant's wording verbatim enough to diagnose the cue that failed, but do not coach it away before the session's related tasks are complete.
7. After first-pass relationship questions, one brief orientation to the visible key may be given if the study design includes the planned post-exposure measure. Keep first-pass and post-exposure scores separate.

## Core tasks

| ID | Prompt | Expected answer / scoring basis |
|---|---|---|
| CORE-LOCATION | “What physical or structural thing are you looking inside right now?” | Names the current enclosure at the appropriate scale. |
| CORE-CONTAINMENT | “Which visible things are inside this boundary, and which visible destinations are outside it?” | Separates contained children/Anatomy from external boundary destinations; does not treat Cross-Connection as containment. |
| CORE-REPRESENTATION | “Does every repeated-looking object here represent one exact physical member?” | Distinguishes one semantic entity, aggregate `×N`, Representative exemplar, and decorative repetition. |
| CORE-ANATOMY | “Are these physical-anatomy items selectable system elements? Are their drawn positions necessarily literal?” | No; Anatomy is noninteractive physical context and current initial-five placement is schematic unless explicitly marked otherwise. |
| CORE-RELATION | “What kind of relationship does this line represent?” | Uses relationship syntax/key rather than color alone; distinguishes at least physical connectivity, data/communication path, dependency/service, and control/management where present. |
| CORE-SCENARIO | “What is this Scenario demonstrating, and did the physical structure change?” | Identifies authored Scenario emphasis and understands canonical physical structure/containment remains fixed. |
| CORE-STATE | “What is selected, what is focused/inspected, and what is Scenario-affected?” | Separates persistent Selection, transient focus/Preview, and Scenario emphasis. |
| CORE-SCALE | “How many modeled members does this represent?” | Reads the authored count and understands the bounded stack/repetition motif is symbolic. |
| CORE-SCHEMATIC | “Does the amount of blank space or the exact position here tell you a measured physical distance or unused chassis volume?” | No, unless separately authored; layout is schematic presentation geometry. |

## Architecture-specific tasks

### H100

- **H100-1 — scale-up versus external paths:** “Which connection is node-local scale-up, and which interfaces lead beyond this node?” Expected: GPU↔NVSwitch is local scale-up; compute/storage/management interfaces cross the node boundary to external fabrics/destinations.
- **H100-2 — Representative context:** “Is this one specific numbered DGX node?” Expected: no; it is a Representative compute node exemplar from an aggregate population.
- **H100-3 — Anatomy fidelity:** “Do the fan/power/baseboard/PCIe locations show exact mechanical placement?” Expected: no; presence is supported and positions are schematic.

### GB300

- **GB300-1 — repeated rack populations:** identify **Compute trays ×18** and **NVLink switch trays ×9**.
- **GB300-2 — internal versus external support:** distinguish rack/tray cooling Anatomy inside the schematic enclosure from cooling/power/management/fabric boundary relationships outside it.
- **GB300-3 — rack fidelity:** state that population bands do not claim literal U positions or exact tray spacing.

### Meta

- **META-1 — accepted RoCE/storage distinction:** “Identify the physical RoCE fabric relationship, then trace the modeled compute-to-storage logical path. Are they the same relationship?” Expected: no; the current model has a physical RoCE fabric relationship and a separately modeled compute-to-storage logical path.
- **META-2 — do-not-infer check:** “Does this drawing prove that the logical storage path traverses the visible RoCE aggregate?” Expected: no; that intermediate logical hop is not authored.
- **META-3 — Scenario:** identify checkpoint/storage emphasis without claiming structural reconfiguration.

### Ironwood

- **IRONWOOD-1 — topology versus optical role:** “Which visible part represents the compute/topology domain, and which represents the optical/reconfigurable network role?” Expected: cube/topology domain remains distinct from the Optical Circuit Switch network.
- **IRONWOOD-2 — flattened 3D torus:** “What do A, B, and C mean here?” Expected: abstract topology dimensions, not physical X/Y/Z axes or exact measured directions.
- **IRONWOOD-3 — wraparound identity:** point to one pair such as `A1`. Ask: “Are these two visible pieces two different system connections?” Expected: no; they are visually separated portions of the **same conceptual wraparound connection** across opposite boundaries.
- **IRONWOOD-4 — nonliteral topology:** “Does this square tell you the exact positions of 64 chips or exact dimension lengths?” Expected: no; it is a flat conceptual illustration of documented 3D-torus behavior.
- **IRONWOOD-5 — semantic isolation:** “Can you select/follow A1 as if it were an authored system Cross-Connection?” Expected: no; the torus depiction is presentation-only and does not add canonical entities/relationships.

### Cerebras

- **CEREBRAS-1 — disaggregation:** identify CS-3 compute, MemoryX model-memory, and SwarmX collective/fabric roles as physically distinct cooperating systems rather than nested parts of one chassis.
- **CEREBRAS-2 — n-ary/path interpretation:** identify the modeled relationship involving MemoryX, SwarmX, and CS-3 without turning visual routing into new containment.
- **CEREBRAS-3 — huge aggregate:** “Does `×900000` mean 900,000 separately drawn/selectable cores?” Expected: no; it is one aggregate representation with an authored population count.
- **CEREBRAS-4 — sparse-context fidelity:** “Does the remaining whitespace in CS-3/WSE-3 imply measured physical separation?” Expected: no; presentation has been compacted and does not assert exact dimensions.

## Critical misconceptions

Any occurrence below fails the **zero-critical-misconception** gate and must be diagnosed before Phase 8:

- schematic placement treated as exact physical placement;
- Representative Member treated as a specific numbered real member;
- Cross-Connection treated as canonical containment;
- Anatomy Depiction treated as an interactive entity;
- Scenario treated as changing canonical physical identity/containment;
- role icon/media fallback treated as literal component appearance or physical scale;
- sparse whitespace treated as authored physical distance or unused volume;
- Meta logical compute-to-storage path treated as proof of an unmodeled RoCE-intermediate hop;
- flattened Ironwood torus treated as literal chip placement, exact dimension lengths, or newly authored chip-to-chip physical Cross-Connections;
- paired opposite-boundary portions of one torus wrap connection treated as separate system elements/connections.

## Provisional acceptance thresholds

Use the plan's current hypotheses unless Testing records an evidence-based revision **before** interpreting results:

- **0 critical semantic misconceptions**;
- **≥85% accuracy** on current location, containment, population/representation, and Scenario tasks;
- **≥75% first-pass relationship-family identification** with the visible key available, with improvement after one exposure if a post-exposure measure is collected;
- no task depends on color or hover alone.

Report sample size, participant background, uncertainty, and repeated-exposure effects. Do not present these provisional percentages as statistically powered claims unless the study design supports that interpretation.

## Per-task record

Record participant/session ID, task ID, answer classification (correct/partial/incorrect), cue(s) used, Detail/key usage, misconception category if any, moderator note, and likely issue class (content / visual syntax / interaction / accessibility / task wording).

## Gate rule

This protocol remains the intended method for future direct comprehension studies. For the current project state, Phase 7A is closed by explicit project-owner confirmation of external validation, recorded separately in `reports/testing/phase7a-user-confirmed-validation.json`. This handoff does not infer participant metrics that were not supplied.
