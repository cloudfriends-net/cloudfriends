import { PasswordStrength } from '../utils'

interface Props {
  strength: PasswordStrength
}

export function StrengthIndicator({ strength }: Props) {
  const getBackgroundColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-500'
      case 1: return 'bg-orange-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-green-500'
      case 4: return 'bg-emerald-500'
      default: return 'bg-red-500'
    }
  }

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center">
        <span className="text-sm">Password Strength:</span>
        <span className={`text-sm font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>
      <div className="mt-1 h-2 w-full bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getBackgroundColor(strength.score)} transition-all duration-300`}
          style={{ width: `${(strength.score + 1) * 20}%` }}
        />
      </div>
    </div>
  )
}