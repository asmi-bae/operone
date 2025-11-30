import { describe, it, expect, beforeEach } from 'vitest';
import { NetworkTopology, TopologyNode } from '../peer/NetworkTopology';

describe('NetworkTopology', () => {
  let topology: NetworkTopology;
  const localPeerId = 'local-peer';

  beforeEach(() => {
    topology = new NetworkTopology(localPeerId);
  });

  describe('Peer Management', () => {
    it('should initialize with local peer', async () => {
      const stats = topology.getNetworkStats();
      expect(stats.totalNodes).toBe(0); // Only remote nodes count
      
      const peers = await topology.discoverPeers();
      expect(peers).toHaveLength(0);
    });

    it('should add a peer correctly', async () => {
      const peer: Omit<TopologyNode, 'hopCount' | 'lastSeen'> = {
        peerId: 'peer-1',
        peerName: 'Peer 1',
        directlyConnected: true,
        latency: 50,
        bandwidth: 100,
        capabilities: ['test'],
        tools: ['tool1']
      };

      topology.addPeer(peer);
      
      const peers = await topology.discoverPeers();
      expect(peers).toHaveLength(1);
      expect(peers[0].peerId).toBe('peer-1');
      expect(peers[0].hopCount).toBe(1);
    });

    it('should update topology when peer connects/disconnects', () => {
      const peerId = 'peer-1';
      
      // Add peer first
      topology.addPeer({
        peerId,
        peerName: 'Peer 1',
        directlyConnected: false,
        latency: 50,
        bandwidth: 100,
        capabilities: [],
        tools: []
      });

      // Connect
      topology.updateTopology(peerId, true);
      let route = topology.findRoute(peerId);
      expect(route).toBeDefined();
      expect(route?.hops).toHaveLength(1);

      // Disconnect
      topology.updateTopology(peerId, false);
      route = topology.findRoute(peerId);
      expect(route).toBeNull();
    });
  });

  describe('Routing', () => {
    // Setup a simple network: Local -> Peer1 -> Peer2
    beforeEach(() => {
      // Add Peer 1 (Direct)
      topology.addPeer({
        peerId: 'peer-1',
        peerName: 'Peer 1',
        directlyConnected: true,
        latency: 10,
        bandwidth: 100,
        capabilities: [],
        tools: []
      });

      // Add Peer 2 (Indirect, connected via Peer 1)
      // Note: In a real scenario, we'd learn about Peer 2 from Peer 1
      // For this test, we manually construct the graph
      topology.addPeer({
        peerId: 'peer-2',
        peerName: 'Peer 2',
        directlyConnected: false,
        latency: 20, // Latency from Peer 1 to Peer 2
        bandwidth: 100,
        capabilities: [],
        tools: []
      });
      
      // Manually add edge for testing since addPeer only adds edge from local
      // @ts-ignore - accessing private property for test setup
      topology.addEdge('peer-1', 'peer-2');
      // @ts-ignore
      topology.recalculateRoutes();
    });

    it('should find direct route', () => {
      const route = topology.findRoute('peer-1');
      expect(route).toBeDefined();
      expect(route?.hops).toEqual(['peer-1']);
      expect(route?.totalLatency).toBe(10);
    });

    it('should find multi-hop route', () => {
      const route = topology.findRoute('peer-2');
      expect(route).toBeDefined();
      expect(route?.hops).toEqual(['peer-1', 'peer-2']);
      // Total latency = Local->Peer1 (10) + Peer1->Peer2 (20)
      expect(route?.totalLatency).toBe(30);
    });

    it('should prefer lower latency path', () => {
      // Add Peer 3 (Direct but high latency)
      topology.addPeer({
        peerId: 'peer-3',
        peerName: 'Peer 3',
        directlyConnected: true,
        latency: 100,
        bandwidth: 100,
        capabilities: [],
        tools: []
      });

      // Connect Peer 3 to Peer 2
      // @ts-ignore
      topology.addEdge('peer-3', 'peer-2');
      // @ts-ignore
      topology.recalculateRoutes();

      // Should still prefer path via Peer 1 (10+20=30) over Peer 3 (100+20=120)
      const route = topology.findRoute('peer-2');
      expect(route?.hops).toEqual(['peer-1', 'peer-2']);
    });
  });

  describe('Network Stats', () => {
    it('should calculate stats correctly', () => {
      topology.addPeer({
        peerId: 'peer-1',
        peerName: 'Peer 1',
        directlyConnected: true,
        latency: 10,
        bandwidth: 100,
        capabilities: [],
        tools: []
      });

      const stats = topology.getNetworkStats();
      expect(stats.totalNodes).toBe(1);
      expect(stats.directConnections).toBe(1);
      expect(stats.averageLatency).toBe(10);
    });
  });
});
