# Phase 6 comprehension-study packet

**Status:** Prepared during Phase 6. Phase 6 later closed via project-owner user-confirmed external validation; human comprehension testing still has **not** been run. Phase 7A execution should use `reports/testing/phase7a-comprehension-protocol.md`, which supersedes this packet as the active moderated-study protocol.  
**Purpose:** Give Testing a fixed pilot protocol for the later moderated comprehension gate without treating software/render validation as evidence of learning.  
**Authoritative interaction environment:** The project application after the pinned Phase-6 browser matrix passes.  
**Visuals included here:** Current-renderer **system-Chromium study candidates**, not the authoritative Playwright screenshot-regression baselines. They are included so task wording and expected answers can be reviewed now. Replace/confirm them against the pinned baselines before moderated testing if the pinned render differs materially.

## 1. Study principles

- Ask participants to answer from Explore before opening Detail unless the task explicitly allows Detail.
- Do not teach the answer in the question wording.
- The visual key may remain visible; relationship-family recognition is allowed to use it.
- Do not infer facts that the authored model does not contain.
- Treat a critical misconception as a design failure even when other task answers are correct.
- Record whether the participant used visual structure, labels, the key, Detail, or guessing.
- For representative contexts, never describe the exemplar as a numbered real member.
- For Meta, use the accepted distinction-oriented learning goal: the physical RoCE fabric and the separately modeled compute-to-storage logical data path are different modeled relationships. Do not grade an unmodeled RoCE-intermediate logical hop as correct.

## 2. Candidate visuals

### H100 — checkpoint / storage pressure

`reports/implementation/phase6-study-images/h100-checkpoint.png`

Use for containment, Representative context, scale-up/scale-out boundary, Anatomy, and simultaneous focus/Selection/Scenario-context interpretation.

### GB300 — North/South / storage pressure

`reports/implementation/phase6-study-images/gb300-storage-pressure.png`

Use for rack containment, ×18 compute versus ×9 switch populations, external dependencies, and explicitly schematic rack organization.

### Meta — checkpoint / storage burst

`reports/implementation/phase6-study-images/meta-checkpoint.png`

Use for the accepted physical-RoCE-versus-logical-storage-path distinction and Scenario-path interpretation.

## 3. Core tasks and expected answers

| Task | Prompt | Expected answer / scoring basis |
|---|---|---|
| Current location | “What physical/structural thing are you looking inside right now?” | Names the current enclosure at the appropriate scale; H100 should be a **Representative compute node**, GB300 the **GB300 NVL72 rack / scalable unit**, Meta the **Meta 24K H100 RoCE training cluster**. |
| Containment | “Which visible things are inside this boundary, and which visible destinations are outside it?” | Correctly separates enclosed components/populations from labeled boundary destinations; a Cross-Connection must not be described as containment. |
| Representation | “Does every repeated-looking object here represent one exact physical member?” | Recognizes aggregate `×N` populations and the H100 Representative context as an exemplar, not a numbered member. |
| Anatomy | “Are the physical-anatomy items selectable system elements? Are their drawn positions literal?” | **No** to both. Anatomy is noninteractive physical context; the current pilot anatomy uses schematic placement. |
| Relationship family | “Which lines represent physical connectivity, data/communication path, control/management, or dependency?” | Uses the key and base line/endpoint syntax; answer cannot depend only on color. |
| Scenario | “What is the active Scenario demonstrating, and did the physical structure change?” | Identifies the authored Scenario emphasis and states that canonical physical structure/containment remains unchanged. |
| Interaction state | “What is selected? What is merely focused/inspected? What is Scenario-affected?” | Correctly distinguishes persistent Selection, transient focus/Inspect, and Scenario emphasis when multiple cues coexist. |
| Scale | “How many modeled members does this population represent?” | Reads the visible `×N` cue and understands the repetition motif is symbolic rather than literal member materialization. |

## 4. Architecture-specific tasks

### 4.1 DGX H100

1. **Scale-up versus leaving the node**  
   Prompt: “Which connection is node-local scale-up, and which interfaces lead outside this node to broader fabrics?”  
   Expected: the GPU↔NVSwitch fabric is node-local scale-up; compute HCAs and storage/in-band interfaces connect beyond the node boundary to the respective external fabrics/management destinations.

