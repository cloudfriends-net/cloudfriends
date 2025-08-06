import { RackComponent } from './types'

export const componentColors = {
  'switch': 'bg-green-200 border-green-500 text-green-800',
  'patch-panel': 'bg-yellow-200 border-yellow-500 text-yellow-800',
  'server': 'bg-red-200 border-red-500 text-red-800',
  'ups': 'bg-purple-200 border-purple-500 text-purple-800',
  'storage': 'bg-blue-200 border-blue-500 text-blue-800',
  'router': 'bg-orange-200 border-orange-500 text-orange-800',
  'pdu': 'bg-gray-300 border-gray-800 text-gray-900',
  'kvm': 'bg-teal-200 border-teal-500 text-teal-800',
  'fiber-panel': 'bg-indigo-200 border-indigo-500 text-indigo-800',
  'cooling': 'bg-cyan-200 border-cyan-500 text-cyan-800',
  'blank-panel': 'bg-slate-200 border-slate-500 text-slate-800',
  'firewall': 'bg-rose-200 border-rose-500 text-rose-800',
  'load-balancer': 'bg-emerald-200 border-emerald-500 text-emerald-800',
  'wireless-controller': 'bg-violet-200 border-violet-500 text-violet-800',
  'console-server': 'bg-amber-200 border-amber-500 text-amber-800',
} as const

export const componentIcons = {
  'switch': '📶',
  'patch-panel': '🔌',
  'server': '🖥️',
  'ups': '🔋',
  'storage': '💾',
  'router': '🌐',
  'pdu': '⚡',
  'kvm': '🖱️',
  'fiber-panel': '📡',
  'cooling': '❄️',
  'blank-panel': '⬜',
  'firewall': '🛡️',
  'load-balancer': '⚖️',
  'wireless-controller': '📶',
  'console-server': '💻',
} as const

export const getDefaultComponentSize = (type: RackComponent['type']): number => {
  const defaultSizes = {
    'server': 1,
    'switch': 1,
    'patch-panel': 1,
    'ups': 2,
    'storage': 3,
    'router': 1,
    'pdu': 1,
    'kvm': 1,
    'fiber-panel': 1,
    'cooling': 2,
    'blank-panel': 1,
    'firewall': 1,
    'load-balancer': 1,
    'wireless-controller': 1,
    'console-server': 1,
  }
  return defaultSizes[type]
}
