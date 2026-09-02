# Latency

## Overview

Latency measures elapsed time between a defined start event and a defined completion event. The relevant endpoints depend on context: memory access latency, network message latency, storage latency, request latency, and inter-token latency all measure different paths.

## Why It Matters

AI systems contain many serialized dependencies. A workload can have abundant aggregate bandwidth yet still perform poorly when critical operations take too long to complete. Latency is therefore essential for understanding interactive inference, synchronization, memory hierarchy behavior, storage access, and network communication.

## Key Properties

A latency number is meaningful only when its measurement boundary and workload conditions are clear. Useful distinctions include one-way versus round-trip latency, average versus percentile or tail latency, local versus remote access, and idle-path versus loaded-system behavior.

## Tradeoffs and Limitations

Latency and throughput are related but not interchangeable. Techniques that improve aggregate throughput may increase queueing delay, and techniques that minimize latency may leave capacity underutilized. Comparing latency values without matching definitions or conditions can be misleading.

## Examples and Applications

Examples include HBM access latency, NIC-to-NIC communication latency, storage read latency, time to first token, and inter-token latency during model serving. Each is a separate measurement even though all use the same general metric Concept.
