# Organizational Content Inventory

Below is the **current consolidated Organizational Content Inventory** for the project, incorporating the original brainstorm and the additions that survived the literature review. This remains an organizational inventory rather than a commitment that every item receives equal visual depth.

## Taxonomy conventions

- Numbered section headings are the canonical inventory **category** names used by validation.
- Listed items and named subsections are canonical inventory **item** labels; source files should preserve their spelling, capitalization, punctuation, and singular/plural form when referencing the inventory.
- Repeated subjects across categories are intentional cross-classification, not duplicate semantic identity. For example, DMA, latency, HBM, power infrastructure, and similar topics may appear in several organizational contexts while still resolving to one global Concept where the Concepts model defines one.
- Product and technology names preserve their established technical capitalization, including GPU, TPU, HBM, CXL, NVLink, RoCE, InfiniBand, SmartNIC, DPU, and UALink.
- The inventory classifies project scope; it does not determine Explore containment, `entity_type`, Concept identity, Scenario behavior, or application behavior.

## 1. Physical infrastructure hierarchy

- Data center campuses
- Data centers
- Regions / availability zones
- Compute clusters
- Pods / superpods
- Rows
- Racks
- Rack units
- Compute trays / accelerator trays
- Switch trays / fabric switch trays
- Open rack standards / form factors
- Servers / compute nodes
- Storage servers
- Input preprocessing / data-feeder servers
- Management / head / login nodes
- Network switches
- Routers
- Patch panels
- Optical distribution frames
- Power infrastructure
- Cooling infrastructure

## 2. Server-level hardware

- Motherboards / baseboards
- GPUs
- CPUs
- TPUs
- Other AI accelerators
- APUs / unified CPU–GPU accelerator packages
- NICs
- SmartNICs
- DPUs
- Memory
  - DRAM
  - HBM
  - persistent / extended memory where relevant
- Local storage
  - NVMe SSDs
  - SATA SSDs
  - HDDs where applicable
  - boot drives
- PCIe slots
- PCIe switches
- Retimers
- Chipsets
- CPU sockets
- Power supplies
- Voltage regulators / power-delivery circuitry
- Fans
- Heat sinks
- Cold plates
- Baseboard management controllers
- TPMs
- BIOS / UEFI / firmware

## 3. Accelerator internals

- GPU / accelerator dies
- Chiplets
- Compute cores
- CUDA cores
- Tensor cores
- Matrix-multiply units
- Vector units
- Scalar units
- Sparse / embedding accelerator cores
- Dedicated collective communication engines / cores
- Streaming multiprocessors
- Systolic arrays
- HBM stacks
- Memory controllers
- Register files
- On-chip SRAM
- L1 cache
- L2 cache
- Shared memory
- Instruction caches
- Warp / wavefront schedulers
- DMA engines
- Interconnect controllers
- PCIe interfaces
- NVLink-style interfaces
- SerDes
- Interposers
- Silicon bridges
- Advanced packaging
- Thermal interfaces

## 4. CPU architecture

- CPU cores
- Threads
- Simultaneous multithreading
- CPU sockets
- NUMA
- L1 / L2 / L3 cache
- Cache coherence
- Memory controllers
- Memory channels
- SIMD / vector instructions
- PCIe root complexes
- Interrupts
- DMA
- Virtual memory
- Page tables
- Huge pages

## 5. Memory hierarchy

- Registers
- On-chip SRAM
- CPU caches
- GPU caches
- GPU shared memory
- GPU HBM
- CPU DRAM
- Host memory
- Device memory
- Unified / coherent memory
- Fabric-attached memory
- External accelerator memory appliances
- Pooled memory
- Shared rack-scale memory
- Storage-backed / offloaded memory

Associated concepts:

- Capacity
- Bandwidth
- Latency
- Locality
- Memory channels
- Memory controllers
- NUMA locality
- Memory mapping
- Pinning
- Paging
- Allocation
- Fragmentation
- Memory pools
- Tiering
- Coherence

### CXL-related memory concepts

CXL should be treated as more than another bus:

