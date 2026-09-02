# RDMA over Converged Ethernet

## Overview

RDMA over Converged Ethernet (RoCE) is a way to provide RDMA communication over Ethernet infrastructure. It combines RDMA memory and queue semantics with an Ethernet-based network, allowing clusters to use familiar Ethernet switching while supporting direct, low-overhead data movement.

## Why It Matters

Ethernet is widespread in data centers, while distributed AI workloads benefit from the lower CPU overhead and efficient data placement associated with RDMA. RoCE joins those two concerns and is therefore common in AI scale-out fabrics built around Ethernet.

## How It Works

Applications use an RDMA software stack and RDMA-capable NICs. The resulting traffic is carried by Ethernet, with the exact packet and routing behavior depending on the RoCE version and network design. Large deployments also need deliberate congestion, queue, and traffic-management practices because RDMA semantics do not remove contention from the fabric.

## Key Properties

RoCE depends on RDMA-capable endpoints and Ethernet switching. It should be distinguished from RDMA as the general memory-access mechanism and from Ethernet as the underlying link/network technology.

## Tradeoffs and Limitations

Operational quality depends heavily on fabric design, congestion control, queue management, loss behavior, telemetry, and configuration discipline. The ability to use Ethernet does not make a high-performance RoCE network operationally identical to a conventional best-effort Ethernet network.

## Examples and Applications

RoCE is used in large accelerator clusters where GPUs or other compute devices communicate through NICs and an Ethernet scale-out fabric. The Concept Library keeps this mechanism global; individual Reference Configurations record their own RoCE occurrences and system-specific details.

## Connections to Other Concepts

RDMA is the direct prerequisite and broader mechanism. Ethernet, congestion control, ECN, PFC, and DCQCN are related subjects that become important when studying specific RoCE deployments in more depth.
