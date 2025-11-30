import { EventEmitter } from 'events';

export interface TopologyNode {
  peerId: string;
  peerName: string;
  directlyConnected: boolean;
  hopCount: number; // Hops to reach this peer
  latency: number; // Average latency in ms
  bandwidth: number; // Available bandwidth in MB/s
  capabilities: string[];
  tools: string[];
  lastSeen: number;
}

export interface RoutingPath {
  destination: string;
  hops: string[]; // Peer IDs in order
  totalLatency: number;
  totalBandwidth: number;
  reliability: number; // 0-1 score based on historical success
}

export interface NetworkStats {
  totalNodes: number;
  directConnections: number;
  indirectConnections: number;
  averageHopCount: number;
  averageLatency: number;
  networkDiameter: number; // Maximum hops between any two nodes
  partitions: number; // Number of disconnected subgraphs
}

/**
 * NetworkTopology - Manages network topology, peer discovery, and intelligent routing
 * 
 * Features:
 * - Peer discovery and capability advertisement
 * - Dynamic topology updates
 * - Shortest path routing with Dijkstra's algorithm
 * - Network partition detection
 * - Multi-hop routing support
 */
export class NetworkTopology extends EventEmitter {
  private localPeerId: string;
  private nodes: Map<string, TopologyNode> = new Map();
  private edges: Map<string, Set<string>> = new Map(); // peerId -> connected peer IDs
  private routingTable: Map<string, RoutingPath> = new Map();
  private latencyHistory: Map<string, number[]> = new Map(); // peerId -> latency samples
  private readonly MAX_LATENCY_SAMPLES = 20;

  constructor(localPeerId: string) {
    super();
    this.localPeerId = localPeerId;
    
    // Add self as a node
    this.nodes.set(localPeerId, {
      peerId: localPeerId,
      peerName: 'local',
      directlyConnected: true,
      hopCount: 0,
      latency: 0,
      bandwidth: Infinity,
      capabilities: [],
      tools: [],
      lastSeen: Date.now()
    });
    
    this.edges.set(localPeerId, new Set());
  }

  /**
   * Discover peers on the network
   * Returns all known peers (both direct and indirect)
   */
  async discoverPeers(): Promise<TopologyNode[]> {
    // Recalculate routing table to update hop counts
    this.recalculateRoutes();
    
    return Array.from(this.nodes.values()).filter(
      node => node.peerId !== this.localPeerId
    );
  }

  /**
   * Add or update a peer in the topology
   */
  addPeer(peer: Omit<TopologyNode, 'hopCount' | 'lastSeen'>): void {
    const existingNode = this.nodes.get(peer.peerId);
    
    const node: TopologyNode = {
      ...peer,
      hopCount: peer.directlyConnected ? 1 : (existingNode?.hopCount ?? Infinity),
      lastSeen: Date.now()
    };
    
    this.nodes.set(peer.peerId, node);
    
    // If directly connected, add edge
    if (peer.directlyConnected) {
      this.addEdge(this.localPeerId, peer.peerId);
    }
    
    // Recalculate routes
    this.recalculateRoutes();
    
    this.emit('peer:added', node);
  }

  /**
   * Update topology when peer connects or disconnects
   */
  updateTopology(peerId: string, connected: boolean): void {
    if (connected) {
      const node = this.nodes.get(peerId);
      if (node) {
        node.directlyConnected = true;
        node.hopCount = 1;
        node.lastSeen = Date.now();
        this.addEdge(this.localPeerId, peerId);
      }
    } else {
      const node = this.nodes.get(peerId);
      if (node) {
        node.directlyConnected = false;
        this.removeEdge(this.localPeerId, peerId);
        
        // Check if peer is still reachable through other peers
        const route = this.findRoute(peerId);
        if (route) {
          node.hopCount = route.hops.length;
        } else {
          // Peer is unreachable, remove from topology
          this.nodes.delete(peerId);
          this.edges.delete(peerId);
        }
      }
    }
    
    this.recalculateRoutes();
    this.emit('topology:updated', { peerId, connected });
  }

  /**
   * Update latency for a peer
   */
  updateLatency(peerId: string, latency: number): void {
    const node = this.nodes.get(peerId);
    if (!node) return;
    
    // Store latency sample
    const history = this.latencyHistory.get(peerId) || [];
    history.push(latency);
    
    if (history.length > this.MAX_LATENCY_SAMPLES) {
      history.shift();
    }
    
    this.latencyHistory.set(peerId, history);
    
    // Calculate average latency
    const avgLatency = history.reduce((sum, val) => sum + val, 0) / history.length;
    node.latency = avgLatency;
    
    // Recalculate routes as latency affects path selection
    this.recalculateRoutes();
  }