- Memory expansion
- Memory pooling
- Memory tiering
- Fabric-attached memory
- Shared memory resources
- Rack-scale memory disaggregation
- Local versus remote memory
- Coherent versus non-coherent access

## 6. AI-specific memory and model state

- Model weights
- Parameters
- Activations
- Gradients
- Optimizer states
- Temporary tensors
- Attention matrices
- Embedding tables
- MoE expert weights
- KV caches
- KV-cache growth
- KV-cache paging
- KV-cache eviction
- KV-cache migration
- KV-cache offloading
- KV-cache compression
- Prefix caching
- Prompt caching
- Shared / disaggregated KV-cache storage
- Activation checkpointing / recomputation
- Parameter offloading
- CPU offloading
- Storage offloading

A particularly important visual concept is the **KV-cache lifecycle**:

**created during prefill → stored in HBM → potentially moved/offloaded/shared → consumed during decode → reused or evicted**

## 7. Local server interconnects

- PCI Express
- PCIe lanes
- PCIe generations
- PCIe switches
- PCIe root complexes
- NVLink
- NVSwitch
- Infinity Fabric
- TPU Inter-Chip Interconnect (ICI)
- NeuronLink
- CXL
- UCIe
- UALink / emerging scale-up fabrics
- Coherent CPU–GPU links
- SerDes
- Retimers
- DMA
- Peer-to-peer DMA
- GPUDirect
- GPUDirect RDMA
- Zero-copy transfers
- Link bandwidth
- Link latency
- Lane width
- Interconnect topology

## 8. Network hardware

- NICs
- SmartNICs
- DPUs
- Elastic Fabric Adapter (EFA)
- Ethernet switches
- InfiniBand switches
- Routers
- Specialized collective / model-distribution fabric appliance
- Switch ASICs
- Network ports
- Fiber-optic cables
- Copper cables
- Direct-attach copper
- Active electrical cables
- Active optical cables
- Optical transceivers
- Copper transceivers
- QSFP modules
- OSFP modules
- Single-mode fiber
- Multimode fiber
- LC connectors
- MPO / MTP connectors
- Breakout cables
- Patch panels
- SerDes
- Retimers

### SmartNIC / DPU internals

These now warrant meaningful internal treatment:

- Network-facing ports
- Host-facing interface
- Onboard processor / SoC
- Local memory
- Packet-processing datapath
- Offload engines
- Storage / networking / management offload paths

## 9. Network organization and fabrics

- Frontend networks
- Backend / accelerator networks
- Storage networks
- Management networks
- AI training fabrics
- HPE Slingshot fabric
- Scale-up networks
- Scale-out networks
- GPU-to-NIC affinity
- Network rails
- Multi-rail networking
- Rail-optimized fabrics
- East-west traffic
- North-south traffic
- Oversubscription
- Bisection bandwidth

This now includes the important idea that **“the network” may consist of several distinct fabrics serving different purposes**.

## 10. Network topologies

The inventory covers the following topology families. Individual Reference Configurations should model only the topologies they actually use, while comparison content may contrast selected families:

- Point-to-point
- Star
- Mesh
- Ring
- Fat tree
- Clos
- Leaf-spine
- Dragonfly
- Dragonfly-derived AI fabrics
- Torus
- HammingMesh
- Boardfly topology
- Rail-optimized architectures
- Reconfigurable fabrics

### Dynamic / optical topology

- Optical circuit switches
- MEMS optical switching
- Dynamically reconfigurable connectivity
- Software-controlled physical topology

## 11. Optical networking

- Photons / optical signaling
- Lasers
- Optical transceivers
- Electro-optical conversion
- Fiber
- Wavelengths
- Wavelength-division multiplexing
- Silicon photonics
- Co-packaged optics
- Optical circuit switches
- Optical loss
- Optical power budgets
- Reach

## 12. Copper networking

- Electrical signaling
- Twinax
- Direct-attach copper
- Active electrical cables
- Signal attenuation
- Signal integrity
- Equalization
- Retimers
- Cable-length limitations
- Power / reach tradeoffs versus optics

## 13. Networking protocols

