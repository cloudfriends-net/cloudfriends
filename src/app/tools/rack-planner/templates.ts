import { RackTemplate, ComponentTemplate } from './types'

export const rackTemplates: RackTemplate[] = [
  {
    id: 'network-closet',
    name: 'Network Closet',
    description: '24-port switch with patch panel and UPS',
    category: 'network',
    rack: {
      name: 'Network Closet',
      height: 12,
      components: [
        { id: 'switch-1', type: 'switch', name: '24-Port Switch', model: 'Cisco C9200', rackUnits: 1, ports: 24, powerConsumption: 120, weight: 3, position: 10 },
        { id: 'patch-1', type: 'patch-panel', name: '24-Port Patch Panel', model: 'Cat6 Panel', rackUnits: 1, ports: 24, weight: 2, position: 9 },
        { id: 'ups-1', type: 'ups', name: 'UPS 1500VA', model: 'APC SMT1500', rackUnits: 2, powerConsumption: 50, weight: 20, position: 1 }
      ]
    }
  },
  {
    id: 'server-rack',
    name: 'Small Server Rack',
    description: 'Basic server setup with storage and networking',
    category: 'server',
    rack: {
      name: 'Server Rack',
      height: 42,
      components: [
        { id: 'server-1', type: 'server', name: 'Web Server', model: 'Dell R640', rackUnits: 1, serialNumber: 'WS001', powerConsumption: 250, weight: 15, position: 40 },
        { id: 'server-2', type: 'server', name: 'Database Server', model: 'Dell R640', rackUnits: 1, serialNumber: 'DB001', powerConsumption: 300, weight: 15, position: 39 },
        { id: 'storage-1', type: 'storage', name: 'SAN Storage', model: 'Dell MD3200', rackUnits: 3, powerConsumption: 400, weight: 30, position: 35 },
        { id: 'switch-1', type: 'switch', name: '48-Port Switch', model: 'Cisco C9300', rackUnits: 1, ports: 48, powerConsumption: 150, weight: 4, position: 32 },
        { id: 'ups-1', type: 'ups', name: 'UPS 3000VA', model: 'APC SMT3000', rackUnits: 2, powerConsumption: 100, weight: 35, position: 1 }
      ]
    }
  },
  {
    id: 'datacenter-row',
    name: 'Datacenter Row',
    description: 'High-density server deployment with redundancy',
    category: 'server',
    rack: {
      name: 'Datacenter Rack',
      height: 42,
      components: [
        { id: 'server-1', type: 'server', name: 'App Server 1', model: 'HPE DL380', rackUnits: 2, serialNumber: 'AS001', powerConsumption: 400, weight: 25, position: 40 },
        { id: 'server-2', type: 'server', name: 'App Server 2', model: 'HPE DL380', rackUnits: 2, serialNumber: 'AS002', powerConsumption: 400, weight: 25, position: 38 },
        { id: 'server-3', type: 'server', name: 'DB Server 1', model: 'HPE DL580', rackUnits: 4, serialNumber: 'DB001', powerConsumption: 800, weight: 50, position: 34 },
        { id: 'storage-1', type: 'storage', name: 'Primary Storage', model: 'NetApp FAS8200', rackUnits: 4, powerConsumption: 600, weight: 40, position: 30 },
        { id: 'switch-1', type: 'switch', name: 'ToR Switch 1', model: 'Arista 7050SX', rackUnits: 1, ports: 48, powerConsumption: 200, weight: 5, position: 26 },
        { id: 'switch-2', type: 'switch', name: 'ToR Switch 2', model: 'Arista 7050SX', rackUnits: 1, ports: 48, powerConsumption: 200, weight: 5, position: 25 },
        { id: 'firewall-1', type: 'firewall', name: 'Perimeter Firewall', model: 'Palo Alto PA-3200', rackUnits: 1, powerConsumption: 150, weight: 8, position: 23 },
        { id: 'pdu-1', type: 'pdu', name: 'PDU A', model: 'APC AP8953', rackUnits: 1, outlets: 24, powerConsumption: 0, weight: 3, position: 3 },
        { id: 'pdu-2', type: 'pdu', name: 'PDU B', model: 'APC AP8953', rackUnits: 1, outlets: 24, powerConsumption: 0, weight: 3, position: 2 }
      ]
    }
  }
]

export const componentTemplates: ComponentTemplate[] = [
  {
    id: 'cisco-switch-24',
    name: 'Cisco 24-Port Switch',
    category: 'Network',
    component: { type: 'switch', name: '24-Port Switch', model: 'Cisco C9200-24T', rackUnits: 1, ports: 24, powerConsumption: 120, weight: 3 }
  },
  {
    id: 'dell-server-1u',
    name: 'Dell 1U Server',
    category: 'Compute',
    component: { type: 'server', name: '1U Server', model: 'Dell R640', rackUnits: 1, powerConsumption: 250, weight: 15 }
  },
  {
    id: 'hp-server-2u',
    name: 'HP 2U Server',
    category: 'Compute',
    component: { type: 'server', name: '2U Server', model: 'HPE DL380', rackUnits: 2, powerConsumption: 400, weight: 25 }
  },
  {
    id: 'netapp-storage',
    name: 'NetApp Storage Array',
    category: 'Storage',
    component: { type: 'storage', name: 'Storage Array', model: 'NetApp FAS2750', rackUnits: 4, powerConsumption: 600, weight: 40 }
  },
  {
    id: 'apc-ups-1500',
    name: 'APC UPS 1500VA',
    category: 'Power',
    component: { type: 'ups', name: 'UPS 1500VA', model: 'APC SMT1500', rackUnits: 2, powerConsumption: 50, weight: 20 }
  }
]
