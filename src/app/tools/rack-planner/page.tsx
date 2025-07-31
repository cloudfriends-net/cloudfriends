'use client'

import { useState } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { parseStringPromise } from 'xml2js'
import LightThemeLayout from '../../components/LightThemeLayout'
import { Trash2, Edit2, Save, Download, Upload, PlusCircle } from 'react-feather'

interface Rack {
  id: string
  name: string
  components: RackComponent[]
  height: number // Rack height in U
}

interface RackComponent {
  id: string
  type: 'switch' | 'patch-panel' | 'server' | 'ups' | 'storage' | 'router' | 'pdu'
  name: string
  model?: string
  serialNumber?: string
  ports?: number
  rackUnits: number // How many Us the component takes
  position?: number // Position in the rack (1-42)
  powerConsumption?: number // In watts
  weight?: number // In kg
  outlets?: number // Number of outlets (for PDUs)
}

const componentColors = {
  'switch': 'bg-green-200 border-green-500 text-green-800',
  'patch-panel': 'bg-yellow-200 border-yellow-500 text-yellow-800',
  'server': 'bg-red-200 border-red-500 text-red-800',
  'ups': 'bg-purple-200 border-purple-500 text-purple-800',
  'storage': 'bg-blue-200 border-blue-500 text-blue-800',
  'router': 'bg-orange-200 border-orange-500 text-orange-800',
  'pdu': 'bg-gray-300 border-gray-800 text-gray-900', // Changed from indigo to black/gray
};

const componentIcons = {
  'switch': '📶',
  'patch-panel': '🔌',
  'server': '🖥️',
  'ups': '🔋',
  'storage': '💾',
  'router': '🌐',
  'pdu': '⚡',
};

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
      
      {(component.type === 'switch' || component.type === 'patch-panel' || component.type === 'router') && (
        <input
          type="number"
          value={component.ports || ''}
          onChange={(e) => onUpdate(component.id, { ports: Number(e.target.value) })}
          placeholder="Ports"
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
  const [activeTab, setActiveTab] = useState<'components' | 'visualization'>('components')
  const [isEditingRack, setIsEditingRack] = useState<string | null>(null)
  const [editRackName, setEditRackName] = useState('')
  const [editRackHeight, setEditRackHeight] = useState(42)

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
      'pdu': 1  // Default size for PDU
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
                weight="${component.weight || ''}" />`
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

  const exportAsImage = () => {
    // Implementation would require html-to-image or similar library
    alert('Export as image feature will be implemented soon');
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
                  <button
                    onClick={exportAsImage}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                    disabled={!selectedRack}
                  >
                    <Download size={16} className="mr-2" />
                    Export as PNG
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
                      </div>
                    </div>
                    
                    <div className="flex gap-6 flex-col lg:flex-row">
                      {/* Component controls and list */}
                      <div className={`${activeTab === 'visualization' ? 'w-full lg:w-1/3' : 'w-full'}`}>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'switch')}
                            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors flex items-center justify-center"
                          >
                            <span className="mr-2">📶</span> Switch
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'patch-panel')}
                            className="bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition-colors flex items-center justify-center"
                          >
                            <span className="mr-2">🔌</span> Patch Panel
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'server')}
                            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center"
                          >
                            <span className="mr-2">🖥️</span> Server
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'ups')}
                            className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 transition-colors flex items-center justify-center"
                          >
                            <span className="mr-2">🔋</span> UPS
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'storage')}
                            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center"
                          >
                            <span className="mr-2">💾</span> Storage
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'router')}
                            className="bg-orange-500 text-white px-3 py-2 rounded hover:bg-orange-600 transition-colors flex items-center justify-center"
                          >
                            <span className="mr-2">🌐</span> Router
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'pdu')}
                            className="bg-gray-800 text-white px-3 py-2 rounded hover:bg-black transition-colors flex items-center justify-center"
                          >
                            <span className="mr-2">⚡</span> PDU
                          </button>
                        </div>
                        
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
        </div>
      </DndProvider>
    </LightThemeLayout>
  )
}