- Ethernet
- Ultra Ethernet
- InfiniBand
- IP
- IPv4
- IPv6
- TCP
- UDP
- ICMP
- ARP
- DHCP
- DNS
- VLANs
- VXLAN
- BGP
- OSPF
- ECMP
- RDMA
- RoCE
- RoCEv2
- iWARP
- PFC
- ECN
- DCQCN
- Congestion control
- Flow control
- QoS
- Packet routing
- Packet switching
- Packet loss
- Retransmission
- MTU
- Jumbo frames

Security is intentionally shallow in the core scope; deeper treatment is deferred unless later requirements justify it.

## 14. Communication stack

A newly explicit cross-layer concept:

**AI framework / model-parallel operation**  
→ **collective or communication API**  
→ **communication library**  
→ **transport / backend**  
→ **NIC or local interconnect**  
→ **physical fabric**

Relevant elements:

- PyTorch distributed communication
- NCCL
- RCCL
- MPI
- Gloo
- RDMA
- RoCE / InfiniBand
- NVLink
- Ethernet
- Host-initiated communication
- Device-initiated communication
- Remote-memory access
- Zero-copy communication

## 15. Collective communication

- All-reduce
- All-gather
- Reduce-scatter
- All-to-all
- Broadcast
- Scatter
- Gather
- Point-to-point communication
- Ring algorithms
- Tree algorithms
- Topology-aware collectives
- Collective scheduling
- Collective tuning
- Communication/computation overlap
- Tensor synchronization
- Gradient synchronization

### In-network computing

- In-network aggregation
- Switch-assisted collectives
- Programmable switch computation
- Collective offload

Keep this area conceptual rather than turning it into a catalog of individual research algorithms.

## 16. Distributed training

- Data parallelism
- Distributed data parallelism
- Tensor parallelism
- Pipeline parallelism
- Sequence parallelism
- Context parallelism
- Expert parallelism
- Model parallelism
- Hybrid parallelism
- Sharding
- FSDP
- ZeRO
- Gradient accumulation
- Gradient checkpointing
- Microbatches
- Global versus local batch sizes
- Synchronization
- Synchronous / asynchronous training
- Checkpointing
- Fault recovery
- Elastic training
- Topology-aware placement

## 17. Mixture-of-Experts systems

- Experts
- Router / gating network
- Sparse activation
- Token routing
- Expert parallelism
- Expert placement
- Expert capacity
- Load balancing
- All-to-all communication
- Communication hotspots
- Expert sharding

## 18. Inference systems

- Model serving
- Inference servers
- Request queues
- Scheduling
- Load balancing
- Prefill
- Decode
- Autoregressive generation
- Disaggregated prefill / decode
- KV-cache transfer between phases
- Continuous batching
- Dynamic batching
- Static batching
- Chunked prefill
- Prefix caching
- Prompt caching
- Speculative decoding
- Quantization
- Model replicas
- Autoscaling

Important performance concepts:

- Time to first token
- Inter-token latency
- Tokens per second
- Requests per second
- Throughput
- Tail latency
- Concurrency

## 19. Model representation

- Parameters
- Weights
- Biases
- Tensors
- Activations
- Gradients
- Optimizer states
- Embeddings
- Attention heads
- Transformer layers
- Feed-forward layers
- Experts
- Tokens
- Token sequences
- Context windows
- Vocabulary

### Numerical formats

- FP32
- FP16
- BF16
- FP8
- **FP4**
- INT8
- INT4

## 20. Computation

- Matrix multiplication
- GEMM
- Tensor operations
- Vector operations
- Attention
- Softmax
- Layer normalization
- Convolution
- Kernel execution
- Kernel fusion
- GPU occupancy
- SIMD
- SIMT
- Parallelism
- Arithmetic intensity
- FLOPs / FLOP/s
- Compute-bound workloads
- Memory-bound workloads
- Communication-bound workloads

## 21. Storage

