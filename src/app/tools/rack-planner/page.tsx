'use client'

import { useState } from 'react'
import { PlusIcon, ServerIcon } from '@heroicons/react/24/outline'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ArrowsRightLeftIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { parseStringPromise } from 'xml2js' // Install xml2js for XML parsing
import LightThemeLayout from '../../components/LightThemeLayout' // Import the LightThemeLayout component

interface Rack {
  id: string
  name: string
  components: RackComponent[]
}

interface RackComponent {
  id: string
  type: 'switch' | 'patch-panel' | 'server'
  name: string
  ports?: number
}

const DraggableComponent = ({
  component,
  onRename,
}: {
  component: RackComponent
  onRename: (id: string, newName: string) => void
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id: component.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const getIcon = (type: RackComponent['type']) => {
    switch (type) {
      case 'switch':
        return <ArrowsRightLeftIcon className="h-5 w-5 text-green-400" />
      case 'patch-panel':
        return <AdjustmentsHorizontalIcon className="h-5 w-5 text-yellow-400" />
      case 'server':
        return <ServerIcon className="h-5 w-5 text-red-400" />
      default:
        return null
    }
  }

  return (
    <div
      ref={drag as unknown as React.Ref<HTMLDivElement>}
      className={`bg-slate-900 p-3 rounded border border-slate-700 flex items-center gap-3 ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {getIcon(component.type)}
      <input
        type="text"
        value={component.name}
        onChange={(e) => onRename(component.id, e.target.value)}
        className="bg-transparent text-gray-100 w-full"
      />
      <span className="text-sm text-gray-400"> ({component.type})</span>
    </div>
  )
}

export default function RackPlanner() {
  const [racks, setRacks] = useState<Rack[]>([])

  const addRack = () => {
    const newRack: Rack = {
      id: `rack-${Date.now()}`,
      name: `Rack ${racks.length + 1}`,
      components: [],
    }
    setRacks([...racks, newRack])
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
                  name: `${componentType} ${rack.components.length + 1}`,
                },
              ],
            }
          : rack
      )
    )
  }

  const moveComponent = (sourceRackId: string, targetRackId: string, componentId: string) => {
    const sourceRack = racks.find((rack) => rack.id === sourceRackId)
    const targetRack = racks.find((rack) => rack.id === targetRackId)

    if (!sourceRack || !targetRack) return

    const componentToMove = sourceRack.components.find((component) => component.id === componentId)
    if (!componentToMove) return

    setRacks((prevRacks) =>
      prevRacks.map((rack) => {
        if (rack.id === sourceRackId) {
          return {
            ...rack,
            components: rack.components.filter((component) => component.id !== componentId),
          }
        }
        if (rack.id === targetRackId) {
          return {
            ...rack,
            components: [...rack.components, componentToMove],
          }
        }
        return rack
      })
    )
  }

  const renameComponent = (rackId: string, componentId: string, newName: string) => {
    setRacks((prevRacks) =>
      prevRacks.map((rack) =>
        rack.id === rackId
          ? {
              ...rack,
              components: rack.components.map((component) =>
                component.id === componentId ? { ...component, name: newName } : component
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
                `<Component id="${component.id}" type="${component.type}" name="${component.name}" />`
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

  const importProject = async (file: File) => {
    const text = await file.text()
    const result = await parseStringPromise(text)

    if (result && result.RackPlanner && result.RackPlanner.Rack) {
      const importedRacks: Rack[] = result.RackPlanner.Rack.map((rack: any) => ({
        id: rack.$.id,
        name: rack.$.name,
        components: rack.Component
          ? rack.Component.map((component: any) => ({
              id: component.$.id,
              type: component.$.type,
              name: component.$.name,
            }))
          : [],
      }))
      setRacks(importedRacks)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      importProject(file)
    }
  }

  return (
    <LightThemeLayout>
      <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen" style={{ paddingTop: '5.5rem' }}>
          <main className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Configuration Section */}
            <section className="bg-white p-6 rounded-lg border border-gray-300 shadow">
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
              <div className="space-y-4">
                {racks.map((rack) => (
                  <div key={rack.id} className="bg-gray-100 p-4 rounded border border-gray-300 shadow">
                    <h3 className="text-lg font-semibold">{rack.name}</h3>
                    <div className="mt-2 space-y-2">
                      <button
                        onClick={() => addComponentToRack(rack.id, 'switch')}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                      >
                        Add Switch
                      </button>
                      <button
                        onClick={() => addComponentToRack(rack.id, 'patch-panel')}
                        className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                      >
                        Add Patch Panel
                      </button>
                      <button
                        onClick={() => addComponentToRack(rack.id, 'server')}
                        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                      >
                        Add Server
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <button
                  onClick={saveProject}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Save Project
                </button>
              </div>
            </section>

            {/* Preview Section */}
            <section className="bg-white p-6 rounded-lg border border-gray-300 shadow">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <div className="space-y-6">
                {racks.map((rack) => (
                  <div key={rack.id} className="bg-gray-100 p-4 rounded border border-gray-300 shadow">
                    <h3 className="text-lg font-semibold mb-2">{rack.name}</h3>
                    <ul className="space-y-2">
                      {rack.components.map((component) => (
                        <DraggableComponent
                          key={component.id}
                          component={component}
                          onRename={(id, newName) => renameComponent(rack.id, id, newName)}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </DndProvider>
    </LightThemeLayout>
  )
}