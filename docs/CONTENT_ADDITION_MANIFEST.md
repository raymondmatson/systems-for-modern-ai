# Systems for Modern AI — Content Addition Manifest

**Created:** 2026-09-01  
**Reconciled against supplied repository baseline:** 2026-09-07  
**Baseline:** `systems-for-modern-ai.zip` supplied with this planning pass; no newer repository is assumed.  
**Scope:** Current authored Reference Systems, Reference Configurations, Version-1 Scenario catalogs, and the physical-orientation additions that must be handed to Implementation.  
**Status:** Planning/content manifest — baseline-reconciled. Historical implementation claims are retained only as history; the **Baseline ZIP verification** and **Planning disposition** tables added below govern current work.

## Review principles

This manifest applies the project content-depth, fidelity, aggregation, Concept, Scenario, Property, **Physical Orientation Baseline**, Anatomy Depiction, Product Catalog, and readiness rules. Additions are included only when they have a clear architectural or educational purpose. Repeated identical hardware remains aggregate or representative-member content unless individual identity matters. Unknown, proprietary, deployment-variable, or insufficiently documented structure remains explicitly bounded rather than fabricated.

### Status interpretation after baseline reconciliation

The original manifest used **Implemented** for three different stages (candidate identified, evidence accepted, and canonical change reportedly completed). That wording is no longer a reliable indicator of the supplied repository state. To preserve history without misrepresenting the current ZIP:

- every existing table's last column is now interpreted as **Historical reported status** only;
- the original item IDs, research notes, deliberate closures, and proposed changes are preserved;
- the current authoritative planning state is recorded in the **Baseline ZIP reconciliation** tables below; and
- no item is considered delivered until its canonical source change is visible in the supplied/current implementation repository and the required validation gates pass.

Current baseline-verification values:

- **Present** — the proposed result is materially present in the supplied ZIP; Implementation should verify/retain it.
- **Partial** — part of the proposed structure/explanation exists, but the manifest outcome is not fully present.
- **Absent** — the proposed addition is not present in the supplied ZIP.
- **Closed / not applicable** — the deliberate no-addition decision remains valid.
- **Superseded by newer baseline content** — the baseline already contains a newer/equivalent treatment; do not recreate the older proposal literally.

Current planning-disposition values:

- **Implement** — add the missing canonical content after evidence verification.
- **Revise / complete** — preserve valid existing identity/content and complete the missing treatment.
- **Retain / verify** — keep the baseline implementation, revalidate it after related migrations.
- **Verify first, then implement if supported** — the evidence gate remains consequential.
- **Closed — no addition** — preserve the deliberate omission/closure.

The supplied baseline has a mixed RSC source-schema corpus (the five initial configurations on 1.4.0 and later-candidate files on preserved earlier schema revisions). Historical validator/report claims do not waive revalidation after physical-anatomy/Product-Catalog work.

## Global / cross-file additions

| ID | Affected scope | Proposed addition | Type | Purpose | Files expected to change | Evidence needed | Initial confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| G-01 | Multiple systems | Add `system_memory` controlled entity type for architecture-relevant host/CPU DRAM | Schema / structural | Represent real host memory as a physical data-movement tier without misusing HBM/on-chip memory types | both RSC schemas, capability registry, affected RSCs | NVIDIA DGX H100/GB300, AWS Trn2, and Google TPU host-memory documentation | High | none | Implemented |
| G-02 | GB300 and AMD Helios | Add `power_system` controlled entity type for physically distinct rack power shelves / rack power-delivery assemblies | Schema / structural | Represent architecture-defining rack power hardware without misusing generic groups | both RSC schemas, capability registry, affected RSCs | NVIDIA GB300 and AMD Helios official rack documentation | High | none | Implemented |
| G-03 | Property-bearing additions | Extend Property Registry only for comparison-capable structured values actually added by this review | Property | Preserve Property ID/unit/scope/basis/evidence semantics | `property/property_registry.yaml` | Source values from each addition | High | All property additions | Implemented |
| G-04 | Concept-linked additions | Reuse the existing 15-Concept library; no new global Concept record is required by this completeness pass | Concept | Avoid duplicate explanations while improving architecture↔Concept traversal through additional occurrences | affected RSC Concept links only | Existing Concept coverage plus branch research | High | none | Closed — no addition |

---

## NVIDIA DGX H100 SuperPOD — `h100-superpod-4su-reference`

### Visual-layer inventory

| Layer / branch | Current represented contents | Expected architectural contents from available evidence | Missing objects / relationships | Gap type | Proposed final contents |
|---|---|---|---|---|---|
| Tier 1 / SuperPOD root | Representative Scalable Unit; compute-fabric IB switches; generic management/UFM; certified storage | Distinct compute, storage, in-band management, and out-of-band management fabrics/support roles | Storage-fabric switches; in-band Ethernet; OOB management fabric; clearer storage path separation | Structural + explanatory | Root exposes compute fabric, storage fabric, in-band management, OOB management, storage boundary, representative SU |
| SU / DGX node | H100 GPUs; Xeon CPUs; NVSwitch; one 10-interface CX-7 aggregate; one generic NVMe aggregate | 8 compute HCAs, 2 storage/in-band CX-7 cards, OS NVMe RAID1, data-cache NVMe RAID0, system DRAM, BMC | Network roles conflated; OS and cache storage conflated; host memory/BMC absent | Structural + explanatory | Representative DGX node distinguishes compute networking, storage/in-band networking, OS storage, cache storage, host memory where appropriate, BMC |
| Connections | NVLink; generic CX7→compute fabric; node→storage | NVLink/NVSwitch; compute IB; storage IB; in-band Ethernet; OOB management; storage data path | Three distinct external network roles and management relationship | Structural | Typed role-specific Cross-Connections |
| Scenarios | Baseline; backend-fabric bottleneck | Baseline plus compute-fabric pressure and storage/checkpoint pressure are both educationally material | Storage-path operating state absent | Scenario | Add checkpoint/storage-pressure Scenario using fixed architecture |

| ID | Branch / component | Proposed addition | Type | Purpose | Files expected to change | Evidence needed | Initial confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| H100-01 | DGX node / `h100-cx7` | Correct aggregate to the 8 single-port ConnectX-7 compute HCAs; preserve stable ID | Structural + property | Separate scale-out compute network from storage/management Ethernet roles | `content/RSCs/nvidia_dgx_h100_superpod.yaml` | NVIDIA DGX H100 hardware overview | High | none | Implemented |
| H100-02 | DGX node | Add separate aggregate for 2 dual-port ConnectX-7 storage/in-band Ethernet cards | Structural | Teach that “the network” has distinct fabrics and interfaces | same RSC | NVIDIA hardware overview + SuperPOD network guide | High | H100-01 | Implemented |
| H100-03 | DGX node / local storage | Refine existing local NVMe as data-cache NVMe and add separate OS NVMe RAID1 aggregate | Structural + property | Explain boot/OS versus data-cache storage roles | same RSC | NVIDIA hardware overview | High | none | Implemented |
| H100-04 | DGX node | Add 2 TB system-memory representation if G-01 is accepted; otherwise preserve as structured node property | Structural/property | Complete CPU↔host-memory↔GPU data-movement picture | same RSC, possibly schema/capabilities/property registry | NVIDIA hardware overview | High | G-01 decision | Implemented |
| H100-05 | DGX node | Add BMC / out-of-band management endpoint | Structural + relationship | Make management network physically anchorable | same RSC | NVIDIA hardware overview | High | none | Implemented |
| H100-06 | SuperPOD root | Add storage-fabric InfiniBand switch aggregate (MQM9700 family) | Structural + product identity | Distinguish compute and storage fabrics | same RSC | NVIDIA SuperPOD network guide | High | none | Implemented |
| H100-07 | SuperPOD root | Add in-band management Ethernet switch/fabric aggregate (SN4600C family) | Structural + product identity | Teach separate in-band management path | same RSC | NVIDIA SuperPOD network guide | High | H100-02 | Implemented |
| H100-08 | SuperPOD root | Refine management branch as explicit OOB network/switch role (SN2201 family) while retaining UFM management context | Structural + product identity | Separate management services from OOB transport | same RSC | NVIDIA SuperPOD network guide | High | H100-05 | Implemented |
| H100-09 | External network paths | Add role-specific compute, storage, in-band, OOB, and storage data-path Cross-Connections | Relationship | Make all architecture-defining network roles traversable | same RSC | NVIDIA hardware/network docs | High | H100-02,06,07,08 | Implemented |
| H100-10 | Scenarios | Add checkpoint/storage-pressure Scenario targeting storage interfaces/fabric/storage boundary | Scenario | Teach checkpoint I/O as a distinct cluster data path | `scenarios/h100-superpod-4su-reference.yaml` | NVIDIA storage/network role docs; scenario remains educational/simplified | Medium-high | H100-06,09 | Implemented |
| H100-11 | DGX node | Add source-faithful host-power context (six 3.3-kW PSUs, 4+2 redundancy / system maximum where supported) as properties/evidence rather than six visual PSU objects | Property/explanatory | Explain node power/redundancy without cluttering the physical layer with repetitive supplies | `content/RSCs/nvidia_dgx_h100_superpod.yaml`, Property Registry if needed | NVIDIA DGX H100 hardware guide | High | G-03 | Implemented |

---

## NVIDIA DGX GB300 NVL72 / SuperPOD — `gb300-nvl72-superpod-reference`

### Visual-layer inventory