- Local storage
- Distributed storage
- Object storage
- Block storage
- File storage
- NVMe
- NVMe over Fabrics
- RAID
- Network-attached storage
- Parallel file systems
- Lustre
- GPFS / Spectrum Scale
- Ceph
- Object stores
- Data lakes
- Dataset storage
- Checkpoint storage
- Model repositories
- Cache / scratch storage
- Storage tiers
- Storage bandwidth
- IOPS
- Storage latency

## 22. Direct data movement and GPU I/O

This now deserves explicit treatment:

- Host-to-device transfer
- Device-to-host transfer
- Device-to-device transfer
- Peer-to-peer transfer
- DMA
- RDMA
- Zero-copy transfer
- GPUDirect Storage / direct storage-to-GPU concepts
- GPU-initiated I/O
- CPU-bypass data paths
- Buffering
- Packetization
- Serialization

## 23. Data pipelines

- Dataset ingestion
- Data preprocessing
- Tokenization
- Data loaders
- Shuffling
- Sampling
- Dataset shards
- Data caching
- Prefetching
- Data staging
- Streaming datasets
- Host-to-device movement
- ETL pipelines

## 24. Persistent-state flows

Two explicit flows are part of the conceptual model.

### Model startup

**Model repository / checkpoint**  
→ storage or cache  
→ host memory / direct path  
→ GPU memory  
→ serving

### Training checkpoint and recovery

**GPU/model state**  
→ host memory  
→ distributed storage  
→ later restore  
→ host / GPU memory  
→ resumed training

## 25. Operating system and low-level software

- Linux
- Kernel
- Device drivers
- GPU drivers
- Kernel modules
- CUDA
- ROCm
- Runtime libraries
- Firmware
- Filesystems
- Processes
- Threads
- CPU affinity
- NUMA affinity
- GPU affinity
- Memory management
- I/O scheduling

## 26. AI software stack

Primarily as context linking software to hardware:

- PyTorch
- TensorFlow
- JAX
- CUDA
- ROCm
- XLA
- Triton
- cuDNN
- cuBLAS
- NCCL
- TensorRT
- TensorRT-LLM
- vLLM
- Distributed-training frameworks
- Inference runtimes
- Compilers
- Kernels
- Libraries
- Drivers

A useful conceptual stack remains:

**Application → framework → runtime/libraries → driver/OS → hardware**

## 27. Containers, virtualization, and resource abstraction

- Containers
- Docker
- containerd
- Kubernetes
- Pods
- Virtual machines
- Bare metal
- Container images
- Registries
- GPU passthrough
- Device plugins
- GPU virtualization
- MIG
- GPU partitioning
- SR-IOV
- Virtual NICs
- Virtual storage
- Hypervisors
- Resource pools
- Multi-tenancy

## 28. Cluster management and scheduling

- Job schedulers
- Slurm
- Kubernetes schedulers
- Resource managers
- Queues
- Jobs
- Tasks
- Workers
- Resource allocation
- GPU / CPU / memory allocation
- Priorities
- Reservations
- Preemption
- Gang scheduling
- Placement
- Topology-aware scheduling
- Autoscaling
- Cluster provisioning

Scheduling may also consider:

- Network locality
- Memory locality
- Power headroom
- Cooling headroom

## 29. Power infrastructure

- Grid connections
- Backup generators
- UPS systems
- Busways
- Rack PDUs
- Server power supplies
- Voltage conversion
- High-voltage DC / 800 VDC distribution
- Side power rack / power sidecar
- Direct MVAC-to-HVDC conversion
- DC busway / row-level DC distribution
- Facility-to-rack power-conversion topology
- GPU power
- CPU power
- Rack power density
- Power redundancy
- Power capping
- DVFS
- Performance per watt
- Power usage effectiveness
- Energy per token

## 30. Thermal management

- Heat generation
- TDP
- Air cooling
- Liquid cooling
- Direct-to-chip cooling
- Immersion cooling
- Cold plates
- Rear-door heat exchangers
- Coolant loops
- Cooling distribution units
- Pumps
- Heat exchangers
- Chillers
- Cooling towers
- Rack inlet temperatures
- GPU / CPU temperatures
- Coolant temperature
- Flow rate
- Thermal throttling
- Water usage

