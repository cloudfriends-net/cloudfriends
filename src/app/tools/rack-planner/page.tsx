'use client'

import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ThemeAwareLayout from '../../../components/ThemeAwareLayout'
import { Rack, RackComponent } from './types'
import { getDefaultComponentSize } from './constants'
import { componentTemplates } from './templates'
import Sidebar from './components/Sidebar'
import ComponentSection from './components/ComponentSection'
import RackVisualizer from './components/RackVisualizer'
import TemplatesSection from './components/TemplatesSection'
import DraggableComponent from './components/DraggableComponent'

export default function RackPlanner() {
  const [racks, setRacks] = useState<Rack[]>([])
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'components' | 'visualization' | 'templates'>('components')
  const [showTemplates, setShowTemplates] = useState(false)

  const selectedRack = racks.find((rack) => rack.id === selectedRackId)

  const addComponentToRack = (componentType: RackComponent['type']) => {
    if (!selectedRackId) return

    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === selectedRackId
          ? {
              ...rack,
              components: [
                ...rack.components,
                {
                  id: `component-${Date.now()}`,
                  type: componentType,
                  name: '',
                  rackUnits: getDefaultComponentSize(componentType),
                },
              ],
            }
          : rack
      )
    )
  }

  const addComponentFromTemplate = (templateId: string) => {
    if (!selectedRackId) return
    
    const template = componentTemplates.find(t => t.id === templateId)
    if (!template) return
    
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

  const updateComponent = (componentId: string, updatedComponent: Partial<RackComponent>) => {
    if (!selectedRackId) return

    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === selectedRackId
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

  const deleteComponent = (componentId: string) => {
    if (!selectedRackId) return

    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === selectedRackId
          ? {
              ...rack,
              components: rack.components.filter(component => component.id !== componentId),
            }
          : rack
      )
    )
  }

  const updateComponentPosition = (componentId: string, position: number) => {
    if (!selectedRackId) return

    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === selectedRackId
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

  const removeComponentFromRack = (componentId: string) => {
    if (!selectedRackId) return

    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === selectedRackId
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

  return (
    <ThemeAwareLayout>
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
              <Sidebar
                racks={racks}
                setRacks={setRacks}
                selectedRackId={selectedRackId}
                setSelectedRackId={setSelectedRackId}
                showTemplates={showTemplates}
                setShowTemplates={setShowTemplates}
              />

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
                      {activeTab === 'components' && (
                        <div className="w-full">
                          <ComponentSection
                            selectedRack={selectedRack}
                            updateComponent={updateComponent}
                            deleteComponent={deleteComponent}
                            addComponentToRack={addComponentToRack}
                            addComponentFromTemplate={addComponentFromTemplate}
                          />
                        </div>
                      )}

                      {activeTab === 'visualization' && (
                        <>
                          <div className="w-full lg:w-1/3">
                            <h3 className="font-semibold mb-3 text-gray-700">Available Components</h3>
                            <p className="text-sm text-gray-600 mb-4">Drag components to the rack to position them</p>
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
                                    onUpdate={updateComponent}
                                    onDelete={deleteComponent}
                                  />
                              ))}
                            </div>
                          </div>
                          <div className="w-full lg:w-2/3">
                            <RackVisualizer
                              rack={selectedRack}
                              updateComponentPosition={updateComponentPosition}
                              onRemoveComponent={removeComponentFromRack}
                              updateComponent={updateComponent}
                              deleteComponent={deleteComponent}
                            />
                          </div>
                        </>
                      )}

                      {activeTab === 'templates' && (
                        <div className="w-full">
                          <TemplatesSection
                            addComponentFromTemplate={addComponentFromTemplate}
                          />
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-500 mb-4">No rack selected</h3>
                    <p className="text-gray-400 mb-6">Create a new rack or load a template to get started</p>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </DndProvider>
    </ThemeAwareLayout>
  )
}