| Layer / branch | Current represented contents | Expected contents | Missing objects / relationships | Gap type | Proposed final contents |
|---|---|---|---|---|---|
| Rack | 18 compute trays; 9 NVLink switch trays | Compute trays, switch trays, rack OOB switches, eight power shelves, liquid-cooling support | OOB and power shelves absent | Structural | Rack includes compute/switch trays, OOB management, power shelves, cooling dependency |
| Compute tray | 4 GPUs; 2 Grace CPUs; ConnectX-8; E1.S cache | Plus BlueField-3 DPU and M.2 OS NVMe | DPU and OS storage absent | Structural | Representative tray exposes all architecture-relevant compute/network/storage roles |
| Scale-out/network | Generic scale-out Ethernet switches | East/West compute plane plus North/South converged customer/storage/management plane and OOB | Distinct planes absent | Structural + explanatory | Three network roles remain separately visible/connected |
| Scenarios | Baseline; rack cooling degradation | Also compute-plane degradation and converged-network/storage pressure | Network operating conditions absent | Scenario | 3–4 architecture-specific named Scenarios |

| ID | Branch | Proposed addition | Type | Purpose | Files expected to change | Evidence needed | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| GB300-01 | Compute tray | Add BlueField-3 B3240 DPU aggregate | Structural/product | Show North/South storage/network/security path distinct from ConnectX-8 compute path | `content/RSCs/nvidia_dgx_gb300_nvl72_superpod.yaml` | NVIDIA GB300 rack/network docs | High | none | Implemented |
| GB300-02 | Compute tray | Add M.2 OS NVMe aggregate | Structural/property | Separate OS device from E1.S cache | same RSC | NVIDIA GB300 compute-tray docs | High | none | Implemented |
| GB300-03 | Rack | Add eight power-shelf aggregate with 33-kW shelf role if G-02 accepted; otherwise add rack power properties/notes | Structural/property | Teach power delivery as a rack-scale architectural constraint | same RSC, possible schema/capability/property registry | NVIDIA rack power docs | High | G-02 | Implemented |
| GB300-04 | Root network | Refine scale-out switch aggregate as East/West compute fabric with SN5600 identity | Structural/product | Make ConnectX-8 compute plane explicit | same RSC | NVIDIA networking docs | High | none | Implemented |
| GB300-05 | Root network | Add North/South converged network aggregate | Structural | Represent BlueField-3 customer/storage/management traffic | same RSC | NVIDIA network architecture docs | High | GB300-01 | Implemented |
| GB300-06 | Rack/root | Add OOB SN2201 management switch aggregate | Structural/product | Anchor rack management path | same RSC | NVIDIA rack architecture docs | High | none | Implemented |
| GB300-07 | Root | Add external storage black-box boundary connected through converged network | Structural/relationship | Teach where storage leaves the rack without inventing deployment-specific vendor topology | same RSC | NVIDIA converged-network role docs | Medium-high | GB300-05 | Implemented |
| GB300-08 | Network/support | Add Cross-Connections for CX8→compute, BF3→converged, converged→storage, OOB control, power dependency | Relationship | Make role separation traversable | same RSC | same primary docs | High | GB300-01,03–07 | Implemented |
| GB300-09 | Scenarios | Add East/West compute-plane degradation Scenario | Scenario | Teach dual-plane/rack-scale network dependency | `scenarios/gb300-nvl72-superpod-reference.yaml` | NVIDIA network design; state values qualitative | Medium-high | GB300-04,08 | Implemented |
| GB300-10 | Scenarios | Add North/South/storage-pressure Scenario | Scenario | Teach converged customer/storage/management role | same Scenario file | NVIDIA network/storage role docs | Medium | GB300-05,07,08 | Implemented |

---

## Google Cloud TPU7x (Ironwood) — `tpu7x-9216-chip-superpod`

### Visual-layer inventory

| Layer | Current contents | Expected contents | Missing | Gap type | Proposed final contents |
|---|---|---|---|---|---|
| Host | 4-chip TPU aggregate only | TPU chips plus host compute/memory context and PCIe path | Host CPU/DRAM boundary, PCIe connection | Structural/explanatory | Host explicitly connects host memory/resources to TPU devices |
| TPU | TensorCores; SparseCores; HBM directly under chip | Two chiplets per chip; each chiplet carries one TensorCore, two SparseCores, 96 GiB HBM; VMEM/on-chip SRAM; D2D link | Chiplet structure, VMEM, D2D relation | Structural | TPU resolves into representative chiplet context with supported internals |
| Network | ICI cube; OCS; DCN | 3D torus within cube, OCS beyond cube, DCN between superpods | DCN data path not connected; host PCIe absent | Relationship | Explicit ICI/OCS/DCN and PCIe roles |
| Scenarios | Baseline; optical-path reconfiguration | Also HBM pressure / host-memory staging/offload pressure | Memory-path scenario absent | Scenario | Add memory-pressure scenario without changing architecture |

| ID | Branch | Proposed addition | Type | Purpose | Files | Evidence needed | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| TPU7-01 | TPU | Add `ironwood-chiplets` aggregate under TPU and move existing TensorCore/SparseCore/HBM stable IDs beneath it | Structural | Accurately teach two-chiplet physical organization without identity churn | `content/RSCs/google_tpu7x_ironwood.yaml` | Google Ironwood architecture docs | High | none | Implemented |
| TPU7-02 | TPU/chiplet | Add VMEM/on-chip SRAM aggregate | Structural/property | Complete documented memory hierarchy | same RSC | Google TPU7x docs | High | TPU7-01 | Implemented |
| TPU7-03 | Host | Add host CPU-resource boundary and host memory; avoid unsupported CPU product identity | Structural/explanatory | Show host↔accelerator memory/data path | same RSC, possibly G-01 | Google Cloud TPU machine docs | Medium-high | G-01 | Implemented |
| TPU7-04 | Connections | Add PCIe host↔TPU connection and chiplet D2D connection | Relationship | Teach host-device and chiplet-local movement | same RSC | Google architecture docs | High | TPU7-01,03 | Implemented — host/TPU paths added; chiplet D2D kept as aggregate topology metadata rather than a false single-endpoint connection |
| TPU7-05 | DCN | Add explicit cube/superpod↔DCN connection | Relationship | Make multi-superpod scale-out role navigable | same RSC | Google TPU docs | High | none | Implemented |
| TPU7-06 | Scenarios | Add HBM / host-memory pressure Scenario with qualitative staging pressure | Scenario | Teach memory hierarchy as dynamic bottleneck without false precision | `scenarios/tpu7x-9216-chip-superpod.yaml` | Google memory hierarchy docs; educational simplification | Medium-high | TPU7-02–04 | Implemented |

---

## Cerebras CS-3 / Condor Galaxy 3 — `condor-galaxy-3-64-cs3`

### Visual-layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| WSE-3 internals | 900k AI cores; on-chip SRAM | Cores and memory connected by wafer-scale 2D mesh/router fabric | On-chip mesh representation | Structural/relationship | Add WSE mesh fabric while retaining aggregate cores/SRAM |
| Cluster support | MemoryX, SwarmX, preprocess, management | Same plus explicit management/control relation and better capacity/link context | Control path; deployment-variable MemoryX options; SwarmX link family | Explanatory/relationship/property | Enrich support appliances conservatively |
| Scenarios | Baseline; SwarmX degradation | Also MemoryX/weight-stream pressure | Weight-memory scenario absent | Scenario | Add weight-stream pressure Scenario |

| ID | Branch | Proposed addition | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| CER-01 | WSE-3 | Add on-chip 2D mesh/fabric entity | Structural | Explain how distributed cores and local SRAM form one wafer-scale machine | `content/RSCs/cerebras_cs3_condor_galaxy3.yaml` | Cerebras technical docs/glossary | High | none | Implemented |
| CER-02 | WSE-3 | Add core/SRAM↔mesh Cross-Connections | Relationship | Make data movement on the wafer explicit | same RSC | Cerebras docs | High | CER-01 | Implemented |
| CER-03 | MemoryX | Add deployment-variable supported capacity options/range wording without asserting CG3 selected capacity | Property/explanatory | Surface model-memory scale while avoiding false precision | same RSC, property registry only if structured comparison value is suitable | Cerebras MemoryX docs | High | none | Implemented |
| CER-04 | SwarmX | Add documented 400G/800G link-family context if corporate primary source remains authoritative enough | Property/explanatory | Explain appliance/fabric bandwidth generation | same RSC | Cerebras corporate filing / technical source | Medium | none | Implemented |
| CER-05 | Management | Add management/control relationship to cluster/CS-3 systems | Relationship | Prevent management node from being isolated filler | same RSC | Cerebras management/system docs | Medium-high | none | Implemented |
| CER-06 | Scenarios | Add MemoryX/weight-stream pressure Scenario | Scenario | Teach external weight-memory streaming dependence | `scenarios/condor-galaxy-3-64-cs3.yaml` | MemoryX/SwarmX architecture docs | Medium-high | CER-03 | Implemented |

---

## Meta 24K H100 RoCE Training Cluster — `meta-24576-h100-roce`

