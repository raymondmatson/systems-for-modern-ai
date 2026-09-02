# Rail-optimized fabrics

## Overview

A rail-optimized fabric organizes network connectivity so corresponding NICs or accelerator-facing interfaces are grouped into repeated rails. Instead of treating every endpoint as interchangeable, the topology preserves useful locality between a device, its preferred network interface, and a predictable portion of the switching fabric.

## Why It Matters

Distributed AI communication is sensitive to placement and path selection. Rail-aware designs can reduce unnecessary cross-fabric traffic and make collective communication more regular, but they also require software and operators to understand which endpoints belong to which rails.

## Examples and Applications

The Version-1 Reference Systems link this Concept only to explicit authored architecture occurrences. System-specific counts, topology details, and operating conditions remain in the owning Reference Configuration or Scenario catalog.

## Connections to Other Concepts

This Concept participates in the broader physical hierarchy, networking, data-movement, performance, or thermal themes of the project. Related concepts should be added to the machine-readable relationship graph only when the relationship is explicit and useful rather than inferred from textual similarity.
