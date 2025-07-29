'use client'

import { useState } from 'react'
// Removed useRef since it's not used
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { parseStringPromise } from 'xml2js'
import LightThemeLayout from '../../components/LightThemeLayout'

interface Rack {
  id: string
  name: string
  components: RackComponent[]
  height: number // Rack height in U
}

interface RackComponent {
  id: string
  type: 'switch' | 'patch-panel' | 'server' | 'ups' | 'storage' | 'router'
  name: string
  model?: string
  serialNumber?: string
  ports?: number
  rackUnits: number // How many Us the component takes
  position?: number // Position in the rack (1-42)
  powerConsumption?: number // In watts
  weight?: number // In kg
}

const componentColors = {
  'switch': 'bg-green-200 border-green-500',
  'patch-panel': 'bg-yellow-200 border-yellow-500',
  'server': 'bg-red-200 border-red-500',
  'ups': 'bg-purple-200 border-purple-500',
  'storage': 'bg-blue-200 border-blue-500',
  'router': 'bg-orange-200 border-orange-500',
};

const componentIcons = {
  'switch': '📶',
  'patch-panel': '🔌',
  'server': '🖥️',
  'ups': '🔋',
  'storage': '💾',
  'router': '🌐',
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
  const [{ isOver }, drop] = useDrop<
    { id: string; component: RackComponent }, 
    void, 
    { isOver: boolean }
  >(() => ({
    accept: 'COMPONENT',
    drop: (item: { id: string, component: RackComponent }) => {
      // Check if there's enough space for the component
      const componentHeight = item.component.rackUnits || 1;
      if (position + componentHeight - 1 <= rack.height) {
        updateComponentPosition(item.id, position);
      }
      // Do not return anything
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
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
  
  return (
    <div
      key={`pos-${position}`}
      ref={drop as unknown as React.Ref<HTMLDivElement>}
      className={`h-5 border-t border-gray-200 w-full ${isOver ? 'bg-blue-100' : ''}`}
      style={{ gridRow: rack.height - position + 1 }}
    />
  );
};

const DraggableComponent = ({
  component,
  onUpdate,
  inRack = false,
}: {
  component: RackComponent
  onUpdate: (id: string, updatedComponent: Partial<RackComponent>) => void
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
        className={`${componentClass} p-1 border rounded flex items-center relative ${
          isDragging ? 'opacity-50' : ''
        }`}
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
      className={`${componentClass} p-3 rounded border flex flex-col gap-2 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center mb-1">
        <span className="text-xl mr-2">{componentIcons[component.type]}</span>
        <input
          type="text"
          value={component.name}
          onChange={(e) => onUpdate(component.id, { name: e.target.value })}
          placeholder="Name"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm flex-grow"
        />
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
      
      <span className="text-sm text-gray-500">Type: {component.type}</span>
    </div>
  )
}

const RackVisualizer = ({
  rack,
  updateComponentPosition,
}: {
  rack: Rack
  updateComponentPosition: (componentId: string, position: number) => void
}) => {
  // Create array of positions (1 to rack.height)
  const positions = Array.from({ length: rack.height }, (_, i) => i + 1);

  // Render the positioned components
  const placedComponents = rack.components
    .filter(component => component.position !== undefined)
    .map(component => {
      const position = component.position || 1;
      const height = component.rackUnits || 1;
      
      return (
        <div
          key={component.id}
          className="absolute left-8 right-2"
          style={{
            bottom: `${(position - 1) * 20}px`,
            height: `${height * 20}px`,
          }}
        >
          <DraggableComponent 
            component={component} 
            onUpdate={() => {}} 
            inRack={true} 
          />
        </div>
      );
    });

  return (
    <div className="rack-container border-2 border-gray-400 bg-gray-100 h-[840px] w-[300px] relative">
      {/* U markers (1-42) */}
      {[...Array(rack.height)].map((_, i) => (
        <div 
          key={i} 
          className="u-marker text-xs text-gray-500 absolute left-1" 
          style={{ bottom: `${i * 20}px` }}
        >
          {i + 1}U
        </div>
      ))}
      
      {/* Grid for drop targets */}
      <div className="grid grid-cols-1 h-full w-full" style={{ gridTemplateRows: `repeat(${rack.height}, 20px)` }}>
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
  );
};

export default function RackPlanner() {
  const [racks, setRacks] = useState<Rack[]>([])
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'components' | 'visualization'>('components')

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

  const addComponentToRack = (rackId: string, componentType: RackComponent['type']) => {
    // Set default U size based on component type
    const defaultSize = {
      'server': 1,
      'switch': 1,
      'patch-panel': 1,
      'ups': 2,
      'storage': 3,
      'router': 1
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
          <header className="py-8 border-b border-gray-200">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-3xl font-bold mb-2 text-gray-900">Rack Planner</h1>
              <p className="text-sm text-gray-600">
                Design and customize server and network racks. Save and import your projects easily.
              </p>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="flex gap-8">
              {/* Sidebar */}
              <aside className="w-1/4 bg-white p-6 rounded-lg border border-gray-300 shadow">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Configuration</h2>
                <button
                  onClick={addRack}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-4"
                >
                  Add Rack
                </button>
                <div className="flex flex-col gap-2 mb-4">
                  <label className="text-sm text-gray-600">Import Project</label>
                  <input
                    type="file"
                    accept=".xml"
                    onChange={handleFileUpload}
                    className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded"
                  />
                </div>
                <div className="mb-6 border-gray-200 border-b pb-4">
                  <h3 className="text-md font-semibold mb-2 text-gray-700">Racks</h3>
                  <ul className="space-y-2">
                    {racks.map((rack) => (
                      <li
                        key={rack.id}
                        className={`p-2 rounded cursor-pointer ${
                          selectedRackId === rack.id 
                            ? 'bg-gray-200' 
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedRackId(rack.id)}
                      >
                        {rack.name}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={saveProject}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                  >
                    Save Project
                  </button>
                  <button
                    onClick={exportAsImage}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  >
                    Export as PNG
                  </button>
                </div>
              </aside>

              {/* Main Content */}
              <section className="w-3/4 bg-white p-6 rounded-lg border border-gray-300 shadow">
                {selectedRack ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">{selectedRack.name}</h2>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => setActiveTab('components')}
                          className={`px-3 py-1 rounded text-sm ${
                            activeTab === 'components' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          Components
                        </button>
                        <button 
                          onClick={() => setActiveTab('visualization')}
                          className={`px-3 py-1 rounded text-sm ${
                            activeTab === 'visualization' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-800'
                          }`}
                        >
                          Rack View
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-6">
                      {/* Component controls and list */}
                      <div className={`${activeTab === 'visualization' ? 'w-1/3' : 'w-full'}`}>
                        <div className="grid grid-cols-3 gap-2 mb-6">
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'switch')}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                          >
                            Add Switch 📶
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'patch-panel')}
                            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                          >
                            Add Patch Panel 🔌
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'server')}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                          >
                            Add Server 🖥️
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'ups')}
                            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
                          >
                            Add UPS 🔋
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'storage')}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                          >
                            Add Storage 💾
                          </button>
                          <button
                            onClick={() => addComponentToRack(selectedRack.id, 'router')}
                            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                          >
                            Add Router 🌐
                          </button>
                        </div>
                        
                        {activeTab === 'components' && (
                          <div className="mt-6 grid grid-cols-2 gap-4">
                            {selectedRack.components
                              .filter(c => c.position === undefined)
                              .map((component) => (
                                <DraggableComponent
                                  key={component.id}
                                  component={component}
                                  onUpdate={(id, updatedComponent) =>
                                    updateComponent(selectedRack.id, id, updatedComponent)
                                  }
                                />
                            ))}
                          </div>
                        )}
                        
                        {activeTab === 'visualization' && (
                          <div className="mt-6 space-y-4 text-gray-700">
                            <h3 className="font-semibold">Available Components</h3>
                            <p className="text-sm">Drag components to the rack on the right to position them</p>
                            <div className="space-y-2">
                              {selectedRack.components
                                .filter(c => c.position === undefined)
                                .map((component) => (
                                  <DraggableComponent
                                    key={component.id}
                                    component={component}
                                    onUpdate={(id, updatedComponent) =>
                                      updateComponent(selectedRack.id, id, updatedComponent)
                                    }
                                  />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Rack Visualization */}
                      {activeTab === 'visualization' && (
                        <div className="w-2/3 flex justify-center">
                          <RackVisualizer 
                            rack={selectedRack} 
                            updateComponentPosition={(componentId, position) => 
                              updateComponentPosition(selectedRack.id, componentId, position)
                            }
                          />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">Select a rack to configure or create a new one.</p>
                )}
              </section>
            </div>
          </main>
        </div>
      </DndProvider>
    </LightThemeLayout>
  )
}
