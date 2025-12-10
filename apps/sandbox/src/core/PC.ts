import { FileSystem } from './FileSystem';
import { MockMCPServer } from './MockMCP';

export class PC {
  id: string;
  hostname: string;
  ip: string;
  fs: FileSystem;
  mcpServer: MockMCPServer;
  status: 'online' | 'offline' | 'booting';
  logs: string[] = [];

  services: Map<string, { port: number, type: string, status: 'running' | 'stopped' }> = new Map();

  constructor(id: string, hostname: string, ip: string) {
    this.id = id;
    this.hostname = hostname;
    this.ip = ip;
    this.status = 'online';
    
    this.fs = new FileSystem();
    this.mcpServer = new MockMCPServer('system-server');
    
    // Add default tools
    this.addDefaultTools();

    // Start default services
    this.startService('file-server', 21);

    this.log(`System initialized. IP: ${ip}`);
  }

  startService(type: string, port: number) {
    this.services.set(type, { port, type, status: 'running' });
    this.log(`Service started: ${type} on port ${port}`);
  }

  stopService(type: string) {
    const service = this.services.get(type);
    if (service) {
      service.status = 'stopped';
      this.log(`Service stopped: ${type}`);
    }
  }

  // Simulate receiving a packet/request
  async handleRequest(port: number, payload: any): Promise<{ status: number, data?: any, error?: string }> {
    // Find service listening on this port
    const service = Array.from(this.services.values()).find(s => s.port === port && s.status === 'running');
    
    if (!service) {
      return { status: 404, error: 'Connection refused: No service on port ' + port };
    }

    // Handle based on service type
    if (service.type === 'file-server') {
        return this.handleFileServerRequest(payload);
    }

    return { status: 501, error: 'Service type not implemented' };
  }

  private handleFileServerRequest(payload: any) {
      if (payload.action === 'read') {
          const content = this.fs.readFile(payload.path);
          if (content !== null) {
              return { status: 200, data: content };
          } else {
              return { status: 404, error: 'File not found' };
          }
      }
      if (payload.action === 'write') {
          this.fs.writeFile(payload.path, payload.content);
          return { status: 200, data: 'File written' };
      }
      return { status: 400, error: 'Invalid action' };
  }

  private addDefaultTools() {
    this.mcpServer.registerTool({
      name: 'echo',
      description: 'Echo back the input',
      schema: { type: 'object', properties: { message: { type: 'string' } } },
      execute: async ({ message }) => `ECHO: ${message}`
    });
    
    this.mcpServer.registerTool({
      name: 'read_file',
      description: 'Read a file from the simulated FS',
      schema: { type: 'object', properties: { path: { type: 'string' } } },
      execute: async ({ path }) => {
        const content = this.fs.readFile(path);
        return content || `Error: File ${path} not found`;
      }
    });

    this.mcpServer.registerTool({
      name: 'list_files',
      description: 'List files in directory',
      schema: { type: 'object', properties: { path: { type: 'string' } } },
      execute: async ({ path }) => {
         return this.fs.ls(path).join('\n');
      }
    });
  }

  log(message: string) {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
  }

  async executeCommand(command: string): Promise<string> {
    this.log(`Command received: ${command}`);
    
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    try {
      switch (cmd) {
        // File System Commands
        case 'ls':
          return this.cmdLs(args);
        case 'cat':
          return this.cmdCat(args);
        case 'echo':
          return args.join(' ');
        case 'touch':
          return this.cmdTouch(args);
        case 'rm':
          return this.cmdRm(args);
        case 'mkdir':
          return this.cmdMkdir(args);
        case 'pwd':
          return '/home';

        // Network Commands
        case 'ping':
          return this.cmdPing(args);
        case 'ifconfig':
          return this.cmdIfconfig();
        case 'netstat':
          return this.cmdNetstat();

        // System Commands
        case 'hostname':
          return this.hostname;
        case 'whoami':
          return 'user';
        case 'uptime':
          return this.cmdUptime();
        case 'ps':
          return this.cmdPs();
        case 'status':
          return `Host: ${this.hostname}\nIP: ${this.ip}\nStatus: ${this.status}`;

        // Service Commands
        case 'service':
          return this.cmdService(args);
        
        // Help
        case 'help':
          return this.cmdHelp();
        
        case 'clear':
          return '\n'.repeat(50); // Simulate clear

        default:
          return `Command not found: ${cmd}\nType 'help' for available commands`;
      }
    } catch (error: any) {
      return `Error: ${error.message}`;
    }
  }

