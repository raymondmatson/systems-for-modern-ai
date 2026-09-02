# Topology-aware placement

## Overview

Topology-aware placement assigns workloads, ranks, or communicating workers with knowledge of the physical network structure. The scheduler or runtime tries to keep traffic on favorable links, rails, switches, racks, or other locality domains instead of treating every accelerator as equally distant.

## Why It Matters

Large AI jobs are communication-heavy, so poor placement can turn a capable network into a bottleneck. Topology awareness can improve effective bandwidth and reduce contention, while failures or partial availability may force the system to accept less favorable placements.

## Examples and Applications

The Version-1 Reference Systems link this Concept only to explicit authored architecture occurrences. System-specific counts, topology details, and operating conditions remain in the owning Reference Configuration or Scenario catalog.

## Connections to Other Concepts

This Concept participates in the broader physical hierarchy, networking, data-movement, performance, or thermal themes of the project. Related concepts should be added to the machine-readable relationship graph only when the relationship is explicit and useful rather than inferred from textual similarity.