### Power/thermal-aware operation

- Workload placement constrained by power
- Workload placement constrained by cooling
- Frequency adjustment
- Throttling
- Migration / rerouting under resource limits

## 31. Reliability and failure

- GPU failure
- CPU failure
- NIC failure
- Link failure
- Switch failure
- Disk failure
- Power-supply failure
- Cooling failure
- ECC errors
- Packet loss / retransmission
- Node failure
- Job failure
- Checkpoint recovery
- Failover
- Redundant power
- Redundant networking
- Redundant storage
- Fault domains

### Distinct health states

Health-capable components use the following conceptual states:

- Healthy
- Degraded
- Straggling / performance-impaired
- Silently corrupting data
- Failed

### Silent data corruption

- SDC
- Logic-level accelerator faults
- Incorrect computation without obvious device failure
- Detection / validation
- Relationship to ECC and hardware diagnostics

## 32. Monitoring and observability

- GPU utilization
- CPU utilization
- HBM / memory utilization
- NIC utilization
- Network bandwidth
- Latency
- Packet loss
- Congestion
- Storage throughput
- Storage latency
- Power
- Temperature
- Fan speed
- Errors
- Logs
- Metrics
- Traces
- Telemetry
- Alerts
- Profiling
- Network monitoring
- Cluster dashboards
- Straggler detection
- Fault localization

## 33. Performance and bottlenecks

- Latency
- Throughput
- Bandwidth
- Capacity
- Utilization
- Contention
- Congestion
- Queueing
- Parallelism
- Concurrency
- Scaling
- Strong scaling
- Weak scaling
- Efficiency
- Saturation
- Tail latency
- Locality
- Oversubscription
- Load imbalance

Potential scenarios:

- Compute bottleneck
- HBM bandwidth bottleneck
- HBM capacity bottleneck
- PCIe bottleneck
- Network bottleneck
- Storage bottleneck
- CPU preprocessing bottleneck
- Power limitation
- Thermal throttling
- Poor GPU utilization
- Straggler nodes

## 34. AI-specific performance measures

- Training time
- Step time
- Samples per second
- Tokens per second
- Model FLOPs utilization
- GPU utilization
- Scaling efficiency
- Communication overhead
- Time to first token
- Inter-token latency
- Requests per second
- Batch throughput
- Cost per token
- Energy per token

## 35. Security — intentionally limited scope

Security is intentionally limited to the following core topics:

- Physical security
- Network segmentation
- Firewalls
- Authentication
- Authorization
- Encryption in transit
- Encryption at rest
- Secure boot
- TPMs
- Secrets management
- Access control
- Multi-tenant isolation
- Firmware security

## 36. Cloud abstractions

Primarily to connect physical infrastructure to what users see in cloud environments:

- Instances
- GPU instances
- Bare-metal instances
- Virtual machines
- Regions
- Availability zones
- VPCs
- Subnets
- Security groups
- Elastic storage
- Object storage
- Managed Kubernetes
- Autoscaling groups
- Reservations
- Spot / preemptible capacity

## 37. Capacity and economics

These are primarily comparison/overlay metadata rather than a major physical branch:

- GPU count
- GPUs per server
- Servers per rack
- Racks per cluster
- Cluster size
- Peak compute
- Usable compute
- Memory capacity
- Network capacity
- Storage capacity
- Power capacity
- Cooling capacity
- CapEx
- OpEx
- Hardware utilization
- Cost per GPU-hour
- Cost per training run
- Cost per inference request
- Cost per token

## 38. Semiconductor and packaging concepts

This defines the deepest useful semiconductor and packaging scope for the core product:

- Semiconductor dies
- Transistors
- Process nodes
- Chiplets
- Packages
- Interposers
- Through-silicon vias
- HBM stacks
- Substrates
- Bumps
- Advanced packaging
- SerDes
- Silicon photonics
- Thermal interfaces

Detailed transistor-level logic is **outside the core project boundary**.

## 39. Scale-up versus scale-out

A major organizing distinction:

### Scale-up