  /**
   * Find best route to a destination peer using Dijkstra's algorithm
   */
  findRoute(destination: string): RoutingPath | null {
    // Check cache first
    const cached = this.routingTable.get(destination);
    if (cached) return cached;
    
    // Dijkstra's algorithm
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const unvisited = new Set<string>();
    
    // Initialize
    for (const peerId of this.nodes.keys()) {
      distances.set(peerId, Infinity);
      unvisited.add(peerId);
    }
    distances.set(this.localPeerId, 0);
    
    while (unvisited.size > 0) {
      // Find node with minimum distance
      let current: string | null = null;
      let minDistance = Infinity;
      
      for (const peerId of unvisited) {
        const distance = distances.get(peerId)!;
        if (distance < minDistance) {
          minDistance = distance;
          current = peerId;
        }
      }
      
      if (current === null || minDistance === Infinity) break;
      
      unvisited.delete(current);
      
      // If we reached the destination, we can stop
      if (current === destination) break;
      
      // Update distances to neighbors
      const neighbors = this.edges.get(current);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!unvisited.has(neighbor)) continue;
          
          const node = this.nodes.get(neighbor);
          if (!node) continue;
          
          // Cost is based on latency (lower is better)
          const cost = node.latency || 1;
          const alt = distances.get(current)! + cost;
          
          if (alt < distances.get(neighbor)!) {
            distances.set(neighbor, alt);
            previous.set(neighbor, current);
          }
        }
      }
    }
    
    // Reconstruct path
    if (!previous.has(destination)) {
      return null; // No path found
    }
    
    const hops: string[] = [];
    let current = destination;
    
    while (current !== this.localPeerId) {
      hops.unshift(current);
      const prev = previous.get(current);
      if (!prev) break;
      current = prev;
    }
    
    // Calculate path metrics
    let totalLatency = 0;
    let minBandwidth = Infinity;
    
    for (const hop of hops) {
      const node = this.nodes.get(hop);
      if (node) {
        totalLatency += node.latency;
        minBandwidth = Math.min(minBandwidth, node.bandwidth);
      }
    }
    
    const route: RoutingPath = {
      destination,
      hops,
      totalLatency,
      totalBandwidth: minBandwidth,
      reliability: this.calculateReliability(hops)
    };
    
    // Cache the route
    this.routingTable.set(destination, route);
    
    return route;
  }

  /**
   * Get all reachable peers
   */
  getReachablePeers(): TopologyNode[] {
    return Array.from(this.nodes.values()).filter(
      node => node.peerId !== this.localPeerId && node.hopCount < Infinity
    );
  }

  /**
   * Get network statistics
   */
  getNetworkStats(): NetworkStats {
    const nodes = Array.from(this.nodes.values()).filter(
      n => n.peerId !== this.localPeerId
    );
    
    const directConnections = nodes.filter(n => n.directlyConnected).length;
    const indirectConnections = nodes.filter(n => !n.directlyConnected && n.hopCount < Infinity).length;
    
    const hopCounts = nodes.filter(n => n.hopCount < Infinity).map(n => n.hopCount);
    const averageHopCount = hopCounts.length > 0
      ? hopCounts.reduce((sum, val) => sum + val, 0) / hopCounts.length
      : 0;
    
    const latencies = nodes.filter(n => n.latency > 0).map(n => n.latency);
    const averageLatency = latencies.length > 0
      ? latencies.reduce((sum, val) => sum + val, 0) / latencies.length
      : 0;
    
    const networkDiameter = hopCounts.length > 0 ? Math.max(...hopCounts) : 0;
    
    // Detect partitions using DFS
    const partitions = this.detectPartitions();
    
    return {
      totalNodes: nodes.length,
      directConnections,
      indirectConnections,
      averageHopCount,
      averageLatency,
      networkDiameter,
      partitions
    };
  }

  /**
   * Get topology graph for visualization
   */
  getTopologyGraph(): { nodes: TopologyNode[]; edges: Array<{ from: string; to: string }> } {
    const nodes = Array.from(this.nodes.values());
    const edges: Array<{ from: string; to: string }> = [];
    
    for (const [from, neighbors] of this.edges.entries()) {
      for (const to of neighbors) {
        edges.push({ from, to });
      }
    }
    
    return { nodes, edges };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private addEdge(from: string, to: string): void {
    if (!this.edges.has(from)) {
      this.edges.set(from, new Set());
    }
    this.edges.get(from)!.add(to);
    
    // Add reverse edge for undirected graph
    if (!this.edges.has(to)) {
      this.edges.set(to, new Set());
    }
    this.edges.get(to)!.add(from);
  }

  private removeEdge(from: string, to: string): void {
    this.edges.get(from)?.delete(to);
    this.edges.get(to)?.delete(from);
  }

  private recalculateRoutes(): void {
    // Clear routing table cache
    this.routingTable.clear();
    
    // Recalculate hop counts using BFS
    const visited = new Set<string>();
    const queue: Array<{ peerId: string; hopCount: number }> = [
      { peerId: this.localPeerId, hopCount: 0 }
    ];
    
    while (queue.length > 0) {
      const { peerId, hopCount } = queue.shift()!;
      
      if (visited.has(peerId)) continue;
      visited.add(peerId);
      
      const node = this.nodes.get(peerId);
      if (node) {
        node.hopCount = hopCount;
      }
      
      const neighbors = this.edges.get(peerId);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            queue.push({ peerId: neighbor, hopCount: hopCount + 1 });
          }
        }
      }
    }
    
    // Mark unreachable nodes
    for (const node of this.nodes.values()) {
      if (!visited.has(node.peerId) && node.peerId !== this.localPeerId) {
        node.hopCount = Infinity;
      }
    }
  }

  private calculateReliability(hops: string[]): number {
    // Reliability decreases with more hops
    // Base reliability is 0.99 per hop
    const baseReliability = 0.99;
    return Math.pow(baseReliability, hops.length);
  }

  private detectPartitions(): number {
    const visited = new Set<string>();
    let partitions = 0;
    
    for (const peerId of this.nodes.keys()) {
      if (!visited.has(peerId)) {
        partitions++;
        this.dfs(peerId, visited);
      }
    }
    
    return partitions;
  }

  private dfs(peerId: string, visited: Set<string>): void {
    visited.add(peerId);
    
    const neighbors = this.edges.get(peerId);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          this.dfs(neighbor, visited);
        }
      }
    }
  }
}
