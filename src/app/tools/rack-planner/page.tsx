'use client'

import { useState } from 'react'
import { DndProvider, useDrag } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { parseStringPromise } from 'xml2js'
import LightThemeLayout from '../../components/LightThemeLayout'

interface Rack {
  id: string
  name: string
  components: RackComponent[]
}

interface RackComponent {
  id: string
  type: 'switch' | 'patch-panel' | 'server'
  name: string
  model?: string
  serialNumber?: string
  ports?: number
}

const DraggableComponent = ({
  component,
  onUpdate,
}: {
  component: RackComponent
  onUpdate: (id: string, updatedComponent: Partial<RackComponent>) => void
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`bg-gray-100 p-3 rounded border border-gray-300 flex flex-col gap-2 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <input
        type="text"
        value={component.name}
        onChange={(e) => onUpdate(component.id, { name: e.target.value })}
        placeholder="Name"
        className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
      />
      <input
        type="text"
        value={component.model || ''}
        onChange={(e) => onUpdate(component.id, { model: e.target.value })}
        placeholder="Model"
        className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
      />
      {component.type === 'server' && (
        <input
          type="text"
          value={component.serialNumber || ''}
          onChange={(e) => onUpdate(component.id, { serialNumber: e.target.value })}
          placeholder="Serial Number"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
      )}
      {(component.type === 'switch' || component.type === 'patch-panel') && (
        <input
          type="number"
          value={component.ports || ''}
          onChange={(e) => onUpdate(component.id, { ports: Number(e.target.value) })}
          placeholder="Ports"
          className="bg-white border border-gray-300 rounded px-2 py-1 text-sm"
        />
      )}
      <span className="text-sm text-gray-500">Type: {component.type}</span>
    </div>
  )
}

export default function RackPlanner() {
  const [racks, setRacks] = useState<Rack[]>([])
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null)

  const addRack = () => {
    const newRack: Rack = {
      id: `rack-${Date.now()}`,
      name: `Rack ${racks.length + 1}`,
      components: [],
    }
    setRacks([...racks, newRack])
    setSelectedRackId(newRack.id)
  }

  const addComponentToRack = (rackId: string, componentType: RackComponent['type']) => {
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

  const saveProject = () => {
    const xmlData = `<RackPlanner>${racks
      .map(
        (rack) =>
          `<Rack id="${rack.id}" name="${rack.name}">${rack.components
            .map(
              (component) =>
                `<Component id="${component.id}" type="${component.type}" name="${component.name}" model="${component.model}" serialNumber="${component.serialNumber}" ports="${component.ports}" />`
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

const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0]
  if (file) {
    const text = await file.text()
    const result = await parseStringPromise(text)

    if (result && result.RackPlanner && result.RackPlanner.Rack) {
      const importedRacks: Rack[] = result.RackPlanner.Rack.map((rack: { $: { id: string; name: string }; Component?: Array<{ $: { id: string; type: string; name: string; model?: string; serialNumber?: string; ports?: string } }> }) => ({
        id: rack.$.id,
        name: rack.$.name,
        components: rack.Component
          ? rack.Component.map((component) => ({
              id: component.$.id,
              type: component.$.type,
              name: component.$.name,
              model: component.$.model,
              serialNumber: component.$.serialNumber,
              ports: component.$.ports ? parseInt(component.$.ports) : undefined,
            }))
          : [],
      }))
      setRacks(importedRacks)
    }
  }
}

  const selectedRack = racks.find((rack) => rack.id === selectedRackId)

  return (
    <LightThemeLayout>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen" style={{ paddingTop: '5.5rem' }}>
          <header className="py-8 border-b border-gray-200">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Rack Planner</h1>
              <p className="text-gray-600 text-sm">
                Design and customize server and network racks. Save and import your projects easily.
              </p>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="flex gap-8">
              {/* Sidebar */}
              <aside className="w-1/3 bg-white p-6 rounded-lg border border-gray-300 shadow">
                <h2 className="text-xl font-semibold mb-4">Configuration</h2>
                <button
                  onClick={addRack}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mb-4"
                >
                  Add Rack
                </button>
                <input
                  type="file"
                  accept=".xml"
                  onChange={handleFileUpload}
                  className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded mb-4"
                />
                <ul className="space-y-2">
                  {racks.map((rack) => (
                    <li
                      key={rack.id}
                      className={`p-2 rounded cursor-pointer ${
                        selectedRackId === rack.id ? 'bg-gray-200' : 'hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedRackId(rack.id)}
                    >
                      {rack.name}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={saveProject}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mt-4"
                >
                  Save Project
                </button>
              </aside>

              {/* Main Content */}
              <section className="w-2/3 bg-white p-6 rounded-lg border border-gray-300 shadow">
                {selectedRack ? (
                  <>
                    <h2 className="text-xl font-semibold mb-4">{selectedRack.name}</h2>
                    <div className="space-y-4">
                      <button
                        onClick={() => addComponentToRack(selectedRack.id, 'switch')}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                      >
                        Add Switch
                      </button>
                      <button
                        onClick={() => addComponentToRack(selectedRack.id, 'patch-panel')}
                        className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                      >
                        Add Patch Panel
                      </button>
                      <button
                        onClick={() => addComponentToRack(selectedRack.id, 'server')}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                      >
                        Add Server
                      </button>
                    </div>
                    <div className="mt-6 space-y-4">
                      {selectedRack.components.map((component) => (
                        <DraggableComponent
                          key={component.id}
                          component={component}
                          onUpdate={(id, updatedComponent) =>
                            updateComponent(selectedRack.id, id, updatedComponent)
                          }
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">Select a rack to configure.</p>
                )}
              </section>
            </div>
          </main>
        </div>
      </DndProvider>
    </LightThemeLayout>
  )
}