### Visual-layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| Compute | Grand Teton black box + H100 aggregate | Same; source does not support safe deeper physical decomposition in this configuration | No forced internals | Acceptable black box | Retain boundary, improve explanation only |
| RoCE network | One aggregate covering Arista 7800, Wedge400, Minipack2 | Distinct switch families/roles within aggregate fabric | Three family child aggregates | Structural | Fabric aggregate resolves to product-family roles without inventing port-level topology |
| Storage | YV3 + E1.S; generic storage group | Tectonic/Hammerspace services explain how storage is exposed, but software is not physical containment | Service/context explanation and checkpoint role | Explanatory/relationship | Keep physical YV3; annotate service layer and data path |
| Scenarios | Baseline; RoCE congestion | Also checkpoint/storage burst | Storage pressure absent | Scenario | Add checkpoint burst scenario |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| META-01 | RoCE switches | Add child aggregates for Arista 7800, Wedge400, Minipack2 within existing switch aggregate | Structural/product | Show heterogeneous switch roles without falsely assigning one product identity to whole fabric | `content/RSCs/meta_h100_roce_24k.yaml` | Meta engineering cluster article | High | none | Implemented |
| META-02 | RoCE relationships | Refine connection description/properties around 400-Gb/s endpoints and topology-aware operation without asserting undocumented exact topology | Relationship/explanatory | Improve operational understanding while preserving evidence boundary | same RSC | Meta engineering article | High | META-01 | Implemented |
| META-03 | Storage | Add Tectonic/Hammerspace explanatory metadata to storage group/data path, not physical software entities | Explanatory | Connect software storage abstraction to YV3 physical storage correctly | same RSC | Meta engineering article | High | none | Implemented |
| META-04 | Scenarios | Add checkpoint/storage burst Scenario | Scenario | Teach synchronized checkpoint pressure on physical storage path | `scenarios/meta-24576-h100-roce.yaml` | Meta article storage/checkpoint context | Medium-high | META-03 | Implemented |
| META-05 | Grand Teton | Improve black-box/proprietary note; do not invent chassis internals | Explanatory/evidence | Make intentional omission obvious where interpretation could otherwise imply completeness | same RSC | Current project sources | High | none | Implemented |

---

## AMD Helios — `helios-72gpu-reference-rack`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| Compute tray | MI455X, EPYC Venice, Vulcano NIC, Salina DPU | Plus HBM4 under GPU; CPU↔GPU Infinity Fabric relation | HBM4, Infinity Fabric | Structural/relationship | HBM4 represented physically; local and scale-out paths separated |
| Network | UALink switch trays; Vulcano connected generically to system | Explicit external scale-out fabric and Salina front-end/service boundary | Scale-out/facing network targets | Structural | Add network-fabric boundaries rather than system-as-endpoint shortcut |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| AMD-01 | MI455X | Add HBM4 aggregate beneath GPU | Structural/property | Teach accelerator memory capacity/bandwidth | `content/RSCs/amd_helios.yaml` | AMD Helios/MI455X docs | High | none | Implemented |
| AMD-02 | Compute tray | Add Infinity Fabric CPU↔GPU Cross-Connection | Relationship | Make host/accelerator local connectivity explicit | same RSC | AMD Helios docs | High | none | Implemented |
| AMD-03 | Root/network | Add external scale-out network-fabric boundary for Vulcano | Structural/relationship | Replace misleading `NIC → whole system` shortcut | same RSC | AMD Helios networking docs | High | none | Implemented |
| AMD-04 | Root/network | Add front-end/network-service boundary for Salina, black-box below documented role | Structural/relationship/evidence | Teach DPU front-end/storage/security offload role without fabricating topology | same RSC | AMD Pensando Salina docs | Medium-high | none | Implemented |
| AMD-05 | Properties | Add source-supported MI455X HBM and UALink/Vulcano bandwidth context | Property | Improve comparative/Detail utility | same RSC + property registry if needed | AMD docs | High | G-03 | Implemented |
| AMD-06 | Rack | Add physical power-shelf-management / rack power-delivery entity using `power_system` | Structural | Show the centralized power hub and vertical-busbar relationship that is a named Helios rack feature | same RSC + G-02 | AMD Helios official rack page | High | G-02 | Implemented |
| AMD-07 | Scale-up switch tray | Add documented UALoE switch-ASIC aggregate (two ASICs per switch) | Structural/property | Resolve an educationally important scale-up switching layer without materializing every link | same RSC | AMD Helios official rack page | High | none | Implemented |

---

## AWS Trainium2 / Project Rainier — `project-rainier-trainium2`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| Deployment | Rainier→UltraServer | Multi-data-center deployment scope | Site/data-center aggregate | Structural | Root resolves to deployment-site aggregate then UltraServers, count left unknown/deployment-dependent |
| Trn2 instance | Trainium2, EFA, NVMe | Plus host CPU resources, 2 TiB host memory, clearer NVMe capacity | Host compute/memory context | Structural/property | Instance has accelerator, host memory/resources, EFA, local storage |
| Trainium2 | NeuronCores | Plus HBM | HBM | Structural | HBM under chip |
| Topology | NeuronLink relations + EFA fabric | Explicit 2D torus and cross-instance rings explained | Richer topology metadata | Explanatory/relationship | Preserve aggregates; enrich topology rather than materializing chips |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| TRN2-01 | Deployment | Insert aggregate deployment-site/data-center layer between Rainier root and UltraServers; count unknown | Structural/aggregation | Represent documented multi-data-center physical scale | `content/RSCs/aws_trainium2_rainier.yaml` | AWS Project Rainier docs | Medium-high | none | Implemented |
| TRN2-02 | Trainium2 | Add 96-GiB HBM aggregate | Structural/property | Complete accelerator memory path | same RSC | AWS Trainium2 docs | High | none | Implemented |
| TRN2-03 | Trn2 instance | Add host CPU-resource boundary and 2-TiB system memory without CPU product identity | Structural/property | Show host/accelerator architecture | same RSC, possibly G-01 | AWS Trn2 instance docs | High | G-01 | Implemented |
| TRN2-04 | NVMe/EFA | Add documented instance/UltraServer storage and EFA bandwidth properties | Property | Improve scale/comparison Detail | same RSC + registry if needed | AWS docs | High | G-03 | Implemented |
| TRN2-05 | Topology | Enrich NeuronLink 2D-torus and UltraServer ring explanation without materializing 64 chips | Relationship/explanatory | Teach topology faithfully under aggregate rules | same RSC | AWS NeuronLink docs | High | none | Implemented |

---

## AWS Trainium3 UltraServer — `trn3-ultraserver-ultracluster3`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| UltraServer | Trainium3→cores/collective/HBM + NeuronSwitch | Same structure, richer documented capacity/bandwidth | Mostly explanatory/property | Explanatory | Enrich HBM/collective/NeuronLink properties |
| UltraCluster | Scale-out black box exists but is disconnected | UltraServer connects to petabit-scale nonblocking cluster fabric | Connection absent | Structural relationship | Add explicit UltraServer↔scaleout Cross-Connection |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| TRN3-01 | Scale-out | Add explicit UltraServer↔UltraCluster network Cross-Connection | Relationship | Prevent scale-out fabric from being a disconnected explanatory object | `content/RSCs/aws_trainium3_ultraserver.yaml` | AWS Trainium3 docs | High | none | Implemented |
| TRN3-02 | HBM | Add 144-GB/chip, 4.9-TB/s/chip and supported aggregate context | Property | Teach memory scale | same RSC + registry if appropriate | AWS docs | High | G-03 | Implemented |
| TRN3-03 | Collective cores | Enrich role as built-in collective communication engines | Explanatory/concept | Connect hardware offload to in-network/collective concepts without inventing microarchitecture | same RSC | AWS Neuron docs | High | none | Implemented |
| TRN3-04 | Scale-out | Add nonblocking/petabit-scale qualitative properties and uncertainty note on exact switch topology | Property/evidence | Surface scale without false topology precision | same RSC | AWS UltraCluster docs | High | TRN3-01 | Implemented |

---

## Google TPU 8t — `tpu8t-training-superpod`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| TPU chip | SparseCore only | HBM, VMEM, tensor compute context | HBM/VMEM | Structural | Add physical memory; keep MXU/VPU mainly explanatory unless schema extension is justified |
| Host/rack | Rack aggregate only | Axion CPU header/host support and network-interface role | Host support/NIC boundary | Structural | Aggregate host support without unsupported packing assumptions |
| Networks/storage | Virgo only | Virgo east-west scale-out, Jupiter north-south, TPUDirect RDMA/Storage, managed Lustre | Jupiter, NIC/data paths, storage | Structural/relationship | Distinct network/storage paths |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| TPU8T-01 | TPU | Add HBM and VMEM aggregates | Structural/property | Complete TPU memory hierarchy | `content/RSCs/google_tpu8_family.yaml` | Google TPU8 docs | High | none | Implemented |
| TPU8T-02 | Rack/host | Add Axion CPU header/host-support aggregate without asserting unsupported per-chip topology | Structural/evidence | Show host compute boundary | same RSC | Google TPU8 docs | Medium-high | G-01 only if DRAM object added | Implemented |
| TPU8T-03 | Network | Add TPU network-interface aggregate and Jupiter north-south fabric | Structural | Separate Virgo scale-out from north-south data-center connectivity | same RSC | Google TPU8 docs | High | none | Implemented |
| TPU8T-04 | Storage | Add managed Lustre storage aggregate | Structural | Anchor TPUDirect Storage path | same RSC | Google TPUDirect Storage docs | High | TPU8T-03 | Implemented |
| TPU8T-05 | Data paths | Add TPUDirect RDMA and TPUDirect Storage Cross-Connections | Relationship/concept | Teach accelerator-direct network/storage movement | same RSC | Google docs | High | TPU8T-03,04 | Implemented |

---

## Google TPU 8i — `tpu8i-inference-pod`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| TPU chip | CAE only | 2 TensorCores, CAE, 288-GB HBM, 384-MB VMEM | TensorCore, HBM, VMEM | Structural | Add documented compute/memory internals |
| Boardfly | Board group→four-chip trays; one broad ICI/OCS relation | Four-chip local ring, eight-board copper group connectivity, OCS between groups | More explicit local copper vs optical distinction | Relationship/explanatory | Preserve aggregate topology but separate copper-local and optical-scale connections |
| Host | No host support | Axion CPU headers documented for TPU8 family | Host boundary | Structural | Add conservative host-support aggregate |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| TPU8I-01 | TPU | Add TensorCore, HBM, VMEM aggregates | Structural/property | Complete documented TPU8i internals | `content/RSCs/google_tpu8_family.yaml` | Google TPU8i docs | High | none | Implemented |
| TPU8I-02 | Boardfly topology | Split broad relationship into local copper ring/group connectivity and group↔OCS optical connectivity | Relationship | Teach Boardfly's defining physical topology | same RSC | Google Boardfly docs | High | none | Implemented |
| TPU8I-03 | Pod/host | Add Axion CPU-header/support aggregate without exact per-tray mapping | Structural/evidence | Represent host boundary conservatively | same RSC | Google TPU8 docs | Medium | none | Implemented |
| TPU8I-04 | Population/properties | Add source-supported four-chip, eight-board/group and deployment-dependent pod-count context | Aggregation/property | Make scale tangible without false fixed total | same RSC + registry if structured | Google docs | High | G-03 | Implemented |

