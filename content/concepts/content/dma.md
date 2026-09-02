# Direct Memory Access

## Overview

Direct Memory Access (DMA) lets a hardware device move data between the device and system memory without requiring the CPU to copy every byte itself. The CPU still participates in setting up work and handling completion, but the transfer engine performs the bulk movement.

## Why It Matters

Modern AI systems move large volumes of data among storage devices, host memory, accelerators, and network interfaces. DMA reduces CPU copying overhead and is a foundation for higher-level mechanisms such as peer-to-peer transfers and Remote Direct Memory Access.

## How It Works

A driver prepares memory that a device can access, configures the device or DMA engine with the relevant addresses and transfer parameters, and starts the operation. The device then reads from or writes to memory over the system interconnect. Completion is reported through an interrupt, queue entry, polling mechanism, or another device-specific path.

## Key Properties

Important properties include which memory regions are accessible, whether address translation is involved, the direction of the transfer, the available interconnect bandwidth, and how coherency or synchronization is maintained between the CPU and device.

## Tradeoffs and Limitations

DMA reduces CPU participation in bulk copies, but software must still manage buffer ownership, synchronization, mapping, protection, and device-specific constraints. A DMA-capable path is therefore not automatically equivalent to zero-copy application behavior.

## Examples and Applications

Storage controllers, NICs, GPUs, and other accelerators use DMA to exchange data with host memory. Direct device-to-device paths may combine DMA capabilities with peer-to-peer interconnect support to avoid unnecessary staging through CPU-managed copies.

## Connections to Other Concepts

RDMA extends the same broad idea across a network by enabling direct access to registered memory on another system. DMA is therefore a useful prerequisite for understanding RDMA and several CPU-bypass data paths.

## Sources / Further Reading

- Linux kernel documentation, *Dynamic DMA mapping Guide*.
