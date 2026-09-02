# High Bandwidth Memory

## Overview

High Bandwidth Memory (HBM) is a stacked DRAM technology designed to provide very high memory bandwidth close to GPUs and other accelerators. Multiple memory dies are stacked and connected through dense vertical interconnects, with the stack integrated near the compute package through advanced packaging.

## Why It Matters

AI accelerators repeatedly stream model weights, activations, gradients, and temporary tensors between compute units and memory. HBM helps supply the bandwidth required to keep large parallel compute engines fed while using less board area and lower signaling energy per transferred bit than many conventional wide external-memory arrangements.

## How It Works

HBM combines several DRAM dies into a stack and exposes a very wide interface to the accelerator through an interposer or other advanced package structure. Controllers on the accelerator schedule memory traffic across channels and stacks. Capacity and bandwidth depend on the HBM generation, stack organization, interface width, and accelerator design.

## Key Properties

Important properties include capacity per stack, aggregate device capacity, memory bandwidth, channel organization, package placement, and the relationship between memory bandwidth and accelerator compute throughput.

## Tradeoffs and Limitations

HBM provides high bandwidth but is expensive, package-constrained, and finite in capacity. Workloads whose active state exceeds available HBM may need sharding, recomputation, host-memory movement, or storage-backed offload, each of which introduces additional performance tradeoffs.

## Examples and Applications

Modern GPUs and other AI accelerators use HBM as their primary high-performance device memory. The exact HBM generation, stack count, capacity, and placement are properties of the physical accelerator implementation and belong in the relevant Reference Configuration or product detail, not in the global Concept identity.