---

## Groq LPU / GroqCloud — `groq-256-lpu-rack`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| Rack internals | Explicit black box → LPU aggregate → SRAM | Current public evidence still does not support trustworthy server/tray decomposition | No structural expansion warranted | Acceptable black box + explanatory | Retain black box; enrich scale/capacity explanation |
| Network | Black-box network with no connection | At minimum rack compute connects to networking boundary | Relationship missing | Structural relationship | Add conservative data-communication relation only |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| GROQ-01 | Rack/LPU | Add documented rack SRAM capacity/bandwidth and compute-scale properties | Property/explanatory | Make current sparse branch educationally useful | `content/RSCs/groq_lpu_groqcloud.yaml` | Groq official platform docs | High | G-03 | Implemented |
| GROQ-02 | Network | Add conservative rack-compute↔network-boundary data path | Relationship | Remove isolated network object without inventing topology | same RSC | Groq service/rack docs | Medium-high | none | Implemented |
| GROQ-03 | Black box | Expand evidence/unknown note explaining why host/tray/interconnect internals remain unmodeled | Evidence/explanatory | Prevent absence from being read as architectural nonexistence | same RSC | primary docs + project uncertainty rules | High | none | Implemented |

---

## LLNL El Capitan — `el-capitan-production`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| Compute | 90 cabinets→11,520 nodes→4 MI300A→XCD/CCD/HBM | Strong current physical coverage | Mainly richer properties | Explanatory/property | Retain hierarchy; add capacities/power where useful |
| Network | Slingshot interfaces and switch fabric | 4 interfaces/node, 200-Gb/s ports, 25.6-Tb/s switch, Dragonfly | Properties | Property | Enrich without materializing switches |
| Storage/I/O | Parallel filesystem exists but has no connection; Rabbit modules potentially architecture-relevant | Compute↔parallel filesystem path; Rabbit I/O role only if primary documentation supports it | Storage relation; possibly Rabbit I/O modules | Relationship / research-gated structural | Add filesystem path; Rabbit only after evidence review |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| ELCAP-01 | Storage | Add compute↔parallel-filesystem data path | Relationship | Make storage branch architecturally connected | `content/RSCs/llnl_el_capitan.yaml` | LLNL system docs | High | none | Implemented |
| ELCAP-02 | Slingshot | Add source-supported interface/switch bandwidth and Dragonfly context | Property/explanatory/concept | Improve topology and network learning | same RSC | LLNL/HPE docs | High | G-03 | Implemented |
| ELCAP-03 | Root/APU | Add 36-MW system peak-power and 512-GiB/node HBM context where source-faithful | Property | Complete major physical-scale measurements | same RSC + registry if needed | LLNL docs | High | G-03 | Implemented |
| ELCAP-04 | I/O | Add Rabbit near-node storage aggregate, plus its SSD and EPYC storage-processor structure, using documented system-level population rather than derived per-cabinet counts | Structural/relationship | Explain El Capitan's distinctive near-node storage tier and direct compute/storage path | same RSC | LLNL Rabbit documentation and El Capitan system materials | High | ELCAP-01 | Implemented |

---

## Microsoft Azure Maia 200 — `maia200-inference-cluster`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| Accelerator | SRAM + DMA | 216-GB HBM3e, SRAM, DMA/data movement, NoC; tensor compute described | HBM and NoC relation | Structural/relationship | Add HBM; express NoC as relationship/fabric context without inventing micro-topology |
| Scale-up | Direct tray links + black-box two-tier fabric | Same; 2.8-TB/s bidirectional per accelerator context | Properties | Property | Enrich black box and direct links |
| Operations | Cooling only | Azure control/telemetry/diagnostic boundary is material but software/control rather than physical hierarchy | Management/control boundary | Explanatory/relationship | Add shallow management/control aggregate/boundary |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| MAIA-01 | Maia chip | Add HBM3e aggregate | Structural/property | Complete accelerator memory hierarchy | `content/RSCs/microsoft_maia200.yaml` | Microsoft Maia 200 architecture docs | High | none | Implemented |
| MAIA-02 | On-chip data movement | Add NoC/data-movement relationship among DMA, SRAM, HBM and accelerator boundary without invented router topology | Relationship/explanatory | Teach data movement while respecting proprietary internals | same RSC | Microsoft architecture docs | Medium-high | MAIA-01 | Implemented |
| MAIA-03 | Management | Add shallow Azure accelerator-management/control boundary and control relationship | Structural/relationship/evidence | Connect telemetry/diagnostic/control role to hardware without modeling software as containment | same RSC | Microsoft official docs | Medium | none | Implemented |
| MAIA-04 | Scale-up/cooling | Add documented 2.8-TB/s per-accelerator scale-up and closed-loop liquid-cooling context | Property/explanatory | Improve comparative and physical-support Detail | same RSC + registry if appropriate | Microsoft docs | High | G-03 | Implemented |

---

## NVIDIA Vera Rubin NVL72 / Rubin POD — `vera-rubin-nvl72-pod-reference`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| NVL72 | GPU, Vera CPU, CX9, BF4, NVLink switch trays | Same with stronger published bandwidth/role properties | Mainly properties | Explanatory/property | Enrich NVLink6/CX9/BF4 data |
| POD support | Generic Quantum-X800/Spectrum-X scaleout only | Official Rubin POD materials also show storage/context-memory and networking support racks | STX/SPX support only if current config scope genuinely includes POD-level support | Research-gated structural | Add POD support aggregates only if source/config scope supports them |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| RUBIN-01 | NVL72 devices | Add source-supported NVLink 6, CX9, BF4 bandwidth/role properties | Property/explanatory | Improve rack-scale network understanding | `content/RSCs/nvidia_vera_rubin.yaml` | NVIDIA Vera Rubin docs | High | G-03 | Implemented — documented roles/fabric generation added; unsupported per-device bandwidth values intentionally omitted |
| RUBIN-02 | POD support | Add a shallow BlueField-4 STX / CMX context-memory storage rack boundary and revise the scope note to acknowledge POD-level support racks | Structural/evidence | Expose a distinctive POD component explicitly named by NVIDIA without pretending partner storage internals are known | same RSC | NVIDIA Vera Rubin POD technical blog / platform docs | High | none | Implemented |
| RUBIN-03 | POD support | Verify whether Spectrum-6 SPX networking rack should appear separately from current generic scale-out aggregate; add only if this configuration models full POD support | Structural | Preserve POD architecture distinction without forcing future/optional components | same RSC | NVIDIA POD docs | Medium | RUBIN-02 scope decision | Implemented |

---

## OCI GB200 / GB300 NVL72 Supercluster

### Layer inventory — both configurations

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| Rack compute | GPU + RDMA NIC only | Host/tray layer also has local NVMe; host/CPU detail varies by source | Local storage; potentially host-support context | Structural/property | Add deployment-variable local NVMe, avoid unsupported host SKU internals |
| Cluster support | Scale-out fabric only | OCI also documents Lustre storage, management/monitoring, direct-to-chip liquid cooling | Storage, cooling, management | Structural/relationship | Add shallow support branches common to OCI AI supercluster service where source applies |
| Network | High-performance network aggregate | RoCEv2 3-tier Clos and/or IB/Spectrum-X option depending config | Richer topology/protocol context | Explanatory | Preserve option semantics; do not pretend alternative fabrics coexist |

| ID | Config | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| OCI-01 | GB200 | Add local NVMe storage aggregate under compute hosts only if the GB200 NVL72-specific source establishes it | Structural/property | Represent staging/cache path without turning generic OCI service capability into rack BOM | `content/RSCs/oci_gb200_gb300_supercluster.yaml` | GB200 NVL72-specific Oracle source | Low-medium | none | Closed — no addition |
| OCI-02 | GB300 | Add local NVMe storage aggregate only if a GB300 NVL72-specific Oracle source establishes the concrete host storage | Structural/property | Avoid unsupported physical host storage in the cloud configuration | same RSC | GB300 NVL72-specific Oracle source | Low | none | Closed — no addition |
| OCI-03 | Both | Add external Lustre file-storage aggregate and compute-storage data path | Structural/relationship | Teach storage path without inventing rack placement | same RSC | Oracle Lustre/AI infrastructure docs | High | none | Implemented |
| OCI-04 | Both | Add direct-to-chip liquid-cooling support aggregate and dependency | Structural/relationship | Represent material rack-scale thermal support | same RSC | Oracle data-center/Blackwell infrastructure docs | High | none | Implemented |
| OCI-05 | Both | Add shallow management/monitoring boundary and control relationship | Structural/relationship | Complete operations/support context | same RSC | Oracle AI infrastructure docs | Medium-high | none | Implemented |
| OCI-06 | GB200 | Add documented 18-host/72-GPU rack count semantics where source-specific | Aggregation/property | Make rack scale explicit | same RSC | Oracle GB200 docs | High | G-03 | Implemented |
| OCI-07 | Both | Enrich network description with source-appropriate Clos/RoCE/IB option semantics without asserting both alternatives active | Explanatory/concept | Improve topology understanding | same RSC | Oracle network docs | High | none | Implemented — alternatives clarified without asserting simultaneous fabrics |
| OCI-08 | Both | Do not add a DPU from generic OCI infrastructure documentation; no reviewed OCI source identifies a configuration-specific DPU as a concrete GB200/GB300 rack element | Research-gated structural | Avoid generic-service facts becoming false rack BOM | none | Config-specific Oracle/NVIDIA docs reviewed | High | none | Closed — no addition |
| OCI-09 | GB200 | Add shallow rack power-delivery support entity and >120-kW peak context only for the GB200 configuration, where Oracle explicitly documents the data-center power redesign | Structural/property/evidence | Teach why GB200 rack density changes physical power infrastructure without extrapolating the same facts to GB300 | same RSC + G-02 | Oracle GB200 deployment engineering article | High | G-02 | Implemented |

