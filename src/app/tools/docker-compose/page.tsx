'use client'

import { useState } from 'react'
import LightThemeLayout from '../../components/LightThemeLayout'

type Service = {
  name: string
  image: string
  ports: string
  environment: string
  volumes: string
  command: string
  restart: string
}

function generateCompose(services: Service[]) {
  let yaml = 'version: "3"\nservices:\n'
  services.forEach(s => {
    yaml += `  ${s.name}:\n`
    yaml += `    image: ${s.image}\n`
    if (s.command.trim()) {
      yaml += `    command: ${s.command}\n`
    }
    if (s.restart.trim()) {
      yaml += `    restart: ${s.restart}\n`
    }
    if (s.ports.trim()) {
      yaml += `    ports:\n`
      s.ports.split(',').map(p => p.trim()).filter(Boolean).forEach(p => {
        yaml += `      - "${p}"\n`
      })
    }
    if (s.environment.trim()) {
      yaml += `    environment:\n`
      s.environment.split(',').map(e => e.trim()).filter(Boolean).forEach(e => {
        yaml += `      - ${e}\n`
      })
    }
    if (s.volumes.trim()) {
      yaml += `    volumes:\n`
      s.volumes.split(',').map(v => v.trim()).filter(Boolean).forEach(v => {
        yaml += `      - ${v}\n`
      })
    }
  })
  return yaml
}

export default function DockerComposeGenerator() {
  const [services, setServices] = useState<Service[]>([
    { name: 'web', image: 'nginx:latest', ports: '80:80', environment: '', volumes: '', command: '', restart: '' }
  ])
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const updateService = (idx: number, field: keyof Service, value: string) => {
    setServices(s =>
      s.map((svc, i) => (i === idx ? { ...svc, [field]: value } : svc))
    )
  }

  const addService = () => {
    setServices([...services, { name: '', image: '', ports: '', environment: '', volumes: '', command: '', restart: '' }])
  }

  const removeService = (idx: number) => {
    setServices(services.filter((_, i) => i !== idx))
  }

  const generate = () => {
    setOutput(generateCompose(services))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <LightThemeLayout>
      <main className="min-h-screen bg-gray-100 flex flex-col items-center px-2 pb-20" style={{ paddingTop: '5.5rem' }}>
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">Docker Compose File Generator</h1>
          <p className="text-blue-600 text-center mb-4 text-sm">
            Add your services below and generate a ready-to-use <code>docker-compose.yml</code> file.
          </p>
          <div className="bg-blue-100 rounded-lg p-3 mb-4 text-xs text-gray-700 border border-blue-300">
            <b>How it works:</b> Fill in the fields for each service. You can specify:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <b>Service name</b>: Unique name for your container (e.g. <code>web</code>).
              </li>
              <li>
                <b>Image</b>: Docker image to use (e.g. <code>nginx:latest</code>).
              </li>
              <li>
                <b>Ports</b>: Comma-separated list (e.g. <code>8080:80,443:443</code>).
              </li>
              <li>
                <b>Environment</b>: Comma-separated variables (e.g. <code>DEBUG=1,API_KEY=xyz</code>).
              </li>
              <li>
                <b>Volumes</b>: Comma-separated mounts (e.g. <code>./data:/data,/var/log:/logs</code>).
              </li>
              <li>
                <b>Command</b>: Override the default command (e.g. <code>npm start</code>).
              </li>
              <li>
                <b>Restart Policy</b>: <code>no</code>, <code>always</code>, <code>on-failure</code>, or{' '}
                <code>unless-stopped</code>.
              </li>
            </ul>
            <div className="mt-2">
              <b>Tips:</b> You can add/remove services as needed. Edit the YAML after generation for advanced features
              (networks, depends_on, etc.).
            </div>
          </div>
          <div className="space-y-6 mb-6">
            {services.map((svc, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 border border-gray-300 space-y-2 shadow">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-gray-700 text-xs mb-1">Service Name</label>
                    <input
                      className="w-full bg-gray-200 text-gray-900 rounded px-2 py-1 border border-gray-300"
                      placeholder="e.g. web"
                      value={svc.name}
                      onChange={e => updateService(idx, 'name', e.target.value)}
                    />
                  </div>
                  <button
                    className="text-xs text-red-500 hover:underline self-end mb-1"
                    onClick={() => removeService(idx)}
                    disabled={services.length === 1}
                  >
                    Remove
                  </button>
                </div>
                <div>
                  <label className="block text-gray-700 text-xs mb-1">Image</label>
                  <input
                    className="w-full bg-gray-200 text-gray-900 rounded px-2 py-1 border border-gray-300"
                    placeholder="e.g. nginx:latest"
                    value={svc.image}
                    onChange={e => updateService(idx, 'image', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-xs mb-1">Ports</label>
                  <input
                    className="w-full bg-gray-200 text-gray-900 rounded px-2 py-1 border border-gray-300"
                    placeholder="Comma separated, e.g. 8080:80,443:443"
                    value={svc.ports}
                    onChange={e => updateService(idx, 'ports', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-xs mb-1">Environment Variables</label>
                  <input
                    className="w-full bg-gray-200 text-gray-900 rounded px-2 py-1 border border-gray-300"
                    placeholder="Comma separated, e.g. FOO=bar,DEBUG=1"
                    value={svc.environment}
                    onChange={e => updateService(idx, 'environment', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-xs mb-1">Volumes</label>
                  <input
                    className="w-full bg-gray-200 text-gray-900 rounded px-2 py-1 border border-gray-300"
                    placeholder="Comma separated, e.g. ./data:/data,/var/log:/logs"
                    value={svc.volumes}
                    onChange={e => updateService(idx, 'volumes', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-xs mb-1">Command</label>
                  <input
                    className="w-full bg-gray-200 text-gray-900 rounded px-2 py-1 border border-gray-300"
                    placeholder="Optional, e.g. npm start"
                    value={svc.command}
                    onChange={e => updateService(idx, 'command', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-xs mb-1">Restart Policy</label>
                  <select
                    className="w-full bg-gray-200 text-gray-900 rounded px-2 py-1 border border-gray-300"
                    value={svc.restart}
                    onChange={e => updateService(idx, 'restart', e.target.value)}
                  >
                    <option value="">Restart Policy (optional)</option>
                    <option value="no">no</option>
                    <option value="always">always</option>
                    <option value="on-failure">on-failure</option>
                    <option value="unless-stopped">unless-stopped</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold mb-4"
            onClick={addService}
          >
            + Add Service
          </button>
          <button
            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold mb-4 ml-2"
            onClick={generate}
          >
            Generate Compose YAML
          </button>
          <textarea
            className="w-full h-48 bg-gray-200 text-gray-900 rounded-lg p-4 border border-gray-300 mb-2"
            value={output}
            readOnly
          />
          <button
            className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
            onClick={copyToClipboard}
            disabled={!output}
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <div className="text-gray-500 text-xs mt-4">
            <p>
              This tool helps you quickly create simple <code>docker-compose.yml</code> files for your projects. Add as
              many services as you need. For advanced features, you can further edit the YAML after generation.
            </p>
            <p className="mt-2">
              <b>Example:</b> To map a volume, use <code>./data:/data</code>. For multiple ports, use{' '}
              <code>8080:80,443:443</code>.
            </p>
          </div>
        </div>
      </main>
    </LightThemeLayout>
  )
}