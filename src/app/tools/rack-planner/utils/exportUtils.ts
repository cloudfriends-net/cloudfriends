import { Rack } from '../types'

export const exportAsPDF = (rack: Rack) => {
  const rackData = {
    name: rack.name,
    height: rack.height,
    components: rack.components.filter(c => c.position !== undefined),
    totalPower: rack.components
      .filter(c => c.position !== undefined && c.powerConsumption !== undefined)
      .reduce((sum, c) => sum + (c.powerConsumption || 0), 0),
    totalWeight: rack.components
      .filter(c => c.position !== undefined && c.weight !== undefined)
      .reduce((sum, c) => sum + (c.weight || 0), 0),
    usedSpace: rack.components
      .filter(c => c.position !== undefined)
      .reduce((sum, c) => sum + (c.rackUnits || 1), 0)
  }

  // Create HTML content for PDF generation
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Rack Planner Report - ${rackData.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
        .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
        .component-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .component-table th, .component-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .component-table th { background-color: #f5f5f5; }
        .rack-diagram { margin: 20px 0; text-align: center; }
        .position { font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rack Planner Report</h1>
        <h2>${rackData.name}</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Rack Specifications</h3>
            <p><strong>Height:</strong> ${rackData.height}U</p>
            <p><strong>Components:</strong> ${rackData.components.length}</p>
            <p><strong>Space Used:</strong> ${rackData.usedSpace}U / ${rackData.height}U</p>
            <p><strong>Utilization:</strong> ${Math.round((rackData.usedSpace / rackData.height) * 100)}%</p>
        </div>
        <div class="summary-card">
            <h3>Power Analysis</h3>
            <p><strong>Total Power:</strong> ${rackData.totalPower}W</p>
            <p><strong>Avg per U:</strong> ${rackData.usedSpace > 0 ? Math.round(rackData.totalPower / rackData.usedSpace) : 0}W/U</p>
        </div>
        <div class="summary-card">
            <h3>Weight Analysis</h3>
            <p><strong>Total Weight:</strong> ${rackData.totalWeight}kg</p>
            <p><strong>Avg per U:</strong> ${rackData.usedSpace > 0 ? Math.round(rackData.totalWeight / rackData.usedSpace) : 0}kg/U</p>
        </div>
    </div>
    
    <h3>Component Inventory</h3>
    <table class="component-table">
        <thead>
            <tr>
                <th>Position</th>
                <th>Component Name</th>
                <th>Type</th>
                <th>Model</th>
                <th>Size (U)</th>
                <th>Power (W)</th>
                <th>Weight (kg)</th>
                <th>Additional Info</th>
            </tr>
        </thead>
        <tbody>
            ${rackData.components
              .sort((a, b) => (b.position || 0) - (a.position || 0))
              .map(c => `
                <tr>
                    <td class="position">${c.position}U</td>
                    <td>${c.name || 'Unnamed'}</td>
                    <td>${c.type}</td>
                    <td>${c.model || 'N/A'}</td>
                    <td>${c.rackUnits}U</td>
                    <td>${c.powerConsumption || 0}W</td>
                    <td>${c.weight || 0}kg</td>
                    <td>
                        ${c.serialNumber ? `Serial: ${c.serialNumber}<br>` : ''}
                        ${c.ports ? `Ports: ${c.ports}<br>` : ''}
                        ${c.outlets ? `Outlets: ${c.outlets}<br>` : ''}
                        ${c.ipAddress ? `IP: ${c.ipAddress}<br>` : ''}
                        ${c.cooling ? `Cooling: ${c.cooling} BTU/hr` : ''}
                    </td>
                </tr>
              `).join('')}
        </tbody>
    </table>
</body>
</html>`

  // Create a new window to print/save as PDF
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    
    // Trigger print dialog which allows saving as PDF
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }
}

export const exportAsExcel = (rack: Rack) => {
  const rackData = {
    name: rack.name,
    height: rack.height,
    components: rack.components.filter(c => c.position !== undefined),
    totalPower: rack.components
      .filter(c => c.position !== undefined && c.powerConsumption !== undefined)
      .reduce((sum, c) => sum + (c.powerConsumption || 0), 0),
    totalWeight: rack.components
      .filter(c => c.position !== undefined && c.weight !== undefined)
      .reduce((sum, c) => sum + (c.weight || 0), 0),
    usedSpace: rack.components
      .filter(c => c.position !== undefined)
      .reduce((sum, c) => sum + (c.rackUnits || 1), 0)
  }

  // Create Excel-compatible HTML format
  const excelContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="ProgId" content="Excel.Sheet">
    <meta name="Generator" content="Rack Planner">
    <style>
        .header { font-size: 18px; font-weight: bold; text-align: center; }
        .summary { font-weight: bold; background-color: #f0f0f0; }
        table { border-collapse: collapse; }
        td, th { border: 1px solid black; padding: 5px; }
        th { background-color: #d0d0d0; font-weight: bold; }
        .number { mso-number-format: "0"; }
    </style>
</head>
<body>
    <table>
        <tr><td colspan="8" class="header">Rack Planner Report - ${rackData.name}</td></tr>
        <tr><td colspan="8">Generated: ${new Date().toLocaleString()}</td></tr>
        <tr><td colspan="8"></td></tr>
        
        <tr class="summary"><td colspan="2">Rack Summary</td><td colspan="6"></td></tr>
        <tr><td>Height:</td><td>${rackData.height}U</td><td colspan="6"></td></tr>
        <tr><td>Components:</td><td>${rackData.components.length}</td><td colspan="6"></td></tr>
        <tr><td>Space Used:</td><td>${rackData.usedSpace}U / ${rackData.height}U</td><td colspan="6"></td></tr>
        <tr><td>Utilization:</td><td>${Math.round((rackData.usedSpace / rackData.height) * 100)}%</td><td colspan="6"></td></tr>
        <tr><td>Total Power:</td><td class="number">${rackData.totalPower}</td><td>W</td><td colspan="5"></td></tr>
        <tr><td>Total Weight:</td><td class="number">${rackData.totalWeight}</td><td>kg</td><td colspan="5"></td></tr>
        <tr><td colspan="8"></td></tr>
        
        <tr>
            <th>Position</th>
            <th>Component Name</th>
            <th>Type</th>
            <th>Model</th>
            <th>Size (U)</th>
            <th>Power (W)</th>
            <th>Weight (kg)</th>
            <th>Additional Info</th>
        </tr>
        ${rackData.components
          .sort((a, b) => (b.position || 0) - (a.position || 0))
          .map(c => `
            <tr>
                <td class="number">${c.position}</td>
                <td>${c.name || 'Unnamed'}</td>
                <td>${c.type}</td>
                <td>${c.model || 'N/A'}</td>
                <td class="number">${c.rackUnits}</td>
                <td class="number">${c.powerConsumption || 0}</td>
                <td class="number">${c.weight || 0}</td>
                <td>
                    ${c.serialNumber ? `Serial: ${c.serialNumber}; ` : ''}
                    ${c.ports ? `Ports: ${c.ports}; ` : ''}
                    ${c.outlets ? `Outlets: ${c.outlets}; ` : ''}
                    ${c.ipAddress ? `IP: ${c.ipAddress}; ` : ''}
                    ${c.cooling ? `Cooling: ${c.cooling} BTU/hr` : ''}
                </td>
            </tr>
          `).join('')}
    </table>
</body>
</html>`

  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${rack.name.replace(/\s+/g, '_')}_rack_report.xls`
  link.click()
}

export const exportAsCSV = (rack: Rack) => {
  const csvHeaders = 'Position,Name,Type,Model,Size(U),Power(W),Weight(kg),Serial,Ports,Outlets,IP Address,Cooling(BTU)'
  const csvData = rack.components
    .filter(c => c.position !== undefined)
    .sort((a, b) => (b.position || 0) - (a.position || 0))
    .map(c => [
      c.position || '',
      c.name || '',
      c.type || '',
      c.model || '',
      c.rackUnits || '',
      c.powerConsumption || '',
      c.weight || '',
      c.serialNumber || '',
      c.ports || '',
      c.outlets || '',
      c.ipAddress || '',
      c.cooling || ''
    ].join(','))
    .join('\n')

  const csvContent = csvHeaders + '\n' + csvData
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${rack.name.replace(/\s+/g, '_')}_inventory.csv`
  link.click()
}

export const exportAsPNG = async (rack: Rack) => {
  try {
    // Find the rack visualization element
    const rackElement = document.querySelector('.rack-container')
    if (!rackElement) {
      alert('Please switch to Rack View tab to export as PNG')
      return
    }

    // Create a canvas to draw the rack diagram
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    const width = 400
    const rackHeight = rack.height * 25 + 40 // Increased spacing for better visibility
    canvas.width = width
    canvas.height = rackHeight

    // White background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, rackHeight)

    // Draw rack frame
    ctx.strokeStyle = '#666666'
    ctx.lineWidth = 2
    ctx.strokeRect(10, 30, width - 20, rackHeight - 40)

    // Draw rack title
    ctx.fillStyle = '#333333'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${rack.name} - ${rack.height}U`, width / 2, 20)

    // Draw U markers and grid lines
    ctx.font = '12px monospace'
    ctx.textAlign = 'left'
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1

    for (let i = 1; i <= rack.height; i++) {
      const y = 30 + (rack.height - i) * 25 + 12.5
      
      // U marker
      ctx.fillStyle = '#666666'
      ctx.fillText(i.toString(), 15, y + 4)
      
      // Grid line
      ctx.beginPath()
      ctx.moveTo(40, y + 12.5)
      ctx.lineTo(width - 15, y + 12.5)
      ctx.stroke()
    }

    // Draw rack rails
    ctx.strokeStyle = '#999999'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(45, 35)
    ctx.lineTo(45, rackHeight - 10)
    ctx.moveTo(width - 20, 35)
    ctx.lineTo(width - 20, rackHeight - 10)
    ctx.stroke()

    // Draw components
    const placedComponents = rack.components.filter(c => c.position !== undefined)
    
    placedComponents.forEach(component => {
      if (!component.position) return
      
      const compY = 30 + (rack.height - component.position - component.rackUnits + 1) * 25
      const compHeight = component.rackUnits * 25 - 2
      
      // Component background
      const colors = {
        'switch': '#22c55e', 'patch-panel': '#eab308', 'server': '#ef4444',
        'ups': '#a855f7', 'storage': '#3b82f6', 'router': '#f97316',
        'pdu': '#6b7280', 'kvm': '#14b8a6', 'fiber-panel': '#6366f1',
        'cooling': '#06b6d4', 'blank-panel': '#64748b', 'firewall': '#f43f5e',
        'load-balancer': '#10b981', 'wireless-controller': '#8b5cf6', 'console-server': '#f59e0b'
      }
      
      ctx.fillStyle = colors[component.type as keyof typeof colors] || '#9ca3af'
      ctx.fillRect(50, compY, width - 75, compHeight)
      
      // Component border
      ctx.strokeStyle = '#374151'
      ctx.lineWidth = 1
      ctx.strokeRect(50, compY, width - 75, compHeight)
      
      // Component text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 12px Arial'
      ctx.textAlign = 'left'
      
      const iconMap = {
        'switch': '📶', 'patch-panel': '🔌', 'server': '🖥️', 'ups': '🔋',
        'storage': '💾', 'router': '🌐', 'pdu': '⚡', 'kvm': '🖱️',
        'fiber-panel': '📡', 'cooling': '❄️', 'blank-panel': '⬜', 'firewall': '🛡️',
        'load-balancer': '⚖️', 'wireless-controller': '📶', 'console-server': '💻'
      }
      
      const icon = iconMap[component.type as keyof typeof iconMap] || ''
      const text = `${icon} ${component.name || component.type}`
      
      // Truncate text if too long
      const maxWidth = width - 85
      let displayText = text
      const textWidth = ctx.measureText(text).width
      
      if (textWidth > maxWidth) {
        displayText = text.substring(0, Math.floor(text.length * maxWidth / textWidth) - 3) + '...'
      }
      
      ctx.fillText(displayText, 55, compY + compHeight / 2 + 4)
      
      // Component size indicator
      ctx.font = '10px Arial'
      ctx.textAlign = 'right'
      ctx.fillText(`${component.rackUnits}U`, width - 25, compY + compHeight / 2 + 3)
    })

    // Add statistics box
    const statsY = rackHeight - 120
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(10, statsY, 180, 110)
    ctx.strokeStyle = '#cccccc'
    ctx.lineWidth = 1
    ctx.strokeRect(10, statsY, 180, 110)

    ctx.fillStyle = '#333333'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'left'
    ctx.fillText('Rack Statistics:', 15, statsY + 15)

    ctx.font = '11px Arial'
    const totalPower = rack.components
      .filter(c => c.position !== undefined)
      .reduce((sum, c) => sum + (c.powerConsumption || 0), 0)
    const totalWeight = rack.components
      .filter(c => c.position !== undefined)
      .reduce((sum, c) => sum + (c.weight || 0), 0)
    const usedSpace = rack.components
      .filter(c => c.position !== undefined)
      .reduce((sum, c) => sum + (c.rackUnits || 1), 0)

    ctx.fillText(`Power: ${totalPower}W`, 15, statsY + 35)
    ctx.fillText(`Weight: ${totalWeight}kg`, 15, statsY + 50)
    ctx.fillText(`Space: ${usedSpace}U / ${rack.height}U`, 15, statsY + 65)
    ctx.fillText(`Utilization: ${Math.round((usedSpace / rack.height) * 100)}%`, 15, statsY + 80)
    ctx.fillText(`Components: ${placedComponents.length}`, 15, statsY + 95)

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${rack.name.replace(/\s+/g, '_')}_rack_diagram.png`
        link.click()
      }
    }, 'image/png')

  } catch (error) {
    console.error('Error exporting PNG:', error)
    alert('Error generating PNG. Please try again.')
  }
}
