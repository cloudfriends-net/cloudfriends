'use client'

import { Rack, RackComponent } from '../types'
import DraggableComponent from './DraggableComponent'
import RackPosition from './RackPosition'

interface RackVisualizerProps {
  rack: Rack
  updateComponentPosition: (componentId: string, position: number) => void
  onRemoveComponent: (componentId: string) => void
  updateComponent?: (componentId: string, updatedComponent: Partial<RackComponent>) => void
  deleteComponent?: (componentId: string) => void
}

export default function RackVisualizer({
  rack,
  updateComponentPosition,
  onRemoveComponent,
  updateComponent,
  deleteComponent,
}: RackVisualizerProps) {
  // Create array of positions (1 to rack.height)
  const positions = Array.from({ length: rack.height }, (_, i) => i + 1)
  
  // Calculate rack height in pixels (20px per U + 24px for the header)
  const rackHeightPx = rack.height * 20 + 24
  
  // Calculate rack statistics
  const totalPower = rack.components
    .filter(c => c.position !== undefined && c.powerConsumption !== undefined)
    .reduce((sum, c) => sum + (c.powerConsumption || 0), 0)
    
  const totalWeight = rack.components
    .filter(c => c.position !== undefined && c.weight !== undefined)
    .reduce((sum, c) => sum + (c.weight || 0), 0)
    
  const usedSpace = rack.components
    .filter(c => c.position !== undefined)
    .reduce((sum, c) => sum + (c.rackUnits || 1), 0)
    
  const spacePercentage = Math.round((usedSpace / rack.height) * 100)

  // Render the positioned components
  const placedComponents = rack.components
    .filter(component => component.position !== undefined)
    .map(component => {
      const position = component.position || 1
      const height = component.rackUnits || 1
      
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
            onUpdate={updateComponent ? (id, updates) => updateComponent(id, updates) : () => {}} 
            onDelete={deleteComponent ? (id) => deleteComponent(id) : undefined}
            inRack={true} 
          />
          <button 
            onClick={() => onRemoveComponent(component.id)}
            className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-0.5 shadow-sm"
            title="Remove from rack"
          >
            <span className="text-xs">🗑️</span>
          </button>
        </div>
      )
    })

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
  )
}
