'use client'

import { useState, useEffect } from 'react'
import { 
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import LightThemeLayout from '../../components/LightThemeLayout'

interface Service {
  id: string
  name: string
  image: string
  ports: string[]
  environment: { key: string; value: string }[]
  volumes: string[]
  command: string
  restart: 'no' | 'always' | 'on-failure' | 'unless-stopped'
  networks: string[]
  depends_on: string[]
  healthcheck?: {
    test?: string
    interval?: string
    timeout?: string
    retries?: string
  }
}

function generateCompose(services: Service[], networks: string[] = [], volumes: string[] = []) {
  let yaml = 'version: "3.8"\n\nservices:\n'
  
  services.forEach(service => {
    yaml += `  ${service.name}:\n`
    yaml += `    image: ${service.image}\n`
    
    if (service.command.trim()) {
      yaml += `    command: ${service.command}\n`
    }
    
    if (service.restart && service.restart !== 'no') {
      yaml += `    restart: ${service.restart}\n`
    }
    
    if (service.ports.length > 0) {
      yaml += `    ports:\n`
      service.ports.forEach(port => {
        yaml += `      - "${port}"\n`
      })
    }
    
    if (service.environment.length > 0) {
      yaml += `    environment:\n`
      service.environment.forEach(env => {
        yaml += `      - ${env.key}=${env.value}\n`
      })
    }
    
    if (service.volumes.length > 0) {
      yaml += `    volumes:\n`
      service.volumes.forEach(volume => {
        yaml += `      - ${volume}\n`
      })
    }
    
    if (service.depends_on.length > 0) {
      yaml += `    depends_on:\n`
      service.depends_on.forEach(dep => {
        yaml += `      - ${dep}\n`
      })
    }
    
    if (service.networks.length > 0) {
      yaml += `    networks:\n`
      service.networks.forEach(network => {
        yaml += `      - ${network}\n`
      })
    }
    
    if (service.healthcheck?.test) {
      yaml += `    healthcheck:\n`
      yaml += `      test: ${service.healthcheck.test}\n`
      if (service.healthcheck.interval) yaml += `      interval: ${service.healthcheck.interval}\n`
      if (service.healthcheck.timeout) yaml += `      timeout: ${service.healthcheck.timeout}\n`
      if (service.healthcheck.retries) yaml += `      retries: ${service.healthcheck.retries}\n`
    }
    
    yaml += '\n'
  })
  
  if (volumes.length > 0) {
    yaml += 'volumes:\n'
    volumes.forEach(volume => {
      yaml += `  ${volume}:\n`
    })
    yaml += '\n'
  }
  
  if (networks.length > 0) {
    yaml += 'networks:\n'
    networks.forEach(network => {
      yaml += `  ${network}:\n`
    })
  }
  
  return yaml.trim()
}

export default function DockerComposeGenerator() {
  const [services, setServices] = useState<Service[]>([
    { 
      id: '1',
      name: 'web', 
      image: 'nginx:latest', 
      ports: ['80:80'], 
      environment: [], 
      volumes: [], 
      command: '', 
      restart: 'always',
      networks: [],
      depends_on: [],
      healthcheck: {}
    }
  ])
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setOutput(generateCompose(services))
  }, [services])

  const updateService = (idx: number, field: keyof Service, value: any) => {
    setServices(s =>
      s.map((svc, i) => (i === idx ? { ...svc, [field]: value } : svc))
    )
  }

  const updateArrayField = (idx: number, field: 'ports' | 'volumes' | 'networks' | 'depends_on', value: string) => {
    const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean)
    updateService(idx, field, arrayValue)
  }

  const updateEnvironment = (idx: number, value: string) => {
    const envArray = value.split(',').map(item => {
      const [key, ...valueParts] = item.trim().split('=')
      return { key: key || '', value: valueParts.join('=') || '' }
    }).filter(env => env.key)
    updateService(idx, 'environment', envArray)
  }

  const addService = () => {
    setServices([...services, { 
      id: Date.now().toString(),
      name: '', 
      image: '', 
      ports: [], 
      environment: [], 
      volumes: [], 
      command: '', 
      restart: 'no',
      networks: [],
      depends_on: [],
      healthcheck: {}
    }])
  }

  const removeService = (idx: number) => {
    setServices(services.filter((_, i) => i !== idx))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'docker-compose.yml'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <LightThemeLayout>
      <main className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Docker Compose Generator</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create Docker Compose files visually with our modern, user-friendly interface. 
              Perfect for developers who want to quickly set up multi-container applications.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Services Configuration</h2>
                <button
                  onClick={addService}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Service
                </button>
              </div>

              <div className="space-y-6">
                {services.map((service, idx) => (
                  <div key={service.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Service {idx + 1}: {service.name || 'Unnamed'}
                      </h3>
                      {services.length > 1 && (
                        <button
                          onClick={() => removeService(idx)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateService(idx, 'name', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., web, db, redis"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Docker Image</label>
                        <input
                          type="text"
                          value={service.image}
                          onChange={(e) => updateService(idx, 'image', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., nginx:latest, postgres:13"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ports</label>
                        <input
                          type="text"
                          value={service.ports.join(', ')}
                          onChange={(e) => updateArrayField(idx, 'ports', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., 80:80, 443:443"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Restart Policy</label>
                        <select
                          value={service.restart}
                          onChange={(e) => updateService(idx, 'restart', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="no">No</option>
                          <option value="always">Always</option>
                          <option value="on-failure">On Failure</option>
                          <option value="unless-stopped">Unless Stopped</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Environment Variables</label>
                        <input
                          type="text"
                          value={service.environment.map(env => `${env.key}=${env.value}`).join(', ')}
                          onChange={(e) => updateEnvironment(idx, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., NODE_ENV=production, DB_HOST=localhost"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Volumes</label>
                        <input
                          type="text"
                          value={service.volumes.join(', ')}
                          onChange={(e) => updateArrayField(idx, 'volumes', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., ./data:/app/data, logs:/var/log"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Command (Optional)</label>
                        <input
                          type="text"
                          value={service.command}
                          onChange={(e) => updateService(idx, 'command', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="e.g., npm start, python app.py"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Output Panel */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Generated docker-compose.yml</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {copied ? <CheckIcon className="w-4 h-4" /> : <DocumentDuplicateIcon className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={downloadFile}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono">
                  <code>{output}</code>
                </pre>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Quick Start Guide:</h3>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Copy or download the generated docker-compose.yml file</li>
                  <li>2. Place it in your project directory</li>
                  <li>3. Run <code className="bg-blue-100 px-1 rounded">docker-compose up</code> to start your services</li>
                  <li>4. Use <code className="bg-blue-100 px-1 rounded">docker-compose down</code> to stop them</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
    </LightThemeLayout>
  )
}