2. **Representative context**  
   Prompt: “Is this drawing one specific DGX node from the deployment?”  
   Expected: no. It is a **Representative compute node**, an exemplar from the authored aggregate population.

3. **Anatomy fidelity**  
   Prompt: “Does the fan/power/baseboard/PCIe placement show exact mechanical locations?”  
   Expected: no; presence is supported while positions are schematic.

### 4.2 GB300

1. **Rack populations**  
   Prompt: “What are the two repeated populations inside the rack and how many of each are modeled?”  
   Expected: **Compute trays ×18** and **NVLink switch trays ×9**.

2. **Internal versus external support**  
   Prompt: “Which cooling/power/network items are inside the rack drawing and which are external dependencies or destinations?”  
   Expected: the rack/tray liquid-cooling distribution Anatomy item is inside the enclosure; rack-scale cooling infrastructure, rack power shelves, management, and external fabric destinations are shown at the boundary and are not silently converted into rack children.

3. **Rack fidelity**  
   Prompt: “Are these literal U positions or exact physical tray spacing?”  
   Expected: no; the population bands are explicitly schematic/nonliteral.

### 4.3 Meta

1. **RoCE versus storage path — accepted learning goal**  
   Prompt: “Identify the physical RoCE fabric relationship and then trace the modeled compute-to-storage logical path. Are they the same relationship?”  
   Expected: no. Compute is physically connected to the visible RoCE fabric; a separate modeled data/communication path connects compute to storage. The model does **not** author the RoCE aggregate as an intermediate endpoint of that logical storage path.

2. **Checkpoint Scenario**  
   Prompt: “What is emphasized during the checkpoint/storage burst?”  
   Expected: the compute-to-storage logical data path and storage service boundary/YV3 storage are emphasized; the cluster topology remains fixed.

3. **Do-not-infer check**  
   Prompt: “Does the drawing prove that the logical storage path traverses the visible RoCE switch aggregate?”  
   Expected: no. That intermediate logical hop is not authored in the current model.

## 5. Critical misconceptions — automatic design-review trigger

Any of the following should be recorded as a critical misconception and returned to the responsible presentation phase before comprehension approval:

- schematic placement interpreted as literal physical placement;
- Representative Member interpreted as a specific numbered physical member;
- Cross-Connection interpreted as canonical containment;
- Anatomy Depiction interpreted as an interactive Entity/Selection target;
- Scenario interpreted as changing canonical identity or containment;
- aggregate/backplate repetition interpreted as individually modeled member identities;
- relationship-family distinction inferred only from color;
- Meta logical storage path interpreted as proof of an authored RoCE-intermediate logical hop.

The later Ironwood transfer study adds two further critical misconceptions after Phase 7 implements the flat torus depiction: literal chip placement/dimensions inferred from the flattened topology, or paired wraparound segments interpreted as separate connections/system elements.

## 6. Provisional scoring targets

Use the plan's current go/no-go hypotheses until Testing finalizes the moderated protocol:

- **0 critical semantic misconceptions** in the moderated pilot;
- **≥85% task accuracy** for current location, containment, population/representation, and Scenario questions;
- **≥75% first-pass relationship-family identification** with the visible key available, improving after one exposure;
- no task may require color or hover alone.

These are acceptance hypotheses, not results. Record sample size, participant background, uncertainty, and any learning effect from repeated exposure before treating the percentages as evidence.

## 7. Moderator record template

For each task record:

- participant/session ID;
- scene/task ID;
- answer: correct / partially correct / incorrect;
- confidence (participant-reported if collected);
- visual cue(s) used;
- whether Detail/key was opened or consulted;
- misconception category, if any;
- moderator note using neutral wording;
- whether the issue appears content, visual syntax, interaction, accessibility, or task-wording related.

## 8. Phase-6 handoff note

Phase 6 is now closed by project-owner user-confirmed external validation after the Implementation Continued fixes; those dependency-backed runs were not performed by this Visual Design handoff. Phase 7 has also completed the Ironwood/Cerebras transfer work. The active Phase-7A moderator protocol is now `reports/testing/phase7a-comprehension-protocol.md`. This Phase-6 packet remains historical preparation evidence only and makes no human-comprehension claim.
