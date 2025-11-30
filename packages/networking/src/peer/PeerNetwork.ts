import { EventEmitter } from 'events';
import { WebSocket, WebSocketServer } from 'ws';
import * as crypto from 'crypto';
import * as https from 'https';
import * as fs from 'fs';
import { NetworkTopology, TopologyNode, NetworkStats } from './NetworkTopology';
import { QoSManager, QoSMetrics } from './QoSManager';

// ... existing interfaces ...

export class PeerNetwork extends EventEmitter {
  private config: PeerNetworkConfig;
  private server?: WebSocketServer;
  private peers: Map<string, ConnectedPeer> = new Map();
  
  private heartbeatInterval?: NodeJS.Timeout;
  private reconnectAttempts: Map<string, number> = new Map();
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly HEARTBEAT_INTERVAL: number;
  private readonly HEARTBEAT_TIMEOUT = 60000; // 60 seconds
  private signingKey?: Buffer;
  
  // Network Management
  private topology: NetworkTopology;
  private qosManager: QoSManager;
  private qosMonitorInterval?: NodeJS.Timeout;

  constructor(config: PeerNetworkConfig) {
    super();
    this.config = {
      port: 8765,
      maxPeers: 50,
      enableTLS: false,
      enableMessageSigning: false,
      ...config
    };
    
    this.HEARTBEAT_INTERVAL = config.heartbeatInterval || 30000;
    
    // Initialize signing key if enabled
    if (this.config.enableMessageSigning && this.config.signingKey) {
      this.signingKey = Buffer.from(this.config.signingKey, 'utf-8');
    }
    
    // Initialize Network Management
    this.topology = new NetworkTopology(this.config.peerId);
    this.qosManager = new QoSManager();
    
    // Listen for topology events
    this.topology.on('peer:added', (node) => this.emit('topology:peer-added', node));
    this.topology.on('topology:updated', (data) => this.emit('topology:updated', data));
    
    // Listen for QoS violations
    this.qosManager.on('violation:latency', (data) => this.emit('qos:violation', { type: 'latency', ...data }));
    this.qosManager.on('violation:packet-loss', (data) => this.emit('qos:violation', { type: 'packet-loss', ...data }));
  }

  /**
   * Start the peer network server
   */
  async start(): Promise<void> {
    const wsOptions: any = {
      port: this.config.port
    };

    // Enable TLS if configured
    if (this.config.enableTLS && this.config.tlsKey && this.config.tlsCert) {
      const httpsServer = https.createServer({
        key: fs.readFileSync(this.config.tlsKey),
        cert: fs.readFileSync(this.config.tlsCert)
      });
      
      httpsServer.listen(this.config.port);
      wsOptions.server = httpsServer;
      delete wsOptions.port;
    }

    this.server = new WebSocketServer(wsOptions);

    this.server.on('connection', (ws: WebSocket, req) => {
      this.handleNewConnection(ws, req);
    });
    
    // ... rest of start method ...

    this.server.on('error', (error) => {
      this.emit('error', error);
    });

    // Start heartbeat monitoring
    this.startHeartbeat();
    
    // Start QoS monitoring
    this.startQoSMonitoring();

    this.emit('started', { port: this.config.port });
  }

  /**
   * Stop the peer network server
   */
  async stop(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.qosMonitorInterval) {
      clearInterval(this.qosMonitorInterval);
    }

    // Close all peer connections
    for (const [peerId, peer] of this.peers.entries()) {
      peer.ws.close();
      this.peers.delete(peerId);
    }

    // Close server
    if (this.server) {
      await new Promise<void>((resolve) => {
        this.server!.close(() => resolve());
      });
    }

