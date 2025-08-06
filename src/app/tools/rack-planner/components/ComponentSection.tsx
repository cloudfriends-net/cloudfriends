'use client'

import { Rack, RackComponent } from '../types'
import { componentTemplates } from '../templates'
import DraggableComponent from './DraggableComponent'

interface ComponentSectionProps {
  selectedRack: Rack
  updateComponent: (componentId: string, updatedComponent: Partial<RackComponent>) => void
  deleteComponent: (componentId: string) => void
  addComponentToRack: (componentType: RackComponent['type']) => void
  addComponentFromTemplate: (templateId: string) => void
}

export default function ComponentSection({
  selectedRack,
  updateComponent,
  deleteComponent,
  addComponentToRack,
  addComponentFromTemplate,
}: ComponentSectionProps) {
  return (
    <div className="space-y-6">
      {/* Component Type Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => addComponentToRack('switch')}
          className="bg-green-500 text-white px-2 py-2 rounded hover:bg-green-600 transition-colors flex items-center justify-center text-sm"
        >
          📶 Switch
        </button>
        <button
          onClick={() => addComponentToRack('patch-panel')}
          className="bg-yellow-500 text-white px-2 py-2 rounded hover:bg-yellow-600 transition-colors flex items-center justify-center text-sm"
        >
          🔌 Patch Panel
        </button>
        <button
          onClick={() => addComponentToRack('server')}
          className="bg-red-500 text-white px-2 py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center text-sm"
        >
          🖥️ Server
        </button>
        <button
          onClick={() => addComponentToRack('ups')}
          className="bg-purple-500 text-white px-2 py-2 rounded hover:bg-purple-600 transition-colors flex items-center justify-center text-sm"
        >
          🔋 UPS
        </button>
        <button
          onClick={() => addComponentToRack('storage')}
          className="bg-blue-500 text-white px-2 py-2 rounded hover:bg-blue-600 transition-colors flex items-center justify-center text-sm"
        >
          💾 Storage
        </button>
        <button
          onClick={() => addComponentToRack('router')}
          className="bg-orange-500 text-white px-2 py-2 rounded hover:bg-orange-600 transition-colors flex items-center justify-center text-sm"
        >
          🌐 Router
        </button>
        <button
          onClick={() => addComponentToRack('pdu')}
          className="bg-gray-600 text-white px-2 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-center text-sm"
        >
          ⚡ PDU
        </button>
        <button
          onClick={() => addComponentToRack('firewall')}
          className="bg-rose-500 text-white px-2 py-2 rounded hover:bg-rose-600 transition-colors flex items-center justify-center text-sm"
        >
          🛡️ Firewall
        </button>
      </div>

      {/* Component Templates */}
      <div className="border-t pt-4">
        <h4 className="text-md font-semibold mb-3 text-gray-700">Quick Add Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {componentTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => addComponentFromTemplate(template.id)}
              className="text-left p-3 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="font-medium text-sm">{template.name}</div>
              <div className="text-xs text-gray-500">{template.category}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Components List */}
      <div className="border-t pt-4">
        <h4 className="text-md font-semibold mb-3 text-gray-700">
          Components ({selectedRack.components.length})
        </h4>
        {selectedRack.components.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No components added yet</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {selectedRack.components.map((component) => (
              <DraggableComponent
                key={component.id}
                component={component}
                onUpdate={(id, updates) => updateComponent(id, updates)}
                onDelete={deleteComponent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