- Multiple accelerators within a tightly coupled system
- NVLink
- NVSwitch
- UALink-type fabrics
- PCIe
- Coherent memory relationships
- Extremely high bandwidth
- Very low latency

### Scale-out

- Multiple servers / racks
- Ethernet
- Ultra Ethernet
- InfiniBand
- RDMA / RoCE
- Switch fabrics
- Distributed collectives
- Cluster topology

## 40. Data movement as a unifying theme

One of the strongest cross-cutting concepts in the entire project.

Example physical path:

**Storage → CPU memory → GPU memory → compute**

Example distributed path:

**GPU → local interconnect → NIC → cable → switch fabric → NIC → remote GPU**

Relevant concepts:

- Copying
- DMA
- RDMA
- Zero-copy
- Buffering
- Queues
- Packetization
- Serialization
- Bandwidth
- Latency
- Congestion
- Locality

## 41. Training-flow walkthrough

Representative systems-level conceptual flow:

**Dataset storage**  
→ data loader  
→ CPU memory  
→ GPU memory  
→ forward pass  
→ activations  
→ loss  
→ backward pass  
→ gradients  
→ distributed collective communication  
→ optimizer update  
→ updated model weights  
→ periodic checkpoint

## 42. Inference-flow walkthrough

**User request**  
→ frontend network  
→ load balancer / serving system  
→ tokenizer / scheduler  
→ prefill worker  
→ model weights  
→ KV-cache creation  
→ optional KV-cache transfer  
→ decode worker  
→ generated tokens  
→ network  
→ user

This may branch to illustrate:

- Continuous batching
- Disaggregated prefill/decode
- KV-cache offloading
- Prefix reuse
- Model replicas
- Request migration

## 43. Failure-flow walkthroughs

Rather than a separate encyclopedia of failures, failures should generally appear where they occur:

- GPU failure
- GPU SDC
- NIC failure
- Fiber disconnection
- Switch failure
- Storage outage
- PCIe degradation
- Server power loss
- Cooling failure
- Worker crash
- Congestion
- Straggler
- Checkpoint recovery

## 44. Comparative concepts

Representative comparison views:

- Single GPU vs. multi-GPU
- Workstation vs. AI server
- Server vs. rack
- Small cluster vs. supercluster
- Ethernet vs. InfiniBand
- TCP vs. RDMA
- Copper vs. fiber
- Static vs. reconfigurable topology
- Air vs. liquid cooling
- CPU DRAM vs. GPU HBM
- Local vs. pooled / disaggregated memory
- Local vs. distributed storage
- Training vs. inference
- Dense models vs. MoE
- Scale-up vs. scale-out

## 45. Cross-cutting systems concepts

These are cross-cutting systems concepts rather than necessarily standalone components; they should recur throughout the explorer:

- Abstraction
- Hierarchy
- Locality
- Topology
- Latency
- Bandwidth
- Throughput
- Capacity
- Parallelism
- Concurrency
- Synchronization
- Scheduling
- Contention
- Congestion
- Caching
- Buffering
- Queueing
- Sharding
- Replication
- Redundancy
- Fault tolerance
- Coherence
- Consistency
- Serialization
- Virtualization
- Disaggregation
- Scaling
- Efficiency
- Utilization

## Current conceptual backbone

The inventory organizes naturally around several overlapping ways of exploring the same physical system:

**Physical structure**  
Data center → cluster → rack → server → component → chip internals

**Networking**  
Accelerator → NIC → cable → switch fabric → remote accelerator

**Memory**  
Registers/cache → HBM → DRAM → pooled/disaggregated memory → storage

**Data movement**  
Where tensors, model state, datasets, KV caches, and checkpoints physically travel

**Distributed computation**  
Parallelism → collectives → topology → synchronization

**Training**  
Data → computation → communication → optimization → checkpointing

**Inference**  
Request → prefill → KV state → decode → response

**Power and heat**  
Electrical power → computation → heat → cooling

**Reliability**  
Healthy → degraded → corrupt → failed → detected/recovered

These threads, with the **physical hardware hierarchy as the spatial backbone**, represent the current conceptual scope of the project.
