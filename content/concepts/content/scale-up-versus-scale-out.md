# Scale-up versus scale-out

## Overview

Scale-up expands a tightly coupled compute domain, usually by connecting accelerators inside one server, tray, rack, or similarly close physical unit. Scale-out expands the system by connecting multiple nodes or racks through a broader fabric. The distinction is about coupling, latency, bandwidth, topology, and physical scope rather than simply the number of accelerators.

## Why It Matters

Modern AI systems commonly combine both forms of scaling. A learner needs to recognize where a fast local accelerator fabric ends and where a cluster network begins, because collective communication behavior, failure domains, locality, and achievable bandwidth can change sharply across that boundary.

## Examples and Applications

The Version-1 Reference Systems link this Concept only to explicit authored architecture occurrences. System-specific counts, topology details, and operating conditions remain in the owning Reference Configuration or Scenario catalog.

## Connections to Other Concepts

This Concept participates in the broader physical hierarchy, networking, data-movement, performance, or thermal themes of the project. Related concepts should be added to the machine-readable relationship graph only when the relationship is explicit and useful rather than inferred from textual similarity.