    this.emit('stopped');
  }

  /**
   * Connect to a remote peer
   */
  async connectToPeer(host: string, port: number, token?: string): Promise<void> {
    const protocol = this.config.enableTLS ? 'wss' : 'ws';
    const url = `${protocol}://${host}:${port}`;
    const ws = new WebSocket(url, {
      rejectUnauthorized: this.config.enableTLS
    });

    return new Promise((resolve, reject) => {
      ws.on('open', () => {
        // Send handshake with JWT token if provided
        const handshakeData: any = {
          name: this.config.peerName,
          capabilities: [],
          tools: []
        };
        
        if (token || this.config.jwtSecret) {
          handshakeData.token = token || this.generateJWT();
        }
        
        this.sendMessage(ws, {
          type: 'handshake',
          from: this.config.peerId,
          data: handshakeData,
          timestamp: Date.now()
        });
        resolve();
      });

      ws.on('error', (error) => {
        reject(error);
      });

      ws.on('message', (data: any) => {
        this.handleMessage(ws, data);
      });

      ws.on('close', () => {
        // Find peer ID and handle disconnection
        for (const [peerId, peer] of this.peers.entries()) {
          if (peer.ws === ws) {
            this.handlePeerDisconnect(peerId);
            break;
          }
        }
      });
    });
  }

  /**
   * Broadcast a message to all connected peers
   */
  broadcast(message: Omit<PeerMessage, 'from' | 'timestamp'>): void {
    const fullMessage: PeerMessage = {
      ...message,
      from: this.config.peerId,
      timestamp: Date.now()
    };

    for (const peer of this.peers.values()) {
      if (peer.authenticated) {
        this.sendMessage(peer.ws, fullMessage);
      }
    }
  }

  /**
   * Send a tool execution request to a specific peer
   */
  async executeRemoteTool(peerId: string, toolName: string, args: any): Promise<any> {
    // Check routing first
    const route = this.topology.findRoute(peerId);
    if (!route) {
      throw new Error(`No route to peer ${peerId}`);
    }
    
    // For now, we only support direct connections or 1-hop
    // In a full implementation, we would forward the message through the hops
    const nextHop = route.hops[0];
    const peer = this.peers.get(nextHop);
    
    if (!peer) {
      throw new Error(`Next hop ${nextHop} not connected`);
    }

    const requestId = crypto.randomUUID();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Tool execution timeout'));
      }, 30000);

      // Listen for result
      const resultHandler = (message: PeerMessage) => {
        if (message.type === 'tool-result' && message.data.requestId === requestId) {
          clearTimeout(timeout);
          this.removeListener('message:tool-result', resultHandler);
          
          if (message.data.error) {
            reject(new Error(message.data.error));
          } else {
            resolve(message.data.result);
          }
        }
      };

      this.on('message:tool-result', resultHandler);

      // Send request
      this.sendMessage(peer.ws, {
        type: 'tool-call',
        from: this.config.peerId,
        to: peerId, // Destination might be different from next hop
        data: {
          requestId,
          toolName,
          args
        },
        timestamp: Date.now()
      });
    });
  }

  // ... existing broadcast implementation ...

  /**
   * Get list of connected peers
   */
  getConnectedPeers(): ConnectedPeer[] {
    return Array.from(this.peers.values());
  }
  
  /**
   * Get network topology statistics
   */
  getNetworkStats(): NetworkStats {
    return this.topology.getNetworkStats();
  }
  
  /**
   * Get QoS metrics for a peer
   */
  getQoSMetrics(peerId: string): QoSMetrics | undefined {
    return this.qosManager.getMetrics(peerId);
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private handleNewConnection(ws: WebSocket, req: any): void {
    // Check max peers limit
    if (this.peers.size >= this.config.maxPeers!) {
      ws.close(1008, 'Max peers limit reached');
      return;
    }

    let tempPeerId: string | null = null;

    ws.on('message', (data: any) => {
      const message = this.parseMessage(data);
      if (!message) return;

      // Handle handshake
      if (message.type === 'handshake') {
        tempPeerId = message.from;
        
        // Verify JWT token if authentication is enabled
        if (this.config.jwtSecret && message.data.token) {
          if (!this.verifyJWT(message.data.token)) {
            ws.close(1008, 'Authentication failed');
            return;
          }
        }

        const peer: ConnectedPeer = {
          id: message.from,
          name: message.data.name,
          ws,
          authenticated: true,
          lastHeartbeat: Date.now(),
          capabilities: message.data.capabilities || [],
          tools: message.data.tools || []
        };

        this.peers.set(message.from, peer);
        
        // Update topology
        this.topology.addPeer({
          peerId: peer.id,
          peerName: peer.name,
          directlyConnected: true,
          latency: 0,
          bandwidth: Infinity,
          capabilities: peer.capabilities,
          tools: peer.tools
        });
        
        this.emit('peer:connected', peer);

        // Send handshake response
        this.sendMessage(ws, {
          type: 'handshake',
          from: this.config.peerId,
          to: message.from,
          data: {
            name: this.config.peerName,
            accepted: true
          },
          timestamp: Date.now()
        });
      } else {
        this.handleMessage(ws, data);
      }
    });

    ws.on('close', () => {
      if (tempPeerId) {
        this.handlePeerDisconnect(tempPeerId);
      }
    });

    ws.on('error', (error) => {
      this.emit('error', { peerId: tempPeerId, error });
    });
  }

  private handleMessage(ws: WebSocket, data: any): void {
    const message = this.parseMessage(data);
    if (!message) return;

    const peer = this.peers.get(message.from);
    if (!peer) return;

    // Update last heartbeat
    peer.lastHeartbeat = Date.now();
    
    // Update QoS metrics (latency calculation)
    // In a real implementation, we'd use ping/pong timestamps
    // For now, we rely on the heartbeat mechanism

    switch (message.type) {
      case 'heartbeat':
        if (message.data.ping) {
          // Respond to ping
          this.sendMessage(ws, {
            type: 'heartbeat',
            from: this.config.peerId,
            to: message.from,
            data: { pong: true, clientTimestamp: message.timestamp },
            timestamp: Date.now()
          });
        } else if (message.data.pong && message.data.clientTimestamp) {
          // Calculate RTT
          const rtt = Date.now() - message.data.clientTimestamp;
          this.qosManager.recordLatency(message.from, rtt);
          this.topology.updateLatency(message.from, rtt);
        }
        break;

      case 'tool-call':
        this.emit('tool:remote-request', {
          peerId: message.from,
          requestId: message.data.requestId,
          toolName: message.data.toolName,
          args: message.data.args,
          respond: (result: any, error?: string) => {
            this.sendMessage(ws, {
              type: 'tool-result',
              from: this.config.peerId,
              to: message.from,
              data: {
                requestId: message.data.requestId,
                result,
                error
              },
              timestamp: Date.now()
            });
          }
        });
        break;

      case 'tool-result':
        this.emit('message:tool-result', message);
        break;

      case 'tool-broadcast':
        this.emit('tool:broadcast-received', message.data);
        break;

      default:
        this.emit('message', message);
    }
  }

  private handlePeerDisconnect(peerId: string): void {
    const peer = this.peers.get(peerId);
    if (peer) {
      this.peers.delete(peerId);
      
      // Update topology
      this.topology.updateTopology(peerId, false);
      
      this.emit('peer:disconnected', { peerId, peer });

      // Attempt reconnection if this was an outgoing connection
      // (implement reconnection logic here if needed)
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();

      for (const [peerId, peer] of this.peers.entries()) {
        // Check if peer is still alive
        if (now - peer.lastHeartbeat > this.HEARTBEAT_TIMEOUT) {
          peer.ws.close();
          this.handlePeerDisconnect(peerId);
          continue;
        }

        // Send heartbeat
        this.sendMessage(peer.ws, {
          type: 'heartbeat',
          from: this.config.peerId,
          to: peerId,
          data: { ping: true },
          timestamp: now
        });
      }
    }, this.HEARTBEAT_INTERVAL);
  }
  
  private startQoSMonitoring(): void {
    // Monitor QoS every 5 seconds
    this.qosMonitorInterval = setInterval(() => {
      // In a real implementation, we might actively probe for bandwidth
      // For now, we just rely on passive metrics collected during message exchange
    }, 5000);
  }

  private sendMessage(ws: WebSocket, message: PeerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      // Check QoS throttling
      if (message.to && this.qosManager.shouldThrottle(message.to, message.type, 1024)) {
        // In a real implementation, we would queue the message
        // For now, we just log a warning and send anyway (soft throttling)
        // console.warn(`Throttling message to ${message.to}`);
      }
      
      // Sign message if enabled
      if (this.config.enableMessageSigning && this.signingKey) {
        message.signature = this.signMessage(message);
      }
      
      ws.send(JSON.stringify(message));
      
      // Update bandwidth metrics (approximate)
      if (message.to) {
        // Estimate size
        const size = JSON.stringify(message).length;
        this.qosManager.updateMetrics(message.to, {
          // This is instantaneous, real implementation would use moving average
          bandwidth: size / 1024 / 1024 // MB
        });
      }
    }
  }

  private parseMessage(data: any): PeerMessage | null {
    try {
      const message = JSON.parse(data.toString()) as PeerMessage;
      
      // Verify signature if enabled
      if (this.config.enableMessageSigning && this.signingKey && message.signature) {
        if (!this.verifySignature(message)) {
          this.emit('error', { message: 'Invalid message signature', data });
          return null;
        }
      }
      
      return message;
    } catch (error) {
      this.emit('error', { message: 'Failed to parse message', error });
      return null;
    }
  }

  // ============================================================================
  // Security Methods
  // ============================================================================

  private generateJWT(): string {
    if (!this.config.jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({
      peerId: this.config.peerId,
      peerName: this.config.peerName,
      iat: Date.now(),
      exp: Date.now() + 3600000 // 1 hour
    })).toString('base64');

    const signature = crypto
      .createHmac('sha256', this.config.jwtSecret)
      .update(`${header}.${payload}`)
      .digest('base64');

    return `${header}.${payload}.${signature}`;
  }

  private verifyJWT(token: string): boolean {
    if (!this.config.jwtSecret) {
      return false;
    }

    try {
      const [header, payload, signature] = token.split('.');
      
      const expectedSignature = crypto
        .createHmac('sha256', this.config.jwtSecret)
        .update(`${header}.${payload}`)
        .digest('base64');

      if (signature !== expectedSignature) {
        return false;
      }

      const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());
      
      // Check expiration
      if (decodedPayload.exp && decodedPayload.exp < Date.now()) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private signMessage(message: PeerMessage): string {
    if (!this.signingKey) {
      throw new Error('Signing key not configured');
    }

    const messageData = JSON.stringify({
      type: message.type,
      from: message.from,
      to: message.to,
      data: message.data,
      timestamp: message.timestamp
    });

    return crypto
      .createHmac('sha256', this.signingKey)
      .update(messageData)
      .digest('hex');
  }

  private verifySignature(message: PeerMessage): boolean {
    if (!this.signingKey || !message.signature) {
      return false;
    }

    const expectedSignature = this.signMessage(message);
    return message.signature === expectedSignature;
  }
}

