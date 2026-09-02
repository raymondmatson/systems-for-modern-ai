# Clos Topology

## Overview

A Clos topology is a multistage switching structure that connects groups of endpoints through multiple intermediate switching paths. Modern data-center leaf-spine networks are commonly understood as practical Clos-derived designs.

## Why It Matters

Large AI clusters need to connect many servers while preserving substantial east-west bandwidth and multiple routing choices. Clos-style fabrics scale by adding switching capacity in stages rather than requiring every endpoint to connect directly to every other endpoint.

## How It Works

Endpoints attach to an edge or leaf stage. Traffic can then traverse one of several intermediate or spine switches before reaching the destination side. The number of stages, port counts, oversubscription choices, and routing policy determine the capacity and resilience of a particular deployment.

## Key Properties

Important characteristics include path diversity, bisection bandwidth, oversubscription, failure domains, cable count, switch radix, and routing balance. A topology diagram should distinguish the abstract Clos structure from the exact physical switch products used to realize it.

## Tradeoffs and Limitations

Clos fabrics can require many switches and links, and their theoretical path diversity does not guarantee balanced real-world traffic. Cabling, routing, congestion, failure handling, and cost all shape the useful capacity of the implemented network.

## Examples and Applications

Leaf-spine Ethernet and InfiniBand fabrics are common examples of Clos-derived organization. Individual Reference Configurations should describe the actual topology and hardware they use rather than assuming every scale-out network is a Clos fabric.