---

## CoreWeave GB200 NVL72 — `coreweave-gb200-nvl72-cluster`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| Rack compute | Blackwell GPUs + BF3 DPUs | Also 36 Grace CPUs and node-local NVMe/cache role | Grace CPU, local storage | Structural | Add CPU and cache/storage aggregates |
| Network | Quantum-2 IB | Rail-optimized 400-Gb/s/GPU context | Properties/topology context | Explanatory | Enrich existing fabric |
| Storage | Generic accelerated storage | CoreWeave AI Object Storage / file-storage services and LOTA node-local cache may be current support context, but physical deployment varies | More precise service role/data path | Explanatory/relationship | Keep service-level aggregate and mark deployment scope honestly |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| CW-01 | NVL72 compute | Add Grace CPU aggregate | Structural/product | Complete defining GB200 CPU+GPU architecture | `content/RSCs/coreweave_gb200_nvl72.yaml` | NVIDIA/CoreWeave GB200 docs | High | none | Implemented |
| CW-02 | Compute/storage | Add local NVMe/cache aggregate where CoreWeave source supports node-local caching | Structural/evidence | Teach local-vs-remote storage path | same RSC | CoreWeave current storage docs | Medium-high | none | Implemented |
| CW-03 | Storage | Refine accelerated-storage explanation to current CoreWeave storage services; avoid implying service software is a physical rack component | Explanatory | Improve storage-role fidelity | same RSC | CoreWeave storage docs | Medium-high | CW-02 | Implemented |
| CW-04 | Connections | Add explicit local/remote storage data paths | Relationship | Make storage branch traversable at relevant scale | same RSC | CoreWeave docs | Medium-high | CW-02,03 | Implemented |
| CW-05 | InfiniBand | Add rail-optimized/400-Gb/s per-GPU context | Property/concept | Teach scale-out network design | same RSC | CoreWeave/NVIDIA docs | High | G-03 | Implemented |

---

## xAI Colossus 1 — `colossus1-current-highlevel`

### Layer inventory

| Layer | Current | Expected | Missing | Gap | Proposed final |
|---|---|---|---|---|---|
| Compute | Deliberate black-box compute infrastructure + heterogeneous GPU fleet | Current project explicitly lacks trustworthy detailed rack/server decomposition | No filler decomposition | Acceptable black box | Preserve compute boundary and clarify dated fleet-scale evidence |
| Spectrum-X | One switch aggregate + BF3 SuperNIC | SN5600 switch family with Spectrum-4 ASIC is documented for Colossus networking | Switch/ASIC decomposition | Structural/product | Resolve Spectrum-X aggregate to supported switch and ASIC level |

| ID | Branch | Proposed | Type | Purpose | Files | Evidence | Confidence | Dependencies | Historical reported status |
|---|---|---|---|---|---|---|---|---|---|
| XAI-01 | Spectrum-X | Existing `colossus-spectrum` already represents the documented SN5600 family; do not duplicate it | Structural/product | Preserve one canonical switch identity | none | NVIDIA Colossus/Spectrum-X docs plus current RSC | High | none | Closed — no addition |
| XAI-02 | SN5600 | Add Spectrum-4 switch ASIC aggregate | Structural/product | Teach fabric appliance internals at useful physical depth | same RSC | NVIDIA Spectrum-X docs | High | XAI-01 | Implemented |
| XAI-03 | Network | Refine BF3→SN5600/fabric connection | Relationship | Anchor SuperNIC to actual switch family while retaining fabric aggregate semantics | same RSC | NVIDIA docs | High | XAI-01 | Implemented |
| XAI-04 | Root/compute | Clarify dated 100k Hopper 2024 documented baseline versus later/current heterogeneous fleet; no singular GPU identity | Evidence/explanatory | Avoid conflating dated published count with current mixed-fleet model | same RSC | xAI/NVIDIA dated sources | High | none | Implemented |

---

## Current Scenario catalogs — cross-system completeness

Current Version-1 companion catalogs already satisfy the minimum default + one meaningful non-default Scenario. This review proposes additions only where a newly modeled architectural path has clear learning value; it does not create scenarios for quantity alone.

| Configuration | Current Scenario contents | Expected after structural review | Missing Scenario relationship | Proposed final |
|---|---|---|---|---|
| H100 SuperPOD | Baseline; backend-fabric bottleneck | Add storage/checkpoint-pressure path | Storage network/data path | 3 named Scenarios |
| GB300 NVL72 | Baseline; rack-cooling degradation | Add East/West compute-plane degradation and North/South/storage pressure | Distinct network-plane behavior | 4 named Scenarios |
| TPU7x Ironwood | Baseline; optical-path reconfiguration | Add HBM/host-memory pressure | Memory hierarchy behavior | 3 named Scenarios |
| Cerebras CG3 | Baseline; SwarmX degradation | Add MemoryX/weight-stream pressure | External model-memory path | 3 named Scenarios |
| Meta H100 RoCE | Baseline; RoCE congestion | Add checkpoint/storage burst | Storage/checkpoint path | 3 named Scenarios |

Later-candidate configurations remain outside the Version-1 user-facing Scenario requirement. Their inline default Scenarios will be enriched only when a canonical structural addition would otherwise make the current baseline misleading; this review will not create companion catalogs merely for parity.

---

## Research-gated items requiring explicit closure

These items must end the task as **Implemented**, **Closed — no addition**, or **Blocked**:

1. G-01 — whether independent host/system-memory entities warrant a new controlled `entity_type`.
2. G-02 — whether rack power shelves warrant a new `power_system` entity type or should remain properties/support notes.
3. CER-04 — sufficiency of primary Cerebras source for 400G/800G SwarmX context.
4. ELCAP-04 — Rabbit I/O modules role and physical relevance.
5. RUBIN-02 / RUBIN-03 — whether STX/SPX support racks belong inside this configuration's declared scope.
6. OCI-08 — whether DPU is supported for the concrete OCI NVL72 configurations rather than only OCI infrastructure generally.
7. G-04 — whether any new global Concepts are actually required after reusing the existing 15-Concept library.

## Research-resolution notes before canonical edits

- **Documented facts** are promoted to explicit entities/properties only where a reviewed primary source supports the relevant configuration.
- **Educational simplifications** are limited to qualitative Scenario outcomes and shallow service/fabric boundaries; they are labelled `simplified` in evidence rather than presented as measured deployment facts.
- **Deployment-variable service capabilities** (notably generic OCI local NVMe/DPU descriptions) are not converted into configuration-local physical entities without configuration-specific evidence.
- **Black boxes remain intentional** for Groq rack internals, Meta Grand Teton internals, and other branches where deeper decomposition would require unsupported assumptions.
- **No new global Concept identity** is introduced in this pass; existing Concepts are reused through additional explicit occurrence links where useful.

## Completion criteria for this manifest

At final handoff every checklist row will have a terminal status. Implemented rows will identify canonical source changes and validation results. Closed rows will retain the evidence/rationale for intentional omission so future content passes do not repeatedly re-open the same unsupported or low-value additions.

## Historical reported final status — superseded for the supplied baseline

A prior implementation report stated that all manifest items had reached terminal status and that implemented rows had been applied and validated. That report is retained as historical context only. The supplied `systems-for-modern-ai.zip` does **not** contain many of those claimed additions, so those claims are not used as evidence of current completion.

The **Baseline ZIP reconciliation** below is the current authority for what is present, partial, absent, closed, or superseded. Implementation must apply changes to the supplied/current repository and rerun validation rather than treating the historical report as a waiver.

## Baseline ZIP reconciliation — current planning authority

The following table is derived from direct inspection of the supplied repository. It supersedes the historical status column for current work. “Present” means materially present in source, not that post-change release validation has been rerun.

