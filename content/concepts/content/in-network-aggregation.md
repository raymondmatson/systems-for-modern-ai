# In-network aggregation

## Overview

In-network aggregation performs part of a collective reduction inside network or fabric infrastructure rather than requiring every intermediate result to travel all the way to host or accelerator software. A switch, fabric appliance, or dedicated collective engine can combine data while it is being transported.

## Why It Matters

Collective operations such as gradient reductions can consume a large fraction of distributed training time. Offloading aggregation can reduce traffic and endpoint work, but the benefit depends on supported operations, topology, precision requirements, scheduling, and the behavior of the surrounding communication library.

## Examples and Applications

The Version-1 Reference Systems link this Concept only to explicit authored architecture occurrences. System-specific counts, topology details, and operating conditions remain in the owning Reference Configuration or Scenario catalog.

## Connections to Other Concepts

This Concept participates in the broader physical hierarchy, networking, data-movement, performance, or thermal themes of the project. Related concepts should be added to the machine-readable relationship graph only when the relationship is explicit and useful rather than inferred from textual similarity.
