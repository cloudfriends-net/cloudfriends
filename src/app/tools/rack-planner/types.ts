export interface RackComponent {
  id: string
  type: 'switch' | 'patch-panel' | 'server' | 'ups' | 'storage' | 'router' | 'pdu' | 'kvm' | 'fiber-panel' | 'cooling' | 'blank-panel' | 'firewall' | 'load-balancer' | 'wireless-controller' | 'console-server'
  name: string
  model?: string
  serialNumber?: string
  ports?: number
  rackUnits: number // How many Us the component takes
  position?: number // Position in the rack (1-42)
  powerConsumption?: number // In watts
  weight?: number // In kg
  outlets?: number // Number of outlets (for PDUs)
  ipAddress?: string // IP address for network devices
  managementPort?: string // Management port info
  cooling?: number // BTU/hour for cooling units
}

export interface Rack {
  id: string
  name: string
  components: RackComponent[]
  height: number // Rack height in U
}

export interface RackTemplate {
  id: string
  name: string
  description: string
  rack: Omit<Rack, 'id'>
  category: 'network' | 'server' | 'storage' | 'mixed'
}

export interface ComponentTemplate {
  id: string
  name: string
  component: Omit<RackComponent, 'id'>
  category: string
}
