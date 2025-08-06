import { parseStringPromise } from 'xml2js'
import { Rack, RackComponent } from '../types'

export const saveProject = (racks: Rack[]) => {
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

export const loadProject = async (file: File): Promise<Rack[]> => {
  const text = await file.text()
  const result = await parseStringPromise(text)

  if (result && result.RackPlanner && result.RackPlanner.Rack) {
    const importedRacks: Rack[] = result.RackPlanner.Rack.map((rack: { 
      $: { 
        id: string 
        name: string
        height?: string
      } 
      Component?: Array<{ 
        $: { 
          id: string 
          type: string 
          name: string 
          model?: string 
          serialNumber?: string 
          ports?: string
          rackUnits?: string
          position?: string
          powerConsumption?: string
          weight?: string
          outlets?: string
          ipAddress?: string
          managementPort?: string
          cooling?: string
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
    return importedRacks
  }
  
  throw new Error('Invalid XML format')
}