  private cmdLs(args: string[]): string {
    const path = args[0] || '/';
    const files = this.fs.ls(path);
    return files.length > 0 ? files.join('\n') : 'No files found';
  }

  private cmdCat(args: string[]): string {
    if (args.length === 0) return 'Usage: cat <filename>';
    const content = this.fs.readFile(args[0]);
    return content !== null ? content : `cat: ${args[0]}: No such file`;
  }

  private cmdTouch(args: string[]): string {
    if (args.length === 0) return 'Usage: touch <filename>';
    this.fs.writeFile(args[0], '');
    return '';
  }

  private cmdRm(args: string[]): string {
    if (args.length === 0) return 'Usage: rm <filename>';
    const deleted = this.fs.deleteFile(args[0]);
    return deleted ? '' : `rm: cannot remove '${args[0]}': No such file`;
  }

  private cmdMkdir(args: string[]): string {
    if (args.length === 0) return 'Usage: mkdir <dirname>';
    // Simplified - just create a marker file
    this.fs.writeFile(`${args[0]}/.dir`, '');
    return '';
  }

  private cmdPing(args: string[]): string {
    if (args.length === 0) return 'Usage: ping <hostname|ip>';
    const target = args[0];
    // Simulate ping
    return `PING ${target}\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.5 ms\n64 bytes from ${target}: icmp_seq=2 ttl=64 time=0.4 ms\n64 bytes from ${target}: icmp_seq=3 ttl=64 time=0.6 ms\n--- ${target} ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss`;
  }

  private cmdIfconfig(): string {
    return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet ${this.ip}  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 02:42:ac:11:00:02  txqueuelen 0  (Ethernet)
        RX packets 1234  bytes 567890 (567.8 KB)
        TX packets 987  bytes 123456 (123.4 KB)`;
  }

  private cmdNetstat(): string {
    const serviceList = Array.from(this.services.entries())
      .map(([name, svc]) => `tcp        0      0 ${this.ip}:${svc.port}           0.0.0.0:*               LISTEN      ${name}`)
      .join('\n');
    
    return `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program
${serviceList || 'No active connections'}`;
  }

  private cmdUptime(): string {
    return `up 2 days, 3:45, 1 user, load average: 0.15, 0.20, 0.18`;
  }

  private cmdPs(): string {
    const services = Array.from(this.services.entries())
      .map(([name, svc], i) => `${1000 + i}  pts/0    00:00:0${i} ${name}`)
      .join('\n');
    
    return `  PID TTY          TIME CMD
  1    ?        00:00:01 init
  100  ?        00:00:00 sshd
${services}`;
  }

  private cmdService(args: string[]): string {
    if (args.length < 2) return 'Usage: service <name> <start|stop|status>';
    
    const [serviceName, action] = args;
    
    switch (action) {
      case 'start':
        if (serviceName === 'file-server') {
          this.startService('file-server', 21);
          return `Starting file-server service... [OK]`;
        }
        return `Service ${serviceName} not found`;
      
      case 'stop':
        this.stopService(serviceName);
        return `Stopping ${serviceName} service... [OK]`;
      
      case 'status':
        const svc = this.services.get(serviceName);
        if (svc) {
          return `${serviceName} is ${svc.status} on port ${svc.port}`;
        }
        return `${serviceName} is not running`;
      
      default:
        return `Unknown action: ${action}`;
    }
  }

  private cmdHelp(): string {
    return `Available commands:

File System:
  ls [path]          - List files
  cat <file>         - Display file contents
  touch <file>       - Create empty file
  rm <file>          - Remove file
  mkdir <dir>        - Create directory
  pwd                - Print working directory

Network:
  ping <host>        - Ping a host
  ifconfig           - Show network configuration
  netstat            - Show network connections

System:
  hostname           - Show hostname
  whoami             - Show current user
  uptime             - Show system uptime
  ps                 - Show running processes
  status             - Show PC status

Services:
  service <name> <start|stop|status> - Manage services

Other:
  echo <text>        - Print text
  help               - Show this help
  clear              - Clear screen`;
  }
}
