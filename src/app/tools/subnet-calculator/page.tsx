'use client'

import { useState } from 'react'
import ThemeAwareLayout from '../../../components/ThemeAwareLayout'
import { useThemeContext } from '../../../components/ThemeProvider'

type SubnetResult = {
  network: string
  broadcast: string
  mask: string
  firstHost: string
  lastHost: string
  hosts: number
  cidr: number
  error: string | null
  binaryMask: string
  wildcardMask: string
}

function calculateSubnet(ip: string, cidr: number) {
  // Validate input
  const ipParts = ip.split('.').map(Number)
  if (
    ipParts.length !== 4 ||
    ipParts.some(n => isNaN(n) || n < 0 || n > 255) ||
    cidr < 0 ||
    cidr > 32
  ) {
    return {
      network: '',
      broadcast: '',
      mask: '',
      firstHost: '',
      lastHost: '',
      hosts: 0,
      cidr: 0,
      error: 'Invalid IP address or CIDR.',
      binaryMask: '',
      wildcardMask: '',
    }
  }

  // Convert IP to integer
  const ipInt =
    (ipParts[0] << 24) |
    (ipParts[1] << 16) |
    (ipParts[2] << 8) |
    ipParts[3]

  const mask = cidr === 0 ? 0 : 0xffffffff << (32 - cidr)
  const network = ipInt & mask
  const broadcast = network | (~mask >>> 0)
  const firstHost = cidr === 32 ? network : network + 1
  const lastHost = cidr === 32 ? network : broadcast - 1
  const hosts =
    cidr === 32
      ? 1
      : cidr === 31
      ? 2
      : Math.max(0, broadcast - network - 1)

  function intToIp(int: number) {
    return [
      (int >>> 24) & 0xff,
      (int >>> 16) & 0xff,
      (int >>> 8) & 0xff,
      int & 0xff,
    ].join('.')
  }

  return {
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    mask: intToIp(mask),
    firstHost: intToIp(firstHost),
    lastHost: intToIp(lastHost),
    hosts,
    cidr,
    error: null,
    binaryMask: mask.toString(2).padStart(32, '0').replace(/(.{8})/g, '$1.').slice(0, -1),
    wildcardMask: intToIp(~mask >>> 0),
  }
}

export default function SubnetCalculator() {
  const { resolvedTheme } = useThemeContext()
  const [ip, setIp] = useState('')
  const [cidr, setCidr] = useState(24)
  const [result, setResult] = useState<SubnetResult | null>(null)

  const handleCalculate = () => {
    setResult(calculateSubnet(ip.trim(), Number(cidr)))
  }

  return (
    <ThemeAwareLayout>
      <main className={`min-h-screen ${
        resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'
      } flex flex-col items-center px-2`} style={{ paddingTop: '5.5rem' }}>
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">IP Subnet Calculator</h1>
        <p className="text-blue-600 text-center mb-2 text-sm">
          Enter an IPv4 address and CIDR (e.g. <b>192.168.1.10/24</b>) to calculate network details.
        </p>
        <div className="bg-blue-100 rounded-lg p-3 mb-4 text-xs text-gray-700 border border-blue-300">
          <b>How it works:</b> This tool calculates the network address, subnet mask, broadcast address, usable host range, and more for any IPv4 subnet.
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><b>Network Address:</b> The first address in the subnet, used to identify the network.</li>
            <li><b>Broadcast Address:</b> The last address, used to send data to all hosts in the subnet.</li>
            <li><b>Usable Hosts:</b> All addresses between the network and broadcast (except /31 and /32).</li>
            <li><b>Subnet Mask:</b> Shows which part of the IP is the network portion.</li>
            <li><b>Wildcard Mask:</b> The inverse of the subnet mask, useful in some firewall rules.</li>
          </ul>
        </div>
        <div className="bg-blue-100 rounded-lg p-3 mb-4 text-xs text-gray-700 border border-blue-300">
          <b>Examples:</b>
          <ul className="list-disc list-inside mt-1">
            <li><span className="text-blue-600">192.168.1.10/24</span> → Network: 192.168.1.0/24, Mask: 255.255.255.0, Hosts: 254</li>
            <li><span className="text-blue-600">10.0.0.1/8</span> → Network: 10.0.0.0/8, Mask: 255.0.0.0, Hosts: 16777214</li>
            <li><span className="text-blue-600">172.16.5.100/30</span> → Network: 172.16.5.100/30, Mask: 255.255.255.252, Hosts: 2</li>
          </ul>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={ip}
            onChange={e => setIp(e.target.value)}
            className="flex-1 bg-gray-200 text-gray-900 rounded-lg px-3 py-2 border border-gray-300"
            placeholder="IP address (e.g. 192.168.1.10)"
            autoComplete="off"
          />
          <span className="text-gray-700 flex items-center">/</span>
          <input
            type="number"
            value={cidr}
            onChange={e => setCidr(Number(e.target.value))}
            min={0}
            max={32}
            className="w-16 bg-gray-200 text-gray-900 rounded-lg px-3 py-2 border border-gray-300"
            placeholder="CIDR"
          />
          <button
            onClick={handleCalculate}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Calculate
          </button>
        </div>
        {result && result.error && (
          <div className="text-red-600 mb-2">{result.error}</div>
        )}
        {result && !result.error && (
          <div className="bg-gray-100 rounded-lg p-4 border border-gray-300 text-gray-900 text-sm space-y-1">
            <div><b>Network Address:</b> {result.network}/{result.cidr}</div>
            <div><b>Subnet Mask:</b> {result.mask} <span className="text-gray-600 ml-2">(Binary: {result.binaryMask})</span></div>
            <div><b>Wildcard Mask:</b> {result.wildcardMask}</div>
            <div><b>Broadcast Address:</b> {result.broadcast}</div>
            <div><b>First Host:</b> {result.firstHost}</div>
            <div><b>Last Host:</b> {result.lastHost}</div>
            <div><b>Usable Hosts:</b> {result.hosts}</div>
          </div>
        )}
        <div className="text-gray-500 text-xs mt-4">
          <p>
            This calculator is for IPv4 only. CIDR /31 and /32 are handled according to <a href="https://datatracker.ietf.org/doc/html/rfc3021" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">RFC 3021</a>.
            <br />
            All calculations are performed locally in your browser.
          </p>
        </div>
      </div>
    </main>
    </ThemeAwareLayout>
  )
}