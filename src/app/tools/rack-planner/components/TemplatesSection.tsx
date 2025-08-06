'use client'

import { componentTemplates } from '../templates'
import { ComponentTemplate } from '../types'

interface TemplatesSectionProps {
  addComponentFromTemplate: (templateId: string) => void
}

export default function TemplatesSection({ addComponentFromTemplate }: TemplatesSectionProps) {
  const groupedTemplates = componentTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, ComponentTemplate[]>)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Component Templates</h3>
        <p className="text-sm text-gray-600">
          Click on any template to add it to your rack with pre-configured settings
        </p>
      </div>

      {Object.entries(groupedTemplates).map(([category, templates]) => (
        <div key={category} className="border rounded-lg p-4">
          <h4 className="text-md font-semibold mb-3 text-gray-700 flex items-center">
            <span className="mr-2">
              {category === 'Network' && '🌐'}
              {category === 'Compute' && '🖥️'}
              {category === 'Storage' && '💾'}
              {category === 'Power' && '🔋'}
            </span>
            {category}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => addComponentFromTemplate(template.id)}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-sm">{template.name}</h5>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {template.component.rackUnits}U
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Model: {template.component.model || 'Generic'}</div>
                  {template.component.powerConsumption && (
                    <div>Power: {template.component.powerConsumption}W</div>
                  )}
                  {template.component.ports && (
                    <div>Ports: {template.component.ports}</div>
                  )}
                  {template.component.weight && (
                    <div>Weight: {template.component.weight}kg</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-center text-sm text-gray-500 italic">
        Templates provide starting configurations that you can customize after adding them to your rack.
      </div>
    </div>
  )
}