| ID | Baseline ZIP verification | Planning disposition | Baseline note |
|---|---|---|---|
| **G-01** | Absent | **Implement** | `system_memory` is not in the current capability/schema vocabulary and no dedicated host-DRAM entities are present. |
| **G-02** | Absent | **Implement** | `power_system` is not present in the current baseline vocabulary/content. |
| **G-03** | Partial | **Revise / complete** | A Property Registry exists and the initial five use structured values, but manifest-specific new property definitions/values are not all present. |
| **G-04** | Closed / not applicable | **Closed — no addition** | The baseline already has the 15-Concept library; no new Concept identity is required merely for this anatomy pass. |
| **H100-01** | Partial | **Revise / complete** | `h100-cx7` exists but still represents 10 interfaces rather than the intended eight compute HCAs. |
| **H100-02** | Absent | **Implement** | No separate storage/in-band ConnectX-7 aggregate. |
| **H100-03** | Partial | **Revise / complete** | One generic local-NVMe aggregate exists; OS and data-cache roles remain conflated. |
| **H100-04** | Absent | **Implement** | No visible system-memory/host-DRAM representation. |
| **H100-05** | Absent | **Implement** | No BMC/OOB endpoint inside the DGX node. |
| **H100-06** | Absent | **Implement** | No separate storage-fabric InfiniBand switch aggregate. |
| **H100-07** | Absent | **Implement** | No separate in-band Ethernet management fabric. |
| **H100-08** | Partial | **Revise / complete** | Generic management/UFM branch exists; OOB transport/switch role is not separated. |
| **H100-09** | Partial | **Revise / complete** | Compute fabric and broad storage path exist; role-specific storage/in-band/OOB paths do not. |
| **H100-10** | Absent | **Implement** | Scenario catalog has baseline + backend-fabric bottleneck only. |
| **H100-11** | Absent | **Revise / complete** | No PSU/power context is present. Under the new physical-orientation rule this now needs visible power anatomy, not properties alone. |
| **GB300-01** | Absent | **Implement** | No BlueField-3 DPU aggregate in the compute tray. |
| **GB300-02** | Absent | **Implement** | No M.2 OS-storage representation. |
| **GB300-03** | Absent | **Implement** | No rack power-shelf entity/aggregate. |
| **GB300-04** | Partial | **Revise / complete** | SN5600 scale-out switch aggregate exists but network-plane role is not explicitly East/West. |
| **GB300-05** | Absent | **Implement** | No North/South converged-network aggregate. |
| **GB300-06** | Absent | **Implement** | No OOB management switch aggregate. |
| **GB300-07** | Absent | **Implement** | No external storage boundary. |
| **GB300-08** | Partial | **Revise / complete** | CX8 scale-out and cooling dependency exist; BF3/converged/OOB/power relationships do not. |
| **GB300-09** | Absent | **Implement** | Scenario catalog lacks compute-plane degradation. |
| **GB300-10** | Absent | **Implement** | Scenario catalog lacks North/South/storage pressure. |
| **TPU7-01** | Absent | **Implement** | TPU children remain directly under the chip; no chiplet aggregate. |
| **TPU7-02** | Absent | **Implement** | No VMEM/on-chip SRAM entity. |
| **TPU7-03** | Absent | **Implement** | Host currently contains only TPU aggregate; no host CPU-resource/memory anatomy. |
| **TPU7-04** | Absent | **Implement** | No PCIe host↔TPU relation; D2D must remain aggregate topology metadata unless addressable endpoints exist. |
| **TPU7-05** | Partial | **Revise / complete** | DCN entity exists but is disconnected. |
| **TPU7-06** | Absent | **Implement** | Scenario catalog lacks HBM/host-memory pressure. |
| **CER-01** | Absent | **Implement** | No on-wafer mesh/fabric entity. |
| **CER-02** | Absent | **Implement** | No core/SRAM↔mesh relationships. |
| **CER-03** | Partial | **Revise / complete** | MemoryX role is present but deployment-variable capacity treatment is not. |
| **CER-04** | Absent | **Verify first, then implement if supported** | No 400G/800G SwarmX link-family property context in baseline. |
| **CER-05** | Partial | **Revise / complete** | Management entity exists but has no control relationship. |
| **CER-06** | Absent | **Implement** | Scenario catalog lacks MemoryX/weight-stream pressure. |
| **META-01** | Absent | **Implement** | RoCE switch families exist only as one aggregate/property, not child family aggregates. |
| **META-02** | Partial | **Revise / complete** | 400-Gb/s endpoint context exists; topology-aware explanatory refinement remains limited. |
| **META-03** | Present | **Retain / verify** | Storage branch and storage path already mention Tectonic/Hammerspace while keeping software out of containment. |
| **META-04** | Absent | **Implement** | Scenario catalog lacks checkpoint/storage burst. |
| **META-05** | Present | **Retain / verify** | Grand Teton is already a documented black box with a note that power/control/compute/fabric are integrated and exact H100 layout is not asserted. |
| **AMD-01** | Absent | **Implement** | No HBM4 child under MI455X. |
| **AMD-02** | Absent | **Implement** | No CPU↔GPU Infinity Fabric connection. |
| **AMD-03** | Partial | **Revise / complete** | Vulcano scale-out connects to the whole system rather than a distinct external fabric boundary. |
| **AMD-04** | Partial | **Revise / complete** | Salina DPU exists, but no separate front-end/service boundary. |
| **AMD-05** | Partial | **Revise / complete** | Vulcano 800-Gb/s context exists; MI455X HBM/other intended bandwidth context is incomplete. |
| **AMD-06** | Absent | **Implement** | No rack power-delivery/power-shelf entity. |
| **AMD-07** | Absent | **Implement** | No UALoE switch-ASIC child aggregate. |
| **TRN2-01** | Absent | **Implement** | No deployment-site/data-center layer. |
| **TRN2-02** | Partial | **Revise / complete** | 96-GiB HBM is only a chip property; no physical HBM child. |
| **TRN2-03** | Absent | **Implement** | No host CPU-resource/system-memory anatomy. |
| **TRN2-04** | Absent | **Implement** | EFA/NVMe entities exist but intended bandwidth/capacity properties are absent. |
| **TRN2-05** | Present | **Retain / verify** | 2D-torus and UltraServer ring relationships/descriptions are already present without materializing 64 chips. |
| **TRN3-01** | Absent | **Implement** | Scale-out network entity exists but no UltraServer↔scale-out Cross-Connection. |
| **TRN3-02** | Partial | **Revise / complete** | Aggregate HBM capacity exists; intended per-chip capacity/bandwidth context is incomplete. |
| **TRN3-03** | Present | **Retain / verify** | Dedicated collective-engine aggregate and explanation are already present. |
| **TRN3-04** | Partial | **Revise / complete** | Scale-out black box/uncertainty exists; intended nonblocking/petabit qualitative properties are incomplete. |
| **TPU8T-01** | Partial | **Revise / complete** | HBM exists only as a chip property; no HBM/VMEM physical children. |
| **TPU8T-02** | Absent | **Implement** | No Axion/host-support aggregate. |
| **TPU8T-03** | Absent | **Implement** | No TPU network-interface aggregate or Jupiter north-south fabric. |
| **TPU8T-04** | Absent | **Implement** | No managed Lustre storage aggregate. |
| **TPU8T-05** | Absent | **Implement** | No TPUDirect RDMA/Storage Cross-Connections. |
| **TPU8I-01** | Absent | **Implement** | Only CAE is modeled beneath TPU 8i; TensorCore/HBM/VMEM are absent. |
| **TPU8I-02** | Absent | **Implement** | One broad Boardfly/OCS connection remains; local copper vs optical relations are not separated. |
| **TPU8I-03** | Absent | **Implement** | No Axion/host-support aggregate. |
| **TPU8I-04** | Partial | **Revise / complete** | Four-chip tray and max pod count are present; the intended eight-board/group/deployment-count context is incomplete. |
| **GROQ-01** | Partial | **Revise / complete** | Rack LPU count and aggregate SRAM capacity are present; intended bandwidth/scale enrichment is incomplete. |
| **GROQ-02** | Absent | **Implement** | Network black box exists but has no data-path connection. |
| **GROQ-03** | Present | **Retain / verify** | Explicit rack-internals/network black-box evidence and unknown notes are already present. |
| **ELCAP-01** | Absent | **Implement** | Parallel filesystem exists but is disconnected. |
| **ELCAP-02** | Partial | **Revise / complete** | 200-Gb/s interfaces, Dragonfly, and switch-port context exist; intended fuller switch/interface bandwidth context is incomplete. |
| **ELCAP-03** | Partial | **Revise / complete** | Per-APU HBM is present; system peak-power and node-level HBM context are not fully present. |
| **ELCAP-04** | Absent | **Verify first, then implement if supported** | No Rabbit near-node storage aggregate/structure. |
| **MAIA-01** | Partial | **Revise / complete** | 216-GB HBM3e is a chip property, not a physical HBM child. |
| **MAIA-02** | Partial | **Revise / complete** | DMA evidence mentions NoC, but no modeled NoC/data-movement relationship exists. |
| **MAIA-03** | Absent | **Implement** | No management/control boundary. |
| **MAIA-04** | Partial | **Revise / complete** | Liquid cooling exists; intended 2.8-TB/s scale-up context is incomplete. |
| **RUBIN-01** | Partial | **Revise / complete** | CX9/BF4/NVLink6 roles exist; intended sourced property enrichment is incomplete. |
| **RUBIN-02** | Absent | **Verify first, then implement if supported** | No STX/CMX support-rack boundary in baseline. |
| **RUBIN-03** | Absent | **Verify first, then implement if supported** | No separate SPX networking-rack representation. |
| **OCI-01** | Closed / not applicable | **Closed — no addition** | Preserve closure: no config-specific GB200 local-NVMe entity in baseline. |
| **OCI-02** | Closed / not applicable | **Closed — no addition** | Preserve closure: no config-specific GB300 local-NVMe entity in baseline. |
| **OCI-03** | Absent | **Implement** | No external Lustre storage aggregate/data path. |
| **OCI-04** | Absent | **Implement** | No liquid-cooling support aggregate/dependency. |
| **OCI-05** | Absent | **Implement** | No management/monitoring boundary/control relationship. |
| **OCI-06** | Present | **Retain / verify** | GB200 configuration already records 18 hosts and 72 GPUs. |
| **OCI-07** | Present | **Retain / verify** | Both OCI configurations already describe 3-tier Clos RoCE option plus InfiniBand alternative without asserting coexistence. |
| **OCI-08** | Closed / not applicable | **Closed — no addition** | Preserve deliberate no-DPU decision. |
| **OCI-09** | Absent | **Verify first, then implement if supported** | No shallow GB200 power-delivery support entity. |
| **CW-01** | Partial | **Revise / complete** | Rack property records 36 Grace CPUs; no Grace CPU entity/aggregate. |
| **CW-02** | Absent | **Verify first, then implement if supported** | No local NVMe/cache aggregate. |
| **CW-03** | Present | **Retain / verify** | Storage entity already describes AI-optimized object/file services without modeling service software as physical containment. |
| **CW-04** | Partial | **Revise / complete** | Remote compute-storage path exists; local-vs-remote path split is incomplete. |
| **CW-05** | Present | **Retain / verify** | Rail-optimized/400-Gb/s-per-GPU context is already present. |
| **XAI-01** | Closed / not applicable | **Closed — no addition** | Existing `colossus-spectrum` already represents SN5600; do not duplicate it. |
| **XAI-02** | Absent | **Implement** | No Spectrum-4 switch-ASIC child. |
| **XAI-03** | Present | **Retain / verify** | Current `colossus-roce` connects BlueField-3 SuperNICs to the Spectrum-X/SN5600 aggregate. |
| **XAI-04** | Superseded by newer baseline content | **Retain / verify** | Baseline already uses a current 220k+ mixed H100/H200/GB200 fleet note rather than the older 100k-only framing. |

