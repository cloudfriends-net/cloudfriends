'use client'

import { useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { parseStringPromise } from 'xml2js'
import LightThemeLayout from '../../components/LightThemeLayout'
import { Trash2, Edit2, Save, Download, Upload, PlusCircle, FileText, Package, Image, Grid } from 'react-feather'

interface Rack {
  id: string
  name: string
  components: RackComponent[]
  height: number // Rack height in U
}

interface RackTemplate {
  id: string
  name: string
  description: string
  rack: Omit<Rack, 'id'>
  category: 'network' | 'server' | 'storage' | 'mixed'
}

interface ComponentTemplate {
  id: string
  name: string
  component: Omit<RackComponent, 'id'>
  category: string
}

interface RackComponent {
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

const componentColors = {
  'switch': 'bg-green-200 border-green-500 text-green-800',
  'patch-panel': 'bg-yellow-200 border-yellow-500 text-yellow-800',
  'server': 'bg-red-200 border-red-500 text-red-800',
  'ups': 'bg-purple-200 border-purple-500 text-purple-800',
  'storage': 'bg-blue-200 border-blue-500 text-blue-800',
  'router': 'bg-orange-200 border-orange-500 text-orange-800',
  'pdu': 'bg-gray-300 border-gray-800 text-gray-900',
  'kvm': 'bg-teal-200 border-teal-500 text-teal-800',
  'fiber-panel': 'bg-indigo-200 border-indigo-500 text-indigo-800',
  'cooling': 'bg-cyan-200 border-cyan-500 text-cyan-800',
  'blank-panel': 'bg-slate-200 border-slate-500 text-slate-800',
  'firewall': 'bg-rose-200 border-rose-500 text-rose-800',
  'load-balancer': 'bg-emerald-200 border-emerald-500 text-emerald-800',
  'wireless-controller': 'bg-violet-200 border-violet-500 text-violet-800',
  'console-server': 'bg-amber-200 border-amber-500 text-amber-800',
};

const componentIcons = {
  'switch': '📶',
  'patch-panel': '🔌',
  'server': '🖥️',
  'ups': '🔋',
  'storage': '💾',
  'router': '🌐',
  'pdu': '⚡',
  'kvm': '🖱️',
  'fiber-panel': '📡',
  'cooling': '❄️',
  'blank-panel': '⬜',
  'firewall': '🛡️',
  'load-balancer': '⚖️',
  'wireless-controller': '📶',
  'console-server': '💻',
};

// Predefined rack templates
const rackTemplates: RackTemplate[] = [
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
];

// Component templates
const componentTemplates: ComponentTemplate[] = [
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
];

const RackPosition = ({ 
  position, 
  rack, 
  updateComponentPosition 
}: { 
  position: number
  rack: Rack
  updateComponentPosition: (componentId: string, position: number) => void
}) => {
  const [{ isOver, canDrop }, drop] = useDrop<
    { id: string; component: RackComponent }, 
    void, 
    { isOver: boolean; canDrop: boolean }
  >(() => ({
    accept: 'COMPONENT',
    drop: (item: { id: string, component: RackComponent }) => {
      // Check if there's enough space for the component
      const componentHeight = item.component.rackUnits || 1;
      if (position + componentHeight - 1 <= rack.height) {
        updateComponentPosition(item.id, position);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
    // Prevent dropping if there's not enough space or if a component is already in this position
    canDrop: (item: { component: RackComponent }) => {
      const componentHeight = item.component.rackUnits || 1;
      if (position + componentHeight - 1 > rack.height) return false;
      
      // Check if space is already occupied
      for (let j = 0; j < componentHeight; j++) {
        const checkPos = position + j;
        const occupied = rack.components.some(c => {
          if (!c.position) return false;
          return c.position <= checkPos && c.position + (c.rackUnits - 1) >= checkPos;
        });
        if (occupied) return false;
      }
      return true;
    }
  }));
  
  // Calculate different visual states
  let bgClass = '';
  if (isOver && canDrop) {
    bgClass = 'bg-green-100';
  } else if (isOver && !canDrop) {
    bgClass = 'bg-red-100';
  } else if (canDrop) {
    bgClass = 'hover:bg-blue-50';
  }
  
  return (
    <div
      key={`pos-${position}`}
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`h-5 border-t border-gray-200 w-full ${bgClass}`}
      style={{ gridRow: rack.height - position + 1 }}
    />
  );
};

const DraggableComponent = ({
  component,
  onUpdate,
  onDelete,
  inRack = false,
}: {
  component: RackComponent
  onUpdate: (id: string, updatedComponent: Partial<RackComponent>) => void
  onDelete?: (id: string) => void
  inRack?: boolean
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id, component },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const componentClass = componentColors[component.type] || 'bg-gray-100 border-gray-300';

  // If component is in rack visualization, render a simplified version
  if (inRack) {
    return (
      <div
        ref={drag as unknown as React.Ref<HTMLDivElement>}
        className={`${componentClass} p-1 border-2 rounded-md flex items-center relative ${
          isDragging ? 'opacity-50' : ''
        } shadow-md transition-all duration-200 hover:shadow-lg`}
        style={{
          height: `${component.rackUnits * 20}px`,
          cursor: 'move'
        }}
      >
        <span className="font-bold text-sm">{componentIcons[component.type]} {component.name}</span>
        <span className="text-xs ml-auto">{component.rackUnits}U</span>
      </div>
    )
  }

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`${componentClass} p-3 rounded-lg border-2 flex flex-col gap-2 ${
        isDragging ? 'opacity-50' : ''
      } shadow-md hover:shadow-lg transition-all duration-200`}
    >
      <div className="flex items-center mb-1 justify-between">
        <div className="flex items-center">
          <span className="text-xl mr-2">{componentIcons[component.type]}</span>
          <input
            type="text"
            value={component.name}
            onChange={(e) => onUpdate(component.id, { name: e.target.value })}
            placeholder="Name"
            className="bg-white border border-gray-300 rounded px-2 py-1 text-sm flex-grow"
          />
        </div>
        {onDelete && (
          <button 
            onClick={() => onDelete(component.id)}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
            title="Delete component"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={component.model || ''}
          onChange={(e) => onUpdate(component.id, { model: e.target.value })}
          placeholder="Model"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <input
          type="number"
          value={component.rackUnits || 1}
          onChange={(e) => onUpdate(component.id, { rackUnits: parseInt(e.target.value) || 1 })}
          placeholder="Size (U)"
          min="1"
          max="42"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
      
      {component.type === 'server' && (
        <input
          type="text"
          value={component.serialNumber || ''}
          onChange={(e) => onUpdate(component.id, { serialNumber: e.target.value })}
          placeholder="Serial Number"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
      )}
      
      {(component.type === 'switch' || component.type === 'patch-panel' || component.type === 'router' || component.type === 'fiber-panel' || component.type === 'kvm') && (
        <input
          type="number"
          value={component.ports || ''}
          onChange={(e) => onUpdate(component.id, { ports: Number(e.target.value) })}
          placeholder="Ports"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
      )}
      
      {(component.type === 'switch' || component.type === 'router' || component.type === 'firewall' || component.type === 'load-balancer' || component.type === 'wireless-controller' || component.type === 'console-server') && (
        <input
          type="text"
          value={component.ipAddress || ''}
          onChange={(e) => onUpdate(component.id, { ipAddress: e.target.value })}
          placeholder="IP Address"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
      )}
      
      {component.type === 'cooling' && (
        <input
          type="number"
          value={component.cooling || ''}
          onChange={(e) => onUpdate(component.id, { cooling: Number(e.target.value) })}
          placeholder="BTU/hour"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          value={component.powerConsumption || ''}
          onChange={(e) => onUpdate(component.id, { powerConsumption: Number(e.target.value) })}
          placeholder="Power (W)"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
        <input
          type="number"
          value={component.weight || ''}
          onChange={(e) => onUpdate(component.id, { weight: Number(e.target.value) })}
          placeholder="Weight (kg)"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
      
      {component.type === 'pdu' && (
        <input
          type="number"
          value={component.outlets || ''}
          onChange={(e) => onUpdate(component.id, { outlets: Number(e.target.value) })}
          placeholder="Outlets"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
      )}
      
      <span className="text-sm text-gray-500">Type: {component.type}</span>
    </div>
  )
}

const RackVisualizer = ({
  rack,
  updateComponentPosition,
  onRemoveComponent,
}: {
  rack: Rack
  updateComponentPosition: (componentId: string, position: number) => void
  onRemoveComponent: (componentId: string) => void
}) => {
  // Create array of positions (1 to rack.height)
  const positions = Array.from({ length: rack.height }, (_, i) => i + 1);
  
  // Calculate rack height in pixels (20px per U + 24px for the header)
  const rackHeightPx = rack.height * 20 + 24;
  
  // Calculate rack statistics
  const totalPower = rack.components
    .filter(c => c.position !== undefined && c.powerConsumption !== undefined)
    .reduce((sum, c) => sum + (c.powerConsumption || 0), 0);
    
  const totalWeight = rack.components
    .filter(c => c.position !== undefined && c.weight !== undefined)
    .reduce((sum, c) => sum + (c.weight || 0), 0);
    
  const usedSpace = rack.components
    .filter(c => c.position !== undefined)
    .reduce((sum, c) => sum + (c.rackUnits || 1), 0);
    
  const spacePercentage = Math.round((usedSpace / rack.height) * 100);

  // Render the positioned components
  const placedComponents = rack.components
    .filter(component => component.position !== undefined)
    .map(component => {
      const position = component.position || 1;
      const height = component.rackUnits || 1;
      
      return (
        <div
          key={component.id}
          className="absolute left-8 right-2 group"
          style={{
            top: `${(rack.height - position - height + 1) * 20 + 24}px`,
            height: `${height * 20}px`,
          }}
        >
          <DraggableComponent 
            component={component} 
            onUpdate={() => {}} 
            inRack={true} 
          />
          <button 
            onClick={() => onRemoveComponent(component.id)}
            className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-0.5 shadow-sm"
            title="Remove from rack"
          >
            <Trash2 size={12} />
          </button>
        </div>
      );
    });

  return (
    <div className="flex flex-col items-center">
      {/* Rack statistics */}
      <div className="w-full mb-4 grid grid-cols-3 gap-3 text-center">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">Power</p>
          <p className="font-bold text-blue-900">{totalPower} W</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">Weight</p>
          <p className="font-bold text-blue-900">{totalWeight} kg</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-700">Space Used</p>
          <p className="font-bold text-blue-900">{usedSpace}U / {rack.height}U</p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full ${spacePercentage > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${spacePercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Rack visualization with dynamic height */}
      <div 
        className="rack-container border-2 border-gray-400 bg-gray-100 w-[300px] relative rounded-md shadow-lg"
        style={{ height: `${rackHeightPx}px` }}
      >
        {/* Rack title */}
        <div className="absolute top-0 left-0 right-0 bg-gray-800 text-white text-center py-1 text-sm z-10">
          {rack.name} - {rack.height}U
        </div>
        
        {/* U markers (1 to rack.height) */}
        {[...Array(rack.height)].map((_, i) => (
          <div 
            key={i} 
            className="u-marker text-xs font-mono text-gray-500 absolute left-1 flex items-center justify-center w-6 h-5" 
            style={{ top: `${(rack.height - i - 1) * 20 + 24}px` }}
          >
            {i + 1}
          </div>
        ))}
        
        {/* Left rack rail */}
        <div className="absolute left-7 top-6 bottom-0 w-1 bg-gray-400"></div>
        
        {/* Right rack rail */}
        <div className="absolute right-0 top-6 bottom-0 w-1 bg-gray-400"></div>
        
        {/* Grid for drop targets */}
        <div 
          className="grid grid-cols-1 w-full pt-6" 
          style={{ 
            gridTemplateRows: `repeat(${rack.height}, 20px)`,
            height: `${rackHeightPx}px`
          }}
        >
          {positions.map(pos => (
            <RackPosition 
              key={pos}
              position={pos} 
              rack={rack}
              updateComponentPosition={updateComponentPosition}
            />
          ))}
        </div>
        
        {/* Render positioned components */}
        {placedComponents}
      </div>
    </div>
  );
};

export default function RackPlanner() {
  const [racks, setRacks] = useState<Rack[]>([])
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'components' | 'visualization' | 'templates'>('components')
  const [isEditingRack, setIsEditingRack] = useState<string | null>(null)
  const [editRackName, setEditRackName] = useState('')
  const [editRackHeight, setEditRackHeight] = useState(42)
  const [showTemplates, setShowTemplates] = useState(false)

  const addRack = () => {
    const newRack: Rack = {
      id: `rack-${Date.now()}`,
      name: `Rack ${racks.length + 1}`,
      components: [],
      height: 42, // Standard 42U rack
    }
    setRacks([...racks, newRack])
    setSelectedRackId(newRack.id)
  }

  const deleteRack = (rackId: string) => {
    setRacks(prevRacks => prevRacks.filter(rack => rack.id !== rackId))
    if (selectedRackId === rackId) {
      setSelectedRackId(racks.length > 1 ? racks.find(r => r.id !== rackId)?.id || null : null)
    }
  }

  const startEditingRack = (rack: Rack) => {
    setIsEditingRack(rack.id)
    setEditRackName(rack.name)
    setEditRackHeight(rack.height)
  }

  const saveRackEdit = () => {
    setRacks(prevRacks => 
      prevRacks.map(rack => 
        rack.id === isEditingRack 
          ? { ...rack, name: editRackName, height: editRackHeight } 
          : rack
      )
    )
    setIsEditingRack(null)
  }

  const addComponentToRack = (rackId: string, componentType: RackComponent['type']) => {
    // Set default U size based on component type
    const defaultSize = {
      'server': 1,
      'switch': 1,
      'patch-panel': 1,
      'ups': 2,
      'storage': 3,
      'router': 1,
      'pdu': 1,
      'kvm': 1,
      'fiber-panel': 1,
      'cooling': 2,
      'blank-panel': 1,
      'firewall': 1,
      'load-balancer': 1,
      'wireless-controller': 1,
      'console-server': 1,
    };

    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === rackId
          ? {
              ...rack,
              components: [
                ...rack.components,
                {
                  id: `component-${Date.now()}`,
                  type: componentType,
                  name: '',
                  rackUnits: defaultSize[componentType],
                },
              ],
            }
          : rack
      )
    )
  }

  const updateComponent = (rackId: string, componentId: string, updatedComponent: Partial<RackComponent>) => {
    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === rackId
          ? {
              ...rack,
              components: rack.components.map((component) =>
                component.id === componentId ? { ...component, ...updatedComponent } : component
              ),
            }
          : rack
      )
    )
  }

  const deleteComponent = (rackId: string, componentId: string) => {
    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === rackId
          ? {
              ...rack,
              components: rack.components.filter(component => component.id !== componentId),
            }
          : rack
      )
    )
  }

  const updateComponentPosition = (rackId: string, componentId: string, position: number) => {
    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === rackId
          ? {
              ...rack,
              components: rack.components.map((component) =>
                component.id === componentId ? { ...component, position } : component
              ),
            }
          : rack
      )
    )
  }

  const removeComponentFromRack = (rackId: string, componentId: string) => {
    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === rackId
          ? {
              ...rack,
              components: rack.components.map((component) =>
                component.id === componentId ? { ...component, position: undefined } : component
              ),
            }
          : rack
      )
    )
  }

  const saveProject = () => {
    const xmlData = `<RackPlanner>${racks
      .map(
        (rack) =>
          `<Rack id="${rack.id}" name="${rack.name}" height="${rack.height}">${rack.components
            .map(
              (component) =>
                `<Component id="${component.id}" type="${component.type}" name="${component.name || ''}" 
                model="${component.model || ''}" serialNumber="${component.serialNumber || ''}" 
                ports="${component.ports || ''}" rackUnits="${component.rackUnits || 1}" 
                position="${component.position || ''}" powerConsumption="${component.powerConsumption || ''}" 
                weight="${component.weight || ''}" outlets="${component.outlets || ''}" 
                ipAddress="${component.ipAddress || ''}" managementPort="${component.managementPort || ''}" 
                cooling="${component.cooling || ''}" />`
            )
            .join('')}</Rack>`
      )
      .join('')}</RackPlanner>`

    const blob = new Blob([xmlData], { type: 'application/xml' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'rack-planner-project.xml'
    link.click()
  }

  const exportAsPDF = () => {
    if (!selectedRack) return;
    
    const rackData = {
      name: selectedRack.name,
      height: selectedRack.height,
      components: selectedRack.components.filter(c => c.position !== undefined),
      totalPower: selectedRack.components
        .filter(c => c.position !== undefined && c.powerConsumption !== undefined)
        .reduce((sum, c) => sum + (c.powerConsumption || 0), 0),
      totalWeight: selectedRack.components
        .filter(c => c.position !== undefined && c.weight !== undefined)
        .reduce((sum, c) => sum + (c.weight || 0), 0),
      usedSpace: selectedRack.components
        .filter(c => c.position !== undefined)
        .reduce((sum, c) => sum + (c.rackUnits || 1), 0)
    };

    // Create HTML content for PDF generation
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Rack Planner Report - ${rackData.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .component-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .component-table th, .component-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .component-table th { background-color: #f5f5f5; }
        .rack-diagram { margin: 20px 0; text-align: center; }
        .position { font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rack Planner Report</h1>
        <h2>${rackData.name}</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Rack Specifications</h3>
            <p><strong>Height:</strong> ${rackData.height}U</p>
            <p><strong>Components:</strong> ${rackData.components.length}</p>
            <p><strong>Space Used:</strong> ${rackData.usedSpace}U / ${rackData.height}U</p>
            <p><strong>Utilization:</strong> ${Math.round((rackData.usedSpace / rackData.height) * 100)}%</p>
        </div>
        <div class="summary-card">
            <h3>Power Analysis</h3>
            <p><strong>Total Power:</strong> ${rackData.totalPower}W</p>
            <p><strong>Avg per U:</strong> ${rackData.usedSpace > 0 ? Math.round(rackData.totalPower / rackData.usedSpace) : 0}W/U</p>
        </div>
        <div class="summary-card">
            <h3>Weight Analysis</h3>
            <p><strong>Total Weight:</strong> ${rackData.totalWeight}kg</p>
            <p><strong>Avg per U:</strong> ${rackData.usedSpace > 0 ? Math.round(rackData.totalWeight / rackData.usedSpace) : 0}kg/U</p>
        </div>
    </div>
    
    <h3>Component Inventory</h3>
    <table class="component-table">
        <thead>
            <tr>
                <th>Position</th>
                <th>Component Name</th>
                <th>Type</th>
                <th>Model</th>
                <th>Size (U)</th>
                <th>Power (W)</th>
                <th>Weight (kg)</th>
                <th>Additional Info</th>
            </tr>
        </thead>
        <tbody>
            ${rackData.components
              .sort((a, b) => (b.position || 0) - (a.position || 0))
              .map(c => `
                <tr>
                    <td class="position">${c.position}U</td>
                    <td>${c.name || 'Unnamed'}</td>
                    <td>${c.type}</td>
                    <td>${c.model || 'N/A'}</td>
                    <td>${c.rackUnits}U</td>
                    <td>${c.powerConsumption || 0}W</td>
                    <td>${c.weight || 0}kg</td>
                    <td>
                        ${c.serialNumber ? `Serial: ${c.serialNumber}<br>` : ''}
                        ${c.ports ? `Ports: ${c.ports}<br>` : ''}
                        ${c.outlets ? `Outlets: ${c.outlets}<br>` : ''}
                        ${c.ipAddress ? `IP: ${c.ipAddress}<br>` : ''}
                        ${c.cooling ? `Cooling: ${c.cooling} BTU/hr` : ''}
                    </td>
                </tr>
              `).join('')}
        </tbody>
    </table>
</body>
</html>`;

    // Create a new window to print/save as PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Trigger print dialog which allows saving as PDF
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }

  const exportAsExcel = () => {
    if (!selectedRack) return;
    
    const rackData = {
      name: selectedRack.name,
      height: selectedRack.height,
      components: selectedRack.components.filter(c => c.position !== undefined),
      totalPower: selectedRack.components
        .filter(c => c.position !== undefined && c.powerConsumption !== undefined)
        .reduce((sum, c) => sum + (c.powerConsumption || 0), 0),
      totalWeight: selectedRack.components
        .filter(c => c.position !== undefined && c.weight !== undefined)
        .reduce((sum, c) => sum + (c.weight || 0), 0),
      usedSpace: selectedRack.components
        .filter(c => c.position !== undefined)
        .reduce((sum, c) => sum + (c.rackUnits || 1), 0)
    };

    // Create Excel-compatible HTML format
    const excelContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="ProgId" content="Excel.Sheet">
    <meta name="Generator" content="Rack Planner">
    <style>
        .header { font-size: 18px; font-weight: bold; text-align: center; }
        .summary { font-weight: bold; background-color: #f0f0f0; }
        table { border-collapse: collapse; }
        td, th { border: 1px solid black; padding: 5px; }
        th { background-color: #d0d0d0; font-weight: bold; }
        .number { mso-number-format: "0"; }
    </style>
</head>
<body>
    <table>
        <tr><td colspan="8" class="header">Rack Planner Report - ${rackData.name}</td></tr>
        <tr><td colspan="8">Generated: ${new Date().toLocaleString()}</td></tr>
        <tr><td colspan="8"></td></tr>
        
        <tr class="summary"><td colspan="2">Rack Summary</td><td colspan="6"></td></tr>
        <tr><td>Height:</td><td>${rackData.height}U</td><td colspan="6"></td></tr>
        <tr><td>Components:</td><td>${rackData.components.length}</td><td colspan="6"></td></tr>
        <tr><td>Space Used:</td><td>${rackData.usedSpace}U / ${rackData.height}U</td><td colspan="6"></td></tr>
        <tr><td>Utilization:</td><td>${Math.round((rackData.usedSpace / rackData.height) * 100)}%</td><td colspan="6"></td></tr>
        <tr><td>Total Power:</td><td class="number">${rackData.totalPower}</td><td>W</td><td colspan="5"></td></tr>
        <tr><td>Total Weight:</td><td class="number">${rackData.totalWeight}</td><td>kg</td><td colspan="5"></td></tr>
        <tr><td colspan="8"></td></tr>
        
        <tr>
            <th>Position</th>
            <th>Component Name</th>
            <th>Type</th>
            <th>Model</th>
            <th>Size (U)</th>
            <th>Power (W)</th>
            <th>Weight (kg)</th>
            <th>Additional Info</th>
        </tr>
        ${rackData.components
          .sort((a, b) => (b.position || 0) - (a.position || 0))
          .map(c => `
            <tr>
                <td class="number">${c.position}</td>
                <td>${c.name || 'Unnamed'}</td>
                <td>${c.type}</td>
                <td>${c.model || 'N/A'}</td>
                <td class="number">${c.rackUnits}</td>
                <td class="number">${c.powerConsumption || 0}</td>
                <td class="number">${c.weight || 0}</td>
                <td>
                    ${c.serialNumber ? `Serial: ${c.serialNumber}; ` : ''}
                    ${c.ports ? `Ports: ${c.ports}; ` : ''}
                    ${c.outlets ? `Outlets: ${c.outlets}; ` : ''}
                    ${c.ipAddress ? `IP: ${c.ipAddress}; ` : ''}
                    ${c.cooling ? `Cooling: ${c.cooling} BTU/hr` : ''}
                </td>
            </tr>
          `).join('')}
    </table>
</body>
</html>`;

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedRack.name.replace(/\s+/g, '_')}_rack_report.xls`;
    link.click();
  }

  const exportAsPNG = async () => {
    if (!selectedRack) return;
    
    try {
      // Find the rack visualization element
      const rackElement = document.querySelector('.rack-container');
      if (!rackElement) {
        alert('Please switch to Rack View tab to export as PNG');
        return;
      }

      // Create a canvas to draw the rack diagram
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions
      const width = 400;
      const rackHeight = selectedRack.height * 25 + 40; // Increased spacing for better visibility
      canvas.width = width;
      canvas.height = rackHeight;

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, rackHeight);

      // Draw rack frame
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 30, width - 20, rackHeight - 40);

      // Draw rack title
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${selectedRack.name} - ${selectedRack.height}U`, width / 2, 20);

      // Draw U markers and grid lines
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;

      for (let i = 1; i <= selectedRack.height; i++) {
        const y = 30 + (selectedRack.height - i) * 25 + 12.5;
        
        // U marker
        ctx.fillStyle = '#666666';
        ctx.fillText(i.toString(), 15, y + 4);
        
        // Grid line
        ctx.beginPath();
        ctx.moveTo(40, y + 12.5);
        ctx.lineTo(width - 15, y + 12.5);
        ctx.stroke();
      }

      // Draw rack rails
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(45, 35);
      ctx.lineTo(45, rackHeight - 10);
      ctx.moveTo(width - 20, 35);
      ctx.lineTo(width - 20, rackHeight - 10);
      ctx.stroke();

      // Draw components
      const placedComponents = selectedRack.components.filter(c => c.position !== undefined);
      
      placedComponents.forEach(component => {
        if (!component.position) return;
        
        const compY = 30 + (selectedRack.height - component.position - component.rackUnits + 1) * 25;
        const compHeight = component.rackUnits * 25 - 2;
        
        // Component background
        const colors = {
          'switch': '#22c55e', 'patch-panel': '#eab308', 'server': '#ef4444',
          'ups': '#a855f7', 'storage': '#3b82f6', 'router': '#f97316',
          'pdu': '#6b7280', 'kvm': '#14b8a6', 'fiber-panel': '#6366f1',
          'cooling': '#06b6d4', 'blank-panel': '#64748b', 'firewall': '#f43f5e',
          'load-balancer': '#10b981', 'wireless-controller': '#8b5cf6', 'console-server': '#f59e0b'
        };
        
        ctx.fillStyle = colors[component.type as keyof typeof colors] || '#9ca3af';
        ctx.fillRect(50, compY, width - 75, compHeight);
        
        // Component border
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.strokeRect(50, compY, width - 75, compHeight);
        
        // Component text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        
        const iconMap = {
          'switch': '📶', 'patch-panel': '🔌', 'server': '🖥️', 'ups': '🔋',
          'storage': '💾', 'router': '🌐', 'pdu': '⚡', 'kvm': '🖱️',
          'fiber-panel': '📡', 'cooling': '❄️', 'blank-panel': '⬜', 'firewall': '🛡️',
          'load-balancer': '⚖️', 'wireless-controller': '📶', 'console-server': '💻'
        };
        
        const icon = iconMap[component.type as keyof typeof iconMap] || '';
        const text = `${icon} ${component.name || component.type}`;
        
        // Truncate text if too long
        const maxWidth = width - 85;
        let displayText = text;
        const textWidth = ctx.measureText(text).width;
        
        if (textWidth > maxWidth) {
          displayText = text.substring(0, Math.floor(text.length * maxWidth / textWidth) - 3) + '...';
        }
        
        ctx.fillText(displayText, 55, compY + compHeight / 2 + 4);
        
        // Component size indicator
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`${component.rackUnits}U`, width - 25, compY + compHeight / 2 + 3);
      });

      // Add statistics box
      const statsY = rackHeight - 120;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(10, statsY, 180, 110);
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, statsY, 180, 110);

      ctx.fillStyle = '#333333';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Rack Statistics:', 15, statsY + 15);

      ctx.font = '11px Arial';
      const totalPower = selectedRack.components
        .filter(c => c.position !== undefined)
        .reduce((sum, c) => sum + (c.powerConsumption || 0), 0);
      const totalWeight = selectedRack.components
        .filter(c => c.position !== undefined)
        .reduce((sum, c) => sum + (c.weight || 0), 0);
      const usedSpace = selectedRack.components
        .filter(c => c.position !== undefined)
        .reduce((sum, c) => sum + (c.rackUnits || 1), 0);

      ctx.fillText(`Power: ${totalPower}W`, 15, statsY + 35);
      ctx.fillText(`Weight: ${totalWeight}kg`, 15, statsY + 50);
      ctx.fillText(`Space: ${usedSpace}U / ${selectedRack.height}U`, 15, statsY + 65);
      ctx.fillText(`Utilization: ${Math.round((usedSpace / selectedRack.height) * 100)}%`, 15, statsY + 80);
      ctx.fillText(`Components: ${placedComponents.length}`, 15, statsY + 95);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${selectedRack.name.replace(/\s+/g, '_')}_rack_diagram.png`;
          link.click();
        }
      }, 'image/png');

    } catch (error) {
      console.error('Error exporting PNG:', error);
      alert('Error generating PNG. Please try again.');
    }
  }

  const exportAsCSV = () => {
    if (!selectedRack) return;
    
    const csvHeaders = 'Position,Name,Type,Model,Size(U),Power(W),Weight(kg),Serial,Ports,Outlets,IP Address,Cooling(BTU)';
    const csvData = selectedRack.components
      .filter(c => c.position !== undefined)
      .sort((a, b) => (b.position || 0) - (a.position || 0))
      .map(c => [
        c.position || '',
        c.name || '',
        c.type || '',
        c.model || '',
        c.rackUnits || '',
        c.powerConsumption || '',
        c.weight || '',
        c.serialNumber || '',
        c.ports || '',
        c.outlets || '',
        c.ipAddress || '',
        c.cooling || ''
      ].join(','))
      .join('\n');

    const csvContent = csvHeaders + '\n' + csvData;
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${selectedRack.name.replace(/\s+/g, '_')}_inventory.csv`
    link.click()
  }

  const loadRackTemplate = (template: RackTemplate) => {
    const newRack: Rack = {
      id: `rack-${Date.now()}`,
      name: template.rack.name,
      height: template.rack.height,
      components: template.rack.components.map(comp => ({
        ...comp,
        id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    }
    setRacks([...racks, newRack])
    setSelectedRackId(newRack.id)
    setShowTemplates(false)
  }

  const addComponentFromTemplate = (template: ComponentTemplate) => {
    if (!selectedRackId) return;
    
    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === selectedRackId
          ? {
              ...rack,
              components: [
                ...rack.components,
                {
                  ...template.component,
                  id: `component-${Date.now()}`,
                },
              ],
            }
          : rack
      )
    )
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const text = await file.text()
      try {
        const result = await parseStringPromise(text)

        if (result && result.RackPlanner && result.RackPlanner.Rack) {
          const importedRacks: Rack[] = result.RackPlanner.Rack.map((rack: { 
            $: { 
              id: string; 
              name: string;
              height?: string;
            }; 
            Component?: Array<{ 
              $: { 
                id: string; 
                type: string; 
                name: string; 
                model?: string; 
                serialNumber?: string; 
                ports?: string;
                rackUnits?: string;
                position?: string;
                powerConsumption?: string;
                weight?: string;
                outlets?: string;
                ipAddress?: string;
                managementPort?: string;
                cooling?: string;
              } 
            }> 
          }) => ({
            id: rack.$.id,
            name: rack.$.name,
            height: rack.$.height ? parseInt(rack.$.height) : 42,
            components: rack.Component
              ? rack.Component.map((component) => ({
                  id: component.$.id,
                  type: component.$.type as RackComponent['type'],
                  name: component.$.name,
                  model: component.$.model,
                  serialNumber: component.$.serialNumber,
                  ports: component.$.ports ? parseInt(component.$.ports) : undefined,
                  rackUnits: component.$.rackUnits ? parseInt(component.$.rackUnits) : 1,
                  position: component.$.position ? parseInt(component.$.position) : undefined,
                  powerConsumption: component.$.powerConsumption ? parseInt(component.$.powerConsumption) : undefined,
                  weight: component.$.weight ? parseInt(component.$.weight) : undefined,
                  outlets: component.$.outlets ? parseInt(component.$.outlets) : undefined,
                  ipAddress: component.$.ipAddress,
                  managementPort: component.$.managementPort,
                  cooling: component.$.cooling ? parseInt(component.$.cooling) : undefined,
                }))
              : [],
          }))
          setRacks(importedRacks)
          if (importedRacks.length > 0) {
            setSelectedRackId(importedRacks[0].id)
          }
        }
      } catch (error) {
        console.error("Error parsing XML:", error)
        alert("Error parsing the uploaded file. Please check if it's a valid rack planner XML file.")
      }
    }
  }

  const selectedRack = racks.find((rack) => rack.id === selectedRackId)

  return (
    <LightThemeLayout>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen bg-gray-50" style={{ paddingTop: '5.5rem' }}>
          <header className="py-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-3xl font-bold mb-2">Rack Planner</h1>
              <p className="text-sm text-blue-100">
                Design and customize server and network racks. Save and import your projects easily.
              </p>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="flex gap-8 flex-col md:flex-row">
              {/* Sidebar */}
              <aside className="w-full md:w-1/4 bg-white p-6 rounded-lg border border-gray-300 shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                  <span className="mr-2">🔧</span> Configuration
                </h2>
                <button
                  onClick={addRack}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center"
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Rack
                </button>
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-sm text-gray-600 font-medium">Quick Start</label>
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded cursor-pointer transition-colors flex items-center justify-center"
                  >
                    <Package size={16} className="mr-2" />
                    Load Template
                  </button>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-sm text-gray-600 font-medium">Import Project</label>
                  <label className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded cursor-pointer transition-colors flex items-center justify-center">
                    <Upload size={16} className="mr-2" />
                    Choose File
                    <input
                      type="file"
                      accept=".xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mb-6 border-gray-200 border-b pb-4">
                  <h3 className="text-md font-semibold mb-2 text-gray-700">Racks</h3>
                  {racks.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No racks created yet</p>
                  ) : (
                    <ul className="space-y-2">
                      {racks.map((rack) => (
                        <li
                          key={rack.id}
                          className={`p-2 rounded flex justify-between items-center ${
                            selectedRackId === rack.id 
                              ? 'bg-blue-50 border border-blue-200' 
                              : 'hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          {isEditingRack === rack.id ? (
                            <div className="flex flex-col space-y-2 w-full">
                              <input
                                type="text"
                                value={editRackName}
                                onChange={(e) => setEditRackName(e.target.value)}
                                className="border border-gray-300 rounded px-2 py-1 text-sm"
                                placeholder="Rack name"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={editRackHeight}
                                  onChange={(e) => setEditRackHeight(parseInt(e.target.value) || 42)}
                                  min="1"
                                  max="52"
                                  className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                                />
                                <span className="text-sm text-gray-600 my-auto">U</span>
                                <button
                                  onClick={saveRackEdit}
                                  className="bg-blue-500 text-white rounded p-1 ml-auto"
                                >
                                  <Save size={14} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button 
                                className="text-left flex-grow cursor-pointer"
                                onClick={() => setSelectedRackId(rack.id)}
                              >
                                {rack.name} ({rack.height}U)
                              </button>
                              <div className="flex space-x-1">
                                <button 
                                  onClick={() => startEditingRack(rack)}
                                  className="text-blue-500 hover:text-blue-700"
                                  title="Edit rack"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => deleteRack(rack.id)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Delete rack"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="space-y-2">
                  <button
                    onClick={saveProject}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                    disabled={racks.length === 0}
                  >
                    <Save size={16} className="mr-2" />
                    Save Project
                  </button>
                  <div className="text-sm text-gray-600 font-medium mt-4 mb-2">Export Options</div>
                  <button
                    onClick={exportAsPDF}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                    disabled={!selectedRack}
                  >
                    <FileText size={16} className="mr-2" />
                    Export PDF
                  </button>
                  <button
                    onClick={exportAsExcel}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                    disabled={!selectedRack}
                  >
                    <Grid size={16} className="mr-2" />
                    Export Excel
                  </button>
                  <button
                    onClick={exportAsPNG}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors flex items-center justify-center"
                    disabled={!selectedRack}
                  >
                    <Image size={16} className="mr-2" aria-label="PNG export icon" />
                    Export PNG
                  </button>
                  <button
                    onClick={exportAsCSV}
                    className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors flex items-center justify-center"
                    disabled={!selectedRack}
                  >
                    <Download size={16} className="mr-2" />
                    Export CSV
                  </button>
                </div>
              </aside>

              {/* Main Content */}
              <section className="w-full md:w-3/4 bg-white p-6 rounded-lg border border-gray-300 shadow-lg">
                {selectedRack ? (
                  <>
                    <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedRack.name}
                        <span className="text-sm text-gray-500 ml-2">({selectedRack.height}U)</span>
                      </h2>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setActiveTab('components')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'components' 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          Components
                        </button>
                        <button 
                          onClick={() => setActiveTab('visualization')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'visualization' 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          Rack View
                        </button>
                        <button 
                          onClick={() => setActiveTab('templates')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            activeTab === 'templates' 
                              ? 'bg-blue-600 text-white shadow-md' 
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                        >
                          Templates
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 flex-col lg:flex-row">
                      {/* Component controls and list */}
                      <div className={`${activeTab === 'visualization' ? 'w-full lg:w-1/3' : activeTab === 'templates' ? 'w-full' : 'w-full'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'switch')}
                            className="bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">📶</span> Switch
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'patch-panel')}
                            className="bg-yellow-500 text-white px-2 py-2 rounded hover:bg-yellow-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">🔌</span> Patch Panel
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'server')}
                            className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">🖥️</span> Server
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'ups')}
                            className="bg-purple-500 text-white px-2 py-2 rounded hover:bg-purple-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">🔋</span> UPS
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'storage')}
                            className="bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">💾</span> Storage
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'router')}
                            className="bg-orange-500 text-white px-2 py-2 rounded hover:bg-orange-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">🌐</span> Router
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'pdu')}
                            className="bg-gray-800 text-white px-2 py-2 rounded hover:bg-black transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">⚡</span> PDU
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'kvm')}
                            className="bg-teal-500 text-white px-2 py-2 rounded hover:bg-teal-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">🖱️</span> KVM
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'fiber-panel')}
                            className="bg-indigo-500 text-white px-2 py-2 rounded hover:bg-indigo-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">📡</span> Fiber Panel
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'cooling')}
                            className="bg-cyan-500 text-white px-2 py-2 rounded hover:bg-cyan-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">❄️</span> Cooling
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'blank-panel')}
                            className="bg-slate-500 text-white px-2 py-2 rounded hover:bg-slate-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">⬜</span> Blank Panel
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'firewall')}
                            className="bg-rose-500 text-white px-2 py-2 rounded hover:bg-rose-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">🛡️</span> Firewall
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'load-balancer')}
                            className="bg-emerald-500 text-white px-2 py-2 rounded hover:bg-emerald-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">⚖️</span> Load Balancer
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'wireless-controller')}
                            className="bg-violet-500 text-white px-2 py-2 rounded hover:bg-violet-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">📶</span> WiFi Controller
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'console-server')}
                            className="bg-amber-500 text-white px-2 py-2 rounded hover:bg-amber-600 transition-colors flex items-center justify-center text-sm"
                          >
                            <span className="mr-1">💻</span> Console Server
                          </button>
                        </div>
                        
                        {activeTab === 'templates' && (
                          <div className="mt-6 space-y-6">
                            <div>
                              <h3 className="font-semibold mb-3">Component Templates</h3>
                              <div className="grid grid-cols-1 gap-3">
                                {componentTemplates.map((template) => (
                                  <div key={template.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <h4 className="font-medium text-sm">{template.name}</h4>
                                        <p className="text-xs text-gray-500">{template.category}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                          {template.component.model} • {template.component.rackUnits}U • {template.component.powerConsumption}W
                                        </p>
                                      </div>
                                      <button
                                        onClick={() => addComponentFromTemplate(template)}
                                        className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded border border-blue-200 hover:bg-blue-50"
                                      >
                                        Add
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {activeTab === 'components' && (
                          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedRack.components
                              .filter(c => c.position === undefined)
                              .length === 0 && (
                                <p className="text-gray-500 italic col-span-2 text-center py-8">
                                  No unplaced components. Add some components using the buttons above.
                                </p>
                              )}
                            {selectedRack.components
                              .filter(c => c.position === undefined)
                              .map((component) => (
                                <DraggableComponent
                                  key={component.id}
                                  component={component}
                                  onUpdate={(id, updatedComponent) =>
                                    updateComponent(selectedRack.id, id, updatedComponent)
                                  }
                                  onDelete={(id) => deleteComponent(selectedRack.id, id)}
                                />
                            ))}
                          </div>
                        )}
                        
                        {activeTab === 'visualization' && (
                          <div className="mt-6 space-y-4 text-gray-700">
                            <h3 className="font-semibold">Available Components</h3>
                            <p className="text-sm">Drag components to the rack to position them</p>
                            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                              {selectedRack.components
                                .filter(c => c.position === undefined)
                                .length === 0 && (
                                  <p className="text-gray-500 italic text-center py-4">
                                    No unplaced components available
                                  </p>
                                )}
                              {selectedRack.components
                                .filter(c => c.position === undefined)
                                .map((component) => (
                                  <DraggableComponent
                                    key={component.id}
                                    component={component}
                                    onUpdate={(id, updatedComponent) =>
                                      updateComponent(selectedRack.id, id, updatedComponent)
                                    }
                                    onDelete={(id) => deleteComponent(selectedRack.id, id)}
                                  />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Rack Visualization */}
                      {activeTab === 'visualization' && (
                        <div className="w-full lg:w-2/3 flex justify-center mt-4 lg:mt-0">
                          <RackVisualizer 
                            rack={selectedRack} 
                            updateComponentPosition={(componentId, position) => 
                              updateComponentPosition(selectedRack.id, componentId, position)
                            }
                            onRemoveComponent={(componentId) => 
                              removeComponentFromRack(selectedRack.id, componentId)
                            }
                          />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-600 mb-4">No rack selected or created yet.</p>
                    <button
                      onClick={addRack}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <PlusCircle size={18} className="mr-2" />
                      Create your first rack
                    </button>
                  </div>
                )}
              </section>
            </div>
          </main>
          
          {/* Template Modal */}
          {showTemplates && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Rack Templates</h2>
                    <button
                      onClick={() => setShowTemplates(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-gray-600 mt-2">Choose a pre-configured rack template to get started quickly</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rackTemplates.map((template) => (
                      <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{template.name}</h3>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              template.category === 'network' ? 'bg-green-100 text-green-800' :
                              template.category === 'server' ? 'bg-blue-100 text-blue-800' :
                              template.category === 'storage' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {template.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Height:</span>
                            <span>{template.rack.height}U</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Components:</span>
                            <span>{template.rack.components.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Total Power:</span>
                            <span>{template.rack.components.reduce((sum, c) => sum + (c.powerConsumption || 0), 0)}W</span>
                          </div>
                        </div>
                        <button
                          onClick={() => loadRackTemplate(template)}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                        >
                          Use Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DndProvider>
    </LightThemeLayout>
  )
}
