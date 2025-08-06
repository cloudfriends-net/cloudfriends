'use client'

import { useDrag } from 'react-dnd'
import { Trash2 } from 'react-feather'
import { RackComponent } from '../types'
import { componentColors, componentIcons } from '../constants'

interface DraggableComponentProps {
  component: RackComponent
  onUpdate: (id: string, updatedComponent: Partial<RackComponent>) => void
  onDelete?: (id: string) => void
  inRack?: boolean
}

export default function DraggableComponent({
  component,
  onUpdate,
  onDelete,
  inRack = false,
}: DraggableComponentProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id, component },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const componentClass = componentColors[component.type] || 'bg-gray-100 border-gray-300'

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