## Initial-five physical-orientation implementation queue

This table turns the baseline reconciliation into the release-priority visual/physical work package. It does not re-run vendor research; Implementation must re-check the cited/available primary sources before canonical edits. “Anatomy Depiction” means the noninteractive planning contract in EXP-037/038 and DEP-031.

| Priority | Configuration / location | Manifest/new ID | Required visual outcome | Evidence limits | Preferred representation / interaction | Affected source paths | Implementation acceptance criteria |
|---|---|---|---|---|---|---|---|
| **P0** | Cross-system authoring/runtime | **G-01, G-02 + physical-anatomy contract** | Add only the semantic entity types actually needed for interactive host memory/rack power; add the separate noninteractive Anatomy Depiction source/runtime path so visible hardware does not require a new entity type. | No generic anatomy may be inferred from another system or `entity_type`. | Interactive Entity/Aggregate when relationships/state/detail matter; Anatomy Depiction for orientation-only parts. | `content/RSCs/reference_system.schema*.json`, `content/capabilities/entity_type_capabilities.yaml`, `scripts/content/`, `src/domain/types.ts`, `src/view-model/` | Schema/compiler can represent both semantic entities and noninteractive anatomy; depictions are coverage-auditable/accessibly described but never selectable/targetable/countable as entities. |
| **P0** | Cross-system reusable identity | **Product Catalog dependency** | Introduce `content/products/` and exact `product_ref` resolution without changing local physical identity. | Catalog only source-supported reusable product/model facts; generic anatomy requires no product record. | Non-instance Product Definition; no Explore node. | `content/products/` (new), RSC schemas, validators/compiler/runtime types | Catalog/reference rules from SHR-022–028 and implementation plan pass cross-file validation; no silent inline-identity/property conflicts. |
| **P1** | H100 / representative DGX node | **H100-01** | Show compute HCAs as the documented compute-network population rather than one ten-interface catch-all. | Preserve existing stable entity ID where possible; verify source-specific count/role. | Interactive Aggregate Entity. | `content/RSCs/nvidia_dgx_h100_superpod.yaml` | Compute HCA population/count/role validates and connects only to the compute fabric. |
| **P1** | H100 / representative DGX node | **H100-02** | Add separate storage/in-band network-interface population. | Do not merge with compute HCAs merely because product family is shared. | Interactive Aggregate Entity. | same RSC | Distinct interface role is visible/selectable and has only supported external paths. |
| **P1** | H100 / representative DGX node | **H100-03** | Visually distinguish OS/boot NVMe from data-cache/local-data NVMe. | Exact model/placement only if sourced. | Aggregate Entities if properties/roles are useful; otherwise one entity plus a noninteractive depiction only if role semantics remain clear. | same RSC | Learner can identify both storage roles without invented drive placement. |
| **P1** | H100 / representative DGX node | **H100-04** | Show host/system DRAM as a physical memory tier. | Exact module/DIMM layout not required; product identity not required. | Interactive `system_memory` Aggregate Entity because memory/data-path semantics are independently useful. | same RSC + schema/capability/property registry as needed | Host memory is visible, has supported capacity/evidence, and can participate in host↔accelerator data-path explanation. |
| **P1** | H100 / representative DGX node | **H100-05** | Show BMC/OOB management endpoint. | Exact controller SKU unnecessary unless sourced. | Entity if control/OOB relation is modeled; otherwise Anatomy Depiction. Preferred: interactive shallow entity because OOB path is architectural. | same RSC + schema/capability if new type required | OOB management path has a physical anchor without inventing BMC internals. |
| **P1** | H100 / SuperPOD fabrics | **H100-06, H100-07, H100-08, H100-09** | Separate compute InfiniBand, storage InfiniBand, in-band Ethernet, OOB management/UFM transport, and storage data path. | Preserve partner-dependent storage boundary; no unsupported port-by-port topology. | Interactive fabric/switch aggregates + typed Cross-Connections. | same RSC | Each major network role can be visually distinguished/traversed; broad old connections are replaced/refined without duplicate semantics. |
| **P1** | H100 / node power | **H100-11 (revised)** | Make the server power-supply assembly visibly present; retain supported count/redundancy/power facts in Detail. | Do not claim exact mechanical slot placement or PSU model unless sourced. | **Anatomy Depiction by default** for the PSU bank; promote to Aggregate Entity only if Scenario/relationship/detail semantics justify it. | same RSC + anatomy schema/runtime support; property registry if needed | Entering DGX node visibly shows power hardware; properties-only treatment is no longer accepted; depiction is noninteractive unless promoted. |
| **P2** | H100 / node board structure | **H100-12 (new)** | Verify and show motherboard/baseboard/HGX-style board boundary if source-supported and useful for locating CPUs, GPUs, NVSwitch/NIC relationships. | Do not invent board partition or exact PCB placement. | Anatomy Depiction or ordinary assembly entity only if real containment/navigation value is established. | same RSC | Board/support context improves orientation without creating a fake containment parent. |
| **P2** | H100 / node cooling | **H100-13 (new)** | Verify source-supported server cooling hardware and show a generic fan/cooling assembly if its absence leaves the node physically misleading. | Do not infer fan/cold-plate design from another DGX generation. | Anatomy Depiction unless independent cooling relationship/state is needed. | same RSC | Cooling presence is visible at supported generality and marked schematic when placement is not sourced. |
| **P2** | H100 / internal I/O | **H100-14 (new)** | Verify/represent the principal host I/O/PCIe relationship needed to explain CPU/NIC/accelerator/storage connectivity. | No invented lane map, switch count, or exact routing. | Typed Cross-Connection when endpoints are semantic entities; schematic visual line only for noncanonical detail that is not an architectural relationship. | same RSC | Major internal data path is understandable without claiming unsupported topology. |
| **P1** | H100 / Scenarios | **H100-10** | Add checkpoint/storage-pressure Scenario after storage network/path is modeled. | Qualitative state only unless sourced metrics exist. | Scenario targets configuration-local entities/connections, never Product Definitions/Anatomy Depictions. | `scenarios/h100-superpod-4su-reference.yaml` | Scenario validates and visibly emphasizes the storage/checkpoint path while physical hierarchy remains fixed. |
| **P1** | GB300 / compute tray | **GB300-01, GB300-02** | Add BlueField-3 DPU and M.2 OS storage alongside GPU/Grace/CX8/cache roles. | Verify exact supported model/role; do not infer per-port topology. | Interactive Aggregate Entities. | `content/RSCs/nvidia_dgx_gb300_nvl72_superpod.yaml` | Entering representative tray shows distinct compute, host, compute-network, converged-network/DPU, OS storage, and cache roles. |
| **P1** | GB300 / rack power | **GB300-03** | Show rack power shelves/power-delivery assembly as a first-class rack-scale physical subsystem. | Preserve sourced count/power role; no invented shelf internals. | Interactive `power_system` Aggregate Entity because rack power arrangement is architecture-relevant. | same RSC + schema/capability/property registry | Rack view exposes power hardware and dependency to the NVL72 rack; counts/basis validate. |
| **P1** | GB300 / networks/storage/OOB | **GB300-04–08** | Separate East/West compute fabric, North/South converged network, OOB management, external storage boundary, and typed relationships. | Do not assert unsupported full SuperPOD topology or storage vendor internals. | Interactive aggregates/black-box storage + Cross-Connections. | same RSC | Network planes are visually distinguishable and DPU/CX8 paths terminate at the correct semantic boundaries. |
| **P2** | GB300 / cooling anatomy | **GB300-11 (new)** | Refine rack/tray cooling depiction enough to show where liquid-cooling support physically relates to compute/switch trays. | Exact hose/manifold/cold-plate routing only if sourced. | Existing cooling entity plus Anatomy Depictions for orientation-only distribution hardware as warranted. | same RSC | Cooling no longer appears as a detached abstract support box; no fabricated routing. |
| **P2** | GB300 / tray support structure | **GB300-12 (new)** | Verify whether board/baseboard/interface-group context is needed to make the compute tray physically legible. | No schematic group may become a false containment parent. | Anatomy Depictions or visual grouping inside existing tray. | same RSC | Tray remains spatially clear without multiplying semantic entities. |
| **P1** | GB300 / Scenarios | **GB300-09, GB300-10** | Add compute-plane degradation and North/South/storage-pressure Scenarios after structural paths exist. | Qualitative outcomes; no invented metrics. | Named Scenario catalogs. | `scenarios/gb300-nvl72-superpod-reference.yaml` | Both Scenarios validate and target only supported physical paths. |
| **P1** | TPU7x / TPU chip | **TPU7-01, TPU7-02** | Resolve TPU into chiplet structure with TensorCore/SparseCore/HBM under the representative chiplet context and add VMEM/on-chip SRAM. | Preserve stable IDs where possible; verify exact per-chiplet allocation; do not fabricate extra internal routers. | Aggregate/representative structure at Tier 5. | `content/RSCs/google_tpu7x_ironwood.yaml` | Representative TPU anatomy explains chiplet/compute/memory hierarchy without creating fake addressable chiplets unless model supports them. |
| **P1** | TPU7x / host | **TPU7-03, TPU7-04** | Show host CPU-resource boundary, host memory, and PCIe host↔TPU path. | No unsupported CPU SKU or exact motherboard placement. D2D remains aggregate topology metadata unless two valid addressable endpoints exist. | Host memory/entity + generic CPU boundary/entity as evidence supports; typed PCIe relation. | same RSC + schema/capability/property registry | Entering host no longer shows only TPU chips; data staging path is physically understandable and D2D rule is preserved. |
| **P1** | TPU7x / scale-out | **TPU7-05** | Connect superpod/cube context to DCN. | Preserve only documented role/topology. | Cross-Connection. | same RSC | DCN is not an isolated decorative entity. |
| **P1** | TPU7x / Scenario | **TPU7-06** | Add HBM/host-memory pressure Scenario. | Qualitative, fixed architecture. | Scenario. | `scenarios/tpu7x-9216-chip-superpod.yaml` | Scenario targets supported memory/data path and validates. |
| **P1** | Cerebras / WSE-3 | **CER-01, CER-02** | Add on-wafer mesh/fabric and explicit core/SRAM↔mesh data relationships. | Do not infer router micro-topology beyond source-supported mesh abstraction. | Interactive/aggregate fabric entity + Cross-Connections. | `content/RSCs/cerebras_cs3_condor_galaxy3.yaml` | Entering WSE-3 shows cores, SRAM, and the physical fabric connecting them. |
| **P1** | Cerebras / MemoryX/SwarmX/management | **CER-03–05** | Enrich capacity/link context where supported and connect management/control to cluster systems. | CER-04 remains evidence-gated; exact appliance counts/rack placement stay unknown. | Properties + control relationship; no invented appliance internals. | same RSC + property registry | Support appliances are not isolated filler and uncertainty remains explicit. |
| **P2** | Cerebras / CS-3 enclosure support | **CER-07 (new)** | Review source-supported power/cooling/network-interface/support anatomy at the CS-3 enclosure boundary and show only what is established. | No generic “normal server” anatomy may be imported into wafer-scale CS-3. | Anatomy Depictions unless independent semantic targets are warranted. | same RSC | CS-3 boundary is physically credible without violating proprietary/evidence limits. |
| **P1** | Cerebras / Scenario | **CER-06** | Add MemoryX/weight-stream pressure Scenario. | Qualitative. | Scenario. | `scenarios/condor-galaxy-3-64-cs3.yaml` | Scenario validates and highlights the existing weight path. |
| **P1** | Meta / RoCE fabric | **META-01, META-02** | Resolve RoCE switch aggregate into supported switch-family child aggregates and refine 400-Gb/s/topology-aware context. | No exact port-by-port/fabric topology beyond source. | Interactive Aggregate Entities under existing fabric aggregate. | `content/RSCs/meta_h100_roce_24k.yaml` | Heterogeneous fabric is visible without assigning one product identity to the whole aggregate. |
| **P1** | Meta / storage | **META-03, META-04** | Retain current Tectonic/Hammerspace explanatory context and add checkpoint/storage burst Scenario. | Software/services remain explanatory, not physical entities. | Existing storage entities + Scenario. | same RSC; `scenarios/meta-24576-h100-roce.yaml` | Storage path remains physical while service software stays out of containment; Scenario validates. |
| **P1** | Meta / Grand Teton | **META-05 + META-06 (new)** | Preserve Grand Teton as a black box, but visibly depict the **already established** integrated power, control, and fabric support anatomy around the H100 compute representation. | Current baseline evidence establishes integrated power/control/compute/fabric but not exact H100-per-chassis layout or DGX-like internal decomposition. Do not import DGX anatomy. | Noninteractive Anatomy Depictions for power/control/fabric support under the black-box Grand Teton context; existing H100 aggregate remains semantic entity. | same RSC + anatomy runtime support | Entering Grand Teton no longer implies “only GPUs exist”; generic support anatomy is visible, schematic, accessible, noninteractive, and no unsupported SKU/count/topology is added. |

