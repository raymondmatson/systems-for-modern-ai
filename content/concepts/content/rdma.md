# Remote Direct Memory Access

## Overview

Remote Direct Memory Access (RDMA) is a communication mechanism that lets one system transfer data directly to or from registered memory on another system while minimizing CPU involvement in the data path. RDMA describes the memory-access and transport semantics; it is not itself one specific physical network fabric.

## Why It Matters

Distributed AI workloads repeatedly exchange gradients, activations, parameters, KV-cache state, and other large tensors. Reducing CPU copying and software overhead helps communication make better use of high-bandwidth networks and can lower latency for synchronization-heavy workloads.

## How It Works

Software prepares memory regions for device access and establishes the communication resources needed by the RDMA-capable network stack. A NIC or similar adapter can then move payload data between local and remote registered memory according to the supported RDMA operations. The CPUs remain responsible for setup, coordination, protection, and application logic even though they are less involved in the bulk data transfer.

## Key Properties

RDMA is associated with low software overhead, direct placement into registered memory, and asynchronous queue-based communication. Its practical behavior depends on the transport, NIC implementation, congestion behavior, memory-registration model, and network architecture beneath it.

## Tradeoffs and Limitations

The mechanism requires compatible hardware and software, explicit memory-management rules, careful protection of registered regions, and a network that can meet the transport's operational requirements. RDMA does not eliminate congestion, queueing, synchronization costs, or application-level coordination.

## Examples and Applications

Large AI clusters use RDMA-capable networking for distributed training and other high-throughput communication. Technologies such as RoCE and InfiniBand can provide RDMA semantics over different network stacks and operational models.

## Connections to Other Concepts

DMA is a useful prerequisite because it introduces device-driven memory movement within one system. RoCE is a specialized way to provide RDMA over Ethernet, while InfiniBand provides another widely used RDMA-capable fabric model.

## Sources / Further Reading

- RFC Editor, *A Remote Direct Memory Access Protocol Specification* (RFC 5040).
