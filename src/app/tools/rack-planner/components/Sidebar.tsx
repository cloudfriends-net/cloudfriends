'use client'

import React, { useState } from 'react'
import { Rack, RackTemplate } from '../types'
import { rackTemplates } from '../templates'
import { saveProject, loadProject } from '../utils/fileUtils'
import { exportAsPDF, exportAsExcel, exportAsPNG, exportAsCSV } from '../utils/exportUtils'

interface SidebarProps {
  racks: Rack[]
  setRacks: React.Dispatch<React.SetStateAction<Rack[]>>
  selectedRackId: string | null
  setSelectedRackId: React.Dispatch<React.SetStateAction<string | null>>
  showTemplates: boolean
  setShowTemplates: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Sidebar({
  racks,
  setRacks,
  selectedRackId,
  setSelectedRackId,
  showTemplates,
  setShowTemplates,
}: SidebarProps) {
  const [isEditingRack, setIsEditingRack] = useState<string | null>(null)
  const [editRackName, setEditRackName] = useState('')
  const [editRackHeight, setEditRackHeight] = useState(42)

  const selectedRack = racks.find((rack) => rack.id === selectedRackId)

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

  const loadRackTemplate = (template: RackTemplate) => {
    const newRack: Rack = {
      id: `rack-${Date.now()}`,
      name: template.rack.name,
      height: template.rack.height,
      components: template.rack.components.map(comp => ({
        ...comp,
        id: `component-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }))
    }
    setRacks([...racks, newRack])
    setSelectedRackId(newRack.id)
    setShowTemplates(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const importedRacks = await loadProject(file)
        setRacks(importedRacks)
        if (importedRacks.length > 0) {
          setSelectedRackId(importedRacks[0].id)
        }
      } catch (error) {
        console.error("Error parsing XML:", error)
        alert("Error parsing the uploaded file. Please check if it's a valid rack planner XML file.")
      }
    }
  }

  return (
    <aside className="w-full md:w-1/4 bg-white p-6 rounded-lg border border-gray-300 shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
        <span className="mr-2">🔧</span> Configuration
      </h2>
      
      <button
        onClick={addRack}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors mb-4 flex items-center justify-center"
      >
        <span className="mr-2">+</span>
        Add Rack
      </button>
      
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm text-gray-600 font-medium">Quick Start</label>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded cursor-pointer transition-colors flex items-center justify-center"
        >
          <span className="mr-2">📦</span>
          Load Template
        </button>
      </div>
      
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-sm text-gray-600 font-medium">Import Project</label>
        <label className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded cursor-pointer transition-colors flex items-center justify-center">
          <span className="mr-2">📁</span>
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
                        <span>💾</span>
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
                        <span>✏️</span>
                      </button>
                      <button 
                        onClick={() => deleteRack(rack.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete rack"
                      >
                        <span>🗑️</span>
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
          onClick={() => saveProject(racks)}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
          disabled={racks.length === 0}
        >
          <span className="mr-2">💾</span>
          Save Project
        </button>
        
        {selectedRack && (
          <>
            <div className="text-sm text-gray-600 font-medium mt-4 mb-2">Export Options</div>
            <button
              onClick={() => exportAsPDF(selectedRack)}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              📄 Export PDF
            </button>
            <button
              onClick={() => exportAsExcel(selectedRack)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              📊 Export Excel
            </button>
            <button
              onClick={() => exportAsPNG(selectedRack)}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              🖼️ Export PNG
            </button>
            <button
              onClick={() => exportAsCSV(selectedRack)}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors flex items-center justify-center"
            >
              📋 Export CSV
            </button>
          </>
        )}
      </div>

      {/* Template Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Rack Templates</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rackTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => loadRackTemplate(template)}
                >
                  <h4 className="font-semibold text-lg mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="text-xs text-gray-500">
                    <span className="inline-block bg-gray-100 rounded px-2 py-1 mr-2">
                      {template.category}
                    </span>
                    <span>{template.rack.height}U</span>
                    <span className="ml-2">{template.rack.components.length} components</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