## Later-candidate coverage disposition

Later candidates remain part of the authored corpus and should receive the same physical-orientation policy when their content is touched or before they are promoted. They are **not** a Version-1 release requirement. The reconciliation table above is the work queue: Implement/Revise rows remain valid future work; evidence-gated rows must be verified first; Closed rows remain closed. When a later-candidate entered context is eventually exposed as release content, apply DEP-033/RDY-018 rather than a minimum object-count target.

Notable baseline-retain cases include `TRN2-05`, `TRN3-03`, `GROQ-03`, `OCI-06`, `OCI-07`, `CW-03`, `CW-05`, and `XAI-03`; deliberate closures remain `G-04`, `OCI-01`, `OCI-02`, `OCI-08`, and `XAI-01`. `XAI-04` is superseded by newer mixed-fleet baseline wording and should not be recreated literally.

## Completion test for every entered context

Use the Source-of-Truth DEP-033 test. Completion is reached when the learner can identify the enclosing boundary, major known physical constituents, principal relevant physical paths, and honest aggregate/generic/black-box limits. There is **no minimum child count** and no requirement to materialize every PSU, fan, DIMM, port, cable, connector, or board. Conversely, a properties-only statement does not satisfy the test when visible presence is needed for orientation.


## Implementation completion status — 2026-09-07

All reconciled rows with Planning disposition **Implement** or **Revise / complete** were applied to the supplied baseline unless explicitly closed below. Baseline-present **Retain / verify** rows were retained and revalidated. Evidence-gated CER-04, ELCAP-04, RUBIN-02/03, OCI-09, and CW-02 were implemented at the documented safe evidence boundary. Deliberate closures G-04, OCI-01, OCI-02, OCI-08, and XAI-01 remain closed; XAI-04 remains superseded by the newer mixed-fleet wording. New physical-orientation rows H100-12/13/14, GB300-11/12, CER-07, and META-06 were completed using ordinary entities where independent semantics mattered and noninteractive Anatomy Depictions where orientation-only physical presence was appropriate.

Validation on this implementation snapshot: RSC **16 systems / 18 configurations PASS**; Product/Anatomy **PASS**; Concepts **15 PASS** with **9/9** Concept tests; V1 **5 systems / 15 Concepts / 45 Properties / 0 errors**; deterministic runtime **54 artifacts PASS**; branch coverage **75 branches / 0 errors**; physical-orientation audit **65 entered contexts / 0 errors**; Property fixtures **5/5 PASS**. Chromium density benchmark confirms the densest initial-five context is the DGX H100 node with **9 interactive entities + 4 Anatomy Depictions** and Anatomy Depictions create **0 focus targets**.

Package-backed TypeScript/Vitest/Vite/Playwright execution remains **blocked by environment dependency installation**: DNS resolution for `registry.npmjs.org` fails, and the partial `node_modules` tree lacks required installed type packages and executables. These checks are not recorded as passes.


## Device-interior coverage expansion — 2026-09-07 follow-up

A second physical-coverage pass was completed against the current repository baseline after comparing Explore UI Entry behavior with the readiness audit. The UI permits contextual Entry not only for semantic children and representative members, but also for non-black-box architectural relationship endpoints. The prior audit did not include that last class, allowing physically empty terminal-device interiors to escape RDY-018. The audit now mirrors the UI rules and also recognizes terminal entities with authored Anatomy Depictions.

| Initial system | Audited entered contexts after expansion | Device-interior outcome |
|---|---:|---|
| NVIDIA DGX H100 SuperPOD | 17 | GPU/CPU/memory/NVSwitch/NIC/NVMe/BMC, management servers, and compute/storage/in-band/OOB switch interiors have source-bounded anatomy. |
| NVIDIA DGX GB300 NVL72 SuperPOD | 17 | B300/Grace/LPDDR/CX-8/BlueField/NVSwitch/cache/OS storage, switch trays, rack power/cooling, and fabric/OOB switch interiors are represented. |
| Google TPU7x Ironwood | 10 | Host memory/CPU boundary, OCS/DCN, and cooling interiors are represented only to the public level of detail; undisclosed device models remain generic. |
| Cerebras Condor Galaxy 3 | 10 | CS-3/WSE support, cores/SRAM/wafer mesh, MemoryX, SwarmX, preprocessing, and management interiors are represented at documented or explicitly representative generality. |
| Meta H100 RoCE cluster | 11 | H100/E1.S, Wedge 400, Minipack2, and the Arista 7800-family boundary have physical anatomy; family-only evidence remains explicitly representative. |

**Acceptance result:** RDY-018 now checks **65** entered contexts and reports **0 mechanical errors**. Every audited entered context has semantic children or authored Anatomy Depictions; explicit black-box boundaries remain non-enterable unless they have deliberately authored anatomy. Depictions remain noninteractive and are not counted as Entities.

**Known evidence boundaries retained:** exact GB300 E1.S cache population remains source-revision-sensitive; Meta's exact Arista 7800 generation/chassis is not established by the current public cluster description; partner/deployment-specific storage internals remain black boxes; public Ironwood documentation does not identify the exact CPU-host SKU or device-level DCN/OCS/cooling BOM; and public Cerebras material does not establish the exact preprocessing/management server BOM or complete MemoryX/SwarmX chassis internals. These limits must remain visibly generic/simplified until stronger source evidence is supplied.
